'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, Trophy, Code, Zap, ArrowDown, ArrowLeftIcon, ArrowRight, RotateCw } from 'lucide-react'
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
} from '@/lib/gameUtils'

// Code tokens that can fall
interface Token {
  text: string
  type: 'keyword' | 'operator' | 'identifier' | 'literal' | 'punctuation'
  color: string
}

const TOKENS: Token[] = [
  { text: 'const', type: 'keyword', color: GREP_COLORS.purple },
  { text: 'let', type: 'keyword', color: GREP_COLORS.purple },
  { text: 'var', type: 'keyword', color: GREP_COLORS.purple },
  { text: 'function', type: 'keyword', color: GREP_COLORS.purple },
  { text: 'return', type: 'keyword', color: GREP_COLORS.purple },
  { text: 'if', type: 'keyword', color: GREP_COLORS.purple },
  { text: '=', type: 'operator', color: GREP_COLORS.cyan },
  { text: '=>', type: 'operator', color: GREP_COLORS.cyan },
  { text: '+', type: 'operator', color: GREP_COLORS.cyan },
  { text: '-', type: 'operator', color: GREP_COLORS.cyan },
  { text: 'x', type: 'identifier', color: '#e5e7eb' },
  { text: 'y', type: 'identifier', color: '#e5e7eb' },
  { text: 'n', type: 'identifier', color: '#e5e7eb' },
  { text: 'sum', type: 'identifier', color: '#e5e7eb' },
  { text: '42', type: 'literal', color: GREP_COLORS.orange },
  { text: '0', type: 'literal', color: GREP_COLORS.orange },
  { text: '1', type: 'literal', color: GREP_COLORS.orange },
  { text: 'true', type: 'literal', color: GREP_COLORS.orange },
  { text: '(', type: 'punctuation', color: GREP_COLORS.yellow },
  { text: ')', type: 'punctuation', color: GREP_COLORS.yellow },
  { text: '{', type: 'punctuation', color: GREP_COLORS.yellow },
  { text: '}', type: 'punctuation', color: GREP_COLORS.yellow },
  { text: ';', type: 'punctuation', color: GREP_COLORS.yellow },
]

// Valid statement patterns (simplified)
const VALID_PATTERNS = [
  ['const', 'x', '=', '42', ';'],
  ['const', 'x', '=', '0', ';'],
  ['const', 'x', '=', '1', ';'],
  ['let', 'x', '=', '42', ';'],
  ['let', 'y', '=', '0', ';'],
  ['let', 'n', '=', '1', ';'],
  ['var', 'x', '=', '42', ';'],
  ['const', 'sum', '=', 'x', '+', 'y', ';'],
  ['let', 'sum', '=', 'x', '+', 'y', ';'],
  ['return', 'x', ';'],
  ['return', 'true', ';'],
  ['return', '42', ';'],
  ['return', 'x', '+', 'y', ';'],
  ['if', '(', 'x', ')', '{', '}'],
  ['if', '(', 'true', ')', '{', '}'],
]

interface FallingBlock {
  token: Token
  x: number
  y: number
  targetY: number
}

interface PlacedBlock {
  token: Token
  x: number
  y: number
}

interface GameState {
  score: number
  level: number
  linesCleared: number
  combo: number
  maxCombo: number
}

const GRID_WIDTH = 10
const GRID_HEIGHT = 16
const CELL_WIDTH = 60
const CELL_HEIGHT = 32
const CANVAS_WIDTH = GRID_WIDTH * CELL_WIDTH
const CANVAS_HEIGHT = GRID_HEIGHT * CELL_HEIGHT

