'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, Pause, RotateCcw, Eye, Zap, Target, Sparkles } from 'lucide-react'
import { playSound, createExplosion, createTextParticle, updateParticle, drawParticle, Particle, GREP_COLORS } from '@/lib/gameUtils'
import { useStaking } from '@/context/StakingContext'
import { MultiplierIndicator } from '@/components/StakingBadge'

interface QuantumParticle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  state: 'superposition' | 'observed' | 'collapsed'
  type: 'electron' | 'photon' | 'quark' | 'neutrino'
  spin: number // 0 or 1
  color: string
  phase: number
  entangledWith: number | null
  size: number
}

interface Level {
  name: string
  targetPattern: number[] // Binary pattern to match
  particles: number
  timeLimit: number
  requiredScore: number
}

const PARTICLE_TYPES = {
  electron: { color: GREP_COLORS.purple, symbol: 'e⁻', probability: 0.4 },
  photon: { color: GREP_COLORS.yellow, symbol: 'γ', probability: 0.3 },
  quark: { color: GREP_COLORS.pink, symbol: 'q', probability: 0.2 },
  neutrino: { color: GREP_COLORS.cyan, symbol: 'ν', probability: 0.1 },
}

const LEVELS: Level[] = [
  { name: 'Binary Dawn', targetPattern: [0, 1, 0, 1], particles: 4, timeLimit: 30, requiredScore: 100 },
  { name: 'Quantum Flip', targetPattern: [1, 1, 0, 0], particles: 4, timeLimit: 25, requiredScore: 150 },
  { name: 'Entangled', targetPattern: [0, 1, 1, 0, 1, 0], particles: 6, timeLimit: 35, requiredScore: 200 },
  { name: 'Superposition', targetPattern: [1, 0, 1, 0, 1, 0, 1, 0], particles: 8, timeLimit: 40, requiredScore: 300 },
  { name: 'Wave Function', targetPattern: [1, 1, 1, 0, 0, 0, 1, 1, 1], particles: 9, timeLimit: 45, requiredScore: 400 },
  { name: 'Collapse', targetPattern: [0, 1, 0, 0, 1, 1, 0, 1, 0, 1], particles: 10, timeLimit: 50, requiredScore: 500 },
]

