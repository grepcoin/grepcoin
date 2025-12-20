import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const period = searchParams.get('period') || 'all' // all, weekly, daily

    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      )
    }

    // Calculate date filter based on period
    let dateFilter = {}
    if (period === 'daily') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      dateFilter = { createdAt: { gte: today } }
    } else if (period === 'weekly') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      weekAgo.setHours(0, 0, 0, 0)
      dateFilter = { createdAt: { gte: weekAgo } }
    }

    // Aggregate total GREP earned by user
    const userScores = await prisma.gameScore.groupBy({
      by: ['userId'],
      where: dateFilter,
      _sum: {
        score: true,
        grepEarned: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          grepEarned: 'desc',
        },
      },
      take: limit,
    })

    // Get user details
    const userIds = userScores.map((s) => s.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        avatar: true,
      },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    // Build leaderboard response
    const leaderboard = userScores.map((score, index) => {
      const user = userMap.get(score.userId)
      return {
        rank: index + 1,
        wallet: user?.walletAddress || '',
        username: user?.username || null,
        avatar: user?.avatar || null,
        score: score._sum.score || 0,
        grepEarned: score._sum.grepEarned || 0,
        gamesPlayed: score._count.id,
      }
    })

    return NextResponse.json({
      leaderboard,
      period,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
