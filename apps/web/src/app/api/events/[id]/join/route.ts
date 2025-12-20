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
    const rateCheck = rateLimit(session.address, { interval: 60_000, limit: 20 }, 'event-join')

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

    const event = await prisma.event.findUnique({
      where: { id },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check event status
    if (event.status === 'ENDED') {
      return NextResponse.json({ error: 'Event has ended' }, { status: 400 })
    }

    const now = new Date()
    if (now < event.startTime) {
      return NextResponse.json({ error: 'Event has not started yet' }, { status: 400 })
    }

    // Check if already participating
    const existingParticipation = await prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: user.id,
        },
      },
    })

    if (existingParticipation) {
      return NextResponse.json({ error: 'Already participating in this event' }, { status: 400 })
    }

    // Create participation
    const participation = await prisma.eventParticipant.create({
      data: {
        eventId: id,
        userId: user.id,
        score: 0,
      },
    })

    return NextResponse.json({ participation })
  } catch (error) {
    console.error('Error joining event:', error)
    return NextResponse.json({ error: 'Failed to join event' }, { status: 500 })
  }
}
