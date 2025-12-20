# Stream 3: Crypto/Blockchain

## Overview
Deploy and integrate blockchain infrastructure for GREP token, NFT badges, on-chain leaderboards, and DeFi features on Base network.

## Features

### 1. Testnet Deployment
**Priority: Critical**

- **Deploy to Base Sepolia**: All contracts on testnet first
- **Verification**: Verify contracts on BaseScan
- **Testing**: Comprehensive integration tests
- **Faucet Integration**: Easy testnet token acquisition

**Contracts to Deploy:**
| Contract | Address (TBD) | Status |
|----------|---------------|--------|
| GrepToken | - | Ready |
| GrepStaking | - | Ready |
| GrepVesting | - | Ready |
| GrepAchievements | - | Pending |
| GrepLeaderboard | - | Pending |

**Deployment Script:**
```
packages/contracts/scripts/
├── deploy-all.ts       # Full deployment
├── deploy-token.ts     # Token only
├── deploy-staking.ts   # Staking only
├── verify-all.ts       # Contract verification
└── config/
    ├── base-sepolia.ts # Testnet config
    └── base-mainnet.ts # Mainnet config
```

**Pre-Deployment Checklist:**
- [ ] Fund deployer wallet with Base Sepolia ETH
- [ ] Set environment variables
- [ ] Run local tests
- [ ] Deploy to testnet
- [ ] Verify on BaseScan
- [ ] Test all functions
- [ ] Document addresses

### 2. Achievement Token Claims
**Priority: High**

- **On-Chain Achievements**: NFT badges for achievements
- **Claim Flow**: EIP-712 signed claims from backend
- **Metadata**: IPFS-hosted achievement metadata
- **Rarity Tiers**: Different visual styles per rarity

