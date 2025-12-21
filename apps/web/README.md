# GrepCoin Web Application

The official web application for GrepCoin - a blockchain gaming arcade on Base L2. Play developer-themed games, earn GREP tokens, stake for rewards, and engage with a vibrant community.

## Features

### Games
- **8 Playable Games**: Grep Rails, Stack Panic, Merge Miners, Quantum Grep, Bug Hunter, Crypto Snake, Syntax Sprint, RegEx Crossword
- **Play-to-Earn**: Earn GREP tokens based on gameplay performance
- **Anti-cheat System**: Server-side validation and pattern detection
- **Daily Challenges**: Complete challenges for bonus GREP rewards
- **Leaderboards**: Global and per-game competition

### Web3 Integration
- **Sign-In with Ethereum**: Wallet-based authentication using SIWE
- **Staking**: 5-tier staking system with 5%-20% APY
- **Reward Multipliers**: Up to 2x rewards based on staking tier
- **NFT Achievements**: Soulbound ERC-1155 achievement badges
- **NFT Items**: Tradeable in-game items and cosmetics
- **On-chain Governance**: Vote on proposals with GREP tokens

### Social Features
- **Guilds**: Create and join player guilds
- **Tournaments**: Participate in scheduled competitive events
- **Seasons & Battle Pass**: Unlock seasonal rewards
- **Live Activity Feed**: Real-time player activity updates
- **Quests**: Complete objectives for rewards
- **Marketplace**: Buy, sell, and auction NFT items
- **Profile System**: Track stats, achievements, and progress

## Tech Stack

- **Framework**: Next.js 15.5 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM v5.22
- **Authentication**: SIWE (Sign-In with Ethereum) v3 with NextAuth
- **Web3**: wagmi v3, viem v2, @tanstack/react-query
- **Styling**: Tailwind CSS v3.4
- **UI**: Framer Motion for animations, Lucide React for icons
- **Real-time**: Socket.io v4.8 for live updates
- **Email**: Resend for transactional emails
- **Push Notifications**: Web Push API with VAPID
- **Anti-cheat**: Custom @grepcoin/anti-cheat package

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

## API Routes

The app provides a comprehensive REST API organized by feature:

### Authentication (`/api/auth/*`)
- `GET /nonce` - Generate SIWE nonce for wallet signature
- `POST /verify` - Verify signed message and create session
- `GET /session` - Get current user session
- `POST /logout` - Clear user session
- `GET /user` - Get authenticated user data

### Games (`/api/games/*`)
- `GET /` - List all games with metadata
- `GET /:slug` - Get game details and leaderboard
- `POST /:slug/submit` - Submit score (requires auth)
- `GET /:slug/leaderboard` - Get game-specific leaderboard

### Leaderboard (`/api/leaderboard/*`)
- `GET /` - Global leaderboard
- `GET /game/:slug` - Game-specific leaderboard
- `GET /weekly` - Weekly leaderboard

### Stats & Analytics (`/api/stats/*`)
- `GET /` - Platform-wide statistics
- `GET /user/:wallet` - User-specific statistics
- `GET /game/:slug` - Game-specific statistics

### Achievements (`/api/achievements/*`)
- `GET /` - All available achievements
- `GET /user/:wallet` - User's achievements
- `POST /claim` - Claim achievement (requires auth + signature)

### Challenges (`/api/challenges/*`)
- `GET /` - Today's active challenges
- `GET /history` - Challenge history
- `POST /complete` - Complete challenge (requires auth)

### Activity (`/api/activity/*`)
- `GET /` - Recent activity feed
- `GET /user/:wallet` - User activity history
- `GET /live` - Live activity stream (SSE)

### Guilds (`/api/guilds/*`)
- `GET /` - List all guilds
- `POST /create` - Create new guild (requires auth)
- `GET /:id` - Guild details
- `POST /:id/join` - Join guild (requires auth)
- `POST /:id/leave` - Leave guild (requires auth)

### Tournaments (`/api/tournaments/*`)
- `GET /` - List active tournaments
- `GET /:id` - Tournament details
- `POST /:id/register` - Register for tournament (requires auth)
- `GET /:id/bracket` - Tournament bracket

### Marketplace (`/api/marketplace/*`)
- `GET /items` - List items for sale
- `GET /auctions` - Active auctions
- `POST /list` - List item for sale (requires auth)
- `POST /buy` - Purchase item (requires auth)

### Quests (`/api/quests/*`)
- `GET /` - Available quests
- `GET /user` - User quest progress (requires auth)
- `POST /claim` - Claim quest reward (requires auth)

### Governance (`/api/governance/*`)
- `GET /proposals` - List all proposals
- `POST /propose` - Create proposal (requires auth + tokens)
- `POST /vote` - Vote on proposal (requires auth)

### Notifications (`/api/notifications/*`)
- `GET /` - User notifications (requires auth)
- `POST /subscribe` - Subscribe to push notifications
- `PATCH /:id/read` - Mark notification as read

## Staking System

GrepCoin's staking system integrates directly with on-chain smart contracts:

| Tier | Minimum | Lock Period | APY | Multiplier | Bonus Plays |
|------|---------|-------------|-----|------------|-------------|
| Flexible | 100 GREP | None | 5% | 1.1x | +2 daily |
| Bronze | 1,000 GREP | 7 days | 8% | 1.25x | +5 daily |
| Silver | 5,000 GREP | 14 days | 12% | 1.5x | +10 daily |
| Gold | 10,000 GREP | 30 days | 15% | 1.75x | +15 daily |
| Diamond | 50,000 GREP | 90 days | 20% | 2.0x | +25 daily |

**Benefits:**
- Higher APY based on tier and lock duration
- Gameplay reward multipliers
- Additional daily plays
- Governance voting power
- Early access to new features

## Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Select the `apps/web` directory as the root

2. **Configure Build Settings**
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Set Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add all required variables from `.env.example`
   - Generate production secrets for `NEXTAUTH_SECRET` and `INTERNAL_API_KEY`

4. **Deploy**
   ```bash
   # Using Vercel CLI
   npm i -g vercel
   vercel --prod
   ```

### Environment Variables for Production

**Required:**
- `DATABASE_URL` - Production PostgreSQL connection
- `DIRECT_URL` - Direct database connection for migrations
- `NEXTAUTH_SECRET` - Strong random secret (use `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your production URL (https://grepcoin.io)

**Blockchain (Required for full functionality):**
- `NEXT_PUBLIC_ALCHEMY_API_KEY` - Alchemy API key
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - WalletConnect project ID
- `NEXT_PUBLIC_CHAIN_ID` - 8453 for Base mainnet
- `NEXT_PUBLIC_GREP_TOKEN_ADDRESS` - Deployed token address
- `NEXT_PUBLIC_STAKING_POOL_ADDRESS` - Deployed staking address

**Optional Services:**
- `RESEND_API_KEY` - For email notifications
- `VAPID_PUBLIC_KEY` & `VAPID_PRIVATE_KEY` - For push notifications
- `INTERNAL_API_KEY` - For authenticated service-to-service calls

### Other Platforms

**Docker:**
```bash
# Build image
docker build -t grepcoin-web .

# Run container
docker run -p 3000:3000 --env-file .env grepcoin-web
```

**Self-hosted:**
```bash
npm run build
npm start
# Runs on port 3000
```

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
