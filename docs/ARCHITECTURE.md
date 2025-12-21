# GrepCoin Architecture

Technical architecture documentation for the GrepCoin platform.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────┤
│   Web App   │  Discord    │   Mobile    │   Webhook   │   CLI   │
│  (Next.js)  │    Bot      │   (PWA)     │  Consumers  │  Agent  │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┴────┬────┘
       │             │             │             │           │
       ▼             ▼             ▼             ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────────┐ │
│  │  Auth   │ │  Games  │ │ Social  │ │ Economy │ │    AI     │ │
│  │  SIWE   │ │ Submit  │ │ Friends │ │  Market │ │   Chat    │ │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └─────┬─────┘ │
│       │           │           │           │            │        │
│  ┌────▼───────────▼───────────▼───────────▼────────────▼────┐  │
│  │                    MIDDLEWARE                             │  │
│  │  • Rate Limiting  • Session Auth  • Input Validation     │  │
│  │  • Anti-Cheat     • CORS          • Error Handling       │  │
│  └────────────────────────────┬─────────────────────────────┘  │
└───────────────────────────────┼─────────────────────────────────┘
                                │
       ┌────────────────────────┼────────────────────────┐
       │                        │                        │
       ▼                        ▼                        ▼
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  PostgreSQL │         │   Base L2   │         │   Claude    │
│   (Prisma)  │         │ (Contracts) │         │     API     │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ • Users     │         │ • GrepToken │         │ • Chat      │
│ • Games     │         │ • Staking   │         │ • Review    │
│ • Scores    │         │ • NFTs      │         │ • Analysis  │
│ • Social    │         │ • Governance│         └─────────────┘
│ • Economy   │         └─────────────┘
└─────────────┘
```

## Component Architecture

### 1. Web Application (Next.js 15)

```
apps/web/
├── src/
│   ├── app/                    # App Router
│   │   ├── api/               # API Routes (91 endpoints)
│   │   │   ├── auth/          # Authentication
│   │   │   ├── games/         # Game operations
│   │   │   ├── leaderboards/  # Rankings
│   │   │   ├── friends/       # Social
│   │   │   ├── guilds/        # Guilds
│   │   │   ├── tournaments/   # Tournaments
│   │   │   ├── marketplace/   # Trading
│   │   │   ├── auctions/      # Auctions
│   │   │   ├── battle-pass/   # Battle Pass
│   │   │   ├── ai/            # AI Chat
│   │   │   └── ...
│   │   ├── games/             # Game pages
│   │   ├── profile/           # User profile
│   │   ├── leaderboard/       # Leaderboards
│   │   └── ...
│   ├── components/            # React Components (112)
│   │   ├── games/             # Game-specific
│   │   ├── ui/                # Reusable UI
│   │   └── ...
│   ├── hooks/                 # Custom Hooks (47)
│   │   ├── useAuth.ts
│   │   ├── useLeaderboards.ts
│   │   ├── useFriends.ts
│   │   └── ...
│   ├── context/               # React Context
│   │   ├── AuthContext.tsx
│   │   └── StakingContext.tsx
│   └── lib/                   # Utilities
│       ├── auth.ts            # Session handling
│       ├── rate-limit.ts      # Rate limiting
│       ├── prisma.ts          # Database client
│       └── wagmi.ts           # Web3 config
└── prisma/
    └── schema.prisma          # Database schema
```

### 2. Smart Contracts (Solidity)

```
packages/contracts/
├── contracts/
│   ├── GrepToken.sol          # ERC-20 token
│   │   ├── 1B max supply
│   │   ├── Categorized minting (staking, gameplay, airdrops)
│   │   ├── Role-based minting permissions
│   │   ├── Burnable, Pausable
│   │   └── OpenZeppelin base
│   │
│   ├── GrepStakingPool.sol    # Staking system
│   │   ├── 5 tiers (Flexible → Diamond)
│   │   ├── APY rewards (5-20%)
│   │   ├── Lock periods (0-90 days)
│   │   ├── Multiplier benefits
│   │   └── ReentrancyGuard
│   │
│   ├── GrepItems.sol          # ERC-1155 game items
│   │   ├── Rarity tiers
│   │   ├── Tradability controls
│   │   └── Game integration
│   │
│   ├── GrepAchievements.sol   # ERC-1155 achievements
│   │   ├── Soulbound (non-transferable)
│   │   ├── EIP-712 signature claims
│   │   └── Nonce-based replay protection
│   │
│   ├── GrepVesting.sol        # Token vesting
│   │   ├── Cliff periods
│   │   ├── Linear vesting
│   │   └── Revocable schedules
│   │
│   ├── GrepGovernance.sol     # DAO governance
│   │   ├── Proposal creation (10K GREP)
│   │   ├── 3-day voting period
│   │   └── 4% quorum requirement
│   │
│   └── GrepBurner.sol         # Token burning
│       ├── Burn tiers (Bronze → Diamond)
│       └── Deflationary mechanics
│
├── scripts/
│   ├── deploy-all.js          # Full deployment
│   ├── deploy-testnet.js      # Quick testnet
│   ├── verify.js              # Basescan verification
│   └── setup-roles.js         # Role configuration
│
└── test/                      # 64 tests
    ├── GrepToken.test.js
    ├── GrepStakingPool.test.js
    └── GrepVesting.test.js
