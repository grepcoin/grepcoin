import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { parseSessionToken } from '@/lib/auth'

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

    const { level } = await request.json()

    if (!level || level < 1) {
      return NextResponse.json({ error: 'Invalid level' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: session.address },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get current active battle pass
    const now = new Date()
    const activeBattlePass = await prisma.battlePass.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        rewards: {
          where: { level },
        },
      },
    })

    if (!activeBattlePass) {
      return NextResponse.json({ error: 'No active battle pass' }, { status: 404 })
    }

    // Get user progress
    const progress = await prisma.battlePassProgress.findUnique({
      where: {
        battlePassId_userId: {
          battlePassId: activeBattlePass.id,
          userId: user.id,
        },
      },
    })

    if (!progress) {
      return NextResponse.json({ error: 'No battle pass progress found' }, { status: 404 })
    }

    // Calculate current level from XP
    const currentLevel = Math.min(
      Math.floor(progress.xp / activeBattlePass.xpPerLevel) + 1,
      activeBattlePass.levels
    )

    // Check if user has reached the level
    if (currentLevel < level) {
      return NextResponse.json({ error: 'Level not reached yet' }, { status: 400 })
    }

    // Check if already claimed
    if (progress.claimedLevels.includes(level)) {
      return NextResponse.json({ error: 'Reward already claimed' }, { status: 400 })
    }

    // Get rewards for this level
    const freeReward = activeBattlePass.rewards.find((r) => r.tier === 'FREE')
    const premiumReward = activeBattlePass.rewards.find((r) => r.tier === 'PREMIUM')

    const claimedRewards: { tier: string; type: string; value: unknown }[] = []

    // Always claim free reward
    if (freeReward) {
      claimedRewards.push({
        tier: 'FREE',
        type: freeReward.type,
        value: freeReward.value,
      })
    }

    // Claim premium reward if user has premium
    if (progress.isPremium && premiumReward) {
      claimedRewards.push({
        tier: 'PREMIUM',
        type: premiumReward.type,
        value: premiumReward.value,
      })
    }

    // Update progress with claimed level
    const updatedProgress = await prisma.battlePassProgress.update({
      where: { id: progress.id },
      data: {
        claimedLevels: [...progress.claimedLevels, level],
      },
    })

    return NextResponse.json({
      success: true,
      claimedRewards,
      progress: {
        level: currentLevel,
        xp: updatedProgress.xp,
        isPremium: updatedProgress.isPremium,
        claimedLevels: updatedProgress.claimedLevels,
      },
    })
  } catch (error) {
    console.error('Error claiming battle pass reward:', error)
    return NextResponse.json({ error: 'Failed to claim reward' }, { status: 500 })
  }
}
