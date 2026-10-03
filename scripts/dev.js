import { spawn } from 'node:child_process'

const command = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const processes = ['dev:api', 'dev:web'].map(name => spawn(command, ['run', name], { stdio: 'inherit', shell: process.platform === 'win32' }))
let stopping = false

function stop(code = 0) {
  if (stopping) return
  stopping = true
  for (const child of processes) child.kill()
  process.exitCode = code
}

for (const child of processes) child.on('exit', code => stop(code || 0))
process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))
