'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Rocket,
  Target,
  Users,
  Shield,
  Coins,
  Gamepad2,
  Heart,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Gift,
  Star,
  Loader2
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface FundraiseData {
  campaign: {
    totalRaised: number
    backerCount: number
    goalAmount: number
    progressPercent: number
    daysRemaining: number
    isActive: boolean
  }
  recentBackers: Array<{
    name: string | null
    tier: string
    amount: number
    message: string | null
    confirmedAt: string
  }>
}

const fundingGoals = [
  { name: 'Security Audit', amount: 8000, description: 'Professional smart contract audit' },
  { name: 'Initial Liquidity', amount: 15000, description: 'GREP/ETH trading pool' },
  { name: 'Legal Review', amount: 5000, description: 'Token compliance review' },
  { name: 'Marketing', amount: 4000, description: 'Community growth campaigns' },
  { name: 'Infrastructure', amount: 2000, description: '6 months hosting & RPC' },
  { name: 'Contingency', amount: 1000, description: 'Unexpected costs' },
]

const rewardTiers = [
  {
    name: 'Supporter',
    price: 10,
    tokens: 0,
    perks: ['Discord supporter role', 'Name in credits', 'Early announcements'],
    color: 'from-gray-500 to-gray-600',
    popular: false,
  },
  {
    name: 'Early Gamer',
    price: 25,
    tokens: 500,
    perks: ['500 GREP tokens', 'All Supporter perks', 'Beta tester access'],
    color: 'from-green-500 to-green-600',
    popular: false,
  },
  {
    name: 'Bronze Backer',
    price: 50,
    tokens: 1200,
    perks: ['1,200 GREP tokens', 'Exclusive NFT avatar', 'All previous perks'],
    color: 'from-amber-600 to-amber-700',
    popular: false,
  },
  {
    name: 'Silver Staker',
    price: 100,
    tokens: 2800,
    perks: ['2,800 GREP tokens', 'Rare NFT collectible', 'Private Discord channel', 'All previous perks'],
    color: 'from-gray-300 to-gray-400',
    popular: true,
  },
  {
    name: 'Gold Founder',
    price: 250,
    tokens: 8000,
    perks: ['8,000 GREP tokens', 'Legendary NFT', 'Founder badge forever', 'Governance voting rights', 'All previous perks'],
    color: 'from-yellow-400 to-yellow-500',
    popular: false,
  },
  {
    name: 'Diamond OG',
    price: 500,
    tokens: 20000,
    perks: ['20,000 GREP tokens', '1-of-50 Genesis NFT', 'Monthly founder calls', 'Feature requests priority', 'All previous perks'],
    color: 'from-cyan-400 to-blue-500',
    popular: false,
  },
  {
    name: 'Whale',
    price: 1000,
    tokens: 50000,
    perks: ['50,000 GREP tokens', 'Custom in-game character', 'Personal Discord channel', 'Direct team access', 'All previous perks'],
    color: 'from-purple-500 to-purple-600',
    popular: false,
  },
  {
    name: 'Arcade Partner',
    price: 2500,
    tokens: 150000,
    perks: ['150,000 GREP tokens', 'Your game on platform', 'Revenue sharing', 'Co-marketing', 'All previous perks'],
    color: 'from-grep-orange to-grep-yellow',
    popular: false,
  },
]

const milestones = [
  { amount: 10000, label: '$10K', description: 'Development continues', achieved: false },
  { amount: 20000, label: '$20K', description: 'Security audit funded', achieved: false },
  { amount: 35000, label: '$35K', description: 'Full launch funded', achieved: false },
  { amount: 50000, label: '$50K', description: 'Tournament prize pool', achieved: false },
]

