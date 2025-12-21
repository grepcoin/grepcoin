import { NextResponse } from 'next/server'

export async function GET() {
  // Would fetch from database
  const progress = {
    points: 350,
    claimedRewards: ['r1'],
    challengeProgress: [
      { challengeId: 'c1', current: 2, completed: false },
      { challengeId: 'c2', current: 3500, completed: false },
      { challengeId: 'c3', current: 15, completed: false },
      { challengeId: 'c4', current: 35000, completed: false },
      { challengeId: 'c5', current: 45, completed: false },
    ],
  }

  return NextResponse.json(progress)
}
