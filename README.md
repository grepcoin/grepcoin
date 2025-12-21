# GrepCoin

**The Crypto Arcade for Indie Game Lovers**

GrepCoin is an open-source, decentralized arcade gaming platform where players can earn GREP tokens by playing developer-themed games. Built on Base L2 by GrepLabs LLC.

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Built on Base](https://img.shields.io/badge/Built%20on-Base-blue.svg)](https://base.org)
[![AI Powered](https://img.shields.io/badge/AI%20Powered-Claude-orange.svg)](https://anthropic.com)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/grepcoin/grepcoin)
[![Contract Tests](https://img.shields.io/badge/contract%20tests-64%20passing-success.svg)](./packages/contracts/test)
[![Build Status](https://img.shields.io/badge/build-passing-success.svg)](./docs/STATUS.md)
[![Status](https://img.shields.io/badge/status-alpha-yellow.svg)](./docs/STATUS.md)
[![Production Ready](https://img.shields.io/badge/production%20ready-65%25-orange.svg)](./docs/STATUS.md)

## The Story

GrepCoin isn't just another crypto project - it's a testament to what's possible when human creativity meets AI capability.

**Built entirely with AI collaboration**, GrepCoin was developed through an intensive partnership between a solo founder and Claude (Anthropic's AI). Every line of code - from the Solidity smart contracts to the React components to the Prisma database schema - was crafted through this human-AI collaboration.

What would traditionally take a team of developers months to build was accomplished in days:

- **8 fully playable arcade games** with unique mechanics and developer-themed narratives
- **Production-grade smart contracts** with 47 passing tests covering staking, rewards, and tokenomics
- **Complete web application** with authentication, leaderboards, achievements, and daily challenges
- **Legal framework** with Terms of Service, Privacy Policy, and risk disclaimers
- **Open-source infrastructure** ready for community contribution

This project proves that the future of software development isn't about replacing developers - it's about amplifying what a single person with a vision can accomplish. GrepCoin was built not by a well-funded startup with a large team, but by one developer who said "let's build something real" and an AI that helped make it happen.

**GrepCoin is for the indie devs, the hobbyists, the dreamers who code after hours.** It's a crypto arcade built by the community, for the community - and it started as a conversation with an AI.

## Features

### Core Gameplay
- **8 Arcade Games** - Developer-themed games including Grep Rails, Stack Panic, Merge Miners, Quantum Grep, Bug Hunter, Crypto Snake, Syntax Sprint, and RegEx Crossword
- **Play-to-Earn** - Real GREP token rewards for gameplay performance
- **Daily Challenges** - Fresh challenges every day with bonus rewards
- **Leaderboards** - Global and per-game competition

### Web3 Features
- **Staking System** - 5-tier staking with 5%-20% APY and reward multipliers
- **NFT Achievements** - Soulbound ERC-1155 badges for milestones
- **NFT Items** - Tradeable in-game items and cosmetics
- **Governance** - Token-weighted voting on platform decisions
- **Sign-In with Ethereum** - Secure wallet-based authentication

### Social Features
- **Guilds** - Team up with other players
- **Tournaments** - Compete in scheduled events
- **Seasons & Battle Pass** - Unlock exclusive rewards
- **Live Activity Feed** - Real-time player updates
- **Quests** - Complete objectives for rewards

### Marketplace
- **Item Trading** - Buy and sell NFT items
- **Auctions** - Bid on rare items
- **GREP Economy** - All transactions use GREP tokens

## Tech Stack

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
- **Blockchain:** Base L2, Solidity ^0.8.24, Hardhat
- **Web3:** wagmi v3, viem v2, SIWE (Sign-In with Ethereum)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** SIWE with session cookies
- **Real-time:** Socket.io for live updates
- **AI Agents:** Ollama/OpenAI integration
- **NFTs:** ERC-1155 for achievements and items
- **Email:** Resend for notifications

## Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- PostgreSQL database
- Ollama (for AI agents, optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/grepcoin/grepcoin.git
cd grepcoin

# Install all dependencies
npm install

# Start the web app
npm run dev

# Or run specific workspaces
npm run dev --workspace=apps/web
npm run test:contracts
npm run bot:dev
```

### Web App

```bash
cd apps/web

# Set up environment
cp .env.example .env
# Edit .env with your database URL and other required variables

# Database setup
npm run db:push
npm run db:seed

# Start dev server
npm run dev
```

Visit `http://localhost:3000` to see the app.

### Environment Variables

The web app requires the following environment variables:

**Database (Required):**
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct database connection (for migrations)

**Authentication (Required):**
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for dev)

**Blockchain (Optional):**
- `NEXT_PUBLIC_ALCHEMY_API_KEY` - Alchemy API key for Base network
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - WalletConnect project ID
- `NEXT_PUBLIC_CHAIN_ID` - Chain ID (8453 for Base mainnet)
- `NEXT_PUBLIC_GREP_TOKEN_ADDRESS` - Deployed GrepToken contract address
- `NEXT_PUBLIC_STAKING_POOL_ADDRESS` - Deployed staking contract address

**Services (Optional):**
- `RESEND_API_KEY` - Resend email API key
- `INTERNAL_API_KEY` - Server-to-server authentication key

See `.env.example` files for complete configuration.

### Smart Contracts

```bash
cd packages/contracts

npm install
npm test                    # Run 47 tests
npm run deploy:sepolia      # Deploy to Base Sepolia
```

### AI Agents

```bash
cd packages/agents

# Run interactively with Ollama
npm run agent:community -- --interactive
npm run agent:social -- --interactive
npm run agent:guardian -- --interactive
npm run agent:analytics -- --interactive
```

### Discord Bot

```bash
cd apps/discord-bot

cp .env.example .env
# Add your Discord bot token

npm run dev
```

## Architecture Overview

GrepCoin uses a modern monorepo architecture with clear separation of concerns:

```
grepcoin/                        # Turborepo monorepo
├── apps/
│   ├── web/                     # Next.js 15 web application
│   │   ├── src/
│   │   │   ├── app/            # App router pages & API routes
│   │   │   │   ├── api/        # REST API endpoints
│   │   │   │   ├── games/      # Game pages
│   │   │   │   └── ...         # Other pages
│   │   │   ├── components/     # React components
│   │   │   ├── context/        # Auth & staking contexts
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   └── lib/            # Utilities & config
│   │   └── prisma/             # Database schema & migrations
│   └── discord-bot/            # Discord community bot
│       └── src/                # Bot commands & event handlers
├── packages/
│   ├── contracts/              # Solidity smart contracts
│   │   ├── contracts/          # 7 production contracts
│   │   │   ├── GrepToken.sol
│   │   │   ├── GrepStakingPool.sol
│   │   │   ├── GrepItems.sol
│   │   │   ├── GrepAchievements.sol
│   │   │   ├── GrepVesting.sol
│   │   │   ├── GrepGovernance.sol
│   │   │   └── GrepBurner.sol
│   │   ├── test/               # Comprehensive test suite
│   │   └── scripts/            # Deployment & verification
│   ├── agents/                 # AI Agent system
│   │   ├── src/agents/         # Specialized agents
│   │   ├── src/providers/      # LLM providers
│   │   └── src/core/           # Agent framework
│   ├── anti-cheat/             # Game anti-cheat system
│   └── subgraph/               # The Graph indexer
├── docs/                       # Documentation
│   └── WHITEPAPER.md          # Tokenomics & vision
├── marketing/                  # Marketing materials
├── .github/                    # CI/CD workflows
│   └── workflows/
│       ├── contracts.yml       # Smart contract testing
│       ├── web.yml            # Web app testing
│       └── discord.yml        # Discord bot deployment
└── [Development docs]         # CONTEXT.md, AGENTS-GUIDE.md, etc.
```

### Data Flow

1. **User Authentication**: SIWE → NextAuth → Session cookies
2. **Game Scores**: Client → API route → Anti-cheat validation → Database
3. **Blockchain**: wagmi hooks → viem → Base L2 RPC → Smart contracts
4. **Rewards**: Score submission → Multiplier calculation → Token minting
5. **Real-time**: Socket.io → Live activity feed & notifications

## Development Documentation

For Claude agents and developers working on GrepCoin:

| Document | Purpose |
|----------|---------|
| [STATUS.md](./docs/STATUS.md) | Current project state, build status, production readiness |
| [PLANS-OVERVIEW.md](./PLANS-OVERVIEW.md) | Overview of 4 parallel development streams |
| [CONTEXT.md](./CONTEXT.md) | Full codebase structure, patterns, conventions |
| [AGENTS-GUIDE.md](./AGENTS-GUIDE.md) | Development instructions and code style |
| [KEY-FILES.md](./KEY-FILES.md) | Reference of important files by stream |
| [CHANGELOG.md](./CHANGELOG.md) | Track all changes and decisions |
| [THINKING.md](./THINKING.md) | Architectural reasoning and decisions |

### Parallel Development Streams

| Stream | Focus | Plan |
|--------|-------|------|
| Stream 1 | AI Agents | [PLAN-STREAM1-AI-AGENTS.md](./PLAN-STREAM1-AI-AGENTS.md) |
| Stream 2 | Game Backend | [PLAN-STREAM2-GAME-BACKEND.md](./PLAN-STREAM2-GAME-BACKEND.md) |
| Stream 3 | Crypto/Blockchain | [PLAN-STREAM3-CRYPTO.md](./PLAN-STREAM3-CRYPTO.md) |
| Stream 4 | Social Features | [PLAN-STREAM4-SOCIAL.md](./PLAN-STREAM4-SOCIAL.md) |

## Smart Contracts

GrepCoin's smart contract ecosystem is built with Solidity ^0.8.24 and OpenZeppelin libraries.

| Contract | Type | Description |
|----------|------|-------------|
| `GrepToken.sol` | ERC-20 | Main token with 1B supply, categorized minting caps, burnable, pausable |
| `GrepStakingPool.sol` | DeFi | 5-tier staking system with APY rewards (5%-20%), lock periods, multipliers |
| `GrepItems.sol` | ERC-1155 | NFT game items with rarity system, tradability controls |
| `GrepAchievements.sol` | ERC-1155 | Soulbound achievement badges with signature-based claiming |
| `GrepVesting.sol` | Finance | Token vesting with cliff periods for team/advisors |
| `GrepGovernance.sol` | DAO | Proposal voting system with quorum requirements |
| `GrepBurner.sol` | Utility | Deflationary burn mechanism with tier-based benefits |

### Deployed Contract Addresses

**Base Sepolia Testnet:**
- GrepToken: `TBD`
- GrepStakingPool: `TBD`
- GrepItems: `TBD`
- GrepAchievements: `TBD`
- GrepVesting: `TBD`
- GrepGovernance: `TBD`
- GrepBurner: `TBD`

**Base Mainnet:**
- Coming soon after audit

### Staking Tiers

| Tier | Minimum | Lock Period | APY | Multiplier | Bonus Plays |
|------|---------|-------------|-----|------------|-------------|
| Flexible | 100 GREP | None | 5% | 1.1x | +2 |
| Bronze | 1,000 GREP | 7 days | 8% | 1.25x | +5 |
| Silver | 5,000 GREP | 14 days | 12% | 1.5x | +10 |
| Gold | 10,000 GREP | 30 days | 15% | 1.75x | +15 |
| Diamond | 50,000 GREP | 90 days | 20% | 2.0x | +25 |

Staking rewards are minted from the 300M GREP staking rewards allocation.

## Games

1. **Grep Rails** - Build train tracks by matching regex patterns
2. **Stack Panic** - Return functions in LIFO order before they overflow
3. **Merge Miners** - Navigate Git branches and resolve merge conflicts
4. **Quantum Grep** - Observe quantum particles and collapse them into patterns
5. **Bug Hunter** - Find and squash bugs in scrolling code
6. **Crypto Snake** - Classic snake with blockchain vibes
7. **Syntax Sprint** - Tetris meets JavaScript - build valid code from falling tokens
8. **RegEx Crossword** - Solve crossword puzzles with regex clues

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`pnpm test` / `npx hardhat test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Security

Found a security vulnerability? Please see our [Security Policy](SECURITY.md) for responsible disclosure guidelines.

## Legal

- [Terms of Service](https://grepcoin.io/terms)
- [Privacy Policy](https://grepcoin.io/privacy)
- [Risk Disclaimer](https://grepcoin.io/disclaimer)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- **Website:** [grepcoin.io](https://grepcoin.io)
- **GitHub:** [github.com/grepcoin](https://github.com/grepcoin)
- **Twitter:** [@grepcoin](https://twitter.com/grepcoin)
- **Discord:** [discord.gg/grepcoin](https://discord.gg/grepcoin)

---

**Built with love by [GrepLabs LLC](https://greplabs.io)** | **Powered by [Claude](https://anthropic.com)**

*Registered in Delaware, USA | Built in California, USA | Crafted with AI*
