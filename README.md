<div align="center">

```
   ██████╗ ██████╗ ███████╗██████╗  ██████╗ ██████╗ ██╗███╗   ██╗
  ██╔════╝ ██╔══██╗██╔════╝██╔══██╗██╔════╝██╔═══██╗██║████╗  ██║
  ██║  ███╗██████╔╝█████╗  ██████╔╝██║     ██║   ██║██║██╔██╗ ██║
  ██║   ██║██╔══██╗██╔══╝  ██╔═══╝ ██║     ██║   ██║██║██║╚██╗██║
  ╚██████╔╝██║  ██║███████╗██║     ╚██████╗╚██████╔╝██║██║ ╚████║
   ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝      ╚═════╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝
```

### The AI-Built Crypto Arcade

**Play games. Earn GREP. Own your rewards.**

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Built on Base](https://img.shields.io/badge/Built%20on-Base-0052FF.svg)](https://base.org)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636.svg)](https://soliditylang.org)
[![AI Powered](https://img.shields.io/badge/AI-Claude-ff6b35.svg)](https://anthropic.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Website](https://grepcoin.io) • [Play Games](https://grepcoin.io/games) • [Documentation](https://docs.grepcoin.io) • [Discord](https://discord.gg/grepcoin) • [Twitter](https://twitter.com/grepcoin)

</div>

---

## What is GrepCoin?

GrepCoin is an **open-source, decentralized arcade gaming platform** where players earn GREP tokens by playing developer-themed games. Built entirely through human-AI collaboration, it's a crypto arcade built by the community, for the community.

```
┌─────────────────────────────────────────────────────────────────┐
│                      THE GREPCOIN ECOSYSTEM                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   🎮 ARCADE         💰 ECONOMY          🤝 COMMUNITY            │
│   ─────────         ────────           ─────────                │
│   9 Games           GREP Token         Guilds                   │
│   Daily Challenges  5-Tier Staking     Tournaments              │
│   Leaderboards      NFT Items          Battle Pass              │
│   Achievements      Marketplace        Quests                   │
│                     Governance         AI Discord Bot           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### The Story

**Built entirely with AI collaboration.** GrepCoin was developed through an intensive partnership between a solo founder and Claude (Anthropic's AI). Every line of code—from Solidity smart contracts to React components—was crafted through this human-AI collaboration.

What would traditionally require a team and months to build was accomplished in days:

| Built | Count |
|-------|-------|
| Arcade Games | 9 |
| API Endpoints | 91 |
| React Components | 112 |
| Custom Hooks | 47 |
| Smart Contracts | 7 |
| Contract Tests | 64 |
| PRs Merged | 51 |

---

## Games

Developer-themed arcade games with real token rewards:

| Game | Theme | Mechanic |
|------|-------|----------|
| **Grep Rails** | Regex patterns | Match strings to switch tracks |
| **Stack Panic** | Call stacks | Return functions in LIFO order |
| **Merge Miners** | Git branches | Resolve merge conflicts |
| **Quantum Grep** | Quantum computing | Pattern match before collapse |
| **Bug Hunter** | Debugging | Find bugs in code |
| **Crypto Snake** | Blockchain | Classic snake with a twist |
| **Syntax Sprint** | Code building | Catch falling tokens |
| **RegEx Crossword** | Regex puzzles | Solve pattern clues |
| **Mini-Games** | Quick plays | Coin flip, dice, etc. |

---

## Architecture

```
grepcoin/
├── apps/
│   ├── web/                 # Next.js 15 web application
│   │   ├── src/app/api/    # 91 API routes
│   │   ├── src/components/ # 112 React components
│   │   ├── src/hooks/      # 47 custom hooks
│   │   └── prisma/         # PostgreSQL schema
│   │
│   └── discord-bot/         # AI-powered Discord bot
│       └── src/            # Slash commands & live updates
│
├── packages/
│   ├── contracts/           # 7 Solidity smart contracts
│   │   ├── GrepToken.sol       # ERC-20 (1B supply)
│   │   ├── GrepStakingPool.sol # 5-tier staking
│   │   ├── GrepItems.sol       # ERC-1155 game items
│   │   ├── GrepAchievements.sol# Soulbound badges
│   │   ├── GrepVesting.sol     # Token vesting
│   │   ├── GrepGovernance.sol  # DAO voting
│   │   └── GrepBurner.sol      # Deflationary burns
│   │
│   ├── agents/              # AI agent system
│   │   ├── community/      # Discord community AI
│   │   ├── social/         # Twitter/X automation
│   │   └── guardian/       # Contract monitoring
│   │
│   ├── anti-cheat/          # Score validation system
│   ├── subgraph/            # The Graph indexer
│   └── game-evolution/      # AI game content generator
│
└── docs/                    # Documentation & legal
```

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 15, React 18, TypeScript, Tailwind CSS |
| **Blockchain** | Base L2, Solidity 0.8.24, Hardhat, OpenZeppelin |
| **Web3** | wagmi v3, viem v2, SIWE, WalletConnect |
| **Database** | PostgreSQL, Prisma ORM |
| **AI** | Claude API, Ollama, OpenAI |
| **Indexing** | The Graph Subgraph |
| **Email** | Resend |

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (we recommend [NeonDB](https://neon.tech))
- Wallet (MetaMask, Coinbase Wallet, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/grepcoin/grepcoin.git
cd grepcoin

# Install dependencies
npm install

# Start the web app
npm run dev

# Run contract tests
npm run test:contracts
```

### Environment Setup

```bash
cd apps/web
cp .env.example .env
```

**Required variables:**
```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

**Blockchain (optional):**
```env
NEXT_PUBLIC_ALCHEMY_API_KEY=...
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=...
NEXT_PUBLIC_CHAIN_ID=8453
```

### Database Setup

```bash
npm run db:push    # Push schema
npm run db:seed    # Seed data
npm run db:studio  # Open Prisma Studio
```

Visit `http://localhost:3000` to see the app.

---

## Staking

Stake GREP tokens for rewards and multipliers:

| Tier | Minimum | Lock | APY | Multiplier |
|------|---------|------|-----|------------|
| Flexible | 100 GREP | None | 5% | 1.1x |
| Bronze | 1,000 GREP | 7 days | 8% | 1.25x |
| Silver | 5,000 GREP | 14 days | 12% | 1.5x |
| Gold | 10,000 GREP | 30 days | 15% | 1.75x |
| Diamond | 50,000 GREP | 90 days | 20% | 2.0x |

---

## Tokenomics

| Property | Value |
|----------|-------|
| Token Name | GrepCoin |
| Symbol | GREP |
| Total Supply | 500,000,000 |
| Network | Base L2 |

**Distribution:**
- 40% Community & Ecosystem
- 20% Development Fund
- 15% Team & Founders (4-year vest)
- 10% Liquidity Pool
- 10% Early Supporters
- 5% Advisors

See [TOKENOMICS.md](TOKENOMICS.md) for details.

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Fork the repository
# Create a feature branch
git checkout -b feature/my-feature

# Make your changes
# Run tests
npm run build

# Submit a PR
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [WHITEPAPER.md](docs/WHITEPAPER.md) | Vision, tokenomics, roadmap |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technical architecture |
| [API.md](docs/API.md) | API reference |
| [ROADMAP.md](docs/ROADMAP.md) | Development milestones |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guide |
| [SECURITY.md](SECURITY.md) | Security policy |

---

## Security

Found a vulnerability? Please see [SECURITY.md](SECURITY.md) for responsible disclosure.

**Security features:**
- OpenZeppelin battle-tested contracts
- ReentrancyGuard on all external calls
- Multi-sig for admin functions
- Anti-cheat game validation
- Rate limiting & input validation

---

## Links

- **Website:** [grepcoin.io](https://grepcoin.io)
- **Games:** [grepcoin.io/games](https://grepcoin.io/games)
- **GitHub:** [github.com/grepcoin](https://github.com/grepcoin/grepcoin)
- **Twitter:** [@grepcoin](https://twitter.com/grepcoin)
- **Discord:** [discord.gg/grepcoin](https://discord.gg/grepcoin)
- **Docs:** [docs.grepcoin.io](https://docs.grepcoin.io)

---

## License

[MIT License](LICENSE) - see LICENSE file for details.

---

<div align="center">

**Built with AI by [GrepLabs LLC](https://greplabs.io)** • **Powered by [Claude](https://anthropic.com)**

*Open source. Community owned. AI-crafted.*

</div>
