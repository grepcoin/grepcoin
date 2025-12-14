'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getStakingMultiplier } from '@/lib/gameUtils'

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
}

interface StakingContextType extends StakingState {
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  addEarnings: (amount: number) => void
  decrementPlays: () => boolean
  resetDailyPlays: () => void
}

const TIER_INFO: Record<StakingTier, { name: string; color: string; icon: string; minStake: number; apy: number }> = {
  none: { name: 'No Stake', color: '#6B7280', icon: '📭', minStake: 0, apy: 0 },
  flexible: { name: 'Flexible', color: '#10B981', icon: '🌱', minStake: 100, apy: 5 },
  bronze: { name: 'Bronze', color: '#CD7F32', icon: '🥉', minStake: 1000, apy: 8 },
  silver: { name: 'Silver', color: '#C0C0C0', icon: '🥈', minStake: 5000, apy: 12 },
  gold: { name: 'Gold', color: '#FFD700', icon: '🥇', minStake: 10000, apy: 15 },
  diamond: { name: 'Diamond', color: '#B9F2FF', icon: '💎', minStake: 50000, apy: 20 },
}

const StakingContext = createContext<StakingContextType | null>(null)

export function StakingProvider({ children }: { children: ReactNode }) {
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
  })

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('grepcoin_staking')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const tier = parsed.stakingTier as StakingTier
          setState({
            ...parsed,
            tierInfo: TIER_INFO[tier] || TIER_INFO.none,
            multiplier: getStakingMultiplier(parsed.stakedAmount, tier),
          })
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

  const connectWallet = async () => {
    // Simulate wallet connection - in production, use ethers.js or wagmi
    // For demo, we'll generate a mock wallet and random staking
    const mockAddress = '0x' + Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')

    // Random staking tier for demo
    const tiers: StakingTier[] = ['none', 'flexible', 'bronze', 'silver', 'gold', 'diamond']
    const randomTier = tiers[Math.floor(Math.random() * tiers.length)]
    const tierMinStake = TIER_INFO[randomTier].minStake
    const stakedAmount = tierMinStake > 0 ? tierMinStake + Math.floor(Math.random() * tierMinStake) : 0

    // Calculate bonus plays based on tier
    const bonusPlays = {
      none: 0,
      flexible: 2,
      bronze: 5,
      silver: 10,
      gold: 15,
      diamond: 25,
    }

    const maxPlays = 10 + bonusPlays[randomTier]

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
    })
  }

  const disconnectWallet = () => {
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
    })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('grepcoin_staking')
    }
  }

  const addEarnings = (amount: number) => {
    const boostedAmount = Math.floor(amount * state.multiplier)
    setState(prev => ({
      ...prev,
      totalEarned: prev.totalEarned + boostedAmount,
      todayEarned: prev.todayEarned + boostedAmount,
    }))
  }

  const decrementPlays = (): boolean => {
    if (state.dailyPlaysLeft <= 0) return false
    setState(prev => ({
      ...prev,
      dailyPlaysLeft: prev.dailyPlaysLeft - 1,
    }))
    return true
  }

  const resetDailyPlays = () => {
    setState(prev => ({
      ...prev,
      dailyPlaysLeft: prev.maxDailyPlays,
      todayEarned: 0,
    }))
  }

  return (
    <StakingContext.Provider value={{
      ...state,
      connectWallet,
      disconnectWallet,
      addEarnings,
      decrementPlays,
      resetDailyPlays,
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
