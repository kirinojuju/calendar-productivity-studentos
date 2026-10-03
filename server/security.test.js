import test from 'node:test'
import assert from 'node:assert/strict'
import { clearSessionCookie, hashPassword, newSession, readSessionCookie, sessionCookie, verifyPassword } from './security.js'
import { validateWorkspace } from './workspace.js'
import { createEmptyWorkspace } from '../src/data/workspace.js'

test('password verification accepts only the right password', async () => {
  const hash = await hashPassword('correct horse battery staple')
  assert.equal(await verifyPassword('correct horse battery staple', hash), true)
  assert.equal(await verifyPassword('wrong password', hash), false)
})

test('session tokens stay out of readable cookie attributes', () => {
  const { token, tokenHash } = newSession()
  assert.equal(tokenHash.length, 64)
  assert.equal(readSessionCookie(`other=x; studentos_session=${token}`), token)
  assert.match(sessionCookie(token, true), /HttpOnly; SameSite=Lax; Max-Age=\d+; Secure/)
  assert.match(clearSessionCookie(true), /Max-Age=0; Secure/)
})

test('workspace validation rejects malformed collections', () => {
  const workspace = createEmptyWorkspace()
  assert.equal(validateWorkspace(workspace), true)
  assert.equal(validateWorkspace({ ...workspace, tasks: [{}] }), false)
  assert.equal(validateWorkspace({ ...workspace, finance: { transactions: 'bad' } }), false)
})
