'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, RotateCcw, Volume2, VolumeX, Trophy, Zap, Heart, Shield, Clock } from 'lucide-react'
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
  PowerUp,
  PowerUpType,
  POWER_UP_CONFIG,
  GREP_COLORS,
  drawNeonText,
  drawGlowingRect,
  hexToRgba,
  easing,
} from '@/lib/gameUtils'

// Enhanced pattern challenges with difficulty tiers
const patternChallenges = [
  // Tier 1 - Easy
  { pattern: /^[a-z]+$/, display: '^[a-z]+$', hint: 'lowercase only', examples: ['hello', 'grep', 'rails', 'code'], tier: 1 },
  { pattern: /^[0-9]+$/, display: '^[0-9]+$', hint: 'digits only', examples: ['123', '42', '999', '007'], tier: 1 },
  { pattern: /^[A-Z]+$/, display: '^[A-Z]+$', hint: 'UPPERCASE only', examples: ['GREP', 'COIN', 'RAILS', 'CODE'], tier: 1 },
  { pattern: /^\d{3}$/, display: '^\\d{3}$', hint: 'exactly 3 digits', examples: ['123', '456', '789', '000'], tier: 1 },

  // Tier 2 - Medium
  { pattern: /^[a-z]+\d+$/, display: '^[a-z]+\\d+$', hint: 'letters then numbers', examples: ['abc123', 'grep42', 'x1', 'code99'], tier: 2 },
  { pattern: /^[aeiou]+$/, display: '^[aeiou]+$', hint: 'vowels only', examples: ['aeiou', 'oui', 'eau', 'aaa'], tier: 2 },
  { pattern: /^[^aeiou]+$/i, display: '^[^aeiou]+$', hint: 'NO vowels', examples: ['grp', 'cry', 'fly', 'myth'], tier: 2 },
  { pattern: /^\w{4}$/, display: '^\\w{4}$', hint: 'exactly 4 word chars', examples: ['grep', 'code', 'test', 'ab12'], tier: 2 },
  { pattern: /^[a-z]{2}\d{2}$/, display: '^[a-z]{2}\\d{2}$', hint: '2 letters + 2 digits', examples: ['ab12', 'xy99', 'gr42', 'cc00'], tier: 2 },

  // Tier 3 - Hard
  { pattern: /^(.)\1+$/, display: '^(.)\\1+$', hint: 'same char repeated', examples: ['aaa', '111', 'xxx', 'zzz'], tier: 3 },
  { pattern: /^[a-z]{2}\d{2}[a-z]{2}$/, display: '^[a-z]{2}\\d{2}[a-z]{2}$', hint: '2let+2num+2let', examples: ['ab12cd', 'xy99zz', 'gr42ep'], tier: 3 },
  { pattern: /^(?=.*[a-z])(?=.*\d).{3,}$/, display: '(?=.*[a-z])(?=.*\\d)', hint: 'has letter AND digit', examples: ['a1b', '1abc', 'x2y3', 'abc123'], tier: 3 },
  { pattern: /^[a-z]+@[a-z]+$/, display: '^[a-z]+@[a-z]+$', hint: 'word@word format', examples: ['user@grep', 'test@coin', 'a@b'], tier: 3 },

  // Tier 4 - Boss patterns
  { pattern: /^[a-z]{3}-\d{3}-[a-z]{3}$/, display: '^[a-z]{3}-\\d{3}-[a-z]{3}$', hint: 'xxx-000-xxx format', examples: ['abc-123-xyz', 'grep-420-coin'], tier: 4 },
  { pattern: /^(?:[a-z]{2}\d){3}$/, display: '^(?:[a-z]{2}\\d){3}$', hint: '(2 letters + digit) x3', examples: ['ab1cd2ef3', 'xy9zz0aa1'], tier: 4 },
]

// Generate wrong answers
function generateWrongAnswers(correctPattern: typeof patternChallenges[0], count: number): string[] {
  const wrongs: string[] = []
  const allExamples = patternChallenges
    .filter(p => p.display !== correctPattern.display)
    .flatMap(p => p.examples)

  const shuffled = [...allExamples].sort(() => Math.random() - 0.5)

  for (const candidate of shuffled) {
    if (wrongs.length >= count) break
    if (!correctPattern.pattern.test(candidate) && !wrongs.includes(candidate)) {
      wrongs.push(candidate)
    }
  }

  const fallbacks = ['!!!', '@#$', 'WRONG', '---', 'xyz123ABC', '  ', '000', 'null', 'undefined']
  let iterations = 0
  const maxIterations = 50
  while (wrongs.length < count && iterations < maxIterations) {
    iterations++
    const f = fallbacks[iterations % fallbacks.length]
    if (!wrongs.includes(f) && !correctPattern.pattern.test(f)) wrongs.push(f)
  }

  return wrongs.slice(0, count)
}

