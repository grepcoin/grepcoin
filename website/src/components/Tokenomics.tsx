'use client'

import { Flame, Lock, TrendingUp } from 'lucide-react'

const allocations = [
  { name: 'Community & Ecosystem', percentage: 40, tokens: '200M', color: '#8B5CF6' },
  { name: 'Development Fund', percentage: 20, tokens: '100M', color: '#EC4899' },
  { name: 'Team & Founders', percentage: 15, tokens: '75M', color: '#F97316' },
  { name: 'Liquidity Pool', percentage: 10, tokens: '50M', color: '#06B6D4' },
  { name: 'Early Supporters', percentage: 10, tokens: '50M', color: '#10B981' },
  { name: 'Advisors', percentage: 5, tokens: '25M', color: '#F59E0B' },
]

const stakingTiers = [
  { tier: 'Flexible', lock: '0 days', apy: '5%', color: 'from-gray-500 to-gray-600' },
  { tier: 'Bronze', lock: '30 days', apy: '8%', color: 'from-amber-700 to-amber-800' },
  { tier: 'Silver', lock: '90 days', apy: '12%', color: 'from-gray-300 to-gray-400' },
  { tier: 'Gold', lock: '180 days', apy: '15%', color: 'from-yellow-400 to-yellow-500' },
  { tier: 'Diamond', lock: '365 days', apy: '20%', color: 'from-cyan-300 to-blue-400' },
]

export default function Tokenomics() {
  // Calculate cumulative percentages for pie chart
  let cumulative = 0
  const segments = allocations.map((item) => {
    const start = cumulative
    cumulative += item.percentage
    return { ...item, start, end: cumulative }
  })

  return (
    <section id="tokenomics" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6">
            <span className="text-gradient">Tokenomics</span> Built to Last
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            500 million GREP tokens with fair distribution, deflationary mechanics, and community-first allocation.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Pie Chart */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto relative">
              {/* SVG Pie Chart */}
              <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                {segments.map((segment, index) => {
                  const radius = 40
                  const circumference = 2 * Math.PI * radius
                  const strokeDasharray = `${(segment.percentage / 100) * circumference} ${circumference}`
                  const strokeDashoffset = -((segment.start / 100) * circumference)

                  return (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="none"
                      stroke={segment.color}
                      strokeWidth="20"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500 hover:opacity-80"
                    />
                  )
                })}
              </svg>

              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-display font-bold text-gradient">500M</div>
                  <div className="text-gray-400">Total Supply</div>
                </div>
              </div>
            </div>
          </div>

          {/* Allocation List */}
          <div className="space-y-4">
            {allocations.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl bg-dark-700/50 border border-dark-600/50 hover:border-dark-500 transition-colors"
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-400">{item.tokens} GREP</div>
                </div>
                <div className="text-2xl font-display font-bold" style={{ color: item.color }}>
                  {item.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staking Tiers */}
        <div className="mb-16">
          <h3 className="text-2xl font-display font-bold text-center mb-8">
            Staking Tiers - <span className="text-gradient-blue">Earn Up to 20% APY</span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stakingTiers.map((tier, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-dark-700/50 border border-dark-600/50 hover:border-dark-500 transition-all hover:-translate-y-1 text-center group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} mx-auto mb-4 group-hover:scale-110 transition-transform`} />
                <div className="font-display font-bold mb-1">{tier.tier}</div>
                <div className="text-sm text-gray-400 mb-3">{tier.lock}</div>
                <div className="text-2xl font-display font-bold text-grep-green">{tier.apy}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Deflationary Mechanics */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-display font-bold mb-2">Transaction Burns</h4>
            <p className="text-gray-400 text-sm">1% of marketplace fees are burned forever, reducing supply over time.</p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-display font-bold mb-2">Buyback & Burn</h4>
            <p className="text-gray-400 text-sm">10% of platform revenue buys back GREP from the market and burns it.</p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-display font-bold mb-2">Staking Locks</h4>
            <p className="text-gray-400 text-sm">Staked tokens are removed from circulation, reducing sell pressure.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
