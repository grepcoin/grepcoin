import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')?.value
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = parseSessionToken(sessionToken)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find user by wallet address
  const user = await prisma.user.findUnique({
    where: { walletAddress: session.address }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Get all games
  const games = await prisma.game.findMany()

  // Get user's stats per game
  const gameStats = await Promise.all(
    games.map(async (game) => {
      const scores = await prisma.gameScore.findMany({
        where: { userId: user.id, gameId: game.id }
      })

      if (scores.length === 0) return null

      const totalPlays = scores.length
      const highScore = Math.max(...scores.map(s => s.score))
      const avgScore = scores.reduce((a, b) => a + b.score, 0) / totalPlays
      const totalGrep = scores.reduce((a, b) => a + b.grepEarned, 0)

      // Calculate rank
      const betterScores = await prisma.gameScore.groupBy({
        by: ['userId'],
        where: { gameId: game.id },
        _max: { score: true }
      })

      const rank = betterScores.filter(s => (s._max.score || 0) > highScore).length + 1
      const percentile = Math.round((1 - rank / betterScores.length) * 100)

      return {
        gameSlug: game.slug,
        gameName: game.name,
        totalPlays,
        highScore,
        avgScore,
        totalGrep,
        lastPlayed: scores[scores.length - 1].createdAt,
        rank,
        percentile
      }
    })
  )

  // Get overall stats
  const allScores = await prisma.gameScore.findMany({
    where: { userId: user.id }
  })

  const dailyStats = await prisma.dailyStats.findFirst({
    where: { userId: user.id },
    orderBy: { date: 'desc' }
  })

  return NextResponse.json({
    games: gameStats.filter(Boolean),
    overall: {
      totalPlays: allScores.length,
      totalGrep: allScores.reduce((a, b) => a + b.grepEarned, 0),
      gamesPlayed: new Set(allScores.map(s => s.gameId)).size,
      bestStreak: dailyStats?.bestStreak || 0,
      averageScore: allScores.length ? allScores.reduce((a, b) => a + b.score, 0) / allScores.length : 0
    }
  })
}