export default function FundraisePage() {
  const [data, setData] = useState<FundraiseData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/fundraise')
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (error) {
        console.error('Failed to fetch fundraise data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Use dynamic data or fallback to defaults
  const totalGoal = data?.campaign.goalAmount || 35000
  const currentRaised = data?.campaign.totalRaised || 0
  const progress = data?.campaign.progressPercent || 0
  const backers = data?.campaign.backerCount || 0
  const daysLeft = data?.campaign.daysRemaining || 30

  return (
    <main className="min-h-screen bg-dark-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-grep-purple/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-grep-orange/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-grep-purple/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-grep-green/20 border border-grep-green/30 mb-6">
              <Rocket className="w-4 h-4 text-grep-green" />
              <span className="text-sm text-grep-green font-medium">Community Fundraise</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              Help Launch{' '}
              <span className="bg-gradient-to-r from-grep-orange via-grep-yellow to-grep-green bg-clip-text text-transparent">
                GrepCoin
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Join us in building the future of crypto gaming. Back our campaign to fund security audits,
              initial liquidity, and community growth.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://indiegogo.com/projects/grepcoin"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-grep-orange to-grep-yellow text-dark-900 font-bold text-lg hover:opacity-90 transition-opacity"
              >
                <Heart className="w-5 h-5" />
                Back on Indiegogo
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/sponsors/grepcoin"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-dark-800 border border-dark-700 text-white font-bold text-lg hover:border-grep-purple/50 transition-colors"
              >
                <Star className="w-5 h-5" />
                GitHub Sponsors
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-12 border-y border-dark-700">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-grep-green mb-2" />
                ) : (
                  <div className="text-4xl font-display font-bold text-grep-green mb-2">
                    ${currentRaised.toLocaleString()}
                  </div>
                )}
                <div className="text-gray-400">raised of ${totalGoal.toLocaleString()} goal</div>
              </div>
              <div className="text-center">
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-white mb-2" />
                ) : (
                  <div className="text-4xl font-display font-bold text-white mb-2">
                    {backers}
                  </div>
                )}
                <div className="text-gray-400">backers</div>
              </div>
              <div className="text-center">
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-grep-orange mb-2" />
                ) : (
                  <div className="text-4xl font-display font-bold text-grep-orange mb-2">
                    {daysLeft}
                  </div>
                )}
                <div className="text-gray-400">days left</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="h-4 bg-dark-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-grep-orange to-grep-green rounded-full"
                />
              </div>

              {/* Milestones */}
              <div className="flex justify-between mt-2">
                {milestones.map((milestone, index) => (
                  <div
                    key={milestone.amount}
                    className="text-center"
                    style={{ width: `${(milestone.amount / 50000) * 100}%`, marginLeft: index === 0 ? 0 : 'auto' }}
                  >
                    <div className={`text-xs ${milestone.achieved ? 'text-grep-green' : 'text-gray-500'}`}>
                      {milestone.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We're Building */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              What We&apos;re Building
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              GrepCoin is an open-source crypto arcade built entirely through human-AI collaboration.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Gamepad2, title: '8 Arcade Games', desc: 'Developer-themed play-to-earn games' },
              { icon: Shield, title: '47 Tests Passing', desc: 'Battle-tested smart contracts' },
              { icon: Coins, title: 'GREP Token', desc: 'Earn, stake, and govern' },
              { icon: Users, title: 'Open Source', desc: 'MIT licensed, community-owned' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-dark-800/50 rounded-xl p-6 border border-dark-700 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-grep-purple/20 to-grep-orange/20 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-grep-orange" />
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fund Allocation */}
      <section className="py-20 bg-dark-800/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              How Funds Will Be Used
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              100% transparency on where your contribution goes.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto grid gap-4">
            {fundingGoals.map((goal, index) => (
              <motion.div
                key={goal.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 bg-dark-800/50 rounded-xl p-4 border border-dark-700"
              >
                <div className="w-16 text-right">
                  <span className="text-grep-green font-bold">${goal.amount.toLocaleString()}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">{goal.name}</div>
                  <div className="text-sm text-gray-400">{goal.description}</div>
                </div>
                <div className="w-24">
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-grep-orange to-grep-green rounded-full"
                      style={{ width: `${(goal.amount / totalGoal) * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reward Tiers */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Backer Rewards
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Get exclusive perks and GREP tokens for supporting our launch.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rewardTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className={`relative bg-dark-800/50 rounded-2xl border ${tier.popular ? 'border-grep-orange' : 'border-dark-700'} overflow-hidden`}
              >
                {tier.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-grep-orange to-grep-yellow text-dark-900 text-xs font-bold text-center py-1">
                    MOST POPULAR
                  </div>
                )}

                <div className={`h-2 bg-gradient-to-r ${tier.color}`} />

                <div className="p-6">
                  <h3 className="font-display font-bold text-lg mb-1">{tier.name}</h3>
                  <div className="text-3xl font-bold mb-4">${tier.price}</div>

                  {tier.tokens > 0 && (
                    <div className="flex items-center gap-2 mb-4 text-grep-green">
                      <Coins className="w-4 h-4" />
                      <span className="font-medium">{tier.tokens.toLocaleString()} GREP</span>
                    </div>
                  )}

                  <ul className="space-y-2 mb-6">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-grep-green flex-shrink-0 mt-0.5" />
                        {perk}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={`https://indiegogo.com/projects/grepcoin/contributions/new?perk_amt=${tier.price}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full py-3 rounded-xl text-center font-medium transition-opacity hover:opacity-90 ${
                      tier.popular
                        ? 'bg-gradient-to-r from-grep-orange to-grep-yellow text-dark-900'
                        : 'bg-dark-700 text-white'
                    }`}
                  >
                    Select
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-dark-800/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Roadmap to Launch
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {[
              { phase: 'Now', title: 'Fundraise', items: ['Indiegogo campaign', 'Community building', 'GitHub sponsors'], active: true },
              { phase: 'Month 1', title: 'Audit & Test', items: ['Security audit', 'Testnet deployment', 'Beta testing'], active: false },
              { phase: 'Month 2', title: 'Launch', items: ['Mainnet deployment', 'Token generation', 'DEX liquidity'], active: false },
              { phase: 'Month 3+', title: 'Grow', items: ['DAO governance', 'New games', 'Mobile apps'], active: false },
            ].map((phase, index) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-6 mb-8"
              >
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    phase.active
                      ? 'bg-gradient-to-br from-grep-orange to-grep-yellow'
                      : 'bg-dark-700'
                  }`}>
                    {phase.active ? <Sparkles className="w-5 h-5 text-dark-900" /> : <Clock className="w-5 h-5 text-gray-400" />}
                  </div>
                  {index < 3 && <div className="w-0.5 h-full bg-dark-700 mt-2" />}
                </div>
                <div className="flex-1 pb-8">
                  <div className="text-sm text-grep-orange font-medium mb-1">{phase.phase}</div>
                  <h3 className="text-xl font-bold mb-3">{phase.title}</h3>
                  <ul className="space-y-2">
                    {phase.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-grep-purple/20 border border-grep-purple/30 mb-6">
              <Gift className="w-4 h-4 text-grep-purple" />
              <span className="text-sm text-grep-purple font-medium">Limited Time</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Be Part of Gaming History
            </h2>

            <p className="text-xl text-gray-400 mb-8">
              GrepCoin is the first crypto arcade built entirely with AI collaboration.
              Back us now to get exclusive rewards and be among the first to earn GREP.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://indiegogo.com/projects/grepcoin"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-grep-orange to-grep-yellow text-dark-900 font-bold text-lg hover:opacity-90 transition-opacity"
              >
                <Heart className="w-5 h-5" />
                Back This Project
              </a>
              <Link
                href="/games"
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-dark-800 border border-dark-700 text-white font-bold text-lg hover:border-grep-purple/50 transition-colors"
              >
                <Gamepad2 className="w-5 h-5" />
                Try the Games
              </Link>
            </div>

            <p className="mt-8 text-sm text-gray-500">
              GREP tokens are utility tokens for use within the GrepCoin ecosystem.
              Not financial advice. See our <Link href="/disclaimer" className="text-grep-purple hover:underline">risk disclaimer</Link>.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
