import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  // Would fetch from database with pagination
  const activities = [
    { id: '1', type: 'game_played', userId: 'u1', data: { gameName: 'Snake', score: 1500, grepEarned: 150, userName: 'Player1' }, createdAt: new Date(Date.now() - 300000) },
    { id: '2', type: 'achievement_unlocked', userId: 'u2', data: { achievementName: 'First Steps', userName: 'Player2' }, createdAt: new Date(Date.now() - 600000) },
    { id: '3', type: 'level_up', userId: 'u1', data: { level: 10, userName: 'Player1' }, createdAt: new Date(Date.now() - 900000) },
    { id: '4', type: 'tournament_won', userId: 'u3', data: { tournamentName: 'Weekly Challenge', prize: 500, userName: 'Champion' }, createdAt: new Date(Date.now() - 1800000) },
    { id: '5', type: 'stake_created', userId: 'u2', data: { amount: 1000, userName: 'Player2' }, createdAt: new Date(Date.now() - 3600000) },
    { id: '6', type: 'referral_joined', userId: 'u1', data: { userName: 'Player1' }, createdAt: new Date(Date.now() - 7200000) },
  ]

  return NextResponse.json({
    activities,
    hasMore: page < 3,
    page,
  })
}
