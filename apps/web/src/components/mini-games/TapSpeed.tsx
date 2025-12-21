'use client'
import { useState, useEffect } from 'react'
import { MINI_GAMES } from '@/lib/mini-games'
import { useMiniGame } from '@/hooks/useMiniGame'

export function TapSpeed() {
  const game = MINI_GAMES.find(g => g.id === 'tap-speed')!
  const { state, score, timeLeft, reward, start, addScore, finish, reset, setTimeLeft } = useMiniGame(game)

  useEffect(() => {
    if (state !== 'playing') return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); finish(score, 50); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [state, score, finish, setTimeLeft])

  return (
    <div className="bg-gray-800 rounded-xl p-6 text-center">
      <h3 className="text-xl font-bold mb-4">{game.icon} {game.name}</h3>
      {state === 'idle' && (
        <div className="space-y-4">
          <p className="text-gray-400">{game.description}</p>
          <button onClick={start} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xl">Start!</button>
        </div>
      )}
      {state === 'playing' && (
        <div className="space-y-4">
          <div className="flex justify-between text-xl"><span>Taps: {score}</span><span>{timeLeft}s</span></div>
          <button onClick={() => addScore(1)} className="w-32 h-32 bg-red-500 hover:bg-red-600 active:scale-95 rounded-full text-4xl transition-transform">👆</button>
        </div>
      )}
      {state === 'finished' && (
        <div className="space-y-4">
          <p className="text-4xl font-bold">{score} taps!</p>
          <p className="text-emerald-400 text-2xl">+{reward} GREP</p>
          <button onClick={reset} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg">Play Again</button>
        </div>
      )}
    </div>
  )
}
