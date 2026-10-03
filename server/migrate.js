import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { pool, transaction } from './db.js'

const migrationsDir = fileURLToPath(new URL('./migrations/', import.meta.url))

try {
  await pool.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())')
  const files = (await readdir(migrationsDir)).filter(name => /^\d+_[\w-]+\.sql$/.test(name)).sort()
  for (const name of files) {
    const sql = await readFile(join(migrationsDir, name), 'utf8')
    const applied = await transaction(async client => {
      await client.query('SELECT pg_advisory_xact_lock(460648646)')
      const existing = await client.query('SELECT 1 FROM schema_migrations WHERE name = $1', [name])
      if (existing.rowCount) return false
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name])
      return true
    })
    console.log(`${applied ? 'Applied' : 'Already applied'} ${name}`)
  }
} finally {
  await pool.end()
}
