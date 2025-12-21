import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { cookies } from 'next/headers'
import {
  WEEKLY_REWARD_TIERS,
  MONTHLY_REWARD_TIERS,
  getCurrentPeriodStart,
  getRewardForRank,
  calculateTotalPool,
} from '@/lib/leaderboard-rewards'

// Admin wallet addresses (you should configure this via env variable)
const ADMIN_ADDRESSES = (process.env.ADMIN_ADDRESSES || '').split(',').map((a) => a.toLowerCase())

// POST - Trigger reward distribution (admin only)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session_id')?.value

    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get session
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    // Check if user is admin
    if (!ADMIN_ADDRESSES.includes(session.walletAddress.toLowerCase())) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 })
    }

    const { period, force } = await request.json()

    if (!period || !['weekly', 'monthly'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Must be "weekly" or "monthly"' },
        { status: 400 }
      )
    }

    const periodEnum = period.toUpperCase() as 'WEEKLY' | 'MONTHLY'
    const tiers = period === 'weekly' ? WEEKLY_REWARD_TIERS : MONTHLY_REWARD_TIERS

    // Get the period dates
    const endDate = new Date()
    endDate.setHours(0, 0, 0, 0)
    const startDate = getCurrentPeriodStart(period)

    // Check if distribution already exists for this period
    const existingDistribution = await prisma.leaderboardDistribution.findFirst({
      where: {
        period: periodEnum,
        startDate,
        endDate,
        status: { in: ['COMPLETED', 'DISTRIBUTING'] },
      },
    })

    if (existingDistribution && !force) {
      return NextResponse.json(
        { error: 'Distribution already exists for this period. Use force=true to override.' },
        { status: 400 }
      )
    }

    // Calculate final rankings for the period
    const scores = await prisma.gameScore.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
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

    if (scores.length === 0) {
      return NextResponse.json(
        { error: 'No scores found for this period' },
        { status: 400 }
      )
    }

    // Get user details for all participants
    const userIds = scores.map((s) => s.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    // Create distribution and rewards in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create distribution
      const distribution = await tx.leaderboardDistribution.create({
        data: {
          period: periodEnum,
          startDate,
          endDate,
          status: 'DISTRIBUTING',
          totalPool: calculateTotalPool(tiers),
        },
      })

      // Create rewards for winners
      const rewardsToCreate = []
      const notificationsToCreate = []

      for (let i = 0; i < scores.length; i++) {
        const rank = i + 1
        const score = scores[i]
        const rewardTier = getRewardForRank(rank, tiers)

        if (!rewardTier) {
          continue // User not in reward range
        }

        const user = userMap.get(score.userId)
        if (!user) {
          continue
        }

        rewardsToCreate.push({
          distributionId: distribution.id,
          userId: user.id,
          rank,
          grepAmount: rewardTier.grepAmount,
          badgeId: rewardTier.badgeId || null,
          multiplier: rewardTier.multiplierBonus || null,
          status: 'PENDING' as const,
        })

        // Create activity notification
        notificationsToCreate.push({
          type: 'reward',
          wallet: user.walletAddress,
          username: user.username,
          value: rewardTier.grepAmount,
          message: `Won ${period} leaderboard reward! Rank #${rank} - ${rewardTier.grepAmount} GREP`,
          icon: rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏆',
        })
      }

      // Batch create rewards
      if (rewardsToCreate.length > 0) {
        await tx.leaderboardReward.createMany({
          data: rewardsToCreate,
        })
      }

      // Batch create notifications
      if (notificationsToCreate.length > 0) {
        await tx.activity.createMany({
          data: notificationsToCreate,
        })
      }

      // Mark distribution as completed
      await tx.leaderboardDistribution.update({
        where: { id: distribution.id },
        data: { status: 'COMPLETED' },
      })

      return {
        distribution,
        winnersCount: rewardsToCreate.length,
        totalAwarded: rewardsToCreate.reduce((sum, r) => sum + r.grepAmount, 0),
      }
    })

    return NextResponse.json({
      success: true,
      distribution: {
        id: result.distribution.id,
        period: result.distribution.period,
        startDate: result.distribution.startDate.toISOString(),
        endDate: result.distribution.endDate.toISOString(),
        status: result.distribution.status,
        totalPool: result.distribution.totalPool,
      },
      winnersCount: result.winnersCount,
      totalAwarded: result.totalAwarded,
      message: `Successfully distributed ${result.winnersCount} rewards totaling ${result.totalAwarded} GREP`,
    })
  } catch (error) {
    console.error('Reward distribution error:', error)
    return NextResponse.json(
      { error: 'Failed to distribute rewards' },
      { status: 500 }
    )
  }
}

// GET - Get distribution status and history (admin only)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session_id')?.value

    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get session
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    // Check if user is admin
    if (!ADMIN_ADDRESSES.includes(session.walletAddress.toLowerCase())) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 })
    }

    // Get all distributions
    const distributions = await prisma.leaderboardDistribution.findMany({
      orderBy: { endDate: 'desc' },
      take: 50,
      include: {
        _count: {
          select: {
            rewards: true,
          },
        },
      },
    })

    const formattedDistributions = distributions.map((d) => ({
      id: d.id,
      period: d.period,
      startDate: d.startDate.toISOString(),
      endDate: d.endDate.toISOString(),
      status: d.status,
      totalPool: d.totalPool,
      winnersCount: d._count.rewards,
      createdAt: d.createdAt.toISOString(),
    }))

    // Get stats
    const totalDistributed = await prisma.leaderboardReward.aggregate({
      where: {
        status: 'CLAIMED',
      },
      _sum: {
        grepAmount: true,
      },
      _count: true,
    })

    const pendingRewards = await prisma.leaderboardReward.aggregate({
      where: {
        status: 'PENDING',
      },
      _sum: {
        grepAmount: true,
      },
      _count: true,
    })

    return NextResponse.json({
      distributions: formattedDistributions,
      stats: {
        totalDistributed: totalDistributed._sum.grepAmount || 0,
        totalClaimed: totalDistributed._count,
        pendingAmount: pendingRewards._sum.grepAmount || 0,
        pendingCount: pendingRewards._count,
      },
    })
  } catch (error) {
    console.error('Get distributions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch distributions' },
      { status: 500 }
    )
  }
}
