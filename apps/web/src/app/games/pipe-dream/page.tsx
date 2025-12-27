'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, Trophy, Zap, Clock } from 'lucide-react'
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

// Pipe types: 0=empty, 1=horizontal, 2=vertical, 3=corner_NE, 4=corner_SE, 5=corner_SW, 6=corner_NW, 7=cross
type PipeType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

interface Tile {
  pipe: PipeType
  filled: number // 0-1 how filled
  isSource: boolean
  isEnd: boolean
  locked: boolean
}

interface GameState {
  score: number
  level: number
  pipesPlaced: number
  tilesFlooded: number
}

const GRID_SIZE = 7
const TILE_SIZE = 60
const CANVAS_SIZE = GRID_SIZE * TILE_SIZE

// Pipe connection directions: [top, right, bottom, left]
const PIPE_CONNECTIONS: Record<PipeType, boolean[]> = {
  0: [false, false, false, false], // empty
  1: [false, true, false, true],   // horizontal
  2: [true, false, true, false],   // vertical
  3: [true, true, false, false],   // corner NE (top-right)
  4: [false, true, true, false],   // corner SE (right-bottom)
  5: [false, false, true, true],   // corner SW (bottom-left)
  6: [true, false, false, true],   // corner NW (top-left)
  7: [true, true, true, true],     // cross (all directions)
}

// Pipe pool for placing
const PIPE_POOL: PipeType[] = [1, 1, 2, 2, 3, 4, 5, 6, 3, 4, 5, 6, 7]

