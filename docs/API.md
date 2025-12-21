# GrepCoin API Reference

Complete API documentation for the GrepCoin platform.

## Base URL

- **Development:** `http://localhost:3000/api`
- **Production:** `https://grepcoin.io/api`

## Authentication

Most endpoints require authentication via session token.

### Session Flow

1. **Get Nonce:** `GET /api/auth/nonce`
2. **Sign Message:** User signs the SIWE message with their wallet
3. **Verify:** `POST /api/auth/verify` with signature
4. **Session:** Cookie-based session is established

### Headers

```
Cookie: session=<session_token>
```

---

## Auth Endpoints

### GET /api/auth/nonce

Get a nonce for SIWE authentication.

**Response:**
```json
{
  "nonce": "abc123..."
}
```

### POST /api/auth/verify

Verify a signed SIWE message.

**Request:**
```json
{
  "message": "grepcoin.io wants you to sign in...",
  "signature": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "walletAddress": "0x...",
    "username": "player1"
  }
}
```

### GET /api/auth/session

Get current session info.

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "id": "...",
    "walletAddress": "0x..."
  }
}
```

### POST /api/auth/logout

Logout and clear session.

---

## Games

### GET /api/games

List all games.

**Response:**
```json
{
  "games": [
    {
      "slug": "grep-rails",
      "name": "Grep Rails",
      "description": "Build train tracks by matching regex",
      "maxScore": 10000,
      "baseReward": 10
    }
  ]
}
```

### GET /api/games/[slug]

Get game details.

### POST /api/games/[slug]/submit

Submit a game score. Requires authentication.

**Request:**
```json
{
  "score": 1500,
  "duration": 120,
  "metadata": {
    "level": 5,
    "combo": 10
  }
}
```

**Response:**
```json
{
  "success": true,
  "score": 1500,
  "grepEarned": 15,
  "multiplier": 1.5,
  "rank": 42,
  "unlockedAchievements": [
    {
      "id": "...",
      "name": "First Win",
      "rarity": "common"
    }
  ]
}
```

---

## Leaderboards

### GET /api/leaderboards

Get global leaderboard.

**Query Parameters:**
- `period`: `all` | `weekly` | `daily` (default: `all`)
- `limit`: number (default: 100)
- `offset`: number (default: 0)

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user": {
        "walletAddress": "0x...",
        "username": "player1"
      },
      "totalScore": 50000,
      "gamesPlayed": 100
    }
  ],
  "total": 1000
}
```

### GET /api/leaderboards/[game]

Get game-specific leaderboard.

### GET /api/leaderboards/rankings

Get player's ranking with nearby players.

**Response:**
```json
{
  "player": {
    "rank": 42,
    "totalScore": 5000
  },
  "nearby": [
    { "rank": 40, "username": "player40", "totalScore": 5200 },
    { "rank": 41, "username": "player41", "totalScore": 5100 },
    { "rank": 43, "username": "player43", "totalScore": 4900 }
  ]
}
```

### GET /api/leaderboards/rewards

Get leaderboard reward info.

### POST /api/leaderboards/rewards/claim

Claim leaderboard rewards.

---

## Friends

### GET /api/friends

Get friend list. Requires authentication.

