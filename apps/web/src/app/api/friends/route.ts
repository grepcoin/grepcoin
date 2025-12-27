import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { parseSessionToken } from '@/lib/auth'

export async function GET(_request: NextRequest) {
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
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all accepted friendships
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: user.id, status: 'ACCEPTED' },
          { friendId: user.id, status: 'ACCEPTED' },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
            avatar: true,
          },
        },
        friend: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    // Map to friend list
    const friends = friendships.map((f) => {
      const friend = f.userId === user.id ? f.friend : f.user
      return {
        friendshipId: f.id,
        ...friend,
        acceptedAt: f.acceptedAt,
      }
    })

    return NextResponse.json({ friends })
  } catch (error) {
    console.error('Error fetching friends:', error)
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 })
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

    const { walletAddress, username } = await request.json()

    if (!walletAddress && !username) {
      return NextResponse.json({ error: 'Wallet address or username required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: session.address },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find friend by wallet or username
    const friendUser = await prisma.user.findFirst({
      where: walletAddress
        ? { walletAddress: walletAddress.toLowerCase() }
        : { username },
    })

    if (!friendUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (friendUser.id === user.id) {
      return NextResponse.json({ error: 'Cannot add yourself as friend' }, { status: 400 })
    }

    // Check for existing friendship
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: user.id, friendId: friendUser.id },
          { userId: friendUser.id, friendId: user.id },
        ],
      },
    })

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        return NextResponse.json({ error: 'Already friends' }, { status: 400 })
      }
      if (existing.status === 'PENDING' && existing.userId === user.id) {
        return NextResponse.json({ error: 'Request already sent' }, { status: 400 })
      }
      // Auto-accept if they sent us a request
      if (existing.status === 'PENDING' && existing.friendId === user.id) {
        const updated = await prisma.friendship.update({
          where: { id: existing.id },
          data: { status: 'ACCEPTED', acceptedAt: new Date() },
        })
        return NextResponse.json({ friendship: updated, autoAccepted: true })
      }
    }

    // Create new friend request
    const friendship = await prisma.friendship.create({
      data: {
        userId: user.id,
        friendId: friendUser.id,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ friendship })
  } catch (error) {
    console.error('Error creating friend request:', error)
    return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 })
  }
}
