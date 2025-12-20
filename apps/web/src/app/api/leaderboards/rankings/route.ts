import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { parseSessionToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

    const user = await prisma.user.findUnique({
      where: { walletAddress: session.address },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all'
    const nearby = parseInt(searchParams.get('nearby') || '3')

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

    // Get all users with their total GREP earned
    const allUserScores = await prisma.gameScore.groupBy({
      by: ['userId'],
      where: dateFilter,
      _sum: {
        grepEarned: true,
        score: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          grepEarned: 'desc',
        },
      },
    })

    // Find user's rank
    const userRankIndex = allUserScores.findIndex((s) => s.userId === user.id)
    const userRank = userRankIndex === -1 ? null : userRankIndex + 1
    const userStats = allUserScores[userRankIndex]

    // Get nearby players
    const startIndex = Math.max(0, userRankIndex - nearby)
    const endIndex = Math.min(allUserScores.length, userRankIndex + nearby + 1)
    const nearbyScores = allUserScores.slice(startIndex, endIndex)

    // Get user details for nearby players
    const nearbyUserIds = nearbyScores.map((s) => s.userId)
    const nearbyUsers = await prisma.user.findMany({
      where: { id: { in: nearbyUserIds } },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        avatar: true,
      },
    })

    const userMap = new Map(nearbyUsers.map((u) => [u.id, u]))

    const nearbyPlayers = nearbyScores.map((score, index) => {
      const nearbyUser = userMap.get(score.userId)
      return {
        rank: startIndex + index + 1,
        wallet: nearbyUser?.walletAddress || '',
        username: nearbyUser?.username || null,
        avatar: nearbyUser?.avatar || null,
        score: score._sum.score || 0,
        grepEarned: score._sum.grepEarned || 0,
        gamesPlayed: score._count.id,
        isCurrentUser: score.userId === user.id,
      }
    })

    return NextResponse.json({
      userRanking: {
        rank: userRank,
        totalPlayers: allUserScores.length,
        score: userStats?._sum.score || 0,
        grepEarned: userStats?._sum.grepEarned || 0,
        gamesPlayed: userStats?._count.id || 0,
      },
      nearbyPlayers,
      period,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Rankings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rankings' },
      { status: 500 }
    )
  }
}
