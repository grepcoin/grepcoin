# Push Notifications System

Comprehensive Web Push API implementation for GrepCoin play-to-earn gaming platform.

## Overview

The push notification system allows users to receive real-time notifications about:
- Achievement unlocks and rewards
- GREP token earnings
- Friend requests and social interactions
- Tournament starts and results
- Auction updates
- System announcements

## Architecture

### Components

1. **Client-side** (`/src`)
   - `lib/push-notifications.ts` - Utilities and helper functions
   - `hooks/usePushNotifications.ts` - React hooks for managing subscriptions
   - `components/PushNotificationPrompt.tsx` - UI component for permission requests
   - `public/sw-push.js` - Service Worker for handling push events

2. **Server-side** (`/src/app/api/notifications`)
   - `subscribe/route.ts` - Save push subscriptions
   - `unsubscribe/route.ts` - Remove subscriptions
   - `send/route.ts` - Send notifications (internal API)
   - `test/route.ts` - Test notification endpoint
   - `lib/send-push.ts` - Server-side notification sender

3. **Database**
   - `PushSubscription` model - Stores user push subscriptions
   - `User.notificationPreferences` - JSON field for user preferences

## Setup

### 1. Install Dependencies

```bash
npm install web-push
npm install --save-dev @types/web-push
```

### 2. Generate VAPID Keys

VAPID keys are required for Web Push authentication:

```bash
npx web-push generate-vapid-keys
```

### 3. Configure Environment Variables

Add to `.env.local`:

```env
# Push Notifications (Web Push API)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-public-key-here"
VAPID_PRIVATE_KEY="your-private-key-here"
VAPID_EMAIL="hello@greplabs.io"

# Internal API Key (for server-to-server communication)
INTERNAL_API_KEY="your-secure-random-key-here"
```

### 4. Update Database Schema

```bash
npx prisma migrate dev --name add_push_notifications
# or
npx prisma db push
```

## Usage

### Client-side: Enable Notifications

```tsx
import { usePushNotifications } from '@/hooks/usePushNotifications'
import PushNotificationPrompt from '@/components/PushNotificationPrompt'

function SettingsPage() {
  const { isSubscribed, subscribeToPush, unsubscribeFromPush } = usePushNotifications(userId)

  return (
    <PushNotificationPrompt userId={userId} />
  )
}
```

### Server-side: Send Notifications

```typescript
import { sendToUser, sendToAll } from '@/lib/send-push'
import { NotificationType, createNotificationPayload } from '@/lib/push-notifications'

// Send to a specific user
const notification = createNotificationPayload(
  NotificationType.ACHIEVEMENT,
  'Achievement Unlocked!',
  'You earned the "First Win" achievement and 500 GREP!',
  {
    icon: '/icon.svg',
    url: '/achievements',
  }
)

await sendToUser(userId, notification)

// Broadcast to all users
await sendToAll(notification)
```

### Using the Internal API

```typescript
// Send notification via API
const response = await fetch('/api/notifications/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.INTERNAL_API_KEY,
  },
  body: JSON.stringify({
    userIds: ['user1', 'user2'], // Optional: omit to send to all
    notification: {
      type: 'reward',
      title: 'Daily Reward',
      body: 'You earned 100 GREP!',
      icon: '/icon.svg',
      url: '/rewards',
    },
  }),
})
```

## Notification Types

The system supports the following notification types:

- `ACHIEVEMENT` - Achievement unlocks
- `REWARD` - Token earnings and rewards
- `FRIEND` - Friend requests and social interactions
- `TOURNAMENT` - Tournament updates
- `AUCTION` - Auction bids and results
- `SYSTEM` - Platform announcements

## User Preferences

Users can control which types of notifications they receive:

```typescript
import { useNotificationPreferences } from '@/hooks/usePushNotifications'

const { preferences, updatePreferences } = useNotificationPreferences(userId)

// Update preferences
await updatePreferences({
  achievements: true,
  rewards: true,
  friends: false,
  tournaments: true,
  auctions: true,
  system: true,
})
```

