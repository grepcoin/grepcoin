import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { parseSessionToken } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rateCheck = rateLimit(ip, { interval: 60_000, limit: 100 }, 'auction-details')

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const auction = await prisma.auction.findUnique({
      where: { id },
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
        bids: {
          take: 20,
          orderBy: { timestamp: 'desc' },
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
        },
        _count: {
          select: { bids: true },
        },
      },
    })

    if (!auction) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 })
    }

    // Check if current user is participating
    let isParticipating = false
    let isSeller = false
    let isHighestBidder = false

    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value

    if (sessionToken) {
      const session = parseSessionToken(sessionToken)
      if (session) {
        const user = await prisma.user.findUnique({
          where: { walletAddress: session.address },
        })

        if (user) {
          isSeller = auction.sellerId === user.id
          isHighestBidder = auction.highestBidderId === user.id
          isParticipating = auction.bids.some((bid) => bid.bidderId === user.id)
        }
      }
    }

    const formattedAuction = {
      id: auction.id,
      sellerId: auction.sellerId,
      itemId: auction.itemId,
      item: {
        id: auction.itemId,
        name: auction.itemName,
        icon: auction.itemIcon,
        rarity: auction.itemRarity,
        type: auction.itemType,
      },
      startingPrice: auction.startingPrice,
      currentBid: auction.currentBid,
      highestBidderId: auction.highestBidderId,
      startTime: auction.startTime,
      endTime: auction.endTime,
      status: auction.status,
      minIncrement: auction.minIncrement,
      createdAt: auction.createdAt,
      updatedAt: auction.updatedAt,
      seller: auction.seller,
      highestBidder: auction.highestBidder,
      bidCount: auction._count.bids,
      bids: auction.bids.map((bid) => ({
        id: bid.id,
        auctionId: bid.auctionId,
        bidderId: bid.bidderId,
        amount: bid.amount,
        timestamp: bid.timestamp,
        isWinning: bid.isWinning,
        bidder: bid.bidder,
      })),
      isParticipating,
      isSeller,
      isHighestBidder,
    }

    return NextResponse.json({ auction: formattedAuction })
  } catch (error) {
    console.error('Error fetching auction:', error)
    return NextResponse.json({ error: 'Failed to fetch auction' }, { status: 500 })
  }
}
