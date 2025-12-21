import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { rewardId } = await req.json()

  // Would validate and update database
  return NextResponse.json({ success: true, rewardId })
}