**Response:**
```json
{
  "friends": [
    {
      "id": "...",
      "friend": {
        "walletAddress": "0x...",
        "username": "friend1"
      },
      "status": "accepted",
      "since": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/friends

Send friend request.

**Request:**
```json
{
  "walletAddress": "0x..."
}
```

### GET /api/friends/requests

Get pending friend requests.

### PUT /api/friends/[id]

Accept or reject friend request.

**Request:**
```json
{
  "action": "accept" | "reject"
}
```

### DELETE /api/friends/[id]

Remove friend.

---

## Guilds

### GET /api/guilds

List all guilds.

**Query Parameters:**
- `search`: string
- `limit`: number
- `offset`: number

### POST /api/guilds

Create a guild. Requires authentication.

**Request:**
```json
{
  "name": "Code Warriors",
  "tag": "CW",
  "description": "Elite coders unite"
}
```

### GET /api/guilds/my

Get user's guild.

### POST /api/guilds/leave

Leave current guild.

---

## Tournaments

### GET /api/tournaments

List tournaments.

**Query Parameters:**
- `status`: `registration` | `active` | `completed`
- `game`: game slug

**Response:**
```json
{
  "tournaments": [
    {
      "id": "...",
      "name": "Weekly Challenge",
      "game": "grep-rails",
      "status": "registration",
      "startDate": "2024-01-15T00:00:00Z",
      "endDate": "2024-01-16T00:00:00Z",
      "prizePool": 10000,
      "participants": 50
    }
  ]
}
```

### POST /api/tournaments/[id]/join

Join a tournament.

### POST /api/tournaments/[id]/submit

Submit tournament score.

---

## Battle Pass

### GET /api/battle-pass

Get current battle pass info.

**Response:**
```json
{
  "season": 1,
  "level": 15,
  "xp": 2500,
  "xpToNext": 500,
  "rewards": [
    {
      "level": 1,
      "type": "grep",
      "amount": 100,
      "claimed": true
    }
  ]
}
```

### POST /api/battle-pass/xp

Add XP to battle pass.

### POST /api/battle-pass/claim

Claim battle pass reward.

**Request:**
```json
{
  "level": 15
}
```

---

## Marketplace

### GET /api/marketplace

List marketplace items.

**Query Parameters:**
- `category`: item category
- `minPrice`: number
- `maxPrice`: number
- `sort`: `price_asc` | `price_desc` | `newest`

### POST /api/marketplace

Create listing.

**Request:**
```json
{
  "itemId": "...",
  "price": 1000
}
```

### POST /api/marketplace/[id]/buy

Purchase item.

---

## Auctions

### GET /api/auctions

List active auctions.

### POST /api/auctions

Create auction.

**Request:**
```json
{
  "itemId": "...",
  "startingPrice": 100,
  "duration": 86400
}
```

### POST /api/auctions/[id]/bid

Place bid.

**Request:**
```json
{
  "amount": 150
}
```

---

## Inventory

### GET /api/inventory

Get user's inventory.

**Response:**
```json
{
  "items": [
    {
      "id": "...",
      "type": "booster",
      "name": "XP Boost",
      "rarity": "rare",
      "quantity": 3,
      "equipped": false
    }
  ]
}
```

### POST /api/inventory/use

Use an item.

### POST /api/inventory/equip

Equip/unequip item.

### POST /api/inventory/mint

Mint item as NFT.

---

## Achievements

### GET /api/achievements

Get all achievements.

### GET /api/achievements/[wallet]

Get user's achievements.

### POST /api/achievements/mint

Mint achievement as NFT.

---

## Quests

### GET /api/quests

Get available quests.

**Response:**
```json
{
  "daily": [
    {
      "id": "...",
      "name": "Play 3 Games",
      "progress": 2,
      "target": 3,
      "reward": 50,
      "expiresAt": "2024-01-02T00:00:00Z"
    }
  ],
  "weekly": [...]
}
```

### POST /api/quests/claim

Claim quest reward.

---

## AI Chat

### POST /api/ai/chat

Chat with AI assistant. Requires authentication.

**Request:**
```json
{
  "message": "How do I stake GREP tokens?",
  "stream": true
}
```

**Response (streaming):**
```
data: {"content": "To stake GREP tokens..."}
data: {"content": " you need to..."}
data: [DONE]
```

---

## User

### GET /api/users/[wallet]

Get user profile.

### PUT /api/users/settings

Update user settings.

### GET /api/users/notification-preferences

Get notification preferences.

### PUT /api/users/notification-preferences

Update notification preferences.

---

## Notifications

### POST /api/notifications/subscribe

Subscribe to push notifications.

**Request:**
```json
{
  "subscription": {
    "endpoint": "https://...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

### POST /api/notifications/send

Send notification (admin only).

---

## Stats

### GET /api/stats

Get platform stats.

**Response:**
```json
{
  "totalPlayers": 10000,
  "totalGamesPlayed": 500000,
  "totalGrepEarned": 1000000,
  "activeToday": 500
}
```

### GET /api/stats/detailed

Get detailed user stats. Requires authentication.

### GET /api/stats/history

Get stats history.

---

## Activity

### GET /api/activity

Get activity feed.

**Query Parameters:**
- `type`: `all` | `games` | `achievements` | `social`
- `limit`: number
- `offset`: number

---

## Governance

### GET /api/governance/proposals

List proposals.

### POST /api/governance/proposals

Create proposal (requires 10,000 GREP).

### POST /api/governance/proposals/[id]/vote

Vote on proposal.

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limits

| Endpoint Category | Limit |
|------------------|-------|
| Auth | 10/minute |
| Games | 60/minute |
| AI Chat | 10/minute |
| General | 100/minute |

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200
```

---

## Webhooks

### POST /api/webhooks

Register webhook.

**Request:**
```json
{
  "url": "https://your-server.com/webhook",
  "events": ["game.completed", "achievement.unlocked"]
}
```

### Webhook Events

- `game.completed` - Game score submitted
- `achievement.unlocked` - Achievement earned
- `tournament.started` - Tournament begins
- `leaderboard.updated` - Rankings changed

### Webhook Payload

```json
{
  "event": "game.completed",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "userId": "...",
    "game": "grep-rails",
    "score": 1500
  },
  "signature": "sha256=..."
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
// Fetch leaderboard
const response = await fetch('/api/leaderboards?period=weekly');
const { leaderboard } = await response.json();

// Submit score
const result = await fetch('/api/games/grep-rails/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ score: 1500, duration: 120 }),
  credentials: 'include'
});
```

### Using React Hooks

```typescript
import { useLeaderboards } from '@/hooks/useLeaderboards';

function Leaderboard() {
  const { leaderboard, isLoading } = useLeaderboards('grep-rails', 'weekly');

  if (isLoading) return <Loading />;

  return (
    <ul>
      {leaderboard.map(entry => (
        <li key={entry.rank}>{entry.username}: {entry.score}</li>
      ))}
    </ul>
  );
}
```
