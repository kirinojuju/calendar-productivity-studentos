import { doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { createEmptyWorkspace, validateWorkspace } from '../data/workspace.js'
import { db } from './firebase.js'

const MAX_PAYLOAD_LENGTH = 750000
const encoder = new TextEncoder()

export class WorkspaceConflictError extends Error {
  constructor() {
    super('This workspace changed in another tab or device. Reload before saving again.')
  }
}

function workspaceRef(uid) {
  return doc(db, 'workspaces', uid)
}

function decodeWorkspace(record, uid) {
  if (record.uid !== uid || !Number.isSafeInteger(record.version) || record.version < 0 || typeof record.payload !== 'string') {
    throw new Error('Your saved workspace has an invalid format.')
  }
  let workspace
  try { workspace = JSON.parse(record.payload) } catch { throw new Error('Your saved workspace could not be read.') }
  if (!validateWorkspace(workspace)) throw new Error('Your saved workspace has an invalid format.')
  return { version: record.version, workspace }
}

export function readWorkspace(uid) {
  const reference = workspaceRef(uid)
  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(reference)
    if (snapshot.exists()) return decodeWorkspace(snapshot.data(), uid)
    const workspace = createEmptyWorkspace()
    transaction.set(reference, { uid, version: 0, payload: JSON.stringify(workspace), updatedAt: serverTimestamp() })
    return { version: 0, workspace }
  })
}

export function saveWorkspace(uid, expectedVersion, workspace) {
  if (!validateWorkspace(workspace)) throw new Error('Invalid workspace data.')
  const payload = JSON.stringify(workspace)
  if (encoder.encode(payload).byteLength > MAX_PAYLOAD_LENGTH) throw new Error('Your workspace is too large to save. Remove some older notes or entries.')
  const reference = workspaceRef(uid)
  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(reference)
    if (!snapshot.exists() || snapshot.data().version !== expectedVersion) throw new WorkspaceConflictError()
    const version = expectedVersion + 1
    transaction.update(reference, { payload, version, updatedAt: serverTimestamp() })
    return version
  })
}
