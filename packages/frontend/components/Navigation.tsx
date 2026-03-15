'use client'

import { useWallet } from './WalletProvider'
import { Wallet, LogOut } from 'lucide-react'

export function Navigation() {
  const { isConnected, address, connect, disconnect } = useWallet()

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
            <span className="text-xl font-bold text-gray-800">Stellar NFT</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              Gallery
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              Marketplace
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              Mint
            </a>
            
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <button
                  onClick={disconnect}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