```

### 3. AI Agents

```
packages/agents/
├── src/
│   ├── providers/
│   │   ├── claude.ts          # Anthropic Claude
│   │   ├── openai.ts          # OpenAI GPT
│   │   └── ollama.ts          # Local Ollama
│   │
│   ├── github-actions/        # CI/CD Agents
│   │   ├── pr-reviewer.ts     # Code review
│   │   ├── security-guardian.ts
│   │   ├── issue-triage.ts
│   │   ├── debug-helper.ts
│   │   ├── feature-ideator.ts
│   │   └── claude-client.ts   # Shared client
│   │
│   └── agents/                # Autonomous agents
│       ├── community.ts
│       ├── social.ts
│       └── guardian.ts
│
└── package.json
```

### 4. Anti-Cheat System

```
packages/anti-cheat/
├── src/
│   ├── types.ts               # Interfaces
│   ├── index.ts               # Main validator
│   └── validators/
│       ├── score-validator.ts # Game-specific limits
│       ├── timing-validator.ts # Session timing
│       └── rate-validator.ts   # Request frequency
│
└── package.json
```

## Data Flow

### Authentication Flow

```
1. User clicks "Connect Wallet"
         │
         ▼
2. GET /api/auth/nonce
   Returns: { nonce: "abc123" }
         │
         ▼
3. Wallet signs SIWE message
   "grepcoin.io wants you to sign in..."
         │
         ▼
4. POST /api/auth/verify
   Body: { message, signature }
         │
         ▼
5. Server validates signature
   Creates session token (HMAC signed)
   Sets HTTP-only cookie
         │
         ▼
6. User authenticated
   Session valid for 7 days
```

### Game Score Submission Flow

```
1. Player completes game
         │
         ▼
2. Client sends POST /api/games/[slug]/submit
   Body: { score, duration, metadata }
         │
         ▼
3. API validates session token
         │
         ▼
4. Rate limiter checks (6/min, 100/hour)
         │
         ▼
5. Anti-cheat validators run
   ├── Score validator (game-specific limits)
   ├── Timing validator (min/max duration)
   └── Rate validator (request frequency)
         │
         ▼
6. If valid, calculate rewards
   ├── Base reward from game config
   ├── Apply staking multiplier
   └── Apply streak bonus
         │
         ▼
7. Save to database
   ├── Create GameScore record
   ├── Update DailyStats
   └── Check achievement unlocks
         │
         ▼
8. Return response
   { score, grepEarned, rank, achievements }
```

### Blockchain Transaction Flow

```
1. User initiates action (stake, mint, vote)
         │
         ▼
2. wagmi hook prepares transaction
   useWriteContract({ ... })
         │
         ▼
3. Wallet prompts for signature
         │
         ▼
4. Transaction sent to Base L2
         │
         ▼
5. Contract executes
   ├── Validates permissions
   ├── Updates state
   └── Emits events
         │
         ▼
6. Transaction confirmed
         │
         ▼
7. The Graph indexes event
         │
         ▼
8. UI updates via polling/websocket
```

## Database Schema (Key Models)

```prisma
// Core
model User {
  id            String   @id
  walletAddress String   @unique
  username      String?  @unique
  // Relations to all features
}

model GameScore {
  id        String   @id
  userId    String
  gameSlug  String
  score     Int
  grepEarned Float
  createdAt DateTime
}

// Social
model Friendship {
  id        String
  userId    String
  friendId  String
  status    FriendshipStatus
}

model Guild {
  id          String
  name        String
  tag         String
  level       Int
  members     GuildMember[]
}

// Economy
model MarketplaceListing {
  id       String
  sellerId String
  itemId   String
  price    Int
  status   ListingStatus
}

model Tournament {
  id           String
  name         String
  game         String
  status       TournamentStatus
  prizePool    Int
  participants TournamentParticipant[]
}

// Progression
model BattlePass {
  id      String
  season  Int
  rewards BattlePassReward[]
}
```

## Security Architecture

### Authentication
- SIWE (Sign-In with Ethereum) for wallet auth
- HMAC-signed session tokens (not JWT)
- HTTP-only cookies for session storage
- 7-day session expiry

### API Security
- Rate limiting per endpoint category
- Input validation with Zod schemas
- CORS configuration for allowed origins
- Request signing for sensitive operations

### Smart Contract Security
- OpenZeppelin base contracts
- ReentrancyGuard on all external calls
- Role-based access control
- Pausable for emergencies
- No use of tx.origin
- Checks-effects-interactions pattern

### Anti-Cheat
- Server-side score validation
- Timing analysis
- Rate limiting
- Confidence scoring
- Suspicious activity logging

## Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Vercel Edge                       │
│  ┌─────────────────────────────────────────────┐   │
│  │              Next.js Application             │   │
│  │  • SSR/ISR Pages                            │   │
│  │  • API Routes                               │   │
│  │  • Edge Functions                           │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   NeonDB    │  │    Base     │  │   Resend    │
│ (Postgres)  │  │     L2      │  │   (Email)   │
└─────────────┘  └─────────────┘  └─────────────┘
```

### Infrastructure
- **Hosting:** Vercel (Edge + Serverless)
- **Database:** NeonDB (Serverless Postgres)
- **Blockchain:** Base L2 (Ethereum L2)
- **AI:** Claude API (Anthropic)
- **Email:** Resend
- **Indexing:** The Graph

## Performance Considerations

### Frontend
- Next.js App Router with streaming
- React Server Components for initial load
- Client-side caching with SWR/React Query
- Image optimization with next/image
- Code splitting per route

### API
- Serverless functions scale automatically
- Connection pooling with Prisma
- Rate limiting to prevent abuse
- Caching headers for static data

### Blockchain
- Base L2 for low gas costs
- Batch operations where possible
- Event-driven UI updates
- The Graph for complex queries

## Monitoring & Observability

### Logging
- Structured JSON logs
- Request/response logging
- Error tracking with stack traces

### Metrics
- API latency percentiles
- Error rates by endpoint
- User engagement metrics
- Blockchain transaction success rate

### Alerts
- Error rate thresholds
- API latency spikes
- Contract anomalies
- Security incidents
