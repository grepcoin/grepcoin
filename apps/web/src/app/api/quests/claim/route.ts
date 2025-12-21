import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { questId } = await req.json()
  return NextResponse.json({ success: true, questId })
}
