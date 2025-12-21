import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { source, amount } = await req.json()
  // Would update database
  return NextResponse.json({ success: true, xpAdded: amount, source })
}
