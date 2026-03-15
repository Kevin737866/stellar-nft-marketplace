import { Server, Networks, Transaction, Contract } from '@stellar/stellar-sdk'
import { getDatabase } from './database/connection'

export class StellarIndexer {
  private server: Server
  private nftContractId: string
  private marketplaceContractId: string
  private lastLedger: number = 0

  constructor(
    networkUrl: string,
    nftContractId: string,
    marketplaceContractId: string
  ) {
    this.server = new Server(networkUrl)
    this.nftContractId = nftContractId
    this.marketplaceContractId = marketplaceContractId
  }

  async start(): Promise<void> {
    console.log('Starting Stellar indexer...')
    
    // Get the latest processed ledger
    await this.loadLastLedger()
    
    // Start listening for new transactions
    await this.listenForTransactions()
  }

  private async loadLastLedger(): Promise<void> {
    const db = await getDatabase()
    const result = await db.get(
      'SELECT MAX(block_number) as lastLedger FROM events'
    )
    this.lastLedger = result?.lastLedger || 0
    console.log(`Starting from ledger: ${this.lastLedger}`)
  }

  private async listenForTransactions(): Promise<void> {
    const cursor = this.server.transactions()
      .cursor('now')
      .limit(100)
      .order('desc')

    try {
      const { records } = await cursor.call()
      
      for (const tx of records) {
        if (tx.ledger && tx.ledger > this.lastLedger) {
          await this.processTransaction(tx)
          this.lastLedger = tx.ledger
        }
      }

      // Continue polling
      setTimeout(() => this.listenForTransactions(), 5000)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTimeout(() => this.listenForTransactions(), 10000)
    }
  }

  private async processTransaction(tx: any): Promise<void> {
    try {
      const transaction = Transaction.fromXDR(tx.envelope_xdr, Networks.TESTNET)
      const operations = transaction.operations

      for (const op of operations) {
        if (op.type === 'invokeContractFunction') {
          await this.processContractOperation(op, tx)
        }
      }
    } catch (error) {
      console.error('Error processing transaction:', error)
    }
  }

  private async processContractOperation(op: any, tx: any): Promise<void> {
    const contractId = op.contract?.toString()
    
    if (contractId === this.nftContractId) {
      await this.processNFTOperation(op, tx)
    } else if (contractId === this.marketplaceContractId) {
      await this.processMarketplaceOperation(op, tx)
    }
  }

  private async processNFTOperation(op: any, tx: any): Promise<void> {
    const functionName = op.function?.toString()
    const db = await getDatabase()

    try {
      switch (functionName) {
        case 'mint':
          await this.handleMint(op, tx)
          break
        case 'transfer':
        case 'transfer_from':
          await this.handleTransfer(op, tx)
          break
        case 'approve':
          await this.handleApprove(op, tx)
          break
      }

      // Store event
      await db.run(
        'INSERT INTO events (contract_address, event_type, transaction_hash, block_number, data) VALUES (?, ?, ?, ?, ?)',
        [this.nftContractId, functionName, tx.hash, tx.ledger, JSON.stringify(op)]
      )
    } catch (error) {
      console.error('Error processing NFT operation:', error)
    }
  }

  private async processMarketplaceOperation(op: any, tx: any): Promise<void> {
    const functionName = op.function?.toString()
    const db = await getDatabase()

    try {
      switch (functionName) {
        case 'list':
          await this.handleListing(op, tx)
          break
        case 'buy':
          await this.handleSale(op, tx)
          break
        case 'delist':
          await this.handleDelisting(op, tx)
          break
        case 'update_price':
          await this.handlePriceUpdate(op, tx)
          break
      }

      // Store event
      await db.run(
        'INSERT INTO events (contract_address, event_type, transaction_hash, block_number, data) VALUES (?, ?, ?, ?, ?)',
        [this.marketplaceContractId, functionName, tx.hash, tx.ledger, JSON.stringify(op)]
      )
    } catch (error) {
      console.error('Error processing marketplace operation:', error)
    }
  }

