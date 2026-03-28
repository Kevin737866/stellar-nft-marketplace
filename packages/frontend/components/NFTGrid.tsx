import { NFTCard, NFTCardProps } from './NFTCard'
import { LoadingSpinner } from './LoadingSpinner'

interface NFTGridProps {
  nfts: NFTCardProps[]
  loading?: boolean
  error?: string
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function NFTGrid({ 
  nfts, 
  loading = false, 
  error, 
  columns = 3,
  className = '' 
}: NFTGridProps) {
  const gridColumns = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 font-medium mb-2">Error loading NFTs</div>
        <div className="text-gray-600 text-sm">{error}</div>
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 font-medium mb-2">No NFTs found</div>
        <div className="text-gray-400 text-sm">
          Try adjusting your filters or check back later
        </div>
      </div>
    )
  }

  return (
    <div className={`grid gap-6 ${gridColumns[columns]} ${className}`}>
      {nfts.map((nft) => (
        <NFTCard key={nft.id} {...nft} />
      ))}
    </div>
  )
}
