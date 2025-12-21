import { NextResponse } from 'next/server'

export async function GET() {
  // Would fetch from contract/database in production
  const leaderboard = [
    { address: '0x1234...5678', totalBurned: '500000', tier: 'Gold', burnCount: 15 },
    { address: '0xabcd...efgh', totalBurned: '250000', tier: 'Silver', burnCount: 8 },
    { address: '0x9876...5432', totalBurned: '100000', tier: 'Silver', burnCount: 12 },
  ]

  return NextResponse.json({ leaderboard })
}