**Smart Contract:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract GrepAchievements is ERC1155, EIP712 {
    bytes32 public constant CLAIM_TYPEHASH =
        keccak256("Claim(address player,uint256 achievementId,uint256 nonce)");

    address public signer;
    mapping(address => mapping(uint256 => bool)) public claimed;
    mapping(address => uint256) public nonces;

    function claim(
        uint256 achievementId,
        bytes calldata signature
    ) external {
        require(!claimed[msg.sender][achievementId], "Already claimed");

        bytes32 structHash = keccak256(abi.encode(
            CLAIM_TYPEHASH,
            msg.sender,
            achievementId,
            nonces[msg.sender]++
        ));

        bytes32 hash = _hashTypedDataV4(structHash);
        require(ECDSA.recover(hash, signature) == signer, "Invalid signature");

        claimed[msg.sender][achievementId] = true;
        _mint(msg.sender, achievementId, 1, "");
    }
}
```

**Metadata Structure:**
```json
{
  "name": "First Victory",
  "description": "Won your first game",
  "image": "ipfs://...",
  "attributes": [
    { "trait_type": "Rarity", "value": "Common" },
    { "trait_type": "Category", "value": "Milestone" },
    { "trait_type": "Reward", "value": "10 GREP" }
  ]
}
```

### 3. NFT Badges
**Priority: High**

- **Dynamic NFTs**: Badges that evolve with progress
- **Soulbound Option**: Non-transferable achievement badges
- **Display System**: Showcase badges on profile
- **Leaderboard Badges**: Special badges for top players

**Badge Categories:**
| Category | Examples | Transferable |
|----------|----------|--------------|
| Achievements | First Win, Streak Master | No (Soulbound) |
| Seasonal | Season 1 Player | No |
| Competitive | Top 10 Weekly | Yes |
| Special | Beta Tester, Early Backer | Yes |

**Frontend Components:**
```
apps/web/src/components/badges/
├── BadgeGrid.tsx        # Display badge collection
├── BadgeCard.tsx        # Individual badge display
├── BadgeClaimModal.tsx  # Claim flow UI
└── BadgeShowcase.tsx    # Profile badge showcase
```

### 4. On-Chain Leaderboards
**Priority: Medium**

- **Weekly Snapshots**: Record top players on-chain
- **Immutable History**: Permanent record of achievements
- **Prize Distribution**: Automatic reward distribution
- **Merkle Proofs**: Efficient verification

**Smart Contract:**
```solidity
contract GrepLeaderboard {
    struct LeaderboardEntry {
        address player;
        uint256 score;
        uint256 rank;
    }

    // week => game => entries
    mapping(uint256 => mapping(string => LeaderboardEntry[])) public leaderboards;

    // Merkle root for each week's leaderboard
    mapping(uint256 => bytes32) public weeklyRoots;

    function submitWeeklyLeaderboard(
        uint256 week,
        string calldata game,
        LeaderboardEntry[] calldata entries,
        bytes32 merkleRoot
    ) external onlyAdmin {
        // Store entries and merkle root
    }

    function claimPrize(
        uint256 week,
        string calldata game,
        uint256 rank,
        bytes32[] calldata proof
    ) external {
        // Verify merkle proof and distribute prize
    }
}
```

### 5. Liquidity Pool
**Priority: Medium**

- **Uniswap V3 Integration**: Create GREP/ETH pool
- **Initial Liquidity**: Seed pool from treasury
- **LP Rewards**: Incentivize liquidity providers
- **Price Oracle**: On-chain price feed

**Implementation:**
```
packages/contracts/src/defi/
├── LiquidityManager.sol  # LP management
├── PriceOracle.sol       # TWAP oracle
└── LPRewards.sol         # LP staking rewards
```

**Pool Parameters:**
| Parameter | Value |
|-----------|-------|
| Initial GREP | 10,000,000 |
| Initial ETH | TBD |
| Fee Tier | 0.3% |
| Price Range | Full range |

### 6. Token Distribution
**Priority: High**

- **Vesting Schedules**: Team, advisors, investors
- **Airdrop Claims**: Community airdrops
- **Staking Rewards**: Daily reward distribution
- **Game Rewards**: Play-to-earn distribution

**Distribution Dashboard:**
```
apps/web/src/app/admin/distribution/
├── page.tsx           # Distribution overview
├── vesting/
│   └── page.tsx       # Vesting schedules
├── airdrops/
│   └── page.tsx       # Airdrop management
└── rewards/
    └── page.tsx       # Reward distribution
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/blockchain/claim` | POST | Generate claim signature |
| `/api/blockchain/badges` | GET | Get user badges |
| `/api/blockchain/leaderboard` | GET | Get on-chain leaderboard |
| `/api/blockchain/prices` | GET | Get token prices |

## Contract Addresses (Testnet)

```env
# Base Sepolia
GREP_TOKEN=0x...
GREP_STAKING=0x...
GREP_VESTING=0x...
GREP_ACHIEVEMENTS=0x...
GREP_LEADERBOARD=0x...

# Deployer
DEPLOYER_PRIVATE_KEY=0x...
```

## Infrastructure

### IPFS
- Achievement metadata
- Badge images
- Replay highlights

### The Graph (Subgraph)
- Index contract events
- Query historical data
- Leaderboard aggregation

**Subgraph Schema:**
```graphql
type Player @entity {
  id: ID!
  address: Bytes!
  totalScore: BigInt!
  gamesPlayed: Int!
  achievements: [Achievement!]!
}

type Achievement @entity {
  id: ID!
  player: Player!
  achievementId: BigInt!
  claimedAt: BigInt!
  txHash: Bytes!
}

type LeaderboardEntry @entity {
  id: ID!
  week: Int!
  game: String!
  player: Player!
  score: BigInt!
  rank: Int!
}
```

## Security Considerations

- Multi-sig for admin functions
- Timelock for critical changes
- Pausable contracts (implemented)
- Reentrancy guards
- Access control (OpenZeppelin)

## Success Metrics

- Contract deployment success
- Claim transaction success rate > 99%
- Gas costs within acceptable range
- Zero security incidents

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Smart contract bugs | Audits, extensive testing |
| Private key compromise | Multi-sig, hardware wallets |
| Gas price spikes | Gas estimation, user warnings |
| Bridge failures | Multiple bridge options |

---

*Stream 3 - Crypto/Blockchain Plan*
