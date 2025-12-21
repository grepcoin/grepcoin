# Email Notifications - Migration Guide

## Prerequisites

1. Resend account (sign up at https://resend.com)
2. Verified domain (or use Resend test domain)
3. API key from Resend dashboard

## Step-by-Step Migration

### Step 1: Install Dependencies

Already installed, but if needed:
```bash
npm install resend
```

### Step 2: Set Up Environment Variables

Add to your `.env` file:

```env
# Resend Configuration
RESEND_API_KEY="re_your_api_key_here"
EMAIL_FROM="GrepCoin <noreply@grepcoin.io>"

# App URL (for verification links)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Internal API Key (generate a secure random string)
INTERNAL_API_KEY="your-secure-random-key"
```

To generate a secure key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Run Database Migration

Generate and apply the migration:

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name add_email_notifications

# Or push directly (for dev)
npx prisma db push
```

This will add three new tables:
- `EmailSettings`
- `EmailVerification`
- `EmailQueue`

### Step 4: Verify Resend Setup

1. Go to https://resend.com/domains
2. Verify your domain (or use onboarding@resend.dev for testing)
3. Update `EMAIL_FROM` in .env with verified domain

### Step 5: Test Email Flow

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `/settings`
3. Connect your wallet
4. Add your email address
5. Check your inbox for verification email
6. Click verification link
7. Configure email preferences

### Step 6: Test Email Sending

Create a test route to send a sample email:

```typescript
// app/api/test-email/route.ts
import { sendEmail } from '@/lib/send-email'
import { EmailType } from '@prisma/client'

export async function GET() {
  const result = await sendEmail(
    'your@email.com',
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

  return Response.json(result)
}
```

Visit `/api/test-email` to send a test email.

### Step 7: Set Up Cron Jobs (Production)

#### Weekly Digest (Sundays at 9 AM)

Using Vercel Cron:

```typescript
// app/api/cron/weekly-digest/route.ts
import { sendWeeklyDigests } from '@/lib/send-email'

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const results = await sendWeeklyDigests()
  return Response.json(results)
}
```

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/weekly-digest",
    "schedule": "0 9 * * 0"
  }]
}
```

#### Retry Failed Emails (Hourly)

```typescript
// app/api/cron/retry-emails/route.ts
import { retryFailedEmails } from '@/lib/send-email'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const results = await retryFailedEmails()
  return Response.json(results)
}
```

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/retry-emails",
    "schedule": "0 * * * *"
  }]
}
```

### Step 8: Integrate with Your App

#### On Achievement Unlock

```typescript
import { notifyAchievementUnlocked } from '@/lib/email-examples'

async function handleAchievementUnlock(userId: string, achievementId: string) {
  // Your existing logic...
  
  // Send email notification
  await onAchievementUnlocked(userId, achievementId)
}
```

#### On Reward Claim Available

```typescript
import { onRewardThresholdReached } from '@/lib/email-examples'

async function checkRewardThreshold(userId: string, totalRewards: number) {
  if (totalRewards >= 1000) { // Threshold
    await onRewardThresholdReached(userId, totalRewards)
  }
}
```

### Step 9: Monitor Email Delivery

Check the `EmailQueue` table for delivery status:

```typescript
const failedEmails = await prisma.emailQueue.findMany({
  where: { status: 'FAILED' },
  orderBy: { createdAt: 'desc' },
  take: 10,
})

console.log('Recent failures:', failedEmails)
```

### Step 10: Production Checklist

Before going live:

- [ ] Verified domain in Resend
- [ ] Updated `EMAIL_FROM` with verified domain
- [ ] Set secure `INTERNAL_API_KEY`
- [ ] Set correct `NEXT_PUBLIC_APP_URL`
- [ ] Set up cron jobs for weekly digest
- [ ] Set up cron job for retry
- [ ] Tested email delivery to Gmail, Outlook, etc.
- [ ] Added monitoring/alerts
- [ ] Reviewed Resend pricing limits
- [ ] Tested unsubscribe flow

## Troubleshooting

### Emails Not Sending

1. Check `RESEND_API_KEY` is set correctly
2. Verify domain in Resend dashboard
3. Check `EmailQueue` table for errors
4. Review Resend dashboard logs

### Verification Emails Not Received

1. Check spam folder
2. Verify rate limiting not exceeded
3. Check `EmailQueue` status
4. Test with different email provider

### Database Errors

1. Make sure Prisma is generated: `npx prisma generate`
2. Check migration applied: `npx prisma migrate status`
3. Verify DATABASE_URL is correct

## Rollback

If you need to rollback:

```bash
# Revert migration
npx prisma migrate revert

# Or manually drop tables
npx prisma studio
# Delete EmailSettings, EmailVerification, EmailQueue tables
```

## Support

- Check `EMAIL_NOTIFICATIONS.md` for detailed docs
- Review `EmailQueue` table for errors
- Check Resend dashboard for delivery logs
- Review application logs

## Next Steps

After migration is complete:

1. Monitor email delivery rates
2. Collect user feedback
3. A/B test email templates
4. Add more email types as needed
5. Set up analytics tracking

## Production Tips

1. **Start Small**: Enable emails for a small group first
2. **Monitor Closely**: Watch delivery rates and errors
3. **Respect Preferences**: Always check user preferences
4. **Rate Limiting**: Keep the built-in rate limits
5. **Error Handling**: Log all errors for debugging
6. **Test Regularly**: Test all email types periodically

## Security Notes

1. Never expose `RESEND_API_KEY` in client code
2. Keep `INTERNAL_API_KEY` secure
3. Validate all email inputs
4. Respect rate limits
5. Sanitize user data in emails

## Performance

- Email sending is async - doesn't block requests
- Queue handles failures gracefully
- Rate limiting prevents abuse
- Batch sends are efficient

## Maintenance

### Weekly Tasks
- Check failed email count
- Review delivery rates
- Monitor queue size

### Monthly Tasks
- Review user preferences trends
- Check unsubscribe rates
- Update email templates if needed
- Review Resend usage/costs

Good luck with your email notifications system!
