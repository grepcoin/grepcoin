import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({
    progress: [
      { achievementId: 'games-played', progress: 75, claimedTiers: ['bronze'] },
      { achievementId: 'total-score', progress: 125000, claimedTiers: ['bronze'] },
      { achievementId: 'referrals', progress: 3, claimedTiers: ['bronze'] },
    ]
  })
}
