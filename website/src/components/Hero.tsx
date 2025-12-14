'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, Rocket, Coins, Gamepad2, Play, Trophy } from 'lucide-react'
import ParticleBackground from './ParticleBackground'
import HeroMiniGame from './HeroMiniGame'
import { useCountUp } from '@/hooks/useCountUp'

function AnimatedStat({
  end,
  suffix,
  label,
  color,
  icon,
}: {
  end: number
  suffix: string
  label: string
  color: string
  icon: React.ReactNode
}) {
  const { ref, value } = useCountUp({ end, suffix, duration: 2500 })

  return (
    <div
      ref={ref}
      className="p-4 rounded-2xl bg-dark-700/50 border border-dark-600/50 hover:border-dark-500 transition-all hover:-translate-y-1 group backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 mb-2 text-gray-400">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div
        className={`text-2xl sm:text-3xl font-display font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}
      >
        {value}
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-8">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-grep-purple/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-grep-pink/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-grep-orange/10 rounded-full blur-3xl animate-pulse-slow delay-500" />

        {/* Neon Grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Animated game icons */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-grep-purple to-grep-pink flex items-center justify-center shadow-lg shadow-grep-purple/30 text-3xl">
            🚂
          </div>
        </div>
        <div className="absolute top-32 right-16 animate-float delay-1000">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-grep-orange to-grep-yellow flex items-center justify-center shadow-lg shadow-grep-orange/30 text-2xl">
            📚
          </div>
        </div>
        <div className="absolute bottom-40 left-16 animate-float delay-500">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-grep-green to-grep-cyan flex items-center justify-center shadow-lg shadow-grep-green/30 text-2xl">
            ⛏️
          </div>
        </div>
        <div className="absolute top-1/3 right-8 animate-float delay-700">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-grep-cyan to-grep-blue flex items-center justify-center shadow-lg shadow-grep-cyan/30 text-2xl">
            ⚛️
          </div>
        </div>
        <div className="absolute bottom-1/3 right-1/4 animate-float delay-300">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-grep-pink to-grep-purple flex items-center justify-center shadow-lg opacity-80 text-lg">
            💎
          </div>
        </div>
        <div className="absolute top-1/2 left-8 animate-float delay-200">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-grep-yellow to-grep-orange flex items-center justify-center shadow-lg opacity-70 text-lg">
            🏆
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-700/80 border border-dark-600 mb-6 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-grep-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-grep-green" />
              </span>
              <span className="text-sm text-gray-300">4 Games Live</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-grep-purple/20 text-grep-purple">
                Play to Earn
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight">
              <span className="text-white">Play Games.</span>
              <br />
              <span className="text-gradient animate-gradient bg-[length:200%_auto]">
                Earn Crypto.
              </span>
              <br />
              <span className="text-white">Have Fun.</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-gray-400 max-w-xl mb-8 leading-relaxed">
              The arcade where your skills pay off.
              <span className="text-white"> Match patterns, stack functions, mine commits </span>
              — and earn GREP tokens with every game.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 lg:justify-start justify-center">
              <Link
                href="/games"
                className="group w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-playful font-semibold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-grep-purple/30 hover:scale-105"
              >
                <Gamepad2 className="w-5 h-5" />
                Enter Arcade
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-dark-700/80 border border-dark-600 font-semibold text-lg hover:bg-dark-600 hover:border-dark-500 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <Play className="w-5 h-5" />
                How It Works
              </a>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <AnimatedStat
                end={7300}
                suffix="+"
                label="Active Players"
                color="from-grep-purple to-grep-pink"
                icon={<Gamepad2 className="w-4 h-4" />}
              />
              <AnimatedStat
                end={1.2}
                suffix="M"
                label="GREP Earned"
                color="from-grep-green to-grep-cyan"
                icon={<Coins className="w-4 h-4" />}
              />
              <AnimatedStat
                end={45}
                suffix="K"
                label="Games Played"
                color="from-grep-orange to-grep-yellow"
                icon={<Trophy className="w-4 h-4" />}
              />
              <AnimatedStat
                end={2.5}
                suffix="x"
                label="Max Multiplier"
                color="from-grep-cyan to-grep-blue"
                icon={<Sparkles className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Right column - Mini Game */}
          <div className="relative">
            {/* Glow effect behind game */}
            <div className="absolute inset-0 bg-gradient-to-r from-grep-purple/20 to-grep-pink/20 blur-3xl rounded-full" />

            <div className="relative">
              <HeroMiniGame />

              {/* Try all games prompt */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-400 mb-2">Want more?</p>
                <Link
                  href="/games"
                  className="inline-flex items-center gap-2 text-grep-purple hover:text-grep-pink transition-colors"
                >
                  <span>Try all 4 games</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce-slow">
        <div className="w-6 h-10 rounded-full border-2 border-gray-600 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-gradient-to-b from-grep-purple to-grep-pink rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}
