# @grepcoin/subgraph

The Graph subgraph for indexing GrepCoin smart contract events on Base L2.

## Overview

This subgraph indexes:
- **Token Transfers** - GREP token movements
- **Staking Positions** - Stakes, unstakes, reward claims
- **Achievement Mints** - NFT badge claims
- **Global Statistics** - Aggregate metrics

## Schema

```graphql
type TokenHolder @entity {
  id: ID!
  address: Bytes!
  balance: BigInt!
  transferCount: Int!
  firstTransferAt: BigInt!
  lastTransferAt: BigInt!
}

type Transfer @entity {
  id: ID!
  from: Bytes!
  to: Bytes!
  amount: BigInt!
  timestamp: BigInt!
  blockNumber: BigInt!
  transactionHash: Bytes!
}

type StakePosition @entity {
  id: ID!
  user: Bytes!
  amount: BigInt!
  tier: Int!
  stakedAt: BigInt!
  lastClaimAt: BigInt!
}

type AchievementMint @entity {
  id: ID!
  user: Bytes!
  achievementId: BigInt!
  timestamp: BigInt!
  transactionHash: Bytes!
}

type GlobalStats @entity {
  id: ID!
  totalHolders: Int!
  totalTransfers: Int!
  totalStaked: BigInt!
  totalAchievementsMinted: Int!
}
```

## Setup

### Prerequisites

- Node.js 18+
- [Graph CLI](https://thegraph.com/docs/en/cookbook/quick-start/)
- Deployed GrepCoin contracts

### Installation

```bash
# Install Graph CLI globally
npm install -g @graphprotocol/graph-cli

# Install dependencies
cd packages/subgraph
npm install
```

### Configuration

Update `subgraph.yaml` with your contract addresses:

```yaml
dataSources:
  - kind: ethereum
    name: GrepToken
    network: base
    source:
      address: "0x..." # Your GrepToken address
      abi: GrepToken
      startBlock: 12345678
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      entities:
        - TokenHolder
        - Transfer
      abis:
        - name: GrepToken
          file: ./abis/GrepToken.json
      eventHandlers:
        - event: Transfer(indexed address,indexed address,uint256)
          handler: handleTransfer
      file: ./src/mappings/token.ts
```

## Development

### Generate Types

```bash
graph codegen
```

### Build

```bash
graph build
```

### Deploy to Hosted Service

```bash
# Authenticate
graph auth --product hosted-service <ACCESS_TOKEN>

# Deploy
graph deploy --product hosted-service grepcoin/grepcoin-base
```

### Deploy to Subgraph Studio

```bash
# Authenticate
graph auth --studio <DEPLOY_KEY>

# Deploy
graph deploy --studio grepcoin-base
```

## Mappings

### Token Transfers

```typescript
// src/mappings/token.ts
export function handleTransfer(event: Transfer): void {
  // Update sender balance
  let from = getOrCreateHolder(event.params.from)
  from.balance = from.balance.minus(event.params.value)
  from.transferCount += 1
  from.lastTransferAt = event.block.timestamp
  from.save()

  // Update receiver balance
  let to = getOrCreateHolder(event.params.to)
  to.balance = to.balance.plus(event.params.value)
  to.transferCount += 1
  to.lastTransferAt = event.block.timestamp
  to.save()

  // Create transfer record
  let transfer = new TransferEntity(event.transaction.hash.toHex())
  transfer.from = event.params.from
  transfer.to = event.params.to
  transfer.amount = event.params.value
  transfer.timestamp = event.block.timestamp
  transfer.blockNumber = event.block.number
  transfer.transactionHash = event.transaction.hash
  transfer.save()

  // Update global stats
  updateGlobalStats()
}
```

### Staking Events

```typescript
// src/mappings/staking.ts
export function handleStaked(event: Staked): void {
  let stake = new StakePosition(event.params.user.toHex())
  stake.user = event.params.user
  stake.amount = event.params.amount
  stake.tier = event.params.tier
  stake.stakedAt = event.block.timestamp
  stake.lastClaimAt = event.block.timestamp
  stake.save()

  updateGlobalStats()
}

export function handleUnstaked(event: Unstaked): void {
  let id = event.params.user.toHex()
  store.remove('StakePosition', id)
  updateGlobalStats()
}
```

## Queries

### Get Token Holders

```graphql
query GetTopHolders {
  tokenHolders(
    first: 100
    orderBy: balance
    orderDirection: desc
  ) {
    address
    balance
    transferCount
  }
}
```

### Get Staking Positions

```graphql
query GetStakers {
  stakePositions(
    where: { amount_gt: "0" }
    orderBy: amount
    orderDirection: desc
  ) {
    user
    amount
    tier
    stakedAt
  }
}
```

### Get Recent Transfers

```graphql
query GetRecentTransfers {
  transfers(
    first: 50
    orderBy: timestamp
    orderDirection: desc
  ) {
    from
    to
    amount
    timestamp
    transactionHash
  }
}
```

### Get Global Stats

```graphql
query GetStats {
  globalStats(id: "global") {
    totalHolders
    totalTransfers
    totalStaked
    totalAchievementsMinted
  }
}
```

## Testing

```bash
# Run tests
npm test

# Test locally with graph-node
docker-compose up
graph create --node http://localhost:8020 grepcoin/grepcoin-local
graph deploy --node http://localhost:8020 --ipfs http://localhost:5001 grepcoin/grepcoin-local
```

## Architecture

```
packages/subgraph/
├── abis/                    # Contract ABIs
│   ├── GrepToken.json
│   ├── GrepStakingPool.json
│   └── GrepAchievements.json
├── src/
│   ├── mappings/           # Event handlers
│   │   ├── token.ts
│   │   ├── staking.ts
│   │   └── achievements.ts
│   └── utils/              # Helper functions
├── schema.graphql          # GraphQL schema
├── subgraph.yaml          # Subgraph manifest
└── package.json
```

## Links

- [The Graph Documentation](https://thegraph.com/docs/)
- [AssemblyScript API](https://thegraph.com/docs/en/developing/assemblyscript-api/)
- [Base Network](https://base.org)

## License

MIT - GrepLabs LLC
