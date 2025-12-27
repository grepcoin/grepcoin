'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, RotateCcw, Volume2, VolumeX, Trophy, AlertTriangle, Keyboard } from 'lucide-react'
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
  drawGlowingRect,
} from '@/lib/gameUtils'

// Enhanced function types with special behaviors
const functionTypes = [
  { name: 'main()', color: '#8B5CF6', returnType: 'void', category: 'core' },
  { name: 'init()', color: '#EC4899', returnType: 'void', category: 'core' },
  { name: 'loop()', color: '#06B6D4', returnType: 'void', category: 'core' },
  { name: 'calc()', color: '#F97316', returnType: 'int', category: 'math' },
  { name: 'sum()', color: '#F59E0B', returnType: 'int', category: 'math' },
  { name: 'fetch()', color: '#10B981', returnType: 'Promise', category: 'async' },
  { name: 'await()', color: '#14B8A6', returnType: 'Promise', category: 'async' },
  { name: 'parse()', color: '#EAB308', returnType: 'string', category: 'string' },
  { name: 'format()', color: '#FBBF24', returnType: 'string', category: 'string' },
  { name: 'render()', color: '#EF4444', returnType: 'void', category: 'core' },
  { name: 'update()', color: '#A855F7', returnType: 'void', category: 'core' },
  { name: 'debug()', color: '#6B7280', returnType: 'void', category: 'debug' },
]

// Bug types that cause problems
const bugTypes = [
  { name: 'bug()', color: '#DC2626', effect: 'freeze', icon: '🐛' },
  { name: 'virus()', color: '#7C2D12', effect: 'multiply', icon: '🦠' },
  { name: 'leak()', color: '#1E3A8A', effect: 'drain', icon: '💧' },
]

interface StackFrame {
  id: number
  type: typeof functionTypes[0]
  y: number
  targetY: number
  width: number
  highlighted: boolean
  shaking: boolean
  isBug: boolean
  bugType?: typeof bugTypes[0]
  frozen: boolean
  glowing: boolean
}

interface GameState {
  score: number
  level: number
  combo: number
  maxCombo: number
  correctReturns: number
  categoryStreak: string | null
  categoryStreakCount: number
  lives: number
  freezeTimer: number
}

