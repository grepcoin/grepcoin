import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SiweMessage } from 'siwe'
import prisma from '@/lib/db'
import { createSessionToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { message, signature } = await request.json()

    if (!message || !signature) {
      return NextResponse.json(
        { error: 'Missing message or signature' },
        { status: 400 }
      )
    }

    // Verify SIWE message
    const siweMessage = new SiweMessage(message)
    const result = await siweMessage.verify({ signature })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Verify nonce matches
    const cookieStore = await cookies()
    const storedNonce = cookieStore.get('siwe-nonce')?.value

    if (!storedNonce || siweMessage.nonce !== storedNonce) {
      return NextResponse.json(
        { error: 'Invalid or expired nonce' },
        { status: 401 }
      )
    }

    // Clear nonce cookie
    cookieStore.delete('siwe-nonce')

    const walletAddress = siweMessage.address.toLowerCase()

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress },
    })

    if (!user) {
      user = await prisma.user.create({
        data: { walletAddress },
      })

      // Update global stats for new player
      await prisma.globalStats.upsert({
        where: { id: 'global' },
        update: { totalPlayers: { increment: 1 } },
        create: { id: 'global', totalPlayers: 1 },
      })
    }

    // Create session token
    const sessionToken = createSessionToken(walletAddress)

    // Set session cookie
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({
      user: {
        walletAddress: user.walletAddress,
        username: user.username,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}
