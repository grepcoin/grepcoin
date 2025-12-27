import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const gameSlug = searchParams.get('game')
  const userId = searchParams.get('user')
  // Note: limit would be used when fetching from database
  const _limit = parseInt(searchParams.get('limit') || '10')

  const where: Record<string, unknown> = {}
  if (gameSlug) where.gameSlug = gameSlug
  if (userId) where.userId = userId

  // Note: Would need GameReplay model in Prisma schema
  // For now, return mock data structure
  const replays = [
    {
      id: '1',
      gameSlug: gameSlug || 'snake',
      userId: userId || 'user1',
      score: 1500,
      duration: 120000,
      createdAt: new Date(),
    }
  ]

  return NextResponse.json({ replays })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { gameSlug, userId, score, frames, duration } = body

  // Would save to database with GameReplay model
  const replay = {
    id: crypto.randomUUID(),
    gameSlug,
    userId,
    score,
    frames,
    duration,
    createdAt: new Date(),
  }

  return NextResponse.json({ replay })
}