export default function SyntaxSprintGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle')

  // Score submission hooks
  const { submitScore, isSubmitting, lastResult } = useGameScore('syntax-sprint')
  const { isAuthenticated } = useAuth()

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    linesCleared: 0,
    combo: 0,
    maxCombo: 0,
  })
  const [muted, setMuted] = useState(false)
  const [nextToken, setNextToken] = useState<Token | null>(null)

  const gameRef = useRef({
    animationId: 0,
    currentBlock: null as FallingBlock | null,
    placedBlocks: [] as PlacedBlock[],
    grid: Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null)) as (Token | null)[][],
    particles: [] as Particle[],
    shake: null as ShakeState | null,
    lastDropTime: 0,
    dropInterval: 800, // ms between auto drops
    frameCount: 0,
    nextTokenQueue: [] as Token[],
  })

  // Submit score when game ends
  useEffect(() => {
    if (gameStatus === 'gameover' && isAuthenticated && gameState.score > 0) {
      submitScore(gameState.score, gameState.maxCombo, gameState.linesCleared)
    }
  }, [gameStatus, isAuthenticated, gameState.score, gameState.maxCombo, gameState.linesCleared, submitScore])

  // Get random token
  const getRandomToken = useCallback((): Token => {
    return TOKENS[Math.floor(Math.random() * TOKENS.length)]
  }, [])

  // Spawn new block
  const spawnBlock = useCallback(() => {
    const game = gameRef.current

    // Use queued token or generate new one
    const token = game.nextTokenQueue.shift() || getRandomToken()

    // Refill queue
    while (game.nextTokenQueue.length < 3) {
      game.nextTokenQueue.push(getRandomToken())
    }
    setNextToken(game.nextTokenQueue[0])

    // Find landing position
    const x = Math.floor(GRID_WIDTH / 2)

    game.currentBlock = {
      token,
      x,
      y: 0,
      targetY: 0,
    }
  }, [getRandomToken])

  // Check for valid lines
  const checkLines = useCallback(() => {
    const game = gameRef.current
    const grid = game.grid
    let linesCleared = 0
    let totalPoints = 0

    // Check each row from bottom to top
    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
      const row = grid[y]
      const tokens = row.filter(t => t !== null).map(t => t!.text)

      if (tokens.length === 0) continue

      // Check if row matches any valid pattern
      const rowStr = tokens.join(' ')
      let isValid = false

      for (const pattern of VALID_PATTERNS) {
        // Check for exact pattern match only
        const patternStr = pattern.join(' ')
        if (rowStr === patternStr) {
          isValid = true
          break
        }
      }

      // Check for valid syntax patterns with proper structure
      if (!isValid && tokens.length >= 3) {
        // Variable declaration: (const|let|var) identifier = value ;
        if (
          ['const', 'let', 'var'].includes(tokens[0]) &&
          /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tokens[1]) && // valid identifier
          tokens[2] === '=' &&
          tokens[tokens.length - 1] === ';' &&
          tokens.length >= 5 // minimum: const x = 1 ;
        ) {
          // Verify there's at least one value between = and ;
          const valueTokens = tokens.slice(3, -1)
          if (valueTokens.length > 0 && valueTokens.every(t =>
            /^[a-zA-Z0-9_]+$/.test(t) || ['+', '-', '*', '/', '(', ')'].includes(t)
          )) {
            isValid = true
          }
        }

        // Return statement: return value ;
        if (
          tokens[0] === 'return' &&
          tokens[tokens.length - 1] === ';' &&
          tokens.length >= 3 // minimum: return x ;
        ) {
          // Verify there's a valid expression between return and ;
          const exprTokens = tokens.slice(1, -1)
          if (exprTokens.length > 0 && exprTokens.every(t =>
            /^[a-zA-Z0-9_]+$/.test(t) || ['+', '-', '*', '/', '(', ')'].includes(t)
          )) {
            isValid = true
          }
        }

        // If statement: if ( condition ) { }
        if (
          tokens[0] === 'if' &&
          tokens[1] === '(' &&
          tokens.includes(')') &&
          tokens.includes('{') &&
          tokens[tokens.length - 1] === '}'
        ) {
          const closeParenIdx = tokens.indexOf(')')
          const openBraceIdx = tokens.indexOf('{')
          // Must have content between ( and ), and { must come after )
          if (closeParenIdx > 2 && openBraceIdx === closeParenIdx + 1) {
            isValid = true
          }
        }
      }

      if (isValid) {
        linesCleared++

        // Award points based on tokens in line
        const linePoints = tokens.length * 25 * (gameState.level)

        // Create explosion for each token
        for (let x = 0; x < GRID_WIDTH; x++) {
          if (grid[y][x]) {
            game.particles.push(...createExplosion(
              x * CELL_WIDTH + CELL_WIDTH / 2,
              y * CELL_HEIGHT + CELL_HEIGHT / 2,
              8,
              [GREP_COLORS.green, GREP_COLORS.cyan, '#ffffff']
            ))
          }
        }

        game.particles.push(createTextParticle(
          CANVAS_WIDTH / 2,
          y * CELL_HEIGHT,
          `+${linePoints}`,
          GREP_COLORS.green
        ))

        totalPoints += linePoints

        // Clear the row
        grid[y] = Array(GRID_WIDTH).fill(null)

        // Move all rows above down
        for (let yy = y; yy > 0; yy--) {
          grid[yy] = [...grid[yy - 1]]
        }
        grid[0] = Array(GRID_WIDTH).fill(null)

        // Check same row again since rows moved
        y++

        if (!muted) playSound('success')
      }
    }

    if (linesCleared > 0) {
      const comboBonus = linesCleared > 1 ? linesCleared * 50 : 0

      setGameState(prev => ({
        ...prev,
        score: prev.score + totalPoints + comboBonus,
        linesCleared: prev.linesCleared + linesCleared,
        combo: prev.combo + linesCleared,
        maxCombo: Math.max(prev.maxCombo, prev.combo + linesCleared),
        level: Math.floor((prev.linesCleared + linesCleared) / 5) + 1,
      }))

      // Update drop speed
      game.dropInterval = Math.max(200, 800 - gameState.level * 50)
    } else {
      // Reset combo on no lines
      setGameState(prev => ({ ...prev, combo: 0 }))
    }
  }, [gameState.level, muted])

  // Place current block
  const placeBlock = useCallback(() => {
    const game = gameRef.current
    if (!game.currentBlock) return

    const { token, x, y } = game.currentBlock

    // Check if position is valid
    if (y >= GRID_HEIGHT || game.grid[Math.floor(y)][x] !== null) {
      // Game over if can't place at top
      if (y <= 1) {
        if (!muted) playSound('explosion')
        setGameStatus('gameover')
        return
      }
    }

    // Place in grid
    const gridY = Math.min(Math.floor(y), GRID_HEIGHT - 1)
    if (game.grid[gridY][x] === null) {
      game.grid[gridY][x] = token
    } else {
      // Find next available spot above
      for (let yy = gridY - 1; yy >= 0; yy--) {
        if (game.grid[yy][x] === null) {
          game.grid[yy][x] = token
          break
        }
      }
    }

    if (!muted) playSound('whoosh')

    // Check for completed lines
    checkLines()

    // Spawn next block
    game.currentBlock = null
    spawnBlock()
  }, [checkLines, spawnBlock, muted])

  // Move block
  const moveBlock = useCallback((dx: number) => {
    const game = gameRef.current
    if (!game.currentBlock) return

    const newX = game.currentBlock.x + dx
    if (newX >= 0 && newX < GRID_WIDTH) {
      // Check if position is free
      const y = Math.floor(game.currentBlock.y)
      if (y >= GRID_HEIGHT || game.grid[y][newX] === null) {
        game.currentBlock.x = newX
      }
    }
  }, [])

  // Hard drop
  const hardDrop = useCallback(() => {
    const game = gameRef.current
    if (!game.currentBlock) return

    // Find landing position
    let landY = Math.floor(game.currentBlock.y)
    while (landY < GRID_HEIGHT - 1 && game.grid[landY + 1][game.currentBlock.x] === null) {
      landY++
    }

    game.currentBlock.y = landY
    placeBlock()
  }, [placeBlock])

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

  // Start game
  const startGame = useCallback(() => {
    const game = gameRef.current
    game.grid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null))
    game.particles = []
    game.shake = null
    game.currentBlock = null
    game.lastDropTime = 0
    game.dropInterval = 800
    game.nextTokenQueue = []

    // Fill token queue
    for (let i = 0; i < 3; i++) {
      game.nextTokenQueue.push(getRandomToken())
    }
    setNextToken(game.nextTokenQueue[0])

    setGameState({
      score: 0,
      level: 1,
      linesCleared: 0,
      combo: 0,
      maxCombo: 0,
    })
    setGameStatus('playing')

    if (!muted) playSound('levelup')

    // Spawn first block
    setTimeout(() => spawnBlock(), 500)
  }, [muted, getRandomToken, spawnBlock])

  // Handle keyboard input
  useEffect(() => {
    if (gameStatus !== 'playing') return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          moveBlock(-1)
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          moveBlock(1)
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          // Soft drop
          const game = gameRef.current
          if (game.currentBlock) {
            const newY = game.currentBlock.y + 1
            if (newY < GRID_HEIGHT && game.grid[Math.floor(newY)][game.currentBlock.x] === null) {
              game.currentBlock.y = newY
            } else {
              placeBlock()
            }
          }
          break
        case ' ':
          e.preventDefault()
          hardDrop()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameStatus, moveBlock, placeBlock, hardDrop])

  // Game loop
  useEffect(() => {
    if (gameStatus !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const game = gameRef.current

    const gameLoop = (currentTime: number) => {
      game.frameCount++

      // Auto drop
      if (game.currentBlock && currentTime - game.lastDropTime >= game.dropInterval) {
        game.lastDropTime = currentTime
        const newY = game.currentBlock.y + 1

        if (newY >= GRID_HEIGHT || game.grid[Math.floor(newY)][game.currentBlock.x] !== null) {
          placeBlock()
        } else {
          game.currentBlock.y = newY
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

      // Background
      ctx.fillStyle = '#0a0a12'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Grid lines
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)'
      ctx.lineWidth = 1
      for (let x = 0; x <= GRID_WIDTH; x++) {
        ctx.beginPath()
        ctx.moveTo(x * CELL_WIDTH, 0)
        ctx.lineTo(x * CELL_WIDTH, CANVAS_HEIGHT)
        ctx.stroke()
      }
      for (let y = 0; y <= GRID_HEIGHT; y++) {
        ctx.beginPath()
        ctx.moveTo(0, y * CELL_HEIGHT)
        ctx.lineTo(CANVAS_WIDTH, y * CELL_HEIGHT)
        ctx.stroke()
      }

      // Draw placed blocks
      for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
          const token = game.grid[y][x]
          if (token) {
            const px = x * CELL_WIDTH
            const py = y * CELL_HEIGHT

            // Block background
            ctx.fillStyle = 'rgba(30, 30, 50, 0.9)'
            ctx.strokeStyle = token.color
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.roundRect(px + 2, py + 2, CELL_WIDTH - 4, CELL_HEIGHT - 4, 4)
            ctx.fill()
            ctx.stroke()

            // Token text
            ctx.fillStyle = token.color
            ctx.font = 'bold 14px monospace'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(token.text, px + CELL_WIDTH / 2, py + CELL_HEIGHT / 2)
          }
        }
      }

      // Draw falling block
      if (game.currentBlock) {
        const { token, x, y } = game.currentBlock
        const px = x * CELL_WIDTH
        const py = y * CELL_HEIGHT

        // Ghost (landing preview)
        let ghostY = Math.floor(y)
        while (ghostY < GRID_HEIGHT - 1 && game.grid[ghostY + 1][x] === null) {
          ghostY++
        }
        ctx.fillStyle = 'rgba(139, 92, 246, 0.2)'
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)'
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.roundRect(px + 2, ghostY * CELL_HEIGHT + 2, CELL_WIDTH - 4, CELL_HEIGHT - 4, 4)
        ctx.fill()
        ctx.stroke()
        ctx.setLineDash([])

        // Current block
        ctx.fillStyle = 'rgba(30, 30, 50, 0.95)'
        ctx.strokeStyle = token.color
        ctx.lineWidth = 2
        ctx.shadowColor = token.color
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.roundRect(px + 2, py + 2, CELL_WIDTH - 4, CELL_HEIGHT - 4, 4)
        ctx.fill()
        ctx.stroke()
        ctx.shadowBlur = 0

        ctx.fillStyle = token.color
        ctx.font = 'bold 14px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(token.text, px + CELL_WIDTH / 2, py + CELL_HEIGHT / 2)
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
  }, [gameStatus, placeBlock])

  return (
    <main className="min-h-screen bg-dark-900 pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/games"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Arcade
          </Link>

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

        {/* Game Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-display font-bold mb-2">
            <span className="text-gradient">Syntax Sprint</span>
          </h1>
          <p className="text-gray-400">Build valid code from falling syntax blocks!</p>
        </div>

        <div className="flex gap-6 justify-center">
          {/* Game Canvas */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-dark-700 bg-dark-800">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="block"
            />

            {/* Start Screen */}
            {gameStatus === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/95 backdrop-blur-sm">
                <div className="text-8xl mb-6">⌨️</div>
                <h2 className="text-3xl font-display font-bold mb-4 text-gradient">Syntax Sprint</h2>
                <p className="text-gray-400 mb-8 max-w-sm text-center">
                  Arrange falling code tokens to build valid JavaScript statements!
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8 text-sm">
                  <div className="p-3 rounded-lg bg-dark-800 border border-dark-700">
                    <div className="text-purple-400 font-bold mb-1">← → Move</div>
                    <div className="text-gray-400">Position tokens</div>
                  </div>
                  <div className="p-3 rounded-lg bg-dark-800 border border-dark-700">
                    <div className="text-cyan-400 font-bold mb-1">↓ Soft Drop</div>
                    <div className="text-gray-400">Speed up fall</div>
                  </div>
                  <div className="p-3 rounded-lg bg-dark-800 border border-dark-700">
                    <div className="text-yellow-400 font-bold mb-1">Space Hard Drop</div>
                    <div className="text-gray-400">Instant place</div>
                  </div>
                  <div className="p-3 rounded-lg bg-dark-800 border border-dark-700">
                    <div className="text-green-400 font-bold mb-1">Build Code!</div>
                    <div className="text-gray-400">e.g. const x = 42;</div>
                  </div>
                </div>

                <button
                  onClick={startGame}
                  className="flex items-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 font-bold text-xl hover:scale-105 transition-transform"
                >
                  <Play className="w-6 h-6" />
                  Start Coding
                </button>
              </div>
            )}

            {/* Pause Screen */}
            {gameStatus === 'paused' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/90 backdrop-blur-sm">
                <div className="text-6xl mb-6">⏸️</div>
                <h2 className="text-3xl font-display font-bold mb-4">
                  <span className="text-gradient">Paused</span>
                </h2>

                <div className="grid grid-cols-2 gap-3 mb-6 text-center text-sm">
                  <div className="p-3 rounded-xl bg-dark-800 border border-purple-500/30">
                    <div className="text-xl font-bold text-purple-400">{gameState.score}</div>
                    <div className="text-xs text-gray-400">Score</div>
                  </div>
                  <div className="p-3 rounded-xl bg-dark-800 border border-green-500/30">
                    <div className="text-xl font-bold text-green-400">{gameState.linesCleared}</div>
                    <div className="text-xs text-gray-400">Lines</div>
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
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/95 backdrop-blur-sm">
                <div className="text-7xl mb-4">💥</div>
                <h2 className="text-3xl font-display font-bold mb-2 text-red-400">Compile Error!</h2>

                <div className="grid grid-cols-2 gap-3 my-6 max-w-xs">
                  <div className="p-4 rounded-xl bg-dark-800 border border-purple-500/30 text-center">
                    <div className="text-3xl font-bold text-purple-400">{gameState.score}</div>
                    <div className="text-xs text-gray-400 mt-1">Score</div>
                  </div>
                  <div className="p-4 rounded-xl bg-dark-800 border border-green-500/30 text-center">
                    <div className="text-3xl font-bold text-green-400">{gameState.linesCleared}</div>
                    <div className="text-xs text-gray-400 mt-1">Lines</div>
                  </div>
                  <div className="p-4 rounded-xl bg-dark-800 border border-yellow-500/30 text-center">
                    <div className="text-3xl font-bold text-yellow-400">{gameState.maxCombo}x</div>
                    <div className="text-xs text-gray-400 mt-1">Max Combo</div>
                  </div>
                  <div className="p-4 rounded-xl bg-dark-800 border border-cyan-500/30 text-center">
                    {isSubmitting ? (
                      <>
                        <div className="text-3xl font-bold text-cyan-400 animate-pulse">...</div>
                        <div className="text-xs text-gray-400 mt-1">Submitting...</div>
                      </>
                    ) : lastResult?.success ? (
                      <>
                        <div className="text-3xl font-bold text-cyan-400">+{lastResult.grepEarned}</div>
                        <div className="text-xs text-gray-400 mt-1">GREP</div>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-cyan-400">+{Math.floor(gameState.score / 10)}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {isAuthenticated ? 'GREP' : 'Connect wallet'}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {!isAuthenticated && (
                  <p className="text-xs text-yellow-400 mb-4">
                    Connect wallet to save scores!
                  </p>
                )}

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
          </div>

          {/* Side Panel */}
          {gameStatus === 'playing' && (
            <div className="w-48 space-y-4">
              {/* Stats */}
              <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-purple-400">{gameState.score}</div>
                  <div className="text-xs text-gray-400">Score</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div>
                    <div className="font-bold text-green-400">{gameState.linesCleared}</div>
                    <div className="text-xs text-gray-400">Lines</div>
                  </div>
                  <div>
                    <div className="font-bold text-yellow-400">Lv.{gameState.level}</div>
                    <div className="text-xs text-gray-400">Level</div>
                  </div>
                </div>
              </div>

              {/* Next Token */}
              <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700">
                <div className="text-xs text-gray-400 mb-2 text-center">Next</div>
                {nextToken && (
                  <div className="p-3 rounded-lg bg-dark-900 border border-dark-600 text-center">
                    <span className="font-mono font-bold" style={{ color: nextToken.color }}>
                      {nextToken.text}
                    </span>
                  </div>
                )}
              </div>

              {/* Valid Patterns */}
              <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700">
                <div className="text-xs text-gray-400 mb-2">Valid Patterns:</div>
                <ul className="text-xs space-y-1 font-mono">
                  <li className="text-purple-400">const x = 42;</li>
                  <li className="text-green-400">let y = 0;</li>
                  <li className="text-cyan-400">return x;</li>
                  <li className="text-yellow-400">x + y</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Touch Controls */}
        {gameStatus === 'playing' && (
          <div className="mt-4 md:hidden">
            <div className="flex justify-center items-center gap-6">
              {/* Left/Right movement */}
              <div className="flex gap-2">
                <button
                  onTouchStart={() => moveBlock(-1)}
                  className="w-14 h-14 rounded-xl bg-dark-700 border border-purple-500/30 flex items-center justify-center active:bg-purple-500/30 active:border-purple-500 transition-colors"
                >
                  <ArrowLeftIcon className="w-6 h-6 text-purple-400" />
                </button>
                <button
                  onTouchStart={() => moveBlock(1)}
                  className="w-14 h-14 rounded-xl bg-dark-700 border border-purple-500/30 flex items-center justify-center active:bg-purple-500/30 active:border-purple-500 transition-colors"
                >
                  <ArrowRight className="w-6 h-6 text-purple-400" />
                </button>
              </div>

              {/* Drop button */}
              <button
                onTouchStart={() => hardDrop()}
                className="w-16 h-14 rounded-xl bg-dark-700 border border-cyan-500/30 flex items-center justify-center active:bg-cyan-500/30 active:border-cyan-500 transition-colors gap-1"
              >
                <ArrowDown className="w-5 h-5 text-cyan-400" />
                <ArrowDown className="w-5 h-5 text-cyan-400 -ml-3" />
              </button>

              {/* Place button */}
              <button
                onTouchStart={() => placeBlock()}
                className="w-20 h-14 rounded-xl bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-pink-500/50 flex items-center justify-center active:from-purple-500/50 active:to-pink-500/50 transition-colors"
              >
                <span className="text-pink-400 font-bold text-sm">PLACE</span>
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 rounded-xl bg-dark-800/50 border border-dark-700 max-w-2xl mx-auto">
          <h3 className="font-bold text-lg mb-2">How to Play</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>Code tokens fall from the top - position them to build valid JavaScript!</li>
            <li>Complete statements like: <code className="text-purple-400">const x = 42;</code> or <code className="text-green-400">return x;</code></li>
            <li>Valid lines clear and earn points - chain them for combos!</li>
            <li>Game ends when tokens stack to the top</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
