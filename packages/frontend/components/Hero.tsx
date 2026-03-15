import { ArrowRight, Sparkles } from 'lucide-react'

export function Hero() {
  return (
    <div className="text-center py-16">
      <div className="flex justify-center mb-6">
        <Sparkles className="w-12 h-12 text-blue-600" />
      </div>
      <h1 className="text-5xl font-bold text-gray-900 mb-6">
        Stellar NFT Marketplace
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Create, collect, and trade unique digital assets on the Stellar blockchain. 
        Experience the future of NFTs with low fees and fast transactions.
      </p>
      <div className="flex justify-center space-x-4">
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
          <span>Explore NFTs</span>
          <ArrowRight className="w-5 h-5" />
        </button>
        <button className="bg-white hover:bg-gray-50 text-gray-800 px-6 py-3 rounded-lg font-semibold border border-gray-300 transition-colors">
          Create NFT
        </button>
      </div>
    </div>
  )
}
