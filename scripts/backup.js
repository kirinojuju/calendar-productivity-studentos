import { spawn } from 'node:child_process'
import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir, stat, unlink } from 'node:fs/promises'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const directory = join(root, 'backups')
await mkdir(directory, { recursive: true })
const filename = `studentos-${new Date().toISOString().replace(/[:.]/g, '-')}.dump`
const output = join(directory, filename)
const child = spawn('docker', ['--config', '.docker-local', 'compose', 'exec', '-T', 'db', 'pg_dump', '-U', 'studentos', '-d', 'studentos', '-Fc'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] })
let errors = ''
child.stderr.on('data', chunk => { errors += chunk.toString(); errors = errors.slice(-2000) })

try {
  const [_, code] = await Promise.all([
    pipeline(child.stdout, createWriteStream(output, { flags: 'wx' })),
    new Promise((resolve, reject) => { child.once('error', reject); child.once('close', resolve) }),
  ])
  if (code !== 0) throw new Error(errors.trim() || `pg_dump exited with code ${code}`)
  const size = (await stat(output)).size
  if (size < 100) throw new Error('Backup file is unexpectedly small.')
  const check = spawn('docker', ['--config', '.docker-local', 'compose', 'exec', '-T', 'db', 'pg_restore', '-l'], { cwd: root, stdio: ['pipe', 'ignore', 'pipe'] })
  let checkError = ''
  check.stderr.on('data', chunk => { checkError += chunk.toString(); checkError = checkError.slice(-2000) })
  const [__, checkCode] = await Promise.all([
    pipeline(createReadStream(output), check.stdin),
    new Promise((resolve, reject) => { check.once('error', reject); check.once('close', resolve) }),
  ])
  if (checkCode !== 0) throw new Error(checkError.trim() || `pg_restore could not read the archive (code ${checkCode})`)
  console.log(`Backup saved and archive checked: ${output} (${size} bytes)`)
} catch (error) {
  await unlink(output).catch(() => {})
  throw error
}
