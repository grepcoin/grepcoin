import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { sendPushNotification } from '@/lib/send-push'
import { NotificationPayload } from '@/lib/push-notifications'

const prisma = new PrismaClient()

// Internal API key for server-to-server communication (REQUIRED in production)
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY

export async function POST(req: NextRequest) {
  try {
    // Verify internal API key is configured
    if (!INTERNAL_API_KEY) {
      console.error('INTERNAL_API_KEY environment variable is not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Verify internal API key
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey || apiKey !== INTERNAL_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { userIds, notification } = body as {
      userIds?: string[]
      notification: NotificationPayload
    }

    if (!notification || !notification.title || !notification.body) {
      return NextResponse.json(
        { error: 'Invalid notification payload' },
        { status: 400 }
      )
    }

    // Get subscriptions for specified users or all users
    const subscriptions = await prisma.pushSubscription.findMany({
      where: userIds ? { userId: { in: userIds } } : {},
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
          },
        },
      },
    })

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscribers found',
        sent: 0,
        failed: 0,
      })
    }

    console.log(`Sending notification to ${subscriptions.length} subscribers`)

    // Send notifications in batches to avoid overwhelming the system
    const BATCH_SIZE = 50
    const results = {
      sent: 0,
      failed: 0,
      invalidSubscriptions: [] as string[],
    }

    for (let i = 0; i < subscriptions.length; i += BATCH_SIZE) {
      const batch = subscriptions.slice(i, i + BATCH_SIZE)

      await Promise.all(
        batch.map(async (sub) => {
          try {
            const pushSubscription = {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            }

            await sendPushNotification(pushSubscription, notification)
            results.sent++
          } catch (error: any) {
            console.error(`Failed to send to ${sub.endpoint}:`, error.message)
            results.failed++

            // Clean up invalid subscriptions (410 Gone or 404 Not Found)
            if (error.statusCode === 410 || error.statusCode === 404) {
              results.invalidSubscriptions.push(sub.id)
            }
          }
        })
      )
    }

    // Clean up invalid subscriptions
    if (results.invalidSubscriptions.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: {
          id: { in: results.invalidSubscriptions },
        },
      })
      console.log(`Cleaned up ${results.invalidSubscriptions.length} invalid subscriptions`)
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications sent',
      sent: results.sent,
      failed: results.failed,
      cleaned: results.invalidSubscriptions.length,
    })
  } catch (error) {
    console.error('Error sending push notifications:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}
