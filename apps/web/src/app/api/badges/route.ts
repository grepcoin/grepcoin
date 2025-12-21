import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  // Would fetch from database in production
  const badges = [
    { badgeId: 'first_game', earnedAt: new Date('2024-01-01'), displayed: true },
    { badgeId: 'gamer_10', earnedAt: new Date('2024-01-15'), displayed: true },
    { badgeId: 'score_10k', earnedAt: new Date('2024-02-01'), displayed: false },
    { badgeId: 'first_friend', earnedAt: new Date('2024-02-10'), displayed: true },
    { badgeId: 'early_adopter', earnedAt: new Date('2024-01-01'), displayed: true },
  ]

  return NextResponse.json({ badges })
}
