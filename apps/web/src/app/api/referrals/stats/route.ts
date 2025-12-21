import { NextResponse } from 'next/server'

export async function GET() {
  // Would fetch from database
  const stats = {
    referralCode: 'ABC123',
    referralCount: 12,
    totalEarned: 1650,
    pendingRewards: 250,
    referrals: [
      { id: '1', wallet: '0x1234567890abcdef1234567890abcdef12345678', joinedAt: new Date('2024-12-01'), gamesPlayed: 15, earned: 125 },
      { id: '2', wallet: '0xabcdef1234567890abcdef1234567890abcdef12', joinedAt: new Date('2024-12-05'), gamesPlayed: 8, earned: 125 },
      { id: '3', wallet: '0x9876543210fedcba9876543210fedcba98765432', joinedAt: new Date('2024-12-10'), gamesPlayed: 3, earned: 100 },
    ],
  }

  return NextResponse.json(stats)
}
