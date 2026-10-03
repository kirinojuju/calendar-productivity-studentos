import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { pool } from '../server/db.js'

const port = 3102
const base = `http://127.0.0.1:${port}`
const server = spawn(process.execPath, ['server/index.js'], { cwd: fileURLToPath(new URL('../', import.meta.url)), env: { ...process.env, API_PORT: String(port) }, stdio: 'ignore' })
const ids = []

async function request(path, method = 'GET', data, cookie) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-StudentOS-Request': '1', Origin: 'http://127.0.0.1:5173', ...(cookie ? { Cookie: cookie } : {}) },
    body: data === undefined ? undefined : JSON.stringify(data),
  })
  return { status: response.status, body: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] }
}

try {
  let ready = false
  let lastStatus = 'no response'
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      lastStatus = (await request('/api/health')).status
      if (lastStatus === 200) { ready = true; break }
    } catch { /* server still starting */ }
    await delay(200)
  }
  assert.equal(ready, true, `API or PostgreSQL did not become ready (last health status: ${lastStatus}). Start Docker and apply migrations first.`)

  const emailA = `test-${randomUUID()}@example.test`
  const emailB = `test-${randomUUID()}@example.test`
  const password = 'test password with 12+ chars'
  const a = await request('/api/auth/register', 'POST', { email: emailA, password })
  assert.equal(a.status, 201)
  ids.push(a.body.user.id)
  const b = await request('/api/auth/register', 'POST', { email: emailB, password })
  assert.equal(b.status, 201)
  ids.push(b.body.user.id)
  const initialA = await request('/api/workspace', 'GET', undefined, a.cookie)
  const initialB = await request('/api/workspace', 'GET', undefined, b.cookie)
  assert.deepEqual(initialA.body.workspace.tasks, [])
  assert.deepEqual(initialB.body.workspace.tasks, [])

  const changed = { ...initialA.body.workspace, tasks: [{ id: randomUUID(), title: 'Private task', status: 'todo' }] }
  assert.equal((await request('/api/workspace', 'PUT', { version: 0, workspace: changed }, a.cookie)).status, 200)
  assert.equal((await request('/api/workspace', 'GET', undefined, b.cookie)).body.workspace.tasks.length, 0)
  assert.equal((await request('/api/workspace', 'PUT', { version: 0, workspace: changed }, a.cookie)).status, 409)
  assert.equal((await request('/api/workspace', 'GET')).status, 401)
  const foreignOrigin = await fetch(`${base}/api/auth/logout`, { method: 'POST', headers: { Origin: 'https://example.com', 'X-StudentOS-Request': '1', Cookie: a.cookie, 'Content-Type': 'application/json' }, body: '{}' })
  assert.equal(foreignOrigin.status, 403)

  await request('/api/auth/logout', 'POST', {}, a.cookie)
  assert.equal((await request('/api/workspace', 'GET', undefined, a.cookie)).status, 401)
  const login = await request('/api/auth/login', 'POST', { email: emailA, password })
  assert.equal(login.status, 200)
  assert.equal((await request('/api/workspace', 'GET', undefined, login.cookie)).body.workspace.tasks[0].title, 'Private task')
  console.log('Integration passed: registration, isolation, version conflict, logout, and persistence.')
} finally {
  server.kill()
  if (ids.length) await pool.query('DELETE FROM users WHERE id = ANY($1::uuid[])', [ids])
  await pool.end()
}
