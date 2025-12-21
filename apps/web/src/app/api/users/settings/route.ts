import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { parseSessionToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

    const user = await prisma.user.findUnique({
      where: { walletAddress: session.address },
      select: {
        username: true,
        avatar: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      settings: {
        displayName: user.username || '',
        avatar: user.avatar || '🎮',
        soundEnabled: true,
        notificationsEnabled: true,
        theme: 'dark'
      }
    })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const { displayName, avatar } = await request.json()

    // Validate display name
    if (displayName && (displayName.length < 3 || displayName.length > 20)) {
      return NextResponse.json({ error: 'Display name must be 3-20 characters' }, { status: 400 })
    }

    // Validate avatar is one of the allowed emojis
    const allowedAvatars = ['🎮', '🚀', '💎', '🔥', '⚡', '🎯', '🏆', '👾']
    if (avatar && !allowedAvatars.includes(avatar)) {
      return NextResponse.json({ error: 'Invalid avatar' }, { status: 400 })
    }

    await prisma.user.update({
      where: { walletAddress: session.address },
      data: {
        username: displayName || null,
        avatar: avatar || null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}
