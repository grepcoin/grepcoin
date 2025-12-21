import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { badgeId } = await req.json()

  // Would update in database
  return NextResponse.json({ success: true, badgeId })
}
