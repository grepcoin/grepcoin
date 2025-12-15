import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { parseSessionToken } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Check authentication
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const session = parseSessionToken(sessionToken)
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { walletAddress: session.address },
      include: {
        stakes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get game
    const game = await prisma.game.findUnique({
      where: { slug },
    })

    if (!game || !game.isActive) {
      return NextResponse.json(
        { error: 'Game not found or inactive' },
        { status: 404 }
      )
    }

    // Parse score data
    const { score, streak, duration } = await request.json()

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { error: 'Invalid score' },
        { status: 400 }
      )
    }

    // Calculate GREP reward based on score and staking multiplier
    const baseReward = Math.floor(
      game.minReward + (score / 1000) * (game.maxReward - game.minReward)
    )
    const stakingMultiplier = user.stakes[0]?.multiplier || 1
    const grepEarned = Math.floor(baseReward * stakingMultiplier)

    // Create game score
    const gameScore = await prisma.gameScore.create({
      data: {
        userId: user.id,
        gameId: game.id,
        score,
        grepEarned,
        duration: duration || 0,
        streak: streak || 0,
        multiplier: stakingMultiplier,
      },
    })

    // Update daily stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get current daily stats to check best streak
    const currentStats = await prisma.dailyStats.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    })

    const newBestStreak = Math.max(currentStats?.bestStreak || 0, streak || 0)

    await prisma.dailyStats.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      update: {
        grepEarned: { increment: grepEarned },
        gamesPlayed: { increment: 1 },
        bestStreak: newBestStreak,
        playsUsed: { increment: 1 },
      },
      create: {
        userId: user.id,
        date: today,
        grepEarned,
        gamesPlayed: 1,
        bestStreak: streak || 0,
        playsUsed: 1,
      },
    })

    // Update global stats
    await prisma.globalStats.upsert({
      where: { id: 'global' },
      update: {
        totalGrepEarned: { increment: grepEarned },
        totalGamesPlayed: { increment: 1 },
      },
      create: {
        id: 'global',
        totalGrepEarned: BigInt(grepEarned),
        totalGamesPlayed: BigInt(1),
      },
    })

    // Create activity
    await prisma.activity.create({
      data: {
        type: 'score',
        wallet: user.walletAddress,
        username: user.username,
        game: game.name,
        value: score,
        message: `scored ${score.toLocaleString()} in ${game.name}`,
        icon: '🎮',
      },
    })

    // Check for achievements
    await checkAchievements(user.id, score, streak || 0, game.slug)

    return NextResponse.json({
      success: true,
      score: gameScore,
      grepEarned,
      multiplier: stakingMultiplier,
    })
  } catch (error) {
    console.error('Score submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    )
  }
}

async function checkAchievements(userId: string, score: number, streak: number, gameSlug: string) {
  // Get user's achievement progress
  const achievements = await prisma.achievement.findMany()

  for (const achievement of achievements) {
    // Skip if already unlocked
    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    })

    if (existing?.unlockedAt) continue

    // Check if game-specific achievement applies
    if (achievement.gameSlug && achievement.gameSlug !== gameSlug) continue

    let shouldUnlock = false
    let progress = 0

    switch (achievement.type) {
      case 'streak':
        progress = streak
        shouldUnlock = achievement.target ? streak >= achievement.target : false
        break
      case 'score':
        // Cumulative score tracking would need more complex logic
        progress = score
        shouldUnlock = achievement.target ? score >= achievement.target : false
        break
      case 'games':
        // Count total games played
        const gamesPlayed = await prisma.gameScore.count({
          where: { userId },
        })
        progress = gamesPlayed
        shouldUnlock = achievement.target ? gamesPlayed >= achievement.target : false
        break
    }

    // Update or create achievement progress
    await prisma.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
      update: {
        progress,
        unlockedAt: shouldUnlock ? new Date() : undefined,
      },
      create: {
        userId,
        achievementId: achievement.id,
        progress,
        unlockedAt: shouldUnlock ? new Date() : undefined,
      },
    })

    // Create activity for unlocked achievement
    if (shouldUnlock) {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (user) {
        await prisma.activity.create({
          data: {
            type: 'achievement',
            wallet: user.walletAddress,
            username: user.username,
            value: achievement.reward,
            message: `unlocked "${achievement.name}" achievement`,
            icon: achievement.icon,
          },
        })
      }
    }
  }
}
