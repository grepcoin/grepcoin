# GrepCoin Key Files Reference

Quick reference for important files in each development stream.

## Core Infrastructure

| File | Purpose |
|------|---------|
| `apps/web/prisma/schema.prisma` | Database schema - ALL models |
| `apps/web/src/lib/db.ts` | Prisma client singleton |
| `apps/web/src/lib/auth.ts` | HMAC session tokens |
| `apps/web/src/lib/rate-limit.ts` | Rate limiting utilities |
| `apps/web/tailwind.config.ts` | Tailwind theme (colors) |
| `apps/web/src/app/globals.css` | Global styles, animations |
| `apps/web/src/app/layout.tsx` | Root layout, providers |

## Stream 1: AI Agents

### Existing AI Code
| File | Purpose |
|------|---------|
| `packages/agents/src/core/agent.ts` | Base agent class |
| `packages/agents/src/core/types.ts` | Agent type definitions |
| `packages/agents/src/providers/ollama.ts` | Ollama LLM provider |
| `packages/agents/src/providers/openai.ts` | OpenAI provider |
| `packages/agents/src/github-actions/claude-client.ts` | Claude API client |
| `packages/agents/src/github-actions/pr-reviewer.ts` | PR review agent |
| `packages/agents/src/github-actions/issue-triage.ts` | Issue triage agent |
| `packages/agents/src/github-actions/debug-helper.ts` | Debug helper agent |
| `packages/agents/src/github-actions/security-guardian.ts` | Security scanner |
| `packages/agents/src/github-actions/analytics-reporter.ts` | Analytics agent |
| `packages/agents/src/github-actions/feature-ideator.ts` | Feature ideas agent |

### GitHub Workflows
| File | Purpose |
|------|---------|
| `.github/workflows/ai-pr-reviewer.yml` | PR review workflow |
| `.github/workflows/ai-issue-triage.yml` | Issue triage workflow |
| `.github/workflows/ai-debug-helper.yml` | Debug workflow |
| `.github/workflows/ai-security-guardian.yml` | Security workflow |
| `.github/workflows/ai-analytics-reporter.yml` | Analytics workflow |
| `.github/workflows/ai-feature-ideator.yml` | Feature workflow |

### New Files to Create
```
packages/agents/src/providers/claude.ts         # Claude API provider
apps/web/src/app/api/ai/analyze/route.ts        # Code analysis API
apps/web/src/app/api/ai/fix/route.ts            # Auto-fix API
apps/web/src/app/api/ai/chat/route.ts           # AI chat API
apps/web/src/components/ai/AutoFixPanel.tsx     # Fix suggestions UI
apps/web/src/components/ai/CodeAnalyzer.tsx     # Analysis UI
apps/discord-bot/src/commands/ask.ts            # Discord AI command
```

## Stream 2: Game Backend

### Existing Game Code
| File | Purpose |
|------|---------|
| `apps/web/src/app/api/games/route.ts` | List games API |
| `apps/web/src/app/api/games/[slug]/route.ts` | Single game API |
| `apps/web/src/app/api/games/[slug]/submit/route.ts` | Score submission |
| `apps/web/src/app/api/leaderboard/route.ts` | Leaderboard API |
| `apps/web/src/app/api/challenges/route.ts` | Daily challenges |
| `apps/web/src/app/api/challenges/complete/route.ts` | Complete challenge |

### Game Pages
| File | Purpose |
|------|---------|
| `apps/web/src/app/games/regex-rush/page.tsx` | Regex Rush game |
| `apps/web/src/app/games/memory-match/page.tsx` | Memory Match |
| `apps/web/src/app/games/speed-type/page.tsx` | Speed Type |
| `apps/web/src/app/games/code-breaker/page.tsx` | Code Breaker |
| `apps/web/src/app/games/bug-hunter/page.tsx` | Bug Hunter |
| `apps/web/src/app/games/quantum-grep/page.tsx` | Quantum Grep |

### New Files to Create
```
packages/anti-cheat/src/validators/score.ts     # Score validation
packages/anti-cheat/src/validators/timing.ts    # Timing checks
packages/anti-cheat/src/pattern-detector.ts     # ML patterns
packages/multiplayer/src/server.ts              # Socket.io server
packages/multiplayer/src/rooms/room-manager.ts  # Room management
packages/replay/src/recorder.ts                 # Replay recording
packages/replay/src/player.ts                   # Replay playback
apps/web/src/app/api/tournaments/route.ts       # Tournament API
apps/web/src/app/admin/analytics/page.tsx       # Analytics dashboard
```

