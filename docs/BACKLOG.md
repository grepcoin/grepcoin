# GrepCoin Development Backlog

**Last Updated:** December 27, 2024
**Status:** Active Development

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

### P3 - Low Priority / Future

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
