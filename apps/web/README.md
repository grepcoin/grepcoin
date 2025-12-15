# GrepCoin Arcade

A play-to-earn cryptocurrency arcade where players earn GREP tokens by playing browser-based games. Built with Next.js, Prisma, and Web3 authentication.

## Features

- **4 Playable Games**: Grep Rails, Stack Panic, Merge Miners, Quantum Grep
- **Play-to-Earn**: Earn GREP tokens based on your performance
- **Web3 Authentication**: Sign in with your Ethereum wallet (SIWE)
- **Staking Multipliers**: Stake GREP to earn up to 2.5x rewards
- **Achievements**: Unlock badges and earn bonus rewards
- **Daily Challenges**: Complete challenges for extra GREP
- **Leaderboards**: Compete globally and per-game
- **Live Activity Feed**: See real-time player activity

## Tech Stack

- **Framework**: Next.js 15.5
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: SIWE (Sign In With Ethereum)
- **Web3**: wagmi + viem
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (we recommend [NeonDB](https://neon.tech))
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/grepcoin.git
cd grepcoin/website

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Environment Setup

Edit `.env` with your configuration:

```env
# Database (Required)
DATABASE_URL="postgresql://username:password@host.neon.tech/grepcoin?sslmode=require"
DIRECT_URL="postgresql://username:password@host.neon.tech/grepcoin?sslmode=require"

# Auth (Required for production)
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Blockchain (Optional - for staking features)
NEXT_PUBLIC_ALCHEMY_API_KEY="your-alchemy-api-key"
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID="your-walletconnect-project-id"
NEXT_PUBLIC_CHAIN_ID="8453"
```

### Database Setup

```bash
# Push schema to database
npm run db:push

# Seed initial data (games, achievements)
npm run db:seed

# (Optional) Open Prisma Studio
npm run db:studio
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
website/
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script for initial data
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   │   ├── auth/     # Authentication (nonce, verify, logout)
│   │   │   ├── games/    # Games CRUD & score submission
│   │   │   ├── leaderboard/
│   │   │   ├── achievements/
│   │   │   ├── challenges/
│   │   │   ├── activity/
│   │   │   └── stats/
│   │   ├── games/        # Game pages
│   │   │   ├── grep-rails/
│   │   │   ├── stack-panic/
│   │   │   ├── merge-miners/
│   │   │   └── quantum-grep/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── WalletButton.tsx
│   │   ├── LiveActivityTicker.tsx
│   │   ├── GamesShowcase.tsx
│   │   ├── DailyChallenge.tsx
│   │   ├── AchievementShowcase.tsx
│   │   └── ...
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── StakingContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useStats.ts
│   │   ├── useLeaderboard.ts
│   │   ├── useAchievements.ts
│   │   ├── useChallenges.ts
│   │   ├── useActivity.ts
│   │   └── useGameScore.ts
│   └── lib/
│       ├── db.ts         # Prisma client
│       ├── auth.ts       # Auth utilities
│       └── wagmi.ts      # Web3 config
└── public/
```

## Games

### Grep Rails
Guide your train through regex patterns. Match strings to switch tracks and collect tokens.
- Rewards: 5-50 GREP per game

### Stack Panic
Functions are stacking up! Return them in the right order before the stack overflows.
- Rewards: 5-50 GREP per game

### Merge Miners
Mine commits and resolve merge conflicts. Stack miners to increase your hash power.
- Rewards: 5-50 GREP per game

### Quantum Grep
Patterns exist in superposition! Match quantum regex before the wave function collapses.
- Rewards: 10-75 GREP per game

## API Endpoints

### Authentication
- `GET /api/auth/nonce` - Get SIWE nonce
- `POST /api/auth/verify` - Verify signature and create session
- `GET /api/auth/session` - Check current session
- `POST /api/auth/logout` - Clear session

### Games
- `GET /api/games` - List all games
- `GET /api/games/:slug` - Game details with leaderboard
- `POST /api/games/:slug/submit` - Submit score (authenticated)

### Data
- `GET /api/leaderboard` - Global leaderboard
- `GET /api/stats` - Platform statistics
- `GET /api/achievements` - All achievements
- `GET /api/achievements/:wallet` - User achievements
- `GET /api/challenges` - Today's challenges
- `POST /api/challenges/complete` - Complete challenge (authenticated)
- `GET /api/activity` - Activity feed
- `GET /api/users/:wallet` - User profile

## Staking Tiers

| Tier | Stake Amount | Lock Period | Multiplier |
|------|-------------|-------------|------------|
| Flexible | Any | None | 1.0x |
| Bronze | 1,000+ GREP | 30 days | 1.1x |
| Silver | 5,000+ GREP | 60 days | 1.25x |
| Gold | 10,000+ GREP | 90 days | 1.5x |
| Diamond | 50,000+ GREP | 180 days | 2.0x |

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Environment Variables for Production

Ensure these are set in your deployment platform:
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## Database Schema

The app uses Prisma with PostgreSQL. Key models:

- **User** - Wallet-based accounts
- **Game** - Game definitions
- **GameScore** - Player scores
- **Achievement** - Achievement definitions
- **UserAchievement** - Player achievement progress
- **Stake** - Staking records
- **DailyChallenge** - Daily challenges
- **Activity** - Activity feed items
- **GlobalStats** - Cached platform stats

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run build` to verify
5. Submit a pull request

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push schema to database
npm run db:migrate   # Create migration
npm run db:seed      # Seed initial data
npm run db:studio    # Open Prisma Studio
```

## License

MIT
