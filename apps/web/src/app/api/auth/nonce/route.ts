import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generateNonce } from '@/lib/auth'

export async function GET() {
  const nonce = generateNonce()

  // Store nonce in cookie for verification
  const cookieStore = await cookies()
  cookieStore.set('siwe-nonce', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 5, // 5 minutes
    path: '/',
  })

  return NextResponse.json({ nonce })
}
