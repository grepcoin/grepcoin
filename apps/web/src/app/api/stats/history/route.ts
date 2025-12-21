import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')?.value
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = parseSessionToken(sessionToken)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find user by wallet address
  const user = await prisma.user.findUnique({
    where: { walletAddress: session.address }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const gameSlug = searchParams.get('game')

  const where: { userId: string; gameId?: string } = { userId: user.id }
  if (gameSlug) {
    const game = await prisma.game.findUnique({
      where: { slug: gameSlug }
    })
    if (game) {
      where.gameId = game.id
    }
  }

  const scores = await prisma.gameScore.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    select: {
      score: true,
      createdAt: true
    }
  })

  const history = scores.map(s => ({
    date: s.createdAt.toISOString(),
    score: s.score
  }))

  return NextResponse.json({ history })
}
