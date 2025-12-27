# GrepCoin Development Backlog

**Last Updated:** December 27, 2024 (Session 2)
**Status:** Active Development
**Total Items:** 30 (15 technical + 15 features)

---

## Workflow Guidelines

### Branch Naming Convention
```
feature/short-description    # New features
fix/issue-description        # Bug fixes
chore/task-description       # Maintenance tasks
docs/topic                   # Documentation updates
refactor/component-name      # Code refactoring
```

### PR Process
1. Create feature branch from `main`
2. Make changes with atomic commits
3. Push branch and create PR
4. Request review
5. Address feedback
6. Squash and merge to `main`

### Commit Message Format
```
type: short description

- Detailed bullet points
- What changed and why

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`

---

## Priority Levels

| Priority | Description | Timeline |
|----------|-------------|----------|
| P0 | Critical/Blocking | Immediate |
| P1 | High Priority | This week |
| P2 | Medium Priority | This month |
| P3 | Low Priority | Backlog |

---

## Active Backlog

### P0 - Critical

#### [ ] 1. Email Service Configuration
**Branch:** `feature/email-service`
**Effort:** 2-4 hours
**Description:** Configure Resend for transactional emails
**Tasks:**
- [ ] Add RESEND_API_KEY to Vercel environment
- [ ] Test email sending functionality
- [ ] Verify email templates work in production
- [ ] Add email verification flow testing

---

### P1 - High Priority

#### [ ] 2. Fix Agents Package TypeScript Errors
**Branch:** `fix/agents-typescript`
**Effort:** 1-2 days
**Description:** Resolve compilation errors in packages/agents
**Tasks:**
- [ ] Update @anthropic-ai/sdk to latest version
- [ ] Fix viem version conflicts
- [ ] Resolve type predicate issues
- [ ] Add missing type declarations
- [ ] Test all agent functionality
**Blockers:** Anthropic SDK API changes

