import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { ITEMS } from '@/lib/inventory'
import { generateItemMetadata, uploadToIPFS, ITEM_TO_TOKEN_ID } from '@/lib/nft-items'
import { getContractAddress } from '@/lib/contracts'

const prisma = new PrismaClient()

/**
 * POST /api/inventory/mint
 * Mint an inventory item as an NFT
 *
 * Body:
 * - itemId: Item ID to mint
 * - walletAddress: User's wallet address
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { itemId, walletAddress } = body

    if (!itemId || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate item exists
    const item = ITEMS.find((i) => i.id === itemId)
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Check if item is tradeable (only tradeable items can be minted as NFTs)
    if (!item.tradeable) {
      return NextResponse.json(
        { error: 'This item cannot be minted as an NFT' },
        { status: 400 }
      )
    }

    // Find user by wallet address
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user owns this item in their inventory
    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        userId: user.id,
        itemId,
        quantity: { gte: 1 },
        isMinted: false, // Only unminted items can be minted
      },
    })

    if (!inventoryItem) {
      return NextResponse.json(
        { error: 'Item not found in inventory or already minted' },
        { status: 404 }
      )
    }

    // Generate NFT metadata
    const metadata = generateItemMetadata(item)

    // Upload metadata to IPFS (in production, this would be a real upload)
    const { url } = await uploadToIPFS(metadata)

    // Get token ID for this item type
    const tokenId = ITEM_TO_TOKEN_ID[itemId]
    if (!tokenId) {
      return NextResponse.json(
        { error: 'Invalid item for minting' },
        { status: 400 }
      )
    }

    // Get contract address (assuming Base mainnet for now)
    const chainId = 8453 // Base mainnet
    const contractAddress = getContractAddress(chainId, 'GREP_ITEMS')

    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      return NextResponse.json(
        { error: 'NFT contract not deployed yet' },
        { status: 503 }
      )
    }

    // Create NFT mint record
    const nftMint = await prisma.nFTMint.create({
      data: {
        userId: user.id,
        inventoryId: inventoryItem.id,
        tokenId,
        contractAddress,
        chainId,
        metadataURI: url,
        status: 'pending',
      },
    })

    // Update inventory item
    await prisma.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: {
        isMinted: true,
        tokenId,
        metadataURI: url,
      },
    })

    // In production, you would:
    // 1. Call the smart contract's mint function from a backend wallet
    // 2. Wait for transaction confirmation
    // 3. Update the NFTMint record with the txHash and status
    //
    // For now, we return the mint data for the frontend to handle
    // The frontend can use wagmi to call the contract directly

    return NextResponse.json({
      success: true,
      mint: {
        id: nftMint.id,
        tokenId,
        metadataURI: url,
        metadata,
        contractAddress,
        chainId,
      },
      message: 'Item prepared for minting. Please confirm the transaction in your wallet.',
    })
  } catch (error) {
    console.error('Error minting NFT:', error)
    return NextResponse.json(
      { error: 'Failed to mint NFT' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * GET /api/inventory/mint?walletAddress=0x...
 * Get user's pending NFT mints
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Missing wallet address' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const pendingMints = await prisma.nFTMint.findMany({
      where: {
        userId: user.id,
        status: 'pending',
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ mints: pendingMints })
  } catch (error) {
    console.error('Error fetching pending mints:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending mints' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
