'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { getStakingMultiplier } from '@/lib/gameUtils'
import {
  CONTRACTS,
  GREP_TOKEN_ABI,
  STAKING_POOL_ABI,
  TIER_NAMES,
  areContractsDeployed,
  getContractAddress
} from '@/lib/contracts'

export type StakingTier = 'none' | 'flexible' | 'bronze' | 'silver' | 'gold' | 'diamond'

interface StakingState {
  isConnected: boolean
  walletAddress: string | null
  stakedAmount: number
  stakingTier: StakingTier
  multiplier: number
  tierInfo: {
    name: string
    color: string
    icon: string
    minStake: number
    apy: number
  }
  totalEarned: number
  todayEarned: number
  dailyPlaysLeft: number
  maxDailyPlays: number
  pendingRewards: number
  lockedUntil: number
  isContractMode: boolean
  grepBalance: number
}

interface StakingContextType extends StakingState {
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  addEarnings: (amount: number) => void
  decrementPlays: () => boolean
  resetDailyPlays: () => void
  // Contract interactions
  stakeTokens: (amount: number, tier: number) => Promise<void>
  unstakeTokens: () => Promise<void>
  claimRewards: () => Promise<void>
  approveTokens: (amount: number) => Promise<void>
  isStaking: boolean
  isUnstaking: boolean
  isClaiming: boolean
  isApproving: boolean
  txHash: string | null
}

const TIER_INFO: Record<StakingTier, { name: string; color: string; icon: string; minStake: number; apy: number }> = {
  none: { name: 'No Stake', color: '#6B7280', icon: '📭', minStake: 0, apy: 0 },
  flexible: { name: 'Flexible', color: '#10B981', icon: '🌱', minStake: 100, apy: 5 },
  bronze: { name: 'Bronze', color: '#CD7F32', icon: '🥉', minStake: 1000, apy: 8 },
  silver: { name: 'Silver', color: '#C0C0C0', icon: '🥈', minStake: 5000, apy: 12 },
  gold: { name: 'Gold', color: '#FFD700', icon: '🥇', minStake: 10000, apy: 15 },
  diamond: { name: 'Diamond', color: '#B9F2FF', icon: '💎', minStake: 50000, apy: 20 },
}

const BONUS_PLAYS: Record<StakingTier, number> = {
  none: 0,
  flexible: 2,
  bronze: 5,
  silver: 10,
  gold: 15,
  diamond: 25,
}

const StakingContext = createContext<StakingContextType | null>(null)

