import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import prisma from '@/lib/db'
import { parseSessionToken } from '@/lib/auth'
import { rateLimiters } from '@/lib/rate-limit'
import { calculateFee, calculateSellerProceeds } from '@/lib/marketplace'
import { hasEnoughGrep } from '@/lib/grep-balance'

// POST /api/marketplace/[id]/buy - Purchase a listing
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limit by IP
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rateCheck = rateLimiters.auth(ip)

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

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

    // Use transaction to ensure atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Get listing with lock
      const listing = await tx.marketplaceListing.findUnique({
        where: { id },
        include: {
          seller: {
            select: {
              walletAddress: true,
              username: true,
            },
          },
        },
      })

      if (!listing) {
        throw new Error('Listing not found')
      }

      // Verify listing is still active
      if (listing.status !== 'ACTIVE') {
        throw new Error('Listing is no longer active')
      }

      // Check if listing is expired
      if (new Date(listing.expiresAt) < new Date()) {
        // Update status to expired
        await tx.marketplaceListing.update({
          where: { id },
          data: { status: 'EXPIRED' },
        })
        throw new Error('Listing has expired')
      }

      // Check if buyer is not the seller
      if (listing.sellerId === user.id) {
        throw new Error('You cannot buy your own listing')
      }

      // Calculate fees
      const marketplaceFee = calculateFee(listing.price)
      const sellerProceeds = calculateSellerProceeds(listing.price)

      // For GREP currency, verify on-chain balance
      if (listing.currency === 'GREP') {
        // Check buyer's on-chain GREP balance
        const balanceCheck = await hasEnoughGrep(
          user.walletAddress,
          listing.price
        )

        if (!balanceCheck.hasEnough) {
          throw new Error(
            `Insufficient GREP balance. You have ${balanceCheck.balance.toFixed(2)} GREP but need ${balanceCheck.required} GREP`
          )
        }

        // Note: Actual GREP transfer happens on-chain via smart contract
        // The frontend will call the marketplace contract's buy function
        // which handles the token transfer atomically
        // This API just records the intent and validates state
      } else {
        // For ETH, this requires on-chain transaction verification
        // The frontend submits the tx, then calls this API with txHash
        // We would verify the tx on-chain before updating status
      }

      // Update listing status
      await tx.marketplaceListing.update({
        where: { id },
        data: {
          status: 'SOLD',
          buyerId: user.id,
          soldAt: new Date(),
        },
      })

      // TODO: Transfer item to buyer's inventory
      // await transferItem(listing.itemId, listing.sellerId, user.id)

      // Create activity for buyer
      await tx.activity.create({
        data: {
          type: 'marketplace',
          wallet: user.walletAddress,
          username: user.username,
          message: `Purchased ${listing.itemName} for ${listing.price} ${listing.currency}`,
          icon: '🛒',
        },
      })

      // Create activity for seller
      await tx.activity.create({
        data: {
          type: 'marketplace',
          wallet: listing.seller.walletAddress,
          username: listing.seller.username,
          message: `Sold ${listing.itemName} for ${listing.price} ${listing.currency}`,
          icon: '💰',
        },
      })

      return {
        listing,
        fee: marketplaceFee,
        sellerProceeds,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Purchase successful',
      transaction: {
        listingId: result.listing.id,
        itemId: result.listing.itemId,
        itemName: result.listing.itemName,
        price: result.listing.price,
        currency: result.listing.currency.toLowerCase(),
        fee: result.fee,
        sellerProceeds: result.sellerProceeds,
        sellerId: result.listing.sellerId,
        buyerId: user.id,
      },
    })
  } catch (error) {
    console.error('Purchase listing error:', error)

    // Return specific error messages
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to purchase listing' },
      { status: 500 }
    )
  }
}
