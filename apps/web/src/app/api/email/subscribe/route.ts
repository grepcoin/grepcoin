// POST /api/email/subscribe - Add email to user account
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isValidEmail, generateVerificationToken, checkRateLimit, EMAIL_CONFIG } from '@/lib/email'
import { sendVerificationEmail } from '@/lib/send-email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, walletAddress } = body

    // Validate input
    if (!email || !walletAddress) {
      return NextResponse.json(
        { error: 'Email and wallet address required' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check rate limit
    const rateLimit = checkRateLimit(walletAddress, 'VERIFICATION')
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many verification requests',
          resetAt: rateLimit.resetAt?.toISOString(),
        },
        { status: 429 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      include: { emailSettings: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email is already in use by another user
    const existingEmail = await prisma.emailSettings.findFirst({
      where: {
        email,
        userId: { not: user.id },
        verified: true,
      },
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already in use by another account' },
        { status: 409 }
      )
    }

    // Generate verification token
    const token = generateVerificationToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + EMAIL_CONFIG.VERIFICATION_EXPIRY_HOURS)

    // Create or update email settings
    const emailSettings = await prisma.emailSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        email,
        verified: false,
        welcomeEnabled: true,
        weeklyDigestEnabled: true,
        achievementEnabled: true,
        rewardClaimEnabled: true,
        tournamentStartEnabled: true,
        friendRequestEnabled: true,
        unsubscribedAll: false,
      },
      update: {
        email,
        verified: false,
      },
    })

    // Create verification record
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        email,
        token,
        expiresAt,
        verified: false,
      },
    })

    // Send verification email
    const result = await sendVerificationEmail(
      user.id,
      email,
      user.username || 'Player',
      token
    )

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send verification email', details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
      email,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error: unknown) {
    console.error('Error in /api/email/subscribe:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
