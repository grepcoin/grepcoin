# GrepCoin Development Thinking & Reasoning

This document captures the chain of thought, architectural decisions, and reasoning behind GrepCoin development choices. Use this to understand WHY decisions were made.

## Core Philosophy

### Why "AI-Built Crypto Arcade"?
- **Unique positioning**: Most memecoins have no utility. GrepCoin combines:
  - Real games that are fun to play
  - Earn-to-play mechanics with GREP tokens
  - AI-powered development transparency
  - Developer-focused community (regex, coding themes)

### Why Base Network?
- Low gas fees (critical for microtransactions in games)
- Coinbase ecosystem support
- Growing developer community
- EVM compatible (easy deployment)
- Fast finality

## Technical Decisions

### Authentication: HMAC vs JWT

**Decision**: Use HMAC-signed session tokens

**Reasoning**:
```
JWT Pros:
- Standard, well-known
- Self-contained (stateless)
- Libraries available

JWT Cons:
- Can't invalidate without blacklist
- Token size larger
- Need to handle refresh tokens

HMAC Pros:
- Simpler implementation
- Smaller token size
- Can verify without external deps
- Easy to invalidate (change secret)

HMAC Cons:
- Not a standard
- Need to serialize expiry manually
```

**Conclusion**: For a game platform where sessions are short-lived and we control both client and server, HMAC is simpler and sufficient.

### Database: PostgreSQL on NeonDB

**Decision**: Use NeonDB serverless PostgreSQL

**Reasoning**:
- Serverless = scales with Vercel
- PostgreSQL = robust, full-featured
- Prisma ORM = type-safe, migrations
- Connection pooling built-in
- Free tier generous for MVP

### Rate Limiting: In-Memory vs Redis

**Decision**: In-memory for MVP, Redis later

**Reasoning**:
```
In-Memory Pros:
- Zero config
- No external dependency
- Fast

In-Memory Cons:
- Resets on deploy
- Not shared across instances
- Memory usage

Redis Pros:
- Persistent across deploys
- Shared across instances
- Advanced patterns (sliding window)

Redis Cons:
- Another service to manage
- Cost
- Latency (minor)
```

**Conclusion**: Start simple, add Redis when scaling. The rate limits are generous enough that reset on deploy is acceptable.

### Game Score Validation

**Decision**: Multi-layer validation

**Reasoning**:
```
Layer 1: Client-side (UX only)
- Immediate feedback
- Can be bypassed

Layer 2: Session validation
- HMAC signature check
- Expiry check

Layer 3: Rate limiting
- 10 submissions per minute
- Prevents spam

Layer 4: Score bounds
- Min/max per game
- Statistical analysis

Layer 5: Pattern detection (future)
- ML-based anomaly detection
- Cross-session analysis
```

### Achievement System

**Decision**: Database-backed with client notifications

**Reasoning**:
```
Option A: Client-only
- Fast
- No server load
- Easy to cheat

Option B: Server-only, delayed
- Secure
- Can batch
- Poor UX (no immediate feedback)

Option C: Server-validated, client-notified (CHOSEN)
- Secure (server validates)
- Good UX (immediate notifications)
- Flexible (can add NFT claims later)
```

**Implementation Details**:
- Achievements stored in database with type/target
- Progress tracked per user
- Check on every score submission
- Return unlocked achievements in response
- Client shows toast notifications

### Token Economics

**Decision**: Capped minting by category

**Reasoning**:
```
Total Supply: 1,000,000,000 GREP

Allocation:
- 40% (400M): Liquidity + Team - Minted at deploy
- 30% (300M): Staking Rewards - Minted over time
- 20% (200M): Gameplay Rewards - Minted as earned
- 10% (100M): Airdrops/Marketing - Minted for campaigns

Why caps?
- Predictable inflation
- Transparent economics
- Prevents unlimited minting
- Different mint functions per category
```

### Staking Tiers

**Decision**: Time-locked tiers with multipliers

**Reasoning**:
```
Tier        | Lock   | Multiplier | Why
------------|--------|------------|----
Flexible    | 0      | 1.0x       | Liquidity, no bonus
Bronze      | 30d    | 1.25x      | Entry commitment
Silver      | 90d    | 1.5x       | Medium commitment
Gold        | 180d   | 2.0x       | Strong commitment
Diamond     | 365d   | 3.0x       | Maximum commitment

Design goals:
- Reward long-term holders
- Reduce sell pressure
- Create community tiers
- Simple to understand
```

## Architecture Patterns

### API Route Pattern
```typescript
// Every API route follows this pattern:
export async function METHOD(request: NextRequest) {
  try {
    // 1. Authentication (if needed)
    // 2. Rate limiting
    // 3. Input validation
    // 4. Business logic
    // 5. Database operations
    // 6. Return success
  } catch (error) {
    // Log error
    // Return generic error (don't leak details)
  }
}
```

**Why this pattern**:
- Consistent error handling
- Security first (auth, rate limit before logic)
- Easy to audit
- Easy to test

### Component Pattern
```tsx
// Every component follows this pattern:
'use client'

import { /* hooks */ } from 'react'
import { /* icons */ } from 'lucide-react'

interface Props { /* typed props */ }

export function ComponentName({ props }: Props) {
  // State
  // Effects
  // Handlers
  // Return JSX
}
```

**Why this pattern**:
- Explicit client components
- Typed props for safety
- Consistent structure
- Easy to read

### Hook Pattern
```typescript
export function useFeature(param: T | null) {
  const [data, setData] = useState<Data | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { /* fetch */ }, [param])

  return { data, isLoading, error }
}
```

**Why this pattern**:
- Null param = no fetch (prevents errors)
- Three states: data, loading, error
- Easy to compose
- Consistent across hooks

## Stream-Specific Reasoning

### Stream 1: AI Agents

**Why Claude over GPT-4?**
- Better at code understanding
- Longer context window
- More reliable for structured output
- Anthropic's safety approach aligns with our values

**Why GitHub Actions for agents?**
- Already in CI/CD flow
- No additional infrastructure
- Triggered by relevant events
- Free for public repos

### Stream 2: Game Backend

**Why Socket.io for multiplayer?**
- Well-established
- Fallback transports
- Room abstractions built-in
- Large community

**Why separate anti-cheat package?**
- Reusable across games
- Easier to test
- Can be updated independently
- Clear separation of concerns

### Stream 3: Crypto/Blockchain

**Why ERC-1155 for achievements?**
- Multiple achievement types in one contract
- Gas efficient for batches
- Supports both fungible and non-fungible
- Standard, well-audited

**Why testnet first?**
- Safe to make mistakes
- No real money at risk
- Can test all flows
- Easy to reset

### Stream 4: Social

**Why database-backed friends vs on-chain?**
- Fast queries
- No gas costs
- Easy to update
- Privacy (not all relations need to be public)

**Why Pusher for real-time?**
- Managed service
- Scales automatically
- Easy integration
- Reasonable pricing

## Future Considerations

### Scaling
- Move rate limiting to Redis
- Add read replicas for DB
- CDN for static assets
- Edge functions for latency

### Security
- Bug bounty program
- Regular audits
- Rate limit tuning
- Anomaly detection

### Features
- Mobile app (React Native)
- More games
- DAO governance
- Cross-chain bridges

---

*Thinking document for GrepCoin development reasoning*
