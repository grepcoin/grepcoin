import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { parseSessionToken } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const rateCheck = rateLimit(session.address, { interval: 60_000, limit: 20 }, 'tournament-join')

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

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        _count: {
          select: { participants: true },
        },
      },
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Check tournament status
    if (tournament.status !== 'REGISTRATION') {
      return NextResponse.json(
        { error: 'Tournament is not accepting registrations' },
        { status: 400 }
      )
    }

    // Check if tournament is full
    if (tournament._count.participants >= tournament.maxPlayers) {
      return NextResponse.json(
        { error: 'Tournament is full' },
        { status: 400 }
      )
    }

    const now = new Date()
    if (now >= tournament.endTime) {
      return NextResponse.json({ error: 'Tournament has ended' }, { status: 400 })
    }

    // Check if already participating
    const existingParticipation = await prisma.tournamentParticipant.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId: id,
          userId: user.id,
        },
      },
    })

    if (existingParticipation) {
      return NextResponse.json(
        { error: 'Already participating in this tournament' },
        { status: 400 }
      )
    }

    // Create participation
    const participation = await prisma.tournamentParticipant.create({
      data: {
        tournamentId: id,
        userId: user.id,
        score: 0,
      },
    })

    return NextResponse.json({ participation })
  } catch (error) {
    console.error('Error joining tournament:', error)
    return NextResponse.json({ error: 'Failed to join tournament' }, { status: 500 })
  }
}
