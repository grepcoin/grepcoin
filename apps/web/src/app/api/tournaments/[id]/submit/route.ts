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
    const rateCheck = rateLimit(session.address, { interval: 60_000, limit: 30 }, 'tournament-submit')

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
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Check tournament status
    if (tournament.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Tournament is not active' },
        { status: 400 }
      )
    }

    const now = new Date()
    if (now < tournament.startTime || now > tournament.endTime) {
      return NextResponse.json(
        { error: 'Tournament is not currently running' },
        { status: 400 }
      )
    }

    // Check participation
    const participation = await prisma.tournamentParticipant.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId: id,
          userId: user.id,
        },
      },
    })

    if (!participation) {
      return NextResponse.json(
        { error: 'Not participating in this tournament' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { score } = body

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { error: 'Invalid score value' },
        { status: 400 }
      )
    }

    // Update score only if new score is higher
    if (score <= participation.score) {
      return NextResponse.json(
        { error: 'Score must be higher than current score' },
        { status: 400 }
      )
    }

    // Update participant score
    const _updatedParticipation = await prisma.tournamentParticipant.update({
      where: { id: participation.id },
      data: { score },
    })

    // Recalculate ranks for all participants in this tournament
    const allParticipants = await prisma.tournamentParticipant.findMany({
      where: { tournamentId: id },
      orderBy: { score: 'desc' },
    })

    // Update ranks
    await Promise.all(
      allParticipants.map((p, index) =>
        prisma.tournamentParticipant.update({
          where: { id: p.id },
          data: { rank: index + 1 },
        })
      )
    )

    // Get updated participation with rank
    const finalParticipation = await prisma.tournamentParticipant.findUnique({
      where: { id: participation.id },
    })

    return NextResponse.json({ participation: finalParticipation })
  } catch (error) {
    console.error('Error submitting tournament score:', error)
    return NextResponse.json({ error: 'Failed to submit score' }, { status: 500 })
  }
}
