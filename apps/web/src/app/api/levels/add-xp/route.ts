import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Internal API key for server-to-server XP additions (game backend)
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY

export async function POST(req: NextRequest) {
  try {
    // Parse body once
    const body = await req.json()
    const { source, amount, userId: bodyUserId } = body

    // Check for internal API key (server-to-server)
    const apiKey = req.headers.get('x-api-key')
    const isInternalCall = INTERNAL_API_KEY && apiKey === INTERNAL_API_KEY

    let userId: string | null = null

    if (isInternalCall) {
      // Server-to-server call - userId must be in body
      userId = bodyUserId
      if (!userId) {
        return NextResponse.json(
          { error: 'userId required for internal calls' },
          { status: 400 }
        )
      }
    } else {
      // User-initiated call - get from session
      const cookieStore = await cookies()
      const sessionCookie = cookieStore.get('session')
      if (!sessionCookie?.value) {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        )
      }

      const session = parseSessionToken(sessionCookie.value)
      if (!session) {
        return NextResponse.json(
          { error: 'Invalid session' },
          { status: 401 }
        )
      }

      // Look up user by wallet address
      const user = await prisma.user.findUnique({
        where: { walletAddress: session.address },
        select: { id: true },
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      userId = user.id
    }

    // Validate input
    if (!source || typeof source !== 'string') {
      return NextResponse.json(
        { error: 'Invalid source' },
        { status: 400 }
      )
    }

    if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 10000) {
      return NextResponse.json(
        { error: 'Invalid amount (must be 1-10000)' },
        { status: 400 }
      )
    }

    // Update user XP in DailyStats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dailyStats = await prisma.dailyStats.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        grepEarned: { increment: amount },
      },
      create: {
        userId,
        date: today,
        grepEarned: amount,
      },
      select: {
        grepEarned: true,
      },
    })

    return NextResponse.json({
      success: true,
      xpAdded: amount,
      source,
      todayTotal: dailyStats.grepEarned,
    })
  } catch (error) {
    console.error('Error adding XP:', error)
    return NextResponse.json(
      { error: 'Failed to add XP' },
      { status: 500 }
    )
  }
}
