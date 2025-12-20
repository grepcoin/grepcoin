import { NextRequest, NextResponse } from 'next/server'
import { parseSessionToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = parseSessionToken(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const gameSlug = searchParams.get('game')

  const where: any = { userId: session.userId }
  if (gameSlug) {
    where.gameSlug = gameSlug
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
