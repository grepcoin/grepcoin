import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const cursor = searchParams.get('cursor')

    const activities = await prisma.activity.findMany({
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: { createdAt: 'desc' },
    })

    const nextCursor = activities.length === limit
      ? activities[activities.length - 1].id
      : null

    return NextResponse.json({
      activities: activities.map((a) => ({
        id: a.id,
        type: a.type,
        wallet: a.wallet,
        username: a.username,
        game: a.game,
        value: a.value,
        message: a.message,
        icon: a.icon,
        timestamp: a.createdAt,
      })),
      nextCursor,
    })
  } catch (error) {
    console.error('Activity fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}