export default function StackPanicGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle')

  // Score submission hooks
  const { submitScore, isSubmitting, lastResult } = useGameScore('stack-panic')
  const { isAuthenticated } = useAuth()

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    combo: 0,
    maxCombo: 0,
    correctReturns: 0,
    categoryStreak: null,
    categoryStreakCount: 0,
    lives: 3,
    freezeTimer: 0,
  })
  const [muted, setMuted] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | 'combo' | 'bug', text: string } | null>(null)
  const [panicLevel, setPanicLevel] = useState(0)
  const [showControls, setShowControls] = useState(false)

  const gameRef = useRef({
    animationId: 0,
    stack: [] as StackFrame[],
    nextId: 0,
    spawnTimer: 0,
    spawnInterval: 100,
    particles: [] as Particle[],
    warningPulse: 0,
    frameCount: 0,
    shake: null as ShakeState | null,
    lastCategory: null as string | null,
    backgroundWave: 0,
    glitchEffect: 0,
  })

  const STACK_X = 220
  const STACK_WIDTH = 260
  const FRAME_HEIGHT = 55
  const MAX_STACK_Y = 60
  const STACK_BOTTOM = 440
  const MAX_STACK_SIZE = 8

  // Spawn a new function on the stack
  const spawnFunction = useCallback(() => {
    const game = gameRef.current

    // Determine if we should spawn a bug (increases with level)
    const bugChance = Math.min(0.15, 0.02 + gameState.level * 0.01)
    const isBug = Math.random() < bugChance && game.stack.length > 2

    let funcType: typeof functionTypes[0]
    let bugType: typeof bugTypes[0] | undefined

    if (isBug) {
      bugType = bugTypes[Math.floor(Math.random() * bugTypes.length)]
      funcType = { name: bugType.name, color: bugType.color, returnType: 'error', category: 'bug' }
    } else {
      funcType = functionTypes[Math.floor(Math.random() * functionTypes.length)]
    }

    const newFrame: StackFrame = {
      id: game.nextId++,
      type: funcType,
      y: STACK_BOTTOM + 100,
      targetY: STACK_BOTTOM - (game.stack.length * FRAME_HEIGHT),
      width: STACK_WIDTH,
      highlighted: false,
      shaking: false,
      isBug,
      bugType,
      frozen: false,
      glowing: false,
    }

    game.stack.push(newFrame)

    // Update all target positions
    game.stack.forEach((frame, idx) => {
      frame.targetY = STACK_BOTTOM - ((game.stack.length - 1 - idx) * FRAME_HEIGHT)
    })

    if (!muted && isBug) {
      playSound('error')
    }

    // Check for game over
    if (game.stack.length >= MAX_STACK_SIZE) {
      if (!muted) playSound('explosion')
      setGameStatus('gameover')
    }
  }, [gameState.level, muted])

  // Handle returning a function
  const handleReturn = useCallback((frameIndex: number) => {
    if (gameStatus !== 'playing') return
    if (gameState.freezeTimer > 0) return // Frozen!

    const game = gameRef.current
    if (frameIndex < 0 || frameIndex >= game.stack.length) return

    const isTopOfStack = frameIndex === game.stack.length - 1
    const frame = game.stack[frameIndex]

    if (isTopOfStack) {
      // Handle bugs specially
      if (frame.isBug && frame.bugType) {
        if (!muted) playSound('powerup')

        // Bug squashed!
        game.particles.push(...createExplosion(
          STACK_X + STACK_WIDTH / 2,
          frame.y,
          20,
          [frame.type.color, '#ffffff']
        ))

        game.particles.push(createTextParticle(
          STACK_X + STACK_WIDTH / 2,
          frame.y - 30,
          'BUG SQUASHED!',
          GREP_COLORS.green
        ))

        setGameState(prev => ({
          ...prev,
          score: prev.score + 200,
          combo: prev.combo + 1,
        }))

        setFeedback({ type: 'bug', text: `${frame.bugType.icon} BUG SQUASHED! +200` })
      } else {
        // Normal return
        if (!muted) playSound('success')

        const basePoints = 100
        const comboBonus = gameState.combo * 25
        const categoryBonus = frame.type.category === game.lastCategory ? 50 : 0
        const points = basePoints + comboBonus + categoryBonus

        // Check for category streak
        let newCategoryStreak = gameState.categoryStreak
        let newCategoryStreakCount = gameState.categoryStreakCount

        if (frame.type.category === gameState.categoryStreak) {
          newCategoryStreakCount++
          if (newCategoryStreakCount >= 3 && !muted) {
            playSound('combo')
          }
        } else {
          newCategoryStreak = frame.type.category
          newCategoryStreakCount = 1
        }

        // Success particles
        game.particles.push(...createExplosion(
          STACK_X + STACK_WIDTH / 2,
          frame.y,
          15,
          [frame.type.color, GREP_COLORS.green, '#ffffff']
        ))

        // Score text
        game.particles.push(createTextParticle(
          STACK_X + STACK_WIDTH / 2,
          frame.y - 30,
          `+${points}`,
          GREP_COLORS.green
        ))

        // Category streak text
        if (newCategoryStreakCount >= 3) {
          game.particles.push(createTextParticle(
            STACK_X + STACK_WIDTH / 2,
            frame.y - 60,
            `${newCategoryStreakCount}x ${frame.type.category.toUpperCase()}!`,
            frame.type.color
          ))
          setFeedback({ type: 'combo', text: `${newCategoryStreakCount}x ${frame.type.category} COMBO!` })
        } else {
          setFeedback({ type: 'correct', text: `return ${frame.type.returnType};` })
        }

        game.lastCategory = frame.type.category

        setGameState(prev => ({
          ...prev,
          score: prev.score + points + (newCategoryStreakCount >= 3 ? newCategoryStreakCount * 30 : 0),
          combo: prev.combo + 1,
          maxCombo: Math.max(prev.maxCombo, prev.combo + 1),
          correctReturns: prev.correctReturns + 1,
          categoryStreak: newCategoryStreak,
          categoryStreakCount: newCategoryStreakCount,
          level: Math.floor((prev.correctReturns + 1) / 10) + 1,
        }))

        // Small shake for streaks
        if (gameState.combo >= 4) {
          game.shake = createShake(3 + gameState.combo, 150)
        }
      }

      // Remove from stack
      game.stack.splice(frameIndex, 1)

      // Update positions
      game.stack.forEach((f, idx) => {
        f.targetY = STACK_BOTTOM - ((game.stack.length - 1 - idx) * FRAME_HEIGHT)
      })

      // Speed up slightly
      game.spawnInterval = Math.max(35, game.spawnInterval - 0.5)

    } else {
      // Wrong! Not LIFO order
      frame.shaking = true
      setTimeout(() => { frame.shaking = false }, 300)

      if (!muted) playSound('error')

      // Check if it's a bug - clicking wrong on a bug triggers its effect
      if (frame.isBug && frame.bugType) {
        switch (frame.bugType.effect) {
          case 'freeze':
            setGameState(prev => ({ ...prev, freezeTimer: 3000 }))
            setFeedback({ type: 'wrong', text: '🐛 FROZEN! Wait 3 seconds...' })
            break
          case 'multiply':
            // Spawn extra functions
            spawnFunction()
            spawnFunction()
            setFeedback({ type: 'wrong', text: '🦠 VIRUS! Stack multiplied!' })
            break
          case 'drain':
            setGameState(prev => ({ ...prev, score: Math.max(0, prev.score - 200) }))
            setFeedback({ type: 'wrong', text: '💧 LEAK! -200 points!' })
            break
        }
      } else {
        setFeedback({ type: 'wrong', text: 'STACK VIOLATION!' })
      }

      // Error particles
      game.particles.push(...createExplosion(
        STACK_X + STACK_WIDTH / 2,
        frame.y,
        10,
        [GREP_COLORS.red]
      ))

      // Big shake
      game.shake = createShake(10, 250)

      setGameState(prev => ({
        ...prev,
        combo: 0,
        categoryStreak: null,
        categoryStreakCount: 0,
        lives: prev.lives - 1,
        score: Math.max(0, prev.score - 50),
      }))

      if (gameState.lives <= 1) {
        if (!muted) playSound('explosion')
        setGameStatus('gameover')
      }
    }

    setTimeout(() => setFeedback(null), 800)
  }, [gameStatus, gameState, muted, spawnFunction])

  // Submit score when game ends
  useEffect(() => {
    if (gameStatus === 'gameover' && isAuthenticated && gameState.score > 0) {
      submitScore(gameState.score, gameState.maxCombo, gameState.correctReturns)
    }
  }, [gameStatus, isAuthenticated, gameState.score, gameState.maxCombo, gameState.correctReturns, submitScore])

  // Keyboard controls
  useEffect(() => {
    if (gameStatus !== 'playing') return

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key

      // Number keys 1-8 to return specific stack positions
      if (key >= '1' && key <= '8') {
        const index = parseInt(key) - 1
        const game = gameRef.current
        if (index < game.stack.length) {
          // Convert display index to actual index (bottom = 1, top = n)
          const actualIndex = game.stack.length - 1 - index
          handleReturn(actualIndex)
        }
      }

      // Space or Enter to return top
      if (key === ' ' || key === 'Enter') {
        e.preventDefault()
        const game = gameRef.current
        if (game.stack.length > 0) {
          handleReturn(game.stack.length - 1)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameStatus, handleReturn])

  // Freeze timer countdown
  useEffect(() => {
    if (gameState.freezeTimer > 0) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, freezeTimer: Math.max(0, prev.freezeTimer - 100) }))
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [gameState.freezeTimer])

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameStatus !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const game = gameRef.current
    for (let i = game.stack.length - 1; i >= 0; i--) {
      const frame = game.stack[i]
      if (
        x >= STACK_X &&
        x <= STACK_X + frame.width &&
        y >= frame.y - FRAME_HEIGHT / 2 &&
        y <= frame.y + FRAME_HEIGHT / 2
      ) {
        handleReturn(i)
        break
      }
    }
  }, [gameStatus, handleReturn])

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
      game.backgroundWave += 0.02

      // Get screen shake
      const shakeOffset = getShakeOffset(game.shake)

      ctx.save()
      ctx.translate(shakeOffset.x, shakeOffset.y)

      // Animated background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      bgGradient.addColorStop(0, '#0a0a12')
      bgGradient.addColorStop(0.5, '#12121f')
      bgGradient.addColorStop(1, '#0a0a15')
      ctx.fillStyle = bgGradient
      ctx.fillRect(-10, -10, canvas.width + 20, canvas.height + 20)

      // Animated circuit pattern
      ctx.strokeStyle = hexToRgba(GREP_COLORS.purple, 0.08)
      ctx.lineWidth = 1
      for (let i = 0; i < 8; i++) {
        const offset = (game.frameCount * 0.5 + i * 50) % 400 - 50
        ctx.beginPath()
        ctx.moveTo(offset, 0)
        for (let y = 0; y < canvas.height; y += 30) {
          const xWobble = Math.sin(y * 0.05 + game.backgroundWave + i) * 20
          ctx.lineTo(offset + xWobble, y)
        }
        ctx.stroke()
      }

      // Matrix-style falling characters
      ctx.font = '10px monospace'
      ctx.fillStyle = hexToRgba(GREP_COLORS.green, 0.15)
      for (let i = 0; i < 15; i++) {
        const x = (i * 60 + game.frameCount * 0.3) % canvas.width
        for (let j = 0; j < 8; j++) {
          const char = String.fromCharCode(33 + ((game.frameCount + i + j * 7) % 94))
          ctx.fillText(char, x, (j * 60 + game.frameCount * 0.5) % canvas.height)
        }
      }

      // Calculate panic level
      const newPanicLevel = Math.min(100, (game.stack.length / MAX_STACK_SIZE) * 100)
      setPanicLevel(newPanicLevel)

      // Spawn timer (paused if frozen)
      if (gameState.freezeTimer <= 0) {
        game.spawnTimer++
        if (game.spawnTimer >= game.spawnInterval) {
          game.spawnTimer = 0
          spawnFunction()
        }
      }

      // Draw memory visualization (left side)
      drawGlowingRect(ctx, 25, 45, 130, 410, GREP_COLORS.purple, 10)

      ctx.font = 'bold 12px monospace'
      ctx.fillStyle = GREP_COLORS.purple
      ctx.textAlign = 'center'
      ctx.fillText('MEMORY', 90, 35)

      // Memory bars
      for (let i = 0; i < MAX_STACK_SIZE; i++) {
        const filled = i < game.stack.length
        const barY = 400 - i * 48

        ctx.fillStyle = filled
          ? hexToRgba(game.stack[game.stack.length - 1 - i]?.type.color || GREP_COLORS.purple, 0.4)
          : hexToRgba('#374151', 0.3)
        ctx.beginPath()
        ctx.roundRect(35, barY, 110, 42, 6)
        ctx.fill()

        if (filled && game.stack[game.stack.length - 1 - i]) {
          const frame = game.stack[game.stack.length - 1 - i]
          ctx.fillStyle = '#fff'
          ctx.font = '10px monospace'
          ctx.textAlign = 'left'
          ctx.fillText(frame.type.name.slice(0, 10), 42, barY + 25)

          // Key hint
          ctx.fillStyle = hexToRgba('#fff', 0.5)
          ctx.font = '9px monospace'
          ctx.fillText(`[${i + 1}]`, 120, barY + 25)
        }
      }

      // Danger zone
      const dangerAlpha = game.stack.length >= 6 ? 0.3 + Math.sin(game.frameCount * 0.1) * 0.2 : 0.1
      const dangerGradient = ctx.createLinearGradient(STACK_X, MAX_STACK_Y, STACK_X, MAX_STACK_Y + 80)
      dangerGradient.addColorStop(0, hexToRgba(GREP_COLORS.red, dangerAlpha))
      dangerGradient.addColorStop(1, 'transparent')
      ctx.fillStyle = dangerGradient
      ctx.fillRect(STACK_X - 15, MAX_STACK_Y, STACK_WIDTH + 30, 80)

      // Danger line
      ctx.strokeStyle = hexToRgba(GREP_COLORS.red, game.stack.length >= 6 ? 0.8 : 0.3)
      ctx.lineWidth = 2
      ctx.setLineDash([8, 4])
      ctx.beginPath()
      ctx.moveTo(STACK_X - 15, MAX_STACK_Y + 45)
      ctx.lineTo(STACK_X + STACK_WIDTH + 15, MAX_STACK_Y + 45)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = GREP_COLORS.red
      ctx.font = 'bold 12px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('STACK OVERFLOW', STACK_X + STACK_WIDTH / 2, MAX_STACK_Y + 25)

      // Stack container
      ctx.strokeStyle = hexToRgba(GREP_COLORS.cyan, 0.4)
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(STACK_X - 15, MAX_STACK_Y + 45, STACK_WIDTH + 30, STACK_BOTTOM - MAX_STACK_Y, 10)
      ctx.stroke()

      // Freeze overlay
      if (gameState.freezeTimer > 0) {
        ctx.fillStyle = hexToRgba('#3B82F6', 0.3)
        ctx.fillRect(STACK_X - 15, MAX_STACK_Y + 45, STACK_WIDTH + 30, STACK_BOTTOM - MAX_STACK_Y)

        ctx.fillStyle = '#3B82F6'
        ctx.font = 'bold 24px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('FROZEN!', STACK_X + STACK_WIDTH / 2, STACK_BOTTOM / 2)
        ctx.font = '16px monospace'
        ctx.fillText(`${(gameState.freezeTimer / 1000).toFixed(1)}s`, STACK_X + STACK_WIDTH / 2, STACK_BOTTOM / 2 + 30)
      }

      // Draw stack frames
      game.stack.forEach((frame, idx) => {
        frame.y += (frame.targetY - frame.y) * 0.12

        const isTop = idx === game.stack.length - 1
        let x = STACK_X
        let y = frame.y

        // Shake effect
        if (frame.shaking) {
          x += (Math.random() - 0.5) * 12
        }

        // Bug glow effect
        if (frame.isBug) {
          ctx.shadowColor = frame.type.color
          ctx.shadowBlur = 15 + Math.sin(game.frameCount * 0.2) * 5
        }

        // Frame background with gradient
        const frameGradient = ctx.createLinearGradient(x, y - FRAME_HEIGHT / 2, x, y + FRAME_HEIGHT / 2)
        frameGradient.addColorStop(0, hexToRgba(frame.type.color, 0.3))
        frameGradient.addColorStop(1, hexToRgba(frame.type.color, 0.15))
        ctx.fillStyle = frameGradient
        ctx.beginPath()
        ctx.roundRect(x, y - FRAME_HEIGHT / 2 + 2, frame.width, FRAME_HEIGHT - 6, 10)
        ctx.fill()

        // Frame border
        ctx.strokeStyle = isTop ? frame.type.color : hexToRgba(frame.type.color, 0.5)
        ctx.lineWidth = isTop ? 3 : 1.5
        ctx.beginPath()
        ctx.roundRect(x, y - FRAME_HEIGHT / 2 + 2, frame.width, FRAME_HEIGHT - 6, 10)
        ctx.stroke()

        ctx.shadowBlur = 0

        // Function name
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 16px monospace'
        ctx.textAlign = 'left'
        ctx.fillText(frame.type.name, x + 15, y + 5)

        // Bug icon
        if (frame.isBug && frame.bugType) {
          ctx.font = '18px sans-serif'
          ctx.fillText(frame.bugType.icon, x + frame.width - 35, y + 5)
        }

        // Return type badge
        if (!frame.isBug) {
          ctx.fillStyle = hexToRgba('#000', 0.3)
          ctx.beginPath()
          ctx.roundRect(x + frame.width - 75, y - 14, 60, 26, 5)
          ctx.fill()
          ctx.fillStyle = '#9CA3AF'
          ctx.font = '11px monospace'
          ctx.fillText(frame.type.returnType, x + frame.width - 65, y + 2)
        }

        // Stack index
        ctx.fillStyle = hexToRgba('#fff', 0.4)
        ctx.font = '10px monospace'
        ctx.fillText(`[${game.stack.length - idx}]`, x + 15, y - 18)

        // "Press SPACE" hint for top frame
        if (isTop && game.frameCount % 90 < 60) {
          ctx.fillStyle = frame.type.color
          ctx.font = '10px monospace'
          ctx.textAlign = 'center'
          ctx.fillText('SPACE / CLICK', x + frame.width / 2, y + 22)
        }
      })

      // Update and draw particles
      game.particles = game.particles.filter(p => {
        if (updateParticle(p)) {
          drawParticle(ctx, p, 0)
          return true
        }
        return false
      })

      // Right side HUD
      drawGlowingRect(ctx, canvas.width - 175, 45, 155, 220, GREP_COLORS.orange, 10)

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 14px monospace'
      ctx.textAlign = 'left'
      ctx.fillText('STACK PANIC', canvas.width - 165, 70)

      ctx.font = '12px monospace'
      ctx.fillStyle = '#9CA3AF'
      ctx.fillText(`Score: ${gameState.score.toLocaleString()}`, canvas.width - 165, 100)
      ctx.fillText(`Level: ${gameState.level}`, canvas.width - 165, 120)
      ctx.fillText(`Combo: ${gameState.combo}x`, canvas.width - 165, 140)

      // Lives
      ctx.fillText('Lives:', canvas.width - 165, 165)
      for (let i = 0; i < gameState.lives; i++) {
        ctx.fillStyle = GREP_COLORS.red
        ctx.beginPath()
        const hx = canvas.width - 115 + i * 22
        ctx.moveTo(hx, 160)
        ctx.bezierCurveTo(hx - 7, 153, hx - 10, 163, hx, 170)
        ctx.bezierCurveTo(hx + 10, 163, hx + 7, 153, hx, 160)
        ctx.fill()
      }

      // Category streak
      if (gameState.categoryStreakCount >= 2) {
        ctx.fillStyle = GREP_COLORS.yellow
        ctx.font = '11px monospace'
        ctx.fillText(`${gameState.categoryStreak}: ${gameState.categoryStreakCount}x`, canvas.width - 165, 195)
      }

      // Level progress
      const levelProgress = (gameState.correctReturns % 10) / 10
      ctx.fillStyle = hexToRgba('#374151', 0.5)
      ctx.fillRect(canvas.width - 165, 210, 135, 8)
      ctx.fillStyle = GREP_COLORS.orange
      ctx.fillRect(canvas.width - 165, 210, 135 * levelProgress, 8)

      ctx.fillStyle = '#9CA3AF'
      ctx.font = '10px monospace'
      ctx.fillText('Next level', canvas.width - 165, 235)

      // Controls hint
      drawGlowingRect(ctx, canvas.width - 175, 280, 155, 100, GREP_COLORS.cyan, 10)
      ctx.fillStyle = GREP_COLORS.cyan
      ctx.font = 'bold 11px monospace'
      ctx.fillText('CONTROLS', canvas.width - 165, 300)
      ctx.font = '10px monospace'
      ctx.fillStyle = '#9CA3AF'
      ctx.fillText('SPACE - Return top', canvas.width - 165, 320)
      ctx.fillText('1-8 - Quick return', canvas.width - 165, 340)
      ctx.fillText('CLICK - Select', canvas.width - 165, 360)

      // Panic warning
      if (game.stack.length >= 5) {
        game.warningPulse = (game.warningPulse + 0.15) % (Math.PI * 2)
        const alpha = 0.4 + Math.sin(game.warningPulse) * 0.4

        ctx.fillStyle = hexToRgba(GREP_COLORS.red, alpha)
        ctx.font = 'bold 28px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('! WARNING !', canvas.width / 2, 30)

        // Screen edge glow
        const edgeGradient = ctx.createLinearGradient(0, 0, 30, 0)
        edgeGradient.addColorStop(0, hexToRgba(GREP_COLORS.red, alpha * 0.5))
        edgeGradient.addColorStop(1, 'transparent')
        ctx.fillStyle = edgeGradient
        ctx.fillRect(0, 0, 30, canvas.height)

        const edgeGradient2 = ctx.createLinearGradient(canvas.width, 0, canvas.width - 30, 0)
        edgeGradient2.addColorStop(0, hexToRgba(GREP_COLORS.red, alpha * 0.5))
        edgeGradient2.addColorStop(1, 'transparent')
        ctx.fillStyle = edgeGradient2
        ctx.fillRect(canvas.width - 30, 0, 30, canvas.height)
      }

      ctx.restore()

      game.animationId = requestAnimationFrame(gameLoop)
    }

    gameRef.current.animationId = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(gameRef.current.animationId)
    }
  }, [gameStatus, gameState, spawnFunction])

  // Start game
  const startGame = () => {
    setGameState({
      score: 0,
      level: 1,
      combo: 0,
      maxCombo: 0,
      correctReturns: 0,
      categoryStreak: null,
      categoryStreakCount: 0,
      lives: 3,
      freezeTimer: 0,
    })
    gameRef.current.stack = []
    gameRef.current.particles = []
    gameRef.current.spawnTimer = 0
    gameRef.current.spawnInterval = 100
    gameRef.current.nextId = 0
    gameRef.current.frameCount = 0
    gameRef.current.shake = null
    gameRef.current.lastCategory = null
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
              {gameStatus === 'playing' && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${panicLevel > 60 ? 'text-red-500 animate-pulse' : 'text-yellow-500'}`} />
                    <div className="w-24 h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          panicLevel > 80 ? 'bg-red-500' : panicLevel > 50 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${panicLevel}%` }}
                      />
                    </div>
                  </div>
                  {gameState.freezeTimer > 0 && (
                    <span className="text-blue-400 text-sm font-mono">FROZEN</span>
                  )}
                </div>
              )}
              <button
                onClick={() => setShowControls(!showControls)}
                className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
              >
                <Keyboard className="w-5 h-5" />
              </button>
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
        <div className="relative w-full max-w-4xl">
          <canvas
            ref={canvasRef}
            width={700}
            height={500}
            onClick={handleCanvasClick}
            className="w-full rounded-2xl border-2 border-orange-500/30 shadow-2xl shadow-orange-500/20 cursor-pointer"
          />

          {/* Start Screen */}
          {gameStatus === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/95 rounded-2xl backdrop-blur-sm">
              <div className="text-7xl mb-6 animate-bounce">📚</div>
              <h2 className="text-5xl font-display font-bold mb-3">
                <span className="text-gradient">Stack Panic</span>
              </h2>
              <p className="text-gray-400 mb-8 text-center max-w-md text-lg">
                Functions are piling up! Return them in LIFO order before stack overflow!
              </p>

              <button
                onClick={startGame}
                className="group flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-orange-500 to-yellow-500 font-bold text-xl text-dark-900 hover:scale-105 transition-transform shadow-lg shadow-orange-500/30"
              >
                <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Start Game
              </button>

              <div className="mt-10 grid grid-cols-3 gap-4 text-sm max-w-2xl">
                <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700">
                  <div className="text-orange-400 font-bold mb-2">LIFO Rules</div>
                  <p className="text-gray-400 text-xs">Return functions from TOP only. Wrong order = penalty!</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700">
                  <div className="text-cyan-400 font-bold mb-2">Combos</div>
                  <p className="text-gray-400 text-xs">Return same category functions for bonus multipliers!</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700">
                  <div className="text-red-400 font-bold mb-2">Watch Out!</div>
                  <p className="text-gray-400 text-xs">Bugs can freeze, multiply, or drain your score!</p>
                </div>
              </div>
            </div>
          )}

          {/* Game Over Screen */}
          {gameStatus === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/95 rounded-2xl backdrop-blur-sm">
              <div className="text-7xl mb-4">💥</div>
              <h2 className="text-4xl font-display font-bold mb-2 text-red-400">Stack Overflow!</h2>

              <div className="grid grid-cols-2 gap-4 my-8 max-w-md">
                <div className="p-5 rounded-xl bg-dark-800 border border-orange-500/30 text-center">
                  <div className="text-4xl font-bold text-orange-400">{gameState.score.toLocaleString()}</div>
                  <div className="text-sm text-gray-400 mt-1">Final Score</div>
                </div>
                <div className="p-5 rounded-xl bg-dark-800 border border-cyan-500/30 text-center">
                  <div className="text-4xl font-bold text-cyan-400">{gameState.level}</div>
                  <div className="text-sm text-gray-400 mt-1">Level Reached</div>
                </div>
                <div className="p-5 rounded-xl bg-dark-800 border border-purple-500/30 text-center">
                  <div className="text-4xl font-bold text-purple-400">{gameState.maxCombo}x</div>
                  <div className="text-sm text-gray-400 mt-1">Best Combo</div>
                </div>
                <div className="p-5 rounded-xl bg-dark-800 border border-green-500/30 text-center">
                  {isSubmitting ? (
                    <>
                      <div className="text-4xl font-bold text-green-400 animate-pulse">...</div>
                      <div className="text-sm text-gray-400 mt-1">Submitting...</div>
                    </>
                  ) : lastResult?.success ? (
                    <>
                      <div className="text-4xl font-bold text-green-400">+{lastResult.grepEarned}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        GREP Earned {lastResult.multiplier && lastResult.multiplier > 1 ? `(${lastResult.multiplier}x)` : ''}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-green-400">+{Math.floor(gameState.score / 20)}</div>
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
                  className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 font-bold text-dark-900 hover:scale-105 transition-transform"
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

          {/* Feedback overlay */}
          {feedback && (
            <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl font-bold text-lg ${
              feedback.type === 'correct' ? 'bg-green-500/20 border border-green-500 text-green-400' :
              feedback.type === 'combo' ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-400' :
              feedback.type === 'bug' ? 'bg-purple-500/20 border border-purple-500 text-purple-400' :
              'bg-red-500/20 border border-red-500 text-red-500'
            }`}>
              {feedback.text}
            </div>
          )}

          {/* Controls popup */}
          {showControls && (
            <div className="absolute top-16 right-4 p-4 rounded-xl bg-dark-800 border border-dark-600 shadow-xl">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Keyboard className="w-4 h-4" /> Controls
              </h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li><span className="text-white">SPACE/ENTER</span> - Return top function</li>
                <li><span className="text-white">1-8</span> - Quick return by position</li>
                <li><span className="text-white">CLICK</span> - Select function</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
