'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/components/WalletProvider'
import { useToast } from '@/components/Toast'
import { stellarService } from '@/lib/stellar'
import { ShoppingCart, Clock, TrendingUp, X, DollarSign, List, Trash2 } from 'lucide-react'

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
  tokenId?: number
  isOwner?: boolean
}

export function Marketplace() {
  const { isConnected, address } = useWallet()
  const { addToast, removeToast } = useToast()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'price' | 'recent'>('recent')
  const [listingPrice, setListingPrice] = useState<{ [key: string]: string }>({})
  const [showListModal, setShowListModal] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  useEffect(() => {
    // Mock marketplace data with ownership info
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
        price: '100',
        createdAt: '2024-01-15T10:30:00Z',
        tokenId: 1,
        isOwner: false
      },
      {
        id: '2',
        nft: {
          id: '2',
          name: 'Cosmic Journey #2',
          image: 'https://picsum.photos/400/400?random=6',
          description: 'Explore the depths of space'
        },
        seller: address || 'GD...5678', // Make this user the owner for demo
        price: '250',
        createdAt: '2024-01-14T15:45:00Z',
        tokenId: 2,
        isOwner: true
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
        price: '75',
        createdAt: '2024-01-13T09:20:00Z',
        tokenId: 3,
        isOwner: false
      }
    ]

    setTimeout(() => {
      setListings(mockListings)
      setLoading(false)
    }, 1000)
  }, [address])

  const handleBuyNFT = async (listing: Listing) => {
    if (!isConnected || !address) {
      addToast({
        type: 'error',
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet to buy NFTs'
      })
      return
    }

    if (!listing.tokenId) {
      addToast({
        type: 'error',
        title: 'Invalid NFT',
        message: 'This NFT cannot be purchased'
      })
      return
    }

    setIsProcessing(listing.id)
    let loadingToastId: string | null = null
    
    try {
      loadingToastId = addToast({
        type: 'loading',
        title: 'Purchasing NFT',
        message: 'Please confirm the transaction in your wallet...',
        duration: 0
      }).id
      
      const txHash = await stellarService.buyNFT({
        tokenId: listing.tokenId,
        price: listing.price
      })
      
      if (loadingToastId) {
        removeToast(loadingToastId)
      }
      
      addToast({
        type: 'success',
        title: 'Transaction Submitted',
        message: `Purchase transaction: ${txHash.slice(0, 10)}...`
      })
      
      // Poll for confirmation
      const confirmed = await pollTransactionStatus(txHash)
      
      if (confirmed) {
        addToast({
          type: 'success',
          title: 'NFT Purchased!',
          message: `You successfully purchased ${listing.nft.name}!`
        })
        
        // Remove from listings or update ownership
        setListings(prev => prev.filter(l => l.id !== listing.id))
      } else {
        addToast({
          type: 'error',
          title: 'Purchase Failed',
          message: 'The transaction could not be confirmed. Please try again.'
        })
      }
      
    } catch (error) {
      console.error('Buy error:', error)
      
      if (loadingToastId) {
        removeToast(loadingToastId)
      }
      
      addToast({
        type: 'error',
        title: 'Purchase Failed',
        message: error instanceof Error ? error.message : 'Failed to purchase NFT'
      })
    } finally {
      setIsProcessing(null)
    }
  }

  const handleListNFT = async (listing: Listing) => {
    const price = listingPrice[listing.id]
    
    if (!price || parseFloat(price) <= 0) {
      addToast({
        type: 'error',
        title: 'Invalid Price',
        message: 'Please enter a valid price'
      })
      return
    }

    if (!listing.tokenId) {
      addToast({
        type: 'error',
        title: 'Invalid NFT',
        message: 'This NFT cannot be listed'
      })
      return
    }

    setIsProcessing(listing.id)
    let loadingToastId: string | null = null
    
    try {
      loadingToastId = addToast({
        type: 'loading',
        title: 'Listing NFT',
        message: 'Please confirm the transaction in your wallet...',
        duration: 0
      }).id
      
      const txHash = await stellarService.listItem({
        tokenId: listing.tokenId,
        price
      })
      
      if (loadingToastId) {
        removeToast(loadingToastId)
      }
      
      addToast({
        type: 'success',
        title: 'Transaction Submitted',
        message: `Listing transaction: ${txHash.slice(0, 10)}...`
      })
      
      // Poll for confirmation
      const confirmed = await pollTransactionStatus(txHash)
      
      if (confirmed) {
        addToast({
          type: 'success',
          title: 'NFT Listed!',
          message: `${listing.nft.name} is now listed for ${price} XLM`
        })
        
        // Update the listing price
        setListings(prev => prev.map(l => 
          l.id === listing.id ? { ...l, price } : l
        ))
        setShowListModal(null)
        setListingPrice(prev => ({ ...prev, [listing.id]: '' }))
      } else {
        addToast({
          type: 'error',
          title: 'Listing Failed',
          message: 'The transaction could not be confirmed. Please try again.'
        })
      }
      
    } catch (error) {
      console.error('List error:', error)
      
      if (loadingToastId) {
        removeToast(loadingToastId)
      }
      
      addToast({
        type: 'error',
        title: 'Listing Failed',
        message: error instanceof Error ? error.message : 'Failed to list NFT'
      })
    } finally {
      setIsProcessing(null)
    }
  }

  const handleDelistNFT = async (listing: Listing) => {
    if (!listing.tokenId) {
      addToast({
        type: 'error',
        title: 'Invalid NFT',
        message: 'This NFT cannot be delisted'
      })
      return
    }

    setIsProcessing(listing.id)
    let loadingToastId: string | null = null
    
    try {
      loadingToastId = addToast({
        type: 'loading',
        title: 'Delisting NFT',
        message: 'Please confirm the transaction in your wallet...',
        duration: 0
      }).id
      
      const txHash = await stellarService.delistItem(listing.tokenId)
      
      if (loadingToastId) {
        removeToast(loadingToastId)
      }
      
      addToast({
        type: 'success',
        title: 'Transaction Submitted',
        message: `Delist transaction: ${txHash.slice(0, 10)}...`
      })
      
      // Poll for confirmation
      const confirmed = await pollTransactionStatus(txHash)
      
      if (confirmed) {
        addToast({
          type: 'success',
          title: 'NFT Delisted!',
          message: `${listing.nft.name} has been removed from the marketplace`
        })
        
        // Remove from listings
        setListings(prev => prev.filter(l => l.id !== listing.id))
      } else {
        addToast({
          type: 'error',
          title: 'Delist Failed',
          message: 'The transaction could not be confirmed. Please try again.'
        })
      }
      
    } catch (error) {
      console.error('Delist error:', error)
      
      if (loadingToastId) {
        removeToast(loadingToastId)
      }
      
      addToast({
        type: 'error',
        title: 'Delist Failed',
        message: error instanceof Error ? error.message : 'Failed to delist NFT'
      })
    } finally {
      setIsProcessing(null)
    }
  }

  const pollTransactionStatus = async (txHash: string, maxAttempts = 15): Promise<boolean> => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const status = await stellarService.getTransactionStatus(txHash)
        
        if (status === 'success') {
          return true
        } else if (status === 'error') {
          return false
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        console.error('Polling error:', error)
      }
    }
    
    return false
  }

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
              {listing.isOwner && (
                <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  YOURS
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">{listing.nft.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{listing.nft.description}</p>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <span className="text-2xl font-bold text-blue-600">{listing.price} XLM</span>
                </div>
                <div className="text-sm text-gray-500">
                  Seller: {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                </div>
              </div>
              
              {listing.isOwner ? (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowListModal(listing.id)}
                      disabled={isProcessing === listing.id}
                      className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>{isProcessing === listing.id ? 'Processing...' : 'Update Price'}</span>
                    </button>
                    <button
                      onClick={() => handleDelistNFT(listing)}
                      disabled={isProcessing === listing.id}
                      className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delist</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleBuyNFT(listing)}
                  disabled={isProcessing === listing.id || !isConnected}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    {isProcessing === listing.id ? 'Processing...' : 
                     !isConnected ? 'Connect Wallet' : 'Buy Now'}
                  </span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* List/Update Price Modal */}
      {showListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Set Listing Price</h3>
              <button
                onClick={() => {
                  setShowListModal(null)
                  setListingPrice(prev => ({ ...prev, [showListModal]: '' }))
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (XLM)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={listingPrice[showListModal] || ''}
                  onChange={(e) => setListingPrice(prev => ({ 
                    ...prev, 
                    [showListModal]: e.target.value 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter price in XLM"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowListModal(null)
                    setListingPrice(prev => ({ ...prev, [showListModal]: '' }))
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleListNFT(listings.find(l => l.id === showListModal)!)}
                  disabled={isProcessing === showListModal || !listingPrice[showListModal]}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {isProcessing === showListModal ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <List className="w-4 h-4" />
                      <span>Set Price</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
