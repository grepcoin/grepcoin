import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get today's challenges with game info
    const challenges = await prisma.dailyChallenge.findMany({
      where: { date: today },
      include: {
        game: {
          select: {
            slug: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        _count: {
          select: { completions: true },
        },
      },
    })

    // Calculate time until reset (midnight UTC)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const timeUntilReset = tomorrow.getTime() - Date.now()

    return NextResponse.json({
      challenges: challenges.map((c) => ({
        id: c.id,
        game: c.game,
        type: c.type,
        target: c.target,
        reward: c.reward,
        multiplier: c.multiplier,
        completions: c._count.completions,
      })),
      resetIn: timeUntilReset,
    })
  } catch (error) {
    console.error('Challenges fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    )
  }
}
