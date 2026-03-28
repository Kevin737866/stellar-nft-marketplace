'use client'

import { useState, useRef } from 'react'
import { Navigation } from '@/components/Navigation'
import { useWallet } from '@/components/WalletProvider'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Upload, X, Plus, Image as ImageIcon } from 'lucide-react'
import { stellarService } from '@/lib/stellar'

export default function Create() {
  const { isConnected, address } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    attributes: [{ trait_type: '', value: '' }]
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAttributeChange = (index: number, field: 'trait_type' | 'value', value: string) => {
    const newAttributes = [...formData.attributes]
    newAttributes[index][field] = value
    setFormData({ ...formData, attributes: newAttributes })
  }

  const addAttribute = () => {
    setFormData({
      ...formData,
      attributes: [...formData.attributes, { trait_type: '', value: '' }]
    })
  }

  const removeAttribute = (index: number) => {
    const newAttributes = formData.attributes.filter((_, i) => i !== index)
    setFormData({ ...formData, attributes: newAttributes })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !address) {
      alert('Please connect your wallet first')
      return
    }

    setIsLoading(true)

    try {
      // In a real implementation, you would:
      // 1. Upload image to IPFS
      // 2. Upload metadata to IPFS
      // 3. Mint NFT on Stellar
      
      const tokenId = await stellarService.getNextTokenId()
      
      // Mock IPFS upload
      const imageUri = `ipfs://QmExample${Date.now()}`
      const metadataUri = `ipfs://QmMetadata${Date.now()}`

      const mintParams = {
        to: address,
        tokenId,
        metadataUri,
        metadata: {
          name: formData.name,
          description: formData.description,
          image: imageUri,
          attributes: formData.attributes.filter(attr => attr.trait_type && attr.value)
        }
      }

      await stellarService.mintNFT(mintParams)
      
      alert('NFT minted successfully!')
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        attributes: [{ trait_type: '', value: '' }]
      })
      setPreviewImage(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Minting error:', error)
      alert('Failed to mint NFT. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Connect Your Wallet
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              You need to connect your wallet to create NFTs
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Create New NFT
          </h1>
          <p className="text-lg text-gray-600">
            Mint your unique digital asset on the Stellar network
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Upload Image
            </h2>
            
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-gray-600">Click to upload image</span>
                      <span className="text-sm text-gray-500 mt-1">
                        PNG, JPG, GIF up to 10MB
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* NFT Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              NFT Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter NFT name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your NFT"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Price (XLM)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Attributes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Properties
              </h2>
              <button
                type="button"
                onClick={addAttribute}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Property
              </button>
            </div>

            <div className="space-y-3">
              {formData.attributes.map((attribute, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={attribute.trait_type}
                    onChange={(e) => handleAttributeChange(index, 'trait_type', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Trait type"
                  />
                  <input
                    type="text"
                    value={attribute.value}
                    onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Value"
                  />
                  {formData.attributes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAttribute(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !formData.name || !previewImage}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating...
                </>
              ) : (
                'Create NFT'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
