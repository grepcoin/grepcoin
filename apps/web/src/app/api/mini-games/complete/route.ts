import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { gameId, score, reward } = await req.json()
  // Would save to database
  return NextResponse.json({ success: true, gameId, score, reward })
}
