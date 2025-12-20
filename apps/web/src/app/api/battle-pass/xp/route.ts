import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { parseSessionToken } from '@/lib/auth'

// Internal API for adding XP to user's battle pass
// Called after game sessions or completing challenges
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

    const { xpAmount, source } = await request.json()

    if (!xpAmount || xpAmount <= 0) {
      return NextResponse.json({ error: 'Invalid XP amount' }, { status: 400 })
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

    // Calculate max XP (to prevent going beyond max level)
    const maxXp = activeBattlePass.levels * activeBattlePass.xpPerLevel
    const newXp = Math.min(progress.xp + xpAmount, maxXp)

    // Calculate new level
    const oldLevel = Math.min(
      Math.floor(progress.xp / activeBattlePass.xpPerLevel) + 1,
      activeBattlePass.levels
    )
    const newLevel = Math.min(
      Math.floor(newXp / activeBattlePass.xpPerLevel) + 1,
      activeBattlePass.levels
    )

    const leveledUp = newLevel > oldLevel
    const xpGained = newXp - progress.xp

    // Update progress
    const updatedProgress = await prisma.battlePassProgress.update({
      where: { id: progress.id },
      data: {
        xp: newXp,
        level: newLevel,
      },
    })

    // Create activity entry if leveled up
    if (leveledUp) {
      await prisma.activity.create({
        data: {
          type: 'levelup',
          wallet: session.address,
          username: user.username,
          value: newLevel,
          message: `leveled up to Battle Pass Level ${newLevel}!`,
          icon: 'trophy',
        },
      })
    }

    return NextResponse.json({
      success: true,
      xpGained,
      leveledUp,
      source,
      progress: {
        level: newLevel,
        xp: updatedProgress.xp,
        xpInCurrentLevel: updatedProgress.xp % activeBattlePass.xpPerLevel,
        xpForNextLevel: activeBattlePass.xpPerLevel,
        isPremium: updatedProgress.isPremium,
      },
    })
  } catch (error) {
    console.error('Error adding battle pass XP:', error)
    return NextResponse.json({ error: 'Failed to add XP' }, { status: 500 })
  }
}
