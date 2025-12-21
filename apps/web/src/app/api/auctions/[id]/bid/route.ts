import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { parseSessionToken } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import {
  AuctionStatus,
  validateBid,
  shouldExtendAuction,
  calculateExtendedEndTime,
} from '@/lib/auctions'
import { hasEnoughGrep } from '@/lib/grep-balance'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const session = parseSessionToken(sessionToken)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Rate limiting - 20 bids per minute
    const rateCheck = rateLimit(session.address, { interval: 60_000, limit: 20 }, 'auction-bid')

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: session.address },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { amount } = body

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Invalid bid amount' },
        { status: 400 }
      )
    }

    // Fetch auction
    const auction = await prisma.auction.findUnique({
      where: { id },
    })

    if (!auction) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 })
    }

    // Check if auction is active
    if (auction.status !== AuctionStatus.ACTIVE) {
      return NextResponse.json(
        { error: 'Auction is not active' },
        { status: 400 }
      )
    }

    // Check if auction has ended
    if (new Date(auction.endTime).getTime() <= Date.now()) {
      // Update auction status to ENDED
      await prisma.auction.update({
        where: { id },
        data: { status: AuctionStatus.ENDED },
      })

      return NextResponse.json(
        { error: 'Auction has ended' },
        { status: 400 }
      )
    }

    // Can't bid on your own auction
    if (auction.sellerId === user.id) {
      return NextResponse.json(
        { error: 'Cannot bid on your own auction' },
        { status: 400 }
      )
    }

    // Validate bid amount
    const validation = validateBid(
      amount,
      auction.currentBid,
      auction.startingPrice,
      auction.minIncrement
    )

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Verify user has enough GREP balance for the bid
    const balanceCheck = await hasEnoughGrep(session.address, amount)

    if (!balanceCheck.hasEnough) {
      return NextResponse.json(
        {
          error: `Insufficient GREP balance. You have ${balanceCheck.balance.toFixed(2)} GREP but need ${balanceCheck.required} GREP to place this bid`,
        },
        { status: 400 }
      )
    }

    // Check if auction should be extended (bid in last 5 minutes)
    const bidTime = new Date()
    let newEndTime = auction.endTime

    if (shouldExtendAuction(auction.endTime, bidTime)) {
      newEndTime = calculateExtendedEndTime(auction.endTime)
    }

    // Create bid and update auction in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Mark previous winning bid as not winning
      if (auction.highestBidderId) {
        await tx.bid.updateMany({
          where: {
            auctionId: id,
            isWinning: true,
          },
          data: {
            isWinning: false,
          },
        })
      }

      // Create new bid
      const bid = await tx.bid.create({
        data: {
          auctionId: id,
          bidderId: user.id,
          amount,
          isWinning: true,
        },
        include: {
          bidder: {
            select: {
              id: true,
              walletAddress: true,
              username: true,
              avatar: true,
            },
          },
        },
      })

      // Update auction
      const updatedAuction = await tx.auction.update({
        where: { id },
        data: {
          currentBid: amount,
          highestBidderId: user.id,
          endTime: newEndTime,
        },
        include: {
          seller: {
            select: {
              id: true,
              walletAddress: true,
              username: true,
              avatar: true,
            },
          },
          highestBidder: {
            select: {
              id: true,
              walletAddress: true,
              username: true,
              avatar: true,
            },
          },
        },
      })

      return { bid, auction: updatedAuction }
    })

    // TODO: In production, notify outbid users
    // This could be done via WebSocket, email, or push notification

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'auction_bid',
        wallet: session.address,
        username: user.username,
        value: amount,
        message: `Placed a bid of ${amount} GREP on ${auction.itemName}`,
        icon: '🔨',
      },
    })

    return NextResponse.json({
      success: true,
      bid: result.bid,
      auction: result.auction,
      extended: newEndTime.getTime() !== auction.endTime.getTime(),
    })
  } catch (error) {
    console.error('Error placing bid:', error)
    return NextResponse.json({ error: 'Failed to place bid' }, { status: 500 })
  }
}
