import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { ITEMS } from '@/lib/inventory'
import { TOKEN_ID_TO_ITEM } from '@/lib/nft-items'
import { getContractAddress } from '@/lib/contracts'

const prisma = new PrismaClient()

/**
 * POST /api/inventory/import
 * Import an NFT from on-chain to user's inventory
 *
 * Body:
 * - tokenId: NFT token ID
 * - walletAddress: User's wallet address
 * - balance: On-chain balance (verified by frontend)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tokenId, walletAddress, balance } = body

    if (tokenId === undefined || !walletAddress || balance === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate token ID maps to a known item
    const itemId = TOKEN_ID_TO_ITEM[tokenId]
    if (!itemId) {
      return NextResponse.json(
        { error: 'Unknown token ID' },
        { status: 400 }
      )
    }

    const item = ITEMS.find((i) => i.id === itemId)
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Validate balance is greater than 0
    if (balance <= 0) {
      return NextResponse.json(
        { error: 'No balance for this NFT' },
        { status: 400 }
      )
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    })

    if (!user) {
      // Auto-create user if they don't exist yet
      user = await prisma.user.create({
        data: {
          walletAddress: walletAddress.toLowerCase(),
        },
      })
    }

    // In production, you would verify on-chain ownership here
    // For now, we trust the frontend verification
    // const contractAddress = getContractAddress(8453, 'GREP_ITEMS')
    // const actualBalance = await verifyNFTOwnership(contractAddress, walletAddress, tokenId)
    // if (actualBalance !== balance) {
    //   return NextResponse.json({ error: 'NFT ownership verification failed' }, { status: 403 })
    // }

    // Check if user already has this item in inventory
    const existingItem = await prisma.inventoryItem.findFirst({
      where: {
        userId: user.id,
        itemId,
        tokenId,
      },
    })

    let inventoryItem

    if (existingItem) {
      // Update existing item
      inventoryItem = await prisma.inventoryItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: balance,
          isMinted: true,
        },
      })
    } else {
      // Create new inventory item
      // Fetch metadata if available
      const chainId = 8453 // Base mainnet
      const _contractAddress = getContractAddress(chainId, 'GREP_ITEMS')
      let metadataURI: string | undefined

      // In production, fetch actual token URI from contract
      // For now, use a placeholder
      // const tokenURI = await getTokenURI(contractAddress, tokenId)
      // metadataURI = tokenURI

      inventoryItem = await prisma.inventoryItem.create({
        data: {
          userId: user.id,
          itemId,
          quantity: balance,
          tokenId,
          isMinted: true,
          metadataURI,
        },
      })
    }

    return NextResponse.json({
      success: true,
      item: {
        id: inventoryItem.id,
        itemId,
        item,
        quantity: inventoryItem.quantity,
        tokenId,
        isMinted: true,
      },
      message: 'NFT imported successfully',
    })
  } catch (error) {
    console.error('Error importing NFT:', error)
    return NextResponse.json(
      { error: 'Failed to import NFT' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * GET /api/inventory/import?walletAddress=0x...&tokenId=1
 * Check if a specific NFT is already imported
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const walletAddress = searchParams.get('walletAddress')
    const tokenIdParam = searchParams.get('tokenId')

    if (!walletAddress || !tokenIdParam) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const tokenId = parseInt(tokenIdParam, 10)
    if (isNaN(tokenId)) {
      return NextResponse.json(
        { error: 'Invalid token ID' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    })

    if (!user) {
      return NextResponse.json({ imported: false })
    }

    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        userId: user.id,
        tokenId,
        isMinted: true,
      },
    })

    return NextResponse.json({
      imported: !!inventoryItem,
      item: inventoryItem,
    })
  } catch (error) {
    console.error('Error checking import status:', error)
    return NextResponse.json(
      { error: 'Failed to check import status' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
