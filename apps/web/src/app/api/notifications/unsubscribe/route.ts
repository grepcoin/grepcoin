import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { endpoint, userId } = body

    if (!endpoint && !userId) {
      return NextResponse.json(
        { error: 'Endpoint or User ID is required' },
        { status: 400 }
      )
    }

    // Delete by endpoint (preferred)
    if (endpoint) {
      const deleted = await prisma.pushSubscription.delete({
        where: { endpoint },
      })

      return NextResponse.json({
        success: true,
        message: 'Subscription removed',
        deleted,
      })
    }

    // Delete all subscriptions for a user
    if (userId) {
      const result = await prisma.pushSubscription.deleteMany({
        where: { userId },
      })

      return NextResponse.json({
        success: true,
        message: `${result.count} subscription(s) removed`,
        count: result.count,
      })
    }

    return NextResponse.json(
      { error: 'No valid identifier provided' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error removing push subscription:', error)

    // Handle case where subscription doesn't exist
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: true,
        message: 'Subscription already removed',
      })
    }

    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    )
  }
}