#### [ ] 3. Fix Discord Bot TypeScript Errors
**Branch:** `fix/discord-bot-typescript`
**Effort:** 1 day
**Description:** Resolve compilation errors in apps/discord-bot
**Tasks:**
- [ ] Fix missing @grepcoin/agents dependency (after #2)
- [ ] Resolve unknown type errors
- [ ] Add proper type declarations
- [ ] Test bot commands
**Dependencies:** Requires #2 to be completed first

#### [ ] 4. ESLint Warnings Cleanup
**Branch:** `chore/eslint-cleanup`
**Effort:** 1-2 days
**Description:** Fix 150+ ESLint warnings in apps/web
**Tasks:**
- [ ] Fix unused variable warnings
- [ ] Replace `any` types with proper types
- [ ] Fix React Hook dependency warnings
- [ ] Fix unescaped entities in JSX
- [ ] Run `npm run lint` with zero warnings

#### [ ] 5. Add Frontend Test Coverage
**Branch:** `test/frontend-coverage`
**Effort:** 1 week
**Description:** Implement Jest + React Testing Library tests
**Tasks:**
- [ ] Set up Jest configuration
- [ ] Add tests for critical components (Navbar, WalletButton, etc.)
- [ ] Add tests for hooks (useAuth, useStaking, etc.)
- [ ] Add tests for game score submission
- [ ] Achieve 50%+ coverage on critical paths

---

### P2 - Medium Priority

#### [ ] 6. API Route Testing
**Branch:** `test/api-routes`
**Effort:** 3-5 days
**Description:** Add tests for all API endpoints
**Tasks:**
- [ ] Set up API testing framework
- [ ] Test authentication routes
- [ ] Test game score submission
- [ ] Test leaderboard endpoints
- [ ] Test marketplace endpoints
- [ ] Mock database for testing

#### [ ] 7. Monitoring & Logging Setup
**Branch:** `feature/monitoring`
**Effort:** 2-3 days
**Description:** Add production monitoring and error tracking
**Tasks:**
- [ ] Set up Sentry for error tracking
- [ ] Add structured logging
- [ ] Create health check dashboard
- [ ] Set up alerts for critical errors
- [ ] Add performance monitoring

#### [ ] 8. Game Mobile Optimization
**Branch:** `feature/mobile-games`
**Effort:** 3-5 days
**Description:** Improve mobile experience for all 8 games
**Tasks:**
- [ ] Add touch controls to all games
- [ ] Fix viewport issues on mobile
- [ ] Optimize canvas rendering for mobile
- [ ] Add mobile-specific UI adjustments
- [ ] Test on iOS and Android devices

#### [ ] 9. Performance Optimization
**Branch:** `perf/web-optimization`
**Effort:** 2-3 days
**Description:** Improve page load times and performance
**Tasks:**
- [ ] Analyze bundle size with @next/bundle-analyzer
- [ ] Implement code splitting for games
- [ ] Optimize images with next/image
- [ ] Add lazy loading for non-critical components
- [ ] Reduce JavaScript payload

#### [ ] 10. Smart Contract Audit Preparation
**Branch:** `chore/audit-prep`
**Effort:** 1 week
**Description:** Prepare contracts for professional audit
**Tasks:**
- [ ] Complete NatSpec documentation
- [ ] Add additional edge case tests
- [ ] Create audit documentation
- [ ] Gas optimization review
- [ ] Create deployment checklist

---

## New Features

### P1 - High Priority Features

#### [ ] 16. Leaderboard Rewards System
**Branch:** `feature/leaderboard-rewards`
**Effort:** 2-3 days
**Description:** Automatic GREP rewards for top leaderboard players
**Tasks:**
- [ ] Create weekly/monthly reward distribution logic
- [ ] Add reward tiers (Top 10, Top 50, Top 100)
- [ ] Create reward claim UI in leaderboard page
- [ ] Add notification for reward eligibility
- [ ] Create admin tool for manual distribution
**Rewards Structure:**
- Weekly: Top 10 = 1000 GREP, Top 50 = 500 GREP, Top 100 = 250 GREP
- Monthly: Top 10 = 5000 GREP, Top 50 = 2000 GREP, Top 100 = 1000 GREP

#### [ ] 17. Friend Challenges
**Branch:** `feature/friend-challenges`
**Effort:** 3-4 days
**Description:** Challenge friends to beat your high score
**Tasks:**
- [ ] Create challenge API endpoints
- [ ] Add "Challenge Friend" button on game over screen
- [ ] Create challenge notification system
- [ ] Build challenges inbox/dashboard
- [ ] Add challenge leaderboard between friends
- [ ] Implement GREP wagering on challenges (optional)

#### [ ] 18. Sound & Music System
**Branch:** `feature/game-audio`
**Effort:** 2-3 days
**Description:** Add sound effects and background music to games
**Tasks:**
- [ ] Create audio manager utility
- [ ] Add sound effects for all 8 games (score, game over, powerup)
- [ ] Add background music tracks
- [ ] Create volume controls in settings
- [ ] Add mute toggle in game UI
- [ ] Ensure mobile compatibility

---

### P2 - Medium Priority Features

#### [ ] 19. Game Replays
**Branch:** `feature/game-replays`
**Effort:** 1 week
**Description:** Record, save, and share game replays
**Tasks:**
- [ ] Create replay recording system (capture game state)
- [ ] Build replay storage (database or cloud)
- [ ] Create replay viewer component
- [ ] Add "Watch Replay" on leaderboard entries
- [ ] Enable replay sharing via URL
- [ ] Add replay to profile showcase

#### [ ] 20. Seasonal Events
**Branch:** `feature/seasonal-events`
**Effort:** 1 week
**Description:** Time-limited seasonal events with special rewards
**Tasks:**
- [ ] Create event system architecture
- [ ] Build event banner/announcement UI
- [ ] Add seasonal game modes/modifiers
- [ ] Create event-exclusive rewards
- [ ] Add event leaderboard
- [ ] Build event countdown timer
**Example Events:** Winter Holiday, Lunar New Year, Halloween, Anniversary

#### [ ] 21. Guild Wars
**Branch:** `feature/guild-wars`
**Effort:** 1-2 weeks
**Description:** Weekly guild vs guild competition
**Tasks:**
- [ ] Create guild war matchmaking system
- [ ] Build war dashboard showing progress
- [ ] Add guild war leaderboard
- [ ] Create war rewards distribution
- [ ] Add guild war chat/coordination
- [ ] Build war history/stats page

#### [ ] 22. Public Profile Pages
**Branch:** `feature/public-profiles`
**Effort:** 2-3 days
**Description:** Shareable public profile pages
**Tasks:**
- [ ] Create /player/[username] route
- [ ] Display achievements, stats, badges
- [ ] Add social sharing meta tags (OG image)
- [ ] Show recent activity feed
- [ ] Add "Add Friend" button for visitors
- [ ] Create profile customization options

#### [ ] 23. Daily Spin Wheel
**Branch:** `feature/spin-wheel`
**Effort:** 2-3 days
**Description:** Daily bonus wheel for random rewards
**Tasks:**
- [ ] Create spin wheel component with animation
- [ ] Define reward tiers (GREP, XP, items, rare drops)
- [ ] Add daily spin limit (1 free, more with staking)
- [ ] Create spin history tracking
- [ ] Add special jackpot prizes
- [ ] Integrate with staking multipliers

#### [ ] 24. Tutorial System
**Branch:** `feature/tutorials`
**Effort:** 3-4 days
**Description:** Interactive tutorials for each game
**Tasks:**
- [ ] Create tutorial overlay component
- [ ] Add step-by-step instructions per game
- [ ] Implement practice mode (no score submission)
- [ ] Create "First Time" detection
- [ ] Add skip tutorial option
- [ ] Track tutorial completion in profile

---

### P3 - Low Priority Features

#### [ ] 25. Spectator Mode
**Branch:** `feature/spectator-mode`
**Effort:** 1 week
**Description:** Watch live multiplayer games
**Tasks:**
- [ ] Create spectator WebSocket channel
- [ ] Build spectator UI overlay
- [ ] Add "Watch Live" button on multiplayer lobby
- [ ] Show spectator count to players
- [ ] Add spectator chat
- [ ] Create featured matches section

#### [ ] 26. New Games (Batch 2)
**Branch:** `feature/new-games-batch2`
**Effort:** 2-3 weeks
**Description:** Add 4 new arcade games
**Planned Games:**
- [ ] **Pipe Dream** - Connect pipes before water flows (Puzzle)
- [ ] **Memory Match** - Card matching with code symbols (Memory)
- [ ] **Tower Defense** - Defend against bug invasions (Strategy)
- [ ] **Endless Runner** - Infinite runner with coding obstacles (Action)
**Tasks per game:**
- [ ] Game design document
- [ ] Core game mechanics
- [ ] Scoring and GREP rewards
- [ ] Anti-cheat integration
- [ ] Mobile optimization

#### [ ] 27. Cosmetic System
**Branch:** `feature/cosmetics`
**Effort:** 1 week
**Description:** Visual customization for games
**Tasks:**
- [ ] Create theme/skin system architecture
- [ ] Add game board themes (neon, retro, minimal)
- [ ] Create player avatars/icons
- [ ] Add cursor/pointer customization
- [ ] Create cosmetic shop
- [ ] Integrate with NFT minting

#### [ ] 28. Social Sharing
**Branch:** `feature/social-sharing`
**Effort:** 2-3 days
**Description:** Share achievements and scores on social media
**Tasks:**
- [ ] Create shareable score cards (image generation)
- [ ] Add Twitter/X share integration
- [ ] Add Discord share integration
- [ ] Create achievement share templates
- [ ] Add referral tracking to shares
- [ ] Build share analytics

#### [ ] 29. Achievement Categories
**Branch:** `feature/achievement-categories`
**Effort:** 1-2 days
**Description:** Organize achievements by category
**Tasks:**
- [ ] Define categories (Games, Social, Economy, Collector, etc.)
- [ ] Update achievement showcase UI with tabs
- [ ] Add category completion percentage
- [ ] Create category-specific rewards
- [ ] Add achievement search/filter

#### [ ] 30. Streak Bonuses
**Branch:** `feature/streak-bonuses`
**Effort:** 2 days
**Description:** Escalating rewards for daily login streaks
**Tasks:**
- [ ] Create streak tracking system
- [ ] Define streak milestones (7, 14, 30, 60, 90 days)
- [ ] Add streak UI to daily rewards
- [ ] Create streak protection (miss 1 day grace)
- [ ] Add streak leaderboard
- [ ] Create exclusive streak rewards

---

### P3 - Low Priority / Technical

#### [ ] 11. E2E Testing with Playwright
**Branch:** `test/e2e-playwright`
**Effort:** 1 week
**Description:** Full end-to-end test suite
**Tasks:**
- [ ] Set up Playwright
- [ ] Test user registration flow
- [ ] Test game play and score submission
- [ ] Test wallet connection
- [ ] Test marketplace interactions

#### [ ] 12. Internationalization (i18n)
**Branch:** `feature/i18n`
**Effort:** 1 week
**Description:** Add multi-language support
**Tasks:**
- [ ] Set up next-intl or similar
- [ ] Extract all strings to translation files
- [ ] Add language switcher
- [ ] Add Spanish, Chinese, Korean translations

#### [ ] 13. PWA Enhancements
**Branch:** `feature/pwa-enhancements`
**Effort:** 2-3 days
**Description:** Improve Progressive Web App functionality
**Tasks:**
- [ ] Improve offline support
- [ ] Add install prompts
- [ ] Optimize service worker
- [ ] Add background sync for scores

#### [ ] 14. Admin Dashboard
**Branch:** `feature/admin-dashboard`
**Effort:** 1 week
**Description:** Create admin panel for management
**Tasks:**
- [ ] Create admin routes with authentication
- [ ] User management interface
- [ ] Game statistics dashboard
- [ ] Moderation tools
- [ ] System health monitoring

#### [ ] 15. Rate Limiting Improvements
**Branch:** `feature/rate-limiting`
**Effort:** 1-2 days
**Description:** Improve API rate limiting
**Tasks:**
- [ ] Implement Redis-based rate limiting
- [ ] Add per-endpoint limits
- [ ] Add rate limit headers
- [ ] Create rate limit bypass for authenticated users

---

## Completed Items

### December 27, 2024

- [x] **Migrate to Vercel** - Moved from GKE to Vercel free tier
  - Commit: `58075192`
  - Savings: ~$20-50/month

- [x] **Fix wallet null check bug** - Fixed client-side crash
  - Commit: `977f04c5`
  - Files: LiveActivityTicker.tsx, ReferralList.tsx, activity/route.ts

- [x] **GCP Resource Cleanup** - Deleted all billable resources
  - Cluster, disks, IPs, Container Registry, Cloud Build bucket

- [x] **Update checkpoint** - Updated STATUS.md to v1.1.0
  - Commit: `74238164`

---

## How to Pick Up a Task

1. Check this backlog for available tasks
2. Comment on the task or assign yourself
3. Create the branch using the naming convention
4. Work on the task with regular commits
5. Create a PR when ready for review
6. Update this backlog when complete

---

## Notes

- Always run `npm run build` before creating a PR
- Run `npm run lint` and fix any errors
- Update tests when modifying functionality
- Keep PRs focused and atomic (one feature per PR)
- Reference this backlog item in PR description

---

*Backlog maintained by the GrepCoin team*
*Contact: hello@greplabs.io*
