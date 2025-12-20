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
    const rateCheck = rateLimit(ip, { interval: 60_000, limit: 100 }, 'tournament-details')

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const tournament = await prisma.tournament.findUnique({
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

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
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
          const participation = tournament.participants.find((p) => p.userId === user.id)
          if (participation) {
            isParticipating = true
            userParticipation = {
              id: participation.id,
              score: participation.score,
              rank: participation.rank,
              joinedAt: participation.joinedAt,
            }
          }
        }
      }
    }

    return NextResponse.json({
      tournament: {
        id: tournament.id,
        name: tournament.name,
        gameSlug: tournament.gameSlug,
        entryFee: tournament.entryFee,
        prizePool: tournament.prizePool,
        maxPlayers: tournament.maxPlayers,
        startTime: tournament.startTime,
        endTime: tournament.endTime,
        status: tournament.status,
        createdAt: tournament.createdAt,
        participantCount: tournament._count.participants,
        participants: tournament.participants.map((p) => ({
          id: p.id,
          score: p.score,
          rank: p.rank,
          joinedAt: p.joinedAt,
          user: p.user,
        })),
        isParticipating,
        userParticipation,
      },
    })
  } catch (error) {
    console.error('Error fetching tournament:', error)
    return NextResponse.json({ error: 'Failed to fetch tournament' }, { status: 500 })
  }
}
