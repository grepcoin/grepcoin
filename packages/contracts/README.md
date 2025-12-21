# GrepCoin Smart Contracts

Production-ready Solidity smart contracts for the GrepCoin ecosystem on Base L2. Built with OpenZeppelin libraries and comprehensive test coverage.

## Overview

GrepCoin's smart contract suite provides:
- **ERC-20 Token** with categorized minting caps
- **Staking System** with 5 tiers and APY rewards
- **NFT Items** (ERC-1155) for in-game assets
- **NFT Achievements** (ERC-1155) for player milestones
- **Token Vesting** for team and advisors
- **Governance** with proposal voting
- **Burn Mechanism** for deflationary economics

## Contracts

### GrepToken.sol

**Type:** ERC-20 Token (Burnable, Pausable, Permit)

**Total Supply:** 1,000,000,000 GREP (1 billion)

**Features:**
- Minting caps by category (staking, gameplay, airdrops)
- Burnable by token holders
- Emergency pause functionality
- EIP-2612 Permit for gasless approvals
- Multiple authorized minters

**Token Distribution:**
- 40% (400M) - Initial mint to deployer for liquidity and team
- 30% (300M) - Reserved for staking rewards
- 20% (200M) - Reserved for gameplay rewards
- 10% (100M) - Reserved for airdrops and marketing

**Key Functions:**
```solidity
function mintStakingRewards(address to, uint256 amount) external
function mintGameplayRewards(address to, uint256 amount) external
function mintAirdrop(address to, uint256 amount) external
function addMinter(address minter) external onlyOwner
function pause() external onlyOwner
```

**Events:**
```solidity
event StakingRewardsMinted(address indexed to, uint256 amount)
event GameplayRewardsMinted(address indexed to, uint256 amount)
event AirdropMinted(address indexed to, uint256 amount)
event MinterAdded(address indexed minter)
```

---

### GrepStakingPool.sol

**Type:** DeFi Staking Contract

**Features:**
- 5-tier staking system with increasing rewards
- Time-locked staking periods
- Automatic reward calculation and minting
- Tier-based gameplay multipliers
- Bonus daily plays per tier
- Non-custodial (users can unstake after lock period)

**Staking Tiers:**

| Tier | Minimum | Lock Period | APY | Multiplier | Bonus Plays |
|------|---------|-------------|-----|------------|-------------|
| Flexible | 100 GREP | None | 5% | 1.1x | +2 |
| Bronze | 1,000 GREP | 7 days | 8% | 1.25x | +5 |
| Silver | 5,000 GREP | 14 days | 12% | 1.5x | +10 |
| Gold | 10,000 GREP | 30 days | 15% | 1.75x | +15 |
| Diamond | 50,000 GREP | 90 days | 20% | 2.0x | +25 |

**Key Functions:**
```solidity
function stake(uint256 amount, Tier tier) external
function unstake() external
function claimRewards() external
function pendingRewards(address user) public view returns (uint256)
function getUserMultiplier(address user) external view returns (uint256)
function getUserBonusPlays(address user) external view returns (uint256)
```

**Events:**
```solidity
event Staked(address indexed user, uint256 amount, Tier tier, uint256 lockedUntil)
event Unstaked(address indexed user, uint256 amount)
event RewardsClaimed(address indexed user, uint256 amount)
event TierUpgraded(address indexed user, Tier oldTier, Tier newTier)
```

---

### GrepItems.sol

**Type:** ERC-1155 Multi-Token NFT

**Features:**
- Multiple token IDs for different item types
- Rarity system (Common, Rare, Epic, Legendary)
- Tradability controls per item
- Batch minting and transfers
- Supply tracking
- IPFS metadata URIs

**Item Rarities:**
- 0 = Common
- 1 = Rare
- 2 = Epic
- 3 = Legendary

**Key Functions:**
```solidity
function mint(address to, uint256 tokenId, uint256 amount, bytes memory data) external
function mintBatch(address to, uint256[] memory tokenIds, uint256[] memory amounts, bytes memory data) external
function setTokenURI(uint256 tokenId, string memory tokenURI) external
function setItemRarity(uint256 tokenId, uint8 rarity) external
function setTradeable(uint256 tokenId, bool _tradeable) external
function getItemInfo(uint256 tokenId) external view returns (uint8 rarity, bool isTradeable, uint256 supply, string memory tokenURI)
```

