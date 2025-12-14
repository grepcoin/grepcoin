import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params
    const walletAddress = wallet.toLowerCase()

    const user = await prisma.user.findUnique({
      where: { walletAddress },
      include: {
        stakes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            gameScores: true,
            achievements: {
              where: { unlockedAt: { not: null } },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get total GREP earned
    const totalGrep = await prisma.gameScore.aggregate({
      where: { userId: user.id },
      _sum: { grepEarned: true },
    })

    // Get best scores per game
    const gameScores = await prisma.gameScore.groupBy({
      by: ['gameId'],
      where: { userId: user.id },
      _max: {
        score: true,
        streak: true,
      },
      _count: { id: true },
    })

    // Get game details
    const games = await prisma.game.findMany()
    const gameMap = new Map(games.map((g) => [g.id, g]))

    const gameStats = gameScores.map((gs) => ({
      game: gameMap.get(gs.gameId)?.name || 'Unknown',
      gameSlug: gameMap.get(gs.gameId)?.slug,
      highScore: gs._max.score || 0,
      bestStreak: gs._max.streak || 0,
      gamesPlayed: gs._count.id,
    }))

    return NextResponse.json({
      user: {
        walletAddress: user.walletAddress,
        username: user.username,
        avatar: user.avatar,
        createdAt: user.createdAt,
        stakingTier: user.stakes[0]?.tier || 'none',
        stakingMultiplier: user.stakes[0]?.multiplier || 1,
        stats: {
          totalGrepEarned: totalGrep._sum.grepEarned || 0,
          gamesPlayed: user._count.gameScores,
          achievementsUnlocked: user._count.achievements,
        },
        gameStats,
      },
    })
  } catch (error) {
    console.error('User fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}
