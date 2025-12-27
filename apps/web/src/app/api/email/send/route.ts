// POST /api/email/send - Internal route to send emails (protected)
import { NextRequest, NextResponse } from 'next/server'
import { EmailType } from '@prisma/client'
import { sendEmail } from '@/lib/send-email'
import { checkRateLimit } from '@/lib/email'

// This should be protected by an API key in production
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'dev-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    // Verify internal API key
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== INTERNAL_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { to, emailType, data, userId } = body

    // Validate input
    if (!to || !emailType || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: to, emailType, data' },
        { status: 400 }
      )
    }

    // Validate email type
    if (!Object.values(EmailType).includes(emailType)) {
      return NextResponse.json(
        { error: 'Invalid email type' },
        { status: 400 }
      )
    }

    // Check rate limit if userId provided
    if (userId) {
      const rateLimit = checkRateLimit(userId, 'GENERAL')
      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            resetAt: rateLimit.resetAt?.toISOString(),
          },
          { status: 429 }
        )
      }
    }

    // Send email
    const result = await sendEmail(to, emailType, data, { userId })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email queued for sending',
      emailId: result.emailId,
    })
  } catch (error: unknown) {
    console.error('Error in /api/email/send:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET - Check email queue status (for debugging)
export async function GET(request: NextRequest) {
  try {
    // Verify internal API key
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== INTERNAL_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const emailId = searchParams.get('emailId')

    if (!emailId) {
      return NextResponse.json(
        { error: 'emailId parameter required' },
        { status: 400 }
      )
    }

    const { prisma } = await import('@/lib/db')
    const emailQueue = await prisma.emailQueue.findUnique({
      where: { id: emailId },
      select: {
        id: true,
        email: true,
        emailType: true,
        subject: true,
        status: true,
        attempts: true,
        lastError: true,
        sentAt: true,
        createdAt: true,
      },
    })

    if (!emailQueue) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(emailQueue)
  } catch (error: unknown) {
    console.error('Error in GET /api/email/send:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
