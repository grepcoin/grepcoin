import {
  createPublicClient,
  http,
  formatEther,
  parseAbi,
  type PublicClient,
  type Address,
  type Log
} from 'viem'
import { base, baseSepolia } from 'viem/chains'

// Minimal ABIs for the functions we need
const GREP_TOKEN_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function stakingRewardsMinted() view returns (uint256)',
  'function gameplayRewardsMinted() view returns (uint256)',
  'function airdropsMinted() view returns (uint256)',
  'function MAX_SUPPLY() view returns (uint256)',
  'function STAKING_REWARDS_CAP() view returns (uint256)',
  'function GAMEPLAY_REWARDS_CAP() view returns (uint256)',
  'function AIRDROPS_CAP() view returns (uint256)',
  'function getRemainingMintable() view returns (uint256, uint256, uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event StakingRewardsMinted(address indexed to, uint256 amount)',
  'event GameplayRewardsMinted(address indexed to, uint256 amount)',
  'event AirdropMinted(address indexed to, uint256 amount)'
])

const GREP_STAKING_ABI = parseAbi([
  'function totalStaked() view returns (uint256)',
  'function totalStakers() view returns (uint256)',
  'function totalRewardsDistributed() view returns (uint256)',
  'function getUserMultiplier(address user) view returns (uint256)',
  'function getUserBonusPlays(address user) view returns (uint256)',
  'function pendingRewards(address user) view returns (uint256)',
  'function getStakeInfo(address user) view returns (uint256 amount, uint8 tier, uint256 stakedAt, uint256 lockedUntil, uint256 lastClaimAt, uint256 totalClaimed, uint256 pendingReward, uint256 multiplier, uint256 bonusPlays)',
  'function getAllTiers() view returns ((uint256,uint256,uint256,uint256,uint256), (uint256,uint256,uint256,uint256,uint256), (uint256,uint256,uint256,uint256,uint256), (uint256,uint256,uint256,uint256,uint256), (uint256,uint256,uint256,uint256,uint256))',
  'event Staked(address indexed user, uint256 amount, uint8 tier, uint256 lockedUntil)',
  'event Unstaked(address indexed user, uint256 amount)',
  'event RewardsClaimed(address indexed user, uint256 amount)',
  'event TierUpgraded(address indexed user, uint8 oldTier, uint8 newTier)'
])

export interface TokenMetrics {
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  maxSupply: string
  stakingRewardsMinted: string
  gameplayRewardsMinted: string
  airdropsMinted: string
  remainingMintable: {
    staking: string
    gameplay: string
    airdrops: string
  }
}

export interface StakingMetrics {
  totalStaked: string
  totalStakers: number
  totalRewardsDistributed: string
  tvlUsd: string | null // Requires price feed
}

export interface Transfer {
  from: Address
  to: Address
  value: string
  blockNumber: bigint
  transactionHash: string
  timestamp?: number
}

export interface StakeEvent {
  user: Address
  amount: string
  tier: number
  lockedUntil: bigint
  blockNumber: bigint
  transactionHash: string
}

export type NetworkType = 'mainnet' | 'testnet'

export class BlockchainService {
  private client: PublicClient
  private tokenAddress: Address | null = null
  private stakingAddress: Address | null = null
  private network: NetworkType

  constructor(network: NetworkType = 'testnet') {
    this.network = network
    const chain = network === 'mainnet' ? base : baseSepolia

    this.client = createPublicClient({
      chain,
      transport: http()
    }) as PublicClient
  }

  /**
   * Configure contract addresses (call after deployment)
   */
  setContractAddresses(tokenAddress: Address, stakingAddress: Address): void {
    this.tokenAddress = tokenAddress
    this.stakingAddress = stakingAddress
  }

  /**
   * Check if service is configured with contract addresses
   */
  isConfigured(): boolean {
    return this.tokenAddress !== null && this.stakingAddress !== null
  }

  /**
   * Get the current chain ID
   */
  async getChainId(): Promise<number> {
    return await this.client.getChainId()
  }

  /**
   * Get the latest block number
   */
  async getBlockNumber(): Promise<bigint> {
    return await this.client.getBlockNumber()
  }

