import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET fundraising stats
export async function GET() {
  try {
    // Get or create fundraise stats
    let stats = await prisma.fundraiseStats.findUnique({
      where: { id: 'campaign' },
    })

    // If no stats exist, create default
    if (!stats) {
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 30) // 30 days from now

      stats = await prisma.fundraiseStats.create({
        data: {
          id: 'campaign',
          totalRaised: 0,
          backerCount: 0,
          goalAmount: 100000,
          endDate,
          isActive: true,
        },
      })
    }

    // Get recent backers (non-anonymous only)
    const recentBackers = await prisma.backer.findMany({
      where: {
        status: 'confirmed',
        anonymous: false,
      },
      orderBy: { confirmedAt: 'desc' },
      take: 10,
      select: {
        name: true,
        tier: true,
        amount: true,
        message: true,
        confirmedAt: true,
      },
    })

    // Get tier breakdown
    const tierBreakdown = await prisma.backer.groupBy({
      by: ['tier'],
      where: { status: 'confirmed' },
      _count: { id: true },
      _sum: { amount: true },
    })

    // Calculate days remaining
    const now = new Date()
    const daysRemaining = Math.max(
      0,
      Math.ceil((stats.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    )

    // Calculate progress percentage
    const progressPercent = Math.min(100, Math.round((stats.totalRaised / stats.goalAmount) * 100))

    return NextResponse.json({
      campaign: {
        totalRaised: stats.totalRaised,
        backerCount: stats.backerCount,
        goalAmount: stats.goalAmount,
        progressPercent,
        daysRemaining,
        isActive: stats.isActive,
        startDate: stats.startDate.toISOString(),
        endDate: stats.endDate.toISOString(),
      },
      recentBackers,
      tierBreakdown: tierBreakdown.map(t => ({
        tier: t.tier,
        count: t._count.id,
        total: t._sum.amount || 0,
      })),
    })
  } catch (error) {
    console.error('Fundraise stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fundraise stats' },
      { status: 500 }
    )
  }
}

// POST new backer registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet, email, name, tier, amount, currency, message, anonymous } = body

    // Validate required fields
    if (!tier || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: tier, amount' },
        { status: 400 }
      )
    }

    // Validate tier
    const validTiers = ['early-bird', 'builder', 'partner', 'genesis']
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier' },
        { status: 400 }
      )
    }

    // Validate tier minimum amounts
    const tierMinimums: Record<string, number> = {
      'early-bird': 25,
      'builder': 100,
      'partner': 500,
      'genesis': 2500,
    }

    if (amount < tierMinimums[tier]) {
      return NextResponse.json(
        { error: `Minimum amount for ${tier} tier is $${tierMinimums[tier]}` },
        { status: 400 }
      )
    }

    // Create backer record
    const backer = await prisma.backer.create({
      data: {
        wallet: wallet || null,
        email: email || null,
        name: name || null,
        tier,
        amount,
        currency: currency || 'USD',
        message: message || null,
        anonymous: anonymous || false,
        status: 'pending',
      },
    })

    return NextResponse.json({
      success: true,
      backerId: backer.id,
      message: 'Registration received. Please complete payment to confirm.',
    })
  } catch (error) {
    console.error('Backer registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register backer' },
      { status: 500 }
    )
  }
}
