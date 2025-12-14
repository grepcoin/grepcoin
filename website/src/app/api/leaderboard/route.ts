import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const period = searchParams.get('period') || 'all' // all, daily, weekly

    let dateFilter = {}
    if (period === 'daily') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      dateFilter = { createdAt: { gte: today } }
    } else if (period === 'weekly') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      dateFilter = { createdAt: { gte: weekAgo } }
    }

    // Aggregate scores by user
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
      _max: {
        streak: true,
      },
      orderBy: {
        _sum: {
          grepEarned: 'desc',
        },
      },
      take: limit,
      skip: offset,
    })

    // Get user details
    const userIds = userScores.map((s) => s.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: {
        stakes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    const leaderboard = userScores.map((score, index) => {
      const user = userMap.get(score.userId)
      return {
        rank: offset + index + 1,
        walletAddress: user?.walletAddress || '',
        username: user?.username,
        avatar: user?.avatar,
        totalScore: score._sum.score || 0,
        totalGrep: score._sum.grepEarned || 0,
        gamesPlayed: score._count.id,
        bestStreak: score._max.streak || 0,
        stakingTier: user?.stakes[0]?.tier || 'none',
      }
    })

    return NextResponse.json({ leaderboard, period })
  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
