import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const game = await prisma.game.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { scores: true },
        },
      },
    })

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }

    // Get top scores for this game
    const topScores = await prisma.gameScore.findMany({
      where: { gameId: game.id },
      include: {
        user: {
          select: {
            walletAddress: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: { score: 'desc' },
      take: 10,
    })

    return NextResponse.json({
      game: {
        ...game,
        totalPlays: game._count.scores,
      },
      leaderboard: topScores.map((score, index) => ({
        rank: index + 1,
        walletAddress: score.user.walletAddress,
        username: score.user.username,
        avatar: score.user.avatar,
        score: score.score,
        grepEarned: score.grepEarned,
        createdAt: score.createdAt,
      })),
    })
  } catch (error) {
    console.error('Game fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch game' },
      { status: 500 }
    )
  }
}
