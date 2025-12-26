---
layout: default
title: GrepCoin Architecture
---

# GrepCoin Architecture

**Technical Architecture Overview**

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        GREPCOIN PLATFORM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐   ┌─────────────────┐   ┌──────────────┐  │
│  │   Web App       │   │   Discord Bot   │   │  Mobile PWA  │  │
│  │   (Next.js 15)  │   │   (Discord.js)  │   │   (Future)   │  │
│  └────────┬────────┘   └────────┬────────┘   └──────────────┘  │
│           │                     │                               │
│           └──────────┬──────────┘                               │
│                      ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Layer (91 Routes)                  │  │
│  │    /api/games  /api/auth  /api/staking  /api/achievements │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│                             │                                   │
│           ┌─────────────────┼─────────────────┐                │
│           ▼                 ▼                 ▼                │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│  │  PostgreSQL │   │   Base L2   │   │   AI/Claude │          │
│  │   (NeonDB)  │   │ (Contracts) │   │   (Agents)  │          │
│  └─────────────┘   └─────────────┘   └─────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 15 | React framework (App Router) |
| React 18 | UI components |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| wagmi v3 | Web3 hooks |
| viem v2 | Ethereum interactions |

### Backend
| Technology | Purpose |
|------------|---------|
| Next.js API Routes | REST endpoints |
| Prisma ORM | Database access |
| PostgreSQL | Data storage (NeonDB) |
| SIWE | Wallet authentication |

### Blockchain
| Technology | Purpose |
|------------|---------|
| Base L2 | Primary network |
| Solidity 0.8.24 | Smart contracts |
| Hardhat | Development & testing |
| OpenZeppelin | Contract standards |

---

## Smart Contracts

### GrepToken.sol
- ERC-20 with ERC20Votes for governance
- Fixed 500M supply (minted at deployment)
- Burn functions for deflationary mechanics
- Anti-whale protections (max wallet/tx)

### GrepStakingPool.sol
- 4 tiers: Basic, Silver, Gold, Diamond
- Real yield from platform revenue
- Lock periods: 0 to 90 days
- Weighted reward distribution

### GrepVesting.sol
- Team and advisor vesting
- 1-year cliff, 3-year linear vest

### GrepAchievements.sol
- ERC-1155 for achievement badges
- Soulbound (non-transferable)
- Signature-based minting

---

## Repository Structure

```
grepcoin/
├── apps/
│   ├── web/                 # Next.js 15 (91 API routes)
│   └── discord-bot/         # Discord bot (14 commands)
├── packages/
│   ├── contracts/           # Solidity contracts
│   ├── agents/              # AI agent system
│   ├── anti-cheat/          # Score validation
│   └── subgraph/            # The Graph indexer
└── docs/                    # Documentation
```

---

*See [ARCHITECTURE.md](https://github.com/grepcoin/grepcoin/blob/main/docs/ARCHITECTURE.md) for full details.*
