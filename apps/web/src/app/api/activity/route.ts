import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

  try {
    // Fetch real game scores from database
    const recentScores = await prisma.gameScore.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
          }
        },
        game: {
          select: {
            slug: true,
            name: true,
            icon: true,
          }
        }
      }
    })

    const activities = recentScores.map((score) => {
      return {
        id: score.id,
        type: 'game_played',
        wallet: score.user?.walletAddress || '',
        username: score.user?.username || null,
        game: score.game?.slug || '',
        value: score.grepEarned,
        message: `scored ${score.score.toLocaleString()} in ${score.game?.name || 'a game'} (+${score.grepEarned} GREP)`,
        icon: score.game?.icon || '🎮',
        timestamp: score.createdAt.toISOString(),
      }
    })

    return NextResponse.json({
      activities,
      hasMore: false,
    })
  } catch (error) {
    console.error('Activity API error:', error)
    return NextResponse.json({
      activities: [],
      hasMore: false,
    })
  }
}