interface Track {
  x: number
  y: number
  type: 'straight' | 'bridge' | 'tunnel'
  hasCoins?: boolean
  hasPowerUp?: PowerUpType
}

interface GameState {
  score: number
  speed: number
  distance: number
  lives: number
  streak: number
  maxStreak: number
  coins: number
  level: number
  bossMode: boolean
}

interface ActivePowerUp {
  type: PowerUpType
  expiresAt: number
}

export default function GrepRailsGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle')

  // Score submission hooks
  const { submitScore, isSubmitting, lastResult } = useGameScore('grep-rails')
  const { isAuthenticated } = useAuth()
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    speed: 2.5,
    distance: 0,
    lives: 3,
    streak: 0,
    maxStreak: 0,
    coins: 0,
    level: 1,
    bossMode: false,
  })
  const [currentChallenge, setCurrentChallenge] = useState<typeof patternChallenges[0] | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [showChallenge, setShowChallenge] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [muted, setMuted] = useState(false)
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([])
  const [showHint, setShowHint] = useState(false)

  const gameRef = useRef({
    animationId: 0,
    train: { x: 100, y: 300, bobOffset: 0 },
    tracks: [] as Track[],
    particles: [] as Particle[],
    powerUps: [] as PowerUp[],
    collectibles: [] as { x: number; y: number; collected: boolean; type: 'coin' | 'gem' }[],
    shake: null as ShakeState | null,
    lastTrackX: 0,
    nextChallengeAt: 500,
    smokeTimer: 0,
    frameCount: 0,
    backgroundStars: [] as { x: number; y: number; size: number; speed: number }[],
    bossPatternIndex: 0,
    comboTimer: 0,
  })

  // Initialize background stars
  useEffect(() => {
    gameRef.current.backgroundStars = Array.from({ length: 100 }, () => ({
      x: Math.random() * 900,
      y: Math.random() * 500,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.1,
    }))
  }, [])

  // Submit score when game ends
  useEffect(() => {
    if (gameStatus === 'gameover' && isAuthenticated && gameState.score > 0) {
      submitScore(gameState.score, gameState.maxStreak, gameState.distance)
    }
  }, [gameStatus, isAuthenticated, gameState.score, gameState.maxStreak, gameState.distance, submitScore])

  // Initialize tracks
  const initTracks = useCallback(() => {
    const tracks: Track[] = []
    for (let i = 0; i < 25; i++) {
      tracks.push({
        x: i * 60,
        y: 300,
        type: 'straight',
        hasCoins: i > 5 && Math.random() > 0.7,
      })
    }
    gameRef.current.tracks = tracks
    gameRef.current.lastTrackX = 24 * 60
    gameRef.current.nextChallengeAt = 600
    gameRef.current.collectibles = []
    gameRef.current.powerUps = []
  }, [])

  // Check for active power-ups
  const hasPowerUp = useCallback((type: PowerUpType): boolean => {
    return activePowerUps.some(p => p.type === type && p.expiresAt > Date.now())
  }, [activePowerUps])

  // Generate new challenge
  const generateChallenge = useCallback(() => {
    const game = gameRef.current

    // Determine tier based on level and boss mode
    let maxTier = Math.min(4, Math.floor(gameState.level / 2) + 1)
    if (gameState.bossMode) maxTier = 4

    const eligiblePatterns = patternChallenges.filter(p => p.tier <= maxTier)
    const challenge = eligiblePatterns[Math.floor(Math.random() * eligiblePatterns.length)]

    const correctAnswer = challenge.examples[Math.floor(Math.random() * challenge.examples.length)]
    const wrongAnswers = generateWrongAnswers(challenge, 3)

    const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5)

    setCurrentChallenge(challenge)
    setOptions(allOptions)
    setShowChallenge(true)
    setShowHint(false)

    if (!muted) playSound('whoosh')
  }, [gameState.level, gameState.bossMode, muted])

  // Handle answer selection
  const handleAnswer = useCallback((answer: string) => {
    if (!currentChallenge || gameStatus !== 'playing') return

    const game = gameRef.current
    const isCorrect = currentChallenge.pattern.test(answer)
    const hasShield = hasPowerUp('shield')
    const hasDouble = hasPowerUp('doublePoints')

    if (isCorrect) {
      setFeedback('correct')
      if (!muted) playSound('success')

      const basePoints = 100 * currentChallenge.tier
      const streakBonus = gameState.streak * 20
      const points = (basePoints + streakBonus) * (hasDouble ? 2 : 1)

      // Combo sound for streaks
      if (gameState.streak >= 2 && !muted) {
        setTimeout(() => playSound('combo'), 100)
      }

      setGameState(prev => ({
        ...prev,
        score: prev.score + points,
        streak: prev.streak + 1,
        maxStreak: Math.max(prev.maxStreak, prev.streak + 1),
        speed: Math.min(8, prev.speed + 0.15),
        level: Math.floor((prev.score + points) / 1000) + 1,
      }))

      // Success particles
      game.particles.push(...createExplosion(
        game.train.x + 30,
        game.train.y,
        25,
        [GREP_COLORS.purple, GREP_COLORS.pink, GREP_COLORS.cyan, '#ffffff']
      ))

      // Score text
      game.particles.push(createTextParticle(
        game.train.x + 50,
        game.train.y - 30,
        `+${points}`,
        GREP_COLORS.green
      ))

      // Streak text for high streaks
      if (gameState.streak >= 4) {
        game.particles.push(createTextParticle(
          game.train.x + 50,
          game.train.y - 60,
          `${gameState.streak + 1}x STREAK!`,
          GREP_COLORS.orange
        ))
      }

      // Add more tracks with variety
      const lastTrack = game.tracks[game.tracks.length - 1]
      const newTrackCount = 12 + Math.floor(Math.random() * 5)

      for (let i = 0; i < newTrackCount; i++) {
        const newTrack: Track = {
          x: lastTrack.x + (i + 1) * 60,
          y: 300,
          type: Math.random() > 0.9 ? 'bridge' : Math.random() > 0.95 ? 'tunnel' : 'straight',
          hasCoins: Math.random() > 0.6,
        }

        // Chance for power-up
        if (Math.random() > 0.92) {
          const powerUpTypes: PowerUpType[] = ['slowmo', 'shield', 'doublePoints', 'extraLife', 'hint']
          newTrack.hasPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]
        }

        game.tracks.push(newTrack)
      }

      game.lastTrackX = lastTrack.x + newTrackCount * 60
      game.nextChallengeAt = game.train.x + 400 + Math.random() * 300

      // Screen shake for big streaks
      if (gameState.streak >= 3) {
        game.shake = createShake(5 + gameState.streak, 200)
      }

    } else {
      setFeedback('wrong')

      if (hasShield) {
        // Shield absorbs the hit
        if (!muted) playSound('powerup')
        setActivePowerUps(prev => prev.filter(p => p.type !== 'shield'))

        game.particles.push(createTextParticle(
          game.train.x + 50,
          game.train.y - 30,
          'SHIELD!',
          GREP_COLORS.purple
        ))
      } else {
        if (!muted) playSound('error')

        setGameState(prev => ({
          ...prev,
          lives: prev.lives - 1,
          streak: 0,
          speed: Math.max(2, prev.speed - 0.5),
        }))

        // Explosion particles
        game.particles.push(...createExplosion(
          game.train.x + 30,
          game.train.y,
          40,
          [GREP_COLORS.red, GREP_COLORS.orange, '#ffffff']
        ))

        // Big screen shake
        game.shake = createShake(15, 400)

        if (gameState.lives <= 1) {
          if (!muted) playSound('explosion')
          setGameStatus('gameover')
          return
        }
      }

      // Continue with fewer tracks
      game.nextChallengeAt = game.train.x + 250
      const lastTrack = game.tracks[game.tracks.length - 1]
      for (let i = 0; i < 6; i++) {
        game.tracks.push({
          x: lastTrack.x + (i + 1) * 60,
          y: 300,
          type: 'straight',
        })
      }
      game.lastTrackX = lastTrack.x + 6 * 60
    }

    setShowChallenge(false)
    setTimeout(() => setFeedback(null), 400)
  }, [currentChallenge, gameStatus, gameState, muted, hasPowerUp])

  // Use hint power-up
  const useHint = useCallback(() => {
    if (hasPowerUp('hint') && currentChallenge && !showHint) {
      setShowHint(true)
      setActivePowerUps(prev => prev.filter(p => p.type !== 'hint'))
      if (!muted) playSound('powerup')
    }
  }, [hasPowerUp, currentChallenge, showHint, muted])

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

      // Get screen shake offset
      const shakeOffset = getShakeOffset(game.shake)

      // Clear and apply shake
      ctx.save()
      ctx.translate(shakeOffset.x, shakeOffset.y)

      // Draw animated background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#0a0a1a')
      gradient.addColorStop(0.5, '#1a1a3a')
      gradient.addColorStop(1, '#0a0a2a')
      ctx.fillStyle = gradient
      ctx.fillRect(-10, -10, canvas.width + 20, canvas.height + 20)

      // Animated stars
      ctx.fillStyle = '#ffffff'
      game.backgroundStars.forEach(star => {
        star.x -= star.speed * (hasPowerUp('slowmo') ? 0.3 : 1)
        if (star.x < 0) star.x = canvas.width

        const twinkle = 0.5 + Math.sin(game.frameCount * 0.05 + star.x) * 0.5
        ctx.globalAlpha = twinkle * 0.8
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1

      // Draw neon grid
      ctx.strokeStyle = hexToRgba(GREP_COLORS.purple, 0.1)
      ctx.lineWidth = 1
      const gridOffset = (game.frameCount * 2) % 50
      for (let x = -gridOffset; x < canvas.width + 50; x += 50) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Distant mountains with parallax
      const mountainColors = [
        hexToRgba(GREP_COLORS.purple, 0.15),
        hexToRgba(GREP_COLORS.pink, 0.1),
        hexToRgba(GREP_COLORS.cyan, 0.08),
      ]
      mountainColors.forEach((color, i) => {
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.moveTo(0, 250 - i * 30)
        for (let x = 0; x <= canvas.width; x += 80) {
          const h = 180 - i * 40 + Math.sin((x + game.train.x * (0.05 - i * 0.01)) * 0.015) * (40 - i * 10)
          ctx.lineTo(x, h)
        }
        ctx.lineTo(canvas.width, canvas.height)
        ctx.lineTo(0, canvas.height)
        ctx.closePath()
        ctx.fill()
      })

      // Update train position
      const speedMultiplier = hasPowerUp('slowmo') ? 0.4 : 1
      if (!showChallenge) {
        game.train.x += gameState.speed * speedMultiplier
        game.train.bobOffset = Math.sin(game.frameCount * 0.2) * 2
        setGameState(prev => ({ ...prev, distance: Math.floor(game.train.x) }))
      }

      // Check for challenge trigger
      if (game.train.x >= game.nextChallengeAt && !showChallenge) {
        generateChallenge()
      }

      // Check for track end
      const trackEnd = game.tracks[game.tracks.length - 1]
      if (trackEnd && game.train.x > trackEnd.x + 100) {
        if (!muted) playSound('explosion')
        setGameStatus('gameover')
        return
      }

      // Camera offset
      const cameraX = game.train.x - 200

      // Draw tracks with enhanced visuals
      game.tracks.forEach((track, idx) => {
        const screenX = track.x - cameraX
        if (screenX < -100 || screenX > canvas.width + 100) return

        // Track bed (gravel)
        ctx.fillStyle = '#2a2a3a'
        ctx.fillRect(screenX - 5, track.y + 30, 70, 15)

        // Rail ties with glow
        for (let i = 0; i < 60; i += 12) {
          ctx.fillStyle = '#4a4a5a'
          ctx.fillRect(screenX + i - 1, track.y + 8, 6, 25)
        }

        // Rails with metallic shine
        const railGradient = ctx.createLinearGradient(screenX, track.y, screenX, track.y + 30)
        railGradient.addColorStop(0, '#9CA3AF')
        railGradient.addColorStop(0.5, '#E5E7EB')
        railGradient.addColorStop(1, '#6B7280')

        ctx.strokeStyle = railGradient
        ctx.lineWidth = 4
        ctx.lineCap = 'round'

        // Top rail
        ctx.beginPath()
        ctx.moveTo(screenX, track.y + 5)
        ctx.lineTo(screenX + 60, track.y + 5)
        ctx.stroke()

        // Bottom rail
        ctx.beginPath()
        ctx.moveTo(screenX, track.y + 28)
        ctx.lineTo(screenX + 60, track.y + 28)
        ctx.stroke()

        // Draw collectibles on track
        if (track.hasCoins && !game.collectibles.find(c => c.x === track.x)) {
          game.collectibles.push({
            x: track.x + 30,
            y: track.y - 20,
            collected: false,
            type: Math.random() > 0.9 ? 'gem' : 'coin',
          })
        }

        // Draw power-up on track
        if (track.hasPowerUp) {
          const config = POWER_UP_CONFIG[track.hasPowerUp]
          const bobY = Math.sin(game.frameCount * 0.1 + track.x) * 5

          // Glow
          ctx.shadowColor = config.color
          ctx.shadowBlur = 15

          ctx.fillStyle = hexToRgba(config.color, 0.3)
          ctx.beginPath()
          ctx.arc(screenX + 30, track.y - 40 + bobY, 20, 0, Math.PI * 2)
          ctx.fill()

          ctx.strokeStyle = config.color
          ctx.lineWidth = 2
          ctx.stroke()

          ctx.shadowBlur = 0

          // Icon
          ctx.font = '20px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(config.icon, screenX + 30, track.y - 35 + bobY)

          // Check collection
          if (Math.abs(game.train.x - track.x) < 40) {
            // Save power-up type before clearing
            const powerUpType = track.hasPowerUp
            track.hasPowerUp = undefined

            if (!muted) playSound('powerup')

            if (powerUpType === 'extraLife') {
              setGameState(prev => ({ ...prev, lives: Math.min(5, prev.lives + 1) }))
            } else {
              const duration = config.duration || 0
              if (duration > 0) {
                setActivePowerUps(prev => [...prev, { type: powerUpType!, expiresAt: Date.now() + duration }])
              } else {
                setActivePowerUps(prev => [...prev, { type: powerUpType!, expiresAt: Date.now() + 999999 }])
              }
            }

            game.particles.push(createTextParticle(
              track.x + 30,
              track.y - 60,
              config.name,
              config.color
            ))
          }
        }
      })

      // Draw and collect coins
      game.collectibles = game.collectibles.filter(coin => {
        if (coin.collected) return false

        const screenX = coin.x - cameraX
        if (screenX < -50) return false

        const bobY = Math.sin(game.frameCount * 0.15 + coin.x * 0.1) * 4
        const rotation = game.frameCount * 0.1

        // Check collection
        if (Math.abs(game.train.x - coin.x + 30) < 50 && !coin.collected) {
          coin.collected = true
          if (!muted) playSound('coin')

          const coinValue = coin.type === 'gem' ? 50 : 10
          setGameState(prev => ({
            ...prev,
            coins: prev.coins + coinValue,
            score: prev.score + coinValue,
          }))

          game.particles.push(createTextParticle(coin.x, coin.y - 20, `+${coinValue}`, GREP_COLORS.yellow))
          game.particles.push(...createExplosion(coin.x, coin.y, 8, [GREP_COLORS.yellow, GREP_COLORS.orange]))
          return false
        }

        // Draw coin/gem
        ctx.save()
        ctx.translate(screenX, coin.y + bobY)

        if (coin.type === 'gem') {
          // Diamond shape
          ctx.fillStyle = GREP_COLORS.cyan
          ctx.shadowColor = GREP_COLORS.cyan
          ctx.shadowBlur = 10
          ctx.beginPath()
          ctx.moveTo(0, -12)
          ctx.lineTo(10, 0)
          ctx.lineTo(0, 12)
          ctx.lineTo(-10, 0)
          ctx.closePath()
          ctx.fill()
        } else {
          // Coin
          ctx.fillStyle = GREP_COLORS.yellow
          ctx.shadowColor = GREP_COLORS.yellow
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.ellipse(0, 0, 8 * Math.abs(Math.cos(rotation)), 10, 0, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = GREP_COLORS.orange
          ctx.font = 'bold 10px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('G', 0, 4)
        }

        ctx.restore()
        return true
      })

      // Warning indicator
      if (trackEnd) {
        const distToEnd = trackEnd.x - game.train.x
        if (distToEnd < 350 && distToEnd > 0) {
          const pulse = 0.5 + Math.sin(game.frameCount * 0.15) * 0.5
          drawNeonText(ctx, '! TRACK ENDING !', canvas.width / 2, 60, hexToRgba(GREP_COLORS.red, pulse), 28)
        }
      }

      // Draw train
      const trainScreenX = game.train.x - cameraX
      const trainY = game.train.y + game.train.bobOffset

      // Train shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.beginPath()
      ctx.ellipse(trainScreenX + 30, game.train.y + 40, 40, 8, 0, 0, Math.PI * 2)
      ctx.fill()

      // Smoke particles
      game.smokeTimer++
      if (game.smokeTimer % 3 === 0) {
        game.particles.push({
          x: trainScreenX + 15 + cameraX,
          y: trainY - 55,
          vx: (Math.random() - 0.5) * 2 - gameState.speed * 0.3,
          vy: -2 - Math.random() * 2,
          life: 1,
          maxLife: 1,
          color: '#6B7280',
          size: 8 + Math.random() * 6,
          type: 'circle',
          gravity: -0.05,
          friction: 0.98,
        })
      }

      // Steam puffs from wheels
      if (game.smokeTimer % 8 === 0) {
        game.particles.push({
          x: trainScreenX + 15 + cameraX,
          y: trainY + 15,
          vx: -3 - Math.random() * 2,
          vy: -1,
          life: 0.6,
          maxLife: 0.6,
          color: '#9CA3AF',
          size: 6,
          type: 'circle',
          gravity: -0.02,
          friction: 0.95,
        })
      }

      // Train body with gradient
      const trainGradient = ctx.createLinearGradient(trainScreenX, trainY - 45, trainScreenX, trainY + 15)
      trainGradient.addColorStop(0, GREP_COLORS.purple)
      trainGradient.addColorStop(0.5, '#7C3AED')
      trainGradient.addColorStop(1, '#5B21B6')

      // Main body
      ctx.fillStyle = trainGradient
      ctx.shadowColor = GREP_COLORS.purple
      ctx.shadowBlur = hasPowerUp('shield') ? 20 : 10

      ctx.beginPath()
      ctx.roundRect(trainScreenX, trainY - 35, 65, 45, 8)
      ctx.fill()

      ctx.shadowBlur = 0

      // Cabin
      ctx.fillStyle = '#6D28D9'
      ctx.beginPath()
      ctx.roundRect(trainScreenX + 38, trainY - 50, 27, 20, [6, 6, 0, 0])
      ctx.fill()

      // Window with glow
      ctx.fillStyle = '#C4B5FD'
      ctx.shadowColor = '#C4B5FD'
      ctx.shadowBlur = 5
      ctx.fillRect(trainScreenX + 43, trainY - 45, 17, 12)
      ctx.shadowBlur = 0

      // Smokestack
      ctx.fillStyle = '#4C1D95'
      ctx.fillRect(trainScreenX + 8, trainY - 55, 18, 22)
      ctx.fillStyle = '#3B0764'
      ctx.beginPath()
      ctx.arc(trainScreenX + 17, trainY - 55, 10, Math.PI, 0)
      ctx.fill()

      // Boiler details
      ctx.strokeStyle = '#9333EA'
      ctx.lineWidth = 2
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.arc(trainScreenX + 20 + i * 12, trainY - 15, 6, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Cowcatcher
      ctx.fillStyle = '#374151'
      ctx.beginPath()
      ctx.moveTo(trainScreenX, trainY + 5)
      ctx.lineTo(trainScreenX - 20, trainY + 30)
      ctx.lineTo(trainScreenX + 5, trainY + 30)
      ctx.lineTo(trainScreenX + 5, trainY + 5)
      ctx.closePath()
      ctx.fill()

      // Wheels with animation
      const wheelAngle = game.train.x * 0.15
      const wheelPositions = [trainScreenX + 12, trainScreenX + 48]

      wheelPositions.forEach(wx => {
        // Wheel base
        ctx.fillStyle = '#1F2937'
        ctx.beginPath()
        ctx.arc(wx, trainY + 18, 14, 0, Math.PI * 2)
        ctx.fill()

        // Wheel rim
        ctx.strokeStyle = '#4B5563'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(wx, trainY + 18, 11, 0, Math.PI * 2)
        ctx.stroke()

        // Wheel spokes
        ctx.strokeStyle = '#6B7280'
        ctx.lineWidth = 2
        for (let i = 0; i < 4; i++) {
          const angle = wheelAngle + (i * Math.PI / 2)
          ctx.beginPath()
          ctx.moveTo(wx + Math.cos(angle) * 4, trainY + 18 + Math.sin(angle) * 4)
          ctx.lineTo(wx + Math.cos(angle) * 10, trainY + 18 + Math.sin(angle) * 10)
          ctx.stroke()
        }

        // Center hub
        ctx.fillStyle = '#9CA3AF'
        ctx.beginPath()
        ctx.arc(wx, trainY + 18, 4, 0, Math.PI * 2)
        ctx.fill()
      })

      // Headlight
      const headlightGradient = ctx.createRadialGradient(
        trainScreenX - 5, trainY - 10, 0,
        trainScreenX - 5, trainY - 10, 60
      )
      headlightGradient.addColorStop(0, 'rgba(255, 255, 200, 0.4)')
      headlightGradient.addColorStop(0.5, 'rgba(255, 255, 150, 0.1)')
      headlightGradient.addColorStop(1, 'rgba(255, 255, 100, 0)')

      ctx.fillStyle = headlightGradient
      ctx.beginPath()
      ctx.moveTo(trainScreenX - 5, trainY - 15)
      ctx.lineTo(trainScreenX - 80, trainY - 40)
      ctx.lineTo(trainScreenX - 80, trainY + 20)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = '#FEF3C7'
      ctx.shadowColor = '#FEF3C7'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(trainScreenX - 5, trainY - 10, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Shield effect if active
      if (hasPowerUp('shield')) {
        ctx.strokeStyle = hexToRgba(GREP_COLORS.purple, 0.5 + Math.sin(game.frameCount * 0.1) * 0.3)
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(trainScreenX + 30, trainY - 10, 50, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Update and draw particles
      game.particles = game.particles.filter(p => {
        if (updateParticle(p)) {
          drawParticle(ctx, p, cameraX)
          return true
        }
        return false
      })

      // Draw HUD
      drawGlowingRect(ctx, 10, 10, 180, 100, GREP_COLORS.purple, 12)

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 14px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`SCORE: ${gameState.score.toLocaleString()}`, 25, 35)
      ctx.fillText(`DISTANCE: ${gameState.distance}m`, 25, 55)
      ctx.fillText(`LEVEL: ${gameState.level}`, 25, 75)

      // Streak indicator
      if (gameState.streak > 0) {
        ctx.fillStyle = gameState.streak >= 5 ? GREP_COLORS.orange : GREP_COLORS.yellow
        ctx.fillText(`${gameState.streak}x STREAK`, 25, 95)
      }

      // Lives (hearts)
      for (let i = 0; i < gameState.lives; i++) {
        ctx.fillStyle = GREP_COLORS.red
        ctx.shadowColor = GREP_COLORS.red
        ctx.shadowBlur = 5

        const hx = canvas.width - 35 - i * 35
        ctx.beginPath()
        ctx.moveTo(hx, 25)
        ctx.bezierCurveTo(hx - 10, 15, hx - 15, 30, hx, 40)
        ctx.bezierCurveTo(hx + 15, 30, hx + 10, 15, hx, 25)
        ctx.fill()
      }
      ctx.shadowBlur = 0

      // Coins display
      ctx.fillStyle = GREP_COLORS.yellow
      ctx.font = 'bold 16px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(`${gameState.coins}`, canvas.width - 25, 75)
      ctx.font = '20px sans-serif'
      ctx.fillText('G', canvas.width - 45, 76)

      // Active power-ups display
      const activePowers = activePowerUps.filter(p => p.expiresAt > Date.now())
      activePowers.forEach((power, idx) => {
        const config = POWER_UP_CONFIG[power.type]
        const remaining = Math.max(0, power.expiresAt - Date.now())
        const progress = remaining / (config.duration || 1)

        const px = 200 + idx * 50
        const py = 25

        // Background
        ctx.fillStyle = hexToRgba(config.color, 0.3)
        ctx.beginPath()
        ctx.arc(px, py, 18, 0, Math.PI * 2)
        ctx.fill()

        // Progress ring
        ctx.strokeStyle = config.color
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(px, py, 18, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress)
        ctx.stroke()

        // Icon
        ctx.font = '16px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(config.icon, px, py + 5)
      })

      // Speed indicator
      const speedPercent = (gameState.speed - 2) / 6
      ctx.fillStyle = hexToRgba(GREP_COLORS.cyan, 0.3)
      ctx.fillRect(canvas.width - 120, canvas.height - 30, 100, 10)
      ctx.fillStyle = GREP_COLORS.cyan
      ctx.fillRect(canvas.width - 120, canvas.height - 30, 100 * speedPercent, 10)
      ctx.fillStyle = '#fff'
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('SPEED', canvas.width - 70, canvas.height - 35)

      ctx.restore() // Restore from shake

      game.animationId = requestAnimationFrame(gameLoop)
    }

    gameRef.current.animationId = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(gameRef.current.animationId)
    }
  }, [gameStatus, gameState, showChallenge, generateChallenge, muted, hasPowerUp, activePowerUps])

  // Start game
  const startGame = () => {
    setGameState({
      score: 0,
      speed: 2.5,
      distance: 0,
      lives: 3,
      streak: 0,
      maxStreak: 0,
      coins: 0,
      level: 1,
      bossMode: false,
    })
    gameRef.current.train = { x: 100, y: 300, bobOffset: 0 }
    gameRef.current.particles = []
    gameRef.current.shake = null
    setActivePowerUps([])
    initTracks()
    setShowChallenge(false)
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
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>{gameState.lives}</span>
                  {hasPowerUp('shield') && <Shield className="w-4 h-4 text-purple-500" />}
                  {hasPowerUp('slowmo') && <Clock className="w-4 h-4 text-cyan-500" />}
                </div>
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
        <div className="relative w-full max-w-4xl">
          <canvas
            ref={canvasRef}
            width={896}
            height={500}
            className="w-full rounded-2xl border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20"
          />

          {/* Start Screen */}
          {gameStatus === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/95 rounded-2xl backdrop-blur-sm">
              <div className="text-7xl mb-6 animate-bounce">🚂</div>
              <h2 className="text-5xl font-display font-bold mb-3 text-gradient">Grep Rails</h2>
              <p className="text-gray-400 mb-8 text-center max-w-md text-lg">
                Match regex patterns to keep your train on track!
              </p>

              <button
                onClick={startGame}
                className="group flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-xl hover:scale-105 transition-transform shadow-lg shadow-purple-500/30"
              >
                <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Start Game
              </button>

              <div className="mt-10 grid grid-cols-2 gap-4 text-sm max-w-lg">
                <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700">
                  <div className="text-purple-400 font-bold mb-2">How to Play</div>
                  <ul className="text-gray-400 space-y-1 text-xs">
                    <li>Match regex patterns</li>
                    <li>Build combo streaks</li>
                    <li>Collect coins & power-ups</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700">
                  <div className="text-cyan-400 font-bold mb-2">Power-Ups</div>
                  <ul className="text-gray-400 space-y-1 text-xs">
                    <li>🛡️ Shield - Block 1 mistake</li>
                    <li>⏱️ Slow-Mo - Slower train</li>
                    <li>💡 Hint - Show pattern tip</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Game Over Screen */}
          {gameStatus === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/95 rounded-2xl backdrop-blur-sm">
              <div className="text-7xl mb-4">💥</div>
              <h2 className="text-4xl font-display font-bold mb-2 text-red-400">Derailed!</h2>

              <div className="grid grid-cols-2 gap-4 my-8 max-w-md">
                <div className="p-5 rounded-xl bg-dark-800 border border-purple-500/30 text-center">
                  <div className="text-4xl font-bold text-purple-400">{gameState.score.toLocaleString()}</div>
                  <div className="text-sm text-gray-400 mt-1">Final Score</div>
                </div>
                <div className="p-5 rounded-xl bg-dark-800 border border-cyan-500/30 text-center">
                  <div className="text-4xl font-bold text-cyan-400">{gameState.distance}m</div>
                  <div className="text-sm text-gray-400 mt-1">Distance</div>
                </div>
                <div className="p-5 rounded-xl bg-dark-800 border border-orange-500/30 text-center">
                  <div className="text-4xl font-bold text-orange-400">{gameState.maxStreak}x</div>
                  <div className="text-sm text-gray-400 mt-1">Best Streak</div>
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
                      <div className="text-4xl font-bold text-green-400">+{Math.floor(gameState.score / 10)}</div>
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
                  className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold hover:scale-105 transition-transform"
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

          {/* Challenge Modal */}
          {showChallenge && currentChallenge && gameStatus === 'playing' && (
            <div className="absolute inset-0 flex items-center justify-center bg-dark-900/80 rounded-2xl backdrop-blur-sm">
              <div className="bg-dark-800 border-2 border-purple-500 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl shadow-purple-500/30 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-bold">PATTERN CHALLENGE!</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      currentChallenge.tier === 1 ? 'bg-green-500/20 text-green-400' :
                      currentChallenge.tier === 2 ? 'bg-yellow-500/20 text-yellow-400' :
                      currentChallenge.tier === 3 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      TIER {currentChallenge.tier}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-dark-900 border border-purple-500/30 mb-4 font-mono">
                  <div className="text-xs text-gray-500 mb-1">Match this regex:</div>
                  <div className="text-2xl text-purple-400 font-bold">{currentChallenge.display}</div>
                  {(showHint || hasPowerUp('hint')) && (
                    <div className="text-sm text-cyan-400 mt-2 flex items-center gap-2">
                      <span>💡</span> {currentChallenge.hint}
                    </div>
                  )}
                </div>

                {hasPowerUp('hint') && !showHint && (
                  <button
                    onClick={useHint}
                    className="w-full mb-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-medium hover:bg-cyan-500/30 transition-colors"
                  >
                    💡 Use Hint
                  </button>
                )}

                <div className="text-sm text-gray-400 mb-4">Select the matching string:</div>

                <div className="grid grid-cols-2 gap-3">
                  {options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(option)}
                      className="p-4 rounded-xl bg-dark-700 border-2 border-dark-600 hover:border-purple-500 hover:bg-dark-600 transition-all font-mono text-lg hover:scale-105"
                    >
                      {option || '(empty)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Feedback overlay */}
          {feedback && (
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none rounded-2xl ${
              feedback === 'correct' ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              <div className={`text-6xl font-bold ${
                feedback === 'correct' ? 'text-green-400' : 'text-red-400'
              } animate-pulse`}>
                {feedback === 'correct' ? 'CORRECT!' : 'WRONG!'}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
