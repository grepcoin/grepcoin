import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { parseSessionToken } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { AuctionStatus } from '@/lib/auctions'
import { ITEMS } from '@/lib/inventory'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rateCheck = rateLimit(ip, { interval: 60_000, limit: 100 }, 'auctions-list')

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as AuctionStatus | null
    const endingSoon = searchParams.get('endingSoon') === 'true'
    const itemType = searchParams.get('itemType')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}

    // Filter by status (default to ACTIVE)
    if (status) {
      where.status = status
    } else {
      where.status = AuctionStatus.ACTIVE
    }

    // Filter by item type
    if (itemType) {
      where.itemType = itemType
    }

    // Filter ending soon (within 1 hour)
    if (endingSoon) {
      const oneHourFromNow = new Date(Date.now() + 3600000)
      where.endTime = {
        lte: oneHourFromNow,
        gt: new Date(),
      }
    }

    const auctions = await prisma.auction.findMany({
      where,
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
        _count: {
          select: { bids: true },
        },
      },
      orderBy: endingSoon
        ? { endTime: 'asc' }
        : [{ status: 'asc' }, { endTime: 'asc' }],
      take: limit,
    })

    const formattedAuctions = auctions.map((auction) => ({
      id: auction.id,
      sellerId: auction.sellerId,
      itemId: auction.itemId,
      item: {
        id: auction.itemId,
        name: auction.itemName,
        icon: auction.itemIcon,
        rarity: auction.itemRarity,
      },
      startingPrice: auction.startingPrice,
      currentBid: auction.currentBid,
      highestBidderId: auction.highestBidderId,
      startTime: auction.startTime,
      endTime: auction.endTime,
      status: auction.status,
      minIncrement: auction.minIncrement,
      createdAt: auction.createdAt,
      seller: auction.seller,
      highestBidder: auction.highestBidder,
      bidCount: auction._count.bids,
    }))

    return NextResponse.json({ auctions: formattedAuctions })
  } catch (error) {
    console.error('Error fetching auctions:', error)
    return NextResponse.json({ error: 'Failed to fetch auctions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const session = parseSessionToken(sessionToken)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Rate limiting
    const rateCheck = rateLimit(session.address, { interval: 60_000, limit: 10 }, 'auction-create')

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
    const { itemId, startingPrice, duration, minIncrement } = body

    // Validation
    if (!itemId || !startingPrice || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (startingPrice < 100) {
      return NextResponse.json(
        { error: 'Starting price must be at least 100 GREP' },
        { status: 400 }
      )
    }

    if (duration < 3600 || duration > 604800) {
      return NextResponse.json(
        { error: 'Duration must be between 1 hour and 7 days' },
        { status: 400 }
      )
    }

    // Find item details
    const item = ITEMS.find((i) => i.id === itemId)
    if (!item) {
      return NextResponse.json({ error: 'Invalid item' }, { status: 400 })
    }

    // Check if item is tradeable
    if (!item.tradeable) {
      return NextResponse.json(
        { error: 'This item is not tradeable' },
        { status: 400 }
      )
    }

    const startTime = new Date()
    const endTime = new Date(startTime.getTime() + duration * 1000)

    const auction = await prisma.auction.create({
      data: {
        sellerId: user.id,
        itemId: item.id,
        itemName: item.name,
        itemType: item.type,
        itemRarity: item.rarity,
        itemIcon: item.icon,
        startingPrice,
        currentBid: 0,
        startTime,
        endTime,
        status: AuctionStatus.ACTIVE,
        minIncrement: minIncrement || 100,
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
      },
    })

    return NextResponse.json({ auction }, { status: 201 })
  } catch (error) {
    console.error('Error creating auction:', error)
    return NextResponse.json({ error: 'Failed to create auction' }, { status: 500 })
  }
}
