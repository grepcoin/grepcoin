# GrepCoin

**The Crypto Arcade for Indie Game Lovers**

GrepCoin is an open-source, decentralized arcade gaming platform where players can earn GREP tokens by playing developer-themed games. Built on Base L2 by GrepLabs LLC.

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Built on Base](https://img.shields.io/badge/Built%20on-Base-blue.svg)](https://base.org)
[![AI Powered](https://img.shields.io/badge/AI%20Powered-Claude-orange.svg)](https://anthropic.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636.svg)](https://soliditylang.org)

| Metric | Count |
|--------|-------|
| API Endpoints | 91 |
| React Hooks | 47 |
| React Components | 112 |
| Smart Contracts | 7 |
| Contract Tests | 64 |
| Arcade Games | 9 |
| PRs Merged | 51 |

## The Story

GrepCoin isn't just another crypto project - it's a testament to what's possible when human creativity meets AI capability.

**Built entirely with AI collaboration**, GrepCoin was developed through an intensive partnership between a solo founder and Claude (Anthropic's AI). Every line of code - from the Solidity smart contracts to the React components to the Prisma database schema - was crafted through this human-AI collaboration.

What would traditionally take a team of developers months to build was accomplished in days:

- **9 fully playable arcade games** with unique mechanics and developer-themed narratives
- **Production-grade smart contracts** with 64 passing tests covering staking, rewards, NFTs, and governance
- **Complete web application** with 91 API endpoints, 47 hooks, and 112 components
- **Full social platform** with guilds, tournaments, battle pass, and multiplayer
- **AI-powered agents** for code review, security auditing, and community management
- **Legal framework** with Terms of Service, Privacy Policy, and risk disclaimers

**GrepCoin is for the indie devs, the hobbyists, the dreamers who code after hours.** It's a crypto arcade built by the community, for the community.

## Features

### Core Gameplay
- **9 Arcade Games** - Developer-themed games including Grep Rails, Stack Panic, Merge Miners, Quantum Grep, Bug Hunter, Crypto Snake, Syntax Sprint, RegEx Crossword, and Quick Mini-Games
- **Play-to-Earn** - Real GREP token rewards for gameplay performance
- **Daily Challenges** - Fresh challenges every day with bonus rewards
- **Global Leaderboards** - Compete globally and per-game with ranking rewards
- **Anti-Cheat System** - Score validation, timing checks, and rate limiting

### Web3 Features
- **Staking System** - 5-tier staking with 5%-20% APY and reward multipliers
- **NFT Achievements** - Soulbound ERC-1155 badges for milestones (EIP-712 claims)
- **NFT Items** - Tradeable in-game items with rarity tiers
- **Marketplace** - Buy and sell NFT items with 5% platform fee
- **Auction House** - Bid on rare items with anti-sniping protection
- **Governance** - Token-weighted voting on platform decisions
- **Token Burning** - Deflationary mechanics with burn tiers
- **Sign-In with Ethereum** - Secure wallet-based authentication

### Social Features
- **Guilds/Clans** - Team up with other players, guild perks and leveling
- **Tournaments** - Scheduled competitive events with prize pools
- **Seasons & Battle Pass** - Unlock exclusive rewards through progression
- **Friends System** - Add friends, see their activity, play together
- **Live Activity Feed** - Real-time player updates and notifications
- **Quests** - Daily and weekly objectives for bonus rewards
- **User Levels** - XP system with 7 tiers from Newcomer to Legend
- **Referral Program** - Tiered rewards for bringing new players
- **Chat System** - Real-time messaging with other players

### Platform Features
- **Push Notifications** - Web Push API for game events
- **Email Notifications** - Resend integration with 6 templates
- **PWA Support** - Install as app on mobile/desktop
- **Internationalization** - 5 languages (EN, ES, ZH, JA, KO)
- **Dark/Light Theme** - System-aware theming
- **Keyboard Shortcuts** - Power user navigation (Cmd+K search)
- **Game Replays** - Record and playback game sessions
- **Data Export** - GDPR-compliant data export
- **Webhooks** - Integration endpoints for developers

### AI Features
- **Claude-Powered Code Review** - Automated PR analysis
- **Security Guardian** - Continuous vulnerability scanning
- **Debug Helper** - AI-assisted bug investigation
- **Discord AI Commands** - /analyze, /explain, /debug, /optimize

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 15, React 18, TypeScript, Tailwind CSS |
| **Blockchain** | Base L2, Solidity 0.8.24, Hardhat, OpenZeppelin |
| **Web3** | wagmi v3, viem v2, SIWE, WalletConnect |
| **Database** | PostgreSQL, Prisma ORM |
| **Auth** | Sign-In with Ethereum, Session Cookies |
| **Real-time** | Socket.io, Web Push API |
| **AI** | Claude API, Ollama, OpenAI |
| **Email** | Resend |
| **Indexing** | The Graph Subgraph |

## Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- PostgreSQL database
- Wallet (MetaMask, Coinbase Wallet, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/grepcoin/grepcoin.git
cd grepcoin

# Install all dependencies
npm install

# Start the web app
npm run dev

# Run contract tests
npm run test:contracts
```

### Web App Setup

```bash
cd apps/web

# Set up environment
cp .env.example .env
# Edit .env with your database URL and API keys

# Database setup
npm run db:push
npm run db:seed

# Start dev server
npm run dev
```

Visit `http://localhost:3000` to see the app.

### Smart Contract Setup

```bash
cd packages/contracts

# Run tests (64 tests)
npm test

# Deploy to testnet
cp .env.example .env
# Add DEPLOYER_PRIVATE_KEY
npm run deploy:testnet

# Verify on Basescan
npm run verify
```

### Environment Variables

**Required:**
```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

**Blockchain:**
```env
NEXT_PUBLIC_ALCHEMY_API_KEY=...
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=...
NEXT_PUBLIC_CHAIN_ID=8453
DEPLOYER_PRIVATE_KEY=0x...
```

**Services (Optional):**
```env
ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
DISCORD_BOT_TOKEN=...
```

See `.env.example` files for complete configuration.

## Architecture

```
grepcoin/
├── apps/
│   ├── web/                     # Next.js 15 web application
│   │   ├── src/app/            # App router (91 API routes)
│   │   ├── src/components/     # React components (112)
│   │   ├── src/hooks/          # Custom hooks (47)
│   │   └── prisma/             # Database schema
│   └── discord-bot/            # Discord community bot
├── packages/
│   ├── contracts/              # Solidity smart contracts (7)
│   │   ├── contracts/          # GrepToken, Staking, NFTs, Governance
│   │   ├── test/               # 64 tests
│   │   └── scripts/            # Deployment & verification
│   ├── agents/                 # AI Agent system
│   │   ├── src/providers/      # Claude, OpenAI, Ollama
│   │   └── src/github-actions/ # PR reviewer, Security guardian
│   ├── anti-cheat/             # Game validation system
│   └── subgraph/               # The Graph indexer
├── docs/                       # Documentation
└── marketing/                  # Press kit, pitch deck
```

## Smart Contracts

| Contract | Type | Description |
|----------|------|-------------|
| `GrepToken.sol` | ERC-20 | 1B supply, categorized minting, burnable, pausable |
| `GrepStakingPool.sol` | DeFi | 5-tier staking (5-20% APY), lock periods, multipliers |
| `GrepItems.sol` | ERC-1155 | NFT game items with rarity system |
| `GrepAchievements.sol` | ERC-1155 | Soulbound achievements, EIP-712 claims |
| `GrepVesting.sol` | Finance | Token vesting with cliff periods |
| `GrepGovernance.sol` | DAO | Proposal voting, 4% quorum |
| `GrepBurner.sol` | Utility | Deflationary burn mechanism |

### Staking Tiers

| Tier | Minimum | Lock | APY | Multiplier |
|------|---------|------|-----|------------|
| Flexible | 100 GREP | None | 5% | 1.1x |
| Bronze | 1,000 GREP | 7 days | 8% | 1.25x |
| Silver | 5,000 GREP | 14 days | 12% | 1.5x |
| Gold | 10,000 GREP | 30 days | 15% | 1.75x |
| Diamond | 50,000 GREP | 90 days | 20% | 2.0x |

## Games

| Game | Description | Mechanic |
|------|-------------|----------|
| **Grep Rails** | Build train tracks | Match regex patterns |
| **Stack Panic** | Clear the call stack | LIFO ordering |
| **Merge Miners** | Navigate Git branches | Resolve conflicts |
| **Quantum Grep** | Observe quantum particles | Pattern matching |
| **Bug Hunter** | Find bugs in code | Click accuracy |
| **Crypto Snake** | Classic snake game | Blockchain theme |
| **Syntax Sprint** | Build valid code | Falling tokens |
| **RegEx Crossword** | Solve puzzles | Regex clues |
| **Mini-Games** | Quick games | Coin flip, dice, etc. |

## API Documentation

See [docs/API.md](docs/API.md) for complete API reference.

### Key Endpoints

| Category | Endpoints |
|----------|-----------|
| Auth | `/api/auth/nonce`, `/api/auth/verify`, `/api/auth/session` |
| Games | `/api/games`, `/api/games/[slug]/submit` |
| Leaderboards | `/api/leaderboards`, `/api/leaderboards/[game]` |
| Social | `/api/friends`, `/api/guilds`, `/api/tournaments` |
| Economy | `/api/marketplace`, `/api/auctions`, `/api/battle-pass` |
| AI | `/api/ai/chat` |

## Development

### Running Tests

```bash
# Smart contracts (64 tests)
cd packages/contracts && npm test

# Web app build
cd apps/web && npm run build

# Lint
npm run lint
```

### Creating a New Game

1. Create page: `apps/web/src/app/games/[name]/page.tsx`
2. Add to games list: `apps/web/src/app/games/page.tsx`
3. Add to database seed: `apps/web/prisma/seed.ts`
4. Implement anti-cheat: `packages/anti-cheat/src/validators/`
5. Create submit API: `apps/web/src/app/api/games/[name]/submit/route.ts`

### Adding an API Endpoint

1. Create route: `apps/web/src/app/api/[path]/route.ts`
2. Add authentication: `parseSessionToken()`
3. Add rate limiting: `rateLimit()`
4. Create hook: `apps/web/src/hooks/use[Feature].ts`

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md).

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a PR

## Security

Found a vulnerability? Please see [SECURITY.md](SECURITY.md) for responsible disclosure.

## Documentation

| Document | Purpose |
|----------|---------|
| [WHITEPAPER.md](docs/WHITEPAPER.md) | Tokenomics, vision, roadmap |
| [ROADMAP.md](docs/ROADMAP.md) | Development milestones |
| [API.md](docs/API.md) | API reference |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guide |
| [SECURITY.md](SECURITY.md) | Security policy |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Community guidelines |

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE).

## Links

- **Website:** [grepcoin.io](https://grepcoin.io)
- **GitHub:** [github.com/grepcoin](https://github.com/grepcoin)
- **Twitter:** [@grepcoin](https://twitter.com/grepcoin)
- **Discord:** [discord.gg/grepcoin](https://discord.gg/grepcoin)
- **Documentation:** [docs.grepcoin.io](https://docs.grepcoin.io)

---

**Built with love by [GrepLabs LLC](https://greplabs.io)** | **Powered by [Claude](https://anthropic.com)**

*Registered in Delaware, USA | Built in California, USA | Crafted with AI*
