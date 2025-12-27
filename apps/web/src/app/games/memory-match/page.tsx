'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, Trophy, Brain, Zap, Clock } from 'lucide-react'
import { useGameScore } from '@/hooks/useGameScore'
import { useAuth } from '@/context/AuthContext'
import {
  playSound,
  createShake,
  getShakeOffset,
  ShakeState,
  Particle,
  createExplosion,
  createTextParticle,
  updateParticle,
  drawParticle,
  GREP_COLORS,
  hexToRgba,
} from '@/lib/gameUtils'

// Code symbols for the cards
const CODE_SYMBOLS = [
  { symbol: '{ }', name: 'Braces', color: GREP_COLORS.purple },
  { symbol: '[ ]', name: 'Brackets', color: GREP_COLORS.cyan },
  { symbol: '( )', name: 'Parens', color: GREP_COLORS.pink },
  { symbol: '=>', name: 'Arrow', color: GREP_COLORS.green },
  { symbol: '===', name: 'Equals', color: GREP_COLORS.orange },
  { symbol: '&&', name: 'And', color: GREP_COLORS.yellow },
  { symbol: '||', name: 'Or', color: GREP_COLORS.red },
  { symbol: '++', name: 'Increment', color: '#8b5cf6' },
  { symbol: '--', name: 'Decrement', color: '#ec4899' },
  { symbol: '...', name: 'Spread', color: '#06b6d4' },
  { symbol: '??', name: 'Nullish', color: '#f59e0b' },
  { symbol: '?.', name: 'Optional', color: '#10b981' },
  { symbol: '<>', name: 'Fragment', color: '#6366f1' },
  { symbol: '!==', name: 'NotEqual', color: '#ef4444' },
  { symbol: '**', name: 'Power', color: '#a855f7' },
  { symbol: '//', name: 'Comment', color: '#64748b' },
]

interface Card {
  id: number
  symbolIndex: number
  isFlipped: boolean
  isMatched: boolean
  flipAnimation: number
}

interface GameState {
  score: number
  moves: number
  matches: number
  combo: number
  timeLeft: number
  level: number
}

const INITIAL_TIME = 90

