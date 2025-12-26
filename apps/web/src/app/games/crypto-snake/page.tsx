'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, RotateCcw, Volume2, VolumeX, Trophy, Coins, Zap, ArrowUp, ArrowDown, ArrowLeftIcon, ArrowRight } from 'lucide-react'
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

interface Position {
  x: number
  y: number
}

interface PowerUp {
  x: number
  y: number
  type: 'slowmo' | 'fork' | 'shield' | 'magnet'
  timer: number
}

interface GameState {
  score: number
  length: number
  coinsCollected: number
  level: number
  speedMultiplier: number
}

const GRID_SIZE = 20
const CELL_SIZE = 24
const CANVAS_WIDTH = GRID_SIZE * CELL_SIZE
const CANVAS_HEIGHT = GRID_SIZE * CELL_SIZE

export default function CryptoSnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle')

  // Score submission hooks
  const { submitScore, isSubmitting, lastResult } = useGameScore('crypto-snake')
  const { isAuthenticated } = useAuth()

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    length: 3,
    coinsCollected: 0,
    level: 1,
    speedMultiplier: 1,
  })
  const [muted, setMuted] = useState(false)
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null)

  const gameRef = useRef({
    snake: [{ x: 10, y: 10 }] as Position[],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    coin: { x: 15, y: 10 } as Position,
    specialCoin: null as Position | null,
    powerUp: null as PowerUp | null,
    particles: [] as Particle[],
    shake: null as ShakeState | null,
    animationId: 0,
    lastMoveTime: 0,
    moveInterval: 120, // ms between moves
    frameCount: 0,
    hasShield: false,
    shieldTimer: 0,
    isSlow: false,
    slowTimer: 0,
  })

  // Submit score when game ends
  useEffect(() => {
    if (gameStatus === 'gameover' && isAuthenticated && gameState.score > 0) {
      submitScore(gameState.score, gameState.length, gameState.coinsCollected)
    }
  }, [gameStatus, isAuthenticated, gameState.score, gameState.length, gameState.coinsCollected, submitScore])

  // Spawn coin at random position
  const spawnCoin = useCallback(() => {
    const game = gameRef.current
    let newPos: Position
    do {
      newPos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
    } while (game.snake.some(seg => seg.x === newPos.x && seg.y === newPos.y))
    game.coin = newPos
  }, [])

  // Spawn special coin occasionally
  const spawnSpecialCoin = useCallback(() => {
    const game = gameRef.current
    if (Math.random() < 0.15) {
      let newPos: Position
      do {
        newPos = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
        }
      } while (
        game.snake.some(seg => seg.x === newPos.x && seg.y === newPos.y) ||
        (game.coin.x === newPos.x && game.coin.y === newPos.y)
      )
      game.specialCoin = newPos
    }
  }, [])

  // Spawn power-up occasionally
  const spawnPowerUp = useCallback(() => {
    const game = gameRef.current
    if (!game.powerUp && Math.random() < 0.08) {
      let newPos: Position
      do {
        newPos = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
        }
      } while (
        game.snake.some(seg => seg.x === newPos.x && seg.y === newPos.y) ||
        (game.coin.x === newPos.x && game.coin.y === newPos.y) ||
        (game.specialCoin && game.specialCoin.x === newPos.x && game.specialCoin.y === newPos.y)
      )

      const types: PowerUp['type'][] = ['slowmo', 'shield', 'magnet']
      game.powerUp = {
        ...newPos,
        type: types[Math.floor(Math.random() * types.length)],
        timer: 300, // frames until despawn
      }
    }
  }, [])

  // Start game
  const startGame = useCallback(() => {
    const game = gameRef.current
    game.snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ]
    game.direction = { x: 1, y: 0 }
    game.nextDirection = { x: 1, y: 0 }
    game.particles = []
    game.shake = null
    game.hasShield = false
    game.shieldTimer = 0
    game.isSlow = false
    game.slowTimer = 0
    game.specialCoin = null
    game.powerUp = null
    game.moveInterval = 120
    game.lastMoveTime = 0

    spawnCoin()

    setGameState({
      score: 0,
      length: 3,
      coinsCollected: 0,
      level: 1,
      speedMultiplier: 1,
    })
    setActivePowerUp(null)
    setGameStatus('playing')

    if (!muted) playSound('levelup')
  }, [muted, spawnCoin])

  // Handle keyboard input
  useEffect(() => {
    if (gameStatus !== 'playing') return

    const handleKeyDown = (e: KeyboardEvent) => {
      const game = gameRef.current
      const dir = game.direction

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (dir.y !== 1) game.nextDirection = { x: 0, y: -1 }
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          if (dir.y !== -1) game.nextDirection = { x: 0, y: 1 }
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (dir.x !== 1) game.nextDirection = { x: -1, y: 0 }
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (dir.x !== -1) game.nextDirection = { x: 1, y: 0 }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameStatus])

  // Mobile touch direction handler
  const handleTouchDirection = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameStatus !== 'playing') return
    const game = gameRef.current
    const dir = game.direction

    switch (direction) {
      case 'up':
        if (dir.y !== 1) game.nextDirection = { x: 0, y: -1 }
        break
      case 'down':
        if (dir.y !== -1) game.nextDirection = { x: 0, y: 1 }
        break
      case 'left':
        if (dir.x !== 1) game.nextDirection = { x: -1, y: 0 }
        break
      case 'right':
        if (dir.x !== -1) game.nextDirection = { x: 1, y: 0 }
        break
    }
  }, [gameStatus])

  // Game loop
  useEffect(() => {
    if (gameStatus !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const game = gameRef.current
    let lastTime = 0

    const gameLoop = (currentTime: number) => {
      game.frameCount++
      const deltaTime = currentTime - lastTime

      // Update timers
      if (game.shieldTimer > 0) {
        game.shieldTimer--
        if (game.shieldTimer <= 0) {
          game.hasShield = false
          setActivePowerUp(null)
        }
      }
      if (game.slowTimer > 0) {
        game.slowTimer--
        if (game.slowTimer <= 0) {
          game.isSlow = false
          game.moveInterval = Math.max(50, 120 - gameState.level * 5)
          setActivePowerUp(null)
        }
      }

      // Update power-up timer
      if (game.powerUp) {
        game.powerUp.timer--
        if (game.powerUp.timer <= 0) {
          game.powerUp = null
        }
      }

      // Move snake at intervals
      const interval = game.isSlow ? game.moveInterval * 1.5 : game.moveInterval
      if (currentTime - game.lastMoveTime >= interval) {
        game.lastMoveTime = currentTime
        game.direction = game.nextDirection

        // Calculate new head position
        const head = game.snake[0]
        const newHead: Position = {
          x: head.x + game.direction.x,
          y: head.y + game.direction.y,
        }

        // Wrap around walls
        if (newHead.x < 0) newHead.x = GRID_SIZE - 1
        if (newHead.x >= GRID_SIZE) newHead.x = 0
        if (newHead.y < 0) newHead.y = GRID_SIZE - 1
        if (newHead.y >= GRID_SIZE) newHead.y = 0

        // Check self collision
        if (game.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          if (game.hasShield) {
            // Shield protects from one hit
            game.hasShield = false
            game.shieldTimer = 0
            setActivePowerUp(null)
            if (!muted) playSound('powerup')
          } else {
            if (!muted) playSound('explosion')
            setGameStatus('gameover')
            return
          }
        }

        // Add new head
        game.snake.unshift(newHead)

        // Check coin collision
        let ate = false
        if (newHead.x === game.coin.x && newHead.y === game.coin.y) {
          ate = true
          if (!muted) playSound('coin')

          const points = 10 + gameState.level * 2
          setGameState(prev => ({
            ...prev,
            score: prev.score + points,
            length: prev.length + 1,
            coinsCollected: prev.coinsCollected + 1,
            level: Math.floor((prev.coinsCollected + 1) / 5) + 1,
          }))

          game.particles.push(...createExplosion(
            newHead.x * CELL_SIZE + CELL_SIZE / 2,
            newHead.y * CELL_SIZE + CELL_SIZE / 2,
            10,
            [GREP_COLORS.yellow, GREP_COLORS.orange]
          ))

          game.particles.push(createTextParticle(
            newHead.x * CELL_SIZE + CELL_SIZE / 2,
            newHead.y * CELL_SIZE - 10,
            `+${points}`,
            GREP_COLORS.yellow
          ))

          spawnCoin()
          spawnSpecialCoin()
          spawnPowerUp()

          // Speed up
          game.moveInterval = Math.max(50, 120 - gameState.level * 5)
        }

        // Check special coin
        if (game.specialCoin && newHead.x === game.specialCoin.x && newHead.y === game.specialCoin.y) {
          ate = true
          if (!muted) playSound('success')

          const points = 50
          setGameState(prev => ({
            ...prev,
            score: prev.score + points,
            length: prev.length + 2,
          }))

          game.particles.push(...createExplosion(
            newHead.x * CELL_SIZE + CELL_SIZE / 2,
            newHead.y * CELL_SIZE + CELL_SIZE / 2,
            15,
            [GREP_COLORS.purple, GREP_COLORS.pink, GREP_COLORS.cyan]
          ))

          game.particles.push(createTextParticle(
            newHead.x * CELL_SIZE + CELL_SIZE / 2,
            newHead.y * CELL_SIZE - 10,
            `+${points}`,
            GREP_COLORS.purple
          ))

          // Grow extra for special coin
          game.snake.push({ ...game.snake[game.snake.length - 1] })
          game.specialCoin = null
        }

        // Check power-up collision
        if (game.powerUp && newHead.x === game.powerUp.x && newHead.y === game.powerUp.y) {
          if (!muted) playSound('powerup')

          switch (game.powerUp.type) {
            case 'slowmo':
              game.isSlow = true
              game.slowTimer = 300
              setActivePowerUp('Slow Mode')
              break
            case 'shield':
              game.hasShield = true
              game.shieldTimer = 600
              setActivePowerUp('Shield')
              break
            case 'magnet':
              // Magnet effect: move coin closer
              const dx = game.coin.x > newHead.x ? -3 : 3
              const dy = game.coin.y > newHead.y ? -3 : 3
              game.coin.x = Math.max(0, Math.min(GRID_SIZE - 1, game.coin.x + dx))
              game.coin.y = Math.max(0, Math.min(GRID_SIZE - 1, game.coin.y + dy))
              setActivePowerUp('Magnet!')
              setTimeout(() => setActivePowerUp(null), 1000)
              break
          }

          game.particles.push(...createExplosion(
            newHead.x * CELL_SIZE + CELL_SIZE / 2,
            newHead.y * CELL_SIZE + CELL_SIZE / 2,
            12,
            [GREP_COLORS.cyan, '#ffffff']
          ))

          game.powerUp = null
        }

        // Remove tail if didn't eat
        if (!ate) {
          game.snake.pop()
        }
      }

      // Update particles
      game.particles = game.particles.filter(p => {
        updateParticle(p)
        return p.life > 0
      })

      // Draw
      const shakeOffset = game.shake ? getShakeOffset(game.shake) : { x: 0, y: 0 }

      ctx.save()
      ctx.translate(shakeOffset.x, shakeOffset.y)

      // Background with grid
      ctx.fillStyle = '#0a0a12'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw blockchain-style grid
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)'
      ctx.lineWidth = 1
      for (let x = 0; x <= GRID_SIZE; x++) {
        ctx.beginPath()
        ctx.moveTo(x * CELL_SIZE, 0)
        ctx.lineTo(x * CELL_SIZE, CANVAS_HEIGHT)
        ctx.stroke()
      }
      for (let y = 0; y <= GRID_SIZE; y++) {
        ctx.beginPath()
        ctx.moveTo(0, y * CELL_SIZE)
        ctx.lineTo(CANVAS_WIDTH, y * CELL_SIZE)
        ctx.stroke()
      }

      // Draw power-up
      if (game.powerUp) {
        const px = game.powerUp.x * CELL_SIZE
        const py = game.powerUp.y * CELL_SIZE
        const pulse = Math.sin(game.frameCount * 0.1) * 2

        ctx.fillStyle = game.powerUp.type === 'slowmo' ? GREP_COLORS.cyan :
                        game.powerUp.type === 'shield' ? GREP_COLORS.green :
                        GREP_COLORS.pink
        ctx.shadowColor = ctx.fillStyle
        ctx.shadowBlur = 10 + pulse
        ctx.beginPath()
        ctx.arc(px + CELL_SIZE / 2, py + CELL_SIZE / 2, 8 + pulse, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        // Icon
        ctx.fillStyle = '#ffffff'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(
          game.powerUp.type === 'slowmo' ? '⏱' :
          game.powerUp.type === 'shield' ? '🛡' : '🧲',
          px + CELL_SIZE / 2,
          py + CELL_SIZE / 2 + 4
        )
      }

      // Draw coin
      const coinPulse = Math.sin(game.frameCount * 0.08) * 2
      ctx.fillStyle = GREP_COLORS.yellow
      ctx.shadowColor = GREP_COLORS.yellow
      ctx.shadowBlur = 15 + coinPulse
      ctx.beginPath()
      ctx.arc(
        game.coin.x * CELL_SIZE + CELL_SIZE / 2,
        game.coin.y * CELL_SIZE + CELL_SIZE / 2,
        8 + coinPulse,
        0,
        Math.PI * 2
      )
      ctx.fill()
      ctx.shadowBlur = 0

      // Coin symbol
      ctx.fillStyle = '#000'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('G', game.coin.x * CELL_SIZE + CELL_SIZE / 2, game.coin.y * CELL_SIZE + CELL_SIZE / 2 + 3)

      // Draw special coin
      if (game.specialCoin) {
        const sPulse = Math.sin(game.frameCount * 0.12) * 3
        ctx.fillStyle = GREP_COLORS.purple
        ctx.shadowColor = GREP_COLORS.purple
        ctx.shadowBlur = 20 + sPulse
        ctx.beginPath()
        ctx.arc(
          game.specialCoin.x * CELL_SIZE + CELL_SIZE / 2,
          game.specialCoin.y * CELL_SIZE + CELL_SIZE / 2,
          10 + sPulse,
          0,
          Math.PI * 2
        )
        ctx.fill()
        ctx.shadowBlur = 0

        ctx.fillStyle = '#fff'
        ctx.font = 'bold 12px sans-serif'
        ctx.fillText('$', game.specialCoin.x * CELL_SIZE + CELL_SIZE / 2, game.specialCoin.y * CELL_SIZE + CELL_SIZE / 2 + 4)
      }

      // Draw snake
      game.snake.forEach((segment, index) => {
        const x = segment.x * CELL_SIZE
        const y = segment.y * CELL_SIZE

        // Generate hash-like pattern for blockchain effect
        const hash = ((segment.x * 7 + segment.y * 13 + index * 3) % 16).toString(16)

        if (index === 0) {
          // Head
          const gradient = ctx.createRadialGradient(
            x + CELL_SIZE / 2, y + CELL_SIZE / 2, 0,
            x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 2
          )
          gradient.addColorStop(0, GREP_COLORS.green)
          gradient.addColorStop(1, GREP_COLORS.cyan)

          ctx.fillStyle = gradient
          if (game.hasShield) {
            ctx.shadowColor = GREP_COLORS.cyan
            ctx.shadowBlur = 15
          }
          ctx.beginPath()
          ctx.roundRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4, 6)
          ctx.fill()
          ctx.shadowBlur = 0

          // Eyes
          const dir = game.direction
          ctx.fillStyle = '#000'
          ctx.beginPath()
          ctx.arc(x + CELL_SIZE / 2 + dir.x * 4 - 3, y + CELL_SIZE / 2 + dir.y * 4 - 2, 2, 0, Math.PI * 2)
          ctx.arc(x + CELL_SIZE / 2 + dir.x * 4 + 3, y + CELL_SIZE / 2 + dir.y * 4 - 2, 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // Body - blockchain blocks
          const brightness = 1 - index / game.snake.length * 0.5
          ctx.fillStyle = `rgba(16, 185, 129, ${brightness})`
          ctx.beginPath()
          ctx.roundRect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6, 4)
          ctx.fill()

          // Hash pattern overlay
          ctx.fillStyle = `rgba(255, 255, 255, 0.1)`
          ctx.font = '8px monospace'
          ctx.fillText(hash, x + 6, y + CELL_SIZE / 2 + 2)

          // Connection lines (chain links)
          if (index < game.snake.length - 1) {
            const next = game.snake[index + 1]
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(x + CELL_SIZE / 2, y + CELL_SIZE / 2)
            ctx.lineTo(next.x * CELL_SIZE + CELL_SIZE / 2, next.y * CELL_SIZE + CELL_SIZE / 2)
            ctx.stroke()
          }
        }
      })

      // Shield visual effect
      if (game.hasShield) {
        const head = game.snake[0]
        ctx.strokeStyle = GREP_COLORS.cyan
        ctx.lineWidth = 2
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.arc(
          head.x * CELL_SIZE + CELL_SIZE / 2,
          head.y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE,
          0,
          Math.PI * 2
        )
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Draw particles
      for (const particle of game.particles) {
        drawParticle(ctx, particle)
      }

      ctx.restore()

      lastTime = currentTime
      game.animationId = requestAnimationFrame(gameLoop)
    }

    game.animationId = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(game.animationId)
    }
  }, [gameStatus, gameState.level, muted, spawnCoin, spawnSpecialCoin, spawnPowerUp])

  return (
    <main className="min-h-screen bg-dark-900 pt-20 pb-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/games"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Arcade
          </Link>

          <button
            onClick={() => setMuted(!muted)}
            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Game Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-display font-bold mb-2">
            <span className="text-gradient">Crypto Snake</span>
          </h1>
          <p className="text-gray-400">Collect GREP coins and grow your blockchain!</p>
        </div>

        {/* Game Stats Bar */}
        {gameStatus === 'playing' && (
          <div className="flex items-center justify-center gap-8 mb-4 p-4 rounded-xl bg-dark-800/50 border border-dark-700">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">{gameState.score}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg text-green-400">Length: {gameState.length}</span>
            </div>
            <div className="text-sm text-gray-400">
              Level {gameState.level}
            </div>
            {activePowerUp && (
              <div className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-bold animate-pulse">
                {activePowerUp}
              </div>
            )}
          </div>
        )}

        {/* Game Canvas */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-dark-700 bg-dark-800 flex justify-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block"
          />

          {/* Start Screen */}
          {gameStatus === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/95 backdrop-blur-sm">
              <div className="text-8xl mb-6">🐍</div>
              <h2 className="text-3xl font-display font-bold mb-4 text-gradient">Crypto Snake</h2>
              <p className="text-gray-400 mb-8 max-w-md text-center">
                Guide your blockchain snake to collect GREP coins.
                Each segment is a block in your chain!
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                <div className="p-3 rounded-lg bg-dark-800 border border-dark-700 flex items-center gap-2">
                  <ArrowUp className="w-4 h-4 text-gray-400" />
                  <ArrowDown className="w-4 h-4 text-gray-400" />
                  <ArrowLeftIcon className="w-4 h-4 text-gray-400" />
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">or WASD</span>
                </div>
                <div className="p-3 rounded-lg bg-dark-800 border border-dark-700">
                  <div className="text-yellow-400 font-bold">Collect Coins</div>
                  <div className="text-gray-400">Grow your chain</div>
                </div>
                <div className="p-3 rounded-lg bg-dark-800 border border-dark-700">
                  <div className="text-purple-400 font-bold">Special $</div>
                  <div className="text-gray-400">Worth 50 points!</div>
                </div>
                <div className="p-3 rounded-lg bg-dark-800 border border-dark-700">
                  <div className="text-cyan-400 font-bold">Power-ups</div>
                  <div className="text-gray-400">Shield, Slow, Magnet</div>
                </div>
              </div>

              <button
                onClick={startGame}
                className="flex items-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-green-500 to-cyan-500 font-bold text-xl hover:scale-105 transition-transform"
              >
                <Play className="w-6 h-6" />
                Start Game
              </button>
            </div>
          )}

          {/* Game Over Screen */}
          {gameStatus === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/95 backdrop-blur-sm">
              <div className="text-7xl mb-4">💀</div>
              <h2 className="text-4xl font-display font-bold mb-2 text-red-400">Chain Broken!</h2>

              <div className="grid grid-cols-2 gap-4 my-8 max-w-md">
                <div className="p-5 rounded-xl bg-dark-800 border border-yellow-500/30 text-center">
                  <div className="text-4xl font-bold text-yellow-400">{gameState.score}</div>
                  <div className="text-sm text-gray-400 mt-1">Final Score</div>
                </div>
                <div className="p-5 rounded-xl bg-dark-800 border border-green-500/30 text-center">
                  <div className="text-4xl font-bold text-green-400">{gameState.length}</div>
                  <div className="text-sm text-gray-400 mt-1">Chain Length</div>
                </div>
                <div className="p-5 rounded-xl bg-dark-800 border border-purple-500/30 text-center">
                  <div className="text-4xl font-bold text-purple-400">{gameState.coinsCollected}</div>
                  <div className="text-sm text-gray-400 mt-1">Coins Collected</div>
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
                        GREP {lastResult.multiplier && lastResult.multiplier > 1 ? `(${lastResult.multiplier}x)` : ''}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-cyan-400">+{Math.floor(gameState.score / 10)}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        {isAuthenticated ? 'GREP Earned' : 'Connect wallet'}
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
                  className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-cyan-500 font-bold hover:scale-105 transition-transform"
                >
                  <RotateCcw className="w-5 h-5" />
                  Play Again
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

        {/* Mobile Touch Controls */}
        {gameStatus === 'playing' && (
          <div className="mt-6 md:hidden">
            <div className="flex justify-center">
              <div className="grid grid-cols-3 gap-2 w-40">
                <div />
                <button
                  onTouchStart={() => handleTouchDirection('up')}
                  className="w-12 h-12 rounded-xl bg-dark-700 border border-dark-600 flex items-center justify-center active:bg-grep-purple/30 active:border-grep-purple transition-colors"
                >
                  <ArrowUp className="w-6 h-6" />
                </button>
                <div />
                <button
                  onTouchStart={() => handleTouchDirection('left')}
                  className="w-12 h-12 rounded-xl bg-dark-700 border border-dark-600 flex items-center justify-center active:bg-grep-purple/30 active:border-grep-purple transition-colors"
                >
                  <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div className="w-12 h-12 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-dark-600" />
                </div>
                <button
                  onTouchStart={() => handleTouchDirection('right')}
                  className="w-12 h-12 rounded-xl bg-dark-700 border border-dark-600 flex items-center justify-center active:bg-grep-purple/30 active:border-grep-purple transition-colors"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
                <div />
                <button
                  onTouchStart={() => handleTouchDirection('down')}
                  className="w-12 h-12 rounded-xl bg-dark-700 border border-dark-600 flex items-center justify-center active:bg-grep-purple/30 active:border-grep-purple transition-colors"
                >
                  <ArrowDown className="w-6 h-6" />
                </button>
                <div />
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 rounded-xl bg-dark-800/50 border border-dark-700">
          <h3 className="font-bold text-lg mb-2">How to Play</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li className="hidden md:block">Use arrow keys or WASD to control the snake</li>
            <li className="md:hidden">Use the D-pad below to control the snake</li>
            <li>Collect yellow GREP coins to grow and earn points</li>
            <li>Purple $ coins are worth 50 points and grow you by 2!</li>
            <li>Grab power-ups: Shield protects from one crash, Slow-mo reduces speed</li>
            <li>Don't crash into yourself - the walls wrap around!</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
