import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source = 'launch_page', referrer } = body

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Check if email already exists
    const existing = await prisma.launchSignup.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      return NextResponse.json(
        { message: 'You are already signed up!', alreadySignedUp: true },
        { status: 200 }
      )
    }

    // Create signup
    const signup = await prisma.launchSignup.create({
      data: {
        email: normalizedEmail,
        source,
        referrer,
        ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : ipAddress,
        userAgent: userAgent.substring(0, 500), // Limit length
      },
    })

    // Get total signups count
    const totalSignups = await prisma.launchSignup.count()

    return NextResponse.json({
      message: 'Successfully signed up!',
      id: signup.id,
      position: totalSignups,
    })
  } catch (error) {
    console.error('Launch signup error:', error)
    return NextResponse.json(
      { error: 'Failed to sign up. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const count = await prisma.launchSignup.count()

    return NextResponse.json({
      totalSignups: count,
      launchDate: '2026-01-31T12:00:00Z',
    })
  } catch (error) {
    console.error('Launch stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
