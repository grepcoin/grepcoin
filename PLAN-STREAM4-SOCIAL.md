# Stream 4: Social & Engagement

## Overview
Build social features to increase user engagement, retention, and viral growth through friends, events, battle pass, sharing, and guilds.

## Features

### 1. Friend System
**Priority: High**

- **Friend Requests**: Send, accept, decline friend requests
- **Friend List**: View online status, recent activity
- **Friend Leaderboards**: Compete with friends
- **Activity Feed**: See friends' achievements and scores

**Database Schema:**
```prisma
model Friendship {
  id          String   @id @default(cuid())
  userId      String
  friendId    String
  status      FriendStatus @default(PENDING)
  createdAt   DateTime @default(now())
  acceptedAt  DateTime?

  user        User     @relation("UserFriends", fields: [userId], references: [id])
  friend      User     @relation("FriendOf", fields: [friendId], references: [id])

  @@unique([userId, friendId])
}

enum FriendStatus {
  PENDING
  ACCEPTED
  BLOCKED
}

model ActivityFeed {
  id          String   @id @default(cuid())
  userId      String
  type        ActivityType
  data        Json
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
}

enum ActivityType {
  ACHIEVEMENT_UNLOCKED
  HIGH_SCORE
  LEVEL_UP
  FRIEND_JOINED
  TOURNAMENT_WIN
}
```

**Components:**
```
apps/web/src/components/social/
├── FriendList.tsx        # Friend list with status
├── FriendRequest.tsx     # Request management
├── FriendSearch.tsx      # Find friends
├── ActivityFeed.tsx      # Friend activities
└── FriendLeaderboard.tsx # Friends-only leaderboard
```

**API Endpoints:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/friends` | GET | Get friend list |
| `/api/friends/request` | POST | Send request |
| `/api/friends/[id]/accept` | POST | Accept request |
| `/api/friends/[id]/remove` | DELETE | Remove friend |
| `/api/friends/activity` | GET | Get activity feed |

### 2. Events System
**Priority: High**

- **Scheduled Events**: Time-limited game events
- **Event Rewards**: Bonus GREP and exclusive badges
- **Event Leaderboards**: Separate competition
- **Event Calendar**: Upcoming events preview

**Event Types:**
| Type | Duration | Rewards |
|------|----------|---------|
| Daily Challenge | 24h | 2x GREP |
| Weekend Warrior | 48h | Exclusive badge |
| Seasonal Event | 2 weeks | NFT + GREP |
| Flash Event | 2h | 5x GREP |

**Database Schema:**
```prisma
model Event {
  id          String   @id @default(cuid())
  name        String
  description String
  type        EventType
  gameSlug    String?
  startTime   DateTime
  endTime     DateTime
  rewards     Json
  rules       Json
  status      EventStatus @default(SCHEDULED)
  createdAt   DateTime @default(now())

  participants EventParticipant[]
  leaderboard  EventLeaderboard[]
}

model EventParticipant {
  id          String   @id @default(cuid())
  eventId     String
  userId      String
  score       Int      @default(0)
  joinedAt    DateTime @default(now())

  event       Event    @relation(fields: [eventId], references: [id])
  user        User     @relation(fields: [userId], references: [id])

  @@unique([eventId, userId])
}
```

**Components:**
```
apps/web/src/app/events/
├── page.tsx              # Events list
├── [id]/page.tsx         # Event details
└── components/
    ├── EventCard.tsx     # Event preview card
    ├── EventCountdown.tsx# Time remaining
    ├── EventLeaderboard.tsx
    └── EventRewards.tsx  # Reward preview
```

### 3. Battle Pass
**Priority: High**

- **Seasonal Passes**: 30-day progression system
- **Free & Premium Tiers**: Basic rewards + premium unlock
- **XP System**: Earn XP from playing games
- **Milestone Rewards**: GREP, badges, cosmetics

**Battle Pass Structure:**
```
Level 1-10:   Common rewards (GREP, minor boosts)
Level 11-20:  Uncommon rewards (badges, multipliers)
Level 21-30:  Rare rewards (exclusive badges)
Level 31-40:  Epic rewards (NFT badges)
Level 41-50:  Legendary rewards (unique cosmetics, large GREP)
```

**Database Schema:**
```prisma
model BattlePass {
  id          String   @id @default(cuid())
  season      Int
  name        String
  startDate   DateTime
  endDate     DateTime
  levels      Int      @default(50)
  xpPerLevel  Int      @default(1000)

  rewards     BattlePassReward[]
  progress    BattlePassProgress[]
}

model BattlePassReward {
  id           String   @id @default(cuid())
  battlePassId String
  level        Int
  tier         RewardTier
  type         RewardType
  value        Json

  battlePass   BattlePass @relation(fields: [battlePassId], references: [id])
}

model BattlePassProgress {
  id           String   @id @default(cuid())
  battlePassId String
  userId       String
  level        Int      @default(1)
  xp           Int      @default(0)
  isPremium    Boolean  @default(false)
  claimedLevels Int[]   @default([])

  battlePass   BattlePass @relation(fields: [battlePassId], references: [id])
  user         User       @relation(fields: [userId], references: [id])

  @@unique([battlePassId, userId])
}

enum RewardTier {
  FREE
  PREMIUM
}

enum RewardType {
  GREP
  BADGE
  MULTIPLIER
  COSMETIC
  NFT
}
```

**Components:**
```
apps/web/src/app/battle-pass/
├── page.tsx              # Battle pass main view
└── components/
    ├── PassProgress.tsx  # XP bar and level
    ├── RewardTrack.tsx   # Reward progression
    ├── RewardCard.tsx    # Individual reward
    ├── PremiumUpgrade.tsx# Premium purchase
    └── SeasonCountdown.tsx
