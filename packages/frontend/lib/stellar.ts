import { 
  SorobanRpc, 
  TransactionBuilder, 
  Networks, 
  BASE_FEE,
  Contract,
  xdr,
  ScInt,
  Address,
  nativeToScVal,
  scValToNative
} from '@stellar/stellar-sdk'
import { WalletConnect } from 'stellar-wallet-connect'

// Contract addresses - these should be deployed to testnet
const NFT_CONTRACT_ADDRESS = 'CBKZUA7KOGTJHOZD5Q4B5RQPY6B6QJ3M5Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2'
const MARKETPLACE_CONTRACT_ADDRESS = 'CBKZUA7KOGTJHOZD5Q4B5RQPY6B6QJ3M5Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2'

const rpcUrl = 'https://soroban-testnet.stellar.org'
const server = new SorobanRpc.Server(rpcUrl)

export interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes: { trait_type: string; value: string }[]
}

export interface MintParams {
  to: string
  tokenId: number
  metadataUri: string
  metadata: NFTMetadata
}

export interface ListingParams {
  tokenId: number
  price: string
}

export interface BuyParams {
  tokenId: number
  price: string
}

class StellarContractService {
  private wallet: WalletConnect | null = null

  setWallet(wallet: WalletConnect) {
    this.wallet = wallet
  }

  async mintNFT(params: MintParams): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not connected')
    }

    try {
      const account = await this.wallet.getAccount()
      const contract = new Contract(NFT_CONTRACT_ADDRESS)
      
      // Build the transaction
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET
      })
        .addOperation(
          contract.call(
            'mint',
            ...this.prepareMintArgs(params)
          )
        )
        .setTimeout(30)
        .build()

      // Sign transaction
      const signedTx = await this.wallet.signTransaction(transaction.toXDR())
      
      // Submit transaction
      const result = await server.sendTransaction(signedTx)
      
      if (result.status === 'PENDING') {
        // Wait for transaction confirmation
        const txResult = await this.waitForTransaction(result.hash)
        return txResult.hash
      } else {
        throw new Error(`Transaction failed: ${result.status}`)
      }
    } catch (error) {
      console.error('Minting error:', error)
      throw error
    }
  }

  async listItem(params: ListingParams): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not connected')
    }

    try {
      const account = await this.wallet.getAccount()
      const contract = new Contract(MARKETPLACE_CONTRACT_ADDRESS)
      
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET
      })
        .addOperation(
          contract.call(
            'list',
            nativeToScVal(params.tokenId, { type: 'u32' }),
            nativeToScVal(params.price, { type: 'i128' })
          )
        )
        .setTimeout(30)
        .build()

      const signedTx = await this.wallet.signTransaction(transaction.toXDR())
      const result = await server.sendTransaction(signedTx)
      
      if (result.status === 'PENDING') {
        const txResult = await this.waitForTransaction(result.hash)
        return txResult.hash
      } else {
        throw new Error(`Transaction failed: ${result.status}`)
      }
    } catch (error) {
      console.error('Listing error:', error)
      throw error
    }
  }

  async buyNFT(params: BuyParams): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not connected')
    }

    try {
      const account = await this.wallet.getAccount()
      const contract = new Contract(MARKETPLACE_CONTRACT_ADDRESS)
      
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET
      })
        .addOperation(
          contract.call(
            'buy',
            nativeToScVal(params.tokenId, { type: 'u32' }),
            nativeToScVal(params.price, { type: 'i128' })
          )
        )
        .setTimeout(30)
        .build()

      const signedTx = await this.wallet.signTransaction(transaction.toXDR())
      const result = await server.sendTransaction(signedTx)
      
      if (result.status === 'PENDING') {
        const txResult = await this.waitForTransaction(result.hash)
        return txResult.hash
      } else {
        throw new Error(`Transaction failed: ${result.status}`)
      }
    } catch (error) {
      console.error('Buy error:', error)
      throw error
    }
  }

  async delistItem(tokenId: number): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not connected')
    }

    try {
      const account = await this.wallet.getAccount()
      const contract = new Contract(MARKETPLACE_CONTRACT_ADDRESS)
      
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET
      })
        .addOperation(
          contract.call(
            'delist',
            nativeToScVal(tokenId, { type: 'u32' })
          )
        )
        .setTimeout(30)
        .build()

      const signedTx = await this.wallet.signTransaction(transaction.toXDR())
      const result = await server.sendTransaction(signedTx)
      
      if (result.status === 'PENDING') {
        const txResult = await this.waitForTransaction(result.hash)
        return txResult.hash
      } else {
        throw new Error(`Transaction failed: ${result.status}`)
      }
    } catch (error) {
      console.error('Delist error:', error)
      throw error
    }
  }

  async getTransactionStatus(txHash: string): Promise<'pending' | 'success' | 'error'> {
    try {
      const result = await server.getTransaction(txHash)
      
      if (result.status === 'SUCCESS') {
        return 'success'
      } else if (result.status === 'FAILED') {
        return 'error'
      } else {
        return 'pending'
      }
    } catch (error) {
      console.error('Transaction status error:', error)
      return 'error'
    }
  }

  private async waitForTransaction(txHash: string): Promise<any> {
    let attempts = 0
    const maxAttempts = 30
    
    while (attempts < maxAttempts) {
      try {
        const result = await server.getTransaction(txHash)
        
        if (result.status === 'SUCCESS') {
          return result
        } else if (result.status === 'FAILED') {
          throw new Error(`Transaction failed: ${result.resultXdr}`)
        }
        
        // Wait 2 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2000))
        attempts++
      } catch (error) {
        if (attempts === maxAttempts - 1) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 2000))
        attempts++
      }
    }
    
    throw new Error('Transaction confirmation timeout')
  }

  private prepareMintArgs(params: MintParams): xdr.ScVal[] {
    return [
      new Address(params.to).toScVal(),
      nativeToScVal(params.tokenId, { type: 'u32' }),
      nativeToScVal(params.metadataUri),
      nativeToScVal({
        name: params.metadata.name,
        description: params.metadata.description,
        image: params.metadata.image,
        attributes: params.metadata.attributes.map(attr => ({
          trait_type: attr.trait_type,
          value: attr.value
        }))
      })
    ]
  }

  // Utility function to get next token ID (in a real implementation, this would come from the contract)
  async getNextTokenId(): Promise<number> {
    // This is a mock implementation - in reality, you'd query the contract
    return Math.floor(Math.random() * 1000000)
  }
}

export const stellarService = new StellarContractService()
