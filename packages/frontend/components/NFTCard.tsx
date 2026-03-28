'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, ShoppingCart } from 'lucide-react'
import { LoadingSpinner } from './LoadingSpinner'

export interface NFTCardProps {
  id: string
  name: string
  description?: string
  image: string
  price?: string
  owner?: string
  isListed?: boolean
  className?: string
}

export function NFTCard({ 
  id, 
  name, 
  description, 
  image, 
  price, 
  owner, 
  isListed = false,
  className = '' 
}: NFTCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const formatPrice = (price: string) => {
    const num = parseFloat(price)
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M XLM`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K XLM`
    }
    return `${num.toFixed(2)} XLM`
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getImageUrl = (url: string) => {
    if (url.startsWith('ipfs://')) {
      const cid = url.replace('ipfs://', '')
      return `https://ipfs.io/ipfs/${cid}`
    }
    return url
  }

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${className}`}>
      <Link href={`/nft/${id}`}>
        <div className="relative aspect-square w-full">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <LoadingSpinner size="lg" />
            </div>
          )}
          
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2" />
                <p className="text-sm text-gray-500">Image not available</p>
              </div>
            </div>
          ) : (
            <Image
              src={getImageUrl(image)}
              alt={name}
              fill
              className="object-cover"
              onError={() => {
                setImageError(true)
                setImageLoading(false)
              }}
              onLoad={() => setImageLoading(false)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          
          {isListed && price && (
            <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-semibold">
              {formatPrice(price)}
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Link href={`/nft/${id}`} className="flex-1">
            <h3 className="font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">
              {name}
            </h3>
          </Link>
          <Link 
            href={`/nft/${id}`} 
            className="ml-2 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {isListed && price && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-900">
              {formatPrice(price)}
            </span>
            <button className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
              <ShoppingCart className="w-3 h-3" />
              Buy
            </button>
          </div>
        )}

        {owner && (
          <div className="text-xs text-gray-500">
            Owned by{' '}
            <Link 
              href={`/profile/${owner}`} 
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              {formatAddress(owner)}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
