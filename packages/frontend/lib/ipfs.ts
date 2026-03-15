import { NFTStorage } from 'nft.storage'

const NFT_STORAGE_TOKEN = process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN

if (!NFT_STORAGE_TOKEN) {
  console.warn('NFT_STORAGE_TOKEN environment variable is not set')
}

const nftstorage = new NFTStorage({ token: NFT_STORAGE_TOKEN || '' })

export interface NFTMetadata {
  name: string
  description: string
  image: File
  attributes?: { trait_type: string; value: string }[]
}

export async function uploadToIPFS(metadata: NFTMetadata): Promise<string> {
  try {
    // Upload image first
    const imageCid = await nftstorage.storeBlob(metadata.image)
    const imageUrl = `https://ipfs.io/ipfs/${imageCid}`

    // Create metadata object
    const metadataObj = {
      name: metadata.name,
      description: metadata.description,
      image: imageUrl,
      attributes: metadata.attributes || [],
    }

    // Upload metadata as JSON
    const metadataBlob = new Blob([JSON.stringify(metadataObj)], { type: 'application/json' })
    const metadataCid = await nftstorage.storeBlob(metadataBlob)

    return `https://ipfs.io/ipfs/${metadataCid}`
  } catch (error) {
    console.error('Error uploading to IPFS:', error)
    throw new Error('Failed to upload to IPFS')
  }
}

export async function uploadImageToIPFS(image: File): Promise<string> {
  try {
    const cid = await nftstorage.storeBlob(image)
    return `https://ipfs.io/ipfs/${cid}`
  } catch (error) {
    console.error('Error uploading image to IPFS:', error)
    throw new Error('Failed to upload image to IPFS')
  }
}

export function getIPFSUrl(cid: string): string {
  return `https://ipfs.io/ipfs/${cid}`
}
