import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { parseSessionToken } from '@/lib/auth'

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

    // Get current active battle pass
    const now = new Date()
    const activeBattlePass = await prisma.battlePass.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        rewards: {
          orderBy: [{ level: 'asc' }, { tier: 'asc' }],
        },
      },
    })

    if (!activeBattlePass) {
      return NextResponse.json({ error: 'No active battle pass' }, { status: 404 })
    }

    // Get or create user progress
    let progress = await prisma.battlePassProgress.findUnique({
      where: {
        battlePassId_userId: {
          battlePassId: activeBattlePass.id,
          userId: user.id,
        },
      },
    })

    if (!progress) {
      progress = await prisma.battlePassProgress.create({
        data: {
          battlePassId: activeBattlePass.id,
          userId: user.id,
          level: 1,
          xp: 0,
          isPremium: false,
          claimedLevels: [],
        },
      })
    }

    // Calculate current level from XP
    const currentLevel = Math.min(
      Math.floor(progress.xp / activeBattlePass.xpPerLevel) + 1,
      activeBattlePass.levels
    )
    const xpForNextLevel = activeBattlePass.xpPerLevel
    const xpInCurrentLevel = progress.xp % activeBattlePass.xpPerLevel

    // Update level if it changed
    if (currentLevel !== progress.level) {
      progress = await prisma.battlePassProgress.update({
        where: { id: progress.id },
        data: { level: currentLevel },
      })
    }

    return NextResponse.json({
      battlePass: {
        id: activeBattlePass.id,
        season: activeBattlePass.season,
        name: activeBattlePass.name,
        startDate: activeBattlePass.startDate,
        endDate: activeBattlePass.endDate,
        levels: activeBattlePass.levels,
        xpPerLevel: activeBattlePass.xpPerLevel,
        rewards: activeBattlePass.rewards,
      },
      progress: {
        level: currentLevel,
        xp: progress.xp,
        xpInCurrentLevel,
        xpForNextLevel,
        isPremium: progress.isPremium,
        claimedLevels: progress.claimedLevels,
      },
    })
  } catch (error) {
    console.error('Error fetching battle pass:', error)
    return NextResponse.json({ error: 'Failed to fetch battle pass' }, { status: 500 })
  }
}
