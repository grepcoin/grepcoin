# Email Notifications System

A comprehensive email notification system for the GrepCoin play-to-earn gaming platform.

## Features

- Email subscription and verification
- Per-type email preferences (6 notification types)
- Beautiful HTML email templates with GrepCoin branding
- Rate limiting to prevent abuse
- Email queue with retry logic
- Weekly digest emails
- Responsive design with inline styles

## Setup

### 1. Install Dependencies

The `resend` package is already installed. If needed, run:

```bash
npm install resend
```

### 2. Configure Environment Variables

Add these to your `.env` file:

```env
# Resend API Key (get from https://resend.com)
RESEND_API_KEY="re_your_api_key_here"
EMAIL_FROM="GrepCoin <noreply@grepcoin.io>"

# App URL for verification links
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Internal API key for protected endpoints
INTERNAL_API_KEY="your-secure-random-key"
```

### 3. Update Database Schema

Run Prisma migrations to add the email tables:

```bash
npx prisma migrate dev --name add_email_notifications
```

Or push directly:

```bash
npx prisma db push
```

### 4. Setup Resend Account

1. Sign up at [https://resend.com](https://resend.com)
2. Verify your domain or use their test domain
3. Get your API key from the dashboard
4. Add the API key to your `.env` file

## Email Types

The system supports 6 types of email notifications:

1. **WELCOME** - Sent after email verification
2. **WEEKLY_DIGEST** - Weekly stats summary
3. **ACHIEVEMENT** - When user unlocks an achievement
4. **REWARD_CLAIM** - When GREP tokens are ready to claim
5. **TOURNAMENT_START** - When tournaments begin
6. **FRIEND_REQUEST** - When receiving friend requests

## Usage

### Client-Side (React)

```tsx
import { useEmailPreferences } from '@/hooks/useEmailPreferences'

function MyComponent() {
  const {
    status,
    loading,
    subscribeEmail,
    updatePreferences,
    resendVerification,
  } = useEmailPreferences()

  // Subscribe to emails
  const handleSubscribe = async () => {
    const result = await subscribeEmail('user@example.com')
    if (result.success) {
      console.log('Verification email sent!')
    }
  }

  // Update preferences
  const handleToggle = async () => {
    await updatePreferences({
      weeklyDigestEnabled: false,
      achievementEnabled: true,
    })
  }

  return (
    <div>
      {status?.verified ? (
        <p>Email verified: {status.email}</p>
      ) : (
        <button onClick={handleSubscribe}>Add Email</button>
      )}
    </div>
  )
}
```

### Server-Side

```typescript
import { sendEmail } from '@/lib/send-email'
import { EmailType } from '@prisma/client'

// Send achievement email
await sendEmail(
  'user@example.com',
  EmailType.ACHIEVEMENT,
  {
    username: 'Player',
    achievement: {
      name: 'High Score Master',
      description: 'Score 10,000+ points in a single game',
      icon: '🏆',
      rarity: 'legendary',
      reward: 1000,
    },
  },
  { userId: 'user-id-here' }
)
```

### Send Weekly Digests (Cron Job)

Create a cron job or API route to run weekly:

```typescript
import { sendWeeklyDigests } from '@/lib/send-email'

// Run every Sunday at 9 AM
const results = await sendWeeklyDigests()
console.log(`Sent: ${results.sent}, Failed: ${results.failed}`)
```

## API Routes

### POST /api/email/subscribe

Add email to user account and send verification.

```json
{
  "email": "user@example.com",
  "walletAddress": "0x..."
}
```

### GET /api/email/verify

Verify email with token (accessed via email link).

```
/api/email/verify?token=abc123&email=user@example.com
```

### GET /api/email/preferences

Get user's email preferences.

```
/api/email/preferences?walletAddress=0x...
```

### PUT /api/email/preferences

Update email preferences.

```json
{
  "walletAddress": "0x...",
  "preferences": {
    "weeklyDigestEnabled": true,
    "achievementEnabled": false
  }
}
```

### DELETE /api/email/preferences

Remove email and unsubscribe from all.

```
/api/email/preferences?walletAddress=0x...
```

### POST /api/email/send (Protected)

Internal route for sending emails. Requires `x-api-key` header.

```json
{
  "to": "user@example.com",
  "emailType": "ACHIEVEMENT",
  "data": { "username": "Player", "achievement": {...} },
  "userId": "user-id"
}
```

## Database Models

### EmailSettings

Stores user email and preferences.

```prisma
model EmailSettings {
  id        String   @id @default(cuid())
  userId    String   @unique
  email     String?
  verified  Boolean  @default(false)

  // Preferences
  welcomeEnabled          Boolean @default(true)
  weeklyDigestEnabled     Boolean @default(true)
  achievementEnabled      Boolean @default(true)
  rewardClaimEnabled      Boolean @default(true)
  tournamentStartEnabled  Boolean @default(true)
  friendRequestEnabled    Boolean @default(true)
  unsubscribedAll         Boolean @default(false)

  user User @relation(...)
}
```

### EmailVerification

Stores verification tokens.

```prisma
model EmailVerification {
  id        String   @id @default(cuid())
  userId    String
  email     String
  token     String   @unique
  expiresAt DateTime
  verified  Boolean  @default(false)
}
```

### EmailQueue

Tracks sent emails with retry logic.

```prisma
model EmailQueue {
  id          String      @id @default(cuid())
  userId      String?
  email       String
  emailType   EmailType
  subject     String
  htmlContent String
  status      EmailStatus @default(PENDING)
  attempts    Int         @default(0)
  sentAt      DateTime?
}
```

## Email Templates

All templates are responsive HTML with inline styles for maximum email client compatibility.

Templates include:
- Base template with GrepCoin branding
- Welcome email
- Weekly digest with stats and achievements
- Achievement unlocked
- Reward claim notification
- Tournament starting
- Friend request notification
- Email verification

## Rate Limiting

Built-in rate limiting prevents abuse:

- Verification emails: 3 per hour per user
- General emails: 10 per hour per user

## Error Handling

The system includes:
- Automatic retry for failed emails (up to 3 attempts)
- Error logging in database
- Graceful fallbacks for missing data

## Components

### EmailVerificationBanner

Shows when email is added but not verified.

```tsx
<EmailVerificationBanner
  onResend={resendVerification}
  onDismiss={() => {}}
/>
```

## Testing

### Test Email Locally

Use Resend's test mode or set up a test domain:

```typescript
// Send test achievement email
await sendEmail(
  'test@example.com',
  EmailType.ACHIEVEMENT,
  {
    username: 'TestUser',
    achievement: {
      name: 'Test Achievement',
      description: 'This is a test',
      icon: '🎮',
      rarity: 'common',
      reward: 100,
    },
  },
  { skipPreferenceCheck: true }
)
```

## Production Checklist

- [ ] Set up verified domain in Resend
- [ ] Update EMAIL_FROM with your verified domain
- [ ] Change INTERNAL_API_KEY to a secure random string
- [ ] Set up cron job for weekly digests
- [ ] Test email delivery to major providers (Gmail, Outlook, etc.)
- [ ] Monitor EmailQueue table for failed sends
- [ ] Set up alerts for high failure rates

## Cron Jobs

Set up these scheduled tasks:

### Weekly Digest (Sundays at 9 AM)

```typescript
// In your cron handler
import { sendWeeklyDigests } from '@/lib/send-email'

export async function weeklyDigestCron() {
  const results = await sendWeeklyDigests()
  console.log(`Weekly digests sent: ${results.sent}, failed: ${results.failed}`)
  return results
}
```

### Retry Failed Emails (Every hour)

```typescript
import { retryFailedEmails } from '@/lib/send-email'

export async function retryEmailsCron() {
  const results = await retryFailedEmails()
  console.log(`Retried: ${results.retried}, succeeded: ${results.succeeded}`)
  return results
}
```

## Troubleshooting

### Emails not sending

1. Check RESEND_API_KEY is set correctly
2. Verify domain in Resend dashboard
3. Check EmailQueue table for errors
4. Review Resend dashboard logs

### Verification emails not received

1. Check spam folder
2. Verify email format is valid
3. Check rate limiting hasn't been exceeded
4. Review EmailQueue table status

### Preferences not saving

1. Check user has verified email
2. Verify wallet address is correct
3. Check network requests in browser dev tools
4. Review API route logs

## Support

For issues or questions:
- Check the EmailQueue table for delivery errors
- Review Resend dashboard for delivery status
- Check application logs for detailed error messages

## License

MIT - GrepCoin Platform
