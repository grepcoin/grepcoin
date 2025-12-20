import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rateCheck = rateLimit(ip, { interval: 60_000, limit: 100 }, 'events-list')

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        participants: {
          take: 10,
          orderBy: { score: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                walletAddress: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: { participants: true },
        },
      },
      orderBy: [
        { status: 'asc' },
        { startTime: 'asc' },
      ],
      take: limit,
    })

    const formattedEvents = events.map((event) => ({
      id: event.id,
      name: event.name,
      description: event.description,
      type: event.type,
      gameSlug: event.gameSlug,
      startTime: event.startTime,
      endTime: event.endTime,
      rewards: event.rewards,
      rules: event.rules,
      status: event.status,
      createdAt: event.createdAt,
      participantCount: event._count.participants,
      topParticipants: event.participants.map((p) => ({
        id: p.id,
        score: p.score,
        joinedAt: p.joinedAt,
        user: p.user,
      })),
    }))

    return NextResponse.json({ events: formattedEvents })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}
