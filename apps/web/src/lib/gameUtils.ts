// Game utilities - sound, effects, helpers

// Web Audio context for sound effects
let audioContext: AudioContext | null = null

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

// Sound effect generator using Web Audio API
export function playSound(type: 'success' | 'error' | 'powerup' | 'coin' | 'explosion' | 'click' | 'whoosh' | 'levelup' | 'combo', volume = 0.3) {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    const now = ctx.currentTime

    switch (type) {
      case 'success':
        oscillator.frequency.setValueAtTime(523.25, now) // C5
        oscillator.frequency.setValueAtTime(659.25, now + 0.1) // E5
        oscillator.frequency.setValueAtTime(783.99, now + 0.2) // G5
        gainNode.gain.setValueAtTime(volume, now)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
        oscillator.start(now)
        oscillator.stop(now + 0.3)
        break

      case 'error':
        oscillator.frequency.setValueAtTime(200, now)
        oscillator.frequency.setValueAtTime(150, now + 0.1)
        oscillator.type = 'sawtooth'
        gainNode.gain.setValueAtTime(volume, now)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
        oscillator.start(now)
        oscillator.stop(now + 0.2)
        break

      case 'powerup':
        oscillator.frequency.setValueAtTime(400, now)
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.15)
        oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.3)
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(volume, now)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
        oscillator.start(now)
        oscillator.stop(now + 0.4)
        break

      case 'coin':
        oscillator.frequency.setValueAtTime(1200, now)
        oscillator.frequency.setValueAtTime(1600, now + 0.05)
        oscillator.type = 'square'
        gainNode.gain.setValueAtTime(volume * 0.5, now)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
        oscillator.start(now)
        oscillator.stop(now + 0.15)
        break

      case 'explosion':
        const noise = ctx.createBufferSource()
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < buffer.length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.1))
        }
        noise.buffer = buffer
        const noiseGain = ctx.createGain()
        noise.connect(noiseGain)
        noiseGain.connect(ctx.destination)
        noiseGain.gain.setValueAtTime(volume, now)
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
        noise.start(now)
        return // Early return for noise-based sound

      case 'click':
        oscillator.frequency.setValueAtTime(800, now)
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(volume * 0.3, now)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05)
        oscillator.start(now)
        oscillator.stop(now + 0.05)
        break

      case 'whoosh':
        oscillator.frequency.setValueAtTime(200, now)
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.2)
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(volume * 0.5, now)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
        oscillator.start(now)
        oscillator.stop(now + 0.2)
        break

      case 'levelup':
        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        const gain1 = ctx.createGain()
        osc1.connect(gain1)
        osc2.connect(gain1)
        gain1.connect(ctx.destination)
        osc1.frequency.setValueAtTime(523.25, now)
        osc1.frequency.setValueAtTime(659.25, now + 0.15)
        osc1.frequency.setValueAtTime(783.99, now + 0.3)
        osc1.frequency.setValueAtTime(1046.50, now + 0.45)
        osc2.frequency.setValueAtTime(783.99, now)
        osc2.frequency.setValueAtTime(987.77, now + 0.15)
        osc2.frequency.setValueAtTime(1174.66, now + 0.3)
        osc2.frequency.setValueAtTime(1567.98, now + 0.45)
        gain1.gain.setValueAtTime(volume * 0.5, now)
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.6)
        osc1.start(now)
        osc2.start(now)
        osc1.stop(now + 0.6)
        osc2.stop(now + 0.6)
        return

      case 'combo':
        oscillator.frequency.setValueAtTime(600, now)
        oscillator.frequency.setValueAtTime(800, now + 0.05)
        oscillator.frequency.setValueAtTime(1000, now + 0.1)
        oscillator.type = 'triangle'
        gainNode.gain.setValueAtTime(volume * 0.4, now)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
        oscillator.start(now)
        oscillator.stop(now + 0.15)
        break
    }
  } catch (e) {
    // Audio not supported or blocked
  }
}

// Screen shake effect
export interface ShakeState {
  intensity: number
  duration: number
  startTime: number
}

export function createShake(intensity: number, duration: number): ShakeState {
  return { intensity, duration, startTime: Date.now() }
}

export function getShakeOffset(shake: ShakeState | null): { x: number; y: number } {
  if (!shake) return { x: 0, y: 0 }

  const elapsed = Date.now() - shake.startTime
  if (elapsed > shake.duration) return { x: 0, y: 0 }

  const progress = 1 - (elapsed / shake.duration)
  const currentIntensity = shake.intensity * progress

  return {
    x: (Math.random() - 0.5) * currentIntensity * 2,
    y: (Math.random() - 0.5) * currentIntensity * 2,
  }
}

// Particle system
export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
  type: 'circle' | 'square' | 'star' | 'text'
  text?: string
  gravity?: number
  friction?: number
  glow?: boolean
}

