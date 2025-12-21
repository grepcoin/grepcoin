# Push Notifications Setup Guide

Quick setup guide for enabling push notifications in GrepCoin.

## 1. Install Dependencies

```bash
cd apps/web
npm install
```

This will install:
- `web-push@^3.6.7` - Web Push library
- `@types/web-push@^3.6.3` - TypeScript types

## 2. Generate VAPID Keys

```bash
npm run generate:vapid
```

This will output your VAPID key pair. Copy the keys to your `.env.local` file.

## 3. Configure Environment Variables

Create or update `.env.local`:

```env
# Database (NeonDB PostgreSQL)
DATABASE_URL="your-database-url"
DIRECT_URL="your-direct-url"

# Push Notifications (Web Push API)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BNfX...your-public-key"
VAPID_PRIVATE_KEY="abc123...your-private-key"
VAPID_EMAIL="hello@greplabs.io"

# Internal API Key (for server-to-server communication)
INTERNAL_API_KEY="your-secure-random-key-here"
```

**Security Notes:**
- Never commit VAPID private keys to version control
- Use different keys for development and production
- Keep the internal API key secure and rotate periodically

## 4. Update Database Schema

Run the migration:

```bash
npm run db:push
# or
npm run db:migrate
```

This adds:
- `PushSubscription` table for storing user subscriptions
- `notificationPreferences` JSON field to User table

## 5. Verify Installation

Start the development server:

```bash
npm run dev
```

Navigate to http://localhost:3000/settings and:

1. Connect your wallet
2. Look for the "Push Notifications" section
3. Click "Enable Notifications"
4. Grant permission when prompted
5. Click "Send Test Notification"
6. You should receive a test notification

## File Structure

The push notification system consists of:

### Client-side Files
- `src/lib/push-notifications.ts` - Core utilities
- `src/hooks/usePushNotifications.ts` - React hooks
- `src/components/PushNotificationPrompt.tsx` - UI component
- `public/sw-push.js` - Service worker

### Server-side Files
- `src/lib/send-push.ts` - Notification sender
- `src/lib/notification-examples.ts` - Usage examples
- `src/app/api/notifications/subscribe/route.ts` - Subscribe endpoint
- `src/app/api/notifications/unsubscribe/route.ts` - Unsubscribe endpoint
- `src/app/api/notifications/send/route.ts` - Send endpoint (internal)
- `src/app/api/notifications/test/route.ts` - Test endpoint
- `src/app/api/users/notification-preferences/route.ts` - Preferences endpoint

### Integration
- `src/app/settings/page.tsx` - Settings page with notification controls

## Usage Examples

### Send Achievement Notification

```typescript
import { sendToUser } from '@/lib/send-push'
import { NotificationType, createNotificationPayload } from '@/lib/push-notifications'

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
```

### Send to Multiple Users

```typescript
import { sendToUsers } from '@/lib/send-push'

await sendToUsers(['user1', 'user2', 'user3'], notification)
```

### Broadcast to All Users

```typescript
import { sendToAll } from '@/lib/send-push'

await sendToAll(notification, {
  batchSize: 100,
  delayBetweenBatches: 2000,
})
```

## Testing

### Manual Test

1. Go to Settings page
2. Enable push notifications
3. Click "Send Test Notification"
4. Check your browser notifications

### API Test

```bash
# Send test notification
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-user-id"}'
```

### Internal API Test

```bash
# Send notification via internal API
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-internal-api-key" \
  -d '{
    "userIds": ["user1"],
    "notification": {
      "type": "system",
      "title": "Test",
      "body": "This is a test",
      "icon": "/icon.svg",
      "url": "/"
    }
  }'
```

## Browser Requirements

Modern browsers with Push API support:
- Chrome/Edge 42+
- Firefox 44+
- Safari 16+ (macOS 13+, iOS 16.4+)
- Opera 37+

## Troubleshooting

### Notifications not appearing

1. **Check browser permissions:**
   - Chrome: Settings > Privacy and security > Site Settings > Notifications
   - Firefox: Preferences > Privacy & Security > Permissions > Notifications
   - Safari: Settings > Websites > Notifications

2. **Verify VAPID keys:**
   - Ensure `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is set
   - Ensure `VAPID_PRIVATE_KEY` is set
   - Keys should match (generated together)

3. **Check service worker:**
   - Open DevTools > Application > Service Workers
   - Verify `sw-push.js` is registered and active

4. **Check database:**
   - Verify subscription is saved in `PushSubscription` table
   - Check `endpoint`, `p256dh`, and `auth` fields

### Service Worker Issues

Clear and re-register:
```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  reg?.unregister()
  location.reload()
})
```

### HTTPS Required

Web Push requires HTTPS in production. For local development:
- `localhost` works without HTTPS
- Use ngrok for testing with external devices

## Production Deployment

1. **Generate production VAPID keys:**
   ```bash
   npm run generate:vapid
   ```

2. **Set environment variables** in your hosting platform:
   - Vercel: Settings > Environment Variables
   - Railway: Variables tab
   - Netlify: Site settings > Environment variables

3. **Update database:**
   ```bash
   npm run db:push
   ```

4. **Deploy:**
   ```bash
   npm run build
   ```

## Security Checklist

- [ ] VAPID private key is not in version control
- [ ] Internal API key is secure and unique
- [ ] Production uses different keys than development
- [ ] HTTPS is enabled in production
- [ ] Rate limiting is configured
- [ ] User preferences are respected

## Next Steps

1. Integrate notifications into your features:
   - Achievement unlocks
   - Tournament starts
   - Friend requests
   - Auction updates
   - Daily rewards

2. See `src/lib/notification-examples.ts` for integration examples

3. Monitor notification delivery and user engagement

4. Implement analytics to track notification effectiveness

## Support

For detailed documentation, see:
- [PUSH_NOTIFICATIONS.md](./PUSH_NOTIFICATIONS.md) - Full documentation
- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
