import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { pool, transaction } from './db.js'
import { clearSessionCookie, hashPassword, hashSession, newSession, readSessionCookie, sessionCookie, SESSION_SECONDS, verifyPassword } from './security.js'
import { validateWorkspace } from './workspace.js'
import { createEmptyWorkspace } from '../src/data/workspace.js'

const port = Number(process.env.API_PORT || 3001)
const host = process.env.API_HOST || '127.0.0.1'
const secureCookies = process.env.NODE_ENV === 'production'
const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const loginAttempts = new Map()
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json', '.woff2': 'font/woff2' }

function json(response, status, data, headers = {}) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers })
  response.end(JSON.stringify(data))
}

async function body(request) {
  if (!request.headers['content-type']?.startsWith('application/json')) throw { status: 415, message: 'JSON is required.' }
  const chunks = []
  let bytes = 0
  for await (const chunk of request) {
    bytes += chunk.length
    if (bytes > 1024 * 1024) throw { status: 413, message: 'Request is too large.' }
    chunks.push(chunk)
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { throw { status: 400, message: 'Invalid JSON.' } }
}

function writeAllowed(request) {
  const origin = request.headers.origin
  if (origin) {
    try {
      const parsed = new URL(origin)
      const sameHost = parsed.host === request.headers.host
      const configuredOrigin = process.env.APP_ORIGIN && parsed.origin === process.env.APP_ORIGIN
      const localVite = process.env.NODE_ENV !== 'production' && ['http://127.0.0.1:5173', 'http://localhost:5173'].includes(parsed.origin)
      if (!sameHost && !configuredOrigin && !localVite) return false
    } catch { return false }
  }
  return request.headers['x-studentos-request'] === '1'
}

async function currentUser(request) {
  const token = readSessionCookie(request.headers.cookie)
  if (!token) return null
  const result = await pool.query(
    'SELECT users.id, users.email FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token_hash = $1 AND sessions.expires_at > now()',
    [hashSession(token)],
  )
  return result.rows[0] || null
}

function authError(response) { json(response, 401, { error: 'Please sign in.' }) }

async function createUserSession(client, userId) {
  const { token, tokenHash } = newSession()
  await client.query('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + ($3 * interval \'1 second\'))', [tokenHash, userId, SESSION_SECONDS])
  return token
}

async function authRoute(request, response, path) {
  const input = await body(request)
  if (!input || typeof input !== 'object' || Array.isArray(input)) return json(response, 400, { error: 'Invalid account details.' })
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
  const password = input.password
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || typeof password !== 'string' || password.length < (path.endsWith('register') ? 12 : 1) || password.length > 256) {
    return json(response, 400, { error: path.endsWith('register') ? 'Enter a valid email and a password of at least 12 characters.' : 'Enter a valid email and password.' })
  }

  if (path.endsWith('register')) {
    try {
      const userId = randomUUID()
      const passwordHash = await hashPassword(password)
      const token = await transaction(async client => {
        await client.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)', [userId, email, passwordHash])
        await client.query('INSERT INTO workspaces (user_id, document) VALUES ($1, $2::jsonb)', [userId, JSON.stringify(createEmptyWorkspace())])
        return createUserSession(client, userId)
      })
      return json(response, 201, { user: { id: userId, email } }, { 'Set-Cookie': sessionCookie(token, secureCookies) })
    } catch (error) {
      if (error.code === '23505') return json(response, 409, { error: 'This email is already registered.' })
      throw error
    }
  }

  const attemptKey = `${request.socket.remoteAddress}:${email}`
  const now = Date.now()
  const attempts = (loginAttempts.get(attemptKey) || []).filter(time => now - time < 15 * 60 * 1000)
  if (attempts.length >= 10) return json(response, 429, { error: 'Too many attempts. Try again in 15 minutes.' })
  const result = await pool.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email])
  const user = result.rows[0]
  const valid = user ? await verifyPassword(password, user.password_hash) : false
  if (!valid) {
    attempts.push(now)
    loginAttempts.set(attemptKey, attempts)
    return json(response, 401, { error: 'Incorrect email or password.' })
  }
  loginAttempts.delete(attemptKey)
  const token = await transaction(client => createUserSession(client, user.id))
  return json(response, 200, { user: { id: user.id, email: user.email } }, { 'Set-Cookie': sessionCookie(token, secureCookies) })
}

