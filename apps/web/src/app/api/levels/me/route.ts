import { NextResponse } from 'next/server'
export async function GET() {
  // Would fetch from database
  return NextResponse.json({ xp: 2500, gamesPlayed: 45 })
}
