'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Play, RotateCcw, Zap, ArrowRight } from 'lucide-react'

const PATTERNS = [
  { regex: '^[a-z]+$', display: '^[a-z]+$', hint: 'lowercase', examples: ['hello', 'grep', 'code'] },
  { regex: '^\\d+$', display: '^\\d+$', hint: 'digits', examples: ['123', '42', '999'] },
  { regex: '^[A-Z][a-z]+$', display: '^[A-Z][a-z]+$', hint: 'Capitalized', examples: ['Hello', 'World', 'Grep'] },
  { regex: '^\\w+@\\w+$', display: '^\\w+@\\w+$', hint: 'email-like', examples: ['user@domain', 'test@grep'] },
  { regex: '^#[0-9a-f]{3}$', display: '^#[0-9a-f]{3}$', hint: 'short hex', examples: ['#fff', '#a1b', '#123'] },
]

type GameState = 'idle' | 'playing' | 'success' | 'fail'

export default function HeroMiniGame() {
  const [gameState, setGameState] = useState<GameState>('idle')
  const [currentPattern, setCurrentPattern] = useState(PATTERNS[0])
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10)
  const [streak, setStreak] = useState(0)
  const [showHint, setShowHint] = useState(false)

  const getRandomPattern = useCallback(() => {
    return PATTERNS[Math.floor(Math.random() * PATTERNS.length)]
  }, [])

  const startGame = useCallback(() => {
    setGameState('playing')
    setCurrentPattern(getRandomPattern())
    setInput('')
    setScore(0)
    setTimeLeft(10)
    setStreak(0)
    setShowHint(false)
  }, [getRandomPattern])

  const checkMatch = useCallback(() => {
    try {
      const regex = new RegExp(currentPattern.regex)
      if (regex.test(input)) {
        const points = 100 + streak * 25
        setScore(prev => prev + points)
        setStreak(prev => prev + 1)
        setCurrentPattern(getRandomPattern())
        setInput('')
        setTimeLeft(prev => Math.min(prev + 2, 15)) // Bonus time
        setShowHint(false)
        return true
      }
    } catch (e) {
      // Invalid regex
    }
    return false
  }, [currentPattern, input, streak, getRandomPattern])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (gameState !== 'playing') return

    if (!checkMatch()) {
      setStreak(0)
      // Flash red but continue
    }
  }, [gameState, checkMatch])

  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('success')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  // Show hint after 3 seconds
  useEffect(() => {
    if (gameState !== 'playing') return

    const hintTimer = setTimeout(() => {
      setShowHint(true)
    }, 3000)

    return () => clearTimeout(hintTimer)
  }, [gameState, currentPattern])

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-dark-800/80 backdrop-blur-xl rounded-2xl border border-dark-600 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-4 py-3 bg-dark-700/50 border-b border-dark-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-xs text-gray-400 font-mono">grep-arcade.exe</span>
          <div className="flex items-center gap-2 text-sm">
            {gameState === 'playing' && (
              <>
                <span className="text-grep-yellow font-bold">{score}</span>
                <span className="text-gray-500">|</span>
                <span className={`font-mono ${timeLeft <= 3 ? 'text-red-400 animate-pulse' : 'text-gray-400'}`}>
                  {timeLeft}s
                </span>
              </>
            )}
          </div>
        </div>

        {/* Game Area */}
        <div className="p-6">
          {gameState === 'idle' && (
            <div className="text-center space-y-4">
              <div className="text-4xl mb-2">🎮</div>
              <h3 className="text-xl font-bold">Quick Match</h3>
              <p className="text-gray-400 text-sm">
                Type strings that match the regex pattern. How many can you get in 10 seconds?
              </p>
              <button
                onClick={startGame}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-grep-purple to-grep-pink font-semibold hover:opacity-90 transition-all flex items-center gap-2 mx-auto"
              >
                <Play className="w-4 h-4" />
                Try Now
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="space-y-4">
              {/* Pattern Display */}
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Match this pattern:</div>
                <div className="font-mono text-2xl text-grep-cyan bg-dark-700/50 rounded-lg px-4 py-2 inline-block">
                  {currentPattern.display}
                </div>
                {showHint && (
                  <div className="text-xs text-gray-500 mt-2 animate-fade-in">
                    Hint: {currentPattern.hint} (e.g., {currentPattern.examples[0]})
                  </div>
                )}
              </div>

              {/* Streak */}
              {streak > 0 && (
                <div className="text-center">
                  <span className="px-3 py-1 rounded-full bg-grep-orange/20 text-grep-orange text-sm font-bold animate-pulse">
                    🔥 {streak}x Streak!
                  </span>
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your match..."
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-dark-700/50 border border-dark-600 focus:border-grep-purple focus:outline-none font-mono text-center text-lg"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-grep-purple hover:bg-grep-purple/80 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Timer Bar */}
              <div className="h-1 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-grep-purple to-grep-pink transition-all duration-1000"
                  style={{ width: `${(timeLeft / 15) * 100}%` }}
                />
              </div>
            </div>
          )}

          {gameState === 'success' && (
            <div className="text-center space-y-4">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold">Nice!</h3>
              <div className="text-3xl font-bold text-gradient">{score} points</div>
              <p className="text-gray-400 text-sm">
                {score >= 300 ? "You're a regex pro!" : score >= 150 ? 'Good pattern matching!' : 'Keep practicing!'}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={startGame}
                  className="px-4 py-2 rounded-xl bg-dark-700 hover:bg-dark-600 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Again
                </button>
                <Link
                  href="/games/grep-rails"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-grep-purple to-grep-pink font-semibold hover:opacity-90 transition-all flex items-center gap-2"
                >
                  Full Game
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
