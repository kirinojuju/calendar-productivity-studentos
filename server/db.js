import pg from 'pg'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required. Configure .env first.')

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 10 })

pool.on('error', error => console.error('PostgreSQL idle connection error:', error))

export async function transaction(work) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await work(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
