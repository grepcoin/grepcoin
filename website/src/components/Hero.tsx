'use client'

import { ArrowRight, Sparkles, Rocket, Coins } from 'lucide-react'
import ParticleBackground from './ParticleBackground'
import { useCountUp } from '@/hooks/useCountUp'

function AnimatedStat({
  end,
  suffix,
  label,
  color,
}: {
  end: number
  suffix: string
  label: string
  color: string
}) {
  const { ref, value } = useCountUp({ end, suffix, duration: 2500 })

  return (
    <div
      ref={ref}
      className="p-6 rounded-2xl bg-dark-700/50 border border-dark-600/50 hover:border-dark-500 transition-all hover:-translate-y-1 group"
    >
      <div
        className={`text-3xl sm:text-4xl font-display font-bold mb-2 bg-gradient-to-r ${color} bg-clip-text text-transparent`}
      >
        {value}
      </div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-grep-purple/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-grep-pink/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-grep-orange/10 rounded-full blur-3xl animate-pulse-slow delay-500" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
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
        <div className="absolute top-1/3 right-10 animate-float delay-700">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-grep-green to-grep-cyan flex items-center justify-center shadow-lg opacity-80">
            <span className="text-lg">🎮</span>
          </div>
        </div>
        <div className="absolute bottom-1/4 right-1/3 animate-float delay-300">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-grep-pink to-grep-purple flex items-center justify-center shadow-lg opacity-70">
            <span className="text-sm">💎</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-700/80 border border-dark-600 mb-8 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-grep-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-grep-green" />
          </span>
          <span className="text-sm text-gray-300">Launching Q1 2025</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-grep-purple/20 text-grep-purple">
            Early Access
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight">
          <span className="text-white">Fund Games.</span>
          <br />
          <span className="text-gradient animate-gradient bg-[length:200%_auto]">
            Play Together.
          </span>
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
            className="group w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-playful font-semibold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg glow-purple hover:scale-105"
          >
            Join Waitlist
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-dark-700/80 border border-dark-600 font-semibold text-lg hover:bg-dark-600 hover:border-dark-500 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
          >
            Read Whitepaper
          </a>
        </div>

        {/* Animated Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
          <AnimatedStat
            end={500}
            suffix="M"
            label="Total Supply"
            color="from-grep-purple to-grep-pink"
          />
          <AnimatedStat
            end={20}
            suffix="%"
            label="Max Staking APY"
            color="from-grep-blue to-grep-cyan"
          />
          <AnimatedStat
            end={2.5}
            suffix="%"
            label="Trading Fee"
            color="from-grep-green to-grep-cyan"
          />
          <AnimatedStat
            end={40}
            suffix="%"
            label="Community Allocation"
            color="from-grep-orange to-grep-yellow"
          />
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