export function createParticle(options: Partial<Particle> & { x: number; y: number }): Particle {
  return {
    vx: 0,
    vy: 0,
    life: 1,
    maxLife: 1,
    color: '#ffffff',
    size: 4,
    type: 'circle',
    gravity: 0.1,
    friction: 0.99,
    glow: false,
    ...options,
  }
}

export function createExplosion(x: number, y: number, count: number, colors: string[]): Particle[] {
  const particles: Particle[] = []
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
    const speed = 3 + Math.random() * 5
    particles.push(createParticle({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 3 + Math.random() * 4,
      glow: true,
    }))
  }
  return particles
}

export function createTextParticle(x: number, y: number, text: string, color: string): Particle {
  return createParticle({
    x,
    y,
    vy: -2,
    life: 1.5,
    maxLife: 1.5,
    color,
    type: 'text',
    text,
    gravity: 0,
    size: 20,
  })
}

export function updateParticle(p: Particle, dt: number = 1): boolean {
  p.x += p.vx * dt
  p.y += p.vy * dt
  p.vx *= p.friction || 0.99
  p.vy *= p.friction || 0.99
  p.vy += p.gravity || 0.1
  p.life -= 0.02 * dt
  return p.life > 0
}

export function drawParticle(ctx: CanvasRenderingContext2D, p: Particle, cameraX: number = 0) {
  const screenX = p.x - cameraX
  const alpha = p.life / p.maxLife

  ctx.save()
  ctx.globalAlpha = alpha

  if (p.glow) {
    ctx.shadowColor = p.color
    ctx.shadowBlur = 10
  }

  ctx.fillStyle = p.color

  switch (p.type) {
    case 'circle':
      ctx.beginPath()
      ctx.arc(screenX, p.y, p.size * alpha, 0, Math.PI * 2)
      ctx.fill()
      break

    case 'square':
      const size = p.size * alpha
      ctx.fillRect(screenX - size / 2, p.y - size / 2, size, size)
      break

    case 'star':
      drawStar(ctx, screenX, p.y, 5, p.size * alpha, p.size * alpha * 0.5)
      break

    case 'text':
      ctx.font = `bold ${p.size}px monospace`
      ctx.textAlign = 'center'
      ctx.fillText(p.text || '', screenX, p.y)
      break
  }

  ctx.restore()
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = Math.PI / 2 * 3
  let x = cx
  let y = cy
  const step = Math.PI / spikes

  ctx.beginPath()
  ctx.moveTo(cx, cy - outerRadius)

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius
    y = cy + Math.sin(rot) * outerRadius
    ctx.lineTo(x, y)
    rot += step

    x = cx + Math.cos(rot) * innerRadius
    y = cy + Math.sin(rot) * innerRadius
    ctx.lineTo(x, y)
    rot += step
  }

  ctx.lineTo(cx, cy - outerRadius)
  ctx.closePath()
  ctx.fill()
}

// Power-up types
export type PowerUpType = 'slowmo' | 'shield' | 'doublePoints' | 'extraLife' | 'hint' | 'freeze' | 'magnet' | 'nuke'

export interface PowerUp {
  type: PowerUpType
  x: number
  y: number
  collected: boolean
  duration?: number // For timed power-ups
}

export const POWER_UP_CONFIG: Record<PowerUpType, { color: string; icon: string; name: string; duration?: number }> = {
  slowmo: { color: '#06B6D4', icon: '⏱️', name: 'Slow Motion', duration: 5000 },
  shield: { color: '#8B5CF6', icon: '🛡️', name: 'Shield', duration: 10000 },
  doublePoints: { color: '#F59E0B', icon: '2️⃣', name: 'Double Points', duration: 8000 },
  extraLife: { color: '#EF4444', icon: '❤️', name: 'Extra Life' },
  hint: { color: '#10B981', icon: '💡', name: 'Hint' },
  freeze: { color: '#3B82F6', icon: '❄️', name: 'Freeze', duration: 3000 },
  magnet: { color: '#EC4899', icon: '🧲', name: 'Coin Magnet', duration: 6000 },
  nuke: { color: '#EF4444', icon: '💥', name: 'Nuke' },
}

