// Server-side push notification sender using web-push
import webpush from 'web-push'
import { NotificationPayload } from './push-notifications'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Initialize web-push with VAPID keys
function initializeWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const email = process.env.VAPID_EMAIL || 'hello@greplabs.io'

  if (!publicKey || !privateKey) {
    console.warn('VAPID keys not configured. Push notifications will not work.')
    return false
  }

  webpush.setVapidDetails(`mailto:${email}`, publicKey, privateKey)
  return true
}

// Initialize on module load
const isInitialized = initializeWebPush()

// Web-push subscription format
interface WebPushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

// Send push notification to a single subscription
export async function sendPushNotification(
  subscription: WebPushSubscription | { endpoint: string; p256dh: string; auth: string },
  notification: NotificationPayload
): Promise<void> {
  if (!isInitialized) {
    throw new Error('Web push is not initialized. Check VAPID keys.')
  }

  // Normalize subscription format for web-push
  const normalizedSubscription: WebPushSubscription = 'keys' in subscription
    ? subscription
    : {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      }

  const payload = JSON.stringify({
    title: notification.title,
    body: notification.body,
    icon: notification.icon || '/icon.svg',
    badge: notification.badge || '/icon.svg',
    data: {
      type: notification.type,
      url: notification.url || '/',
      ...notification.data,
    },
  })

  const options = {
    TTL: 24 * 60 * 60, // 24 hours
  }

  try {
    await webpush.sendNotification(normalizedSubscription, payload, options)
  } catch (error: unknown) {
    // Re-throw with status code for cleanup logic
    throw error
  }
}

// Send notification to a specific user (all their devices)
export async function sendToUser(
  userId: string,
  notification: NotificationPayload
): Promise<{ sent: number; failed: number }> {
  if (!isInitialized) {
    throw new Error('Web push is not initialized. Check VAPID keys.')
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  })

  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 }
  }

  const results = {
    sent: 0,
    failed: 0,
  }

  const invalidSubscriptions: string[] = []

  for (const sub of subscriptions) {
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const statusCode = error && typeof error === 'object' && 'statusCode' in error ? (error as { statusCode: number }).statusCode : undefined
      console.error(`Failed to send to user ${userId}:`, errorMessage)
      results.failed++

      // Mark invalid subscriptions for cleanup
      if (statusCode === 410 || statusCode === 404) {
        invalidSubscriptions.push(sub.id)
      }
    }
  }

  // Clean up invalid subscriptions
  if (invalidSubscriptions.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { id: { in: invalidSubscriptions } },
    })
  }

  return results
}

// Broadcast notification to all subscribers
export async function sendToAll(
  notification: NotificationPayload,
  options?: {
    batchSize?: number
    delayBetweenBatches?: number
  }
): Promise<{ sent: number; failed: number }> {
  if (!isInitialized) {
    throw new Error('Web push is not initialized. Check VAPID keys.')
  }

  const batchSize = options?.batchSize || 100
  const delay = options?.delayBetweenBatches || 1000

  const subscriptions = await prisma.pushSubscription.findMany()

  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 }
  }

  const results = {
    sent: 0,
    failed: 0,
  }

  const invalidSubscriptions: string[] = []

  // Process in batches to avoid overwhelming the system
  for (let i = 0; i < subscriptions.length; i += batchSize) {
    const batch = subscriptions.slice(i, i + batchSize)

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
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          const statusCode = error && typeof error === 'object' && 'statusCode' in error ? (error as { statusCode: number }).statusCode : undefined
          console.error(`Failed to send notification:`, errorMessage)
          results.failed++

          if (statusCode === 410 || statusCode === 404) {
            invalidSubscriptions.push(sub.id)
          }
        }
      })
    )

    // Delay between batches
    if (i + batchSize < subscriptions.length && delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  // Clean up invalid subscriptions
  if (invalidSubscriptions.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { id: { in: invalidSubscriptions } },
    })
  }

  return results
}

// Send notification to multiple users by IDs
export async function sendToUsers(
  userIds: string[],
  notification: NotificationPayload
): Promise<{ sent: number; failed: number }> {
  if (!isInitialized) {
    throw new Error('Web push is not initialized. Check VAPID keys.')
  }

  const results = {
    sent: 0,
    failed: 0,
  }

  for (const userId of userIds) {
    const userResults = await sendToUser(userId, notification)
    results.sent += userResults.sent
    results.failed += userResults.failed
  }

  return results
}
