import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { cookies } from 'next/headers'
import {
  getNextDistributionDate,
  getCurrentPeriodStart,
  WEEKLY_REWARD_TIERS,
  MONTHLY_REWARD_TIERS,
  getRewardForRank,
  getTimeUntilDistribution,
} from '@/lib/leaderboard-rewards'

// GET - Get upcoming and past reward distributions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'weekly' | 'monthly' | null
    const includeProjected = searchParams.get('projected') === 'true'

    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session_id')?.value

    let userId: string | null = null
    let userAddress: string | null = null

    if (sessionId) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
      })

      if (session && session.expiresAt > new Date()) {
        userAddress = session.walletAddress
        const user = await prisma.user.findUnique({
          where: { walletAddress: userAddress },
        })
        userId = user?.id || null
      }
    }

    // Get upcoming distributions
    const upcomingWeekly = {
      period: 'WEEKLY' as const,
      nextDate: getNextDistributionDate('weekly'),
      tiers: WEEKLY_REWARD_TIERS,
      totalPool: WEEKLY_REWARD_TIERS.reduce((sum, tier) => {
        const count = tier.rankEnd - tier.rankStart + 1
        return sum + tier.grepAmount * count
      }, 0),
    }

    const upcomingMonthly = {
      period: 'MONTHLY' as const,
      nextDate: getNextDistributionDate('monthly'),
      tiers: MONTHLY_REWARD_TIERS,
      totalPool: MONTHLY_REWARD_TIERS.reduce((sum, tier) => {
        const count = tier.rankEnd - tier.rankStart + 1
        return sum + tier.grepAmount * count
      }, 0),
    }

    // Get past distributions
    const pastDistributions = await prisma.leaderboardDistribution.findMany({
      where: type ? { period: type.toUpperCase() as 'WEEKLY' | 'MONTHLY' } : {},
      orderBy: { endDate: 'desc' },
      take: 10,
      include: {
        rewards: userId
          ? {
              where: { userId },
              select: {
                rank: true,
                grepAmount: true,
                badgeId: true,
                status: true,
                claimedAt: true,
              },
            }
          : false,
        _count: {
          select: {
            rewards: true,
          },
        },
      },
    })

    // Calculate user's projected rewards if authenticated and requested
    let projectedRewards: any = null
    if (includeProjected && userId) {
      // Get user's current rank for weekly
      const weeklyStart = getCurrentPeriodStart('weekly')
      const weeklyScores = await prisma.gameScore.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: weeklyStart },
        },
        _sum: {
          grepEarned: true,
          score: true,
        },
        orderBy: {
          _sum: {
            grepEarned: 'desc',
          },
        },
      })

      const weeklyRank = weeklyScores.findIndex((s) => s.userId === userId) + 1
      const weeklyReward = weeklyRank > 0 ? getRewardForRank(weeklyRank, WEEKLY_REWARD_TIERS) : null

      // Get user's current rank for monthly
      const monthlyStart = getCurrentPeriodStart('monthly')
      const monthlyScores = await prisma.gameScore.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: monthlyStart },
        },
        _sum: {
          grepEarned: true,
          score: true,
        },
        orderBy: {
          _sum: {
            grepEarned: 'desc',
          },
        },
      })

      const monthlyRank = monthlyScores.findIndex((s) => s.userId === userId) + 1
      const monthlyReward = monthlyRank > 0 ? getRewardForRank(monthlyRank, MONTHLY_REWARD_TIERS) : null

      projectedRewards = {
        weekly: weeklyReward
          ? {
              rank: weeklyRank,
              grepAmount: weeklyReward.grepAmount,
              badgeId: weeklyReward.badgeId,
              multiplierBonus: weeklyReward.multiplierBonus,
            }
          : null,
        monthly: monthlyReward
          ? {
              rank: monthlyRank,
              grepAmount: monthlyReward.grepAmount,
              badgeId: monthlyReward.badgeId,
              multiplierBonus: monthlyReward.multiplierBonus,
            }
          : null,
      }
    }

    return NextResponse.json({
      upcoming: type
        ? type === 'weekly'
          ? [upcomingWeekly]
          : [upcomingMonthly]
        : [upcomingWeekly, upcomingMonthly],
      past: pastDistributions.map((d) => ({
        id: d.id,
        period: d.period,
        startDate: d.startDate.toISOString(),
        endDate: d.endDate.toISOString(),
        status: d.status,
        totalPool: d.totalPool,
        winnersCount: d._count.rewards,
        userReward: d.rewards && d.rewards.length > 0 ? d.rewards[0] : null,
      })),
      projected: projectedRewards,
      countdown: {
        weekly: getTimeUntilDistribution(upcomingWeekly.nextDate),
        monthly: getTimeUntilDistribution(upcomingMonthly.nextDate),
      },
    })
  } catch (error) {
    console.error('Leaderboard rewards GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reward distributions' },
      { status: 500 }
    )
  }
}
