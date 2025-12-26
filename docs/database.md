---
layout: default
title: GrepCoin Database Schema
---

# Database Schema

**PostgreSQL database on NeonDB with Prisma ORM**

---

## Overview

| Stat | Value |
|------|-------|
| Total Models | 39 |
| ORM | Prisma |
| Database | PostgreSQL |
| Provider | NeonDB (Serverless) |

---

## Core Models

### User
Central user model with wallet-based authentication.

```prisma
model User {
  id            String  @id @default(cuid())
  walletAddress String  @unique
  username      String? @unique
  avatar        String?
  referralCode  String? @unique
  createdAt     DateTime
  
  // 20+ relations to other models
}
```

### Game
Game definitions with reward configuration.

```prisma
model Game {
  id          String  @id
  slug        String  @unique
  name        String
  description String
  icon        String
  color       String
  minReward   Int
  maxReward   Int
  isActive    Boolean
}
```

### GameScore
Individual game score submissions.

```prisma
model GameScore {
  id         String   @id
  userId     String
  gameId     String
  score      Int
  grepEarned Int
  duration   Int      // seconds
  streak     Int
  multiplier Float
  createdAt  DateTime
}
```

### Stake
Staking records synced from blockchain.

```prisma
model Stake {
  id          String    @id
  userId      String
  amount      BigInt
  tier        String    // flexible, bronze, silver, gold, diamond
  multiplier  Float
  lockedUntil DateTime?
  txHash      String?   @unique
  chainId     Int
}
```

---

## Achievement System

### Achievement
Achievement definitions.

| Field | Type | Description |
|-------|------|-------------|
| slug | String | Unique identifier |
| name | String | Display name |
| rarity | String | common/uncommon/rare/epic/legendary |
| reward | Int | GREP reward amount |
| type | String | score/streak/games/perfect/challenge |
| target | Int? | Target value |
| gameSlug | String? | Game-specific or global |

### UserAchievement
Tracks progress and unlocks.

| Field | Type | Description |
|-------|------|-------------|
| progress | Int | Current progress |
| unlockedAt | DateTime? | When unlocked |
| mintedAt | DateTime? | When minted as NFT |
| mintTxHash | String? | NFT transaction |

---

## Social Models

### Friendship
Friend relationships with status.

```prisma
enum FriendStatus {
  PENDING
  ACCEPTED
  BLOCKED
}
```

### Referral
Referral tracking with reward limits.

| Field | Type | Description |
|-------|------|-------------|
| code | String | Unique referral code |
| rewardPaid | Int | GREP paid so far |
| maxReward | Int | Max earnable (5000) |
| expiresAt | DateTime | 30 days validity |

---

## Battle Pass

### BattlePass
Seasonal battle pass definition.

| Field | Type |
|-------|------|
| season | Int (unique) |
| levels | Int (default: 50) |
| xpPerLevel | Int (default: 1000) |
| startDate | DateTime |
| endDate | DateTime |

### BattlePassReward
Rewards per level.

```prisma
enum RewardTier { FREE, PREMIUM }
enum RewardType { GREP, BADGE, MULTIPLIER, NFT }
```

### BattlePassProgress
User progress tracking.

---

## Tournament System

### Tournament
Tournament configuration.

```prisma
enum TournamentStatus {
  REGISTRATION
  ACTIVE
  COMPLETED
  CANCELLED
}
```

| Field | Type |
|-------|------|
| entryFee | Int |
| prizePool | Int |
| maxPlayers | Int |
| startTime | DateTime |
| endTime | DateTime |

---

## Marketplace

### MarketplaceListing
Item listings for sale.

```prisma
enum Currency { GREP, ETH }
enum ListingStatus { ACTIVE, SOLD, CANCELLED, EXPIRED }
```

### Auction
Timed auction listings.

```prisma
enum AuctionStatus { PENDING, ACTIVE, ENDED, CANCELLED }
```

### Bid
Auction bid history.

---

## Inventory & NFTs

### InventoryItem
User inventory with NFT support.

| Field | Type | Description |
|-------|------|-------------|
| itemId | String | Item definition ID |
| quantity | Int | Item count |
| equipped | Boolean | Currently equipped |
| tokenId | Int? | NFT token ID |
| isMinted | Boolean | Minted on-chain |
| metadataURI | String? | IPFS URI |

### NFTMint
NFT minting transaction tracking.

---

## Notifications

### PushSubscription
Web push notification subscriptions.

### EmailSettings
Email notification preferences (per type toggles).

### EmailQueue
Email sending queue with retry logic.

```prisma
enum EmailType {
  WELCOME
  WEEKLY_DIGEST
  ACHIEVEMENT
  REWARD_CLAIM
  TOURNAMENT_START
  FRIEND_REQUEST
}
```

---

## Analytics

### Activity
Live activity feed for global display.

### AnalyticsEvent
Behavioral analytics tracking.

### DailyStats
Per-user daily statistics.

### GlobalStats
Platform-wide statistics (cached).

---

## Indexes

Critical indexes for performance:

| Table | Indexed Fields |
|-------|---------------|
| GameScore | userId, gameId, createdAt DESC, score DESC |
| Stake | userId |
| Activity | createdAt DESC |
| Session | walletAddress, expiresAt |
| MarketplaceListing | sellerId, status, price, createdAt DESC |

---

## Relations Summary

```
User ─┬─ GameScore[]
      ├─ UserAchievement[]
      ├─ Stake[]
      ├─ Friendship[] (both directions)
      ├─ Referral (as referrer and referee)
      ├─ EventParticipant[]
      ├─ BattlePassProgress[]
      ├─ TournamentParticipant[]
      ├─ MarketplaceListing[] (seller/buyer)
      ├─ Auction[] (seller/winner)
      ├─ Bid[]
      ├─ InventoryItem[]
      ├─ NFTMint[]
      ├─ PushSubscription[]
      ├─ EmailSettings
      └─ LeaderboardReward[]
```

---

*See [schema.prisma](https://github.com/grepcoin/grepcoin/blob/main/apps/web/prisma/schema.prisma) for complete schema.*
