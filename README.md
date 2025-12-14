# GrepCoin

**The Crypto Arcade for Indie Game Lovers**

GrepCoin is an open-source, decentralized arcade gaming platform where players can earn GREP tokens by playing developer-themed games. Built on Base L2 by GrepLabs LLC.

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Built on Base](https://img.shields.io/badge/Built%20on-Base-blue.svg)](https://base.org)

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
- pnpm (recommended) or npm
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/grepcoin/grepcoin.git
cd grepcoin

# Install dependencies
cd website
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and other config

# Run database migrations
pnpm db:push

# Seed the database
pnpm db:seed

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to see the app.

### Smart Contracts

```bash
# Navigate to contracts directory
cd contracts-dev

# Install dependencies
npm install

# Run tests
npx hardhat test

# Deploy to Base Sepolia (testnet)
npx hardhat run scripts/deploy.js --network baseSepolia
```

## Project Structure

```
grepcoin/
├── website/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/            # Next.js app router pages
│   │   ├── components/     # React components
│   │   ├── context/        # React contexts (Auth, Staking)
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configurations
│   └── prisma/             # Database schema and migrations
├── contracts-dev/          # Solidity smart contracts
│   ├── contracts/          # Smart contract source files
│   ├── scripts/            # Deployment scripts
│   └── test/               # Contract tests
├── LICENSE                 # MIT License
├── CONTRIBUTING.md         # Contribution guidelines
└── SECURITY.md            # Security policy
```

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

**Built with love by [GrepLabs LLC](https://greplabs.io)**

*Registered in Delaware, USA | Built in California, USA*