  /**
   * Get token metrics from the blockchain
   */
  async getTokenMetrics(): Promise<TokenMetrics> {
    if (!this.tokenAddress) {
      throw new Error('Token address not configured')
    }

    const [
      name,
      symbol,
      decimals,
      totalSupply,
      maxSupply,
      stakingRewardsMinted,
      gameplayRewardsMinted,
      airdropsMinted,
      [stakingRemaining, gameplayRemaining, airdropsRemaining]
    ] = await Promise.all([
      this.client.readContract({
        address: this.tokenAddress,
        abi: GREP_TOKEN_ABI,
        functionName: 'name'
      }) as Promise<string>,
      this.client.readContract({
        address: this.tokenAddress,
        abi: GREP_TOKEN_ABI,
        functionName: 'symbol'
      }) as Promise<string>,
      this.client.readContract({
        address: this.tokenAddress,
        abi: GREP_TOKEN_ABI,
        functionName: 'decimals'
      }) as Promise<number>,
      this.client.readContract({
        address: this.tokenAddress,
        abi: GREP_TOKEN_ABI,
        functionName: 'totalSupply'
      }) as Promise<bigint>,
      this.client.readContract({
        address: this.tokenAddress,
        abi: GREP_TOKEN_ABI,
        functionName: 'MAX_SUPPLY'
      }) as Promise<bigint>,
      this.client.readContract({
        address: this.tokenAddress,
        abi: GREP_TOKEN_ABI,
        functionName: 'stakingRewardsMinted'
      }) as Promise<bigint>,
      this.client.readContract({
        address: this.tokenAddress,
        abi: GREP_TOKEN_ABI,
        functionName: 'gameplayRewardsMinted'
      }) as Promise<bigint>,
      this.client.readContract({
        address: this.tokenAddress,
        abi: GREP_TOKEN_ABI,
        functionName: 'airdropsMinted'
      }) as Promise<bigint>,
      this.client.readContract({
        address: this.tokenAddress,
        abi: GREP_TOKEN_ABI,
        functionName: 'getRemainingMintable'
      }) as Promise<[bigint, bigint, bigint]>
    ])

    return {
      name,
      symbol,
      decimals,
      totalSupply: formatEther(totalSupply),
      maxSupply: formatEther(maxSupply),
      stakingRewardsMinted: formatEther(stakingRewardsMinted),
      gameplayRewardsMinted: formatEther(gameplayRewardsMinted),
      airdropsMinted: formatEther(airdropsMinted),
      remainingMintable: {
        staking: formatEther(stakingRemaining),
        gameplay: formatEther(gameplayRemaining),
        airdrops: formatEther(airdropsRemaining)
      }
    }
  }

  /**
   * Get staking pool metrics
   */
  async getStakingMetrics(): Promise<StakingMetrics> {
    if (!this.stakingAddress) {
      throw new Error('Staking address not configured')
    }

    const [totalStaked, totalStakers, totalRewardsDistributed] = await Promise.all([
      this.client.readContract({
        address: this.stakingAddress,
        abi: GREP_STAKING_ABI,
        functionName: 'totalStaked'
      }) as Promise<bigint>,
      this.client.readContract({
        address: this.stakingAddress,
        abi: GREP_STAKING_ABI,
        functionName: 'totalStakers'
      }) as Promise<bigint>,
      this.client.readContract({
        address: this.stakingAddress,
        abi: GREP_STAKING_ABI,
        functionName: 'totalRewardsDistributed'
      }) as Promise<bigint>
    ])

    return {
      totalStaked: formatEther(totalStaked),
      totalStakers: Number(totalStakers),
      totalRewardsDistributed: formatEther(totalRewardsDistributed),
      tvlUsd: null // Would need price oracle integration
    }
  }

  /**
   * Get token balance for an address
   */
  async getTokenBalance(address: Address): Promise<string> {
    if (!this.tokenAddress) {
      throw new Error('Token address not configured')
    }

    const balance = await this.client.readContract({
      address: this.tokenAddress,
      abi: GREP_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [address]
    }) as bigint

    return formatEther(balance)
  }

  /**
   * Get user's stake info
   */
  async getUserStakeInfo(userAddress: Address): Promise<{
    amount: string
    tier: number
    stakedAt: bigint
    lockedUntil: bigint
    pendingReward: string
    multiplier: number
    bonusPlays: number
  }> {
    if (!this.stakingAddress) {
      throw new Error('Staking address not configured')
    }

    const result = await this.client.readContract({
      address: this.stakingAddress,
      abi: GREP_STAKING_ABI,
      functionName: 'getStakeInfo',
      args: [userAddress]
    }) as [bigint, number, bigint, bigint, bigint, bigint, bigint, bigint, bigint]

    return {
      amount: formatEther(result[0]),
      tier: result[1],
      stakedAt: result[2],
      lockedUntil: result[3],
      pendingReward: formatEther(result[6]),
      multiplier: Number(result[7]) / 10000, // Convert from basis points
      bonusPlays: Number(result[8])
    }
  }

  /**
   * Get recent transfer events
   */
  async getRecentTransfers(limit: number = 10): Promise<Transfer[]> {
    if (!this.tokenAddress) {
      throw new Error('Token address not configured')
    }

    const currentBlock = await this.client.getBlockNumber()
    const fromBlock = currentBlock - BigInt(10000) // Last ~10000 blocks

    const logs = await this.client.getLogs({
      address: this.tokenAddress,
      event: {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { type: 'address', indexed: true, name: 'from' },
          { type: 'address', indexed: true, name: 'to' },
          { type: 'uint256', indexed: false, name: 'value' }
        ]
      },
      fromBlock,
      toBlock: currentBlock
    })

