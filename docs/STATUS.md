# GrepCoin Project Status Report

**Last Updated:** December 27, 2024 (Session 4)
**Version:** 1.3.1
**Git Branch:** main
**Last Commit:** See git log for latest

---

## Executive Summary

GrepCoin is a decentralized arcade gaming platform built on Base L2, featuring 10 developer-themed games, play-to-earn mechanics, and comprehensive Web3 integration. The project is now **LIVE IN PRODUCTION** on Vercel with a NeonDB PostgreSQL backend.

**Overall Status:** 78% Production Ready

### Recent Updates (December 27, 2024)

#### Session 4: P1 Code Quality & Bug Fixes
- **ESLint warnings reduced by 36%**: 203 → 129 warnings
  - Phase 1 (PR #56): Fixed unused request params, imports - 203 → 190
  - Phase 2 (PR #57): Fixed unused variables, type imports - 190 → 158
  - Phase 3 (PR #58): Fixed `any` types, stale closures - 158 → 129
- **Critical game bugs fixed** (PR #55):
  - **Regex Crossword**: Fixed `indexOf('')` always returning 0, fixed unsolvable puzzle 5
  - **Merge Miners**: Fixed conflict lookup using reference equality, added feedback timeout
  - **Syntax Sprint**: Fixed contradictory game-over detection logic
  - **Crypto Snake**: Fixed false positive tail collision on valid moves
  - **Grep Rails**: Added max iterations guard to prevent infinite loops
- **Stale closure issues resolved** in React hooks:
  - `MultiplayerLobby.tsx`: fetchRooms wrapped in useCallback
  - `PlayerSpotlight.tsx`: animatedEarnings ref pattern
  - `useKeyboardShortcuts.ts`: shortcuts memoized with useMemo
  - `useLeaderboardRewards.ts`: fetchRewards in useCallback
  - `usePushNotifications.ts`: loadPreferences in useCallback
- **Error handling improved**: Replaced `catch (error: any)` with proper `catch (error: unknown)` pattern across API routes
- **Verified**: Agents and Discord Bot packages already compile (no fixes needed)

#### Session 3: Games Ecosystem Enhancements
- **Added 2 new games** (total now 10):
  - **Memory Match** - Card matching game with code symbols, 6 levels, combo system
  - **Pipe Dream** - Connect pipes puzzle to guide data flow, 10 levels with obstacles
- **Critical bug fixes**:
  - Fixed Grep Rails power-up bug (power-up type read after being set to undefined)
  - Fixed Syntax Sprint pattern matching (made validation stricter)
  - Fixed Merge Miners conflict resolution (added proper tile position tracking)
- **Visual improvements** for Merge Miners:
  - Added player trail effect, mining helmet, pulsing glow
  - Enhanced tiles with gradients, glow effects, bounce animations
  - Improved HUD with styled energy bar and stat boxes
  - Added ambient cave particles
- **Mobile touch controls** added to:
  - Merge Miners (D-pad for movement)
  - Syntax Sprint (left/right/drop/place buttons)
- **Pause functionality** added to:
  - Merge Miners, Syntax Sprint, Crypto Snake
  - Escape key shortcut + pause button in header

#### Session 2: Hosting Migration (GKE to Vercel)
- **Migrated from GKE Autopilot to Vercel** - Reduced hosting costs from ~$20-50/month to $0 (free tier)
- **Custom domain configured**: https://grepcoin.io now points to Vercel
- **All GCP resources cleaned up**: Cluster, disks, IPs, Container Registry, Cloud Build storage deleted
- **Environment variables configured** in Vercel: DATABASE_URL, DIRECT_URL, VAPID keys

#### Bug Fixes
- **Fixed client-side crash**: `TypeError: can't access property "slice", e.wallet is undefined`
  - Added null checks in `LiveActivityTicker.tsx` and `ReferralList.tsx`
  - Updated `/api/activity` to fetch real game scores from database
- **Fixed web-push initialization**: Made VAPID key initialization lazy to prevent build-time errors

#### Infrastructure
| Resource | Previous | Current |
|----------|----------|---------|
| Hosting | GKE Autopilot ($20-50/mo) | Vercel (FREE) |
| Database | NeonDB PostgreSQL | NeonDB PostgreSQL (unchanged) |
| Domain | grepcoin.io (via GKE LB) | grepcoin.io (via Vercel) |
| SSL | Let's Encrypt (cert-manager) | Vercel automatic SSL |
| CDN | None | Vercel Edge Network |

#### Feature Roadmap (New)
See `docs/BACKLOG.md` for full details. Summary:

| Priority | Feature | Effort |
|----------|---------|--------|
| **P1** | Leaderboard Rewards | 2-3 days |
| **P1** | Friend Challenges | 3-4 days |
| **P1** | Sound & Music | 2-3 days |
| **P2** | Game Replays | 1 week |
| **P2** | Seasonal Events | 1 week |
| **P2** | Guild Wars | 1-2 weeks |
| **P2** | Public Profiles | 2-3 days |
| **P2** | Daily Spin Wheel | 2-3 days |
| **P2** | Tutorial System | 3-4 days |
| **P3** | Spectator Mode | 1 week |
| **P3** | New Games (2 more) | 1-2 weeks |
| **P3** | Cosmetic System | 1 week |
| **P3** | Social Sharing | 2-3 days |
| **P3** | Achievement Categories | 1-2 days |
| **P3** | Streak Bonuses | 2 days |

**Total Backlog:** 30 items (15 technical + 15 features)

### Quick Status Overview

| Component | Status | Production Ready |
|-----------|--------|------------------|
| Smart Contracts | Passing Tests | 85% |
| Web Application | Building (129 warnings) | 75% |
| Discord Bot | Compiles ✅ | 60% |
| AI Agents | Compiles ✅ | 60% |
| Database Schema | Valid (env required) | 75% |
| Documentation | Comprehensive | 90% |

---

## Package Status & Versions

### Core Packages

#### 1. apps/web - Next.js Web Application
- **Version:** 0.1.0
- **Framework:** Next.js 15.5.9
- **Status:** Builds Successfully ✅
- **Issues:** 129 ESLint warnings (non-blocking, reduced from 203)
- **Production Ready:** 75%

**Build Status:**
```
✓ Compiled successfully
✓ 107 static pages generated
⚠ 129 linting warnings (mostly any types in email templates, lib files)
```

**Key Dependencies:**
- Next.js 15.5.9
- React 18.2.0
- Prisma 5.22.0
- wagmi 3.1.0
- viem 2.42.0
- Socket.io 4.8.1

**Features Implemented:**
- 10 playable arcade games
- Sign-In with Ethereum (SIWE)
- Leaderboards & achievements
- Staking integration
- NFT marketplace & auctions
- Push & email notifications
- Battle pass system
- Governance & guilds

**Known Issues:**
- 129 ESLint warnings remaining (mostly `any` types in email templates)
- VAPID keys not configured (push notifications)
- Requires environment variable configuration

#### 2. packages/contracts - Solidity Smart Contracts
- **Version:** 1.0.0
- **Compiler:** Solidity ^0.8.24
- **Status:** All Tests Passing ✅
- **Production Ready:** 85%

**Test Results:**
```
64 passing (977ms)
  GrepStakingPool: 24 tests ✓
  GrepToken: 20 tests ✓
  GrepVesting: 20 tests ✓
```

**Deployed Contracts:**
1. **GrepToken.sol** - ERC-20 token (1B supply)
2. **GrepStakingPool.sol** - 5-tier staking (5-20% APY)
3. **GrepVesting.sol** - Token vesting with cliff
4. **GrepGovernor.sol** - DAO governance
5. **GrepItems.sol** - ERC-1155 NFT items
6. **GrepAchievements.sol** - Soulbound badges
7. **GrepBurner.sol** - Deflationary mechanism

**Contract Coverage:**
- Core functionality: 100% tested
- Edge cases: Well covered
- Gas optimization: Moderate
- Security: Not audited

**Pre-Production Requirements:**
- Professional security audit needed
- Gas optimization review
- Mainnet deployment scripts
- Contract verification setup

#### 3. apps/discord-bot - Discord Community Bot
- **Version:** 1.0.0
- **Status:** Compiles Successfully ✅
- **Production Ready:** 60%

**Features:**
- Live activity updates
- Blockchain monitoring
- Stats commands
- Guardian agent integration

**Remaining Work:**
- Integration testing needed
- Production deployment configuration
- Command documentation

#### 4. packages/agents - AI Agent System
- **Version:** 1.0.0
- **Status:** Compiles Successfully ✅
- **Production Ready:** 60%

**Features:**
- Claude API integration
- GitHub Actions workflows
- Community, social, analytics agents
- Blockchain service integration

**Remaining Work:**
- Integration testing needed
- Production deployment strategy
- Agent behavior documentation

#### 5. packages/anti-cheat - Game Anti-Cheat
- **Version:** 1.0.0
- **Status:** Not Independently Tested
- **Production Ready:** 60%

**Features:**
- Score validation
- Rate limiting
- Pattern detection
- Session tracking

#### 6. packages/subgraph - The Graph Indexer
- **Version:** 1.0.0
- **Status:** Not Tested
- **Production Ready:** 50%

---

## Test Coverage Summary

### Smart Contracts (packages/contracts)
```
Total Tests: 64
Passing: 64 (100%)
Time: 977ms

Coverage by Contract:
- GrepToken: 20 tests (deployment, minting, caps, ERC20)
- GrepStakingPool: 24 tests (staking, rewards, tiers)
- GrepVesting: 20 tests (schedules, cliff, revocation)

Coverage Areas:
✓ Happy path scenarios
✓ Edge cases
✓ Access control
✓ State transitions
✓ Event emissions
✓ Revert conditions
```

**Missing Coverage:**
- Reentrancy attack scenarios
- Complex multi-user interactions
- Upgrade path testing
- Gas limit edge cases

### Web Application (apps/web)
- **Unit Tests:** Not implemented
- **Integration Tests:** Not implemented
- **E2E Tests:** Not implemented

**Testing Needs:**
- Jest setup for components
- Playwright/Cypress for E2E
- API route testing
- Game logic validation

### Overall Test Status
- Smart Contracts: Excellent (64 tests, 100% pass)
- Frontend: Not tested
- Backend APIs: Not tested
- Agents: Not tested

---

## Build Status

### Successful Builds ✅
1. **apps/web** - Next.js production build
   - Output: 107 static pages
   - Bundle size: Optimized
   - Warnings: 150+ (non-blocking)

2. **packages/contracts** - Hardhat compilation
   - All contracts compile
   - All tests pass
   - No errors

### All Packages Now Build ✅
As of Session 4, all packages compile successfully:
- apps/web: Builds with 129 warnings (non-blocking)
- apps/discord-bot: Compiles successfully
- packages/agents: Compiles successfully
- packages/contracts: All tests pass

### Build Commands
```bash
# Web app (✓ Works)
cd apps/web && npm run build

# Contracts (✓ Works)
cd packages/contracts && npm test

# Discord bot (✗ Fails)
cd apps/discord-bot && npm run build

# AI agents (✗ Fails)
cd packages/agents && npm run build
```

---

## Known Issues & TODOs

### Critical (Must Fix Before Production)
1. **Security Audit Required** - Smart contracts not professionally audited
2. **Environment Configuration** - Multiple .env files need proper setup
3. **Database Migrations** - Prisma schema requires DIRECT_URL env var
4. **Missing Tests** - Frontend and API routes lack test coverage
5. **VAPID Keys** - Push notifications not configured

### High Priority
1. **ESLint Warnings** - 129 remaining (mostly `any` types in email/lib files)
2. **Gas Optimization** - Contracts need optimization review
3. **Frontend Tests** - No unit/integration tests for web app
4. **API Tests** - No automated API route testing

### Medium Priority
1. **Documentation** - API documentation incomplete
2. **Error Handling** - Inconsistent error handling patterns
3. **Logging** - No centralized logging system
4. **Monitoring** - No production monitoring setup
5. **CI/CD** - GitHub Actions workflows not fully tested
6. **Rate Limiting** - API rate limits need refinement

### Low Priority
1. **Code Comments** - Many files lack detailed comments
2. **Bundle Size** - Could be optimized further
3. **Accessibility** - A11y improvements needed
4. **Mobile Optimization** - Some games now have touch controls (Merge Miners, Syntax Sprint), others need work
5. **Internationalization** - i18n setup incomplete

---

## Environment Requirements

### Required Environment Variables

#### apps/web (.env)
```bash
# Database (REQUIRED)
DATABASE_URL=postgresql://user:password@host:port/database
DIRECT_URL=postgresql://user:password@host:port/database

# Authentication (REQUIRED)
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000

# Blockchain (REQUIRED for Web3 features)
NEXT_PUBLIC_ALCHEMY_API_KEY=<your_alchemy_key>
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=<your_wc_id>
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_GREP_TOKEN_ADDRESS=<deployed_address>
NEXT_PUBLIC_STAKING_POOL_ADDRESS=<deployed_address>
NEXT_PUBLIC_GREP_ITEMS_ADDRESS=<deployed_address>
NEXT_PUBLIC_GREP_ACHIEVEMENTS_ADDRESS=<deployed_address>

# Services (OPTIONAL)
RESEND_API_KEY=<your_resend_key>
INTERNAL_API_KEY=<generate_random_string>
VAPID_PUBLIC_KEY=<from npm run generate:vapid>
VAPID_PRIVATE_KEY=<from npm run generate:vapid>
VAPID_MAILTO=<your_email>
```

#### packages/contracts (.env)
```bash
# Deployment
PRIVATE_KEY=<deployer_private_key>
TREASURY_ADDRESS=<treasury_wallet>
INITIAL_OWNER=<owner_wallet>

# RPC URLs
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# API Keys
BASESCAN_API_KEY=<your_basescan_key>
```

#### apps/discord-bot (.env)
```bash
DISCORD_BOT_TOKEN=<your_discord_token>
DISCORD_CLIENT_ID=<your_client_id>
DISCORD_GUILD_ID=<your_server_id>
API_BASE_URL=http://localhost:3000
```

#### packages/agents (.env)
```bash
# LLM Providers
OPENAI_API_KEY=<your_openai_key>
ANTHROPIC_API_KEY=<your_anthropic_key>
OLLAMA_API_URL=http://localhost:11434

# GitHub (for Actions)
GITHUB_TOKEN=<your_gh_token>
GITHUB_REPOSITORY=<owner/repo>

# Services
DISCORD_WEBHOOK_URL=<webhook_url>
TWITTER_API_KEY=<twitter_key>
```

### System Requirements
- Node.js: >=18.0.0 (specified in package.json)
- npm: Latest version recommended
- PostgreSQL: 14+ (for Prisma)
- Ollama: Latest (for local AI, optional)

### Development Tools
- Hardhat: For smart contract development
- Prisma: For database migrations
- TypeScript: 5.x
- ESLint: For code linting

---

## Deployment Readiness Checklist

### Pre-Production (Current State)
- [x] Smart contracts compile
- [x] Smart contract tests pass (64/64)
- [x] Web app builds successfully
- [x] Database schema defined
- [x] Basic documentation complete
- [ ] All packages build without errors
- [ ] Environment variables documented
- [ ] Frontend tests implemented
- [ ] API tests implemented

### Production Readiness
- [ ] Smart contracts audited by professional firm
- [ ] Contracts deployed to mainnet
- [ ] Contracts verified on Basescan
- [ ] Full test coverage (>80%)
- [ ] Security review completed
- [ ] Gas optimization completed
- [ ] Error handling reviewed
- [ ] Logging system implemented
- [ ] Monitoring/alerting setup
- [ ] CI/CD pipeline tested
- [ ] Load testing completed
- [ ] Disaster recovery plan
- [ ] Legal review completed
- [ ] Terms of Service finalized
- [ ] Privacy Policy finalized

### Infrastructure
- [x] Production database provisioned (NeonDB PostgreSQL)
- [x] RPC endpoints configured
- [x] CDN setup for static assets (Vercel Edge Network)
- [x] SSL certificates installed (Vercel automatic)
- [x] Domain DNS configured (grepcoin.io -> Vercel)
- [ ] Email service configured
- [x] Push notification service configured (VAPID keys set)
- [ ] Backup systems tested

### Security
- [ ] Smart contract audit report
- [ ] Penetration testing completed
- [ ] API security review
- [ ] Rate limiting tested
- [ ] CORS configured properly
- [ ] Secrets management setup
- [ ] Access controls reviewed
- [ ] Incident response plan

---

## Production-Ready vs Needs Work

### Production Ready (✅ 70%+)

#### 1. Smart Contracts (85%)
**Why Ready:**
- 64 comprehensive tests, all passing
- Well-structured code using OpenZeppelin
- Clear separation of concerns
- Access control implemented
- Event emissions for tracking

**Still Needs:**
- Professional security audit ($15-30k)
- Gas optimization review
- Mainnet deployment testing
- Emergency pause mechanisms tested

#### 2. Web Application Core (70%)
**Why Ready:**
- Builds successfully
- 10 functional games
- Authentication working
- Database integration solid
- Clean architecture

**Still Needs:**
- Fix ESLint warnings
- Add test coverage
- Configure all env vars
- Performance optimization
- Error boundary improvements

#### 3. Documentation (90%)
**Why Ready:**
- Comprehensive README
- Development guides (CONTEXT.md, AGENTS-GUIDE.md)
- Architecture documentation
- Changelog maintained
- API structure documented

**Still Needs:**
- API endpoint documentation
- Deployment guides
- Troubleshooting guides
- Video tutorials

### Needs More Work (❌ <70%)

#### 1. AI Agents Package (60%)
**Status:** Compiles successfully ✅

**Remaining Work:**
- Add comprehensive tests
- Document agent behaviors
- Production deployment strategy
- Estimated time: 1-2 days

#### 2. Discord Bot (60%)
**Status:** Compiles successfully ✅

**Remaining Work:**
- Add integration tests
- Document bot commands
- Production deployment configuration
- Estimated time: 1-2 days

#### 3. Testing Infrastructure (30%)
**Issues:**
- No frontend tests
- No API tests
- No E2E tests
- Only contracts tested

**Required Work:**
- Set up Jest for components
- Add API route tests
- Implement E2E with Playwright
- Add test coverage reporting
- Estimated time: 1-2 weeks

#### 4. DevOps/Infrastructure (50%)
**Issues:**
- CI/CD not fully tested
- No staging environment
- No monitoring setup
- No load testing

**Required Work:**
- Test GitHub Actions workflows
- Set up staging environment
- Implement Sentry/monitoring
- Performance/load testing
- Estimated time: 1 week

---

## File & Code Statistics

### Repository Overview
```
Total TypeScript Files: 499
Web App Source Files: 339
Smart Contracts: 5 (7 total including NFTs)
Total Lines of Code: ~50,000+ (estimated)
```

### Package Breakdown
```
apps/web/
  - Components: 60+
  - Pages: 30+
  - API Routes: 50+
  - Hooks: 25+
  - Games: 10

packages/contracts/
  - Contracts: 7
  - Tests: 64
  - Scripts: Deployment scripts

packages/agents/
  - Agents: 5 specialized
  - Providers: 3 (OpenAI, Anthropic, Ollama)
  - GitHub Actions: 6 workflows

packages/anti-cheat/
  - Validators: Multiple
  - Pattern detectors
```

### Dependencies
```
node_modules size (apps/web): 482 MB
Total dependencies: 500+ packages
Critical dependencies:
  - Next.js, React, TypeScript
  - Prisma, PostgreSQL
  - wagmi, viem, ethers
  - Hardhat, OpenZeppelin
  - Socket.io, Resend
```

---

## Honest Assessment

### What's Actually Production Ready

**Smart Contracts (with audit):**
The smart contracts are well-tested and follow best practices. With a professional audit, they could go to production. The test coverage is excellent and covers edge cases. However, gas optimization and a thorough security review are mandatory before mainnet deployment.

**Web Application (with fixes):**
The Next.js app builds and runs. The games work, authentication works, and the core features are implemented. However, it needs:
- Environment configuration completed
- ESLint warnings addressed
- Test coverage added
- Performance optimization
- Security review of API routes

### What Needs Significant Work

**AI Agents & Discord Bot:**
These packages don't currently compile due to dependency conflicts. They need:
- 2-3 days of focused work to resolve TypeScript errors
- Dependency updates (Anthropic SDK, viem)
- Comprehensive testing
- Production deployment strategy

**Testing Infrastructure:**
Only smart contracts have tests. The frontend and API routes lack any automated testing. This is a significant gap for production. Needs:
- 1-2 weeks to implement comprehensive test suite
- Jest for components
- API route testing
- E2E testing with Playwright

**DevOps & Monitoring:**
No production monitoring, logging, or alerting. No load testing. CI/CD exists but isn't fully validated. Needs:
- Monitoring setup (Sentry, DataDog, etc.)
- Logging infrastructure
- Load testing
- Disaster recovery planning

### Timeline to Production

**Optimistic (3-4 weeks):**
- Week 1: Fix TypeScript errors, add critical tests
- Week 2: Smart contract audit, fix findings
- Week 3: Complete test coverage, performance optimization
- Week 4: Deploy to staging, load testing, go-live

**Realistic (6-8 weeks):**
- Weeks 1-2: Fix all compilation errors, dependency updates
- Weeks 3-4: Comprehensive testing (unit, integration, E2E)
- Weeks 5-6: Smart contract audit, address findings
- Weeks 7-8: DevOps setup, staging deployment, security review, go-live

**Conservative (12 weeks):**
- Includes time for multiple audit rounds, comprehensive security review, load testing, beta period, and addressing all feedback.

---

## Recommendations

### Immediate Actions (This Week)
1. Fix TypeScript compilation errors in agents and discord-bot
2. Set up all required environment variables
3. Configure VAPID keys for push notifications
4. Address critical ESLint warnings (unused vars)
5. Document all API endpoints

### Short Term (Next 2 Weeks)
1. Implement frontend test suite (Jest + React Testing Library)
2. Add API route tests
3. Get smart contract audit quote and schedule
4. Set up staging environment
5. Implement monitoring and logging

### Medium Term (Next Month)
1. Complete smart contract audit
2. Implement E2E testing
3. Performance optimization
4. Load testing
5. Security review of all code
6. Beta testing period

### Long Term (Next Quarter)
1. Mainnet deployment
2. Community launch
3. Marketing campaign
4. Feature expansion
5. Mobile app development

---

## Version History

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 1.3.1 | Dec 27, 2024 | Production | P1 cleanup: ESLint 203→129, 5 game bugs fixed, stale closures resolved |
| 1.3.0 | Dec 27, 2024 | Production | 2 new games, bug fixes, visual enhancements, mobile controls, pause functionality |
| 1.2.0 | Dec 27, 2024 | Production | Added feature roadmap, 15 new feature plans |
| 1.1.0 | Dec 27, 2024 | Production | Migrated to Vercel, GKE cleanup, bug fixes |
| 1.0.0 | Dec 21, 2024 | Alpha | Initial status report |

---

## Conclusion

GrepCoin is now **LIVE IN PRODUCTION** at https://grepcoin.io, hosted on Vercel's free tier with NeonDB PostgreSQL backend. The migration from GKE has resulted in significant cost savings (~$20-50/month saved).

**Current Production Status:**
- Web app: Live and functional (129 ESLint warnings, all non-blocking)
- Database: NeonDB PostgreSQL (production)
- Hosting: Vercel (free tier)
- Domain: grepcoin.io with automatic SSL
- All packages: Compile successfully ✅
- Games: All 10 games audited and bugs fixed

**Remaining Items for Full Production:**
1. Smart contract professional audit ($15-30k, 2-4 weeks)
2. Email service configuration (Resend)
3. Implement comprehensive test coverage
4. Security review and monitoring setup

**Session 4 Accomplishments:**
- ESLint warnings reduced 36% (203 → 129)
- 5 critical game bugs fixed
- Stale closure issues resolved in React hooks
- Error handling patterns improved across API routes
- Verified agents/discord-bot packages compile

**Monthly Infrastructure Cost:**
- Previous (GKE): ~$20-50/month
- Current (Vercel): $0 (free tier)
- Database (NeonDB): Free tier

**Current State:** Production (MVP)
**Production Ready:** 78% overall (improved from 75%)
**Live URL:** https://grepcoin.io

The project is now live with improved code quality. Focus should shift to smart contract auditing, adding test coverage, and implementing remaining P1 features (Leaderboard Rewards, Friend Challenges, Sound & Music).

---

*Report Generated: December 27, 2024*
*Project: GrepCoin v1.3.0*
*Contact: hello@greplabs.io*
