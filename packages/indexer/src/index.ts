import dotenv from 'dotenv'
import { StellarIndexer } from './indexer'
import { migrateDatabase } from './database/migrate'

dotenv.config()

async function main(): Promise<void> {
  try {
    // Run database migrations
    console.log('Running database migrations...')
    await migrateDatabase()

    // Initialize indexer
    const networkUrl = process.env.STELLAR_NETWORK_URL || 'https://horizon-testnet.stellar.org'
    const nftContractId = process.env.NFT_CONTRACT_ID || ''
    const marketplaceContractId = process.env.MARKETPLACE_CONTRACT_ID || ''

    if (!nftContractId || !marketplaceContractId) {
      throw new Error('NFT_CONTRACT_ID and MARKETPLACE_CONTRACT_ID environment variables are required')
    }

    const indexer = new StellarIndexer(networkUrl, nftContractId, marketplaceContractId)
    
    console.log('Starting indexer...')
    console.log(`Network: ${networkUrl}`)
    console.log(`NFT Contract: ${nftContractId}`)
    console.log(`Marketplace Contract: ${marketplaceContractId}`)

    await indexer.start()

  } catch (error) {
    console.error('Failed to start indexer:', error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down indexer...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\nShutting down indexer...')
  process.exit(0)
})

main().catch(console.error)
