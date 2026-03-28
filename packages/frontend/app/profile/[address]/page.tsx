'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { NFTGrid } from '@/components/NFTGrid'
import { NFTCard } from '@/components/NFTCard'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ExternalLink, Copy, Check } from 'lucide-react'

// Mock user profile data
const mockUserProfile = {
  address: 'GDX3CJ5JQJYFJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZ',
  username: 'stellar_collector',
  bio: 'Digital art enthusiast and NFT collector on the Stellar network. Passionate about supporting emerging artists and building the decentralized creative economy.',
  avatar: 'https://ipfs.io/ipfs/QmAvatarExample',
  joinedAt: '2024-01-01T00:00:00Z',
  stats: {
    totalNFTs: 42,
    totalSales: 15,
    totalVolume: '5000.50',
    followers: 128,
    following: 64
  }
}

// Mock user NFTs
const mockUserNFTs = [
  {
    id: '1',
    name: 'Cosmic Dreams #1',
    description: 'A beautiful cosmic artwork featuring vibrant colors and ethereal patterns.',
    image: 'https://ipfs.io/ipfs/QmXxyp5zJQrQZxYpJqZjZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ',
    price: '100.50',
    owner: mockUserProfile.address,
    isListed: true
  },
  {
    id: '10',
    name: 'My Creation #1',
    description: 'My personal NFT creation.',
    image: 'https://ipfs.io/ipfs/QmUser1xyp5zJQrQZxYpJqZjZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ',
    price: null,
    owner: mockUserProfile.address,
    isListed: false
  }
]

export default function UserProfile() {
  const params = useParams()
  const [profile, setProfile] = useState<any>(null)
  const [nfts, setNfts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const userAddress = params.address as string

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // In a real app, you would fetch the actual profile data
        setProfile(mockUserProfile)
        setNfts(mockUserNFTs)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userAddress])

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(userAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy address:', error)
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Profile Not Found
            </h1>
            <p className="text-gray-600">
              The user profile you're looking for doesn't exist.
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
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600" />
          
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-12">
              <div className="w-24 h-24 bg-gray-300 rounded-full border-4 border-white overflow-hidden">
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {profile.username}
                </h1>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-600 mb-2">
                  <span>{formatAddress(profile.address)}</span>
                  <button
                    onClick={copyAddress}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-gray-600 mb-2">
                  Joined {formatDate(profile.joinedAt)}
                </p>
                {profile.bio && (
                  <p className="text-gray-700 max-w-2xl">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-xl font-bold text-gray-900 mb-1">
              {profile.stats.totalNFTs}
            </div>
            <div className="text-xs text-gray-600">NFTs</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-xl font-bold text-gray-900 mb-1">
              {profile.stats.totalSales}
            </div>
            <div className="text-xs text-gray-600">Sales</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-xl font-bold text-gray-900 mb-1">
              {parseFloat(profile.stats.totalVolume).toFixed(0)} XLM
            </div>
            <div className="text-xs text-gray-600">Volume</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-xl font-bold text-gray-900 mb-1">
              {profile.stats.followers}
            </div>
            <div className="text-xs text-gray-600">Followers</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-xl font-bold text-gray-900 mb-1">
              {profile.stats.following}
            </div>
            <div className="text-xs text-gray-600">Following</div>
          </div>
        </div>

        {/* NFT Collection */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Collection
            </h2>
            <a
              href={`https://stellar.expert/explorer/testnet/account/${profile.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View on Stellar Expert
            </a>
          </div>

          <ErrorBoundary>
            <NFTGrid 
              nfts={nfts} 
              loading={false}
              columns={4}
            />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
