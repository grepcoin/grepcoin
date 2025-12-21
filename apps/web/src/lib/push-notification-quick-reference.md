# Push Notifications Quick Reference

## Send Notification (Server-side)

```typescript
import { sendToUser } from '@/lib/send-push'
import { NotificationType, createNotificationPayload } from '@/lib/push-notifications'

// Create notification
const notification = createNotificationPayload(
  NotificationType.ACHIEVEMENT,
  'Title',
  'Body text',
  { url: '/path' }
)

// Send to user
await sendToUser(userId, notification)
```

## Notification Types

```typescript
NotificationType.ACHIEVEMENT  // Achievement unlocks
NotificationType.REWARD       // Token earnings
NotificationType.FRIEND       // Social interactions
NotificationType.TOURNAMENT   // Tournament updates
NotificationType.AUCTION      // Auction events
NotificationType.SYSTEM       // Announcements
```

## Send Methods

```typescript
// Single user
await sendToUser(userId, notification)

// Multiple users
await sendToUsers(['user1', 'user2'], notification)

// All users (broadcast)
await sendToAll(notification, {
  batchSize: 100,
  delayBetweenBatches: 2000
})
```

## Client-side Hook

```typescript
import { usePushNotifications } from '@/hooks/usePushNotifications'

const {
  isSubscribed,
  subscribeToPush,
  unsubscribeFromPush,
  toggleSubscription
} = usePushNotifications(userId)
```

## Notification Options

```typescript
createNotificationPayload(
  type,
  title,
  body,
  {
    icon: '/icon.svg',      // Notification icon
    badge: '/icon.svg',     // Badge icon
    url: '/destination',    // Click destination
    data: { key: 'value' }  // Custom data
  }
)
```

## Common Patterns

### Achievement Unlock
```typescript
await sendToUser(userId, createNotificationPayload(
  NotificationType.ACHIEVEMENT,
  'Achievement Unlocked!',
  `You earned "${name}" and ${reward} GREP!`,
  { url: '/achievements' }
))
```

### Tournament Start
```typescript
await sendToUsers(participantIds, createNotificationPayload(
  NotificationType.TOURNAMENT,
  'Tournament Starting!',
  `${name} is starting now!`,
  { url: `/tournaments/${id}` }
))
```

### Daily Reward
```typescript
await sendToUser(userId, createNotificationPayload(
  NotificationType.REWARD,
  'Daily Reward Available!',
  `Claim your ${amount} GREP!`,
  { url: '/rewards' }
))
```

## API Endpoints

```typescript
// Subscribe
POST /api/notifications/subscribe
{ subscription, userId }

// Unsubscribe
POST /api/notifications/unsubscribe
{ endpoint }

// Send (internal)
POST /api/notifications/send
Headers: { 'x-api-key': INTERNAL_API_KEY }
{ userIds: [...], notification: {...} }

// Test
POST /api/notifications/test
{ userId }
```

## Environment Variables

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_EMAIL="hello@greplabs.io"
INTERNAL_API_KEY="..."
```

## Generate VAPID Keys

```bash
npm run generate:vapid
```