---

### GrepAchievements.sol

**Type:** ERC-1155 Soulbound NFT Badges

**Features:**
- EIP-712 signature-based claiming
- Soulbound (non-transferable after minting)
- Backend-authorized minting via signatures
- Nonce-based replay protection
- One achievement per player

**Key Functions:**
```solidity
function claim(uint256 achievementId, bytes calldata signature) external
function hasClaimed(address player, uint256 achievementId) external view returns (bool)
function setSigner(address newSigner) external onlyOwner
function getClaimHash(address player, uint256 achievementId, uint256 nonce) external view returns (bytes32)
```

**Events:**
```solidity
event AchievementClaimed(address indexed player, uint256 indexed achievementId, uint256 nonce)
event SignerUpdated(address indexed oldSigner, address indexed newSigner)
```

---

### GrepVesting.sol

**Type:** Token Vesting Contract

**Features:**
- Cliff period support
- Linear vesting after cliff
- Revocable schedules (for employees)
- Multiple beneficiaries
- Granular vesting tracking

**Key Functions:**
```solidity
function createVestingSchedule(
    address beneficiary,
    uint256 amount,
    uint256 startTime,
    uint256 cliffDuration,
    uint256 vestingDuration,
    bool revocable
) external onlyOwner

function release() external
function revoke(address beneficiary) external onlyOwner
function releasableAmount(address beneficiary) external view returns (uint256)
function vestedAmount(address beneficiary) external view returns (uint256)
```

**Typical Vesting Schedule:**
- 1 year cliff
- 2 year linear vesting (total 3 years)

---

### GrepGovernance.sol

**Type:** DAO Governance Contract

**Features:**
- Proposal creation with token threshold
- Token-weighted voting
- Quorum requirements
- 3-day voting period
- Proposal states (Pending, Active, Succeeded, Defeated, Executed, Cancelled)

**Parameters:**
- Minimum proposal threshold: 10,000 GREP
- Voting period: 3 days
- Quorum: 4% of total supply

**Key Functions:**
```solidity
function propose(string calldata title, string calldata description) external returns (uint256)
function vote(uint256 proposalId, bool support) external
function execute(uint256 proposalId) external onlyOwner
function cancel(uint256 proposalId) external
function getProposalState(uint256 proposalId) public view returns (ProposalState)
```

**Events:**
```solidity
event ProposalCreated(uint256 indexed id, address proposer, string title, uint256 startTime, uint256 endTime)
event VoteCast(uint256 indexed proposalId, address voter, bool support, uint256 votes)
event ProposalExecuted(uint256 indexed id)
```

---

### GrepBurner.sol

**Type:** Token Burn Mechanism

**Features:**
- Voluntary token burning
- Burn history tracking
- Tier-based benefits for burners
- Burn reason metadata

**Burn Tiers:**
- Bronze: 1,000 GREP burned
- Silver: 10,000 GREP burned
- Gold: 100,000 GREP burned
- Diamond: 1,000,000 GREP burned

**Key Functions:**
```solidity
function burn(uint256 amount, string calldata reason) external
function getUserTier(address user) external view returns (string memory)
function getUserBurnCount(address user) external view returns (uint256)
function getRecentBurns(uint256 count) external view returns (BurnRecord[] memory)
```

**Events:**
```solidity
event TokensBurned(address indexed burner, uint256 amount, string reason)
event TierReached(address indexed user, string tier)
```

---

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Hardhat

### Installation

```bash
cd packages/contracts
npm install
```

### Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure the following:

```env
# Deployer wallet private key (without 0x)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Basescan API key for verification
BASESCAN_API_KEY=your_basescan_api_key

# RPC URLs
BASE_SEPOLIA_RPC=https://sepolia.base.org
BASE_RPC=https://mainnet.base.org
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm test
```

All contracts have comprehensive test coverage including:
- Unit tests for all functions
- Edge case handling
- Access control verification
- Event emission checks
- Integration scenarios

### Deploy to Testnet

```bash
# Deploy to Base Sepolia
npm run deploy:sepolia
```

The deployment script will:
1. Deploy GrepToken
2. Deploy GrepStakingPool
3. Deploy GrepItems
4. Deploy GrepAchievements
5. Deploy GrepVesting
6. Deploy GrepGovernance
7. Deploy GrepBurner
8. Set up roles and permissions
9. Output contract addresses

