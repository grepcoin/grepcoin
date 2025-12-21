import { useState, useEffect, useCallback } from 'react'
import {
  isPushNotificationSupported,
  requestNotificationPermission,
  getNotificationPermission,
  urlBase64ToUint8Array,
  getPublicVapidKey,
  serializePushSubscription,
} from '@/lib/push-notifications'

export interface NotificationPreferences {
  enabled: boolean
  achievements: boolean
  rewards: boolean
  friends: boolean
  tournaments: boolean
  auctions: boolean
  system: boolean
}

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported(isPushNotificationSupported())
    setPermission(getNotificationPermission())
  }, [])

  const requestPermission = useCallback(async () => {
    try {
      const newPermission = await requestNotificationPermission()
      setPermission(newPermission)
      return newPermission
    } catch (error) {
      console.error('Error requesting permission:', error)
      throw error
    }
  }, [])

  return {
    permission,
    isSupported,
    requestPermission,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    isDefault: permission === 'default',
  }
}

export function usePushNotifications(userId?: string) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { permission, isSupported, requestPermission, isGranted } = useNotificationPermission()

  // Check subscription status on mount
  useEffect(() => {
    checkSubscription()
  }, [userId])

  const checkSubscription = useCallback(async () => {
    if (!isSupported || !userId) return

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }, [isSupported, userId])

  const subscribeToPush = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser')
      return false
    }

    if (!userId) {
      setError('User ID is required')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      // Request permission if not granted
      let currentPermission = permission
      if (currentPermission !== 'granted') {
        currentPermission = await requestPermission()
      }

      if (currentPermission !== 'granted') {
        setError('Notification permission denied')
        return false
      }

      // Register service worker if not already registered
      let registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw-push.js')
        await navigator.serviceWorker.ready
      }

      // Subscribe to push notifications
      const vapidKey = urlBase64ToUint8Array(getPublicVapidKey())
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey.buffer as ArrayBuffer,
      })

      // Save subscription to server
      const subscriptionData = serializePushSubscription(subscription)
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscriptionData,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription')
      }

      setIsSubscribed(true)
      return true
    } catch (error: any) {
      console.error('Error subscribing to push:', error)
      setError(error.message || 'Failed to subscribe to notifications')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported, userId, permission, requestPermission])

  const unsubscribeFromPush = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe from push
        await subscription.unsubscribe()

        // Remove subscription from server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        })
      }

      setIsSubscribed(false)
      return true
    } catch (error: any) {
      console.error('Error unsubscribing from push:', error)
      setError(error.message || 'Failed to unsubscribe from notifications')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  const toggleSubscription = useCallback(async () => {
    if (isSubscribed) {
      return await unsubscribeFromPush()
    } else {
      return await subscribeToPush()
    }
  }, [isSubscribed, subscribeToPush, unsubscribeFromPush])

  return {
    isSubscribed,
    isLoading,
    error,
    isSupported,
    isGranted,
    subscribeToPush,
    unsubscribeFromPush,
    toggleSubscription,
  }
}

export function useNotificationPreferences(userId?: string) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    achievements: true,
    rewards: true,
    friends: true,
    tournaments: true,
    auctions: true,
    system: true,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadPreferences()
  }, [userId])

  const loadPreferences = async () => {
    if (!userId) return

    try {
      const response = await fetch(`/api/users/notification-preferences?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.preferences) {
          setPreferences(data.preferences)
        }
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error)
    }
  }

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    if (!userId) return

    setIsLoading(true)

    try {
      const updated = { ...preferences, ...newPreferences }
      setPreferences(updated)

      await fetch('/api/users/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          preferences: updated,
        }),
      })
    } catch (error) {
      console.error('Error updating preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    preferences,
    updatePreferences,
    isLoading,
  }
}
