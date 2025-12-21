# Leaderboard Rewards Distribution System

This document describes the implementation of the leaderboard rewards distribution system for GrepCoin.

## Overview

The leaderboard rewards system incentivizes players by distributing GREP tokens, badges, and multiplier bonuses to top performers on weekly and monthly leaderboards.

## Features

### 1. Reward Tiers

#### Weekly Rewards (Every Sunday)
- **Rank #1**: 5,000 GREP + "Weekly Champion" badge + 10% multiplier bonus
- **Rank #2**: 3,000 GREP + "Weekly Runner-Up" badge + 5% multiplier bonus
- **Rank #3**: 2,000 GREP + "Weekly Bronze" badge + 3% multiplier bonus
- **Ranks #4-5**: 1,000 GREP each
- **Ranks #6-10**: 500 GREP each

Total Weekly Pool: **18,500 GREP**

#### Monthly Rewards (1st of each month)
- **Rank #1**: 25,000 GREP + "Monthly Legend" badge + 25% multiplier bonus
- **Rank #2**: 15,000 GREP + "Monthly Master" badge + 15% multiplier bonus
- **Rank #3**: 10,000 GREP + "Monthly Expert" badge + 10% multiplier bonus
- **Ranks #4-5**: 5,000 GREP each + 5% multiplier bonus
- **Ranks #6-10**: 3,000 GREP each
- **Ranks #11-15**: 2,000 GREP each
- **Ranks #16-25**: 1,000 GREP each

Total Monthly Pool: **105,000 GREP**

### 2. Distribution Schedule

- **Weekly**: Every Sunday at 00:00 UTC
- **Monthly**: 1st day of each month at 00:00 UTC

### 3. User Features

#### Leaderboard Page (/leaderboard)
- **Rankings Tab**: View current leaderboard standings
- **Rewards Tab**: View reward schedule, upcoming distributions, and claim rewards
- **Countdown Timer**: Shows time until next distribution
- **Projected Rewards**: Shows user's current rank and potential rewards
- **Claimable Rewards Banner**: Alert when user has rewards to claim

#### Reward Claiming
- Users receive notifications when they earn rewards
- Rewards must be manually claimed through the UI
- Claim modal shows breakdown of GREP, badges, and multipliers
- Celebration animation on successful claim

### 4. Admin Features

#### Distribution Endpoint (`/api/admin/distribute-rewards`)
- Trigger manual distribution for weekly or monthly period
- Calculate final rankings automatically
- Create reward records for all winners
- Send notifications to winners
- Admin-only access (configured via ADMIN_ADDRESSES env variable)

## API Endpoints

### Public Endpoints

#### `GET /api/leaderboards/rewards`
Get upcoming and past reward distributions.

**Query Parameters:**
- `type`: 'weekly' | 'monthly' (optional)
- `projected`: 'true' | 'false' - Include user's projected rewards (requires auth)

**Response:**
```json
{
  "upcoming": [
    {
      "period": "WEEKLY",
      "nextDate": "2025-12-22T00:00:00.000Z",
      "tiers": [...],
      "totalPool": 18500
    }
  ],
  "past": [...],
  "projected": {
    "weekly": { "rank": 5, "grepAmount": 1000 },
    "monthly": null
  },
  "countdown": {
    "weekly": { "days": 1, "hours": 5, "minutes": 30, "seconds": 15 }
  }
}
```

#### `GET /api/leaderboards/rewards/claim`
Get user's claimable rewards (requires auth).

**Response:**
```json
{
  "rewards": [
    {
      "id": "...",
      "period": "WEEKLY",
      "rank": 3,
      "grepAmount": 2000,
      "badgeId": "weekly_third_place",
      "badgeName": "Weekly Bronze",
      "badgeIcon": "🥉",
      "multiplier": 1.03
    }
  ],
  "totalClaimable": 2000,
  "count": 1
}
```

#### `POST /api/leaderboards/rewards/claim`
Claim a reward (requires auth).

**Request Body:**
```json
{
  "rewardId": "clxxx..."
}
```

**Response:**
```json
{
  "success": true,
  "reward": {
    "id": "...",
    "grepAmount": 2000,
    "rank": 3,
    "claimedAt": "2025-12-20T..."
  },
  "badge": {
    "id": "...",
    "name": "Weekly Bronze",
    "icon": "🥉"
  }
}
```

### Admin Endpoints

#### `POST /api/admin/distribute-rewards`
Trigger reward distribution (admin only).

**Request Body:**
```json
{
  "period": "weekly" | "monthly",
  "force": false
}
```

**Response:**
```json
{
  "success": true,
  "distribution": { ... },
  "winnersCount": 10,
  "totalAwarded": 18500,
  "message": "Successfully distributed 10 rewards totaling 18500 GREP"
}
```

#### `GET /api/admin/distribute-rewards`
Get distribution history and stats (admin only).

## Database Schema

### LeaderboardDistribution
- Tracks each distribution period
- Stores start/end dates and total pool
- Status: SCHEDULED, ACTIVE, DISTRIBUTING, COMPLETED

### LeaderboardReward
- Individual rewards for each winner
- Links to user and distribution
- Status: PENDING, CLAIMED, EXPIRED

## Configuration

### Environment Variables

```bash
# Admin wallet addresses (comma-separated)
ADMIN_ADDRESSES=0x1234...,0x5678...
```

### Customizing Rewards

Edit `/apps/web/src/lib/leaderboard-rewards.ts`:
- `WEEKLY_REWARD_TIERS`: Modify weekly reward structure
- `MONTHLY_REWARD_TIERS`: Modify monthly reward structure
- `REWARD_BADGES`: Add/edit special badges

## Implementation Details

### Reward Calculation
1. Admin triggers distribution via API
2. System queries all scores for the period
3. Ranks players by total GREP earned
4. Matches ranks to reward tiers
5. Creates reward records for winners
6. Sends activity notifications

### Badge System
- Badges are created as Achievement records
- Automatically awarded when rewards are claimed
- Stored in UserAchievement table
- Displayed in user profiles

### Multiplier Bonuses
- Applied to future earnings (implementation varies)
- Stored with the reward record
- Can be used for enhanced earning rates

## Testing

### Manual Testing Flow

1. **Setup**: Ensure database has test users with game scores
2. **Admin Login**: Connect wallet with admin address
3. **Trigger Distribution**: POST to `/api/admin/distribute-rewards`
4. **User View**: Login as winner and view rewards tab
5. **Claim Reward**: Click claim button and verify modal
6. **Verify**: Check that GREP and badges were awarded

### Automated Distribution

For production, set up a cron job to automatically trigger distributions:

```bash
# Weekly - Every Sunday at 00:00 UTC
0 0 * * 0 curl -X POST https://grepcoin.io/api/admin/distribute-rewards -H "Cookie: session_id=..." -d '{"period":"weekly"}'

# Monthly - 1st of month at 00:00 UTC
0 0 1 * * curl -X POST https://grepcoin.io/api/admin/distribute-rewards -H "Cookie: session_id=..." -d '{"period":"monthly"}'
```

## Future Enhancements

- [ ] Email notifications for reward availability
- [ ] Auto-claim option for users
- [ ] NFT rewards for top performers
- [ ] Season-based reward variations
- [ ] Reward expiration (currently pending indefinitely)
- [ ] Team/guild rewards
- [ ] Social sharing of achievements

## Support

For issues or questions, contact the development team or open an issue on GitHub.
