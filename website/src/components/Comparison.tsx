'use client'

import { Check, X, Minus } from 'lucide-react'

const features = [
  {
    name: 'Platform Fee',
    grep: '2.5%',
    steam: '30%',
    appStore: '30%',
    kickstarter: '8-10%',
    highlight: true,
  },
  {
    name: 'Creator Revenue Share',
    grep: '97.5%',
    steam: '70%',
    appStore: '70%',
    kickstarter: '90%',
    highlight: true,
  },
  {
    name: 'Cross-Game Currency',
    grep: true,
    steam: false,
    appStore: false,
    kickstarter: false,
  },
  {
    name: 'Community Governance',
    grep: true,
    steam: false,
    appStore: false,
    kickstarter: false,
  },
  {
    name: 'Staking Rewards',
    grep: 'Up to 20%',
    steam: false,
    appStore: false,
    kickstarter: false,
  },
  {
    name: 'Milestone-Based Funding',
    grep: true,
    steam: false,
    appStore: false,
    kickstarter: 'Partial',
  },
  {
    name: 'NFT/Asset Trading',
    grep: true,
    steam: 'Limited',
    appStore: false,
    kickstarter: false,
  },
  {
    name: 'Decentralized',
    grep: true,
    steam: false,
    appStore: false,
    kickstarter: false,
  },
  {
    name: 'Global Payments',
    grep: true,
    steam: true,
    appStore: true,
    kickstarter: 'Limited',
  },
  {
    name: 'Instant Payouts',
    grep: true,
    steam: false,
    appStore: false,
    kickstarter: false,
  },
]

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-5 h-5 text-grep-green mx-auto" />
    ) : (
      <X className="w-5 h-5 text-red-400 mx-auto" />
    )
  }
  if (value === 'Partial' || value === 'Limited') {
    return <Minus className="w-5 h-5 text-yellow-400 mx-auto" />
  }
  return <span className="font-semibold">{value}</span>
}

export default function Comparison() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dark-800/30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
            Why Choose <span className="text-gradient">GrepCoin?</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            See how we compare to traditional platforms
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Feature</th>
                <th className="py-4 px-6">
                  <div className="inline-flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-playful flex items-center justify-center mb-2">
                      <span className="text-lg font-bold">G</span>
                    </div>
                    <span className="font-display font-bold text-gradient">GrepCoin</span>
                  </div>
                </th>
                <th className="py-4 px-6">
                  <div className="inline-flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center mb-2 text-xl">
                      🎮
                    </div>
                    <span className="text-gray-400">Steam</span>
                  </div>
                </th>
                <th className="py-4 px-6">
                  <div className="inline-flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center mb-2 text-xl">
                      🍎
                    </div>
                    <span className="text-gray-400">App Store</span>
                  </div>
                </th>
                <th className="py-4 px-6">
                  <div className="inline-flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center mb-2 text-xl">
                      🚀
                    </div>
                    <span className="text-gray-400">Kickstarter</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr
                  key={index}
                  className={`border-t border-dark-600/50 ${
                    feature.highlight ? 'bg-grep-purple/5' : ''
                  }`}
                >
                  <td className="py-4 px-6 font-medium">
                    {feature.name}
                    {feature.highlight && (
                      <span className="ml-2 text-xs text-grep-purple">★</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div
                      className={`inline-block ${
                        feature.highlight ? 'text-grep-green font-bold' : ''
                      }`}
                    >
                      <CellValue value={feature.grep} />
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center text-gray-400">
                    <CellValue value={feature.steam} />
                  </td>
                  <td className="py-4 px-6 text-center text-gray-400">
                    <CellValue value={feature.appStore} />
                  </td>
                  <td className="py-4 px-6 text-center text-gray-400">
                    <CellValue value={feature.kickstarter} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom stats */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-grep-purple/10 to-transparent border border-grep-purple/20 text-center">
            <div className="text-4xl font-display font-bold text-grep-purple mb-2">12x</div>
            <div className="text-gray-400">More revenue for creators</div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-grep-pink/10 to-transparent border border-grep-pink/20 text-center">
            <div className="text-4xl font-display font-bold text-grep-pink mb-2">$0</div>
            <div className="text-gray-400">Listing fees</div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-grep-cyan/10 to-transparent border border-grep-cyan/20 text-center">
            <div className="text-4xl font-display font-bold text-grep-cyan mb-2">100%</div>
            <div className="text-gray-400">Community owned</div>
          </div>
        </div>
      </div>
    </section>
  )
}