export function StakingProvider({ children }: { children: ReactNode }) {
  const { address, isConnected: walletConnected } = useAccount()
  const chainId = useChainId()

  const contractsDeployed = areContractsDeployed(chainId)
  const tokenAddress = getContractAddress(chainId, 'GREP_TOKEN') as `0x${string}` | undefined
  const stakingAddress = getContractAddress(chainId, 'STAKING_POOL') as `0x${string}` | undefined

  // Contract read hooks
  const { data: grepBalance } = useReadContract({
    address: tokenAddress,
    abi: GREP_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && contractsDeployed },
  })

  const { data: stakeInfo } = useReadContract({
    address: stakingAddress,
    abi: STAKING_POOL_ABI,
    functionName: 'getStakeInfo',
    args: address ? [address] : undefined,
    query: { enabled: !!address && contractsDeployed },
  })

  const { data: allowance } = useReadContract({
    address: tokenAddress,
    abi: GREP_TOKEN_ABI,
    functionName: 'allowance',
    args: address && stakingAddress ? [address, stakingAddress] : undefined,
    query: { enabled: !!address && !!stakingAddress && contractsDeployed },
  })

  // Contract write hooks
  const { writeContract: writeApprove, data: approveTxHash, isPending: isApproving } = useWriteContract()
  const { writeContract: writeStake, data: stakeTxHash, isPending: isStaking } = useWriteContract()
  const { writeContract: writeUnstake, data: unstakeTxHash, isPending: isUnstaking } = useWriteContract()
  const { writeContract: writeClaim, data: claimTxHash, isPending: isClaiming } = useWriteContract()

  // Wait for transactions
  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({ hash: approveTxHash })
  const { isLoading: isStakeConfirming } = useWaitForTransactionReceipt({ hash: stakeTxHash })
  const { isLoading: isUnstakeConfirming } = useWaitForTransactionReceipt({ hash: unstakeTxHash })
  const { isLoading: isClaimConfirming } = useWaitForTransactionReceipt({ hash: claimTxHash })

  const [txHash, setTxHash] = useState<string | null>(null)

  // Local state (used for mock mode or to augment contract data)
  const [state, setState] = useState<StakingState>({
    isConnected: false,
    walletAddress: null,
    stakedAmount: 0,
    stakingTier: 'none',
    multiplier: 1,
    tierInfo: TIER_INFO.none,
    totalEarned: 0,
    todayEarned: 0,
    dailyPlaysLeft: 10,
    maxDailyPlays: 10,
    pendingRewards: 0,
    lockedUntil: 0,
    isContractMode: false,
    grepBalance: 0,
  })

  // Convert tier number to string
  const tierNumberToString = (tierNum: number): StakingTier => {
    const tiers: StakingTier[] = ['none', 'flexible', 'bronze', 'silver', 'gold', 'diamond']
    return tiers[tierNum] || 'none'
  }

  // Update state from contract data
  useEffect(() => {
    if (walletConnected && address) {
      if (contractsDeployed && stakeInfo) {
        // Use contract data
        const info = stakeInfo as {
          amount: bigint
          tier: number
          stakedAt: bigint
          lockedUntil: bigint
          lastClaimAt: bigint
          totalClaimed: bigint
          pendingReward: bigint
          multiplier: bigint
          bonusPlays: bigint
        }

        const stakedAmount = Number(formatEther(info.amount))
        const tier = tierNumberToString(info.tier)
        const multiplier = Number(info.multiplier) / 10000
        const bonusPlays = Number(info.bonusPlays)
        const maxPlays = 10 + bonusPlays

        setState(prev => ({
          ...prev,
          isConnected: true,
          walletAddress: address,
          stakedAmount,
          stakingTier: tier,
          multiplier,
          tierInfo: TIER_INFO[tier],
          pendingRewards: Number(formatEther(info.pendingReward)),
          lockedUntil: Number(info.lockedUntil) * 1000,
          dailyPlaysLeft: Math.min(prev.dailyPlaysLeft, maxPlays),
          maxDailyPlays: maxPlays,
          isContractMode: true,
          grepBalance: grepBalance ? Number(formatEther(grepBalance as bigint)) : 0,
        }))
      } else {
        // Mock mode - keep existing mock behavior
        setState(prev => ({
          ...prev,
          isConnected: true,
          walletAddress: address,
          isContractMode: false,
        }))
      }
    }
  }, [walletConnected, address, contractsDeployed, stakeInfo, grepBalance])

  // Load local state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('grepcoin_staking')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const tier = parsed.stakingTier as StakingTier
          setState(prev => ({
            ...prev,
            ...parsed,
            tierInfo: TIER_INFO[tier] || TIER_INFO.none,
            multiplier: getStakingMultiplier(parsed.stakedAmount, tier),
          }))
        } catch (e) {
          // Invalid saved state
        }
      }

      // Check if daily plays need reset
      const lastPlayed = localStorage.getItem('grepcoin_last_played')
      const today = new Date().toDateString()
      if (lastPlayed !== today) {
        setState(prev => ({
          ...prev,
          dailyPlaysLeft: prev.maxDailyPlays,
          todayEarned: 0,
        }))
        localStorage.setItem('grepcoin_last_played', today)
      }
    }
  }, [])

  // Save state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && state.isConnected) {
      localStorage.setItem('grepcoin_staking', JSON.stringify({
        isConnected: state.isConnected,
        walletAddress: state.walletAddress,
        stakedAmount: state.stakedAmount,
        stakingTier: state.stakingTier,
        totalEarned: state.totalEarned,
        todayEarned: state.todayEarned,
        dailyPlaysLeft: state.dailyPlaysLeft,
        maxDailyPlays: state.maxDailyPlays,
      }))
    }
  }, [state])

  // Contract interaction functions
  const approveTokens = useCallback(async (amount: number) => {
    if (!tokenAddress || !stakingAddress) return

    writeApprove({
      address: tokenAddress,
      abi: GREP_TOKEN_ABI,
      functionName: 'approve',
      args: [stakingAddress, parseEther(amount.toString())],
    })
  }, [tokenAddress, stakingAddress, writeApprove])

  const stakeTokens = useCallback(async (amount: number, tier: number) => {
    if (!stakingAddress) return

    writeStake({
      address: stakingAddress,
      abi: STAKING_POOL_ABI,
      functionName: 'stake',
      args: [parseEther(amount.toString()), tier],
    })
  }, [stakingAddress, writeStake])

  const unstakeTokens = useCallback(async () => {
    if (!stakingAddress) return

    writeUnstake({
      address: stakingAddress,
      abi: STAKING_POOL_ABI,
      functionName: 'unstake',
      args: [],
    })
  }, [stakingAddress, writeUnstake])

  const claimRewards = useCallback(async () => {
    if (!stakingAddress) return

    writeClaim({
      address: stakingAddress,
      abi: STAKING_POOL_ABI,
      functionName: 'claimRewards',
      args: [],
    })
  }, [stakingAddress, writeClaim])

  // Mock wallet connection (for demo mode when contracts aren't deployed)
  const connectWallet = useCallback(async () => {
    if (contractsDeployed) {
      // In contract mode, wallet connection is handled by wagmi
      return
    }

    // Mock mode - simulate wallet connection
    const mockAddress = '0x' + Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')

    const tiers: StakingTier[] = ['none', 'flexible', 'bronze', 'silver', 'gold', 'diamond']
    const randomTier = tiers[Math.floor(Math.random() * tiers.length)]
    const tierMinStake = TIER_INFO[randomTier].minStake
    const stakedAmount = tierMinStake > 0 ? tierMinStake + Math.floor(Math.random() * tierMinStake) : 0
    const maxPlays = 10 + BONUS_PLAYS[randomTier]

    setState({
      isConnected: true,
      walletAddress: mockAddress,
      stakedAmount,
      stakingTier: randomTier,
      multiplier: getStakingMultiplier(stakedAmount, randomTier),
      tierInfo: TIER_INFO[randomTier],
      totalEarned: Math.floor(Math.random() * 10000),
      todayEarned: 0,
      dailyPlaysLeft: maxPlays,
      maxDailyPlays: maxPlays,
      pendingRewards: 0,
      lockedUntil: 0,
      isContractMode: false,
      grepBalance: Math.floor(Math.random() * 100000),
    })
  }, [contractsDeployed])

  const disconnectWallet = useCallback(() => {
    setState({
      isConnected: false,
      walletAddress: null,
      stakedAmount: 0,
      stakingTier: 'none',
      multiplier: 1,
      tierInfo: TIER_INFO.none,
      totalEarned: 0,
      todayEarned: 0,
      dailyPlaysLeft: 10,
      maxDailyPlays: 10,
      pendingRewards: 0,
      lockedUntil: 0,
      isContractMode: false,
      grepBalance: 0,
    })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('grepcoin_staking')
    }
  }, [])

  const addEarnings = useCallback((amount: number) => {
    const boostedAmount = Math.floor(amount * state.multiplier)
    setState(prev => ({
      ...prev,
      totalEarned: prev.totalEarned + boostedAmount,
      todayEarned: prev.todayEarned + boostedAmount,
    }))
  }, [state.multiplier])

  const decrementPlays = useCallback((): boolean => {
    if (state.dailyPlaysLeft <= 0) return false
    setState(prev => ({
      ...prev,
      dailyPlaysLeft: prev.dailyPlaysLeft - 1,
    }))
    return true
  }, [state.dailyPlaysLeft])

  const resetDailyPlays = useCallback(() => {
    setState(prev => ({
      ...prev,
      dailyPlaysLeft: prev.maxDailyPlays,
      todayEarned: 0,
    }))
  }, [])

  // Track tx hash changes
  useEffect(() => {
    const hash = approveTxHash || stakeTxHash || unstakeTxHash || claimTxHash
    setTxHash(hash || null)
  }, [approveTxHash, stakeTxHash, unstakeTxHash, claimTxHash])

  return (
    <StakingContext.Provider value={{
      ...state,
      connectWallet,
      disconnectWallet,
      addEarnings,
      decrementPlays,
      resetDailyPlays,
      stakeTokens,
      unstakeTokens,
      claimRewards,
      approveTokens,
      isStaking: isStaking || isStakeConfirming,
      isUnstaking: isUnstaking || isUnstakeConfirming,
      isClaiming: isClaiming || isClaimConfirming,
      isApproving: isApproving || isApproveConfirming,
      txHash,
    }}>
      {children}
    </StakingContext.Provider>
  )
}

export function useStaking() {
  const context = useContext(StakingContext)
  if (!context) {
    throw new Error('useStaking must be used within a StakingProvider')
  }
  return context
}
