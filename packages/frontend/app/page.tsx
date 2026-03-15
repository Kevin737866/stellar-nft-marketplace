import { WalletProvider } from '@/components/WalletProvider'
import { Navigation } from '@/components/Navigation'
import { Hero } from '@/components/Hero'
import { NFTGallery } from '@/components/NFTGallery'
import { Marketplace } from '@/components/Marketplace'

export default function Home() {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Hero />
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              Featured NFTs
            </h2>
            <NFTGallery />
          </div>
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              Marketplace
            </h2>
            <Marketplace />
          </div>
        </main>
      </div>
    </WalletProvider>
  )
}
