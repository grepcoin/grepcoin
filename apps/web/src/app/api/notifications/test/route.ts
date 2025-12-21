import { NextRequest, NextResponse } from 'next/server'
import { sendToUser } from '@/lib/send-push'
import { NotificationType, createNotificationPayload } from '@/lib/push-notifications'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const notification = createNotificationPayload(
      NotificationType.SYSTEM,
      'Test Notification',
      'This is a test notification from GrepCoin! Your push notifications are working correctly.',
      {
        icon: '/icon.svg',
        badge: '/icon.svg',
        url: '/settings',
        data: {
          timestamp: new Date().toISOString(),
        },
      }
    )

    const results = await sendToUser(userId, notification)

    return NextResponse.json({
      success: true,
      message: 'Test notification sent',
      sent: results.sent,
      failed: results.failed,
    })
  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    )
  }
}