```

### 4. Social Sharing
**Priority: Medium**

- **Share Achievements**: Post to Twitter/Discord
- **Share Scores**: Brag about high scores
- **OG Images**: Dynamic social preview images
- **Referral Tracking**: Track shares that convert

**OG Image Generation:**
```
apps/web/src/app/api/og/
├── achievement/route.tsx  # Achievement share image
├── score/route.tsx        # Score share image
├── profile/route.tsx      # Profile share image
└── leaderboard/route.tsx  # Leaderboard share image
```

**Share Templates:**
```typescript
interface ShareContent {
  type: 'achievement' | 'score' | 'level-up' | 'tournament'
  title: string
  description: string
  image: string // OG image URL
  url: string   // Link back to site
}

// Example achievement share
{
  type: 'achievement',
  title: 'Achievement Unlocked: Regex Master!',
  description: 'I just mastered regular expressions on GrepCoin! 🎮',
  image: '/api/og/achievement?id=regex-master',
  url: '/achievements/regex-master'
}
```

**Share Buttons:**
```
apps/web/src/components/share/
├── ShareButton.tsx       # Main share component
├── TwitterShare.tsx      # Twitter/X sharing
├── DiscordShare.tsx      # Discord webhook
├── CopyLink.tsx          # Copy shareable link
└── QRCode.tsx            # QR code generation
```

### 5. Guilds/Teams
**Priority: Medium**

- **Create Guilds**: Form teams with friends
- **Guild Leaderboards**: Compete as a team
- **Guild Chat**: In-app communication
- **Guild Events**: Team-based competitions
- **Guild Treasury**: Shared GREP pool

**Database Schema:**
```prisma
model Guild {
  id          String   @id @default(cuid())
  name        String   @unique
  tag         String   @unique @db.VarChar(5)
  description String?
  avatar      String?
  banner      String?
  ownerId     String
  level       Int      @default(1)
  xp          Int      @default(0)
  treasury    Int      @default(0)
  maxMembers  Int      @default(10)
  createdAt   DateTime @default(now())

  owner       User     @relation("GuildOwner", fields: [ownerId], references: [id])
  members     GuildMember[]
  invites     GuildInvite[]
}

model GuildMember {
  id          String   @id @default(cuid())
  guildId     String
  userId      String
  role        GuildRole @default(MEMBER)
  contribution Int     @default(0)
  joinedAt    DateTime @default(now())

  guild       Guild    @relation(fields: [guildId], references: [id])
  user        User     @relation(fields: [userId], references: [id])

  @@unique([guildId, userId])
}

enum GuildRole {
  OWNER
  OFFICER
  MEMBER
}

model GuildInvite {
  id          String   @id @default(cuid())
  guildId     String
  code        String   @unique
  uses        Int      @default(0)
  maxUses     Int?
  expiresAt   DateTime?
  createdAt   DateTime @default(now())

  guild       Guild    @relation(fields: [guildId], references: [id])
}
```

**Guild Features:**
| Feature | Description |
|---------|-------------|
| Guild Levels | Level up by member activity |
| Perks | GREP bonuses, exclusive events |
| Leaderboards | Weekly guild rankings |
| Treasury | Contribute/withdraw GREP |
| Wars | Guild vs guild competitions |

**Components:**
```
apps/web/src/app/guilds/
├── page.tsx              # Guild browser
├── create/page.tsx       # Create guild
├── [id]/page.tsx         # Guild profile
└── components/
    ├── GuildCard.tsx     # Guild preview
    ├── GuildMembers.tsx  # Member list
    ├── GuildChat.tsx     # Guild chat
    ├── GuildTreasury.tsx # Treasury management
    └── GuildLeaderboard.tsx
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/friends` | GET/POST | Friend management |
| `/api/events` | GET | List events |
| `/api/events/[id]/join` | POST | Join event |
| `/api/battle-pass` | GET | Get pass progress |
| `/api/battle-pass/claim` | POST | Claim reward |
| `/api/guilds` | GET/POST | Guild management |
| `/api/guilds/[id]/join` | POST | Join guild |
| `/api/share/[type]` | POST | Track share |

## Dependencies

```json
{
  "@vercel/og": "^0.6.0",
  "qrcode.react": "^3.1.0",
  "pusher": "^5.2.0",
  "pusher-js": "^8.4.0"
}
```

## Real-Time Features

Using Pusher/Socket.io for:
- Friend online status
- Activity feed updates
- Guild chat
- Event notifications
- Battle pass XP updates

## Notification System

```prisma
model Notification {
  id          String   @id @default(cuid())
  userId      String
  type        NotificationType
  title       String
  message     String
  data        Json?
  read        Boolean  @default(false)
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
}

enum NotificationType {
  FRIEND_REQUEST
  FRIEND_ACCEPTED
  ACHIEVEMENT
  EVENT_START
  BATTLE_PASS_REWARD
  GUILD_INVITE
  GUILD_MESSAGE
}
```

## Success Metrics

- Daily active friends connections
- Event participation rate > 50%
- Battle pass purchase conversion > 10%
- Share-to-signup conversion > 5%
- Guild retention rate > 70%

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Spam/abuse | Rate limiting, reporting |
| Toxic behavior | Moderation tools, blocking |
| Low engagement | Push notifications, incentives |
| Guild inactivity | Activity requirements, mergers |

---

*Stream 4 - Social & Engagement Plan*
