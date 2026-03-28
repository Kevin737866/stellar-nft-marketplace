'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { NFTGrid } from '@/components/NFTGrid'
import { NFTCard } from '@/components/NFTCard'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useWallet } from '@/components/WalletProvider'
import { Grid, List, Filter } from 'lucide-react'

// Mock user NFTs data
const mockUserNFTs = [
  {
    id: '1',
    name: 'Cosmic Dreams #1',
    description: 'A beautiful cosmic artwork featuring vibrant colors and ethereal patterns.',
    image: 'https://ipfs.io/ipfs/QmXxyp5zJQrQZxYpJqZjZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ',
    price: '100.50',
    owner: 'GDX3CJ5JQJYFJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZ',
    isListed: true
  },
  {
    id: '10',
    name: 'My Creation #1',
    description: 'My personal NFT creation.',
    image: 'https://ipfs.io/ipfs/QmUser1xyp5zJQrQZxYpJqZjZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ',
    price: null,
    owner: 'GDX3CJ5JQJYFJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZ',
    isListed: false
  },
  {
    id: '11',
    name: 'Abstract Collection #42',
    description: 'Part of my abstract art collection.',
    image: 'https://ipfs.io/ipfs/QmUser2xyp5zJQrQZxYpJqZjZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ',
    price: '250.00',
    owner: 'GDX3CJ5JQJYFJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZ',
    isListed: true
  }
]

export default function MyNFTs() {
  const { isConnected, address } = useWallet()
  const [nfts, setNfts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState<'all' | 'listed' | 'unlisted'>('all')

  useEffect(() => {
    const fetchUserNFTs = async () => {
      if (!isConnected || !address) return

      setLoading(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        let filtered = [...mockUserNFTs]
        
        switch (filter) {
          case 'listed':
            filtered = filtered.filter(nft => nft.isListed)
            break
          case 'unlisted':
            filtered = filtered.filter(nft => !nft.isListed)
            break
          default:
            break
        }
        
        setNfts(filtered)
      } catch (error) {
        console.error('Failed to fetch NFTs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserNFTs()
  }, [isConnected, address, filter])

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Connect Your Wallet
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              You need to connect your wallet to view your NFTs
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My NFTs
          </h1>
          <p className="text-lg text-gray-600">
            Manage your digital collectibles
          </p>
          <div className="text-sm text-gray-500 mt-2">
            Wallet: {formatAddress(address || '')}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All NFTs</option>
                <option value="listed">Listed</option>
                <option value="unlisted">Unlisted</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-4 h-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {mockUserNFTs.length}
            </div>
            <div className="text-sm text-gray-600">Total NFTs</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {mockUserNFTs.filter(nft => nft.isListed).length}
            </div>
            <div className="text-sm text-gray-600">Listed</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {mockUserNFTs
                .filter(nft => nft.isListed)
                .reduce((sum, nft) => sum + parseFloat(nft.price || '0'), 0)
                .toFixed(2)} XLM
            </div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
        </div>

        {/* NFT Display */}
        <ErrorBoundary>
          {viewMode === 'grid' ? (
            <NFTGrid 
              nfts={nfts} 
              loading={loading}
              columns={3}
            />
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : nfts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 font-medium mb-2">No NFTs found</div>
                  <div className="text-gray-400 text-sm">
                    {filter === 'all' 
                      ? "You don't have any NFTs yet" 
                      : `No ${filter} NFTs found`
                    }
                  </div>
                </div>
              ) : (
                nfts.map((nft) => (
                  <div key={nft.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={nft.image}
                          alt={nft.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {nft.name}
                        </h3>
                        <p className="text-gray-600 mb-2 line-clamp-2">
                          {nft.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            nft.isListed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {nft.isListed ? 'Listed' : 'Unlisted'}
                          </span>
                          {nft.isListed && nft.price && (
                            <span className="font-medium text-gray-900">
                              {parseFloat(nft.price).toFixed(2)} XLM
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {nft.isListed ? 'Manage' : 'List'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </ErrorBoundary>
      </main>
    </div>
  )
}
