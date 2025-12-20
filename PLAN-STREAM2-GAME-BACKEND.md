# Stream 2: Game Core Backend

## Overview
Build robust backend infrastructure for multiplayer gaming, tournaments, replay systems, analytics, and anti-cheat mechanisms.

## Features

### 1. Anti-Cheat System
**Priority: Critical**

- **Score Validation**: Server-side verification of all game scores
- **Pattern Detection**: ML-based anomaly detection for suspicious patterns
- **Rate Limiting**: Prevent rapid-fire score submissions
- **Device Fingerprinting**: Track and flag suspicious devices
- **Replay Verification**: Validate scores against replay data

**Implementation:**
```
packages/anti-cheat/
├── src/
│   ├── validators/
│   │   ├── score-validator.ts    # Score range checks
│   │   ├── timing-validator.ts   # Timing anomalies
│   │   └── pattern-detector.ts   # ML pattern detection
│   ├── fingerprint.ts            # Device fingerprinting
│   └── index.ts
└── tests/
```

**Validation Rules:**
| Game | Max Score/Min | Time Bounds | Streak Limits |
|------|---------------|-------------|---------------|
| Regex | 1000/min | 30s-300s | 50 max |
| Memory | 500/min | 60s-600s | 20 max |
| Speed | 2000/min | 15s-180s | 100 max |

**Database Schema:**
```prisma
model CheatReport {
  id          String   @id @default(cuid())
  userId      String
  gameSlug    String
  scoreId     String
  reason      String
  confidence  Float
  status      CheatStatus @default(PENDING)
  createdAt   DateTime @default(now())
  reviewedAt  DateTime?
  reviewedBy  String?

  user        User     @relation(fields: [userId], references: [id])
}

enum CheatStatus {
  PENDING
  CONFIRMED
  CLEARED
  BANNED
}
```

### 2. Session Management
**Priority: High**

- **Secure Sessions**: HMAC-signed session tokens (already implemented)
- **Session Persistence**: Redis-backed session storage
- **Concurrent Session Handling**: Manage multiple devices
- **Session Recovery**: Resume interrupted games

**Redis Schema:**
```
session:{sessionId} -> {
  userId: string,
  gameSlug: string,
  startTime: number,
  events: Event[],
  checkpoint: GameState
}
```

### 3. Real-Time Multiplayer
**Priority: High**

- **WebSocket Infrastructure**: Socket.io for real-time communication
- **Game Rooms**: Create and join multiplayer rooms
- **State Synchronization**: Keep all players in sync
- **Latency Compensation**: Handle network delays gracefully

**Implementation:**
```
packages/multiplayer/
├── src/
│   ├── server.ts           # Socket.io server
│   ├── rooms/
│   │   ├── room-manager.ts # Room lifecycle
│   │   ├── game-room.ts    # Game room class
│   │   └── matchmaking.ts  # Player matching
│   ├── sync/
│   │   ├── state-sync.ts   # State synchronization
│   │   └── interpolation.ts# Client prediction
│   └── events/
│       ├── game-events.ts  # Game event types
│       └── chat-events.ts  # In-game chat
└── tests/
```

**Events:**
```typescript
interface GameEvents {
  'room:create': (options: RoomOptions) => void
  'room:join': (roomId: string) => void
  'room:leave': () => void
  'game:action': (action: GameAction) => void
  'game:state': (state: GameState) => void
  'chat:message': (message: ChatMessage) => void
}
```

### 4. Tournament System
**Priority: Medium**

- **Tournament Types**: Single elimination, double elimination, round robin
- **Bracket Generation**: Automatic bracket creation and seeding
- **Live Updates**: Real-time tournament progress
- **Prize Distribution**: Automated GREP token rewards

