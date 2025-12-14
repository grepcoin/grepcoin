import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { parseSessionToken } from '@/lib/auth'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value

    if (!sessionToken) {
      return NextResponse.json({ user: null })
    }

    const parsed = parseSessionToken(sessionToken)
    if (!parsed) {
      // Invalid or expired session
      cookieStore.delete('session')
      return NextResponse.json({ user: null })
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: parsed.address },
    })

    if (!user) {
      cookieStore.delete('session')
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        walletAddress: user.walletAddress,
        username: user.username,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ user: null })
  }
}
