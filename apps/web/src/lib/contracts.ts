// Contract addresses - will be updated after deployment
export const CONTRACTS = {
  // Base Sepolia (testnet)
  84532: {
    GREP_TOKEN: '0x0000000000000000000000000000000000000000',
    STAKING_POOL: '0x0000000000000000000000000000000000000000',
  },
  // Base Mainnet
  8453: {
    GREP_TOKEN: '0x0000000000000000000000000000000000000000',
    STAKING_POOL: '0x0000000000000000000000000000000000000000',
  },
} as const

// GrepToken ABI - ERC20 with minting functions
export const GREP_TOKEN_ABI = [
  // Read functions
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Write functions
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: true, name: 'spender', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
    name: 'Approval',
    type: 'event',
  },
] as const

// GrepStakingPool ABI
export const STAKING_POOL_ABI = [
  // Read functions
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'stakes',
    outputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'tier', type: 'uint8' },
      { name: 'stakedAt', type: 'uint256' },
      { name: 'lockedUntil', type: 'uint256' },
      { name: 'lastClaimAt', type: 'uint256' },
      { name: 'totalClaimed', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getStakeInfo',
    outputs: [
      {
        components: [
          { name: 'amount', type: 'uint256' },
          { name: 'tier', type: 'uint8' },
          { name: 'stakedAt', type: 'uint256' },
          { name: 'lockedUntil', type: 'uint256' },
          { name: 'lastClaimAt', type: 'uint256' },
          { name: 'totalClaimed', type: 'uint256' },
          { name: 'pendingReward', type: 'uint256' },
          { name: 'multiplier', type: 'uint256' },
          { name: 'bonusPlays', type: 'uint256' },
        ],
        name: 'info',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'pendingRewards',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserMultiplier',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserBonusPlays',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalStaked',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalStakers',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tier', type: 'uint8' }],
    name: 'tierInfo',
    outputs: [
      { name: 'minStake', type: 'uint256' },
      { name: 'lockDuration', type: 'uint256' },
      { name: 'multiplier', type: 'uint256' },
      { name: 'apyBps', type: 'uint256' },
      { name: 'bonusPlays', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Write functions
  {
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'tier', type: 'uint8' },
    ],
    name: 'stake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unstake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'tier', type: 'uint8' },
      { indexed: false, name: 'lockedUntil', type: 'uint256' },
    ],
    name: 'Staked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'Unstaked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'RewardsClaimed',
    type: 'event',
  },
] as const

// Tier enum mapping
export const TIER_ENUM = {
  None: 0,
  Flexible: 1,
  Bronze: 2,
  Silver: 3,
  Gold: 4,
  Diamond: 5,
} as const

export const TIER_NAMES = ['None', 'Flexible', 'Bronze', 'Silver', 'Gold', 'Diamond'] as const

// Helper to get contract address for a chain
export function getContractAddress(chainId: number, contract: 'GREP_TOKEN' | 'STAKING_POOL') {
  const addresses = CONTRACTS[chainId as keyof typeof CONTRACTS]
  if (!addresses) return null
  return addresses[contract]
}

// Helper to check if contracts are deployed on a chain
export function areContractsDeployed(chainId: number): boolean {
  const addresses = CONTRACTS[chainId as keyof typeof CONTRACTS]
  if (!addresses) return false
  return (
    addresses.GREP_TOKEN !== '0x0000000000000000000000000000000000000000' &&
    addresses.STAKING_POOL !== '0x0000000000000000000000000000000000000000'
  )
}
