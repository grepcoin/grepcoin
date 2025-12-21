'use client'
import { useState } from 'react'
import { MINI_GAMES } from '@/lib/mini-games'
import { useMiniGame } from '@/hooks/useMiniGame'

export function CoinFlip() {
  const game = MINI_GAMES.find(g => g.id === 'coin-flip')!
  const { state, reward, start, finish, reset } = useMiniGame(game)
  const [result, setResult] = useState<'heads' | 'tails' | null>(null)
  const [guess, setGuess] = useState<'heads' | 'tails' | null>(null)
  const [flipping, setFlipping] = useState(false)

  const flip = (choice: 'heads' | 'tails') => {
    if (state !== 'idle') return
    start()
    setGuess(choice)
    setFlipping(true)
    setTimeout(() => {
      const outcome = Math.random() > 0.5 ? 'heads' : 'tails'
      setResult(outcome)
      setFlipping(false)
      finish(outcome === choice ? 1 : 0, 1)
    }, 2000)
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 text-center">
      <h3 className="text-xl font-bold mb-4">{game.icon} {game.name}</h3>
      {state === 'idle' && (
        <div className="space-y-4">
          <p className="text-gray-400">{game.description}</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => flip('heads')} className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-xl">🌕 Heads</button>
            <button onClick={() => flip('tails')} className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-xl">🌑 Tails</button>
          </div>
        </div>
      )}
      {state === 'playing' && <div className="text-6xl animate-spin">🪙</div>}
      {state === 'finished' && (
        <div className="space-y-4">
          <div className="text-6xl">{result === 'heads' ? '🌕' : '🌑'}</div>
          <p className="text-xl">{result === guess ? '🎉 You won!' : '😔 You lost'}</p>
          <p className="text-emerald-400 text-2xl">+{reward} GREP</p>
          <button onClick={reset} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg">Play Again</button>
        </div>
      )}
    </div>
  )
}