async function api(request, response, path) {
  if (request.method === 'GET' && path === '/api/health') {
    await pool.query('SELECT 1')
    return json(response, 200, { ok: true })
  }
  if (!['GET', 'HEAD'].includes(request.method) && !writeAllowed(request)) return json(response, 403, { error: 'Request origin is not allowed.' })
  if (request.method === 'POST' && ['/api/auth/register', '/api/auth/login'].includes(path)) return authRoute(request, response, path)
  if (request.method === 'GET' && path === '/api/session') {
    const user = await currentUser(request)
    return user ? json(response, 200, { user }) : authError(response)
  }
  if (request.method === 'POST' && path === '/api/auth/logout') {
    const token = readSessionCookie(request.headers.cookie)
    if (token) await pool.query('DELETE FROM sessions WHERE token_hash = $1', [hashSession(token)])
    return json(response, 200, { ok: true }, { 'Set-Cookie': clearSessionCookie(secureCookies) })
  }
  const user = await currentUser(request)
  if (!user) return authError(response)
  if (request.method === 'GET' && path === '/api/workspace') {
    const result = await pool.query('SELECT version, document FROM workspaces WHERE user_id = $1', [user.id])
    if (!result.rowCount) return json(response, 404, { error: 'Workspace not found.' })
    return json(response, 200, { version: Number(result.rows[0].version), workspace: result.rows[0].document })
  }
  if (request.method === 'PUT' && path === '/api/workspace') {
    const input = await body(request)
    if (!Number.isSafeInteger(input.version) || input.version < 0 || !validateWorkspace(input.workspace)) return json(response, 400, { error: 'Invalid workspace data.' })
    const result = await pool.query(
      'UPDATE workspaces SET document = $1::jsonb, version = version + 1, updated_at = now() WHERE user_id = $2 AND version = $3 RETURNING version',
      [JSON.stringify(input.workspace), user.id, input.version],
    )
    if (!result.rowCount) return json(response, 409, { error: 'This workspace changed in another tab or device. Reload before saving again.' })
    return json(response, 200, { version: Number(result.rows[0].version) })
  }
  return json(response, 404, { error: 'Not found.' })
}

async function staticFile(request, response, path) {
  if (request.method !== 'GET') return json(response, 405, { error: 'Method not allowed.' })
  const target = resolve(dist, `.${decodeURIComponent(path)}`)
  if (target !== resolve(dist) && !target.startsWith(`${resolve(dist)}${sep}`)) return json(response, 403, { error: 'Forbidden.' })
  const file = extname(target) ? target : join(dist, 'index.html')
  try {
    const content = await readFile(file)
    response.writeHead(200, { 'Content-Type': `${mime[extname(file)] || 'application/octet-stream'}${['.html', '.js', '.css', '.json'].includes(extname(file)) ? '; charset=utf-8' : ''}`, 'X-Content-Type-Options': 'nosniff' })
    response.end(content)
  } catch {
    json(response, 404, { error: 'Build the frontend with npm run build.' })
  }
}

const server = createServer(async (request, response) => {
  try {
    const path = new URL(request.url, `http://${request.headers.host || 'localhost'}`).pathname
    if (path.startsWith('/api/')) await api(request, response, path)
    else await staticFile(request, response, path)
  } catch (error) {
    console.error('Request error:', error)
    if (!response.headersSent) json(response, error.status || 500, { error: error.status ? error.message : 'Server error. Please try again.' })
    else response.end()
  }
})

server.listen(port, host, () => console.log(`StudentOS API listening on http://${host}:${port}`))
