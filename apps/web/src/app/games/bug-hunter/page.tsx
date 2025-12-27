'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, RotateCcw, Volume2, VolumeX, Trophy, Bug, Heart, Target, Zap } from 'lucide-react'
import { useGameScore } from '@/hooks/useGameScore'
import { useAuth } from '@/context/AuthContext'
import {
  playSound,
  getShakeOffset,
  ShakeState,
  Particle,
  createExplosion,
  createTextParticle,
  updateParticle,
  drawParticle,
  createShake,
  GREP_COLORS,
} from '@/lib/gameUtils'

// Code snippets with bugs - each has a buggy line index
interface CodeSnippet {
  lines: string[]
  bugLine: number // 0-indexed line with the bug
  bugType: 'syntax' | 'undefined' | 'logic' | 'typo'
  explanation: string
  tier: number // 1-4 difficulty
}

const codeSnippets: CodeSnippet[] = [
  // Tier 1 - Easy (obvious syntax errors)
  {
    lines: [
      'function greet(name) {',
      '  console.log("Hello, " + name)',
      '  return true',
      '}',
    ],
    bugLine: 1,
    bugType: 'syntax',
    explanation: 'Missing semicolon',
    tier: 1,
  },
  {
    lines: [
      'const numbers = [1, 2, 3];',
      'const sum = numbers.reduce((a, b) => a + b;',
      'console.log(sum);',
    ],
    bugLine: 1,
    bugType: 'syntax',
    explanation: 'Missing closing parenthesis',
    tier: 1,
  },
  {
    lines: [
      'let count = 0;',
      'for (let i = 0 i < 10; i++) {',
      '  count += i;',
      '}',
    ],
    bugLine: 1,
    bugType: 'syntax',
    explanation: 'Missing semicolon in for loop',
    tier: 1,
  },
  {
    lines: [
      'const user = {',
      '  name: "Alice"',
      '  age: 25',
      '};',
    ],
    bugLine: 1,
    bugType: 'syntax',
    explanation: 'Missing comma between properties',
    tier: 1,
  },
  // Tier 2 - Medium (undefined variables, typos)
  {
    lines: [
      'function calculate(x, y) {',
      '  const result = x * z;',
      '  return result;',
      '}',
    ],
    bugLine: 1,
    bugType: 'undefined',
    explanation: 'Variable z is not defined (should be y)',
    tier: 2,
  },
  {
    lines: [
      'const items = ["a", "b", "c"];',
      'items.forEach(item => {',
      '  console.log(itme);',
      '});',
    ],
    bugLine: 2,
    bugType: 'typo',
    explanation: 'Typo: itme should be item',
    tier: 2,
  },
  {
    lines: [
      'async function fetchData() {',
      '  const response = await fetch(url);',
      '  return response.json();',
      '}',
    ],
    bugLine: 1,
    bugType: 'undefined',
    explanation: 'Variable url is not defined',
    tier: 2,
  },
  {
    lines: [
      'class Counter {',
      '  constructor() { this.count = 0; }',
      '  increment() { this.coutn++; }',
      '}',
    ],
    bugLine: 2,
    bugType: 'typo',
    explanation: 'Typo: coutn should be count',
    tier: 2,
  },
  // Tier 3 - Hard (logic errors)
  {
    lines: [
      'function isEven(num) {',
      '  return num % 2 === 1;',
      '}',
    ],
    bugLine: 1,
    bugType: 'logic',
    explanation: 'Logic error: should be === 0 for even',
    tier: 3,
  },
  {
    lines: [
      'function findMax(arr) {',
      '  let max = 0;',
      '  for (let n of arr) {',
      '    if (n > max) max = n;',
      '  }',
      '  return max;',
      '}',
    ],
    bugLine: 1,
    bugType: 'logic',
    explanation: 'Should initialize max to -Infinity or arr[0]',
    tier: 3,
  },
  {
    lines: [
      'function reverseString(str) {',
      '  let reversed = "";',
      '  for (let i = str.length; i >= 0; i--) {',
      '    reversed += str[i];',
      '  }',
      '  return reversed;',
      '}',
    ],
    bugLine: 2,
    bugType: 'logic',
    explanation: 'Off by one: should start at str.length - 1',
    tier: 3,
  },
  // Tier 4 - Boss (subtle bugs)
  {
    lines: [
      'const debounce = (fn, delay) => {',
      '  let timeout;',
      '  return (...args) => {',
      '    clearTimeout(timeout);',
      '    timeout = setTimeout(fn, delay);',
      '  };',
      '};',
    ],
    bugLine: 4,
    bugType: 'logic',
    explanation: 'Args not passed to fn: should be fn(...args)',
    tier: 4,
  },
  {
    lines: [
      'async function parallel(tasks) {',
      '  const results = [];',
      '  for (const task of tasks) {',
      '    results.push(await task());',
      '  }',
      '  return results;',
      '}',
    ],
    bugLine: 3,
    bugType: 'logic',
    explanation: 'Not parallel: awaits sequentially. Use Promise.all',
    tier: 4,
  },
  {
    lines: [
      'const memoize = (fn) => {',
      '  const cache = {};',
      '  return (arg) => {',
      '    if (cache[arg]) return cache[arg];',
      '    return cache[arg] = fn(arg);',
      '  };',
      '};',
    ],
    bugLine: 3,
    bugType: 'logic',
    explanation: 'Falsy values not cached: use "in" operator',
    tier: 4,
  },
]