export default function MemoryMatchGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'paused' | 'gameover' | 'victory'>('idle')

  const { submitScore, isSubmitting, lastResult } = useGameScore('memory-match')
  const { isAuthenticated } = useAuth()

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    moves: 0,
    matches: 0,
    combo: 0,
    timeLeft: INITIAL_TIME,
    level: 1,
  })
  const [muted, setMuted] = useState(false)
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [canFlip, setCanFlip] = useState(true)

  const gameRef = useRef({
    animationId: 0,
    particles: [] as Particle[],
    shake: null as ShakeState | null,
    frameCount: 0,
  })

  // Calculate grid size based on level
  const getGridSize = useCallback((level: number) => {
    const sizes = [
      { pairs: 6, cols: 3 },   // Level 1: 12 cards (3x4)
      { pairs: 8, cols: 4 },   // Level 2: 16 cards (4x4)
      { pairs: 10, cols: 5 },  // Level 3: 20 cards (4x5)
      { pairs: 12, cols: 4 },  // Level 4: 24 cards (4x6)
      { pairs: 15, cols: 5 },  // Level 5: 30 cards (5x6)
      { pairs: 18, cols: 6 },  // Level 6: 36 cards (6x6)
    ]
    return sizes[Math.min(level - 1, sizes.length - 1)]
  }, [])

  // Initialize cards for current level
  const initCards = useCallback((level: number) => {
    const { pairs } = getGridSize(level)
    const symbolIndices = [...Array(CODE_SYMBOLS.length).keys()]
      .sort(() => Math.random() - 0.5)
      .slice(0, pairs)

    const cardPairs = symbolIndices.flatMap((idx, i) => [
      { id: i * 2, symbolIndex: idx, isFlipped: false, isMatched: false, flipAnimation: 0 },
      { id: i * 2 + 1, symbolIndex: idx, isFlipped: false, isMatched: false, flipAnimation: 0 },
    ])

    // Shuffle cards
    const shuffled = cardPairs.sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setFlippedCards([])
    setCanFlip(true)
  }, [getGridSize])

  // Handle card click
  const handleCardClick = useCallback((cardId: number) => {
    if (gameStatus !== 'playing' || !canFlip) return

    const card = cards.find(c => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return

    if (!muted) playSound('click')

    // Flip the card
    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, isFlipped: true, flipAnimation: 1 } : c
    )
    setCards(newCards)

    const newFlipped = [...flippedCards, cardId]
    setFlippedCards(newFlipped)

    if (newFlipped.length === 2) {
      setCanFlip(false)
      setGameState(prev => ({ ...prev, moves: prev.moves + 1 }))

      const [first, second] = newFlipped
      const card1 = newCards.find(c => c.id === first)!
      const card2 = newCards.find(c => c.id === second)!

      if (card1.symbolIndex === card2.symbolIndex) {
        // Match found!
        setTimeout(() => {
          if (!muted) playSound('success')

          const matchedCards = newCards.map(c =>
            c.id === first || c.id === second
              ? { ...c, isMatched: true }
              : c
          )
          setCards(matchedCards)

          const newCombo = gameState.combo + 1
          const points = 100 * newCombo + (gameState.level * 25)

          setGameState(prev => ({
            ...prev,
            score: prev.score + points,
            matches: prev.matches + 1,
            combo: newCombo,
          }))

          // Add particles
          const game = gameRef.current
          game.particles.push(...createExplosion(240, 200, 20, [
            CODE_SYMBOLS[card1.symbolIndex].color,
            GREP_COLORS.green,
            '#ffffff'
          ]))
          game.particles.push(createTextParticle(240, 180, `+${points}`, GREP_COLORS.green))

          if (newCombo >= 3) {
            game.particles.push(createTextParticle(240, 150, `${newCombo}x COMBO!`, GREP_COLORS.orange))
            game.shake = createShake(5, 200)
          }

          setFlippedCards([])
          setCanFlip(true)

          // Check for level complete
          if (matchedCards.every(c => c.isMatched)) {
            setTimeout(() => {
              if (gameState.level < 6) {
                if (!muted) playSound('levelup')
                setGameState(prev => ({
                  ...prev,
                  level: prev.level + 1,
                  timeLeft: Math.min(prev.timeLeft + 30, INITIAL_TIME),
                }))
                initCards(gameState.level + 1)
              } else {
                setGameStatus('victory')
              }
            }, 500)
          }
        }, 300)
      } else {
        // No match - flip back
        setTimeout(() => {
          if (!muted) playSound('error')

          const resetCards = newCards.map(c =>
            c.id === first || c.id === second
              ? { ...c, isFlipped: false, flipAnimation: 0 }
              : c
          )
          setCards(resetCards)
          setFlippedCards([])
          setCanFlip(true)
          setGameState(prev => ({ ...prev, combo: 0 }))

          gameRef.current.shake = createShake(3, 100)
        }, 800)
      }
    }
  }, [gameStatus, canFlip, cards, flippedCards, gameState.combo, gameState.level, muted, initCards])

  // Timer countdown
  useEffect(() => {
    if (gameStatus !== 'playing') return

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          setGameStatus('gameover')
          return { ...prev, timeLeft: 0 }
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStatus])

  // Game loop for animations
  useEffect(() => {
    if (gameStatus !== 'playing' && gameStatus !== 'paused') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { cols } = getGridSize(gameState.level)
    const rows = Math.ceil(cards.length / cols)
    const cardWidth = 70
    const cardHeight = 90
    const gap = 10
    const startX = (canvas.width - (cols * (cardWidth + gap) - gap)) / 2
    const startY = (canvas.height - (rows * (cardHeight + gap) - gap)) / 2

    const animate = () => {
      const game = gameRef.current
      game.frameCount++

      const shakeOffset = getShakeOffset(game.shake)
      ctx.save()
      ctx.translate(shakeOffset.x, shakeOffset.y)

      // Background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      bgGradient.addColorStop(0, '#0a0a12')
      bgGradient.addColorStop(1, '#12121f')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw cards
      cards.forEach((card, index) => {
        const col = index % cols
        const row = Math.floor(index / cols)
        const x = startX + col * (cardWidth + gap)
        const y = startY + row * (cardHeight + gap)

        // Card shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
        ctx.beginPath()
        ctx.roundRect(x + 3, y + 3, cardWidth, cardHeight, 8)
        ctx.fill()

        // Card background
        if (card.isMatched) {
          const matchGradient = ctx.createLinearGradient(x, y, x, y + cardHeight)
          matchGradient.addColorStop(0, hexToRgba(GREP_COLORS.green, 0.3))
          matchGradient.addColorStop(1, hexToRgba(GREP_COLORS.green, 0.1))
          ctx.fillStyle = matchGradient
        } else if (card.isFlipped) {
          const symbol = CODE_SYMBOLS[card.symbolIndex]
          const flipGradient = ctx.createLinearGradient(x, y, x, y + cardHeight)
          flipGradient.addColorStop(0, hexToRgba(symbol.color, 0.4))
          flipGradient.addColorStop(1, hexToRgba(symbol.color, 0.2))
          ctx.fillStyle = flipGradient
        } else {
          const cardGradient = ctx.createLinearGradient(x, y, x, y + cardHeight)
          cardGradient.addColorStop(0, '#2a2a3e')
          cardGradient.addColorStop(1, '#1a1a2e')
          ctx.fillStyle = cardGradient
        }

        ctx.beginPath()
        ctx.roundRect(x, y, cardWidth, cardHeight, 8)
        ctx.fill()

        // Card border
        if (card.isMatched) {
          ctx.strokeStyle = GREP_COLORS.green
          ctx.lineWidth = 2
        } else if (card.isFlipped) {
          ctx.strokeStyle = CODE_SYMBOLS[card.symbolIndex].color
          ctx.lineWidth = 2
        } else {
          ctx.strokeStyle = '#3a3a4e'
          ctx.lineWidth = 1
        }
        ctx.stroke()

        // Card content
        if (card.isFlipped || card.isMatched) {
          const symbol = CODE_SYMBOLS[card.symbolIndex]
          ctx.fillStyle = symbol.color
          ctx.font = 'bold 24px monospace'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(symbol.symbol, x + cardWidth / 2, y + cardHeight / 2 - 8)

          ctx.fillStyle = '#888'
          ctx.font = '10px monospace'
          ctx.fillText(symbol.name, x + cardWidth / 2, y + cardHeight / 2 + 20)
        } else {
          // Card back pattern
          ctx.fillStyle = '#4a4a5e'
          ctx.font = 'bold 28px monospace'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('?', x + cardWidth / 2, y + cardHeight / 2)
        }
      })

      // Draw particles
      game.particles = game.particles.filter(p => {
        if (updateParticle(p)) {
          drawParticle(ctx, p, 0)
          return true
        }
        return false
      })

      ctx.restore()

      game.animationId = requestAnimationFrame(animate)
    }

    gameRef.current.animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(gameRef.current.animationId)
    }
  }, [gameStatus, cards, gameState.level, getGridSize])

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameStatus !== 'playing' || !canFlip) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const { cols } = getGridSize(gameState.level)
    const rows = Math.ceil(cards.length / cols)
    const cardWidth = 70
    const cardHeight = 90
    const gap = 10
    const startX = (canvas.width - (cols * (cardWidth + gap) - gap)) / 2
    const startY = (canvas.height - (rows * (cardHeight + gap) - gap)) / 2

    // Find clicked card
    cards.forEach((card, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      const cardX = startX + col * (cardWidth + gap)
      const cardY = startY + row * (cardHeight + gap)

      if (x >= cardX && x <= cardX + cardWidth &&
          y >= cardY && y <= cardY + cardHeight) {
        handleCardClick(card.id)
      }
    })
  }, [gameStatus, canFlip, cards, gameState.level, getGridSize, handleCardClick])

  // Toggle pause
  const togglePause = useCallback(() => {
    if (gameStatus === 'playing') {
      setGameStatus('paused')
    } else if (gameStatus === 'paused') {
      setGameStatus('playing')
    }
  }, [gameStatus])

  // Escape key to pause
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (gameStatus === 'playing' || gameStatus === 'paused')) {
        togglePause()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [gameStatus, togglePause])

  // Submit score
  useEffect(() => {
    if ((gameStatus === 'gameover' || gameStatus === 'victory') && isAuthenticated && gameState.score > 0) {
      submitScore(gameState.score, gameState.level, gameState.matches)
    }
  }, [gameStatus, isAuthenticated, gameState.score, gameState.level, gameState.matches, submitScore])

  // Start game
  const startGame = () => {
    setGameState({
      score: 0,
      moves: 0,
      matches: 0,
      combo: 0,
      timeLeft: INITIAL_TIME,
      level: 1,
    })
    gameRef.current.particles = []
    gameRef.current.shake = null
    initCards(1)
    setGameStatus('playing')
    if (!muted) playSound('levelup')
  }

  const { pairs, cols } = getGridSize(gameState.level)
  const canvasWidth = Math.max(480, cols * 80 + 40)
  const canvasHeight = Math.max(400, Math.ceil(pairs * 2 / cols) * 100 + 80)

  return (
    <main className="min-h-screen bg-dark-900 flex flex-col">
      {/* Header */}
      <div className="bg-dark-800/50 border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/games" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Arcade
            </Link>
            <div className="flex items-center gap-4">
              {(gameStatus === 'playing' || gameStatus === 'paused') && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span className={gameState.timeLeft <= 10 ? 'text-red-400 animate-pulse' : ''}>{gameState.timeLeft}s</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span>{gameState.combo}x</span>
                  </div>
                </>
              )}
              <div className="flex items-center gap-2">
                {(gameStatus === 'playing' || gameStatus === 'paused') && (
                  <button
                    onClick={togglePause}
                    className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                    title={gameStatus === 'paused' ? 'Resume (Esc)' : 'Pause (Esc)'}
                  >
                    {gameStatus === 'paused' ? <Play className="w-5 h-5 text-green-400" /> : <Pause className="w-5 h-5" />}
                  </button>
                )}
                <button
                  onClick={() => setMuted(!muted)}
                  className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                >
                  {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            onClick={handleCanvasClick}
            className="rounded-2xl border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20 cursor-pointer"
          />

          {/* Start Screen */}
          {gameStatus === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/95 rounded-2xl backdrop-blur-sm">
              <div className="text-7xl mb-6">🧠</div>
              <h2 className="text-4xl font-display font-bold mb-3">
                <span className="text-gradient">Memory Match</span>
              </h2>
              <p className="text-gray-400 mb-6 text-center max-w-sm">
                Match pairs of code symbols! Build combos for bonus points and clear all levels before time runs out.
              </p>

              <button
                onClick={startGame}
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-purple-500/30"
              >
                <Play className="w-5 h-5" />
                Start Game
              </button>

              <div className="mt-8 grid grid-cols-2 gap-3 text-xs max-w-sm">
                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700 text-center">
                  <span className="text-xl">🎯</span>
                  <div className="text-gray-400 mt-1">Find matching pairs</div>
                </div>
                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700 text-center">
                  <span className="text-xl">🔥</span>
                  <div className="text-gray-400 mt-1">Chain combos for bonus</div>
                </div>
                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700 text-center">
                  <span className="text-xl">⏱️</span>
                  <div className="text-gray-400 mt-1">Beat the clock</div>
                </div>
                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700 text-center">
                  <span className="text-xl">📈</span>
                  <div className="text-gray-400 mt-1">6 levels to master</div>
                </div>
              </div>
            </div>
          )}

          {/* Pause Screen */}
          {gameStatus === 'paused' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/90 rounded-2xl backdrop-blur-sm">
              <div className="text-6xl mb-6">⏸️</div>
              <h2 className="text-3xl font-display font-bold mb-4">
                <span className="text-gradient">Paused</span>
              </h2>

              <div className="grid grid-cols-2 gap-3 mb-6 text-center text-sm">
                <div className="p-3 rounded-xl bg-dark-800 border border-purple-500/30">
                  <div className="text-xl font-bold text-purple-400">{gameState.score}</div>
                  <div className="text-xs text-gray-400">Score</div>
                </div>
                <div className="p-3 rounded-xl bg-dark-800 border border-yellow-500/30">
                  <div className="text-xl font-bold text-yellow-400">Lv.{gameState.level}</div>
                  <div className="text-xs text-gray-400">Level</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={togglePause}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 font-bold hover:scale-105 transition-transform"
                >
                  <Play className="w-4 h-4" />
                  Resume
                </button>
                <Link
                  href="/games"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-dark-700 border border-dark-600 font-bold hover:bg-dark-600 transition-colors"
                >
                  <Trophy className="w-4 h-4" />
                  Quit
                </Link>
              </div>

              <p className="text-gray-500 text-sm mt-4">Press Esc to resume</p>
            </div>
          )}

          {/* Game Over Screen */}
          {gameStatus === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/95 rounded-2xl backdrop-blur-sm">
              <div className="text-6xl mb-4">⏰</div>
              <h2 className="text-3xl font-display font-bold mb-2 text-red-400">Time&apos;s Up!</h2>

              <div className="grid grid-cols-2 gap-3 my-6 text-center">
                <div className="p-4 rounded-xl bg-dark-800 border border-purple-500/30">
                  <div className="text-2xl font-bold text-purple-400">{gameState.score}</div>
                  <div className="text-xs text-gray-400">Score</div>
                </div>
                <div className="p-4 rounded-xl bg-dark-800 border border-yellow-500/30">
                  <div className="text-2xl font-bold text-yellow-400">Lv.{gameState.level}</div>
                  <div className="text-xs text-gray-400">Level</div>
                </div>
                <div className="p-4 rounded-xl bg-dark-800 border border-green-500/30">
                  <div className="text-2xl font-bold text-green-400">{gameState.matches}</div>
                  <div className="text-xs text-gray-400">Matches</div>
                </div>
                <div className="p-4 rounded-xl bg-dark-800 border border-cyan-500/30">
                  {isSubmitting ? (
                    <>
                      <div className="text-2xl font-bold text-cyan-400 animate-pulse">...</div>
                      <div className="text-xs text-gray-400">Submitting</div>
                    </>
                  ) : lastResult?.success ? (
                    <>
                      <div className="text-2xl font-bold text-cyan-400">+{lastResult.grepEarned}</div>
                      <div className="text-xs text-gray-400">GREP</div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-cyan-400">+{Math.floor(gameState.score / 15)}</div>
                      <div className="text-xs text-gray-400">{isAuthenticated ? 'GREP' : 'Login'}</div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 font-bold hover:scale-105 transition-transform"
                >
                  <RotateCcw className="w-4 h-4" />
                  Again
                </button>
                <Link
                  href="/games"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-dark-700 border border-dark-600 font-bold hover:bg-dark-600 transition-colors"
                >
                  <Trophy className="w-4 h-4" />
                  Arcade
                </Link>
              </div>
            </div>
          )}

          {/* Victory Screen */}
          {gameStatus === 'victory' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/95 rounded-2xl backdrop-blur-sm">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-display font-bold mb-2 text-green-400">All Levels Complete!</h2>

              <div className="grid grid-cols-2 gap-3 my-6 text-center">
                <div className="p-4 rounded-xl bg-dark-800 border border-purple-500/30">
                  <div className="text-2xl font-bold text-purple-400">{gameState.score}</div>
                  <div className="text-xs text-gray-400">Final Score</div>
                </div>
                <div className="p-4 rounded-xl bg-dark-800 border border-yellow-500/30">
                  <div className="text-2xl font-bold text-yellow-400">{gameState.moves}</div>
                  <div className="text-xs text-gray-400">Moves</div>
                </div>
                <div className="p-4 rounded-xl bg-dark-800 border border-green-500/30">
                  <div className="text-2xl font-bold text-green-400">{gameState.matches}</div>
                  <div className="text-xs text-gray-400">Matches</div>
                </div>
                <div className="p-4 rounded-xl bg-dark-800 border border-cyan-500/30">
                  {isSubmitting ? (
                    <>
                      <div className="text-2xl font-bold text-cyan-400 animate-pulse">...</div>
                      <div className="text-xs text-gray-400">Submitting</div>
                    </>
                  ) : lastResult?.success ? (
                    <>
                      <div className="text-2xl font-bold text-cyan-400">+{lastResult.grepEarned}</div>
                      <div className="text-xs text-gray-400">GREP</div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-cyan-400">+{Math.floor(gameState.score / 10)}</div>
                      <div className="text-xs text-gray-400">{isAuthenticated ? 'GREP' : 'Login'}</div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 font-bold hover:scale-105 transition-transform"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
                <Link
                  href="/games"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-dark-700 border border-dark-600 font-bold hover:bg-dark-600 transition-colors"
                >
                  <Trophy className="w-4 h-4" />
                  Arcade
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        {(gameStatus === 'playing' || gameStatus === 'paused') && (
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Score: {gameState.score}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Level {gameState.level}/6</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Matches: {gameState.matches}/{pairs}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Moves: {gameState.moves}</span>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
