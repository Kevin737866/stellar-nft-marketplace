'use client'

import { useState } from 'react'
import { useWallet } from '@/components/WalletProvider'
import { Upload, X, Plus } from 'lucide-react'

export default function MintPage() {
  const { isConnected, address } = useWallet()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [attributes, setAttributes] = useState<{ trait_type: string; value: string }[]>([])
  const [newAttribute, setNewAttribute] = useState({ trait_type: '', value: '' })
  const [isMinting, setIsMinting] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addAttribute = () => {
    if (newAttribute.trait_type && newAttribute.value) {
      setAttributes([...attributes, newAttribute])
      setNewAttribute({ trait_type: '', value: '' })
    }
  }

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index))
  }

  const handleMint = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first')
      return
    }

    if (!name || !description || !image) {
      alert('Please fill in all required fields')
      return
    }

    setIsMinting(true)
    
    try {
      // TODO: Implement actual minting logic
      // 1. Upload image to IPFS
      // 2. Create metadata JSON
      // 3. Upload metadata to IPFS
      // 4. Call smart contract mint function
      
      await new Promise(resolve => setTimeout(resolve, 3000)) // Simulate minting
      
      alert('NFT minted successfully!')
      setName('')
      setDescription('')
      setImage(null)
      setPreview('')
      setAttributes([])
    } catch (error) {
      console.error('Minting failed:', error)
      alert('Minting failed. Please try again.')
    } finally {
      setIsMinting(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-8">Please connect your wallet to mint NFTs</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Mint New NFT</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NFT Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
                    <button
                      onClick={() => {
                        setImage(null)
                        setPreview('')
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <label className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700">Choose file</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-gray-500 text-sm mt-2">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter NFT name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your NFT"
                />
              </div>

              {/* Attributes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Properties
                </label>
                <div className="space-y-2">
                  {attributes.map((attr, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="flex-1 px-3 py-2 bg-gray-100 rounded">
                        {attr.trait_type}: {attr.value}
                      </span>
                      <button
                        onClick={() => removeAttribute(index)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Trait type"
                      value={newAttribute.trait_type}
                      onChange={(e) => setNewAttribute({ ...newAttribute, trait_type: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={newAttribute.value}
                      onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addAttribute}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleMint}
              disabled={isMinting || !name || !description || !image}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isMinting ? 'Minting...' : 'Mint NFT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
