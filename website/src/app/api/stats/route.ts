import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    // Get global stats
    const globalStats = await prisma.globalStats.findUnique({
      where: { id: 'global' },
    })

    // Get active games count
    const activeGames = await prisma.game.count({
      where: { isActive: true },
    })

    // Get today's stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayStats = await prisma.gameScore.aggregate({
      where: { createdAt: { gte: today } },
      _count: { id: true },
      _sum: { grepEarned: true },
    })

    // Get total achievements unlocked
    const achievementsUnlocked = await prisma.userAchievement.count({
      where: { unlockedAt: { not: null } },
    })

    return NextResponse.json({
      stats: {
        totalPlayers: globalStats?.totalPlayers || 0,
        totalGrepEarned: globalStats?.totalGrepEarned?.toString() || '0',
        totalGamesPlayed: globalStats?.totalGamesPlayed?.toString() || '0',
        activeGames,
        todayGamesPlayed: todayStats._count.id,
        todayGrepEarned: todayStats._sum.grepEarned || 0,
        achievementsUnlocked,
      },
    })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
