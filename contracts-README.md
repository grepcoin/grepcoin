# GrepCoin Smart Contracts

Solidity smart contracts for the GrepCoin ecosystem, built with Foundry.

## Contracts

| Contract | Description |
|----------|-------------|
| `GrepToken.sol` | ERC-20 token with voting, burning, and anti-whale limits |
| `VestingVault.sol` | Token vesting with cliff, linear release, and TGE support |
| `StakingPool.sol` | Multi-tier staking with 5-20% APY |
| `GrepGovernor.sol` | DAO governance with timelock execution |

## Prerequisites

Install Foundry:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Setup

1. Clone and install dependencies:

```bash
cd grepcoin
forge install OpenZeppelin/openzeppelin-contracts
```

2. Copy environment file:

```bash
cp .env.example .env
# Edit .env with your values
```

## Build

```bash
forge build
```

## Test

```bash
# Run all tests
forge test

# Run with verbosity
forge test -vvv

# Run specific test file
forge test --match-path test/GrepToken.t.sol

# Run with gas report
forge test --gas-report

# Run coverage
forge coverage
```

## Deploy

### Local (Anvil)

```bash
# Start local node
anvil

# Deploy
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

### Testnet (Base Sepolia)

```bash
forge script script/Deploy.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast \
  --verify
```

### Mainnet

```bash
forge script script/Deploy.s.sol \
  --rpc-url $BASE_RPC_URL \
  --broadcast \
  --verify \
  --slow
```

## Contract Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        GrepToken                            │
│  • 500M total supply                                        │
│  • ERC20Votes for governance                                │
│  • Max wallet (2%) and transaction (0.5%) limits            │
│  • Burnable                                                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ VestingVault  │   │  StakingPool  │   │ GrepGovernor  │
│               │   │               │   │               │
│ • Cliff       │   │ • 5 tiers     │   │ • Proposals   │
│ • Linear vest │   │ • 5-20% APY   │   │ • Voting      │
│ • TGE unlock  │   │ • Compound    │   │ • Timelock    │
│ • Revocable   │   │ • Emergency   │   │ • Execution   │
└───────────────┘   └───────────────┘   └───────────────┘
```

## Token Distribution

| Allocation | % | Tokens | Contract |
|------------|---|--------|----------|
| Community & Ecosystem | 40% | 200M | Treasury → StakingPool |
| Development Fund | 20% | 100M | Treasury |
| Team & Founders | 15% | 75M | VestingVault |
| Liquidity Pool | 10% | 50M | DEX |
| Early Supporters | 10% | 50M | VestingVault |
| Advisors | 5% | 25M | VestingVault |

## Staking Tiers

| Tier | Lock Period | APY |
|------|-------------|-----|
| Flexible | 0 days | 5% |
| Bronze | 30 days | 8% |
| Silver | 90 days | 12% |
| Gold | 180 days | 15% |
| Diamond | 365 days | 20% |

## Vesting Schedules

| Category | Cliff | Vesting | TGE |
|----------|-------|---------|-----|
| Team | 12 months | 36 months | 0% |
| Advisors | 6 months | 24 months | 0% |
| Early Supporters | 0 | 12 months | 10% |

## Security

- [ ] Slither static analysis
- [ ] Mythril symbolic execution
- [ ] External audit (planned)

### Security Features

- `ReentrancyGuard` on all state-changing functions
- `Ownable2Step` for safe ownership transfers
- `Pausable` for emergency stops
- Input validation on all public functions
- SafeERC20 for token transfers

## Gas Optimization

- Immutable variables for constructor-set values
- Unchecked math where overflow is impossible
- Efficient storage packing
- Batch operations support

## License

MIT

## Audit Status

**Not audited** - Use at your own risk. An external audit is recommended before mainnet deployment.
