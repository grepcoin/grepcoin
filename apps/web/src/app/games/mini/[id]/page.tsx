'use client'

import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CoinFlip } from '@/components/mini-games/CoinFlip'
import { TapSpeed } from '@/components/mini-games/TapSpeed'

const MINI_GAME_COMPONENTS: Record<string, React.ComponentType> = {
  'coin-flip': CoinFlip,
  'tap-speed': TapSpeed,
}

const MINI_GAME_INFO: Record<string, { name: string; description: string }> = {
  'coin-flip': {
    name: 'Coin Flip',
    description: 'Guess heads or tails - 50/50 chance to double your rewards!',
  },
  'tap-speed': {
    name: 'Tap Speed',
    description: 'Tap as fast as you can in 10 seconds. More taps = more GREP!',
  },
  'quick-math': {
    name: 'Quick Math',
    description: 'Solve 5 math equations as fast as you can!',
  },
  'color-match': {
    name: 'Color Match',
    description: 'Match the color pattern before time runs out!',
  },
}

export default function MiniGamePage() {
  const params = useParams()
  const gameId = params.id as string

  const GameComponent = MINI_GAME_COMPONENTS[gameId]
  const gameInfo = MINI_GAME_INFO[gameId]

  if (!gameInfo) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-dark-900 pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </Link>

          <h1 className="text-3xl font-display font-bold">{gameInfo.name}</h1>
          <p className="text-gray-400 mt-2">{gameInfo.description}</p>
        </div>

        {/* Game Container */}
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
          {GameComponent ? (
            <GameComponent />
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
              <p className="text-gray-400">This mini-game is still in development.</p>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="mt-8 p-6 bg-dark-800/50 rounded-2xl border border-dark-700">
          <h3 className="font-semibold mb-4">How It Works</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-grep-green">1.</span>
              <span>Connect your wallet to track earnings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-grep-green">2.</span>
              <span>Play the mini-game - quick and easy!</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-grep-green">3.</span>
              <span>GREP rewards are added to your daily earnings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-grep-green">4.</span>
              <span>Staking multipliers apply to mini-game rewards too!</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
