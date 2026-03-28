'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { NFTGrid } from '@/components/NFTGrid'
import { NFTCard } from '@/components/NFTCard'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Search, Filter, SortAsc } from 'lucide-react'

// Mock marketplace data
const allNFTs = [
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
    id: '2',
    name: 'Digital Sunset',
    description: 'A mesmerizing digital sunset with warm gradients and modern aesthetics.',
    image: 'https://ipfs.io/ipfs/QmYxyp5zJQrQZxYpJqZjZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ',
    price: '75.25',
    owner: 'GDX3CJ5JQJYFJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZ',
    isListed: true
  },
  {
    id: '3',
    name: 'Abstract Mind',
    description: 'An exploration of abstract consciousness through digital art.',
    image: 'https://ipfs.io/ipfs/QmZxyp5zJQrQZxYpJqZjZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ',
    price: '150.00',
    owner: 'GDX3CJ5JQJYFJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZ',
    isListed: true
  },
  {
    id: '4',
    name: 'Neon Nights',
    description: 'Vibrant neon colors dancing in the digital darkness.',
    image: 'https://ipfs.io/ipfs/QmAxyp5zJQrQZxYpJqZjZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ',
    price: '200.75',
    owner: 'GDX3CJ5JQJYFJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZ',
    isListed: true
  },
  {
    id: '5',
    name: 'Quantum Reality',
    description: 'Where quantum mechanics meets artistic expression.',
    image: 'https://ipfs.io/ipfs/QmBxyp5zJQrQZxYpJqZjZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ',
    price: '300.00',
    owner: 'GDX3CJ5JQJYFJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZ',
    isListed: true
  },
  {
    id: '6',
    name: 'Ethereal Waves',
    description: 'Flowing waves of digital consciousness.',
    image: 'https://ipfs.io/ipfs/QmCxyp5zJQrQZxYpJqZjZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ',
    price: '125.50',
    owner: 'GDX3CJ5JQJYFJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZ',
    isListed: true
  },
  {
    id: '7',
    name: 'Cyber Punk',
    description: 'Futuristic cyberpunk aesthetic with neon elements.',
    image: 'https://ipfs.io/ipfs/QmDxyp5zJQrQZxYpJqZjZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ',
    price: '85.00',
    owner: 'GDX3CJ5JQJYFJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZ',
    isListed: true
  },
  {
    id: '8',
    name: 'Crystal Vision',
    description: 'Crystalline structures refracting digital light.',
    image: 'https://ipfs.io/ipfs/QmExyp5zJQrQZxYpJqZjZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ',
    price: '175.25',
    owner: 'GDX3CJ5JQJYFJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZ',
    isListed: true
  },
  {
    id: '9',
    name: 'Digital Flora',
    description: 'Botanical beauty in the digital realm.',
    image: 'https://ipfs.io/ipfs/QmFxyp5zJQrQZxYpJqZjZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ',
    price: '95.75',
    owner: 'GDX3CJ5JQJYFJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZ',
    isListed: true
  }
]

export default function Marketplace() {
  const [nfts, setNfts] = useState(allNFTs)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('price-low')
  const [filterBy, setFilterBy] = useState('all')

  useEffect(() => {
    // Simulate loading
    setLoading(true)
    const timer = setTimeout(() => {
      filterAndSortNFTs()
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [searchTerm, sortBy, filterBy])

  const filterAndSortNFTs = () => {
    let filtered = [...allNFTs]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(nft =>
        nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply category filter
    if (filterBy !== 'all') {
      // In a real app, this would filter by category
      filtered = filtered.filter(nft => nft.isListed)
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price || '0') - parseFloat(b.price || '0'))
        break
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price || '0') - parseFloat(a.price || '0'))
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        break
    }

    setNfts(filtered)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            NFT Marketplace
          </h1>
          <p className="text-lg text-gray-600">
            Discover and collect unique digital assets on the Stellar network
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search NFTs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All NFTs</option>
                <option value="listed">Listed Only</option>
                <option value="new">New Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `Showing ${nfts.length} NFTs`}
          </p>
        </div>

        {/* NFT Grid */}
        <ErrorBoundary>
          <NFTGrid 
            nfts={nfts} 
            loading={loading}
            columns={4}
          />
        </ErrorBoundary>
      </main>
    </div>
  )
}
