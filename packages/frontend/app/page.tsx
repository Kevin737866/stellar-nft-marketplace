import { Navigation } from '@/components/Navigation'
import { Hero } from '@/components/Hero'
import { NFTGrid } from '@/components/NFTGrid'
import { NFTCard } from '@/components/NFTCard'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Link from 'next/link'

// Mock data for featured NFTs
const featuredNFTs = [
  {
    id: '1',
    name: 'Cosmic Dreams #1',
    description: 'A beautiful cosmic artwork featuring vibrant colors and ethereal patterns.',
    image: 'https://ipfs.io/ipfs/QmXxyp5zJQrQZxYpJqZjZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ',
    price: '100.50',
    owner: 'GDX3CJ5JQJYFJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZ',
    isListed: true
  },
  {
    id: '2',
    name: 'Digital Sunset',
    description: 'A mesmerizing digital sunset with warm gradients and modern aesthetics.',
    image: 'https://ipfs.io/ipfs/QmYxyp5zJQrQZxYpJqZjZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ',
    price: '75.25',
    owner: 'GDX3CJ5JQJYFJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZ',
    isListed: true
  },
  {
    id: '3',
    name: 'Abstract Mind',
    description: 'An exploration of abstract consciousness through digital art.',
    image: 'https://ipfs.io/ipfs/QmZxyp5zJQrQZxYpJqZjZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ',
    price: '150.00',
    owner: 'GDX3CJ5JQJYFJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZ',
    isListed: true
  },
  {
    id: '4',
    name: 'Neon Nights',
    description: 'Vibrant neon colors dancing in the digital darkness.',
    image: 'https://ipfs.io/ipfs/QmAxyp5zJQrQZxYpJqZjZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ',
    price: '200.75',
    owner: 'GDX3CJ5JQJYFJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZ',
    isListed: true
  },
  {
    id: '5',
    name: 'Quantum Reality',
    description: 'Where quantum mechanics meets artistic expression.',
    image: 'https://ipfs.io/ipfs/QmBxyp5zJQrQZxYpJqZjZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ',
    price: '300.00',
    owner: 'GDX3CJ5JQJYFJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZ',
    isListed: true
  },
  {
    id: '6',
    name: 'Ethereal Waves',
    description: 'Flowing waves of digital consciousness.',
    image: 'https://ipfs.io/ipfs/QmCxyp5zJQrQZxYpJqZjZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ',
    price: '125.50',
    owner: 'GDX3CJ5JQJYFJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZKJZ',
    isListed: true
  }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        <Hero />

        {/* Featured NFTs Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured NFTs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the most sought-after digital collectibles on the Stellar network
            </p>
          </div>

          <ErrorBoundary>
            <NFTGrid nfts={featuredNFTs} columns={3} />
          </ErrorBoundary>

          <div className="text-center mt-12">
            <Link
              href="/marketplace"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All NFTs
            </Link>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-gray-600">Total NFTs</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">5,000+</div>
                <div className="text-gray-600">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">1M+ XLM</div>
                <div className="text-gray-600">Total Volume</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
