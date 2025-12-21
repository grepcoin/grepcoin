import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { parseSessionToken } from '@/lib/auth'

// GET /api/marketplace/[id] - Get a single listing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const listing = await prisma.marketplaceListing.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            walletAddress: true,
            username: true,
          },
        },
        buyer: {
          select: {
            walletAddress: true,
            username: true,
          },
        },
      },
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      listing: {
        id: listing.id,
        sellerId: listing.sellerId,
        sellerUsername: listing.seller.username,
        sellerWallet: listing.seller.walletAddress,
        itemId: listing.itemId,
        itemName: listing.itemName,
        itemType: listing.itemType,
        itemRarity: listing.itemRarity,
        itemIcon: listing.itemIcon,
        price: listing.price,
        currency: listing.currency.toLowerCase(),
        status: listing.status.toLowerCase(),
        listedAt: listing.listedAt,
        expiresAt: listing.expiresAt,
        soldAt: listing.soldAt,
        buyerId: listing.buyerId,
        buyerUsername: listing.buyer?.username,
      },
    })
  } catch (error) {
    console.error('Get listing error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    )
  }
}

// DELETE /api/marketplace/[id] - Cancel a listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user from session
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const session = parseSessionToken(sessionToken)
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { walletAddress: session.address },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const { id } = await params

    // Get listing
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id },
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Check if user is the seller
    if (listing.sellerId !== user.id) {
      return NextResponse.json(
        { error: 'You can only cancel your own listings' },
        { status: 403 }
      )
    }

    // Check if listing is still active
    if (listing.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Can only cancel active listings' },
        { status: 400 }
      )
    }

    // Update listing status to cancelled
    await prisma.marketplaceListing.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    // TODO: Return the item to user's inventory

    // Create activity
    await prisma.activity.create({
      data: {
        type: 'marketplace',
        wallet: user.walletAddress,
        username: user.username,
        message: `Cancelled listing for ${listing.itemName}`,
        icon: '❌',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Listing cancelled successfully',
    })
  } catch (error) {
    console.error('Cancel listing error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel listing' },
      { status: 500 }
    )
  }
}
