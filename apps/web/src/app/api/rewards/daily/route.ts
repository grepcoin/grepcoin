import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { cookies } from 'next/headers'

// Daily reward schedule (day 1-7)
const DAILY_REWARDS = [10, 15, 25, 40, 60, 85, 150]
const DAY_7_BONUS = 50

// GET - Get user's daily reward status
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session_id')?.value

    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get session and user
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: session.walletAddress },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's recent daily rewards to calculate streak
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    // Check if already claimed today
    const todayClaim = await prisma.dailyReward.findFirst({
      where: {
        userId: user.id,
        claimedAt: { gte: today },
      },
    })

    if (todayClaim) {
      // Already claimed today
      const nextClaimTime = new Date(today.getTime() + 24 * 60 * 60 * 1000)
      return NextResponse.json({
        canClaim: false,
        currentDay: todayClaim.day,
        nextReward: DAILY_REWARDS[todayClaim.day % 7],
        nextClaimTime: nextClaimTime.toISOString(),
        streak: todayClaim.day,
        todayReward: todayClaim.reward,
      })
    }

    // Check yesterday's claim to determine streak
    const yesterdayClaim = await prisma.dailyReward.findFirst({
      where: {
        userId: user.id,
        claimedAt: {
          gte: yesterday,
          lt: today,
        },
      },
      orderBy: { claimedAt: 'desc' },
    })

    let currentStreak = 0
    if (yesterdayClaim) {
      // Continue streak
      currentStreak = yesterdayClaim.day
    }

    // Next day in the 7-day cycle
    const nextDay = (currentStreak % 7) + 1
    const reward = DAILY_REWARDS[nextDay - 1] + (nextDay === 7 ? DAY_7_BONUS : 0)

    return NextResponse.json({
      canClaim: true,
      currentDay: currentStreak,
      nextDay,
      nextReward: reward,
      streak: currentStreak,
      schedule: DAILY_REWARDS.map((r, i) => ({
        day: i + 1,
        reward: r + (i === 6 ? DAY_7_BONUS : 0),
        claimed: i < currentStreak % 7,
      })),
    })
  } catch (error) {
    console.error('Daily rewards GET error:', error)
    return NextResponse.json(
      { error: 'Failed to get daily rewards status' },
      { status: 500 }
    )
  }
}

// POST - Claim daily reward
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session_id')?.value

    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get session and user
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: session.walletAddress },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already claimed today
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    const todayClaim = await prisma.dailyReward.findFirst({
      where: {
        userId: user.id,
        claimedAt: { gte: today },
      },
    })

    if (todayClaim) {
      return NextResponse.json(
        { error: 'Already claimed today', nextClaimTime: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString() },
        { status: 400 }
      )
    }

    // Check yesterday's claim to determine streak
    const yesterdayClaim = await prisma.dailyReward.findFirst({
      where: {
        userId: user.id,
        claimedAt: {
          gte: yesterday,
          lt: today,
        },
      },
      orderBy: { claimedAt: 'desc' },
    })

    let currentStreak = 0
    if (yesterdayClaim) {
      currentStreak = yesterdayClaim.day
    }

    // Calculate reward
    const nextDay = (currentStreak % 7) + 1
    const reward = DAILY_REWARDS[nextDay - 1] + (nextDay === 7 ? DAY_7_BONUS : 0)

    // Create daily reward claim
    const dailyReward = await prisma.dailyReward.create({
      data: {
        userId: user.id,
        day: nextDay,
        reward,
      },
    })

    // Update daily stats
    await prisma.dailyStats.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      update: {
        grepEarned: { increment: reward },
      },
      create: {
        userId: user.id,
        date: today,
        grepEarned: reward,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'reward',
        wallet: session.walletAddress,
        username: user.username,
        value: reward,
        message: `Claimed Day ${nextDay} reward: ${reward} GREP`,
        icon: nextDay === 7 ? '🎁' : '📅',
      },
    })

    // Update global stats
    await prisma.globalStats.update({
      where: { id: 'global' },
      data: {
        totalGrepEarned: { increment: BigInt(reward) },
      },
    })

    return NextResponse.json({
      success: true,
      reward,
      day: nextDay,
      streak: nextDay,
      isWeekComplete: nextDay === 7,
      nextReward: DAILY_REWARDS[nextDay % 7] + (nextDay % 7 === 6 ? DAY_7_BONUS : 0),
      nextClaimTime: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    })
  } catch (error) {
    console.error('Daily rewards POST error:', error)
    return NextResponse.json(
      { error: 'Failed to claim daily reward' },
      { status: 500 }
    )
  }
}
