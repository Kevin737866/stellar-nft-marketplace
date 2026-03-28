'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { useWallet } from '@/components/WalletProvider'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { 
  ExternalLink, 
  ShoppingCart, 
  Share2, 
  Heart, 
  Clock,
  User,
  Tag
} from 'lucide-react'

// Mock NFT data
const mockNFTData: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Cosmic Dreams #1',
    description: 'A beautiful cosmic artwork featuring vibrant colors and ethereal patterns. This piece represents the infinite possibilities of the digital universe, where imagination meets technology in a symphony of colors and shapes.',
    image: 'https://ipfs.io/ipfs/QmXxyp5zJQrQZxYpJqZjZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ',
    price: '100.50',
    owner: 'GDX3CJ5JQJYFJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZ',
    creator: 'GDX3CJ5JQJYFJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZ',
    isListed: true,
    createdAt: '2024-01-15T10:30:00Z',
    attributes: [
      { trait_type: 'Background', value: 'Cosmic' },
      { trait_type: 'Style', value: 'Abstract' },
      { trait_type: 'Rarity', value: 'Rare' },
      { trait_type: 'Series', value: 'Cosmic Dreams' }
    ],
    tokenId: 1
  }
}

export default function NFTDetail() {
  const params = useParams()
  const { isConnected, address } = useWallet()
  const [nft, setNft] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)

  const nftId = params.id as string

  useEffect(() => {
    const fetchNFT = async () => {
      try {
        setLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const nftData = mockNFTData[nftId]
        if (!nftData) {
          setError('NFT not found')
          return
        }
        
        setNft(nftData)
      } catch (err) {
        setError('Failed to load NFT')
      } finally {
        setLoading(false)
      }
    }

    fetchNFT()
  }, [nftId])

  const handleBuy = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }
    
    // In a real implementation, this would handle the purchase
    alert('Purchase functionality would be implemented here')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: nft?.name,
        text: nft?.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (price: string) => {
    const num = parseFloat(price)
    return `${num.toFixed(2)} XLM`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </main>
      </div>
    )
  }

  if (error || !nft) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              NFT Not Found
            </h1>
            <p className="text-gray-600">
              The NFT you're looking for doesn't exist or has been removed.
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
        <ErrorBoundary>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {nft.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Created {formatDate(nft.createdAt)}
                  </span>
                  <span>Token ID: #{nft.tokenId}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {nft.description}
                </p>
              </div>

              {/* Price and Actions */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Current Price</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(nft.price)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className={`p-2 rounded-lg transition-colors ${
                        isLiked 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {nft.isListed && (
                  <button
                    onClick={handleBuy}
                    disabled={!isConnected}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {isConnected ? 'Buy Now' : 'Connect Wallet to Buy'}
                  </button>
                )}
              </div>

              {/* Creator and Owner */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <User className="w-4 h-4" />
                    Creator
                  </div>
                  <div className="font-medium text-gray-900">
                    {formatAddress(nft.creator)}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <User className="w-4 h-4" />
                    Owner
                  </div>
                  <div className="font-medium text-gray-900">
                    {formatAddress(nft.owner)}
                  </div>
                </div>
              </div>

              {/* Properties */}
              {nft.attributes && nft.attributes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Properties
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {nft.attributes.map((attr: any, index: number) => (
                      <div 
                        key={index}
                        className="bg-white rounded-lg p-3 border border-gray-200"
                      >
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Tag className="w-3 h-3" />
                          {attr.trait_type}
                        </div>
                        <div className="font-medium text-gray-900">
                          {attr.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* External Links */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Links
                </h3>
                <div className="flex gap-4">
                  <a
                    href={`https://stellar.expert/explorer/testnet/account/${nft.owner}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Stellar Expert
                  </a>
                </div>
              </div>
            </div>
          </div>
        </ErrorBoundary>
      </main>
    </div>
  )
}
