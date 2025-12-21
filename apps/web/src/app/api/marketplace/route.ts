import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import prisma from '@/lib/db'
import { parseSessionToken } from '@/lib/auth'
import { rateLimiters } from '@/lib/rate-limit'
import { DEFAULT_LISTING_DURATION, validatePrice } from '@/lib/marketplace'
import { ITEMS } from '@/lib/inventory'

// GET /api/marketplace - Get all active listings with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse filters
    const category = searchParams.get('category') || undefined
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined
    const currency = (searchParams.get('currency') as 'GREP' | 'ETH') || undefined
    const sortBy = searchParams.get('sortBy') || 'date_desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where clause
    const where: any = {
      status: 'ACTIVE',
      expiresAt: { gt: new Date() },
    }

    if (category) {
      where.itemType = category
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    if (currency) {
      where.currency = currency
    }

    // Build orderBy clause
    let orderBy: any = {}
    switch (sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'date_asc':
        orderBy = { listedAt: 'asc' }
        break
      case 'date_desc':
      default:
        orderBy = { listedAt: 'desc' }
        break
    }

    // Get total count for pagination
    const total = await prisma.marketplaceListing.count({ where })

    // Get listings
    const listings = await prisma.marketplaceListing.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        seller: {
          select: {
            walletAddress: true,
            username: true,
          },
        },
      },
    })

    // Transform to API format
    const formattedListings = listings.map((listing) => ({
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
    }))

    return NextResponse.json({
      listings: formattedListings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Marketplace GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch marketplace listings' },
      { status: 500 }
    )
  }
}

// POST /api/marketplace - Create a new listing
export async function POST(request: NextRequest) {
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

    // Parse request body
    const { itemId, price, currency } = await request.json()

    // Validate inputs
    if (!itemId || !price || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields: itemId, price, currency' },
        { status: 400 }
      )
    }

    // Validate price
    const priceValidation = validatePrice(price, currency)
    if (!priceValidation.valid) {
      return NextResponse.json(
        { error: priceValidation.error },
        { status: 400 }
      )
    }

    // Get item details
    const item = ITEMS.find((i) => i.id === itemId)
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Check if item is tradeable
    if (!item.tradeable) {
      return NextResponse.json(
        { error: 'This item cannot be traded' },
        { status: 400 }
      )
    }

    // TODO: In a real implementation, verify the user owns this item
    // For now, we'll just create the listing

    // Calculate expiration date (7 days from now)
    const expiresAt = new Date(Date.now() + DEFAULT_LISTING_DURATION)

    // Create listing
    const listing = await prisma.marketplaceListing.create({
      data: {
        sellerId: user.id,
        itemId: item.id,
        itemName: item.name,
        itemType: item.type,
        itemRarity: item.rarity,
        itemIcon: item.icon,
        price,
        currency: currency.toUpperCase(),
        expiresAt,
      },
      include: {
        seller: {
          select: {
            walletAddress: true,
            username: true,
          },
        },
      },
    })

    // Create activity
    await prisma.activity.create({
      data: {
        type: 'marketplace',
        wallet: user.walletAddress,
        username: user.username,
        message: `Listed ${item.name} for ${price} ${currency.toUpperCase()}`,
        icon: '🏪',
      },
    })

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
      },
    })
  } catch (error) {
    console.error('Create listing error:', error)
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    )
  }
}