// Achievement system
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  progress?: number
  target?: number
  grepReward: number
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_game', name: 'First Steps', description: 'Complete your first game', icon: '🎮', unlocked: false, grepReward: 10 },
  { id: 'streak_5', name: 'On Fire', description: 'Get a 5x combo streak', icon: '🔥', unlocked: false, grepReward: 25 },
  { id: 'streak_10', name: 'Unstoppable', description: 'Get a 10x combo streak', icon: '⚡', unlocked: false, grepReward: 50 },
  { id: 'score_1000', name: 'Getting Good', description: 'Score 1,000 points in a single game', icon: '📈', unlocked: false, grepReward: 20 },
  { id: 'score_5000', name: 'Pro Gamer', description: 'Score 5,000 points in a single game', icon: '🏆', unlocked: false, grepReward: 75 },
  { id: 'score_10000', name: 'Legend', description: 'Score 10,000 points in a single game', icon: '👑', unlocked: false, grepReward: 150 },
  { id: 'no_damage', name: 'Perfect Run', description: 'Complete a game without losing a life', icon: '💎', unlocked: false, grepReward: 100 },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Reach maximum speed in Grep Rails', icon: '🚀', unlocked: false, grepReward: 40 },
  { id: 'stack_master', name: 'Stack Master', description: 'Clear 50 functions in Stack Panic', icon: '📚', unlocked: false, grepReward: 60 },
  { id: 'daily_player', name: 'Dedicated', description: 'Play 7 days in a row', icon: '📅', unlocked: false, progress: 0, target: 7, grepReward: 200 },
  { id: 'grep_100', name: 'Pattern Master', description: 'Match 100 regex patterns', icon: '🔍', unlocked: false, progress: 0, target: 100, grepReward: 100 },
  { id: 'all_games', name: 'Arcade Champion', description: 'Play all available games', icon: '🎯', unlocked: false, progress: 0, target: 4, grepReward: 150 },
]

// Daily challenge system
export interface DailyChallenge {
  id: string
  game: string
  type: 'score' | 'streak' | 'survive' | 'collect' | 'speed'
  target: number
  description: string
  grepReward: number
  expiresAt: Date
  completed: boolean
}

export function generateDailyChallenge(game: string): DailyChallenge {
  const challenges = [
    { type: 'score' as const, targets: [500, 1000, 2000, 3000], descriptions: ['Score {target} points', 'Reach {target} points'] },
    { type: 'streak' as const, targets: [3, 5, 7, 10], descriptions: ['Get a {target}x combo', 'Achieve {target} streak'] },
    { type: 'survive' as const, targets: [60, 120, 180], descriptions: ['Survive for {target} seconds', 'Last {target} seconds'] },
  ]

  const challenge = challenges[Math.floor(Math.random() * challenges.length)]
  const target = challenge.targets[Math.floor(Math.random() * challenge.targets.length)]
  const description = challenge.descriptions[Math.floor(Math.random() * challenge.descriptions.length)].replace('{target}', target.toString())

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  return {
    id: `${game}-${Date.now()}`,
    game,
    type: challenge.type,
    target,
    description,
    grepReward: Math.floor(target * 0.5),
    expiresAt: tomorrow,
    completed: false,
  }
}

// Staking multiplier calculation
export function getStakingMultiplier(stakedAmount: number, stakingTier: string): number {
  const baseMultipliers: Record<string, number> = {
    'none': 1,
    'flexible': 1.1,
    'bronze': 1.25,
    'silver': 1.5,
    'gold': 1.75,
    'diamond': 2.0,
  }

  const tierMultiplier = baseMultipliers[stakingTier] || 1
  const amountBonus = Math.min(0.5, stakedAmount / 100000 * 0.1) // Up to 0.5x bonus for large stakes

  return tierMultiplier + amountBonus
}

// Format numbers for display
export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// Easing functions for animations
export const easing = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeOutElastic: (t: number) => {
    const p = 0.3
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1
  },
  easeOutBounce: (t: number) => {
    if (t < 1 / 2.75) return 7.5625 * t * t
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
  },
}

// Color utilities
export const GREP_COLORS = {
  purple: '#8B5CF6',
  pink: '#EC4899',
  orange: '#F97316',
  yellow: '#EAB308',
  green: '#10B981',
  cyan: '#06B6D4',
  blue: '#3B82F6',
  red: '#EF4444',
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Neon glow effect for canvas
export function drawNeonText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  fontSize: number = 24
) {
  ctx.save()
  ctx.font = `bold ${fontSize}px monospace`
  ctx.textAlign = 'center'

  // Glow layers
  ctx.shadowColor = color
  ctx.shadowBlur = 20
  ctx.fillStyle = color
  ctx.fillText(text, x, y)

  ctx.shadowBlur = 10
  ctx.fillText(text, x, y)

  // Core text
  ctx.shadowBlur = 0
  ctx.fillStyle = '#fff'
  ctx.fillText(text, x, y)

  ctx.restore()
}

// Draw glowing shape
export function drawGlowingRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  radius: number = 8
) {
  ctx.save()
  ctx.shadowColor = color
  ctx.shadowBlur = 15
  ctx.fillStyle = hexToRgba(color, 0.3)
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, radius)
  ctx.fill()

  ctx.shadowBlur = 5
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()
}
