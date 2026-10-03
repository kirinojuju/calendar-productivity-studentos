import { randomBytes } from 'node:crypto'
import { writeFile } from 'node:fs/promises'

const password = randomBytes(32).toString('hex')
const content = `POSTGRES_PASSWORD=${password}\nDATABASE_URL=postgresql://studentos:${password}@127.0.0.1:5433/studentos\nAPI_PORT=3001\nAPI_HOST=127.0.0.1\nAPP_ORIGIN=http://127.0.0.1:5173\n`

try {
  await writeFile(new URL('../.env', import.meta.url), content, { flag: 'wx', mode: 0o600 })
  console.log('Created .env with a new database password.')
} catch (error) {
  if (error.code === 'EEXIST') console.log('.env already exists; it was not changed.')
  else throw error
}
