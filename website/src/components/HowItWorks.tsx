'use client'

import { Wallet, Coins, Gamepad2, Vote, ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Wallet,
    title: 'Connect Wallet',
    description:
      'Connect your wallet to the GrepCoin ecosystem. We support MetaMask, WalletConnect, and all major wallets.',
    color: 'from-grep-purple to-grep-pink',
    glowColor: 'rgba(139, 92, 246, 0.3)',
  },
  {
    number: '02',
    icon: Coins,
    title: 'Get GREP Tokens',
    description:
      'Acquire GREP through our DEX, staking rewards, or by backing projects on the launchpad.',
    color: 'from-grep-pink to-grep-orange',
    glowColor: 'rgba(236, 72, 153, 0.3)',
  },
  {
    number: '03',
    icon: Gamepad2,
    title: 'Explore Ecosystem',
    description:
      'Play games, back projects, trade assets, and earn rewards across the entire ecosystem.',
    color: 'from-grep-orange to-grep-yellow',
    glowColor: 'rgba(249, 115, 22, 0.3)',
  },
  {
    number: '04',
    icon: Vote,
    title: 'Govern & Earn',
    description:
      'Stake your tokens to earn up to 20% APY and vote on ecosystem decisions that shape our future.',
    color: 'from-grep-cyan to-grep-blue',
    glowColor: 'rgba(6, 182, 212, 0.3)',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-dark-800/30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-grep-purple/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get started in minutes. Four simple steps to join the future of indie gaming.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line (desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-grep-purple via-grep-pink via-grep-orange to-grep-cyan -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Card */}
                <div className="relative p-8 rounded-3xl bg-dark-700/80 border border-dark-600/50 hover:border-dark-500 transition-all duration-300 hover:-translate-y-2">
                  {/* Glow effect on hover */}
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                    style={{ background: step.glowColor }}
                  />

                  <div className="relative">
                    {/* Number badge */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-dark-900 border border-dark-600 flex items-center justify-center">
                      <span className={`text-lg font-display font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                        {step.number}
                      </span>
                    </div>

                    {/* Icon */}
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                      style={{ boxShadow: `0 0 30px ${step.glowColor}` }}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-display font-bold mb-3">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {/* Arrow connector (mobile/tablet) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex lg:hidden absolute -bottom-6 left-1/2 -translate-x-1/2 text-gray-600">
                    <ArrowRight className="w-6 h-6 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-playful font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  )
}
