'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Clock, TrendingUp } from 'lucide-react'

interface Listing {
  id: string
  nft: {
    id: string
    name: string
    image: string
    description: string
  }
  seller: string
  price: string
  createdAt: string
}

export function Marketplace() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'price' | 'recent'>('recent')

  useEffect(() => {
    // Mock marketplace data
    const mockListings: Listing[] = [
      {
        id: '1',
        nft: {
          id: '1',
          name: 'Stellar Dreams #1',
          image: 'https://picsum.photos/400/400?random=5',
          description: 'A beautiful piece of digital art'
        },
        seller: 'GD...1234',
        price: '100 XLM',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        nft: {
          id: '2',
          name: 'Cosmic Journey #2',
          image: 'https://picsum.photos/400/400?random=6',
          description: 'Explore the depths of space'
        },
        seller: 'GD...5678',
        price: '250 XLM',
        createdAt: '2024-01-14T15:45:00Z'
      },
      {
        id: '3',
        nft: {
          id: '3',
          name: 'Nebula Essence #3',
          image: 'https://picsum.photos/400/400?random=7',
          description: 'Capturing stellar beauty'
        },
        seller: 'GD...9012',
        price: '75 XLM',
        createdAt: '2024-01-13T09:20:00Z'
      }
    ]

    setTimeout(() => {
      setListings(mockListings)
      setLoading(false)
    }, 1000)
  }, [])

  const sortedListings = [...listings].sort((a, b) => {
    if (sortBy === 'price') {
      return parseInt(a.price) - parseInt(b.price)
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSortBy('recent')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              sortBy === 'recent'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Recent</span>
          </button>
          <button
            onClick={() => setSortBy('price')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              sortBy === 'price'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Price</span>
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          {listings.length} items listed
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedListings.map((listing) => (
          <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden card-hover">
            <div className="relative">
              <img
                src={listing.nft.image}
                alt={listing.nft.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                FOR SALE
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">{listing.nft.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{listing.nft.description}</p>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <span className="text-2xl font-bold text-blue-600">{listing.price}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Seller: {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                </div>
              </div>
              <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                <ShoppingCart className="w-4 h-4" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
