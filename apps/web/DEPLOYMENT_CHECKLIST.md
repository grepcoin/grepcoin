# Leaderboard Rewards - Deployment Checklist

## Pre-Deployment Steps

### 1. Database Migration
```bash
cd apps/web
npx prisma migrate dev --name add_leaderboard_rewards
npx prisma generate
```

This will:
- Create LeaderboardDistribution and LeaderboardReward tables
- Add new enums (DistributionPeriod, DistributionStatus, RewardStatus)
- Add leaderboardRewards relation to User model

### 2. Environment Variables

Add to `.env.local` or production environment:

```bash
# Comma-separated admin wallet addresses (lowercase)
ADMIN_ADDRESSES=0x1234567890abcdef1234567890abcdef12345678,0xfedcba0987654321fedcba0987654321fedcba09

# Existing required vars
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXTAUTH_SECRET=...
```

### 3. Build & Test Locally

```bash
# Install dependencies (if needed)
npm install

# Build the application
npm run build

# Run locally
npm run dev
```

Test the following:
- [ ] Navigate to `/leaderboard`
- [ ] See "Rewards" tab
- [ ] View reward schedule
- [ ] Connect wallet
- [ ] See projected rewards (if you have scores)

### 4. Test Admin Functionality

```bash
# Login with admin wallet address
# Use curl or Postman to test distribution endpoint

curl -X POST http://localhost:3000/api/admin/distribute-rewards \
  -H "Content-Type: application/json" \
  -H "Cookie: session_id=YOUR_SESSION_ID" \
  -d '{"period": "weekly"}'
```

Should return:
```json
{
  "success": true,
  "distribution": {...},
  "winnersCount": 10,
  "totalAwarded": 18500,
  "message": "Successfully distributed 10 rewards totaling 18500 GREP"
}
```

## Deployment Steps

### 1. Push to Repository

```bash
git add .
git commit -m "Add leaderboard rewards distribution system"
git push origin main
```

### 2. Deploy to Production

If using Vercel:
```bash
vercel --prod
```

Or trigger deployment via your CI/CD pipeline.

### 3. Run Production Migration

After deployment, run migration on production database:

```bash
# Via Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy

# Or via database connection
DATABASE_URL="your_production_db_url" npx prisma migrate deploy
```

### 4. Verify Production Deployment

- [ ] Visit production `/leaderboard` page
- [ ] Verify Rewards tab loads
- [ ] Check countdown timer is working
- [ ] Verify API endpoints respond correctly
- [ ] Test with admin account (if applicable)

## Post-Deployment

### 1. Setup Automated Distributions

Create cron jobs or scheduled functions:

#### Option A: Vercel Cron (recommended)

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/admin/distribute-rewards",
      "schedule": "0 0 * * 0"
    }
  ]
}
```

#### Option B: External Cron Service

Use services like:
- GitHub Actions
- AWS EventBridge
- Google Cloud Scheduler
- Cron-job.org

Example GitHub Action (`.github/workflows/weekly-rewards.yml`):

```yaml
name: Weekly Leaderboard Rewards
on:
  schedule:
    - cron: '0 0 * * 0'  # Every Sunday at midnight UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  distribute:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Distribution
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/admin/distribute-rewards \
            -H "Content-Type: application/json" \
            -H "Cookie: session_id=${{ secrets.ADMIN_SESSION }}" \
            -d '{"period": "weekly"}'
```

### 2. Monitoring

Set up monitoring for:
- [ ] Distribution endpoint failures
- [ ] Unclaimed rewards accumulation
- [ ] Database performance (LeaderboardReward table growth)
- [ ] User engagement (Rewards tab visits, claim rate)

### 3. User Communication

Announce the feature:
- [ ] Blog post / announcement
- [ ] Social media posts
- [ ] In-app notification
- [ ] Discord/Telegram announcement
- [ ] Email to existing users

Example announcement:

```
🎉 Leaderboard Rewards are LIVE!

Compete for weekly and monthly prizes:
- Top 10 weekly earners win up to 5,000 GREP
- Top 25 monthly earners win up to 25,000 GREP
- Special badges for top 3
- Earning multiplier bonuses

Check your projected rewards at grepcoin.io/leaderboard
```

## Maintenance

### Weekly Tasks
- [ ] Verify distributions completed successfully
- [ ] Monitor claim rates
- [ ] Check for any failed reward transfers

### Monthly Tasks
- [ ] Review reward amounts and adjust if needed
- [ ] Analyze leaderboard participation
- [ ] Gather user feedback

### Quarterly Tasks
- [ ] Review and adjust reward tiers
- [ ] Consider new badge designs
- [ ] Evaluate ROI of rewards program

## Troubleshooting

### Common Issues

**Distribution didn't trigger automatically:**
1. Check cron job logs
2. Verify admin session is still valid
3. Manually trigger via API
4. Check database for existing distribution

**Users can't claim rewards:**
1. Check LeaderboardReward.status is 'PENDING'
2. Verify user authentication
3. Check for database locks
4. Review error logs

**Countdown timer incorrect:**
1. Verify server timezone (should be UTC)
2. Check `getNextDistributionDate()` logic
3. Clear browser cache
4. Check for client/server time sync issues

**No rewards created after distribution:**
1. Verify users have scores in the period
2. Check ranking calculation logic
3. Review reward tier configuration
4. Check database transaction logs

## Rollback Plan

If critical issues occur:

1. **Disable Distribution:**
   ```bash
   # Remove ADMIN_ADDRESSES from env
   # Or block /api/admin/distribute-rewards in middleware
   ```

2. **Hide UI:**
   ```typescript
   // In app/leaderboard/page.tsx
   // Comment out rewards tab temporarily
   ```

3. **Revert Migration (if needed):**
   ```bash
   npx prisma migrate resolve --rolled-back add_leaderboard_rewards
   ```

4. **Restore from Backup:**
   If data corruption occurs, restore database from backup before migration.

## Success Metrics

Track these KPIs:

- **Engagement:**
  - Daily visits to /leaderboard
  - Rewards tab click-through rate
  - Average time on rewards page

- **Claim Rate:**
  - % of rewards claimed within 24h
  - % of rewards claimed within 7 days
  - Total unclaimed rewards value

- **Distribution Health:**
  - Distribution success rate (100% target)
  - Average distribution processing time
  - Number of winners per period

- **User Satisfaction:**
  - Support tickets related to rewards
  - User feedback scores
  - Social media sentiment

## Support

For issues or questions:
- GitHub Issues: [github.com/grepcoin/grepcoin/issues]
- Discord: [discord.gg/grepcoin]
- Email: support@grepcoin.io

---

**Last Updated:** 2025-12-20
**Version:** 1.0.0
