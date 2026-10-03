import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const scryptOptions = { N: 2 ** 17, r: 8, p: 1, maxmem: 256 * 1024 * 1024 }
export const SESSION_SECONDS = 60 * 60 * 24 * 7

export async function hashPassword(password) {
  const salt = randomBytes(16)
  const hash = await scrypt(password, salt, 64, scryptOptions)
  return `scrypt$131072$8$1$${salt.toString('hex')}$${hash.toString('hex')}`
}

export async function verifyPassword(password, encoded) {
  const [algorithm, n, r, p, saltHex, hashHex] = encoded?.split('$') || []
  if (algorithm !== 'scrypt' || n !== '131072' || r !== '8' || p !== '1' || !/^[a-f0-9]{32}$/.test(saltHex || '') || !/^[a-f0-9]{128}$/.test(hashHex || '')) return false
  const expected = Buffer.from(hashHex, 'hex')
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length, scryptOptions)
  return timingSafeEqual(actual, expected)
}

export function newSession() {
  const token = randomBytes(32).toString('base64url')
  return { token, tokenHash: hashSession(token) }
}

export function hashSession(token) {
  return createHash('sha256').update(token).digest('hex')
}

export function readSessionCookie(header = '') {
  const match = header.match(/(?:^|;\s*)studentos_session=([^;]+)/)
  return match && /^[A-Za-z0-9_-]{43}$/.test(match[1]) ? match[1] : null
}

export function sessionCookie(token, secure = false) {
  return `studentos_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_SECONDS}${secure ? '; Secure' : ''}`
}

export function clearSessionCookie(secure = false) {
  return `studentos_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`
}
