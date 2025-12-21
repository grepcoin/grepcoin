import { NextResponse } from 'next/server'

export async function POST() {
  // Mock guild leave logic
  return NextResponse.json({ success: true, message: 'Left guild successfully' })
}
