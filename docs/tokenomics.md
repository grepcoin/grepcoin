---
layout: default
title: GrepCoin Tokenomics
---

# GrepCoin Tokenomics

**GREP Token Economics**

---

## Token Overview

| Property | Value |
|----------|-------|
| Name | GrepCoin |
| Symbol | GREP |
| Total Supply | 500,000,000 |
| Decimals | 18 |
| Network | Base (Ethereum L2) |
| Standard | ERC-20 |
| Type | Deflationary (Fixed Supply) |

---

## Distribution

```
            GREP Token Distribution (500M Total)
┌────────────────────────────────────────────────────────┐
│                                                        │
│  ████████████████████████████████████████  40%        │
│  Ecosystem & Rewards (200M)                           │
│                                                        │
│  ████████████████████  20%                            │
│  Liquidity Pool (100M)                                │
│                                                        │
│  ███████████████  15%                                 │
│  Team & Founders (75M) - 4 year vest                  │
│                                                        │
│  ███████████████  15%                                 │
│  Treasury (75M)                                       │
│                                                        │
│  ██████████  10%                                      │
│  Early Supporters (50M)                               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Allocation Details

| Allocation | Tokens | % | Vesting |
|------------|--------|---|---------|
| Ecosystem & Rewards | 200,000,000 | 40% | Released over 4 years |
| Liquidity Pool | 100,000,000 | 20% | Immediately for DEX |
| Team & Founders | 75,000,000 | 15% | 1-year cliff, 3-year vest |
| Treasury | 75,000,000 | 15% | Governance controlled |
| Early Supporters | 50,000,000 | 10% | 6-month vest |

---

## Deflationary Model

Unlike inflationary GameFi tokens, GREP uses a **fixed supply with multiple burn mechanisms**.

### Burn Sources

| Source | Burn Rate | Est. Annual Burn |
|--------|-----------|------------------|
| Marketplace Fees | 2.5% of volume | Variable |
| Tournament Entries | 10% of pool | ~1M GREP |
| Achievement Mints | 10 GREP each | ~500K GREP |
| Guild Creation | 500 GREP each | ~250K GREP |
| Evolution Votes | 100% of votes | Variable |

### Burn Targets

| Year | Target Cumulative Burn | Remaining Supply |
|------|------------------------|------------------|
| 1 | 10M (2%) | 490M |
| 2 | 30M (6%) | 470M |
| 3 | 60M (12%) | 440M |
| 5 | 100M (20%) | 400M |

**Maximum burn cap: 100M tokens (20% of supply)**

---

## Real Yield Staking

Staking rewards come from platform revenue, NOT from minting new tokens.

### Revenue Sources for Staking Pool

1. **Marketplace Fees**: 50% of 2.5% fee → staking pool
2. **Tournament Revenue**: Entry fees after burns
3. **Premium Features**: Subscription revenue
4. **Treasury Allocation**: Governance-approved distributions

### Staking Tiers

| Tier | Min Stake | Lock Period | Reward Weight | Bonus Plays |
|------|-----------|-------------|---------------|-------------|
| Basic | 100 GREP | None | 1.0x | 2/day |
| Silver | 1,000 GREP | 7 days | 1.25x | 5/day |
| Gold | 5,000 GREP | 30 days | 1.5x | 10/day |
| Diamond | 25,000 GREP | 90 days | 2.0x | 20/day |

### Reward Distribution

```
Platform Revenue
       │
       ▼
┌──────────────────┐
│  Revenue Pool    │
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
 50%       50%
Burns    Staking
         Rewards
            │
            ▼
   ┌─────────────────┐
   │ Weighted by:    │
   │ • Stake amount  │
   │ • Tier weight   │
   │ • Time staked   │
   └─────────────────┘
```

---

## Token Utility

### 1. Play-to-Earn
- Earn GREP for game scores
- Higher stakes = higher multipliers
- Daily challenges for bonus rewards

### 2. Staking
- Lock tokens for real yield
- Unlock tier benefits
- Governance voting power

### 3. Governance
- Vote on platform evolution
- Propose new features
- Allocate treasury funds

### 4. NFT Minting
- Burn 10 GREP per achievement NFT
- Soulbound badges (non-transferable)
- On-chain proof of accomplishment

### 5. Marketplace
- Trade in-game items
- 2.5% fee (half burned, half to stakers)
- Creator royalties supported

### 6. Premium Access
- Exclusive games for stakers
- Early access to features
- Enhanced daily rewards

---

## Anti-Whale Protections

Built into the token contract:

| Protection | Limit |
|------------|-------|
| Max Wallet | 2% of supply (10M GREP) |
| Max Transaction | 0.5% of supply (2.5M GREP) |
| Exempt | DEX pools, Staking contracts |

---

## Vesting Schedules

### Team & Founders (75M)
```
Month 0-12: Cliff (0% released)
Month 12-48: Linear vest (2.08%/month)
```

### Early Supporters (50M)
```
Month 0: 20% TGE
Month 1-6: 13.33%/month linear
```

### Treasury (75M)
```
Governance controlled
Proposals require:
- 100,000 GREP stake
- 10% quorum
- 66% approval
- 48-hour timelock
```

---

## Contract Addresses

### Base Sepolia (Testnet)
| Contract | Address |
|----------|---------|
| GrepToken | *Pending deployment* |
| StakingPool | *Pending deployment* |
| Achievements | *Pending deployment* |

### Base Mainnet
| Contract | Address |
|----------|---------|
| GrepToken | *After audit* |
| StakingPool | *After audit* |
| Achievements | *After audit* |

---

## Economic Security

### No Inflation
- 500M fixed supply
- No mint functions (except initial deployment)
- All rewards from existing allocation

### Burn Permanence
- Burned tokens are gone forever
- Burn events emitted on-chain
- Total burned tracked in contract

### Audit Status
- Smart contracts: Pending audit
- Will be audited before mainnet
- Bug bounty program planned

---

*Last updated: December 2024*
