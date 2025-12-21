import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { achievementId, tier } = await req.json()
  return NextResponse.json({ success: true, achievementId, tier })
}
