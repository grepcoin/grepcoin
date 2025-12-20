# GrepCoin

**The Crypto Arcade for Indie Game Lovers**

GrepCoin is an open-source, decentralized arcade gaming platform where players can earn GREP tokens by playing developer-themed games. Built on Base L2 by GrepLabs LLC.

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Built on Base](https://img.shields.io/badge/Built%20on-Base-blue.svg)](https://base.org)
[![AI Powered](https://img.shields.io/badge/AI%20Powered-Claude-orange.svg)](https://anthropic.com)

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

- **8 Arcade Games** - Developer-themed games including Grep Rails, Stack Panic, Merge Miners, Quantum Grep, Bug Hunter, Crypto Snake, Syntax Sprint, and RegEx Crossword
- **Earn GREP Tokens** - Real crypto rewards for gameplay performance
- **Staking System** - 5-tier staking with multiplied rewards (Flexible, Bronze, Silver, Gold, Diamond)
- **Daily Challenges** - Fresh challenges every day with bonus rewards
- **Leaderboards** - Compete for top spots and bragging rights
- **Sign-In with Ethereum** - Secure wallet-based authentication

## Tech Stack

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
- **Blockchain:** Base L2, Solidity, Hardhat
- **Web3:** wagmi, viem, SIWE (Sign-In with Ethereum)
- **Database:** PostgreSQL (Prisma ORM)
- **Authentication:** SIWE with session cookies

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
# Edit .env with your database URL

# Database setup
npm run db:push
npm run db:seed

# Start dev server
npm run dev
```

Visit `http://localhost:3000` to see the app.

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

## Project Structure

```
grepcoin/                        # Monorepo root
├── apps/
│   ├── web/                     # Next.js web application
│   │   ├── src/app/            # App router pages
│   │   ├── src/components/     # React components
│   │   ├── src/hooks/          # Custom hooks
│   │   └── prisma/             # Database schema
│   └── discord-bot/            # AI-powered Discord bot
│       └── src/                # Bot source code
├── packages/
│   ├── contracts/              # Solidity smart contracts
│   │   ├── contracts/          # GrepToken, GrepStakingPool
│   │   ├── test/               # 47 passing tests
│   │   └── scripts/            # Deployment scripts
│   └── agents/                 # AI Agent System
│       ├── src/agents/         # CommunityAgent, SocialAgent, etc.
│       ├── src/providers/      # Ollama, OpenAI providers
│       └── src/core/           # Base agent framework
├── marketing/                  # Campaign materials
│   ├── INDIEGOGO_CAMPAIGN.md
│   ├── PITCH_DECK.md
│   ├── PRESS_KIT.md
│   └── SOCIAL_MEDIA.md
├── FUNDRAISING.md             # Fundraising strategy
├── LICENSE                    # MIT License
├── CONTRIBUTING.md            # Contribution guidelines
└── SECURITY.md               # Security policy
```

## Development Documentation

For Claude agents and developers working on GrepCoin:

| Document | Purpose |
|----------|---------|
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

| Contract | Description |
|----------|-------------|
| `GrepToken.sol` | ERC-20 token with minting caps for staking, gameplay, and airdrops |
| `GrepStakingPool.sol` | 5-tier staking system with lock periods and reward multipliers |

### Staking Tiers

| Tier | Minimum | Lock Period | Multiplier | Bonus Plays |
|------|---------|-------------|------------|-------------|
| Flexible | 100 GREP | None | 1.1x | +2 |
| Bronze | 1,000 GREP | 7 days | 1.25x | +5 |
| Silver | 5,000 GREP | 14 days | 1.5x | +10 |
| Gold | 10,000 GREP | 30 days | 1.75x | +15 |
| Diamond | 50,000 GREP | 90 days | 2.0x | +25 |

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
