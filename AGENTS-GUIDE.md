# GrepCoin Agent Development Guide

This guide provides instructions for Claude agents working on GrepCoin development streams.

## Quick Start for Agents

1. Read `CONTEXT.md` for full codebase context
2. Read your stream's plan file (`PLAN-STREAM*.md`)
3. Check existing code patterns before implementing
4. Follow the conventions documented below
5. Create tests for new functionality
6. Update Prisma schema if adding database models

## Stream Assignments

| Stream | Plan File | Focus |
|--------|-----------|-------|
| Stream 1 | `PLAN-STREAM1-AI-AGENTS.md` | AI/Claude integration |
| Stream 2 | `PLAN-STREAM2-GAME-BACKEND.md` | Game infrastructure |
| Stream 3 | `PLAN-STREAM3-CRYPTO.md` | Blockchain/contracts |
| Stream 4 | `PLAN-STREAM4-SOCIAL.md` | Social features |

## Development Conventions

### File Naming
- Components: `PascalCase.tsx` (e.g., `AchievementCard.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useProfile.ts`)
- API routes: `route.ts` in folder structure
- Utils: `camelCase.ts` (e.g., `formatDate.ts`)
- Contracts: `PascalCase.sol` (e.g., `GrepToken.sol`)

### Directory Structure

#### Adding a new API endpoint:
```
apps/web/src/app/api/
└── your-feature/
    ├── route.ts           # GET, POST handlers
    └── [id]/
        └── route.ts       # GET, PUT, DELETE by ID
```

#### Adding a new component:
```
apps/web/src/components/
└── your-feature/
    ├── FeatureCard.tsx
    ├── FeatureList.tsx
    └── index.ts           # Re-exports
```

#### Adding a new page:
```
apps/web/src/app/
└── your-feature/
    ├── page.tsx           # Main page
    ├── [id]/
    │   └── page.tsx       # Detail page
    └── components/        # Page-specific components
```

#### Adding a new contract:
```
packages/contracts/
├── contracts/
│   └── YourContract.sol
├── test/
│   └── YourContract.t.sol
└── scripts/
    └── deploy-your-contract.ts
```

### Code Style

#### React Components
```tsx
'use client'

import { useState, useEffect } from 'react'
import { SomeIcon } from 'lucide-react'

interface YourComponentProps {
  title: string
  onAction: () => void
}

export function YourComponent({ title, onAction }: YourComponentProps) {
  const [loading, setLoading] = useState(false)

  return (
    <div className="rounded-2xl bg-dark-800 border border-dark-600 p-6">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <button
        onClick={onAction}
        disabled={loading}
        className="px-4 py-2 rounded-xl bg-gradient-to-r from-grep-purple to-grep-pink text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        Action
      </button>
    </div>
  )
}
```

#### API Routes
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { parseSessionToken } from '@/lib/auth'
import { rateLimiters } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value
    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const session = parseSessionToken(sessionToken)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // 2. Rate limiting
    const rateCheck = rateLimiters.default(session.address)
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Rate limited' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) } }
      )
    }

    // 3. Parse body
    const body = await request.json()

    // 4. Validate input
    if (!body.requiredField) {
      return NextResponse.json({ error: 'Missing required field' }, { status: 400 })
    }

    // 5. Database operation
    const result = await prisma.model.create({
      data: { /* ... */ }
    })

    // 6. Return success
    return NextResponse.json({ success: true, data: result })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

#### Custom Hooks
```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'

interface YourData {
  id: string
  name: string
}

export function useYourHook(param: string | null) {
  const [data, setData] = useState<YourData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!param) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/your-endpoint/${param}`)
      if (!res.ok) throw new Error('Failed to fetch')

      const json = await res.json()
      setData(json.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [param])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch }
}
```

#### Smart Contracts
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title YourContract
 * @dev Description of what this contract does
 */
contract YourContract is Ownable, Pausable, ReentrancyGuard {
    // Events
    event SomethingHappened(address indexed user, uint256 value);

    // State
    mapping(address => uint256) public balances;

    // Constructor
    constructor() Ownable(msg.sender) {}

    // External functions
    function doSomething(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be positive");
        balances[msg.sender] += amount;
        emit SomethingHappened(msg.sender, amount);
    }

    // Admin functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
```

