import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'

let db: Database | null = null

export async function getDatabase(): Promise<Database> {
  if (!db) {
    db = await open({
      filename: './indexer.db',
      driver: sqlite3.Database
    })
  }
  return db
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close()
    db = null
  }
}
