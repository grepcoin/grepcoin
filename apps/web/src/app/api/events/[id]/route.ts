import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { parseSessionToken } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rateCheck = rateLimit(ip, { interval: 60_000, limit: 100 }, 'event-details')

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        participants: {
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
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if current user is participating
    let isParticipating = false
    let userParticipation = null

    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value

    if (sessionToken) {
      const session = parseSessionToken(sessionToken)
      if (session) {
        const user = await prisma.user.findUnique({
          where: { walletAddress: session.address },
        })

        if (user) {
          const participation = event.participants.find((p) => p.userId === user.id)
          if (participation) {
            isParticipating = true
            userParticipation = {
              id: participation.id,
              score: participation.score,
              joinedAt: participation.joinedAt,
            }
          }
        }
      }
    }

    return NextResponse.json({
      event: {
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
        participants: event.participants.map((p) => ({
          id: p.id,
          score: p.score,
          joinedAt: p.joinedAt,
          user: p.user,
        })),
        isParticipating,
        userParticipation,
      },
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}
