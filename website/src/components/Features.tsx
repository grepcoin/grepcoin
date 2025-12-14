'use client'

import {
  Gamepad2,
  Rocket,
  Coins,
  Users,
  ShoppingBag,
  Vote,
  Zap,
  Shield
} from 'lucide-react'

const features = [
  {
    icon: Rocket,
    title: 'Fund Projects',
    description: 'Back indie games and hobby projects with milestone-based funding. Smart contracts protect your investment.',
    color: 'from-grep-purple to-grep-pink',
    glow: 'glow-purple',
  },
  {
    icon: Gamepad2,
    title: 'Cross-Game Economy',
    description: 'One token across all ecosystem games. Earn, spend, and trade GREP wherever you play.',
    color: 'from-grep-pink to-grep-orange',
    glow: 'glow-pink',
  },
  {
    icon: Coins,
    title: 'Stake & Earn',
    description: '5 staking tiers with up to 20% APY. Lock longer, earn more. Compound your rewards automatically.',
    color: 'from-grep-orange to-grep-yellow',
    glow: 'glow-purple',
  },
  {
    icon: ShoppingBag,
    title: 'Trade Assets',
    description: 'Buy, sell, and trade in-game items across the ecosystem. Only 2.5% fees—not 30%.',
    color: 'from-grep-cyan to-grep-blue',
    glow: 'glow-blue',
  },
  {
    icon: Vote,
    title: 'Govern Together',
    description: 'Your tokens, your voice. Vote on ecosystem grants, new projects, and protocol upgrades.',
    color: 'from-grep-blue to-grep-purple',
    glow: 'glow-blue',
  },
  {
    icon: Users,
    title: 'Creator First',
    description: 'Creators keep 97.5% of revenue. Direct relationships with your community, no middlemen.',
    color: 'from-grep-green to-grep-cyan',
    glow: 'glow-blue',
  },
]

const highlights = [
  { icon: Zap, text: 'Sub-second transactions' },
  { icon: Shield, text: 'Audited smart contracts' },
  { icon: Coins, text: 'Multi-chain support' },
]

export default function Features() {
  return (
    <section id="features" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-dark-800/50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6">
            Everything You Need to
            <span className="text-gradient"> Level Up</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A complete ecosystem for creators and players. Fund, play, earn, and govern—all in one place.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-3xl bg-dark-700/50 border border-dark-600/50 hover:border-dark-500 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.glow}`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-display font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Highlights Bar */}
        <div className="flex flex-wrap justify-center gap-8 p-6 rounded-2xl bg-dark-700/30 border border-dark-600/30">
          {highlights.map((highlight, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-grep-purple/20 to-grep-pink/20 flex items-center justify-center">
                <highlight.icon className="w-5 h-5 text-grep-purple" />
              </div>
              <span className="text-gray-300 font-medium">{highlight.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
