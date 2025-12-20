# GrepCoin Codebase Context

This document provides full context for Claude agents working on GrepCoin features.

## Project Overview

GrepCoin is an AI-built crypto arcade where users play games to earn GREP tokens. Built with:
- **Frontend**: Next.js 15 (App Router), React 18, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL on NeonDB
- **Blockchain**: Base network, Solidity 0.8.24, Hardhat
- **AI**: Claude API, Ollama (local)
- **Bot**: Discord.js

## Repository Structure

```
grepcoin/
├── apps/
│   ├── web/                    # Next.js web application
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database schema
│   │   │   └── seed.ts         # Seed data
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   │   ├── api/        # API routes
│   │   │   │   ├── games/      # Game pages
│   │   │   │   ├── profile/    # User profile
│   │   │   │   └── fundraise/  # Fundraising page
│   │   │   ├── components/     # React components
│   │   │   ├── context/        # React contexts
│   │   │   ├── hooks/          # Custom hooks
│   │   │   └── lib/            # Utilities
│   │   └── tailwind.config.ts
│   └── discord-bot/            # Discord bot
│       └── src/
│           ├── index.ts
│           ├── commands/
│           └── events/
├── packages/
│   ├── contracts/              # Solidity smart contracts
│   │   ├── contracts/
│   │   │   ├── GrepToken.sol
│   │   │   ├── GrepStakingPool.sol
│   │   │   └── GrepVesting.sol
│   │   ├── test/
│   │   └── hardhat.config.ts
│   └── agents/                 # AI agents
│       ├── src/
│       │   ├── core/           # Agent framework
│       │   ├── providers/      # LLM providers
│       │   ├── agents/         # Agent implementations
│       │   ├── github-actions/ # GitHub Action agents
│       │   └── services/       # Shared services
│       └── dist/
├── .github/
│   └── workflows/              # GitHub Actions
└── PLAN-STREAM*.md             # Development plans
```

## Database Schema (Prisma)

### Core Models

```prisma
model User {
  id            String    @id @default(cuid())
  walletAddress String    @unique
  username      String?   @unique
  avatar        String?
  referralCode  String?   @unique
  createdAt     DateTime  @default(now())

  gameScores     GameScore[]
  achievements   UserAchievement[]
  stakes         Stake[]
  dailyStats     DailyStats[]
  dailyRewards   DailyReward[]
  referralsMade  Referral[] @relation("Referrer")
  referredBy     Referral?  @relation("Referee")
}

model Game {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  description String
  icon        String
  color       String
  minReward   Int
  maxReward   Int
  isActive    Boolean  @default(true)
}

model GameScore {
  id         String   @id @default(cuid())
  userId     String
  gameId     String
  score      Int
  grepEarned Int
  duration   Int
  streak     Int      @default(0)
  multiplier Float    @default(1)
  createdAt  DateTime @default(now())
}

model Achievement {
  id          String @id @default(cuid())
  slug        String @unique
  name        String
  description String
  icon        String
  rarity      String  // common, uncommon, rare, epic, legendary
  reward      Int
  type        String  // score, streak, games, perfect, challenge
  target      Int?
  gameSlug    String?
}

model Stake {
  id          String    @id @default(cuid())
  userId      String
  amount      BigInt
  tier        String    // flexible, bronze, silver, gold, diamond
  multiplier  Float     @default(1)
  lockedUntil DateTime?
  txHash      String?   @unique
  chainId     Int
}
```

### Additional Models
- `DailyChallenge` - Daily game challenges
- `ChallengeCompletion` - Challenge tracking
- `DailyStats` - Daily user stats
- `GlobalStats` - Platform-wide stats
- `Activity` - Live activity feed
- `Session` - Auth sessions (SIWE)
- `DailyReward` - Login rewards
- `Referral` - Referral tracking
- `AirdropClaim` - Airdrop claims
- `Backer` - Fundraising backers
- `FundraiseStats` - Campaign stats

## API Routes Pattern

All API routes follow this pattern:

```typescript
// apps/web/src/app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { parseSessionToken } from '@/lib/auth'
import { rateLimiters } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication (if needed)
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value
    const session = parseSessionToken(sessionToken)

    // 2. Rate limiting
    const rateCheck = rateLimiters.someLimit(session.address)
    if (!rateCheck.success) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }

    // 3. Database operations
    const data = await prisma.model.findMany({...})

    // 4. Return response
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

## Authentication

Using SIWE (Sign-In With Ethereum) with HMAC-signed session tokens:

```typescript
// lib/auth.ts
import crypto from 'crypto'

const SESSION_SECRET = process.env.SESSION_SECRET!

