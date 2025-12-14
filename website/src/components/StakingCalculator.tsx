'use client'

import { useState, useMemo } from 'react'
import { Calculator, TrendingUp, Clock, Coins } from 'lucide-react'

const tiers = [
  { name: 'Flexible', days: 0, apy: 5, color: 'from-gray-500 to-gray-600' },
  { name: 'Bronze', days: 30, apy: 8, color: 'from-amber-600 to-amber-700' },
  { name: 'Silver', days: 90, apy: 12, color: 'from-gray-300 to-gray-400' },
  { name: 'Gold', days: 180, apy: 15, color: 'from-yellow-400 to-yellow-500' },
  { name: 'Diamond', days: 365, apy: 20, color: 'from-cyan-300 to-blue-400' },
]

export default function StakingCalculator() {
  const [amount, setAmount] = useState(10000)
  const [selectedTier, setSelectedTier] = useState(2) // Silver default
  const [duration, setDuration] = useState(12) // months

  const calculations = useMemo(() => {
    const tier = tiers[selectedTier]
    const monthlyRate = tier.apy / 100 / 12

    // Simple interest
    const simpleRewards = amount * (tier.apy / 100) * (duration / 12)

    // Compound interest (monthly)
    const compoundTotal = amount * Math.pow(1 + monthlyRate, duration)
    const compoundRewards = compoundTotal - amount

    // Daily rewards
    const dailyRewards = (amount * tier.apy) / 100 / 365

    return {
      simpleRewards,
      compoundRewards,
      compoundTotal,
      dailyRewards,
      monthlyRewards: simpleRewards / duration,
      apy: tier.apy,
    }
  }, [amount, selectedTier, duration])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
    }).format(num)
  }

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-grep-purple/20 border border-grep-purple/30 mb-6">
            <Calculator className="w-4 h-4 text-grep-purple" />
            <span className="text-sm text-grep-purple font-medium">Interactive Calculator</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
            Calculate Your <span className="text-gradient">Rewards</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            See how much you could earn by staking GREP tokens
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="p-8 rounded-3xl bg-dark-700/50 border border-dark-600/50">
            {/* Amount Input */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Stake Amount (GREP)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  className="w-full px-4 py-4 rounded-xl bg-dark-800 border border-dark-600 focus:border-grep-purple focus:outline-none focus:ring-2 focus:ring-grep-purple/20 text-2xl font-display font-bold transition-all"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  GREP
                </div>
              </div>
              {/* Quick amounts */}
              <div className="flex gap-2 mt-3">
                {[1000, 10000, 50000, 100000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      amount === val
                        ? 'bg-grep-purple text-white'
                        : 'bg-dark-600 text-gray-400 hover:bg-dark-500'
                    }`}
                  >
                    {val >= 1000 ? `${val / 1000}K` : val}
                  </button>
                ))}
              </div>
            </div>

            {/* Tier Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Staking Tier
              </label>
              <div className="grid grid-cols-5 gap-2">
                {tiers.map((tier, index) => (
                  <button
                    key={tier.name}
                    onClick={() => setSelectedTier(index)}
                    className={`p-3 rounded-xl text-center transition-all ${
                      selectedTier === index
                        ? 'bg-dark-600 border-2 border-grep-purple'
                        : 'bg-dark-800 border-2 border-transparent hover:border-dark-500'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tier.color} mx-auto mb-2`}
                    />
                    <div className="text-xs font-medium">{tier.name}</div>
                    <div className="text-xs text-grep-green">{tier.apy}%</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Slider */}
            <div>
              <div className="flex justify-between mb-3">
                <label className="text-sm font-medium text-gray-400">
                  Staking Duration
                </label>
                <span className="text-sm font-bold text-grep-purple">
                  {duration} months
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="36"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-2 bg-dark-600 rounded-full appearance-none cursor-pointer accent-grep-purple"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>1 month</span>
                <span>36 months</span>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-4">
            {/* Main Result */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-grep-purple/20 to-grep-pink/20 border border-grep-purple/30">
              <div className="text-sm text-gray-400 mb-2">Estimated Rewards</div>
              <div className="text-5xl font-display font-bold text-gradient mb-2">
                +{formatNumber(calculations.compoundRewards)}
              </div>
              <div className="text-gray-400">
                GREP after {duration} months (compounded)
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="text-sm text-gray-400 mb-1">Total Value</div>
                <div className="text-2xl font-display font-bold">
                  {formatNumber(calculations.compoundTotal)} GREP
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-dark-700/50 border border-dark-600/50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-grep-green" />
                  <span className="text-sm text-gray-400">APY</span>
                </div>
                <div className="text-2xl font-display font-bold text-grep-green">
                  {calculations.apy}%
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-dark-700/50 border border-dark-600/50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-grep-cyan" />
                  <span className="text-sm text-gray-400">Lock Period</span>
                </div>
                <div className="text-2xl font-display font-bold text-grep-cyan">
                  {tiers[selectedTier].days} days
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-dark-700/50 border border-dark-600/50">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-4 h-4 text-grep-orange" />
                  <span className="text-sm text-gray-400">Daily Rewards</span>
                </div>
                <div className="text-2xl font-display font-bold text-grep-orange">
                  +{formatNumber(calculations.dailyRewards)}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-dark-700/50 border border-dark-600/50">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-4 h-4 text-grep-pink" />
                  <span className="text-sm text-gray-400">Monthly Rewards</span>
                </div>
                <div className="text-2xl font-display font-bold text-grep-pink">
                  +{formatNumber(calculations.monthlyRewards)}
                </div>
              </div>
            </div>

            {/* CTA */}
            <button className="w-full py-4 rounded-xl bg-gradient-playful font-semibold text-lg hover:opacity-90 transition-opacity">
              Start Staking
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
