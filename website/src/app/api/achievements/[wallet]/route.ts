import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params
    const walletAddress = wallet.toLowerCase()

    const user = await prisma.user.findUnique({
      where: { walletAddress },
      include: {
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get all achievements
    const allAchievements = await prisma.achievement.findMany()

    const userAchievements = allAchievements.map((achievement) => {
      const userProgress = user.achievements.find(
        (ua) => ua.achievementId === achievement.id
      )

      return {
        ...achievement,
        progress: userProgress?.progress || 0,
        unlocked: !!userProgress?.unlockedAt,
        unlockedAt: userProgress?.unlockedAt,
      }
    })

    const totalUnlocked = userAchievements.filter((a) => a.unlocked).length
    const totalRewards = userAchievements
      .filter((a) => a.unlocked)
      .reduce((sum, a) => sum + a.reward, 0)

    return NextResponse.json({
      achievements: userAchievements,
      summary: {
        total: allAchievements.length,
        unlocked: totalUnlocked,
        totalRewards,
      },
    })
  } catch (error) {
    console.error('User achievements fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}
