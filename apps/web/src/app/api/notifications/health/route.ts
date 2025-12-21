import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Health check endpoint for push notification system
 * GET /api/notifications/health
 */
export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {
      vapidKeys: false,
      database: false,
      serviceAvailable: true,
    },
    stats: {
      totalSubscriptions: 0,
      activeUsers: 0,
    },
    errors: [] as string[],
  }

  // Check VAPID keys
  try {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY

    if (!publicKey || !privateKey) {
      health.checks.vapidKeys = false
      health.errors.push('VAPID keys not configured')
    } else {
      health.checks.vapidKeys = true
    }
  } catch (error: any) {
    health.checks.vapidKeys = false
    health.errors.push(`VAPID check failed: ${error.message}`)
  }

  // Check database connectivity
  try {
    const count = await prisma.pushSubscription.count()
    health.checks.database = true
    health.stats.totalSubscriptions = count

    // Count unique users with subscriptions
    const uniqueUsers = await prisma.pushSubscription.groupBy({
      by: ['userId'],
    })
    health.stats.activeUsers = uniqueUsers.length
  } catch (error: any) {
    health.checks.database = false
    health.errors.push(`Database check failed: ${error.message}`)
  }

  // Overall status
  if (health.errors.length > 0) {
    health.status = 'degraded'
  }

  if (!health.checks.vapidKeys || !health.checks.database) {
    health.status = 'error'
  }

  const statusCode = health.status === 'ok' ? 200 : health.status === 'degraded' ? 207 : 500

  return NextResponse.json(health, { status: statusCode })
}
