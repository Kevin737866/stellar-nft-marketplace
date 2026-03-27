'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { WalletConnect } from 'stellar-wallet-connect'
import { stellarService } from '@/lib/stellar'

interface WalletContextType {
  wallet: WalletConnect | null
  isConnected: boolean
  address: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletConnect | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    const initWallet = () => {
      const walletConnect = new WalletConnect({
        network: 'testnet',
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
      })
      setWallet(walletConnect)
      stellarService.setWallet(walletConnect)
    }

    initWallet()
  }, [])

  const connect = async () => {
    if (!wallet) return
    
    try {
      await wallet.connect()
      const account = await wallet.getAccount()
      setAddress(account.address)
      setIsConnected(true)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const disconnect = async () => {
    if (!wallet) return
    
    try {
      await wallet.disconnect()
      setAddress(null)
      setIsConnected(false)
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  return (
    <WalletContext.Provider value={{ wallet, isConnected, address, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
