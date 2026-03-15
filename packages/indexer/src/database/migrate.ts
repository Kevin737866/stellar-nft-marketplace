import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'

export async function migrateDatabase(): Promise<void> {
  const db = await open({
    filename: './indexer.db',
    driver: sqlite3.Database
  })

  await db.exec(`
    CREATE TABLE IF NOT EXISTS nfts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_address TEXT NOT NULL,
      token_id INTEGER NOT NULL,
      owner TEXT NOT NULL,
      metadata_uri TEXT,
      name TEXT,
      description TEXT,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(contract_address, token_id)
    );

    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL,
      nft_contract TEXT NOT NULL,
      token_id INTEGER NOT NULL,
      seller TEXT NOT NULL,
      price INTEGER NOT NULL,
      active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL,
      nft_contract TEXT NOT NULL,
      token_id INTEGER NOT NULL,
      seller TEXT NOT NULL,
      buyer TEXT NOT NULL,
      price INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_address TEXT NOT NULL,
      event_type TEXT NOT NULL,
      transaction_hash TEXT NOT NULL,
      block_number INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      data TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_nfts_contract_token ON nfts(contract_address, token_id);
    CREATE INDEX IF NOT EXISTS idx_nfts_owner ON nfts(owner);
    CREATE INDEX IF NOT EXISTS idx_listings_active ON listings(active);
    CREATE INDEX IF NOT EXISTS idx_listings_nft ON listings(nft_contract, token_id);
    CREATE INDEX IF NOT EXISTS idx_events_contract ON events(contract_address);
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
  `)

  await db.close()
  console.log('Database migration completed')
}

if (require.main === module) {
  migrateDatabase().catch(console.error)
}
