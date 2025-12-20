import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { parseSessionToken } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rateCheck = rateLimit(ip, { interval: 60_000, limit: 100 }, 'tournaments-list')

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const gameSlug = searchParams.get('gameSlug')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (gameSlug) {
      where.gameSlug = gameSlug
    }

    const tournaments = await prisma.tournament.findMany({
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

    const formattedTournaments = tournaments.map((tournament) => ({
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
      topParticipants: tournament.participants.map((p) => ({
        id: p.id,
        score: p.score,
        rank: p.rank,
        joinedAt: p.joinedAt,
        user: p.user,
      })),
    }))

    return NextResponse.json({ tournaments: formattedTournaments })
  } catch (error) {
    console.error('Error fetching tournaments:', error)
    return NextResponse.json({ error: 'Failed to fetch tournaments' }, { status: 500 })
  }
}

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

    // Rate limiting
    const rateCheck = rateLimit(session.address, { interval: 60_000, limit: 5 }, 'tournament-create')

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: session.address },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, gameSlug, entryFee, prizePool, maxPlayers, startTime, endTime } = body

    // Validation
    if (!name || !gameSlug || !maxPlayers || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return NextResponse.json(
        { error: 'Start time must be before end time' },
        { status: 400 }
      )
    }

    if (maxPlayers < 2) {
      return NextResponse.json(
        { error: 'Tournament must allow at least 2 players' },
        { status: 400 }
      )
    }

    const tournament = await prisma.tournament.create({
      data: {
        name,
        gameSlug,
        entryFee: entryFee || 0,
        prizePool: prizePool || 0,
        maxPlayers,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'REGISTRATION',
      },
    })

    return NextResponse.json({ tournament }, { status: 201 })
  } catch (error) {
    console.error('Error creating tournament:', error)
    return NextResponse.json({ error: 'Failed to create tournament' }, { status: 500 })
  }
}
