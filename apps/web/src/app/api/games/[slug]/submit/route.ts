import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { parseSessionToken } from '@/lib/auth'
import { rateLimiters } from '@/lib/rate-limit'
import { validateGameSubmission, GameSubmissionData } from '@grepcoin/anti-cheat'

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

    // Rate limit by wallet
    const rateCheck = rateLimiters.gameSubmit(session.address)
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many game submissions. Please slow down.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) } }
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
    const { score, streak, duration, sessionStartTime } = await request.json()

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { error: 'Invalid score' },
        { status: 400 }
      )
    }

    // Get previous score and submission history for anti-cheat validation
    const previousScoreRecord = await prisma.gameScore.findFirst({
      where: {
        userId: user.id,
        gameId: game.id,
      },
      orderBy: { createdAt: 'desc' },
    })

    const recentSubmissions = await prisma.gameScore.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { game: true },
    })

    // Prepare anti-cheat validation data
    const validationData: GameSubmissionData = {
      gameSlug: slug,
      userId: user.id,
      score,
      streak,
      duration: duration || 0,
      sessionStartTime,
      previousScore: previousScoreRecord?.score,
      submissionHistory: recentSubmissions.map(s => ({
        timestamp: s.createdAt.getTime(),
        gameSlug: s.game.slug,
        score: s.score,
      })),
    }

    // Run anti-cheat validation
    const validationResult = validateGameSubmission(validationData)

    // Reject if confidence is too low
    if (validationResult.confidence !== undefined && validationResult.confidence < 0.5) {
      console.warn('Suspicious game submission detected:', {
        userId: user.id,
        walletAddress: user.walletAddress,
        gameSlug: slug,
        score,
        confidence: validationResult.confidence,
        errors: validationResult.errors,
        warnings: validationResult.warnings,
      })

      return NextResponse.json(
        {
          error: 'Submission rejected: suspicious activity detected',
          details: validationResult.errors,
        },
        { status: 403 }
      )
    }

    // Log warnings for review even if submission is accepted
    if (validationResult.warnings && validationResult.warnings.length > 0) {
      console.warn('Game submission warnings:', {
        userId: user.id,
        walletAddress: user.walletAddress,
        gameSlug: slug,
        score,
        confidence: validationResult.confidence,
        warnings: validationResult.warnings,
      })
    }

    // Reject if validation failed
    if (!validationResult.valid) {
      console.error('Game submission validation failed:', {
        userId: user.id,
        walletAddress: user.walletAddress,
        gameSlug: slug,
        score,
        errors: validationResult.errors,
      })

      return NextResponse.json(
        {
          error: 'Invalid submission',
          details: validationResult.errors,
        },
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

    // Check for achievements and get newly unlocked ones
    const unlockedAchievements = await checkAchievements(user.id, score, streak || 0, game.slug)

    return NextResponse.json({
      success: true,
      score: gameScore,
      grepEarned,
      multiplier: stakingMultiplier,
      unlockedAchievements,
    })
  } catch (error) {
    console.error('Score submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    )
  }
}

interface UnlockedAchievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: string
  reward: number
}

async function checkAchievements(userId: string, score: number, streak: number, gameSlug: string): Promise<UnlockedAchievement[]> {
  const unlockedAchievements: UnlockedAchievement[] = []

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
      unlockedAchievements.push({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        rarity: achievement.rarity,
        reward: achievement.reward,
      })

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

  return unlockedAchievements
}