export function createSessionToken(address: string): string {
  const payload = {
    address: address.toLowerCase(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }
  const data = JSON.stringify(payload)
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('hex')
  return Buffer.from(`${data}.${signature}`).toString('base64')
}

export function parseSessionToken(token: string): { address: string } | null {
  // Validates HMAC signature and expiration
}
```

## React Hooks Pattern

```typescript
// hooks/useProfile.ts
'use client'
import { useState, useEffect } from 'react'

interface Profile { /* ... */ }

export function useProfile(walletAddress: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!walletAddress) { setIsLoading(false); return }

    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/users/${walletAddress}`)
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        setProfile(data.user)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [walletAddress])

  return { profile, isLoading, error }
}
```

## Component Pattern

```tsx
// components/SomeComponent.tsx
'use client'

import { useState } from 'react'
import { SomeIcon } from 'lucide-react'

interface Props {
  data: SomeType
  onAction: () => void
}

export function SomeComponent({ data, onAction }: Props) {
  const [state, setState] = useState(false)

  return (
    <div className="rounded-2xl bg-dark-800 border border-dark-600 p-6">
      {/* Content */}
    </div>
  )
}
```

## Smart Contracts

### GrepToken (ERC-20)
```solidity
contract GrepToken is ERC20, ERC20Burnable, ERC20Permit, Ownable, Pausable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;

    // Minting caps by category
    uint256 public constant STAKING_REWARDS_CAP = 300_000_000 * 10**18;
    uint256 public constant GAMEPLAY_REWARDS_CAP = 200_000_000 * 10**18;
    uint256 public constant AIRDROPS_CAP = 100_000_000 * 10**18;

    mapping(address => bool) public minters;

    function mintStakingRewards(address to, uint256 amount) external onlyMinter;
    function mintGameplayRewards(address to, uint256 amount) external onlyMinter;
    function mintAirdrop(address to, uint256 amount) external onlyMinter;
}
```

### GrepStakingPool
```solidity
contract GrepStakingPool is ReentrancyGuard, Pausable, Ownable {
    IERC20 public grepToken;

    struct StakeInfo {
        uint256 amount;
        uint256 tier;
        uint256 lockEnd;
        uint256 multiplier;
    }

    mapping(address => StakeInfo) public stakes;

    function stake(uint256 amount, uint256 tier) external;
    function unstake() external;
    function claimRewards() external;
}
```

### GrepVesting
```solidity
contract GrepVesting is Ownable, Pausable {
    struct VestingSchedule {
        uint256 total;
        uint256 released;
        uint256 start;
        uint256 cliff;
        uint256 duration;
        bool revocable;
        bool revoked;
    }

    mapping(address => VestingSchedule) public schedules;

    function createSchedule(address beneficiary, uint256 total, uint256 cliff, uint256 duration, bool revocable) external;
    function release() external;
    function revoke(address beneficiary) external;
}
```

## TailwindCSS Theme

```typescript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        dark: {
          600: '#2A2A35',
          700: '#1E1E26',
          800: '#16161C',
          900: '#0D0D12',
        },
        grep: {
          purple: '#8B5CF6',
          pink: '#EC4899',
          orange: '#F97316',
          yellow: '#FBBF24',
          green: '#22C55E',
          blue: '#3B82F6',
          cyan: '#06B6D4',
        },
      },
    },
  },
}
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Auth
SESSION_SECRET=...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...

# Blockchain
NEXT_PUBLIC_CHAIN_ID=84532
DEPLOYER_PRIVATE_KEY=0x...

# AI
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
OLLAMA_URL=http://localhost:11434

# Discord
DISCORD_TOKEN=...
DISCORD_CLIENT_ID=...
DISCORD_WEBHOOK_URL=...

# External
COINGECKO_API_KEY=...
```

## Games Available

| Slug | Name | Type |
|------|------|------|
| regex-rush | Regex Rush | Pattern matching |
| memory-match | Memory Match | Card matching |
| speed-type | Speed Type | Typing speed |
| code-breaker | Code Breaker | Logic puzzle |
| bug-hunter | Bug Hunter | Find bugs |
| quantum-grep | Quantum Grep | Advanced regex |
| regex-crossword | Regex Crossword | Crossword puzzle |
| merge-miners | Merge Miners | Merge game |
| syntax-sprint | Syntax Sprint | Syntax race |
| grep-rails | Grep Rails | Rail shooter |

## Key Libraries

### Frontend
- `next` - 15.x (App Router)
- `react` - 18.x
- `wagmi` - Web3 hooks
- `viem` - Ethereum utils
- `@rainbow-me/rainbowkit` - Wallet UI
- `lucide-react` - Icons
- `tailwindcss` - Styling
- `framer-motion` - Animations

### Backend
- `@prisma/client` - ORM
- `discord.js` - Discord bot
- `@anthropic-ai/sdk` - Claude API

### Contracts
- `@openzeppelin/contracts` - Standards
- `hardhat` - Development
- `foundry` - Testing

## Deployment

- **Web**: Vercel (https://website-five-beta-55.vercel.app)
- **Database**: NeonDB PostgreSQL
- **Contracts**: Base Sepolia (testnet), Base (mainnet)
- **Bot**: Runs on server/container

## GitHub Actions

Existing workflows:
- `ai-pr-reviewer.yml` - Reviews PRs with Claude
- `ai-issue-triage.yml` - Categorizes issues
- `ai-debug-helper.yml` - Helps debug failures
- `ai-security-guardian.yml` - Security scanning
- `ai-analytics-reporter.yml` - Weekly reports
- `ai-feature-ideator.yml` - Feature suggestions

---

*Context document for GrepCoin parallel development*
