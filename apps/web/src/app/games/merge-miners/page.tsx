'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight as ArrowRightIcon, Play, Pause, RotateCcw, Volume2, VolumeX, Trophy, GitBranch, GitMerge, GitCommit } from 'lucide-react'
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

// Tile types for the mine
type TileType = 'empty' | 'rock' | 'ore' | 'gem' | 'conflict' | 'commit' | 'branch' | 'merge' | 'bug' | 'wall'

interface Tile {
  type: TileType
  mined: boolean
  revealed: boolean
  value: number
  conflictOptions?: string[]
  correctOption?: number
  scenarioIndex?: number
}

interface Player {
  x: number
  y: number
  targetX: number
  targetY: number
  facing: 'left' | 'right' | 'up' | 'down'
  mining: boolean
  miningProgress: number
  trail: { x: number; y: number; alpha: number }[]
}

interface GameState {
  score: number
  depth: number
  commits: number
  gems: number
  ore: number
  conflicts: number
  branches: number
  energy: number
  maxEnergy: number
}

const GRID_SIZE = 12
const TILE_SIZE = 38
const ENERGY_PER_MINE = 5
const ENERGY_PER_MOVE = 1

// Git-themed conflict resolutions
const conflictScenarios = [
  { question: 'HEAD or feature?', options: ['Accept HEAD', 'Accept feature', 'Accept both'], correct: 2 },
  { question: 'Merge strategy?', options: ['Rebase', 'Merge', 'Cherry-pick'], correct: 1 },
  { question: 'Resolve conflict:', options: ['Keep ours', 'Keep theirs', 'Manual merge'], correct: 2 },
  { question: 'Branch action?', options: ['Delete', 'Keep', 'Archive'], correct: 1 },
  { question: 'Commit message?', options: ['fix: bug', 'feat: new', 'chore: update'], correct: 0 },
]

