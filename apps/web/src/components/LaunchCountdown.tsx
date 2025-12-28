'use client'

import { useState, useEffect, useCallback } from 'react'
import Logo from './Logo'
import { Gamepad2, Trophy, Coins, Users, CheckCircle, Loader2 } from 'lucide-react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function EmailSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [position, setPosition] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setStatus('error')
      setMessage('Please enter your email')
      return
    }

    setStatus('loading')

    try {
      const response = await fetch('/api/launch/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'launch_page',
          referrer: typeof window !== 'undefined' ? document.referrer : undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message)
        if (data.position) {
          setPosition(data.position)
        }
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="mb-10">
        <div className="bg-grep-green/10 border border-grep-green/30 rounded-xl p-6 max-w-md mx-auto">
          <CheckCircle className="w-12 h-12 text-grep-green mx-auto mb-3" />
          <p className="text-grep-green font-semibold text-lg mb-1">{message}</p>
          {position && (
            <p className="text-gray-400 text-sm">
              You are #{position} on the waitlist
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-10">
      <p className="text-gray-400 mb-4">Get notified when we launch</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={status === 'loading'}
          className="flex-1 px-4 py-3 bg-dark-700/50 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-grep-purple transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-6 py-3 bg-gradient-to-r from-grep-purple via-grep-pink to-grep-orange text-white font-semibold rounded-xl transition-all hover:opacity-90 hover:scale-105 shadow-lg shadow-grep-purple/30 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing up...</span>
            </>
          ) : (
            'Notify Me'
          )}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-red-400 text-sm mt-2">{message}</p>
      )}
    </div>
  )
}

export default function LaunchCountdown() {
  // Launch date: January 31, 2026 at 12:00 PM UTC
  const LAUNCH_DATE = new Date('2026-01-31T12:00:00Z').getTime()

  const calculateTimeLeft = useCallback((): TimeLeft => {
    const now = Date.now()
    const difference = LAUNCH_DATE - now

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
    }
  }, [LAUNCH_DATE])

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [calculateTimeLeft])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-pulse">
          <Logo size={64} />
        </div>
      </div>
    )
  }

  const timeBlocks = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Seconds' },
  ]

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-grep-purple/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-grep-pink/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-grep-orange/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />

        {/* Neon Grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating game icons */}
        <div className="absolute top-20 left-10 animate-bounce" style={{ animationDuration: '3s' }}>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-grep-purple to-grep-pink flex items-center justify-center shadow-lg shadow-grep-purple/30 text-2xl">
            🎮
          </div>
        </div>
        <div className="absolute top-32 right-16 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-grep-orange to-grep-yellow flex items-center justify-center shadow-lg shadow-grep-orange/30 text-xl">
            🏆
          </div>
        </div>
        <div className="absolute bottom-32 left-16 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-grep-green to-grep-cyan flex items-center justify-center shadow-lg shadow-grep-green/30 text-xl">
            💎
          </div>
        </div>
        <div className="absolute bottom-40 right-20 animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '0.8s' }}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-grep-cyan to-grep-blue flex items-center justify-center shadow-lg shadow-grep-cyan/30 text-lg">
            🚀
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Logo size={80} />
          </div>

          {/* Tagline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
            <span className="text-white">Play Games.</span>{' '}
            <span className="bg-gradient-to-r from-grep-purple via-grep-pink to-grep-orange bg-clip-text text-transparent">
              Earn Crypto.
            </span>{' '}
            <span className="text-white">Have Fun.</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
            The AI-built crypto arcade is launching soon. 10 developer-themed games on Base L2.
          </p>

          {/* Countdown label */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-700/80 border border-dark-600 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-grep-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-grep-green" />
            </span>
            <span className="text-sm text-gray-300">Token Launch Countdown</span>
          </div>

          {/* Countdown timer */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-12">
            {timeBlocks.map((block) => (
              <div
                key={block.label}
                className="bg-dark-700/50 backdrop-blur-sm border border-dark-600 rounded-2xl p-4 md:p-6 min-w-[80px] md:min-w-[120px] hover:border-grep-purple/50 transition-colors"
              >
                <div className="text-4xl md:text-6xl font-display font-bold bg-gradient-to-r from-grep-purple via-grep-pink to-grep-orange bg-clip-text text-transparent mb-1">
                  {String(block.value).padStart(2, '0')}
                </div>
                <div className="text-xs md:text-sm text-gray-400 uppercase tracking-wider">
                  {block.label}
                </div>
              </div>
            ))}
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Gamepad2, label: '10 Games', color: 'from-grep-purple to-grep-pink' },
              { icon: Coins, label: 'Earn GREP', color: 'from-grep-green to-grep-cyan' },
              { icon: Trophy, label: 'Leaderboards', color: 'from-grep-orange to-grep-yellow' },
              { icon: Users, label: 'Tournaments', color: 'from-grep-cyan to-grep-blue' },
            ].map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.label}
                  className="bg-dark-700/30 backdrop-blur-sm border border-dark-600/50 rounded-xl p-4 hover:border-grep-purple/50 transition-all hover:-translate-y-1"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 mx-auto`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-sm text-gray-300 font-medium">{feature.label}</div>
                </div>
              )
            })}
          </div>

          {/* Email signup */}
          <EmailSignup />

          {/* Social links */}
          <div className="flex justify-center gap-6 mb-8">
            <a
              href="https://twitter.com/grepcoin"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-xl bg-dark-700/50 border border-dark-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-grep-purple/50 transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://discord.gg/grepcoin"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-xl bg-dark-700/50 border border-dark-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-grep-purple/50 transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>
            <a
              href="https://github.com/grepcoin"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-xl bg-dark-700/50 border border-dark-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-grep-purple/50 transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>

          {/* Footer */}
          <div className="text-gray-500 text-sm">
            <p>Built with AI by <span className="text-gray-400">GrepLabs LLC</span></p>
            <p className="mt-1">
              Powered by{' '}
              <span className="bg-gradient-to-r from-grep-purple to-grep-pink bg-clip-text text-transparent">
                Base L2
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
