import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      where: { isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        icon: true,
        color: true,
        minReward: true,
        maxReward: true,
        _count: {
          select: { scores: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({
      games: games.map((g) => ({
        ...g,
        totalPlays: g._count.scores,
      })),
    })
  } catch (error) {
    console.error('Games fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    )
  }
}
