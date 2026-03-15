'use client'

import { useState, useEffect } from 'react'
import { Image, Heart, ExternalLink } from 'lucide-react'

interface NFT {
  id: string
  name: string
  description: string
  image: string
  price?: string
  owner: string
  tokenURI: string
}

export function NFTGallery() {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for now - will be replaced with real contract calls
    const mockNFTs: NFT[] = [
      {
        id: '1',
        name: 'Stellar Dreams #1',
        description: 'A beautiful piece of digital art inspired by the cosmos',
        image: 'https://picsum.photos/400/400?random=1',
        owner: 'GD...1234',
        tokenURI: 'ipfs://Qm...'
      },
      {
        id: '2',
        name: 'Cosmic Journey #2',
        description: 'Explore the depths of space through this unique NFT',
        image: 'https://picsum.photos/400/400?random=2',
        price: '100 XLM',
        owner: 'GD...5678',
        tokenURI: 'ipfs://Qm...'
      },
      {
        id: '3',
        name: 'Nebula Essence #3',
        description: 'Capturing the beauty of stellar formations',
        image: 'https://picsum.photos/400/400?random=3',
        owner: 'GD...9012',
        tokenURI: 'ipfs://Qm...'
      },
      {
        id: '4',
        name: 'Stellar Light #4',
        description: 'A radiant piece celebrating stellar phenomena',
        image: 'https://picsum.photos/400/400?random=4',
        price: '150 XLM',
        owner: 'GD...3456',
        tokenURI: 'ipfs://Qm...'
      }
    ]

    setTimeout(() => {
      setNfts(mockNFTs)
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-300 h-64 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {nfts.map((nft) => (
        <div key={nft.id} className="bg-white rounded-lg shadow-md overflow-hidden card-hover">
          <div className="relative">
            <img
              src={nft.image}
              alt={nft.name}
              className="w-full h-64 object-cover"
            />
            <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
              <Heart className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">{nft.name}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{nft.description}</p>
            <div className="flex justify-between items-center">
              <div>
                {nft.price ? (
                  <span className="text-blue-600 font-semibold">{nft.price}</span>
                ) : (
                  <span className="text-gray-500 text-sm">Not for sale</span>
                )}
              </div>
              <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
