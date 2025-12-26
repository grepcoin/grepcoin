---
layout: default
title: GrepCoin API Reference
---

# API Reference

**Complete API documentation for the GrepCoin platform.**

---

## Overview

| Stat | Value |
|------|-------|
| Total Endpoints | 91 |
| Authentication | SIWE (Sign-In With Ethereum) |
| Rate Limiting | Per-endpoint limits |
| Response Format | JSON |

---

## Base URLs

| Environment | URL |
|-------------|-----|
| Production | `https://grepcoin.vercel.app/api` |
| Development | `http://localhost:3000/api` |

---

## Authentication Flow

```
1. GET  /api/auth/nonce     → Get SIWE nonce
2. Sign message with wallet
3. POST /api/auth/verify    → Submit signature
4. Cookie session established
```

### Session Cookie
```
Cookie: session=<base64_token>
```

---

## Endpoint Categories

### Authentication (4 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/nonce` | Get SIWE nonce |
| POST | `/api/auth/verify` | Verify signature |
| GET | `/api/auth/session` | Get current session |
| POST | `/api/auth/logout` | Clear session |

### Games (4 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/games` | List all games |
| GET | `/api/games/[slug]` | Get game details |
| POST | `/api/games/[slug]/submit` | Submit score |
| GET | `/api/games/[slug]/leaderboard` | Game leaderboard |

### Leaderboards (5 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboards` | Global leaderboard |
| GET | `/api/leaderboards/[game]` | Game-specific |
| GET | `/api/leaderboards/rankings` | Player ranking |
| GET | `/api/leaderboards/rewards` | Reward info |
| POST | `/api/leaderboards/rewards/claim` | Claim rewards |

### Social (10 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/friends` | Friend list |
| POST | `/api/friends` | Send request |
| GET | `/api/friends/requests` | Pending requests |
| PUT | `/api/friends/[id]` | Accept/reject |
| DELETE | `/api/friends/[id]` | Remove friend |
| GET | `/api/guilds` | List guilds |
| POST | `/api/guilds` | Create guild |
| GET | `/api/guilds/my` | My guild |
| POST | `/api/guilds/leave` | Leave guild |
| GET | `/api/activity` | Activity feed |

### Battle Pass (3 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/battle-pass` | Current status |
| POST | `/api/battle-pass/xp` | Add XP |
| POST | `/api/battle-pass/claim` | Claim reward |

### Achievements (4 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/achievements` | All achievements |
| GET | `/api/achievements/[wallet]` | User achievements |
| POST | `/api/achievements/mint` | Mint as NFT |
| POST | `/api/achievements-v2/claim` | Claim reward |

### Marketplace (6 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/marketplace` | List items |
| POST | `/api/marketplace` | Create listing |
| POST | `/api/marketplace/[id]/buy` | Purchase |
| GET | `/api/auctions` | List auctions |
| POST | `/api/auctions` | Create auction |
| POST | `/api/auctions/[id]/bid` | Place bid |

### Tournaments (4 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tournaments` | List tournaments |
| GET | `/api/tournaments/[id]` | Tournament details |
| POST | `/api/tournaments/[id]/join` | Join |
| POST | `/api/tournaments/[id]/submit` | Submit score |

---

## Common Response Formats

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Error Codes
| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 400 | Invalid request |

---

## Rate Limits

| Category | Limit |
|----------|-------|
| Auth | 10/minute |
| Games | 60/minute |
| AI Chat | 10/minute |
| General | 100/minute |

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200
```

---

## Score Submission Example

```typescript
const response = await fetch('/api/games/regex-runner/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    score: 1500,
    duration: 120,
    metadata: { level: 5, combo: 10 }
  }),
  credentials: 'include'
});

const result = await response.json();
// { success: true, grepEarned: 15, multiplier: 1.5 }
```

---

*See [full API documentation](https://github.com/grepcoin/grepcoin/blob/main/docs/API.md) for complete details.*
