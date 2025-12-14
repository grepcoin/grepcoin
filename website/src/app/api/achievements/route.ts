import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: [
        { rarity: 'asc' },
        { reward: 'asc' },
      ],
    })

    // Get unlock percentages
    const totalUsers = await prisma.user.count()

    const achievementsWithStats = await Promise.all(
      achievements.map(async (achievement) => {
        const unlockCount = await prisma.userAchievement.count({
          where: {
            achievementId: achievement.id,
            unlockedAt: { not: null },
          },
        })

        return {
          ...achievement,
          unlockedBy: totalUsers > 0 ? (unlockCount / totalUsers) * 100 : 0,
        }
      })
    )

    return NextResponse.json({ achievements: achievementsWithStats })
  } catch (error) {
    console.error('Achievements fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}
