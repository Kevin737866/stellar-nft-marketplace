'use client'

import { useState } from 'react'
import { useWallet } from '@/components/WalletProvider'
import { useToast } from '@/components/Toast'
import { stellarService } from '@/lib/stellar'
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
  const [mintingStep, setMintingStep] = useState<'uploading' | 'minting' | 'confirming' | null>(null)
  const { addToast, removeToast } = useToast()

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

  const uploadToIPFS = async (file: File): Promise<{ cid: string; url: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to upload to IPFS')
    }
    
    return response.json()
  }

  const uploadMetadataToIPFS = async (metadata: any): Promise<{ cid: string; url: string }> => {
    const response = await fetch('/api/upload', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ metadata })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to upload metadata to IPFS')
    }
    
    return response.json()
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
        
        // Wait 2 seconds before polling again
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        console.error('Polling error:', error)
      }
    }
    
    return false
  }

  const handleMint = async () => {
    if (!isConnected || !address) {
      addToast({
        type: 'error',
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet first'
      })
      return
    }

    if (!name || !description || !image) {
      addToast({
        type: 'error',
        title: 'Missing Information',
        message: 'Please fill in all required fields'
      })
      return
    }

    setIsMinting(true)
    let loadingToastId: string | null = null
    
    try {
      // Step 1: Upload image to IPFS
      setMintingStep('uploading')
      loadingToastId = addToast({
        type: 'loading',
        title: 'Uploading Image',
        message: 'Uploading your image to IPFS...',
        duration: 0
      }).id
      
      const imageUpload = await uploadToIPFS(image)
      
      if (loadingToastId) {
        removeToast(loadingToastId)
      }
      
      addToast({
        type: 'success',
        title: 'Image Uploaded',
        message: 'Image successfully uploaded to IPFS'
      })

      // Step 2: Create and upload metadata
      const metadata = {
        name,
        description,
        image: imageUpload.url,
        attributes: attributes.map(attr => ({
          trait_type: attr.trait_type,
          value: attr.value
        }))
      }
      
      loadingToastId = addToast({
        type: 'loading',
        title: 'Uploading Metadata',
        message: 'Uploading metadata to IPFS...',
        duration: 0
      }).id
      
      const metadataUpload = await uploadMetadataToIPFS(metadata)
      
      if (loadingToastId) {
        removeToast(loadingToastId)
      }
      
      addToast({
        type: 'success',
        title: 'Metadata Uploaded',
        message: 'Metadata successfully uploaded to IPFS'
      })

      // Step 3: Mint NFT on blockchain
      setMintingStep('minting')
      const tokenId = await stellarService.getNextTokenId()
      
      loadingToastId = addToast({
        type: 'loading',
        title: 'Minting NFT',
        message: 'Please confirm the transaction in your wallet...',
        duration: 0
      }).id
      
      const txHash = await stellarService.mintNFT({
        to: address,
        tokenId,
        metadataUri: metadataUpload.url,
        metadata
      })
      
      if (loadingToastId) {
        removeToast(loadingToastId)
      }
      
      addToast({
        type: 'success',
        title: 'Transaction Submitted',
        message: `Transaction hash: ${txHash.slice(0, 10)}...`
      })

      // Step 4: Wait for confirmation
      setMintingStep('confirming')
      loadingToastId = addToast({
        type: 'loading',
        title: 'Confirming Transaction',
        message: 'Waiting for blockchain confirmation...',
        duration: 0
      }).id
      
      const confirmed = await pollTransactionStatus(txHash)
      
      if (loadingToastId) {
        removeToast(loadingToastId)
      }
      
      if (confirmed) {
        addToast({
          type: 'success',
          title: 'NFT Minted Successfully!',
          message: `Your NFT "${name}" has been minted successfully!`
        })
        
        // Reset form
        setName('')
        setDescription('')
        setImage(null)
        setPreview('')
        setAttributes([])
      } else {
        addToast({
          type: 'error',
          title: 'Transaction Failed',
          message: 'The transaction could not be confirmed. Please try again.'
        })
      }
      
    } catch (error) {
      console.error('Minting failed:', error)
      
      if (loadingToastId) {
        removeToast(loadingToastId)
      }
      
      addToast({
        type: 'error',
        title: 'Minting Failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    } finally {
      setIsMinting(false)
      setMintingStep(null)
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
              {isMinting ? (
                <span className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>
                    {mintingStep === 'uploading' && 'Uploading...'}
                    {mintingStep === 'minting' && 'Minting...'}
                    {mintingStep === 'confirming' && 'Confirming...'}
                    {!mintingStep && 'Processing...'}
                  </span>
                </span>
              ) : (
                'Mint NFT'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
