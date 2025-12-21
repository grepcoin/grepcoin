// Push Notification Utilities for GrepCoin

export enum NotificationType {
  ACHIEVEMENT = 'achievement',
  REWARD = 'reward',
  FRIEND = 'friend',
  TOURNAMENT = 'tournament',
  AUCTION = 'auction',
  SYSTEM = 'system',
}

export interface NotificationPayload {
  type: NotificationType
  title: string
  body: string
  icon?: string
  badge?: string
  data?: Record<string, any>
  url?: string
}

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

// VAPID key helpers
export function getPublicVapidKey(): string {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!key) {
    throw new Error('NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set')
  }
  return key
}

export function getPrivateVapidKey(): string {
  const key = process.env.VAPID_PRIVATE_KEY
  if (!key) {
    throw new Error('VAPID_PRIVATE_KEY is not set')
  }
  return key
}

// Convert VAPID key to Uint8Array for subscription
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Check if push notifications are supported
export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  )
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported')
  }

  if (!('Notification' in window)) {
    throw new Error('Notifications are not supported')
  }

  return await Notification.requestPermission()
}

// Check current permission status
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'default'
  }
  return Notification.permission
}

// Create notification payload with defaults
export function createNotificationPayload(
  type: NotificationType,
  title: string,
  body: string,
  options?: Partial<NotificationPayload>
): NotificationPayload {
  return {
    type,
    title,
    body,
    icon: options?.icon || '/icon.svg',
    badge: options?.badge || '/icon.svg',
    data: options?.data || {},
    url: options?.url || '/',
  }
}

// Get icon for notification type
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    [NotificationType.ACHIEVEMENT]: '/icon.svg',
    [NotificationType.REWARD]: '/icon.svg',
    [NotificationType.FRIEND]: '/icon.svg',
    [NotificationType.TOURNAMENT]: '/icon.svg',
    [NotificationType.AUCTION]: '/icon.svg',
    [NotificationType.SYSTEM]: '/icon.svg',
  }
  return icons[type]
}

// Validate push subscription object
export function isValidPushSubscription(
  subscription: any
): subscription is PushSubscription {
  return (
    subscription &&
    typeof subscription.endpoint === 'string' &&
    subscription.keys &&
    typeof subscription.keys.p256dh === 'string' &&
    typeof subscription.keys.auth === 'string'
  )
}

// Convert PushSubscription to plain object for storage
export function serializePushSubscription(
  subscription: PushSubscription
): PushSubscriptionData {
  const keys = subscription.toJSON().keys
  if (!keys?.p256dh || !keys?.auth) {
    throw new Error('Invalid subscription keys')
  }

  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  }
}