## Service Worker

The service worker (`/public/sw-push.js`) handles:
- Receiving push notifications
- Displaying notifications with custom icons and badges
- Handling notification clicks (opening the app)
- Deep linking to specific pages

## Security

1. **VAPID Keys** - Prevents unauthorized notification sending
2. **Internal API Key** - Protects server-to-server endpoints
3. **User Permissions** - Browser-level notification permissions
4. **Subscription Validation** - Server validates all subscriptions

## Error Handling

The system automatically:
- Cleans up invalid subscriptions (410 Gone, 404 Not Found)
- Retries failed deliveries
- Logs errors for debugging
- Handles permission denials gracefully

## Testing

### Test Notification Button

Users can send themselves a test notification from Settings:

```tsx
// This is already implemented in /app/settings/page.tsx
<button onClick={handleTestNotification}>
  Send Test Notification
</button>
```

### Manual Testing

```bash
# Send test notification
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-user-id"}'
```

## Browser Support

- Chrome/Edge 42+
- Firefox 44+
- Safari 16+ (macOS 13+, iOS 16.4+)
- Opera 37+

## Best Practices

1. **Request Permission Contextually** - Ask for permission when users engage with features
2. **Respect User Preferences** - Honor notification type preferences
3. **Batch Notifications** - Group similar notifications to avoid spam
4. **Clean Up Subscriptions** - Remove invalid subscriptions automatically
5. **Monitor Delivery** - Track sent/failed notifications
6. **Rate Limiting** - Implement rate limits to prevent abuse

## Database Schema

```prisma
model User {
  notificationPreferences Json?
  pushSubscriptions PushSubscription[]
}

model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  endpoint  String   @unique
  p256dh    String
  auth      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([endpoint])
}
```

## Integration Examples

### Achievement Unlock

```typescript
// In achievement claim endpoint
const achievement = await prisma.achievement.findUnique({
  where: { id: achievementId }
})

const notification = createNotificationPayload(
  NotificationType.ACHIEVEMENT,
  'Achievement Unlocked!',
  `You earned "${achievement.name}" and ${achievement.reward} GREP!`,
  {
    url: '/achievements',
  }
)

await sendToUser(userId, notification)
```

### Tournament Start

```typescript
// When tournament begins
const participants = await prisma.tournamentParticipant.findMany({
  where: { tournamentId }
})

const notification = createNotificationPayload(
  NotificationType.TOURNAMENT,
  'Tournament Starting!',
  `${tournament.name} is starting now. Good luck!`,
  {
    url: `/tournaments/${tournamentId}`,
  }
)

await sendToUsers(
  participants.map(p => p.userId),
  notification
)
```

## Troubleshooting

### Notifications not appearing

1. Check browser permissions
2. Verify VAPID keys are set correctly
3. Check service worker registration
4. Verify subscription is saved in database

### Service Worker not updating

```typescript
// Force service worker update
navigator.serviceWorker.getRegistration().then(reg => {
  reg?.update()
})
```

### Invalid subscriptions

The system automatically cleans up invalid subscriptions. Check logs for:
- 410 Gone - Subscription expired
- 404 Not Found - Endpoint not found

## Performance

- **Batch Processing** - Sends notifications in batches of 50
- **Async Processing** - Non-blocking notification delivery
- **Connection Pooling** - Reuses HTTP connections
- **Automatic Cleanup** - Removes stale subscriptions

## Monitoring

Track notification metrics:
- Total subscriptions
- Delivery success rate
- Failed deliveries
- Invalid subscriptions cleaned

## Future Enhancements

- [ ] Notification scheduling
- [ ] Rich notifications with images
- [ ] Action buttons in notifications
- [ ] Notification history
- [ ] A/B testing for notification content
- [ ] Analytics dashboard
