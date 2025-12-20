import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ game: string }> }
) {
  try {
    const { game } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const period = searchParams.get('period') || 'all'

    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      )
    }

    // Find game by slug
    const gameRecord = await prisma.game.findUnique({
      where: { slug: game },
    })

    if (!gameRecord) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Calculate date filter based on period
    let dateFilter: { createdAt?: { gte: Date } } = {}
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

    // Get top scores for this game
    const topScores = await prisma.gameScore.findMany({
      where: {
        gameId: gameRecord.id,
        ...dateFilter,
      },
      orderBy: { score: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    // Build leaderboard response
    const leaderboard = topScores.map((score, index) => ({
      rank: index + 1,
      wallet: score.user.walletAddress,
      username: score.user.username,
      avatar: score.user.avatar,
      score: score.score,
      grepEarned: score.grepEarned,
      playedAt: score.createdAt,
    }))

    return NextResponse.json({
      game: {
        slug: gameRecord.slug,
        name: gameRecord.name,
      },
      leaderboard,
      period,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Game leaderboard fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch game leaderboard' },
      { status: 500 }
    )
  }
}