interface ScrollingCode {
  id: number
  snippet: CodeSnippet
  x: number
  y: number
  speed: number
  found: boolean
  missed: boolean
}

interface GameState {
  score: number
  lives: number
  level: number
  streak: number
  maxStreak: number
  bugsFound: number
  bossMode: boolean
}

export default function BugHunterGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle')

  // Score submission hooks
  const { submitScore, isSubmitting, lastResult } = useGameScore('bug-hunter')
  const { isAuthenticated } = useAuth()

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    level: 1,
    streak: 0,
    maxStreak: 0,
    bugsFound: 0,
    bossMode: false,
  })
  const [muted, setMuted] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | 'miss', text: string } | null>(null)
  const [hoveredLine, setHoveredLine] = useState<{ codeId: number, lineIndex: number } | null>(null)

  const gameRef = useRef({
    animationId: 0,
    codes: [] as ScrollingCode[],
    particles: [] as Particle[],
    shake: null as ShakeState | null,
    nextId: 0,
    spawnTimer: 0,
    spawnInterval: 180, // frames between spawns
    frameCount: 0,
    lastMouseX: 0,
    lastMouseY: 0,
  })

  // Submit score when game ends
  useEffect(() => {
    if (gameStatus === 'gameover' && isAuthenticated && gameState.score > 0) {
      submitScore(gameState.score, gameState.maxStreak, gameState.bugsFound)
    }
  }, [gameStatus, isAuthenticated, gameState.score, gameState.maxStreak, gameState.bugsFound, submitScore])

  // Get snippet based on level
  const getSnippet = useCallback((level: number, bossMode: boolean): CodeSnippet => {
    let maxTier = Math.min(4, Math.ceil(level / 3))
    if (bossMode) maxTier = 4

    const eligible = codeSnippets.filter(s => s.tier <= maxTier)
    return eligible[Math.floor(Math.random() * eligible.length)]
  }, [])

  // Spawn new code snippet
  const spawnCode = useCallback(() => {
    const game = gameRef.current
    const snippet = getSnippet(gameState.level, gameState.bossMode)

    const canvas = canvasRef.current
    if (!canvas) return

    // Spawn from right side at random Y
    const lineHeight = 24
    const codeHeight = snippet.lines.length * lineHeight + 40
    const maxY = canvas.height - codeHeight - 20
    const y = Math.random() * maxY + 10

    game.codes.push({
      id: game.nextId++,
      snippet,
      x: canvas.width + 20,
      y,
      speed: 0.8 + gameState.level * 0.1 + Math.random() * 0.3,
      found: false,
      missed: false,
    })
  }, [gameState.level, gameState.bossMode, getSnippet])

  // Handle click on code
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameStatus !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const game = gameRef.current

    // Check if click is on any code snippet
    for (const code of game.codes) {
      if (code.found || code.missed) continue

      const lineHeight = 24
      const padding = 16
      const codeWidth = 380
      const codeHeight = code.snippet.lines.length * lineHeight + padding * 2

      // Check if within code block bounds
      if (x >= code.x && x <= code.x + codeWidth && y >= code.y && y <= code.y + codeHeight) {
        // Determine which line was clicked
        const relativeY = y - code.y - padding
        const clickedLine = Math.floor(relativeY / lineHeight)

        if (clickedLine >= 0 && clickedLine < code.snippet.lines.length) {
          if (clickedLine === code.snippet.bugLine) {
            // Correct! Found the bug
            code.found = true
            if (!muted) playSound('success')

            const tierBonus = code.snippet.tier * 25
            const streakBonus = gameState.streak * 10
            const points = 50 + tierBonus + streakBonus

            setGameState(prev => ({
              ...prev,
              score: prev.score + points,
              streak: prev.streak + 1,
              maxStreak: Math.max(prev.maxStreak, prev.streak + 1),
              bugsFound: prev.bugsFound + 1,
              level: Math.floor((prev.bugsFound + 1) / 5) + 1,
            }))

            // Create celebration particles
            game.particles.push(...createExplosion(
              code.x + codeWidth / 2,
              code.y + codeHeight / 2,
              20,
              [GREP_COLORS.green, GREP_COLORS.cyan, '#ffffff']
            ))

            game.particles.push(createTextParticle(
              code.x + codeWidth / 2,
              code.y - 20,
              `+${points}`,
              GREP_COLORS.green
            ))

            setFeedback({ type: 'correct', text: `Bug squashed! ${code.snippet.explanation}` })
            setTimeout(() => setFeedback(null), 2000)

          } else {
            // Wrong line clicked
            if (!muted) playSound('error')
            game.shake = createShake(8, 300)

            setGameState(prev => ({
              ...prev,
              streak: 0,
              lives: prev.lives - 1,
            }))

            setFeedback({ type: 'wrong', text: 'Wrong line! The bug is elsewhere...' })
            setTimeout(() => setFeedback(null), 1500)

            if (gameState.lives <= 1) {
              setGameStatus('gameover')
            }
          }
          return
        }
      }
    }
  }, [gameStatus, gameState.streak, gameState.lives, muted])

  // Handle mouse move for hover effects
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    gameRef.current.lastMouseX = x
    gameRef.current.lastMouseY = y

    // Check hover state
    const game = gameRef.current
    let found = false

    for (const code of game.codes) {
      if (code.found || code.missed) continue

      const lineHeight = 24
      const padding = 16
      const codeWidth = 380
      const codeHeight = code.snippet.lines.length * lineHeight + padding * 2

      if (x >= code.x && x <= code.x + codeWidth && y >= code.y && y <= code.y + codeHeight) {
        const relativeY = y - code.y - padding
        const clickedLine = Math.floor(relativeY / lineHeight)

        if (clickedLine >= 0 && clickedLine < code.snippet.lines.length) {
          setHoveredLine({ codeId: code.id, lineIndex: clickedLine })
          found = true
          break
        }
      }
    }

    if (!found) {
      setHoveredLine(null)
    }
  }, [])

  // Start game
  const startGame = useCallback(() => {
    const game = gameRef.current
    game.codes = []
    game.particles = []
    game.nextId = 0
    game.spawnTimer = 0
    game.frameCount = 0

    setGameState({
      score: 0,
      lives: 3,
      level: 1,
      streak: 0,
      maxStreak: 0,
      bugsFound: 0,
      bossMode: false,
    })
    setFeedback(null)
    setGameStatus('playing')

    if (!muted) playSound('levelup')
  }, [muted])

  // Game loop
  useEffect(() => {
    if (gameStatus !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const game = gameRef.current

    const gameLoop = () => {
      game.frameCount++

      // Update shake
      if (game.shake) {
        game.shake.duration -= 16
        if (game.shake.duration <= 0) game.shake = null
      }

      // Spawn new code
      game.spawnTimer++
      if (game.spawnTimer >= game.spawnInterval) {
        game.spawnTimer = 0
        spawnCode()
        // Gradually speed up spawning
        game.spawnInterval = Math.max(100, 180 - gameState.level * 8)
      }

      // Update codes
      for (const code of game.codes) {
        code.x -= code.speed

        // Check if code scrolled off screen (missed)
        if (code.x + 400 < 0 && !code.found && !code.missed) {
          code.missed = true
          if (!muted) playSound('error')

          setGameState(prev => {
            const newLives = prev.lives - 1
            if (newLives <= 0) {
              setGameStatus('gameover')
            }
            return {
              ...prev,
              lives: newLives,
              streak: 0,
            }
          })

          setFeedback({ type: 'miss', text: 'Bug escaped! Lost a life.' })
          setTimeout(() => setFeedback(null), 1500)
        }
      }

      // Remove old codes
      game.codes = game.codes.filter(c => c.x > -500)

      // Update particles
      game.particles = game.particles.filter(p => {
        updateParticle(p)
        return p.life > 0
      })

      // Draw
      const shakeOffset = game.shake ? getShakeOffset(game.shake) : { x: 0, y: 0 }

      ctx.save()
      ctx.translate(shakeOffset.x, shakeOffset.y)

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#0a0a0f')
      gradient.addColorStop(1, '#1a1a2e')
      ctx.fillStyle = gradient
      ctx.fillRect(-10, -10, canvas.width + 20, canvas.height + 20)

      // Draw grid pattern
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Draw code snippets
      const lineHeight = 24
      const padding = 16

      for (const code of game.codes) {
        if (code.found) continue

        const codeWidth = 380
        const codeHeight = code.snippet.lines.length * lineHeight + padding * 2

        // Code block background
        ctx.fillStyle = code.missed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(30, 30, 50, 0.95)'
        ctx.strokeStyle = code.missed ? GREP_COLORS.red : 'rgba(139, 92, 246, 0.5)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.roundRect(code.x, code.y, codeWidth, codeHeight, 8)
        ctx.fill()
        ctx.stroke()

        // Tier badge
        const tierColors = ['#22c55e', '#eab308', '#f97316', '#ef4444']
        ctx.fillStyle = tierColors[code.snippet.tier - 1]
        ctx.font = 'bold 10px monospace'
        ctx.fillText(`T${code.snippet.tier}`, code.x + codeWidth - 30, code.y + 14)

        // Bug type badge
        ctx.fillStyle = 'rgba(139, 92, 246, 0.3)'
        ctx.beginPath()
        ctx.roundRect(code.x + 8, code.y + 4, 60, 16, 4)
        ctx.fill()
        ctx.fillStyle = GREP_COLORS.purple
        ctx.font = '10px monospace'
        ctx.fillText(code.snippet.bugType.toUpperCase(), code.x + 14, code.y + 15)

        // Draw code lines
        code.snippet.lines.forEach((line, i) => {
          const lineY = code.y + padding + i * lineHeight + 16

          // Hover highlight
          if (hoveredLine && hoveredLine.codeId === code.id && hoveredLine.lineIndex === i) {
            ctx.fillStyle = 'rgba(139, 92, 246, 0.2)'
            ctx.fillRect(code.x + 4, code.y + padding + i * lineHeight, codeWidth - 8, lineHeight)
          }

          // Line number
          ctx.fillStyle = 'rgba(156, 163, 175, 0.5)'
          ctx.font = '12px monospace'
          ctx.fillText(`${i + 1}`, code.x + 12, lineY)

          // Code text with syntax highlighting
          ctx.font = '13px monospace'
          const keywords = ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'async', 'await', 'class', 'new']
          let text = line
          let xPos = code.x + 36

          // Simple syntax highlighting
          const tokens = line.split(/(\s+|[{}()[\];,.]|=>)/)
          for (const token of tokens) {
            if (keywords.includes(token)) {
              ctx.fillStyle = GREP_COLORS.purple
            } else if (token.startsWith('"') || token.startsWith("'")) {
              ctx.fillStyle = GREP_COLORS.green
            } else if (/^\d+$/.test(token)) {
              ctx.fillStyle = GREP_COLORS.orange
            } else if (token === '=>' || token === '=' || token === '+' || token === '-') {
              ctx.fillStyle = GREP_COLORS.cyan
            } else {
              ctx.fillStyle = '#e5e7eb'
            }
            ctx.fillText(token, xPos, lineY)
            xPos += ctx.measureText(token).width
          }
        })
      }

      // Draw particles
      for (const particle of game.particles) {
        drawParticle(ctx, particle)
      }

      ctx.restore()

      game.animationId = requestAnimationFrame(gameLoop)
    }

    game.animationId = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(game.animationId)
    }
  }, [gameStatus, gameState.level, spawnCode, hoveredLine, muted])

  return (
    <main className="min-h-screen bg-dark-900 pt-20 pb-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/games"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Arcade
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setMuted(!muted)}
              className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
            >
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Game Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-display font-bold mb-2">
            <span className="text-gradient">Bug Hunter</span>
          </h1>
          <p className="text-gray-400">Find and squash the bugs before they escape!</p>
        </div>

        {/* Game Stats Bar */}
        {gameStatus === 'playing' && (
          <div className="flex items-center justify-center gap-8 mb-4 p-4 rounded-xl bg-dark-800/50 border border-dark-700">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              <span className="text-2xl font-bold text-purple-400">{gameState.score}</span>
            </div>
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-green-400" />
              <span className="text-lg text-green-400">{gameState.bugsFound}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-lg text-yellow-400">{gameState.streak}x</span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 ${i < gameState.lives ? 'text-red-500 fill-red-500' : 'text-gray-600'}`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-400">
              Level {gameState.level}
            </div>
          </div>
        )}

        {/* Game Canvas */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-dark-700 bg-dark-800">
          <canvas
            ref={canvasRef}
            width={896}
            height={500}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            className="w-full cursor-crosshair"
          />

          {/* Feedback Toast */}
          {feedback && (
            <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl font-bold ${
              feedback.type === 'correct' ? 'bg-green-500/20 border border-green-500 text-green-400' :
              feedback.type === 'wrong' ? 'bg-red-500/20 border border-red-500 text-red-400' :
              'bg-orange-500/20 border border-orange-500 text-orange-400'
            }`}>
              {feedback.text}
            </div>
          )}

          {/* Start Screen */}
          {gameStatus === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/95 backdrop-blur-sm">
              <div className="text-8xl mb-6">🐛</div>
              <h2 className="text-3xl font-display font-bold mb-4 text-gradient">Bug Hunter</h2>
              <p className="text-gray-400 mb-8 max-w-md text-center">
                Code snippets scroll across the screen. Click on the line containing the bug
                to squash it before it escapes!
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                <div className="p-3 rounded-lg bg-dark-800 border border-dark-700">
                  <div className="text-green-400 font-bold mb-1">Find the Bug</div>
                  <div className="text-gray-400">Click the buggy line</div>
                </div>
                <div className="p-3 rounded-lg bg-dark-800 border border-dark-700">
                  <div className="text-purple-400 font-bold mb-1">Build Streaks</div>
                  <div className="text-gray-400">Combo = more points</div>
                </div>
                <div className="p-3 rounded-lg bg-dark-800 border border-dark-700">
                  <div className="text-yellow-400 font-bold mb-1">Watch the Tier</div>
                  <div className="text-gray-400">T1-T4 difficulty</div>
                </div>
                <div className="p-3 rounded-lg bg-dark-800 border border-dark-700">
                  <div className="text-red-400 font-bold mb-1">Don't Miss!</div>
                  <div className="text-gray-400">3 lives total</div>
                </div>
              </div>

              <button
                onClick={startGame}
                className="flex items-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 font-bold text-xl hover:scale-105 transition-transform"
              >
                <Play className="w-6 h-6" />
                Start Hunting
              </button>
            </div>
          )}

          {/* Game Over Screen */}
          {gameStatus === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/95 backdrop-blur-sm">
              <div className="text-7xl mb-4">💀</div>
              <h2 className="text-4xl font-display font-bold mb-2 text-red-400">Game Over!</h2>

              <div className="grid grid-cols-2 gap-4 my-8 max-w-md">
                <div className="p-5 rounded-xl bg-dark-800 border border-purple-500/30 text-center">
                  <div className="text-4xl font-bold text-purple-400">{gameState.score.toLocaleString()}</div>
                  <div className="text-sm text-gray-400 mt-1">Final Score</div>
                </div>
                <div className="p-5 rounded-xl bg-dark-800 border border-green-500/30 text-center">
                  <div className="text-4xl font-bold text-green-400">{gameState.bugsFound}</div>
                  <div className="text-sm text-gray-400 mt-1">Bugs Squashed</div>
                </div>
                <div className="p-5 rounded-xl bg-dark-800 border border-yellow-500/30 text-center">
                  <div className="text-4xl font-bold text-yellow-400">{gameState.maxStreak}x</div>
                  <div className="text-sm text-gray-400 mt-1">Best Streak</div>
                </div>
                <div className="p-5 rounded-xl bg-dark-800 border border-cyan-500/30 text-center">
                  {isSubmitting ? (
                    <>
                      <div className="text-4xl font-bold text-cyan-400 animate-pulse">...</div>
                      <div className="text-sm text-gray-400 mt-1">Submitting...</div>
                    </>
                  ) : lastResult?.success ? (
                    <>
                      <div className="text-4xl font-bold text-cyan-400">+{lastResult.grepEarned}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        GREP Earned {lastResult.multiplier && lastResult.multiplier > 1 ? `(${lastResult.multiplier}x)` : ''}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-cyan-400">+{Math.floor(gameState.score / 10)}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        {isAuthenticated ? 'GREP Earned' : 'Connect wallet to earn'}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {!isAuthenticated && (
                <p className="text-sm text-yellow-400 mb-4">
                  Connect your wallet to save scores and earn GREP!
                </p>
              )}

              <div className="flex gap-4">
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 font-bold hover:scale-105 transition-transform"
                >
                  <RotateCcw className="w-5 h-5" />
                  Hunt Again
                </button>
                <Link
                  href="/games"
                  className="flex items-center gap-2 px-8 py-4 rounded-xl bg-dark-700 border border-dark-600 font-bold hover:bg-dark-600 transition-colors"
                >
                  <Trophy className="w-5 h-5" />
                  Leaderboard
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 rounded-xl bg-dark-800/50 border border-dark-700">
          <h3 className="font-bold text-lg mb-2">How to Play</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>Code snippets scroll from right to left - each has exactly ONE bug</li>
            <li>Click on the line that contains the bug to squash it</li>
            <li>Wrong clicks or letting bugs escape costs a life</li>
            <li>Build streaks for bonus points - higher tiers = more rewards!</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
