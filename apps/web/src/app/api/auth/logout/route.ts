import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  cookieStore.delete('siwe-nonce')

  return NextResponse.json({ success: true })
}
