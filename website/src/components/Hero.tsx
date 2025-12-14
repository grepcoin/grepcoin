'use client'

import { ArrowRight, Sparkles, Rocket, Coins } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-grep-purple/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-grep-pink/30 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-grep-orange/20 rounded-full blur-3xl animate-pulse-slow delay-500" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-grep-purple to-grep-pink flex items-center justify-center shadow-lg glow-purple">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="absolute top-40 right-20 animate-float delay-1000">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-grep-cyan to-grep-blue flex items-center justify-center shadow-lg glow-blue">
            <Rocket className="w-7 h-7 text-white" />
          </div>
        </div>
        <div className="absolute bottom-32 left-20 animate-float delay-500">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-grep-orange to-grep-yellow flex items-center justify-center shadow-lg">
            <Coins className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-700/80 border border-dark-600 mb-8">
          <span className="flex h-2 w-2 rounded-full bg-grep-green animate-pulse" />
          <span className="text-sm text-gray-300">Launching Q1 2025</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight">
          <span className="text-white">Fund Games.</span>
          <br />
          <span className="text-gradient">Play Together.</span>
          <br />
          <span className="text-white">Own the Future.</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          The decentralized ecosystem for indie games and hobby projects.
          <span className="text-white"> Back creators, earn rewards, </span>
          and own a piece of the gaming revolution.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href="#"
            className="group w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-playful font-semibold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg glow-purple"
          >
            Join Waitlist
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-dark-700/80 border border-dark-600 font-semibold text-lg hover:bg-dark-600 transition-colors flex items-center justify-center gap-2"
          >
            Read Whitepaper
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { value: '500M', label: 'Total Supply', color: 'from-grep-purple to-grep-pink' },
            { value: '20%', label: 'Max Staking APY', color: 'from-grep-blue to-grep-cyan' },
            { value: '2.5%', label: 'Trading Fee', color: 'from-grep-green to-grep-cyan' },
            { value: '40%', label: 'Community Allocation', color: 'from-grep-orange to-grep-yellow' },
          ].map((stat, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-dark-700/50 border border-dark-600/50 hover:border-dark-500 transition-colors group"
            >
              <div className={`text-3xl sm:text-4xl font-display font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
        <div className="w-6 h-10 rounded-full border-2 border-gray-600 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-gradient-to-b from-grep-purple to-grep-pink rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}