export default function MergeMinersGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'paused' | 'gameover' | 'conflict'>('idle')

  // Score submission hooks
  const { submitScore, isSubmitting, lastResult } = useGameScore('merge-miners')
  const { isAuthenticated } = useAuth()

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    depth: 1,
    commits: 0,
    gems: 0,
    ore: 0,
    conflicts: 0,
    branches: 0,
    energy: 100,
    maxEnergy: 100,
  })
  const [muted, setMuted] = useState(false)
  const [currentConflict, setCurrentConflict] = useState<typeof conflictScenarios[0] | null>(null)
  const [conflictTilePos, setConflictTilePos] = useState<{ x: number; y: number } | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const gameRef = useRef({
    animationId: 0,
    grid: [] as Tile[][],
    player: { x: 5, y: 0, targetX: 5, targetY: 0, facing: 'down', mining: false, miningProgress: 0, trail: [] } as Player,
    particles: [] as Particle[],
    ambientParticles: [] as { x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }[],
    shake: null as ShakeState | null,
    frameCount: 0,
    cameraY: 0,
    targetCameraY: 0,
    keysPressed: new Set<string>(),
    lastMoveTime: 0,
    lastPlayerX: 5,
    lastPlayerY: 0,
  })

  // Generate a level of the mine
  const generateLevel = useCallback((depth: number): Tile[][] => {
    const grid: Tile[][] = []

    for (let y = 0; y < GRID_SIZE * 3; y++) {
      const row: Tile[] = []
      for (let x = 0; x < GRID_SIZE; x++) {
        // Walls on edges
        if (x === 0 || x === GRID_SIZE - 1) {
          row.push({ type: 'wall', mined: false, revealed: true, value: 0 })
          continue
        }

        // Starting area is clear
        if (y < 2) {
          row.push({ type: 'empty', mined: true, revealed: true, value: 0 })
          continue
        }

        // Generate random tiles based on depth
        const rand = Math.random()
        const difficultyMod = Math.min(depth * 0.02, 0.3)

        let tile: Tile

        if (rand < 0.15) {
          // Empty space
          tile = { type: 'empty', mined: true, revealed: false, value: 0 }
        } else if (rand < 0.5) {
          // Regular rock
          tile = { type: 'rock', mined: false, revealed: false, value: 10 }
        } else if (rand < 0.65) {
          // Ore
          tile = { type: 'ore', mined: false, revealed: false, value: 25 + depth * 5 }
        } else if (rand < 0.72 + difficultyMod) {
          // Gem
          tile = { type: 'gem', mined: false, revealed: false, value: 100 + depth * 20 }
        } else if (rand < 0.78 + difficultyMod) {
          // Conflict (mini-puzzle)
          const scenarioIndex = Math.floor(Math.random() * conflictScenarios.length)
          const scenario = conflictScenarios[scenarioIndex]
          tile = {
            type: 'conflict',
            mined: false,
            revealed: false,
            value: 200,
            conflictOptions: scenario.options,
            correctOption: scenario.correct,
            scenarioIndex: scenarioIndex,
          }
        } else if (rand < 0.82) {
          // Commit point (checkpoint)
          tile = { type: 'commit', mined: false, revealed: false, value: 50 }
        } else if (rand < 0.87) {
          // Branch (bonus path)
          tile = { type: 'branch', mined: false, revealed: false, value: 75 }
        } else if (rand < 0.92) {
          // Merge (double reward)
          tile = { type: 'merge', mined: false, revealed: false, value: 150 }
        } else if (rand < 0.96 + difficultyMod * 0.5) {
          // Bug (danger!)
          tile = { type: 'bug', mined: false, revealed: false, value: -50 }
        } else {
          // Rock
          tile = { type: 'rock', mined: false, revealed: false, value: 10 }
        }

        row.push(tile)
      }
      grid.push(row)
    }

    return grid
  }, [])

  // Initialize game
  const initGame = useCallback(() => {
    const grid = generateLevel(1)
    gameRef.current.grid = grid
    gameRef.current.player = {
      x: Math.floor(GRID_SIZE / 2),
      y: 0,
      targetX: Math.floor(GRID_SIZE / 2),
      targetY: 0,
      facing: 'down',
      mining: false,
      miningProgress: 0,
      trail: [],
    }
    gameRef.current.particles = []
    gameRef.current.ambientParticles = []
    gameRef.current.shake = null
    gameRef.current.cameraY = 0
    gameRef.current.targetCameraY = 0
    gameRef.current.lastPlayerX = Math.floor(GRID_SIZE / 2)
    gameRef.current.lastPlayerY = 0

    // Reveal starting area
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = gameRef.current.player.x + dx
        const ny = gameRef.current.player.y + dy
        if (ny >= 0 && ny < grid.length && nx >= 0 && nx < GRID_SIZE) {
          grid[ny][nx].revealed = true
        }
      }
    }
  }, [generateLevel])

  // Handle tile interaction
  const interactWithTile = useCallback((x: number, y: number) => {
    const game = gameRef.current
    const tile = game.grid[y]?.[x]
    if (!tile || tile.mined || tile.type === 'wall') return

    // Check energy
    if (gameState.energy < ENERGY_PER_MINE && tile.type !== 'empty') {
      setFeedback('No energy!')
      setTimeout(() => setFeedback(null), 1500)
      return
    }

    // Handle conflict tiles specially
    if (tile.type === 'conflict' && !tile.mined) {
      // Use stored scenario index for reliable lookup
      const scenario = tile.scenarioIndex !== undefined
        ? conflictScenarios[tile.scenarioIndex]
        : conflictScenarios.find(s => s.options === tile.conflictOptions)
      if (scenario) {
        setCurrentConflict(scenario)
        setConflictTilePos({ x, y }) // Track which tile is being resolved
        setGameStatus('conflict')
        return
      }
    }

    // Mine the tile
    tile.mined = true
    tile.revealed = true

    let energyCost = ENERGY_PER_MINE
    let scoreGain = tile.value
    let message = ''

    switch (tile.type) {
      case 'rock':
        if (!muted) playSound('click')
        message = `+${tile.value}`
        break
      case 'ore':
        if (!muted) playSound('coin')
        setGameState(prev => ({ ...prev, ore: prev.ore + 1 }))
        message = `ORE +${tile.value}`
        game.particles.push(...createExplosion(x * TILE_SIZE + TILE_SIZE / 2, (y - game.cameraY) * TILE_SIZE + TILE_SIZE / 2, 10, [GREP_COLORS.orange, GREP_COLORS.yellow]))
        break
      case 'gem':
        if (!muted) playSound('powerup')
        setGameState(prev => ({ ...prev, gems: prev.gems + 1 }))
        message = `GEM! +${tile.value}`
        game.particles.push(...createExplosion(x * TILE_SIZE + TILE_SIZE / 2, (y - game.cameraY) * TILE_SIZE + TILE_SIZE / 2, 20, [GREP_COLORS.cyan, GREP_COLORS.purple, '#ffffff']))
        game.shake = createShake(5, 200)
        break
      case 'commit':
        if (!muted) playSound('success')
        setGameState(prev => ({ ...prev, commits: prev.commits + 1, energy: Math.min(prev.maxEnergy, prev.energy + 20) }))
        message = 'COMMIT! +Energy'
        energyCost = 0
        game.particles.push(createTextParticle(x * TILE_SIZE + TILE_SIZE / 2, (y - game.cameraY) * TILE_SIZE, 'git commit', GREP_COLORS.green))
        break
      case 'branch':
        if (!muted) playSound('combo')
        setGameState(prev => ({ ...prev, branches: prev.branches + 1 }))
        message = 'BRANCH!'
        scoreGain *= 1.5
        game.particles.push(createTextParticle(x * TILE_SIZE + TILE_SIZE / 2, (y - game.cameraY) * TILE_SIZE, 'git branch', GREP_COLORS.purple))
        break
      case 'merge':
        if (!muted) playSound('levelup')
        message = 'MERGE! x2'
        scoreGain *= 2
        game.shake = createShake(8, 300)
        game.particles.push(...createExplosion(x * TILE_SIZE + TILE_SIZE / 2, (y - game.cameraY) * TILE_SIZE + TILE_SIZE / 2, 25, [GREP_COLORS.green, GREP_COLORS.cyan]))
        game.particles.push(createTextParticle(x * TILE_SIZE + TILE_SIZE / 2, (y - game.cameraY) * TILE_SIZE, 'git merge', GREP_COLORS.green))
        break
      case 'bug':
        if (!muted) playSound('error')
        setGameState(prev => ({ ...prev, energy: Math.max(0, prev.energy - 20) }))
        message = 'BUG! -20 Energy'
        scoreGain = 0
        energyCost = 0
        game.shake = createShake(10, 300)
        game.particles.push(...createExplosion(x * TILE_SIZE + TILE_SIZE / 2, (y - game.cameraY) * TILE_SIZE + TILE_SIZE / 2, 15, [GREP_COLORS.red]))
        break
      case 'empty':
        energyCost = 0
        break
    }

    if (message) {
      game.particles.push(createTextParticle(x * TILE_SIZE + TILE_SIZE / 2, (y - game.cameraY) * TILE_SIZE - 10, message, scoreGain > 0 ? GREP_COLORS.green : GREP_COLORS.red))
    }

    setGameState(prev => ({
      ...prev,
      score: prev.score + scoreGain,
      energy: Math.max(0, prev.energy - energyCost),
      depth: Math.max(prev.depth, Math.floor(y / 5) + 1),
    }))

    // Reveal surrounding tiles
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx
        const ny = y + dy
        if (ny >= 0 && ny < game.grid.length && nx >= 0 && nx < GRID_SIZE) {
          game.grid[ny][nx].revealed = true
        }
      }
    }

    // Check energy game over
    if (gameState.energy - energyCost <= 0 && tile.type !== 'commit') {
      setTimeout(() => {
        if (gameRef.current.grid.some(row => row.some(t => t.type === 'commit' && !t.mined))) {
          // There's still a commit nearby they could reach
        } else {
          setGameStatus('gameover')
        }
      }, 100)
    }
  }, [gameState.energy, muted])

  // Handle conflict resolution
  const resolveConflict = useCallback((optionIndex: number) => {
    const game = gameRef.current

    // Use tracked conflict tile position
    if (!conflictTilePos) {
      setCurrentConflict(null)
      setGameStatus('playing')
      return
    }

    const { x: nx, y: ny } = conflictTilePos
    const tile = game.grid[ny]?.[nx]

    if (tile?.type === 'conflict' && !tile.mined) {
      const isCorrect = optionIndex === tile.correctOption

      tile.mined = true
      tile.revealed = true

      if (isCorrect) {
        if (!muted) playSound('success')
        setGameState(prev => ({
          ...prev,
          score: prev.score + tile.value,
          conflicts: prev.conflicts + 1,
        }))
        game.particles.push(createTextParticle(nx * TILE_SIZE + TILE_SIZE / 2, (ny - game.cameraY) * TILE_SIZE, `RESOLVED! +${tile.value}`, GREP_COLORS.green))
        game.particles.push(...createExplosion(nx * TILE_SIZE + TILE_SIZE / 2, (ny - game.cameraY) * TILE_SIZE + TILE_SIZE / 2, 15, [GREP_COLORS.green, GREP_COLORS.cyan]))
      } else {
        if (!muted) playSound('error')
        setGameState(prev => ({
          ...prev,
          energy: Math.max(0, prev.energy - 15),
        }))
        game.particles.push(createTextParticle(nx * TILE_SIZE + TILE_SIZE / 2, (ny - game.cameraY) * TILE_SIZE, 'WRONG! -15 Energy', GREP_COLORS.red))
        game.shake = createShake(8, 200)
      }
    }

    setConflictTilePos(null)
    setCurrentConflict(null)
    setGameStatus('playing')
  }, [muted, conflictTilePos])

  // Submit score when game ends
  useEffect(() => {
    if (gameStatus === 'gameover' && isAuthenticated && gameState.score > 0) {
      submitScore(gameState.score, gameState.depth, gameState.commits)
    }
  }, [gameStatus, isAuthenticated, gameState.score, gameState.depth, gameState.commits, submitScore])

  // Movement and input
  useEffect(() => {
    if (gameStatus !== 'playing') return

    const handleKeyDown = (e: KeyboardEvent) => {
      gameRef.current.keysPressed.add(e.key.toLowerCase())
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      gameRef.current.keysPressed.delete(e.key.toLowerCase())
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameStatus])

  // Game loop
  useEffect(() => {
    if (gameStatus !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gameLoop = () => {
      const game = gameRef.current
      game.frameCount++

      const shakeOffset = getShakeOffset(game.shake)
      ctx.save()
      ctx.translate(shakeOffset.x, shakeOffset.y)

      // Background with depth gradient
      const depthGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      depthGradient.addColorStop(0, '#0a0a12')
      depthGradient.addColorStop(1, '#050508')
      ctx.fillStyle = depthGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw subtle grid lines for cave effect
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)'
      ctx.lineWidth = 1
      for (let i = 0; i < canvas.width; i += TILE_SIZE) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()
      }
      for (let i = 0; i < canvas.height; i += TILE_SIZE) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
      }

      // Spawn ambient cave particles
      if (game.frameCount % 15 === 0 && game.ambientParticles.length < 30) {
        game.ambientParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -0.2 - Math.random() * 0.3,
          size: 1 + Math.random() * 2,
          alpha: 0.1 + Math.random() * 0.2,
          color: Math.random() > 0.7 ? GREP_COLORS.cyan : '#ffffff',
        })
      }

      // Update ambient particles
      game.ambientParticles = game.ambientParticles.filter(p => {
        p.x += p.vx
        p.y += p.vy
        p.alpha -= 0.002
        return p.alpha > 0 && p.y > -10
      })

      // Draw ambient particles
      game.ambientParticles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${Math.floor(p.alpha * 255).toString(16).padStart(2, '0')}`
        ctx.fill()
      })

      // Handle movement
      const now = Date.now()
      if (now - game.lastMoveTime > 120) {
        const keys = game.keysPressed
        let dx = 0
        let dy = 0

        if (keys.has('arrowleft') || keys.has('a')) { dx = -1; game.player.facing = 'left' }
        if (keys.has('arrowright') || keys.has('d')) { dx = 1; game.player.facing = 'right' }
        if (keys.has('arrowup') || keys.has('w')) { dy = -1; game.player.facing = 'up' }
        if (keys.has('arrowdown') || keys.has('s')) { dy = 1; game.player.facing = 'down' }

        if (dx !== 0 || dy !== 0) {
          const newX = game.player.x + dx
          const newY = game.player.y + dy

          const targetTile = game.grid[newY]?.[newX]
          if (targetTile && targetTile.type !== 'wall') {
            if (targetTile.mined || targetTile.type === 'empty') {
              // Move to empty space
              if (gameState.energy >= ENERGY_PER_MOVE) {
                // Add trail point before moving
                if (game.player.x !== game.lastPlayerX || game.player.y !== game.lastPlayerY) {
                  game.player.trail.push({ x: game.player.x, y: game.player.y, alpha: 0.6 })
                  if (game.player.trail.length > 8) game.player.trail.shift()
                }
                game.lastPlayerX = game.player.x
                game.lastPlayerY = game.player.y
                game.player.x = newX
                game.player.y = newY
                setGameState(prev => ({ ...prev, energy: prev.energy - ENERGY_PER_MOVE }))
              }
            } else {
              // Mine the tile
              interactWithTile(newX, newY)
            }
            game.lastMoveTime = now
          }
        }
      }

      // Fade trail
      game.player.trail = game.player.trail.map(t => ({ ...t, alpha: t.alpha * 0.92 })).filter(t => t.alpha > 0.05)

      // Camera follow
      game.targetCameraY = Math.max(0, game.player.y - 4)
      game.cameraY += (game.targetCameraY - game.cameraY) * 0.1

      // Draw grid
      const startY = Math.floor(game.cameraY)
      const endY = Math.min(game.grid.length, startY + 15)

      for (let y = startY; y < endY; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const tile = game.grid[y]?.[x]
          if (!tile) continue

          const screenX = x * TILE_SIZE
          const screenY = (y - game.cameraY) * TILE_SIZE

          // Tile background
          if (!tile.revealed) {
            ctx.fillStyle = '#1a1a2e'
            ctx.fillRect(screenX, screenY, TILE_SIZE - 1, TILE_SIZE - 1)
            ctx.fillStyle = '#252540'
            ctx.fillText('?', screenX + TILE_SIZE / 2 - 4, screenY + TILE_SIZE / 2 + 4)
            continue
          }

          // Draw based on tile type with enhanced visuals
          let color = '#1a1a2e'
          let icon = ''
          let glowColor: string | null = null
          let glowIntensity = 0

          switch (tile.type) {
            case 'wall':
              color = '#0f0f1a'
              break
            case 'empty':
              color = '#12121f'
              break
            case 'rock':
              color = tile.mined ? '#12121f' : '#3a3a4a'
              icon = tile.mined ? '' : '🪨'
              break
            case 'ore':
              color = tile.mined ? '#12121f' : '#4a3a20'
              icon = tile.mined ? '' : '⛏️'
              glowColor = tile.mined ? null : GREP_COLORS.orange
              glowIntensity = 8
              break
            case 'gem':
              color = tile.mined ? '#12121f' : '#2a3a4a'
              icon = tile.mined ? '' : '💎'
              glowColor = tile.mined ? null : GREP_COLORS.cyan
              glowIntensity = 15
              break
            case 'conflict':
              color = tile.mined ? '#12121f' : '#4a2a2a'
              icon = tile.mined ? '✓' : '⚠️'
              glowColor = tile.mined ? null : '#ff6b6b'
              glowIntensity = 10
              break
            case 'commit':
              color = tile.mined ? '#1a3a1a' : '#2a4a2a'
              icon = tile.mined ? '✓' : '📌'
              glowColor = tile.mined ? null : GREP_COLORS.green
              glowIntensity = 10
              break
            case 'branch':
              color = tile.mined ? '#12121f' : '#3a2a4a'
              icon = tile.mined ? '' : '🌿'
              glowColor = tile.mined ? null : GREP_COLORS.purple
              glowIntensity = 8
              break
            case 'merge':
              color = tile.mined ? '#12121f' : '#2a4a3a'
              icon = tile.mined ? '' : '🔀'
              glowColor = tile.mined ? null : GREP_COLORS.green
              glowIntensity = 12
              break
            case 'bug':
              color = tile.mined ? '#12121f' : '#4a1a1a'
              icon = tile.mined ? '💀' : '🐛'
              glowColor = tile.mined ? null : '#ff4444'
              glowIntensity = 8
              break
          }

          // Apply glow effect for special tiles
          if (glowColor && !tile.mined) {
            ctx.shadowColor = glowColor
            ctx.shadowBlur = glowIntensity + Math.sin(game.frameCount * 0.1) * 3
          }

          // Draw tile with gradient
          if (!tile.mined && tile.type !== 'wall' && tile.type !== 'empty') {
            const tileGradient = ctx.createLinearGradient(screenX, screenY, screenX, screenY + TILE_SIZE)
            tileGradient.addColorStop(0, color)
            tileGradient.addColorStop(1, '#0a0a12')
            ctx.fillStyle = tileGradient
          } else {
            ctx.fillStyle = color
          }

          ctx.beginPath()
          ctx.roundRect(screenX + 1, screenY + 1, TILE_SIZE - 3, TILE_SIZE - 3, 4)
          ctx.fill()

          // Add highlight edge for unmined tiles
          if (!tile.mined && tile.type !== 'wall' && tile.type !== 'empty') {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
            ctx.lineWidth = 1
            ctx.stroke()
          }

          ctx.shadowBlur = 0

          if (icon) {
            // Add subtle bounce animation for valuable tiles
            const bounce = (tile.type === 'gem' || tile.type === 'merge') && !tile.mined
              ? Math.sin(game.frameCount * 0.08 + x + y) * 2
              : 0
            ctx.font = '20px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText(icon, screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2 + 6 + bounce)
          }
        }
      }

      // Draw player trail
      game.player.trail.forEach((t, i) => {
        const trailScreenX = t.x * TILE_SIZE + TILE_SIZE / 2
        const trailScreenY = (t.y - game.cameraY) * TILE_SIZE + TILE_SIZE / 2
        const size = 8 + i * 0.5
        ctx.beginPath()
        ctx.arc(trailScreenX, trailScreenY, size, 0, Math.PI * 2)
        ctx.fillStyle = hexToRgba(GREP_COLORS.green, t.alpha * 0.5)
        ctx.fill()
      })

      // Draw player
      const playerScreenX = game.player.x * TILE_SIZE
      const playerScreenY = (game.player.y - game.cameraY) * TILE_SIZE
      const playerCenterX = playerScreenX + TILE_SIZE / 2
      const playerCenterY = playerScreenY + TILE_SIZE / 2

      // Pulsing player glow
      const pulseIntensity = 15 + Math.sin(game.frameCount * 0.1) * 5
      ctx.shadowColor = GREP_COLORS.green
      ctx.shadowBlur = pulseIntensity

      // Player body with gradient
      const playerGradient = ctx.createRadialGradient(
        playerCenterX - 3, playerCenterY - 3, 0,
        playerCenterX, playerCenterY, 16
      )
      playerGradient.addColorStop(0, '#6bff6b')
      playerGradient.addColorStop(0.5, GREP_COLORS.green)
      playerGradient.addColorStop(1, '#1a8a1a')

      ctx.fillStyle = playerGradient
      ctx.beginPath()
      ctx.arc(playerCenterX, playerCenterY, 14, 0, Math.PI * 2)
      ctx.fill()

      // Highlight ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(playerCenterX, playerCenterY, 12, -Math.PI * 0.8, -Math.PI * 0.2)
      ctx.stroke()

      ctx.shadowBlur = 0

      // Mining helmet/visor
      ctx.fillStyle = '#ffd700'
      ctx.beginPath()
      ctx.ellipse(playerCenterX, playerCenterY - 8, 8, 4, 0, Math.PI, 0)
      ctx.fill()

      // Headlamp
      ctx.fillStyle = '#ffff88'
      ctx.beginPath()
      ctx.arc(playerCenterX, playerCenterY - 10, 3, 0, Math.PI * 2)
      ctx.fill()

      // Player face direction indicator (eyes)
      ctx.fillStyle = '#0a0a12'
      let eyeOffsetX = 0
      let eyeOffsetY = 0
      switch (game.player.facing) {
        case 'left': eyeOffsetX = -4; break
        case 'right': eyeOffsetX = 4; break
        case 'up': eyeOffsetY = -4; break
        case 'down': eyeOffsetY = 4; break
      }
      ctx.beginPath()
      ctx.arc(playerCenterX - 4 + eyeOffsetX, playerCenterY + eyeOffsetY, 3, 0, Math.PI * 2)
      ctx.arc(playerCenterX + 4 + eyeOffsetX, playerCenterY + eyeOffsetY, 3, 0, Math.PI * 2)
      ctx.fill()

      // Eye shine
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(playerCenterX - 3 + eyeOffsetX, playerCenterY - 1 + eyeOffsetY, 1, 0, Math.PI * 2)
      ctx.arc(playerCenterX + 5 + eyeOffsetX, playerCenterY - 1 + eyeOffsetY, 1, 0, Math.PI * 2)
      ctx.fill()

      // Draw particles
      game.particles = game.particles.filter(p => {
        if (updateParticle(p)) {
          drawParticle(ctx, p, 0)
          return true
        }
        return false
      })

      // HUD Background with gradient
      const hudGradient = ctx.createLinearGradient(0, 0, 0, 55)
      hudGradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)')
      hudGradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)')
      ctx.fillStyle = hudGradient
      ctx.fillRect(0, 0, canvas.width, 55)

      // HUD bottom border glow
      ctx.strokeStyle = hexToRgba(GREP_COLORS.green, 0.3)
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, 55)
      ctx.lineTo(canvas.width, 55)
      ctx.stroke()

      // Score with icon
      ctx.fillStyle = GREP_COLORS.green
      ctx.font = 'bold 16px monospace'
      ctx.textAlign = 'left'
      ctx.fillText('⚡', 8, 22)
      ctx.fillStyle = '#fff'
      ctx.fillText(gameState.score.toLocaleString(), 28, 22)

      // Depth indicator
      ctx.fillStyle = GREP_COLORS.cyan
      ctx.font = '12px monospace'
      ctx.fillText('⬇', 10, 42)
      ctx.fillStyle = '#aaa'
      ctx.fillText(`Depth ${gameState.depth}`, 26, 42)

      // Energy bar (styled)
      const energyBarX = 115
      const energyBarY = 10
      const energyBarWidth = 120
      const energyBarHeight = 16

      // Bar background
      ctx.fillStyle = '#1a1a2e'
      ctx.beginPath()
      ctx.roundRect(energyBarX, energyBarY, energyBarWidth, energyBarHeight, 4)
      ctx.fill()

      // Bar border
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 1
      ctx.stroke()

      // Energy fill with gradient
      const energyPercent = gameState.energy / gameState.maxEnergy
      const energyFillWidth = Math.max(0, (energyPercent * (energyBarWidth - 4)))
      if (energyFillWidth > 0) {
        const energyGradient = ctx.createLinearGradient(energyBarX, 0, energyBarX + energyBarWidth, 0)
        if (energyPercent > 0.5) {
          energyGradient.addColorStop(0, GREP_COLORS.green)
          energyGradient.addColorStop(1, '#6bff6b')
        } else if (energyPercent > 0.25) {
          energyGradient.addColorStop(0, GREP_COLORS.yellow)
          energyGradient.addColorStop(1, GREP_COLORS.orange)
        } else {
          energyGradient.addColorStop(0, GREP_COLORS.red)
          energyGradient.addColorStop(1, '#ff6b6b')
        }
        ctx.fillStyle = energyGradient
        ctx.beginPath()
        ctx.roundRect(energyBarX + 2, energyBarY + 2, energyFillWidth, energyBarHeight - 4, 3)
        ctx.fill()
      }

      // Energy text
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`${gameState.energy}/${gameState.maxEnergy}`, energyBarX + energyBarWidth / 2, energyBarY + 12)

      // Energy label below
      ctx.fillStyle = '#666'
      ctx.font = '9px monospace'
      ctx.fillText('ENERGY', energyBarX + energyBarWidth / 2, energyBarY + 28)

      // Stats on right side with styled boxes
      const statsData = [
        { icon: '💎', value: gameState.gems, color: GREP_COLORS.cyan },
        { icon: '⛏️', value: gameState.ore, color: GREP_COLORS.orange },
        { icon: '📌', value: gameState.commits, color: GREP_COLORS.green },
        { icon: '⚠️', value: gameState.conflicts, color: GREP_COLORS.yellow },
      ]

      statsData.forEach((stat, i) => {
        const statX = canvas.width - 50 - (i * 55)
        const statY = 8

        // Stat background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
        ctx.beginPath()
        ctx.roundRect(statX, statY, 45, 35, 4)
        ctx.fill()

        // Icon
        ctx.font = '14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(stat.icon, statX + 22, statY + 16)

        // Value
        ctx.fillStyle = stat.color
        ctx.font = 'bold 11px monospace'
        ctx.fillText(stat.value.toString(), statX + 22, statY + 30)
      })

      // Controls hint with better styling
      const controlsBgGradient = ctx.createLinearGradient(0, canvas.height - 28, 0, canvas.height)
      controlsBgGradient.addColorStop(0, 'rgba(0, 0, 0, 0.6)')
      controlsBgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)')
      ctx.fillStyle = controlsBgGradient
      ctx.fillRect(0, canvas.height - 28, canvas.width, 28)

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, canvas.height - 28)
      ctx.lineTo(canvas.width, canvas.height - 28)
      ctx.stroke()

      ctx.fillStyle = '#888'
      ctx.font = '11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('⌨️ WASD / Arrow Keys to move and mine', canvas.width / 2, canvas.height - 10)

      ctx.restore()

      // Check game over
      if (gameState.energy <= 0) {
        setGameStatus('gameover')
        return
      }

      game.animationId = requestAnimationFrame(gameLoop)
    }

    gameRef.current.animationId = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(gameRef.current.animationId)
    }
  }, [gameStatus, gameState, interactWithTile])

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

  // Mobile touch direction handler
  const handleTouchDirection = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameStatus !== 'playing') return
    const game = gameRef.current

    let dx = 0
    let dy = 0

    switch (direction) {
      case 'up': dy = -1; game.player.facing = 'up'; break
      case 'down': dy = 1; game.player.facing = 'down'; break
      case 'left': dx = -1; game.player.facing = 'left'; break
      case 'right': dx = 1; game.player.facing = 'right'; break
    }

    const newX = game.player.x + dx
    const newY = game.player.y + dy

    const targetTile = game.grid[newY]?.[newX]
    if (targetTile && targetTile.type !== 'wall') {
      if (targetTile.mined || targetTile.type === 'empty') {
        if (gameState.energy >= ENERGY_PER_MOVE) {
          // Add trail
          game.player.trail.push({ x: game.player.x, y: game.player.y, alpha: 0.6 })
          if (game.player.trail.length > 8) game.player.trail.shift()
          game.player.x = newX
          game.player.y = newY
          setGameState(prev => ({ ...prev, energy: prev.energy - ENERGY_PER_MOVE }))
        }
      } else {
        interactWithTile(newX, newY)
      }
    }
  }, [gameStatus, gameState.energy, interactWithTile])

  // Start game
  const startGame = () => {
    setGameState({
      score: 0,
      depth: 1,
      commits: 0,
      gems: 0,
      ore: 0,
      conflicts: 0,
      branches: 0,
      energy: 100,
      maxEnergy: 100,
    })
    initGame()
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
              {(gameStatus === 'playing' || gameStatus === 'paused') && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <GitBranch className="w-4 h-4 text-purple-400" />
                    <span>{gameState.branches}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitCommit className="w-4 h-4 text-green-400" />
                    <span>{gameState.commits}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitMerge className="w-4 h-4 text-cyan-400" />
                    <span>{gameState.conflicts}</span>
                  </div>
                </div>
              )}
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

      {/* Game Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={GRID_SIZE * TILE_SIZE}
            height={12 * TILE_SIZE}
            className="rounded-2xl border-2 border-green-500/30 shadow-2xl shadow-green-500/20"
          />

          {/* Start Screen */}
          {gameStatus === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/95 rounded-2xl backdrop-blur-sm">
              <div className="text-7xl mb-6">⛏️</div>
              <h2 className="text-4xl font-display font-bold mb-3">
                <span className="text-gradient">Merge Miners</span>
              </h2>
              <p className="text-gray-400 mb-6 text-center max-w-sm">
                Mine through Git branches, resolve conflicts, and commit your progress!
              </p>

              <button
                onClick={startGame}
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-cyan-500 font-bold text-lg text-dark-900 hover:scale-105 transition-transform shadow-lg shadow-green-500/30"
              >
                <Play className="w-5 h-5" />
                Start Mining
              </button>

              <div className="mt-8 grid grid-cols-2 gap-3 text-xs max-w-sm">
                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700 text-center">
                  <span className="text-xl">💎</span>
                  <div className="text-gray-400 mt-1">Gems = Big points</div>
                </div>
                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700 text-center">
                  <span className="text-xl">📌</span>
                  <div className="text-gray-400 mt-1">Commits = Energy</div>
                </div>
                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700 text-center">
                  <span className="text-xl">⚠️</span>
                  <div className="text-gray-400 mt-1">Conflicts = Puzzles</div>
                </div>
                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700 text-center">
                  <span className="text-xl">🐛</span>
                  <div className="text-gray-400 mt-1">Bugs = Danger!</div>
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
                <div className="p-3 rounded-xl bg-dark-800 border border-green-500/30">
                  <div className="text-xl font-bold text-green-400">{gameState.score}</div>
                  <div className="text-xs text-gray-400">Score</div>
                </div>
                <div className="p-3 rounded-xl bg-dark-800 border border-cyan-500/30">
                  <div className="text-xl font-bold text-cyan-400">{gameState.depth}</div>
                  <div className="text-xs text-gray-400">Depth</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={togglePause}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-cyan-500 font-bold text-dark-900 hover:scale-105 transition-transform"
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

          {/* Conflict Modal */}
          {gameStatus === 'conflict' && currentConflict && (
            <div className="absolute inset-0 flex items-center justify-center bg-dark-900/90 rounded-2xl backdrop-blur-sm">
              <div className="bg-dark-800 border-2 border-yellow-500 rounded-2xl p-6 max-w-sm w-full mx-4">
                <div className="flex items-center gap-2 mb-4 text-yellow-400">
                  <span className="text-2xl">⚠️</span>
                  <span className="font-bold">MERGE CONFLICT!</span>
                </div>

                <p className="text-lg mb-4">{currentConflict.question}</p>

                <div className="space-y-2">
                  {currentConflict.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => resolveConflict(idx)}
                      className="w-full p-3 rounded-lg bg-dark-700 border border-dark-600 hover:border-yellow-500 transition-colors text-left font-mono"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Game Over Screen */}
          {gameStatus === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/95 rounded-2xl backdrop-blur-sm">
              <div className="text-6xl mb-4">💀</div>
              <h2 className="text-3xl font-display font-bold mb-2 text-red-400">Out of Energy!</h2>

              <div className="grid grid-cols-2 gap-3 my-6 text-center">
                <div className="p-4 rounded-xl bg-dark-800 border border-green-500/30">
                  <div className="text-2xl font-bold text-green-400">{gameState.score}</div>
                  <div className="text-xs text-gray-400">Score</div>
                </div>
                <div className="p-4 rounded-xl bg-dark-800 border border-cyan-500/30">
                  <div className="text-2xl font-bold text-cyan-400">{gameState.depth}</div>
                  <div className="text-xs text-gray-400">Depth</div>
                </div>
                <div className="p-4 rounded-xl bg-dark-800 border border-purple-500/30">
                  <div className="text-2xl font-bold text-purple-400">{gameState.gems}</div>
                  <div className="text-xs text-gray-400">Gems</div>
                </div>
                <div className="p-4 rounded-xl bg-dark-800 border border-yellow-500/30">
                  {isSubmitting ? (
                    <>
                      <div className="text-2xl font-bold text-yellow-400 animate-pulse">...</div>
                      <div className="text-xs text-gray-400">Submitting...</div>
                    </>
                  ) : lastResult?.success ? (
                    <>
                      <div className="text-2xl font-bold text-yellow-400">+{lastResult.grepEarned}</div>
                      <div className="text-xs text-gray-400">
                        GREP {lastResult.multiplier && lastResult.multiplier > 1 ? `(${lastResult.multiplier}x)` : ''}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-yellow-400">+{Math.floor(gameState.score / 15)}</div>
                      <div className="text-xs text-gray-400">
                        {isAuthenticated ? 'GREP' : 'Connect wallet'}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {!isAuthenticated && (
                <p className="text-xs text-yellow-400 mb-3">
                  Connect wallet to save scores!
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-cyan-500 font-bold text-dark-900 hover:scale-105 transition-transform"
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

          {/* Feedback */}
          {feedback && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500 text-red-400 font-bold">
              {feedback}
            </div>
          )}
        </div>

        {/* Mobile Touch Controls */}
        {gameStatus === 'playing' && (
          <div className="mt-6 md:hidden">
            <div className="flex justify-center">
              <div className="grid grid-cols-3 gap-2 w-44">
                <div />
                <button
                  onTouchStart={() => handleTouchDirection('up')}
                  className="w-14 h-14 rounded-xl bg-dark-700 border border-green-500/30 flex items-center justify-center active:bg-green-500/30 active:border-green-500 transition-colors"
                >
                  <ArrowUp className="w-6 h-6 text-green-400" />
                </button>
                <div />
                <button
                  onTouchStart={() => handleTouchDirection('left')}
                  className="w-14 h-14 rounded-xl bg-dark-700 border border-green-500/30 flex items-center justify-center active:bg-green-500/30 active:border-green-500 transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-green-400" />
                </button>
                <div className="w-14 h-14 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center">
                  <span className="text-lg">⛏️</span>
                </div>
                <button
                  onTouchStart={() => handleTouchDirection('right')}
                  className="w-14 h-14 rounded-xl bg-dark-700 border border-green-500/30 flex items-center justify-center active:bg-green-500/30 active:border-green-500 transition-colors"
                >
                  <ArrowRightIcon className="w-6 h-6 text-green-400" />
                </button>
                <div />
                <button
                  onTouchStart={() => handleTouchDirection('down')}
                  className="w-14 h-14 rounded-xl bg-dark-700 border border-green-500/30 flex items-center justify-center active:bg-green-500/30 active:border-green-500 transition-colors"
                >
                  <ArrowDown className="w-6 h-6 text-green-400" />
                </button>
                <div />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
