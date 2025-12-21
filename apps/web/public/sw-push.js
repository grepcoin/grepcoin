// Service Worker for Push Notifications
// GrepCoin Play-to-Earn Gaming Platform

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(self.clients.claim())
})

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)

  if (!event.data) {
    console.log('No data in push event')
    return
  }

  let data
  try {
    data = event.data.json()
  } catch (error) {
    console.error('Error parsing push data:', error)
    return
  }

  const title = data.title || 'GrepCoin'
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/icon.svg',
    badge: data.badge || '/icon.svg',
    data: data.data || {},
    tag: data.data?.type || 'default',
    requireInteraction: false,
    vibrate: [200, 100, 200],
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)

  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event)
})

// Handle messages from the client
self.addEventListener('message', (event) => {
  console.log('Message received in service worker:', event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
