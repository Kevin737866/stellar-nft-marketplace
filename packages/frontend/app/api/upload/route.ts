import { NextRequest, NextResponse } from 'next/server'
import { NFTStorage } from 'nft.storage'

const NFT_STORAGE_TOKEN = process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN

if (!NFT_STORAGE_TOKEN) {
  console.warn('NFT_STORAGE_API_KEY not found in environment variables')
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max size is 10MB' }, { status: 400 })
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    if (!NFT_STORAGE_TOKEN) {
      // Fallback to mock response for development
      const mockCid = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'
      return NextResponse.json({
        success: true,
        cid: mockCid,
        url: `https://ipfs.io/ipfs/${mockCid}`
      })
    }

    const nftstorage = new NFTStorage({ token: NFT_STORAGE_TOKEN })
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)
    
    // Upload to NFT.Storage
    const cid = await nftstorage.storeBlob(new Blob([buffer], { type: file.type }))
    
    return NextResponse.json({
      success: true,
      cid: cid.toString(),
      url: `https://ipfs.io/ipfs/${cid}`
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file to IPFS' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { metadata } = await request.json()
    
    if (!metadata) {
      return NextResponse.json({ error: 'No metadata provided' }, { status: 400 })
    }

    if (!NFT_STORAGE_TOKEN) {
      // Fallback to mock response for development
      const mockCid = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'
      return NextResponse.json({
        success: true,
        cid: mockCid,
        url: `https://ipfs.io/ipfs/${mockCid}`
      })
    }

    const nftstorage = new NFTStorage({ token: NFT_STORAGE_TOKEN })
    
    // Upload metadata JSON to NFT.Storage
    const cid = await nftstorage.storeBlob(new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' }))
    
    return NextResponse.json({
      success: true,
      cid: cid.toString(),
      url: `https://ipfs.io/ipfs/${cid}`
    })

  } catch (error) {
    console.error('Metadata upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload metadata to IPFS' },
      { status: 500 }
    )
  }
}