**Database Schema:**
```prisma
model Tournament {
  id          String   @id @default(cuid())
  name        String
  gameSlug    String
  type        TournamentType
  status      TournamentStatus
  entryFee    Int      @default(0)
  prizePool   Int
  maxPlayers  Int
  startTime   DateTime
  endTime     DateTime?
  createdAt   DateTime @default(now())

  brackets    Bracket[]
  entries     TournamentEntry[]
}

model Bracket {
  id           String   @id @default(cuid())
  tournamentId String
  round        Int
  position     Int
  player1Id    String?
  player2Id    String?
  winnerId     String?
  score1       Int?
  score2       Int?

  tournament   Tournament @relation(fields: [tournamentId], references: [id])
}

model TournamentEntry {
  id           String   @id @default(cuid())
  tournamentId String
  userId       String
  seed         Int?
  status       EntryStatus
  joinedAt     DateTime @default(now())

  tournament   Tournament @relation(fields: [tournamentId], references: [id])
  user         User       @relation(fields: [userId], references: [id])
}
```

### 5. Replay System
**Priority: Medium**

- **Game Recording**: Capture all game events for replay
- **Replay Playback**: Watch replays with variable speed
- **Replay Sharing**: Share replays via URL
- **Highlight Generation**: Auto-detect exciting moments

**Implementation:**
```
packages/replay/
├── src/
│   ├── recorder.ts      # Event recording
│   ├── player.ts        # Replay playback
│   ├── compressor.ts    # Replay compression
│   └── highlights.ts    # Highlight detection
└── storage/
    └── s3-adapter.ts    # S3 storage for replays
```

**Replay Format:**
```typescript
interface Replay {
  id: string
  gameSlug: string
  userId: string
  duration: number
  finalScore: number
  events: ReplayEvent[]
  metadata: {
    version: string
    compressed: boolean
    checksum: string
  }
}

interface ReplayEvent {
  timestamp: number
  type: string
  data: unknown
}
```

### 6. Analytics Dashboard
**Priority: Medium**

- **Player Analytics**: Engagement, retention, progression
- **Game Analytics**: Popular games, peak times, average sessions
- **Revenue Analytics**: GREP earned/spent, staking metrics
- **Real-Time Metrics**: Live player counts, active games

**Dashboard Pages:**
```
apps/web/src/app/admin/analytics/
├── page.tsx           # Analytics overview
├── players/
│   └── page.tsx       # Player analytics
├── games/
│   └── page.tsx       # Game analytics
├── revenue/
│   └── page.tsx       # Revenue metrics
└── components/
    ├── MetricCard.tsx
    ├── TimeSeriesChart.tsx
    └── HeatmapCalendar.tsx
```

**Metrics Tracked:**
| Category | Metrics |
|----------|---------|
| Players | DAU, MAU, retention, churn |
| Games | Sessions, avg duration, completion rate |
| Economy | GREP earned, spent, staked |
| Performance | Latency, errors, uptime |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/games/session` | POST | Create game session |
| `/api/games/validate` | POST | Validate game score |
| `/api/tournaments` | GET/POST | Tournament CRUD |
| `/api/tournaments/[id]/join` | POST | Join tournament |
| `/api/replays` | GET/POST | Replay management |
| `/api/multiplayer/rooms` | GET/POST | Room management |

## Infrastructure Requirements

### Redis
- Session storage
- Real-time leaderboards
- Rate limiting
- Pub/sub for multiplayer

### Object Storage (S3/R2)
- Replay storage
- Analytics exports
- Backup storage

### WebSocket Server
- Socket.io deployment
- Horizontal scaling with Redis adapter
- Health monitoring

## Environment Variables

```env
REDIS_URL=redis://localhost:6379
S3_BUCKET=grepcoin-replays
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
SOCKET_IO_PORT=3001
```

## Success Metrics

- Anti-cheat false positive rate < 1%
- Multiplayer latency < 100ms
- Tournament completion rate > 95%
- Replay load time < 2s

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| DDoS attacks | Rate limiting, Cloudflare |
| Data loss | Redis persistence, backups |
| Cheating | Multi-layer validation |
| Scale issues | Horizontal scaling, caching |

---

*Stream 2 - Game Core Backend Plan*
