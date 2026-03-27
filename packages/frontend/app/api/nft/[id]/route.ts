import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    if (!id) {
      return NextResponse.json({ error: 'NFT ID is required' }, { status: 400 })
    }

    // Fetch metadata from IPFS
    const response = await fetch(`https://ipfs.io/ipfs/${id}`)
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch NFT metadata' }, { status: 404 })
    }

    const metadata = await response.json()
    
    return NextResponse.json({
      success: true,
      metadata
    })

  } catch (error) {
    console.error('Fetch NFT metadata error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch NFT metadata' },
      { status: 500 }
    )
  }
}