export default function PipeDreamGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'paused' | 'gameover' | 'victory'>('idle')

  const { submitScore, isSubmitting, lastResult } = useGameScore('pipe-dream')
  const { isAuthenticated } = useAuth()

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    pipesPlaced: 0,
    tilesFlooded: 0,
  })
  const [muted, setMuted] = useState(false)
  const [grid, setGrid] = useState<Tile[][]>([])
  const [nextPipes, setNextPipes] = useState<PipeType[]>([])
  const [flowStarted, setFlowStarted] = useState(false)
  const [flowTimer, setFlowTimer] = useState(15)
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null)

  const gameRef = useRef({
    animationId: 0,
    particles: [] as Particle[],
    shake: null as ShakeState | null,
    frameCount: 0,
    flowProgress: 0,
    currentFlowTile: null as { x: number; y: number; fromDir: number } | null,
    flowPath: [] as { x: number; y: number }[],
  })

  // Initialize level
  const initLevel = useCallback((level: number) => {
    // Create empty grid
    const newGrid: Tile[][] = Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null).map(() => ({
        pipe: 0 as PipeType,
        filled: 0,
        isSource: false,
        isEnd: false,
        locked: false,
      }))
    )

    // Place source (left side)
    const sourceY = Math.floor(GRID_SIZE / 2)
    newGrid[sourceY][0] = {
      pipe: 1,
      filled: 0,
      isSource: true,
      isEnd: false,
      locked: true,
    }

    // Place end (right side) - position varies by level
    const endY = level <= 3 ? sourceY : Math.floor(Math.random() * (GRID_SIZE - 2)) + 1
    newGrid[endY][GRID_SIZE - 1] = {
      pipe: 1,
      filled: 0,
      isSource: false,
      isEnd: true,
      locked: true,
    }

    // Add some obstacles for higher levels
    if (level >= 3) {
      const obstacles = Math.min(level - 2, 5)
      for (let i = 0; i < obstacles; i++) {
        const ox = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1
        const oy = Math.floor(Math.random() * GRID_SIZE)
        if (!newGrid[oy][ox].isSource && !newGrid[oy][ox].isEnd) {
          newGrid[oy][ox].locked = true
        }
      }
    }

    setGrid(newGrid)
    setFlowStarted(false)
    setFlowTimer(Math.max(10, 20 - level * 2))

    gameRef.current.flowProgress = 0
    gameRef.current.currentFlowTile = { x: 0, y: sourceY, fromDir: 3 }
    gameRef.current.flowPath = [{ x: 0, y: sourceY }]

    // Generate next pipes
    const pipes: PipeType[] = []
    for (let i = 0; i < 5; i++) {
      pipes.push(PIPE_POOL[Math.floor(Math.random() * PIPE_POOL.length)])
    }
    setNextPipes(pipes)
  }, [])

  // Place a pipe
  const placePipe = useCallback((x: number, y: number) => {
    if (gameStatus !== 'playing' || nextPipes.length === 0) return

    const tile = grid[y]?.[x]
    if (!tile || tile.locked || tile.filled > 0) return

    if (!muted) playSound('click')

    // Place the pipe
    const newGrid = [...grid.map(row => [...row])]
    newGrid[y][x] = { ...tile, pipe: nextPipes[0] }
    setGrid(newGrid)

    // Shift pipe queue
    const newPipes = [...nextPipes.slice(1)]
    newPipes.push(PIPE_POOL[Math.floor(Math.random() * PIPE_POOL.length)])
    setNextPipes(newPipes)

    setGameState(prev => ({ ...prev, pipesPlaced: prev.pipesPlaced + 1 }))

    // Start flow timer if not started
    if (!flowStarted) {
      setFlowStarted(true)
    }
  }, [gameStatus, grid, nextPipes, flowStarted, muted])

  // Flow countdown
  useEffect(() => {
    if (gameStatus !== 'playing' || !flowStarted) return

    const timer = setInterval(() => {
      setFlowTimer(prev => {
        if (prev <= 1) {
          // Start flowing
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStatus, flowStarted])

  // Game loop
  useEffect(() => {
    if (gameStatus !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const animate = () => {
      const game = gameRef.current
      game.frameCount++

      const shakeOffset = getShakeOffset(game.shake)
      ctx.save()
      ctx.translate(shakeOffset.x, shakeOffset.y)

      // Background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE)
      bgGradient.addColorStop(0, '#0a0a12')
      bgGradient.addColorStop(1, '#12121f')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

      // Draw grid
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const tile = grid[y][x]
          const px = x * TILE_SIZE
          const py = y * TILE_SIZE

          // Tile background
          if (tile.locked && !tile.isSource && !tile.isEnd) {
            ctx.fillStyle = '#1a1a2e'
          } else if (hoveredTile?.x === x && hoveredTile?.y === y && !tile.locked && tile.filled === 0) {
            ctx.fillStyle = '#2a2a4e'
          } else {
            ctx.fillStyle = '#1e1e32'
          }
          ctx.fillRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2)

          // Draw pipe
          if (tile.pipe !== 0) {
            ctx.strokeStyle = tile.filled > 0 ? GREP_COLORS.cyan : '#4a4a6e'
            ctx.lineWidth = 12
            ctx.lineCap = 'round'

            const cx = px + TILE_SIZE / 2
            const cy = py + TILE_SIZE / 2
            const halfTile = TILE_SIZE / 2

            ctx.beginPath()

            switch (tile.pipe) {
              case 1: // horizontal
                ctx.moveTo(px, cy)
                ctx.lineTo(px + TILE_SIZE, cy)
                break
              case 2: // vertical
                ctx.moveTo(cx, py)
                ctx.lineTo(cx, py + TILE_SIZE)
                break
              case 3: // NE corner
                ctx.moveTo(cx, py)
                ctx.quadraticCurveTo(cx, cy, px + TILE_SIZE, cy)
                break
              case 4: // SE corner
                ctx.moveTo(px + TILE_SIZE, cy)
                ctx.quadraticCurveTo(cx, cy, cx, py + TILE_SIZE)
                break
              case 5: // SW corner
                ctx.moveTo(cx, py + TILE_SIZE)
                ctx.quadraticCurveTo(cx, cy, px, cy)
                break
              case 6: // NW corner
                ctx.moveTo(px, cy)
                ctx.quadraticCurveTo(cx, cy, cx, py)
                break
              case 7: // cross
                ctx.moveTo(px, cy)
                ctx.lineTo(px + TILE_SIZE, cy)
                ctx.moveTo(cx, py)
                ctx.lineTo(cx, py + TILE_SIZE)
                break
            }

            ctx.stroke()

            // Glow for filled pipes
            if (tile.filled > 0) {
              ctx.shadowColor = GREP_COLORS.cyan
              ctx.shadowBlur = 15
              ctx.stroke()
              ctx.shadowBlur = 0
            }

            // Source/End markers
            if (tile.isSource) {
              ctx.fillStyle = GREP_COLORS.green
              ctx.font = 'bold 12px monospace'
              ctx.textAlign = 'center'
              ctx.fillText('IN', cx, cy + 4)
            } else if (tile.isEnd) {
              ctx.fillStyle = GREP_COLORS.purple
              ctx.font = 'bold 12px monospace'
              ctx.textAlign = 'center'
              ctx.fillText('OUT', cx, cy + 4)
            }
          }

          // Locked/obstacle marker
          if (tile.locked && !tile.isSource && !tile.isEnd && tile.pipe === 0) {
            ctx.fillStyle = '#3a3a4e'
            ctx.font = 'bold 20px monospace'
            ctx.textAlign = 'center'
            ctx.fillText('X', px + TILE_SIZE / 2, py + TILE_SIZE / 2 + 6)
          }
        }
      }

      // Flow animation
      if (flowStarted && flowTimer === 0 && game.currentFlowTile) {
        game.flowProgress += 0.02 * (1 + gameState.level * 0.1)

        if (game.flowProgress >= 1) {
          game.flowProgress = 0

          // Mark current tile as filled
          const { x, y, fromDir } = game.currentFlowTile
          const tile = grid[y][x]

          if (tile.pipe !== 0) {
            const newGrid = [...grid.map(row => [...row])]
            newGrid[y][x] = { ...tile, filled: 1 }
            setGrid(newGrid)

            // Check if reached end
            if (tile.isEnd) {
              if (!muted) playSound('levelup')
              setGameState(prev => ({
                ...prev,
                score: prev.score + 500 + prev.level * 100,
                level: prev.level + 1,
                tilesFlooded: prev.tilesFlooded + game.flowPath.length,
              }))

              if (gameState.level >= 10) {
                setGameStatus('victory')
              } else {
                setTimeout(() => initLevel(gameState.level + 1), 1000)
              }
              game.currentFlowTile = null
              return
            }

            // Find next tile
            const connections = PIPE_CONNECTIONS[tile.pipe]
            const dirs = [
              { dx: 0, dy: -1, from: 2, to: 0 }, // up
              { dx: 1, dy: 0, from: 3, to: 1 },  // right
              { dx: 0, dy: 1, from: 0, to: 2 },  // down
              { dx: -1, dy: 0, from: 1, to: 3 }, // left
            ]

            let foundNext = false
            for (const dir of dirs) {
              if (dir.from === fromDir) continue // Don't go back

              if (connections[dir.to]) {
                const nx = x + dir.dx
                const ny = y + dir.dy

                if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
                  const nextTile = grid[ny][nx]
                  const nextConnections = PIPE_CONNECTIONS[nextTile.pipe]

                  if (nextTile.pipe !== 0 && nextConnections[dir.from] && nextTile.filled === 0) {
                    game.currentFlowTile = { x: nx, y: ny, fromDir: dir.from }
                    game.flowPath.push({ x: nx, y: ny })
                    foundNext = true

                    setGameState(prev => ({
                      ...prev,
                      score: prev.score + 10 + prev.level * 5,
                    }))

                    if (!muted) playSound('coin')
                    break
                  }
                }
              }
            }

            if (!foundNext) {
              // Flow leaked - game over
              if (!muted) playSound('error')
              game.shake = createShake(10, 500)
              setTimeout(() => setGameStatus('gameover'), 500)
              game.currentFlowTile = null
            }
          } else {
            // No pipe - game over
            if (!muted) playSound('error')
            game.shake = createShake(10, 500)
            setTimeout(() => setGameStatus('gameover'), 500)
            game.currentFlowTile = null
          }
        }
      }

      // Draw particles
      game.particles = game.particles.filter(p => {
        if (updateParticle(p)) {
          drawParticle(ctx, p, 0)
          return true
        }
        return false
      })

      // HUD
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      ctx.fillRect(0, CANVAS_SIZE - 50, CANVAS_SIZE, 50)

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 14px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`Level ${gameState.level}/10`, 10, CANVAS_SIZE - 30)
      ctx.fillText(`Score: ${gameState.score}`, 10, CANVAS_SIZE - 12)

      if (flowStarted && flowTimer > 0) {
        ctx.fillStyle = flowTimer <= 5 ? GREP_COLORS.red : GREP_COLORS.yellow
        ctx.textAlign = 'right'
        ctx.fillText(`Flow starts in: ${flowTimer}s`, CANVAS_SIZE - 10, CANVAS_SIZE - 20)
      } else if (flowStarted) {
        ctx.fillStyle = GREP_COLORS.cyan
        ctx.textAlign = 'right'
        ctx.fillText('FLOWING!', CANVAS_SIZE - 10, CANVAS_SIZE - 20)
      } else {
        ctx.fillStyle = '#888'
        ctx.textAlign = 'right'
        ctx.fillText('Place pipes to start!', CANVAS_SIZE - 10, CANVAS_SIZE - 20)
      }

      ctx.restore()

      game.animationId = requestAnimationFrame(animate)
    }

    gameRef.current.animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(gameRef.current.animationId)
    }
  }, [gameStatus, grid, gameState, flowStarted, flowTimer, hoveredTile, muted, initLevel])

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameStatus !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE)
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE)

    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      placePipe(x, y)
    }
  }, [gameStatus, placePipe])

  // Handle mouse move for hover
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE)
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE)

    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      setHoveredTile({ x, y })
    } else {
      setHoveredTile(null)
    }
  }, [])

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
      submitScore(gameState.score, gameState.level, gameState.tilesFlooded)
    }
  }, [gameStatus, isAuthenticated, gameState.score, gameState.level, gameState.tilesFlooded, submitScore])

  // Start game
  const startGame = () => {
    setGameState({
      score: 0,
      level: 1,
      pipesPlaced: 0,
      tilesFlooded: 0,
    })
    gameRef.current.particles = []
    gameRef.current.shake = null
    initLevel(1)
    setGameStatus('playing')
    if (!muted) playSound('levelup')
  }

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
        <div className="flex gap-6 items-start">
          {/* Main game canvas */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE + 50}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredTile(null)}
              className="rounded-2xl border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20 cursor-pointer"
            />

            {/* Start Screen */}
            {gameStatus === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/95 rounded-2xl backdrop-blur-sm">
                <div className="text-7xl mb-6">🔧</div>
                <h2 className="text-4xl font-display font-bold mb-3">
                  <span className="text-gradient">Pipe Dream</span>
                </h2>
                <p className="text-gray-400 mb-6 text-center max-w-sm">
                  Connect pipes to guide the data flow from IN to OUT. Place pipes fast before the flow starts!
                </p>

                <button
                  onClick={startGame}
                  className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-cyan-500/30"
                >
                  <Play className="w-5 h-5" />
                  Start Game
                </button>

                <div className="mt-8 grid grid-cols-2 gap-3 text-xs max-w-sm">
                  <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700 text-center">
                    <span className="text-xl">🔧</span>
                    <div className="text-gray-400 mt-1">Click to place pipes</div>
                  </div>
                  <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700 text-center">
                    <span className="text-xl">⏱️</span>
                    <div className="text-gray-400 mt-1">Flow starts after timer</div>
                  </div>
                  <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700 text-center">
                    <span className="text-xl">🎯</span>
                    <div className="text-gray-400 mt-1">Connect IN to OUT</div>
                  </div>
                  <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700 text-center">
                    <span className="text-xl">📈</span>
                    <div className="text-gray-400 mt-1">10 levels to master</div>
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
                  <div className="p-3 rounded-xl bg-dark-800 border border-cyan-500/30">
                    <div className="text-xl font-bold text-cyan-400">{gameState.score}</div>
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
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-bold hover:scale-105 transition-transform"
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
                <div className="text-6xl mb-4">💧</div>
                <h2 className="text-3xl font-display font-bold mb-2 text-red-400">Leak Detected!</h2>

                <div className="grid grid-cols-2 gap-3 my-6 text-center">
                  <div className="p-4 rounded-xl bg-dark-800 border border-cyan-500/30">
                    <div className="text-2xl font-bold text-cyan-400">{gameState.score}</div>
                    <div className="text-xs text-gray-400">Score</div>
                  </div>
                  <div className="p-4 rounded-xl bg-dark-800 border border-yellow-500/30">
                    <div className="text-2xl font-bold text-yellow-400">Lv.{gameState.level}</div>
                    <div className="text-xs text-gray-400">Level</div>
                  </div>
                  <div className="p-4 rounded-xl bg-dark-800 border border-green-500/30">
                    <div className="text-2xl font-bold text-green-400">{gameState.pipesPlaced}</div>
                    <div className="text-xs text-gray-400">Pipes</div>
                  </div>
                  <div className="p-4 rounded-xl bg-dark-800 border border-purple-500/30">
                    {isSubmitting ? (
                      <>
                        <div className="text-2xl font-bold text-purple-400 animate-pulse">...</div>
                        <div className="text-xs text-gray-400">Submitting</div>
                      </>
                    ) : lastResult?.success ? (
                      <>
                        <div className="text-2xl font-bold text-purple-400">+{lastResult.grepEarned}</div>
                        <div className="text-xs text-gray-400">GREP</div>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-purple-400">+{Math.floor(gameState.score / 15)}</div>
                        <div className="text-xs text-gray-400">{isAuthenticated ? 'GREP' : 'Login'}</div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={startGame}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-bold hover:scale-105 transition-transform"
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
                  <div className="p-4 rounded-xl bg-dark-800 border border-cyan-500/30">
                    <div className="text-2xl font-bold text-cyan-400">{gameState.score}</div>
                    <div className="text-xs text-gray-400">Final Score</div>
                  </div>
                  <div className="p-4 rounded-xl bg-dark-800 border border-green-500/30">
                    <div className="text-2xl font-bold text-green-400">{gameState.tilesFlooded}</div>
                    <div className="text-xs text-gray-400">Tiles Flooded</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={startGame}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-bold hover:scale-105 transition-transform"
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

          {/* Next pipes panel */}
          {(gameStatus === 'playing' || gameStatus === 'paused') && (
            <div className="w-32 space-y-4">
              <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700">
                <div className="text-xs text-gray-400 mb-3 text-center">Next Pipes</div>
                <div className="space-y-2">
                  {nextPipes.map((pipe, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg border ${i === 0 ? 'border-cyan-500 bg-cyan-500/10' : 'border-dark-600 bg-dark-800'} flex items-center justify-center`}
                    >
                      <svg width="40" height="40" viewBox="0 0 40 40">
                        <line
                          x1={pipe === 1 || pipe === 7 ? 0 : pipe === 3 || pipe === 6 ? 20 : pipe === 4 || pipe === 5 ? 40 : 20}
                          y1={pipe === 2 || pipe === 7 ? 0 : pipe === 3 || pipe === 4 ? 20 : pipe === 5 || pipe === 6 ? 40 : 20}
                          x2={pipe === 1 || pipe === 7 ? 40 : pipe === 3 || pipe === 6 ? 20 : pipe === 4 || pipe === 5 ? 0 : 20}
                          y2={pipe === 2 || pipe === 7 ? 40 : pipe === 5 || pipe === 6 ? 20 : pipe === 3 || pipe === 4 ? 40 : 20}
                          stroke={i === 0 ? GREP_COLORS.cyan : '#4a4a6e'}
                          strokeWidth="6"
                          strokeLinecap="round"
                        />
                        {pipe === 7 && (
                          <line x1="20" y1="0" x2="20" y2="40" stroke={i === 0 ? GREP_COLORS.cyan : '#4a4a6e'} strokeWidth="6" strokeLinecap="round" />
                        )}
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