### Prisma Schema Updates

When adding new models:

```prisma
// 1. Add model to schema.prisma
model NewFeature {
  id        String   @id @default(cuid())
  userId    String
  name      String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

// 2. Add relation to User model
model User {
  // ... existing fields
  newFeatures NewFeature[]
}
```

Then run:
```bash
cd apps/web
npx prisma generate
npx prisma db push  # or npx prisma migrate dev
```

### Testing

#### Contract Tests (Foundry)
```solidity
// test/YourContract.t.sol
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/YourContract.sol";

contract YourContractTest is Test {
    YourContract public yourContract;
    address public user = address(1);

    function setUp() public {
        yourContract = new YourContract();
    }

    function test_DoSomething() public {
        vm.prank(user);
        yourContract.doSomething(100);
        assertEq(yourContract.balances(user), 100);
    }

    function testFail_DoSomethingZero() public {
        vm.prank(user);
        yourContract.doSomething(0);
    }
}
```

Run tests:
```bash
cd packages/contracts
forge test
```

### Common Patterns

#### Creating Activity Feed Entries
```typescript
await prisma.activity.create({
  data: {
    type: 'your_type',  // score, achievement, reward, streak, levelup
    wallet: user.walletAddress,
    username: user.username,
    game: gameName,     // optional
    value: someValue,   // optional
    message: 'did something cool',
    icon: '🎮',
  },
})
```

#### Rate Limiting
```typescript
// Add to lib/rate-limit.ts
export const rateLimiters = {
  // ... existing
  yourFeature: createRateLimiter({
    windowMs: 60 * 1000,  // 1 minute
    maxRequests: 10,      // 10 requests per minute
  }),
}
```

#### Error Handling
```typescript
try {
  // operation
} catch (error) {
  console.error('Descriptive error:', error)

  if (error instanceof SomeSpecificError) {
    return NextResponse.json({ error: 'Specific message' }, { status: 400 })
  }

  return NextResponse.json({ error: 'Internal error' }, { status: 500 })
}
```

## Stream-Specific Guidelines

### Stream 1: AI Agents
- Use `@anthropic-ai/sdk` for Claude
- Store API keys in environment variables only
- Implement streaming for long responses
- Add token usage tracking

### Stream 2: Game Backend
- All scores must be validated server-side
- Use Redis for session storage
- Implement anti-cheat in layers
- WebSocket via Socket.io

### Stream 3: Crypto/Blockchain
- Test on Base Sepolia first
- Use OpenZeppelin for standards
- Implement pause functionality
- Add events for all state changes

### Stream 4: Social
- Use Prisma transactions for friend requests
- Implement proper cascading deletes
- Add indexes for common queries
- Use real-time updates via Pusher/WebSocket

## Git Workflow

1. Create feature branch: `git checkout -b stream-X/feature-name`
2. Make atomic commits with clear messages
3. Push to remote: `git push origin stream-X/feature-name`
4. Create PR against `main`
5. Wait for CI checks and review

## Dependencies

Before adding new dependencies:
1. Check if functionality exists in current deps
2. Prefer well-maintained, typed packages
3. Consider bundle size impact
4. Add to correct workspace

```bash
# For web app
cd apps/web
npm install package-name

# For contracts
cd packages/contracts
npm install package-name

# For agents
cd packages/agents
npm install package-name
```

## Environment Setup

Required for development:
```bash
# Install dependencies
npm install

# Generate Prisma client
cd apps/web && npx prisma generate

# Start development
npm run dev
```

## Questions?

If unclear about patterns or conventions, check:
1. Existing similar code in the codebase
2. The CONTEXT.md file
3. The relevant PLAN-STREAM*.md file

---

*Agent Development Guide for GrepCoin*
