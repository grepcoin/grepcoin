import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/auth'
import { REWARD_BADGES } from '@/lib/leaderboard-rewards'

// POST - Claim earned rewards
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const session = parseSessionToken(sessionToken)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: session.address },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { rewardId } = await request.json()

    if (!rewardId) {
      return NextResponse.json({ error: 'Reward ID required' }, { status: 400 })
    }

    // Get the reward
    const reward = await prisma.leaderboardReward.findUnique({
      where: { id: rewardId },
      include: {
        distribution: true,
      },
    })

    if (!reward) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 })
    }

    // Verify ownership
    if (reward.userId !== user.id) {
      return NextResponse.json({ error: 'Not your reward' }, { status: 403 })
    }

    // Check if already claimed
    if (reward.status === 'CLAIMED') {
      return NextResponse.json({ error: 'Reward already claimed' }, { status: 400 })
    }

    // Check if expired
    if (reward.status === 'EXPIRED') {
      return NextResponse.json({ error: 'Reward has expired' }, { status: 400 })
    }

    // Start transaction to claim reward
    const result = await prisma.$transaction(async (tx) => {
      // Update reward status
      const updatedReward = await tx.leaderboardReward.update({
        where: { id: rewardId },
        data: {
          status: 'CLAIMED',
          claimedAt: new Date(),
        },
      })

      // Update daily stats with GREP earned
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      await tx.dailyStats.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date: today,
          },
        },
        update: {
          grepEarned: { increment: reward.grepAmount },
        },
        create: {
          userId: user.id,
          date: today,
          grepEarned: reward.grepAmount,
        },
      })

      // Award badge if applicable
      let badge = null
      if (reward.badgeId) {
        const badgeConfig = REWARD_BADGES[reward.badgeId as keyof typeof REWARD_BADGES]
        if (badgeConfig) {
          // Check if achievement exists
          let achievement = await tx.achievement.findUnique({
            where: { slug: badgeConfig.id },
          })

          // Create achievement if it doesn't exist
          if (!achievement) {
            achievement = await tx.achievement.create({
              data: {
                slug: badgeConfig.id,
                name: badgeConfig.name,
                description: badgeConfig.description,
                icon: badgeConfig.icon,
                rarity: badgeConfig.rarity,
                reward: 0, // No additional reward
                type: 'special',
                target: null,
                gameSlug: null,
              },
            })
          }

          // Award to user
          badge = await tx.userAchievement.upsert({
            where: {
              userId_achievementId: {
                userId: user.id,
                achievementId: achievement.id,
              },
            },
            update: {
              unlockedAt: new Date(),
              progress: 1,
            },
            create: {
              userId: user.id,
              achievementId: achievement.id,
              progress: 1,
              unlockedAt: new Date(),
            },
          })
        }
      }

      // Create activity record
      await tx.activity.create({
        data: {
          type: 'reward',
          wallet: session.address,
          username: user.username,
          value: reward.grepAmount,
          message: `Claimed ${reward.distribution.period.toLowerCase()} leaderboard reward: ${reward.grepAmount} GREP (Rank #${reward.rank})`,
          icon: reward.rank === 1 ? '👑' : reward.rank === 2 ? '🥈' : reward.rank === 3 ? '🥉' : '🏆',
        },
      })

      // Update global stats
      await tx.globalStats.update({
        where: { id: 'global' },
        data: {
          totalGrepEarned: { increment: BigInt(reward.grepAmount) },
        },
      })

      return { reward: updatedReward, badge }
    })

    return NextResponse.json({
      success: true,
      reward: {
        id: result.reward.id,
        grepAmount: result.reward.grepAmount,
        badgeId: result.reward.badgeId,
        multiplier: result.reward.multiplier,
        rank: result.reward.rank,
        claimedAt: result.reward.claimedAt,
      },
      badge: result.badge
        ? {
            id: result.badge.achievementId,
            name: REWARD_BADGES[reward.badgeId as keyof typeof REWARD_BADGES]?.name,
            icon: REWARD_BADGES[reward.badgeId as keyof typeof REWARD_BADGES]?.icon,
          }
        : null,
    })
  } catch (error) {
    console.error('Reward claim error:', error)
    return NextResponse.json(
      { error: 'Failed to claim reward' },
      { status: 500 }
    )
  }
}

// GET - Get user's claimable rewards
export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const session = parseSessionToken(sessionToken)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: session.address },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all pending rewards for user
    const rewards = await prisma.leaderboardReward.findMany({
      where: {
        userId: user.id,
        status: 'PENDING',
      },
      include: {
        distribution: {
          select: {
            period: true,
            endDate: true,
            startDate: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const formattedRewards = rewards.map((r) => ({
      id: r.id,
      period: r.distribution.period,
      rank: r.rank,
      grepAmount: r.grepAmount,
      badgeId: r.badgeId,
      badgeName: r.badgeId ? REWARD_BADGES[r.badgeId as keyof typeof REWARD_BADGES]?.name : null,
      badgeIcon: r.badgeId ? REWARD_BADGES[r.badgeId as keyof typeof REWARD_BADGES]?.icon : null,
      multiplier: r.multiplier,
      createdAt: r.createdAt.toISOString(),
      distributionEnd: r.distribution.endDate.toISOString(),
    }))

    const totalClaimable = rewards.reduce((sum, r) => sum + r.grepAmount, 0)

    return NextResponse.json({
      rewards: formattedRewards,
      totalClaimable,
      count: rewards.length,
    })
  } catch (error) {
    console.error('Get claimable rewards error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch claimable rewards' },
      { status: 500 }
    )
  }
}