## Stream 3: Crypto/Blockchain

### Existing Contracts
| File | Purpose |
|------|---------|
| `packages/contracts/contracts/GrepToken.sol` | ERC-20 token |
| `packages/contracts/contracts/GrepStakingPool.sol` | Staking contract |
| `packages/contracts/contracts/GrepVesting.sol` | Vesting schedules |

### Contract Tests
| File | Purpose |
|------|---------|
| `test/GrepToken.t.sol` | Token tests |
| `test/StakingPool.t.sol` | Staking tests |
| `test/VestingVault.t.sol` | Vesting tests |

### Deployment
| File | Purpose |
|------|---------|
| `script/Deploy.s.sol` | Foundry deploy script |
| `packages/contracts/hardhat.config.ts` | Hardhat config |

### New Files to Create
```
packages/contracts/contracts/GrepAchievements.sol    # NFT achievements
packages/contracts/contracts/GrepLeaderboard.sol     # On-chain leaderboard
packages/contracts/scripts/deploy-all.ts             # Full deployment
packages/contracts/scripts/verify-all.ts             # Contract verification
apps/web/src/app/api/blockchain/claim/route.ts       # Claim signature API
apps/web/src/components/badges/BadgeGrid.tsx         # Badge display
apps/web/src/components/badges/BadgeClaimModal.tsx   # Claim modal
subgraph/schema.graphql                              # The Graph schema
subgraph/src/mapping.ts                              # Event handlers
```

## Stream 4: Social & Engagement

### Existing Social Code
| File | Purpose |
|------|---------|
| `apps/web/src/app/api/referral/route.ts` | Referral system |
| `apps/web/src/app/api/activity/route.ts` | Activity feed |
| `apps/web/src/app/profile/page.tsx` | User profile |
| `apps/web/src/components/AchievementNotification.tsx` | Achievement popups |
| `apps/web/src/hooks/useProfile.ts` | Profile data hook |

### Discord Bot
| File | Purpose |
|------|---------|
| `apps/discord-bot/src/index.ts` | Bot entry point |
| `apps/discord-bot/src/commands/` | Bot commands |
| `apps/discord-bot/src/events/` | Event handlers |

### New Files to Create
```
apps/web/src/app/api/friends/route.ts              # Friends list
apps/web/src/app/api/friends/request/route.ts      # Friend requests
apps/web/src/app/api/friends/[id]/route.ts         # Friend actions
apps/web/src/app/api/events/route.ts               # Events list
apps/web/src/app/api/events/[id]/join/route.ts     # Join event
apps/web/src/app/api/battle-pass/route.ts          # Battle pass
apps/web/src/app/api/guilds/route.ts               # Guilds
apps/web/src/app/api/og/achievement/route.tsx      # OG image
apps/web/src/components/social/FriendList.tsx      # Friends UI
apps/web/src/components/social/ActivityFeed.tsx    # Feed UI
apps/web/src/app/events/page.tsx                   # Events page
apps/web/src/app/battle-pass/page.tsx              # Battle pass page
apps/web/src/app/guilds/page.tsx                   # Guilds page
```

## Shared Components

### UI Components
| File | Purpose |
|------|---------|
| `apps/web/src/components/Navbar.tsx` | Navigation bar |
| `apps/web/src/components/Logo.tsx` | Logo component |
| `apps/web/src/components/WalletButton.tsx` | Wallet connection |
| `apps/web/src/components/Footer.tsx` | Footer |

### Context Providers
| File | Purpose |
|------|---------|
| `apps/web/src/context/AuthContext.tsx` | Auth state |
| `apps/web/src/context/StakingContext.tsx` | Staking state |

### Hooks
| File | Purpose |
|------|---------|
| `apps/web/src/hooks/useProfile.ts` | User profile |
| `apps/web/src/hooks/useAchievements.ts` | Achievements |

## Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Root monorepo config |
| `apps/web/package.json` | Web app deps |
| `apps/web/next.config.js` | Next.js config |
| `apps/web/tsconfig.json` | TypeScript config |
| `packages/contracts/foundry.toml` | Foundry config |
| `packages/contracts/package.json` | Contracts deps |
| `.github/workflows/ci.yml` | CI workflow |

## Database Migrations

Location: `apps/web/prisma/migrations/`

To create new migration:
```bash
cd apps/web
npx prisma migrate dev --name your_migration_name
```

## Environment Files

| File | Purpose |
|------|---------|
| `.env.example` | Example env vars |
| `.env.local` | Local development |
| `.env.production` | Production vars |

---

*Key Files Reference for GrepCoin Development*
