# Wave 5 - Parallel Improvements Plan

## Priority Matrix

### P0 - Critical Gaps (Must Fix)
1. **Anti-cheat Integration** - Validators exist but not called in game submission
2. **Achievement NFT Minting** - Contract exists, no frontend integration
3. **Battle Pass Rewards** - Structure exists, distribution not wired

### P1 - Important Features
4. **Notification System** - Toast notifications for achievements, rewards, events
5. **Settings Page** - User preferences, display name, avatar
6. **Game Stats Dashboard** - Detailed per-game analytics

### P2 - Polish & UX
7. **Loading States** - Skeleton loaders throughout app
8. **Error Boundaries** - Graceful error handling
9. **Mobile Optimization** - Responsive game controls

---

## Wave 5 Streams (6 Parallel PRs)

### Stream A: Anti-Cheat Integration
**Branch:** `feature/anticheat-integration`
**Files:**
- `apps/web/src/app/api/games/[slug]/submit/route.ts` - Add validation
- `apps/web/src/lib/anticheat.ts` - Client-side helper

**Changes:**
```typescript
// In submit route, add:
import { validateScore, validateTiming, calculateConfidence } from '@grepcoin/anti-cheat'

const validation = {
  score: validateScore(score, gameSlug, duration),
  timing: validateTiming(duration, gameSlug),
  confidence: calculateConfidence(score, duration, gameSlug)
}

if (validation.confidence < 0.5) {
  return NextResponse.json({ error: 'Suspicious activity detected' }, { status: 400 })
}
```

---

### Stream B: Achievement NFT Minting
**Branch:** `feature/achievement-nft`
**Files:**
- `apps/web/src/app/api/achievements/mint/route.ts` - Mint endpoint
- `apps/web/src/hooks/useAchievementMint.ts` - Client hook
- `apps/web/src/components/MintAchievementButton.tsx` - UI

**Changes:**
- Add API route that calls GrepAchievements contract
- Create hook with wagmi for transaction handling
- Button component for profile page

---

### Stream C: Battle Pass Rewards
**Branch:** `feature/battlepass-rewards`
**Files:**
- `apps/web/src/app/api/battle-pass/claim/route.ts` - Fix claim logic
- `apps/web/src/components/BattlePassReward.tsx` - Reward display
- `apps/web/src/app/battle-pass/page.tsx` - Battle pass page

**Changes:**
- Implement actual reward distribution (GREP tokens)
- Create visual reward cards
- Add claim animations

---

### Stream D: Notification System
**Branch:** `feature/notifications`
**Files:**
- `apps/web/src/components/NotificationProvider.tsx` - Context provider
- `apps/web/src/components/NotificationToast.tsx` - Toast component
- `apps/web/src/hooks/useNotifications.ts` - Notification hook
- `apps/web/src/app/layout.tsx` - Add provider

**Changes:**
- Global notification context
- Different toast types (success, error, achievement, reward)
- Auto-dismiss with progress bar
- Sound effects option

---

### Stream E: Settings Page
**Branch:** `feature/settings`
**Files:**
- `apps/web/src/app/settings/page.tsx` - Settings page
- `apps/web/src/app/api/users/settings/route.ts` - Settings API
- `apps/web/prisma/schema.prisma` - Add UserSettings model

**Changes:**
- Display name customization
- Avatar selection/upload
- Sound preferences
- Notification preferences
- Theme preference (dark/light)

---

### Stream F: Game Stats Dashboard
**Branch:** `feature/game-stats`
**Files:**
- `apps/web/src/app/stats/page.tsx` - Stats dashboard
- `apps/web/src/app/api/stats/detailed/route.ts` - Detailed stats API
- `apps/web/src/components/StatsChart.tsx` - Chart component

**Changes:**
- Per-game performance charts
- Score history over time
- Comparison with global averages
- Personal records and milestones

---

## Execution Plan

```
Wave 5 Timeline:
├── Stream A: Anti-cheat Integration     → PR #16
├── Stream B: Achievement NFT Minting    → PR #17
├── Stream C: Battle Pass Rewards        → PR #18
├── Stream D: Notification System        → PR #19
├── Stream E: Settings Page              → PR #20
└── Stream F: Game Stats Dashboard       → PR #21
```

## Dependencies

- Stream B (NFT) needs deployed contracts → Use mock for testnet
- Stream C (Rewards) needs Stream D (Notifications) for feedback
- All streams can run in parallel otherwise

## Success Criteria

- [ ] All 6 PRs merged to main
- [ ] CI passing on all PRs
- [ ] No breaking changes to existing functionality
- [ ] Each feature independently testable