    return logs.slice(-limit).map(log => ({
      from: log.args.from as Address,
      to: log.args.to as Address,
      value: formatEther(log.args.value as bigint),
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash
    }))
  }

  /**
   * Get recent staking events
   */
  async getRecentStakes(limit: number = 10): Promise<StakeEvent[]> {
    if (!this.stakingAddress) {
      throw new Error('Staking address not configured')
    }

    const currentBlock = await this.client.getBlockNumber()
    const fromBlock = currentBlock - BigInt(10000)

    const logs = await this.client.getLogs({
      address: this.stakingAddress,
      event: {
        type: 'event',
        name: 'Staked',
        inputs: [
          { type: 'address', indexed: true, name: 'user' },
          { type: 'uint256', indexed: false, name: 'amount' },
          { type: 'uint8', indexed: false, name: 'tier' },
          { type: 'uint256', indexed: false, name: 'lockedUntil' }
        ]
      },
      fromBlock,
      toBlock: currentBlock
    })

    return logs.slice(-limit).map(log => ({
      user: log.args.user as Address,
      amount: formatEther(log.args.amount as bigint),
      tier: log.args.tier as number,
      lockedUntil: log.args.lockedUntil as bigint,
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash
    }))
  }

  /**
   * Watch for new transfers (returns unwatch function)
   */
  watchTransfers(callback: (transfer: Transfer) => void): () => void {
    if (!this.tokenAddress) {
      throw new Error('Token address not configured')
    }

    return this.client.watchEvent({
      address: this.tokenAddress,
      event: {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { type: 'address', indexed: true, name: 'from' },
          { type: 'address', indexed: true, name: 'to' },
          { type: 'uint256', indexed: false, name: 'value' }
        ]
      },
      onLogs: (logs) => {
        for (const log of logs) {
          callback({
            from: log.args.from as Address,
            to: log.args.to as Address,
            value: formatEther(log.args.value as bigint),
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash
          })
        }
      }
    })
  }

  /**
   * Watch for new stakes (returns unwatch function)
   */
  watchStakes(callback: (stake: StakeEvent) => void): () => void {
    if (!this.stakingAddress) {
      throw new Error('Staking address not configured')
    }

    return this.client.watchEvent({
      address: this.stakingAddress,
      event: {
        type: 'event',
        name: 'Staked',
        inputs: [
          { type: 'address', indexed: true, name: 'user' },
          { type: 'uint256', indexed: false, name: 'amount' },
          { type: 'uint8', indexed: false, name: 'tier' },
          { type: 'uint256', indexed: false, name: 'lockedUntil' }
        ]
      },
      onLogs: (logs) => {
        for (const log of logs) {
          callback({
            user: log.args.user as Address,
            amount: formatEther(log.args.amount as bigint),
            tier: log.args.tier as number,
            lockedUntil: log.args.lockedUntil as bigint,
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash
          })
        }
      }
    })
  }

  /**
   * Check if contracts are deployed (useful for testing)
   */
  async checkContractsDeployed(): Promise<{
    token: boolean
    staking: boolean
  }> {
    const results = {
      token: false,
      staking: false
    }

    if (this.tokenAddress) {
      try {
        const code = await this.client.getCode({ address: this.tokenAddress })
        results.token = code !== undefined && code !== '0x'
      } catch {
        results.token = false
      }
    }

    if (this.stakingAddress) {
      try {
        const code = await this.client.getCode({ address: this.stakingAddress })
        results.staking = code !== undefined && code !== '0x'
      } catch {
        results.staking = false
      }
    }

    return results
  }

  /**
   * Get health status of the blockchain connection
   */
  async getHealthStatus(): Promise<{
    connected: boolean
    chainId: number
    blockNumber: bigint
    network: NetworkType
    contractsConfigured: boolean
    contractsDeployed: { token: boolean; staking: boolean }
  }> {
    try {
      const chainId = await this.getChainId()
      const blockNumber = await this.getBlockNumber()
      const contractsDeployed = await this.checkContractsDeployed()

      return {
        connected: true,
        chainId,
        blockNumber,
        network: this.network,
        contractsConfigured: this.isConfigured(),
        contractsDeployed
      }
    } catch (error) {
      return {
        connected: false,
        chainId: 0,
        blockNumber: 0n,
        network: this.network,
        contractsConfigured: this.isConfigured(),
        contractsDeployed: { token: false, staking: false }
      }
    }
  }
}

// Singleton instances for different networks
let mainnetService: BlockchainService | null = null
let testnetService: BlockchainService | null = null

export function getBlockchainService(network: NetworkType = 'testnet'): BlockchainService {
  if (network === 'mainnet') {
    if (!mainnetService) {
      mainnetService = new BlockchainService('mainnet')
    }
    return mainnetService
  } else {
    if (!testnetService) {
      testnetService = new BlockchainService('testnet')
    }
    return testnetService
  }
}