  private async handleMint(op: any, tx: any): Promise<void> {
    const db = await getDatabase()
    const args = op.args || []
    
    // Extract mint parameters (this would need to be adapted based on actual contract structure)
    const to = args[0]?.toString()
    const tokenId = parseInt(args[1]?.toString() || '0')
    const metadataUri = args[2]?.toString()

    await db.run(`
      INSERT OR REPLACE INTO nfts (contract_address, token_id, owner, metadata_uri, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [this.nftContractId, tokenId, to, metadataUri, new Date().toISOString(), new Date().toISOString()])

    console.log(`NFT minted: Token ${tokenId} to ${to}`)
  }

  private async handleTransfer(op: any, tx: any): Promise<void> {
    const db = await getDatabase()
    const args = op.args || []
    
    const from = args[0]?.toString()
    const to = args[1]?.toString()
    const tokenId = parseInt(args[2]?.toString() || '0')

    await db.run(`
      UPDATE nfts 
      SET owner = ?, updated_at = ?
      WHERE contract_address = ? AND token_id = ?
    `, [to, new Date().toISOString(), this.nftContractId, tokenId])

    console.log(`NFT transferred: Token ${tokenId} from ${from} to ${to}`)
  }

  private async handleApprove(op: any, tx: any): Promise<void> {
    // Handle approval logic
    console.log('NFT approved:', op)
  }

  private async handleListing(op: any, tx: any): Promise<void> {
    const db = await getDatabase()
    const args = op.args || []
    
    const nftContract = args[0]?.toString()
    const tokenId = parseInt(args[1]?.toString() || '0')
    const price = parseInt(args[2]?.toString() || '0')
    const seller = tx.source_account

    const listingId = await this.generateListingId()

    await db.run(`
      INSERT INTO listings (listing_id, nft_contract, token_id, seller, price, active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [listingId, nftContract, tokenId, seller, price, true, new Date().toISOString(), new Date().toISOString()])

    console.log(`Listing created: ${listingId} - Token ${tokenId} for ${price} XLM`)
  }

  private async handleSale(op: any, tx: any): Promise<void> {
    const db = await getDatabase()
    const args = op.args || []
    
    const listingId = parseInt(args[0]?.toString() || '0')
    const buyer = tx.source_account

    // Get listing details
    const listing = await db.get(
      'SELECT * FROM listings WHERE listing_id = ? AND active = ?',
      [listingId, true]
    )

    if (listing) {
      // Update listing status
      await db.run(
        'UPDATE listings SET active = ?, updated_at = ? WHERE listing_id = ?',
        [false, new Date().toISOString(), listingId]
      )

      // Record sale
      await db.run(`
        INSERT INTO sales (listing_id, nft_contract, token_id, seller, buyer, price, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [listingId, listing.nft_contract, listing.token_id, listing.seller, buyer, listing.price, new Date().toISOString()])

      console.log(`Sale completed: Listing ${listingId} sold to ${buyer}`)
    }
  }

  private async handleDelisting(op: any, tx: any): Promise<void> {
    const db = await getDatabase()
    const args = op.args || []
    
    const listingId = parseInt(args[0]?.toString() || '0')

    await db.run(
      'UPDATE listings SET active = ?, updated_at = ? WHERE listing_id = ?',
      [false, new Date().toISOString(), listingId]
    )

    console.log(`Listing delisted: ${listingId}`)
  }

  private async handlePriceUpdate(op: any, tx: any): Promise<void> {
    const db = await getDatabase()
    const args = op.args || []
    
    const listingId = parseInt(args[0]?.toString() || '0')
    const newPrice = parseInt(args[1]?.toString() || '0')

    await db.run(
      'UPDATE listings SET price = ?, updated_at = ? WHERE listing_id = ?',
      [newPrice, new Date().toISOString(), listingId]
    )

    console.log(`Price updated: Listing ${listingId} to ${newPrice} XLM`)
  }

  private async generateListingId(): Promise<number> {
    const db = await getDatabase()
    const result = await db.get('SELECT MAX(listing_id) as maxId FROM listings')
    return (result?.maxId || 0) + 1
  }
}
