import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Simple admin key check - set ADMIN_API_KEY in Vercel env vars
const ADMIN_API_KEY = process.env.ADMIN_API_KEY

export async function GET(request: NextRequest) {
  // Check for admin API key
  const authHeader = request.headers.get('authorization')
  const apiKey = authHeader?.replace('Bearer ', '')

  if (!ADMIN_API_KEY || apiKey !== ADMIN_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'
    const limit = parseInt(searchParams.get('limit') || '1000')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get signups with pagination
    const [signups, total] = await Promise.all([
      prisma.launchSignup.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          email: true,
          source: true,
          referrer: true,
          verified: true,
          createdAt: true,
        },
      }),
      prisma.launchSignup.count(),
    ])

    // CSV format for easy export
    if (format === 'csv') {
      const csvHeader = 'id,email,source,referrer,verified,createdAt\n'
      const csvRows = signups
        .map(s => `${s.id},${s.email},${s.source},${s.referrer || ''},${s.verified},${s.createdAt.toISOString()}`)
        .join('\n')

      return new NextResponse(csvHeader + csvRows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="grepcoin-signups-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    // Emails only format for quick copy
    if (format === 'emails') {
      const emails = signups.map(s => s.email).join('\n')
      return new NextResponse(emails, {
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    }

    // Default JSON format
    return NextResponse.json({
      signups,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      stats: {
        total,
        sources: await prisma.launchSignup.groupBy({
          by: ['source'],
          _count: { source: true },
        }),
      },
    })
  } catch (error) {
    console.error('Admin signups error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch signups' },
      { status: 500 }
    )
  }
}

// Delete a signup (for GDPR/unsubscribe requests)
export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const apiKey = authHeader?.replace('Bearer ', '')

  if (!ADMIN_API_KEY || apiKey !== ADMIN_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const deleted = await prisma.launchSignup.delete({
      where: { email: email.toLowerCase().trim() },
    })

    return NextResponse.json({
      message: 'Signup deleted',
      email: deleted.email,
    })
  } catch (error) {
    console.error('Admin delete signup error:', error)
    return NextResponse.json(
      { error: 'Failed to delete signup' },
      { status: 500 }
    )
  }
}
