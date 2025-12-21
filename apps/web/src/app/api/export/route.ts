import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const options = await req.json()

  // Would fetch real data from database based on options
  const exportData: Record<string, unknown> = {
    userId: 'user123',
    exportedAt: new Date().toISOString(),
    profile: {
      wallet: '0x1234...5678',
      joinedAt: '2024-01-01',
      level: 15,
      totalGrep: 5000,
    },
  }

  if (options.includeGames) {
    exportData.games = [
      { id: '1', game: 'snake', score: 1500, grepEarned: 150, playedAt: '2024-12-01' },
      { id: '2', game: 'tetris', score: 3200, grepEarned: 320, playedAt: '2024-12-02' },
      { id: '3', game: 'memory', score: 800, grepEarned: 80, playedAt: '2024-12-03' },
    ]
  }

  if (options.includeAchievements) {
    exportData.achievements = [
      { id: 'first_game', name: 'First Steps', unlockedAt: '2024-01-01' },
      { id: 'gamer_10', name: 'Getting Started', unlockedAt: '2024-01-15' },
      { id: 'score_10k', name: 'Point Collector', unlockedAt: '2024-02-01' },
    ]
  }

  if (options.includeTransactions) {
    exportData.transactions = [
      { id: '1', type: 'earn', amount: 150, source: 'game', date: '2024-12-01' },
      { id: '2', type: 'earn', amount: 320, source: 'game', date: '2024-12-02' },
      { id: '3', type: 'stake', amount: -500, source: 'staking', date: '2024-12-05' },
      { id: '4', type: 'reward', amount: 100, source: 'daily', date: '2024-12-06' },
    ]
  }

  if (options.includeActivity) {
    exportData.activity = [
      { type: 'login', date: '2024-12-01T10:00:00Z' },
      { type: 'game_played', game: 'snake', date: '2024-12-01T10:05:00Z' },
      { type: 'achievement', name: 'Point Collector', date: '2024-12-01T10:06:00Z' },
    ]
  }

  return NextResponse.json(exportData)
}
