'use client'
import { useState, useCallback } from 'react'
import { MiniGame, calculateReward } from '@/lib/mini-games'

type GameState = 'idle' | 'playing' | 'finished'

export function useMiniGame(game: MiniGame) {
  const [state, setState] = useState<GameState>('idle')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(game.duration)
  const [reward, setReward] = useState(0)

  const start = useCallback(() => {
    setState('playing')
    setScore(0)
    setTimeLeft(game.duration)
  }, [game.duration])

  const addScore = useCallback((points: number) => {
    setScore(s => s + points)
  }, [])

  const finish = useCallback((finalScore: number, maxScore: number) => {
    const earned = calculateReward(game, finalScore, maxScore)
    setReward(earned)
    setState('finished')
    fetch('/api/mini-games/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: game.id, score: finalScore, reward: earned }),
    })
  }, [game])

  const reset = useCallback(() => {
    setState('idle')
    setScore(0)
    setReward(0)
  }, [])

  return { state, score, timeLeft, reward, start, addScore, finish, reset, setTimeLeft }
}