export default function QuantumGrepGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'levelComplete' | 'gameOver'>('menu')
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [particles, setParticles] = useState<QuantumParticle[]>([])
  const [observedPattern, setObservedPattern] = useState<number[]>([])
  const [effects, setEffects] = useState<Particle[]>([])
  const [observerMode, setObserverMode] = useState(false)
  const [selectedParticle, setSelectedParticle] = useState<number | null>(null)
  const [observations, setObservations] = useState(3)
  const [combo, setCombo] = useState(0)
  const [hoveredParticle, setHoveredParticle] = useState<number | null>(null)

  const { isConnected, multiplier, addEarnings } = useStaking()

  const currentLevel = LEVELS[level] || LEVELS[LEVELS.length - 1]

  // Initialize particles for a level
  const initializeParticles = useCallback((lvl: Level) => {
    const newParticles: QuantumParticle[] = []
    const types = Object.keys(PARTICLE_TYPES) as Array<keyof typeof PARTICLE_TYPES>

    for (let i = 0; i < lvl.particles; i++) {
      const typeRoll = Math.random()
      let type: keyof typeof PARTICLE_TYPES = 'electron'
      let cumulative = 0
      for (const t of types) {
        cumulative += PARTICLE_TYPES[t].probability
        if (typeRoll < cumulative) {
          type = t
          break
        }
      }

      const angle = (i / lvl.particles) * Math.PI * 2
      const radius = 120
      const centerX = 200
      const centerY = 180

      newParticles.push({
        id: i,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        state: 'superposition',
        type,
        spin: Math.random() > 0.5 ? 1 : 0,
        color: PARTICLE_TYPES[type].color,
        phase: Math.random() * Math.PI * 2,
        entangledWith: null,
        size: 20,
      })
    }

    // Create some entangled pairs
    const entangledPairs = Math.floor(lvl.particles / 4)
    for (let i = 0; i < entangledPairs; i++) {
      const idx1 = Math.floor(Math.random() * newParticles.length)
      let idx2 = Math.floor(Math.random() * newParticles.length)
      while (idx2 === idx1) idx2 = Math.floor(Math.random() * newParticles.length)

      newParticles[idx1].entangledWith = idx2
      newParticles[idx2].entangledWith = idx1
    }

    return newParticles
  }, [])

  // Start game
  const startGame = useCallback(() => {
    setGameState('playing')
    setScore(0)
    setLevel(0)
    setTimeLeft(LEVELS[0].timeLimit)
    setParticles(initializeParticles(LEVELS[0]))
    setObservedPattern([])
    setObservations(3)
    setCombo(0)
    playSound('levelup')
  }, [initializeParticles])

  // Observe a particle
  const observeParticle = useCallback((particleId: number) => {
    if (observations <= 0 || gameState !== 'playing') return

    setParticles(prev => {
      const newParticles = [...prev]
      const particle = newParticles.find(p => p.id === particleId)
      if (!particle || particle.state !== 'superposition') return prev

      // Collapse the particle's wave function
      particle.state = 'observed'
      particle.spin = Math.random() > 0.5 ? 1 : 0
      playSound('powerup')

      // Handle entanglement - entangled particle gets opposite spin
      if (particle.entangledWith !== null) {
        const entangled = newParticles.find(p => p.id === particle.entangledWith)
        if (entangled && entangled.state === 'superposition') {
          entangled.state = 'observed'
          entangled.spin = particle.spin === 1 ? 0 : 1
          playSound('combo')
        }
      }

      return newParticles
    })

    setObservations(prev => prev - 1)
  }, [observations, gameState])

  // Collapse and check pattern
  const collapseAndCheck = useCallback(() => {
    const pattern = particles
      .filter(p => p.state === 'observed')
      .sort((a, b) => {
        const angleA = Math.atan2(a.y - 180, a.x - 200)
        const angleB = Math.atan2(b.y - 180, b.x - 200)
        return angleA - angleB
      })
      .map(p => p.spin)

    setObservedPattern(pattern)

    // Check if pattern matches target
    const target = currentLevel.targetPattern
    if (pattern.length === target.length) {
      const matches = pattern.filter((s, i) => s === target[i]).length
      const accuracy = matches / target.length

      if (accuracy === 1) {
        // Perfect match!
        const basePoints = currentLevel.requiredScore
        const timeBonus = Math.floor(timeLeft * 10)
        const comboBonus = combo * 50
        const totalPoints = basePoints + timeBonus + comboBonus

        setScore(prev => prev + totalPoints)
        setCombo(prev => prev + 1)
        playSound('levelup')

        // Create celebration effects
        setEffects(prev => [
          ...prev,
          ...createExplosion(200, 180, 30, [GREP_COLORS.purple, GREP_COLORS.pink, GREP_COLORS.cyan]),
          createTextParticle(200, 100, `+${totalPoints}`, GREP_COLORS.green),
          createTextParticle(200, 140, 'PERFECT!', GREP_COLORS.yellow),
        ])

        // Next level
        if (level < LEVELS.length - 1) {
          setTimeout(() => {
            const nextLevel = level + 1
            setLevel(nextLevel)
            setTimeLeft(LEVELS[nextLevel].timeLimit)
            setParticles(initializeParticles(LEVELS[nextLevel]))
            setObservedPattern([])
            setObservations(3 + Math.floor(nextLevel / 2))
          }, 1500)
        } else {
          setGameState('levelComplete')
          if (isConnected) {
            addEarnings(Math.floor(score / 10))
          }
        }
      } else {
        // Partial match
        const partialPoints = Math.floor(accuracy * currentLevel.requiredScore * 0.5)
        setScore(prev => prev + partialPoints)
        setCombo(0)
        playSound('error')

        setEffects(prev => [
          ...prev,
          createTextParticle(200, 100, `${Math.floor(accuracy * 100)}% Match`, GREP_COLORS.orange),
        ])

        // Reset for retry
        setTimeout(() => {
          setParticles(initializeParticles(currentLevel))
          setObservedPattern([])
          setObservations(3 + Math.floor(level / 2))
        }, 1000)
      }
    }
  }, [particles, currentLevel, timeLeft, combo, level, score, isConnected, addEarnings, initializeParticles])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('gameOver')
          if (isConnected) {
            addEarnings(Math.floor(score / 20))
          }
          playSound('explosion')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, score, isConnected, addEarnings])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let frame = 0

    const animate = () => {
      frame++
      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw quantum field effect
      for (let i = 0; i < 50; i++) {
        const x = (i * 20 + frame * 0.3) % canvas.width
        const y = Math.sin(x * 0.02 + frame * 0.02) * 20 + canvas.height / 2
        ctx.fillStyle = `rgba(139, 92, 246, ${0.1 + Math.sin(frame * 0.05 + i) * 0.05})`
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw target pattern at top
      const patternX = 20
      const patternY = 20
      ctx.fillStyle = '#fff'
      ctx.font = '12px monospace'
      ctx.fillText('Target Pattern:', patternX, patternY)

      currentLevel.targetPattern.forEach((bit, i) => {
        ctx.fillStyle = bit === 1 ? GREP_COLORS.cyan : GREP_COLORS.purple
        ctx.beginPath()
        ctx.arc(patternX + 110 + i * 25, patternY - 4, 8, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 10px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(bit.toString(), patternX + 110 + i * 25, patternY)
      })

      // Draw observed pattern below
      if (observedPattern.length > 0) {
        ctx.fillStyle = '#666'
        ctx.font = '12px monospace'
        ctx.textAlign = 'left'
        ctx.fillText('Your Pattern:', patternX, patternY + 25)

        observedPattern.forEach((bit, i) => {
          const matches = currentLevel.targetPattern[i] === bit
          ctx.fillStyle = matches ? GREP_COLORS.green : GREP_COLORS.red
          ctx.beginPath()
          ctx.arc(patternX + 110 + i * 25, patternY + 21, 8, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#fff'
          ctx.font = 'bold 10px monospace'
          ctx.textAlign = 'center'
          ctx.fillText(bit.toString(), patternX + 110 + i * 25, patternY + 25)
        })
      }

      // Draw particles
      particles.forEach(particle => {
        ctx.save()

        // Orbit motion for superposition
        if (particle.state === 'superposition') {
          particle.phase += 0.02
          particle.x += Math.sin(particle.phase) * 0.5
          particle.y += Math.cos(particle.phase * 1.3) * 0.3

          // Keep in bounds
          if (particle.x < 30) particle.x = 30
          if (particle.x > 370) particle.x = 370
          if (particle.y < 60) particle.y = 60
          if (particle.y > 300) particle.y = 300
        }

        const isHovered = hoveredParticle === particle.id
        const isSelected = selectedParticle === particle.id

        // Draw entanglement lines
        if (particle.entangledWith !== null) {
          const entangled = particles.find(p => p.id === particle.entangledWith)
          if (entangled) {
            ctx.strokeStyle = `rgba(236, 72, 153, ${0.3 + Math.sin(frame * 0.1) * 0.2})`
            ctx.lineWidth = 1
            ctx.setLineDash([5, 5])
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(entangled.x, entangled.y)
            ctx.stroke()
            ctx.setLineDash([])
          }
        }

        // Particle glow
        const glowRadius = particle.size * (isHovered ? 2 : 1.5)
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, glowRadius
        )

        if (particle.state === 'superposition') {
          // Superposition - flickering glow
          const flicker = Math.sin(frame * 0.1 + particle.id) * 0.3 + 0.5
          gradient.addColorStop(0, `rgba(139, 92, 246, ${flicker})`)
          gradient.addColorStop(0.5, `rgba(236, 72, 153, ${flicker * 0.5})`)
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
        } else {
          // Observed - solid glow
          const r = parseInt(particle.color.slice(1, 3), 16)
          const g = parseInt(particle.color.slice(3, 5), 16)
          const b = parseInt(particle.color.slice(5, 7), 16)
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.8)`)
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
        }

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, glowRadius, 0, Math.PI * 2)
        ctx.fill()

        // Core particle
        ctx.fillStyle = particle.state === 'superposition'
          ? `hsl(${(frame + particle.id * 50) % 360}, 70%, 60%)`
          : particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2)
        ctx.fill()

        // Particle symbol
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 12px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const symbol = particle.state === 'observed'
          ? particle.spin.toString()
          : PARTICLE_TYPES[particle.type].symbol
        ctx.fillText(symbol, particle.x, particle.y)

        // Highlight ring for hover/selected
        if (isHovered || isSelected) {
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size / 2 + 5, 0, Math.PI * 2)
          ctx.stroke()
        }

        // Superposition waves
        if (particle.state === 'superposition') {
          for (let w = 0; w < 3; w++) {
            const waveRadius = particle.size / 2 + 10 + w * 8 + Math.sin(frame * 0.1) * 3
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.3 - w * 0.1})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, waveRadius, 0, Math.PI * 2)
            ctx.stroke()
          }
        }

        ctx.restore()
      })

      // Draw effects
      setEffects(prev => {
        const updated = prev.filter(p => updateParticle(p))
        updated.forEach(p => drawParticle(ctx, p))
        return updated
      })

      // Instructions
      ctx.fillStyle = '#666'
      ctx.font = '11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('Click particles to observe. Match the target pattern!', canvas.width / 2, canvas.height - 15)

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationId)
  }, [particles, effects, currentLevel, observedPattern, hoveredParticle, selectedParticle])

  // Handle click on canvas
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicked on a particle
    for (const particle of particles) {
      const dx = x - particle.x
      const dy = y - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < particle.size) {
        if (particle.state === 'superposition') {
          observeParticle(particle.id)
        }
        return
      }
    }
  }, [gameState, particles, observeParticle])

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    let hovered: number | null = null
    for (const particle of particles) {
      const dx = x - particle.x
      const dy = y - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < particle.size) {
        hovered = particle.id
        break
      }
    }
    setHoveredParticle(hovered)
  }, [particles])

  // Check if all particles are observed
  useEffect(() => {
    if (gameState !== 'playing') return

    const allObserved = particles.every(p => p.state === 'observed')
    if (allObserved && particles.length > 0) {
      collapseAndCheck()
    }
  }, [particles, gameState, collapseAndCheck])

  return (
    <main className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="bg-dark-800/50 border-b border-dark-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/games"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Arcade
            </Link>
            <MultiplierIndicator />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Game title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl">⚛️</span>
            <h1 className="text-4xl font-display font-bold">
              Quantum <span className="text-gradient">Grep</span>
            </h1>
          </div>
          <p className="text-gray-400">Observe particles and collapse them into the right pattern</p>
        </div>

        {/* Game area */}
        <div className="bg-dark-800/50 rounded-3xl border border-dark-700 overflow-hidden">
          {/* Stats bar */}
          <div className="flex items-center justify-between p-4 border-b border-dark-700">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-grep-purple" />
                <span className="font-mono font-bold">{score}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-grep-pink" />
                <span className="text-gray-400">Level</span>
                <span className="font-bold">{level + 1}/{LEVELS.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-grep-cyan" />
                <span className="text-gray-400">Observations</span>
                <span className="font-bold">{observations}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {combo > 1 && (
                <span className="px-3 py-1 rounded-full bg-grep-orange/20 text-grep-orange font-bold text-sm animate-pulse">
                  {combo}x COMBO
                </span>
              )}
              <div className={`px-4 py-2 rounded-xl ${timeLeft <= 10 ? 'bg-red-500/20 text-red-400' : 'bg-dark-700'}`}>
                <Zap className={`w-4 h-4 inline mr-2 ${timeLeft <= 10 ? 'animate-pulse' : ''}`} />
                <span className="font-mono font-bold">{timeLeft}s</span>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="relative flex justify-center p-4 bg-[#0a0a1a]">
            <canvas
              ref={canvasRef}
              width={400}
              height={340}
              className="rounded-xl cursor-pointer"
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
            />

            {/* Menu overlay */}
            {gameState === 'menu' && (
              <div className="absolute inset-0 flex items-center justify-center bg-dark-900/90 backdrop-blur-sm">
                <div className="text-center space-y-6">
                  <div className="text-6xl mb-4">⚛️</div>
                  <h2 className="text-2xl font-display font-bold">Quantum Grep</h2>
                  <p className="text-gray-400 max-w-xs">
                    Click on particles to observe them. Match the target binary pattern before time runs out!
                  </p>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-grep-purple" /> = Superposition
                      </span>
                      <span className="mx-3">|</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-grep-cyan" /> = Observed (0 or 1)
                      </span>
                    </div>
                    <div className="text-sm text-grep-pink">
                      Entangled particles collapse together!
                    </div>
                  </div>
                  <button
                    onClick={startGame}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-grep-cyan to-grep-blue font-bold text-lg hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
                  >
                    <Play className="w-5 h-5" />
                    Start Observing
                  </button>
                </div>
              </div>
            )}

            {/* Game over overlay */}
            {gameState === 'gameOver' && (
              <div className="absolute inset-0 flex items-center justify-center bg-dark-900/90 backdrop-blur-sm">
                <div className="text-center space-y-6">
                  <div className="text-6xl">💥</div>
                  <h2 className="text-3xl font-display font-bold text-red-400">Decoherence!</h2>
                  <p className="text-gray-400">The wave function collapsed before you matched the pattern</p>
                  <div className="text-2xl font-bold">
                    Final Score: <span className="text-gradient">{score}</span>
                  </div>
                  <div className="text-gray-400">
                    Level Reached: {level + 1} - {currentLevel.name}
                  </div>
                  {isConnected && (
                    <div className="text-grep-green">
                      +{Math.floor(score / 20 * multiplier)} GREP earned!
                    </div>
                  )}
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={startGame}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-grep-cyan to-grep-blue font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Try Again
                    </button>
                    <Link
                      href="/games"
                      className="px-6 py-3 rounded-xl bg-dark-700 font-bold hover:bg-dark-600 transition-colors"
                    >
                      Back to Arcade
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Level complete overlay */}
            {gameState === 'levelComplete' && (
              <div className="absolute inset-0 flex items-center justify-center bg-dark-900/90 backdrop-blur-sm">
                <div className="text-center space-y-6">
                  <div className="text-6xl">🎉</div>
                  <h2 className="text-3xl font-display font-bold text-gradient">Quantum Master!</h2>
                  <p className="text-gray-400">You've completed all levels!</p>
                  <div className="text-3xl font-bold">
                    Final Score: <span className="text-gradient">{score}</span>
                  </div>
                  {isConnected && (
                    <div className="text-xl text-grep-green">
                      +{Math.floor(score / 10 * multiplier)} GREP earned!
                    </div>
                  )}
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={startGame}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-grep-cyan to-grep-blue font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Play Again
                    </button>
                    <Link
                      href="/games"
                      className="px-6 py-3 rounded-xl bg-dark-700 font-bold hover:bg-dark-600 transition-colors"
                    >
                      Back to Arcade
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 border-t border-dark-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                <span className="text-white font-semibold">{currentLevel.name}</span>
                <span className="mx-2">-</span>
                Match {currentLevel.particles} particles
              </div>
              {gameState === 'playing' && observations === 0 && (
                <div className="text-sm text-gray-400">
                  Wait for all particles to be observed...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* How to play */}
        <div className="mt-8 p-6 rounded-2xl bg-dark-800/30 border border-dark-700">
          <h3 className="font-semibold mb-4">How to Play</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-400">
            <div>
              <div className="text-grep-purple font-semibold mb-2">1. Observe</div>
              <p>Click on particles in superposition to observe them. They'll collapse to either 0 or 1.</p>
            </div>
            <div>
              <div className="text-grep-pink font-semibold mb-2">2. Entanglement</div>
              <p>Some particles are entangled (connected by lines). Observing one affects its partner!</p>
            </div>
            <div>
              <div className="text-grep-cyan font-semibold mb-2">3. Match Pattern</div>
              <p>Arrange observations to match the target pattern. Perfect matches give bonus points!</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