### Deploy to Mainnet

```bash
# Deploy to Base mainnet
npm run deploy:base
```

**Warning:** Only deploy to mainnet after:
- Comprehensive testing on testnet
- Professional security audit
- Legal review
- Community approval

### Verify Contracts

After deployment, verify contracts on Basescan:

```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

Or use the verification script:

```bash
node scripts/verify.js
```

---

## Testing

Run the full test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npx hardhat coverage
```

Run tests with gas reporting:

```bash
REPORT_GAS=true npm test
```

### Test Files

- `test/GrepToken.test.js` - Token minting, burning, pausing
- `test/GrepStakingPool.test.js` - Staking, unstaking, rewards
- `test/GrepItems.test.js` - NFT minting, transfers, metadata
- `test/GrepAchievements.test.js` - Signature claiming, soulbound
- `test/GrepVesting.test.js` - Vesting schedules, cliff, release
- `test/GrepGovernance.test.js` - Proposals, voting, execution
- `test/GrepBurner.test.js` - Burning, tiers, history

---

## Security

### Audits

- **Status:** Not yet audited
- **Planned:** Professional audit before mainnet deployment
- **Budget:** $8,000-15,000 for reputable auditor

### Security Features

- OpenZeppelin battle-tested contracts
- ReentrancyGuard on critical functions
- Access control with Ownable
- Emergency pause functionality
- Input validation and bounds checking
- Safe math (Solidity ^0.8.24 overflow protection)

### Bug Bounty

After mainnet launch, we will run a bug bounty program:
- Critical: Up to $50,000
- High: Up to $10,000
- Medium: Up to $5,000
- Low: Up to $1,000

Report vulnerabilities to: security@greplabs.io

---

## Contract Addresses

### Base Sepolia Testnet

```
GrepToken: TBD
GrepStakingPool: TBD
GrepItems: TBD
GrepAchievements: TBD
GrepVesting: TBD
GrepGovernance: TBD
GrepBurner: TBD
```

### Base Mainnet

```
Coming after audit and deployment
```

---

## Integration Guide

### For Web App

1. **Install dependencies:**
   ```bash
   npm install wagmi viem @tanstack/react-query
   ```

2. **Configure wagmi:**
   ```typescript
   import { createConfig, http } from 'wagmi'
   import { base } from 'wagmi/chains'

   const config = createConfig({
     chains: [base],
     transports: {
       [base.id]: http()
     }
   })
   ```

3. **Import ABIs:**
   ```typescript
   import GrepTokenABI from './abis/GrepToken.json'
   import GrepStakingPoolABI from './abis/GrepStakingPool.json'
   ```

4. **Use hooks:**
   ```typescript
   import { useReadContract, useWriteContract } from 'wagmi'

   // Read user's stake
   const { data: stakeInfo } = useReadContract({
     address: STAKING_POOL_ADDRESS,
     abi: GrepStakingPoolABI,
     functionName: 'getStakeInfo',
     args: [userAddress]
   })

   // Stake tokens
   const { writeContract } = useWriteContract()
   writeContract({
     address: STAKING_POOL_ADDRESS,
     abi: GrepStakingPoolABI,
     functionName: 'stake',
     args: [amount, tier]
   })
   ```

### For Backend

Use ethers.js or viem for server-side interactions:

```javascript
import { createPublicClient, createWalletClient, http } from 'viem'
import { base } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

const publicClient = createPublicClient({
  chain: base,
  transport: http()
})

const account = privateKeyToAccount(process.env.PRIVATE_KEY)
const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http()
})

// Mint gameplay rewards
const hash = await walletClient.writeContract({
  address: GREP_TOKEN_ADDRESS,
  abi: GrepTokenABI,
  functionName: 'mintGameplayRewards',
  args: [playerAddress, rewardAmount]
})
```

---

## License

MIT License - see [LICENSE](../../LICENSE) for details

---

## Support

- **Documentation:** [docs.grepcoin.io](https://docs.grepcoin.io)
- **Discord:** [discord.gg/grepcoin](https://discord.gg/grepcoin)
- **Email:** hello@greplabs.io
- **GitHub Issues:** [github.com/grepcoin/grepcoin/issues](https://github.com/grepcoin/grepcoin/issues)

---

Built with love by [GrepLabs LLC](https://greplabs.io)
