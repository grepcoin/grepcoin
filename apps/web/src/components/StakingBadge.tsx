'use client'

import { useState } from 'react'
import { useStaking } from '@/context/StakingContext'
import { Coins, Zap, TrendingUp, Wallet, ChevronDown, ChevronUp, Trophy, Sparkles } from 'lucide-react'

interface StakingBadgeProps {
  compact?: boolean
  showEarnings?: boolean
}

export default function StakingBadge({ compact = false, showEarnings = true }: StakingBadgeProps) {
  const {
    isConnected,
    walletAddress,
    stakedAmount,
    stakingTier,
    multiplier,
    tierInfo,
    totalEarned,
    todayEarned,
    dailyPlaysLeft,
    maxDailyPlays,
    connectWallet,
    disconnectWallet,
  } = useStaking()

  const [expanded, setExpanded] = useState(false)

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  if (!isConnected) {
    return (
      <button
        onClick={connectWallet}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-grep-purple to-grep-pink font-semibold hover:opacity-90 transition-opacity"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </button>
    )
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {/* Multiplier badge */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ backgroundColor: `${tierInfo.color}20`, borderColor: tierInfo.color, borderWidth: 1 }}
        >
          <span className="text-lg">{tierInfo.icon}</span>
          <span className="font-bold" style={{ color: tierInfo.color }}>
            {multiplier.toFixed(2)}x
          </span>
        </div>

        {showEarnings && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-grep-green/20 border border-grep-green/30">
            <Coins className="w-4 h-4 text-grep-yellow" />
            <span className="font-bold text-grep-green">{formatNumber(todayEarned)}</span>
          </div>
        )}

        {/* Plays left */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-700/50">
          <Zap className="w-4 h-4 text-grep-orange" />
          <span className="text-sm">
            <span className="font-bold">{dailyPlaysLeft}</span>
            <span className="text-gray-400">/{maxDailyPlays}</span>
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark-800/50 rounded-2xl border border-dark-700 overflow-hidden">
      {/* Main bar - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-dark-700/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          {/* Tier badge */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${tierInfo.color}20` }}
          >
            {tierInfo.icon}
          </div>

          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-bold" style={{ color: tierInfo.color }}>
                {tierInfo.name}
              </span>
              {stakingTier !== 'none' && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-grep-purple/20 text-grep-purple">
                  {tierInfo.apy}% APY
                </span>
              )}
            </div>
            <div className="text-sm text-gray-400">
              {walletAddress && formatAddress(walletAddress)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Multiplier */}
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-grep-yellow" />
              <span className="text-xl font-bold text-gradient">{multiplier.toFixed(2)}x</span>
            </div>
            <div className="text-xs text-gray-400">Reward Boost</div>
          </div>

          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-dark-700">
          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Staked amount */}
            <div className="p-3 rounded-xl bg-dark-700/30">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                Staked
              </div>
              <div className="text-lg font-bold">
                {formatNumber(stakedAmount)} <span className="text-grep-purple text-sm">GREP</span>
              </div>
            </div>

            {/* Today's earnings */}
            <div className="p-3 rounded-xl bg-dark-700/30">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                <Coins className="w-4 h-4" />
                Today
              </div>
              <div className="text-lg font-bold text-grep-green">
                +{formatNumber(todayEarned)} <span className="text-sm">GREP</span>
              </div>
            </div>

            {/* Total earnings */}
            <div className="p-3 rounded-xl bg-dark-700/30">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                <Trophy className="w-4 h-4" />
                Total Earned
              </div>
              <div className="text-lg font-bold">
                {formatNumber(totalEarned)} <span className="text-grep-green text-sm">GREP</span>
              </div>
            </div>

            {/* Daily plays */}
            <div className="p-3 rounded-xl bg-dark-700/30">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                <Zap className="w-4 h-4" />
                Daily Plays
              </div>
              <div className="text-lg font-bold">
                {dailyPlaysLeft} <span className="text-gray-400 text-sm">/ {maxDailyPlays}</span>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-grep-orange to-grep-yellow transition-all"
                  style={{ width: `${(dailyPlaysLeft / maxDailyPlays) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Multiplier breakdown */}
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-grep-purple/10 to-grep-pink/10 border border-grep-purple/20">
            <div className="text-sm text-gray-400 mb-2">Multiplier Breakdown</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Base Rate</span>
                <span className="font-mono">1.00x</span>
              </div>
              {stakingTier !== 'none' && (
                <div className="flex justify-between text-grep-purple">
                  <span>{tierInfo.name} Bonus</span>
                  <span className="font-mono">+{((multiplier - 1) * 100).toFixed(0)}%</span>
                </div>
              )}
              <div className="border-t border-dark-600 pt-1 mt-1 flex justify-between font-bold">
                <span>Total Multiplier</span>
                <span className="text-gradient font-mono">{multiplier.toFixed(2)}x</span>
              </div>
            </div>
          </div>

          {/* Tier upgrade hint */}
          {stakingTier !== 'diamond' && (
            <div className="mt-4 text-center text-sm text-gray-400">
              Stake more GREP to unlock higher tiers and bigger multipliers!
            </div>
          )}

          {/* Disconnect button */}
          <button
            onClick={disconnectWallet}
            className="mt-4 w-full py-2 rounded-xl bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600 transition-colors text-sm"
          >
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  )
}

// Floating multiplier indicator for in-game display
export function MultiplierIndicator() {
  const { isConnected, multiplier, tierInfo, stakingTier } = useStaking()

  if (!isConnected || stakingTier === 'none') return null

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full animate-pulse"
      style={{
        backgroundColor: `${tierInfo.color}30`,
        border: `1px solid ${tierInfo.color}50`,
      }}
    >
      <span className="text-sm">{tierInfo.icon}</span>
      <span className="font-bold text-sm" style={{ color: tierInfo.color }}>
        {multiplier.toFixed(1)}x
      </span>
    </div>
  )
}

// Game over earnings display with multiplier
export function EarningsDisplay({ baseEarnings }: { baseEarnings: number }) {
  const { isConnected, multiplier, tierInfo, stakingTier, addEarnings } = useStaking()

  const boostedEarnings = Math.floor(baseEarnings * multiplier)
  const bonusEarnings = boostedEarnings - baseEarnings

  // Add earnings on mount
  useState(() => {
    if (isConnected) {
      addEarnings(baseEarnings)
    }
  })

  return (
    <div className="text-center space-y-4">
      <div className="text-lg text-gray-400">Earnings</div>

      <div className="flex items-center justify-center gap-3">
        <Coins className="w-8 h-8 text-grep-yellow" />
        <span className="text-4xl font-bold text-grep-green">
          +{boostedEarnings}
        </span>
        <span className="text-xl text-grep-green">GREP</span>
      </div>

      {isConnected && stakingTier !== 'none' && bonusEarnings > 0 && (
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ backgroundColor: `${tierInfo.color}20` }}
        >
          <span>{tierInfo.icon}</span>
          <span style={{ color: tierInfo.color }}>
            +{bonusEarnings} bonus from {tierInfo.name} ({multiplier.toFixed(1)}x)
          </span>
        </div>
      )}

      {!isConnected && (
        <div className="text-sm text-gray-400">
          Connect wallet and stake to earn up to 2.5x more!
        </div>
      )}
    </div>
  )
}
