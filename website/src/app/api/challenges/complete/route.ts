import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { parseSessionToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const session = parseSessionToken(sessionToken)
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const { challengeId } = await request.json()

    if (!challengeId) {
      return NextResponse.json(
        { error: 'Challenge ID required' },
        { status: 400 }
      )
    }

    // Check if challenge exists and is for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const challenge = await prisma.dailyChallenge.findFirst({
      where: {
        id: challengeId,
        date: today,
      },
      include: { game: true },
    })

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found or expired' },
        { status: 404 }
      )
    }

    // Check if already completed
    const existing = await prisma.challengeCompletion.findUnique({
      where: {
        challengeId_walletAddress: {
          challengeId,
          walletAddress: session.address,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Challenge already completed' },
        { status: 400 }
      )
    }

    // Create completion
    await prisma.challengeCompletion.create({
      data: {
        challengeId,
        walletAddress: session.address,
      },
    })

    // Create activity
    const user = await prisma.user.findUnique({
      where: { walletAddress: session.address },
    })

    await prisma.activity.create({
      data: {
        type: 'reward',
        wallet: session.address,
        username: user?.username,
        game: challenge.game.name,
        value: challenge.reward,
        message: `completed daily challenge in ${challenge.game.name}`,
        icon: '🏆',
      },
    })

    return NextResponse.json({
      success: true,
      reward: challenge.reward,
      multiplier: challenge.multiplier,
    })
  } catch (error) {
    console.error('Challenge completion error:', error)
    return NextResponse.json(
      { error: 'Failed to complete challenge' },
      { status: 500 }
    )
  }
}
