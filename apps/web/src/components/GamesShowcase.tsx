'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Gamepad2, Coins, Users, Zap, Trophy, ArrowRight, Play } from 'lucide-react'

const games = [
  {
    id: 'grep-rails',
    name: 'Grep Rails',
    description: 'Match regex patterns to build railroad tracks',
    icon: '🚂',
    color: 'from-grep-purple to-grep-pink',
    rewards: '10-50 GREP',
    players: '2.4k',
    preview: 'regex',
  },
  {
    id: 'stack-panic',
    name: 'Stack Panic',
    description: 'Return functions in LIFO order before overflow',
    icon: '📚',
    color: 'from-grep-orange to-grep-yellow',
    rewards: '5-30 GREP',
    players: '3.1k',
    preview: 'stack',
  },
  {
    id: 'merge-miners',
    name: 'Merge Miners',
    description: 'Mine through Git branches and resolve conflicts',
    icon: '⛏️',
    color: 'from-grep-green to-grep-cyan',
    rewards: '5-40 GREP',
    players: '1.8k',
    preview: 'git',
  },
  {
    id: 'quantum-grep',
    name: 'Quantum Grep',
    description: 'Observe particles and collapse quantum patterns',
    icon: '⚛️',
    color: 'from-grep-cyan to-grep-blue',
    rewards: '10-60 GREP',
    players: '1.2k',
    preview: 'quantum',
  },
  {
    id: 'bug-hunter',
    name: 'Bug Hunter',
    description: 'Find and squash bugs in code snippets',
    icon: '🐛',
    color: 'from-grep-pink to-grep-purple',
    rewards: '8-45 GREP',
    players: '1.5k',
    preview: 'regex',
  },
  {
    id: 'regex-crossword',
    name: 'Regex Crossword',
    description: 'Solve pattern puzzles in crossword style',
    icon: '🧩',
    color: 'from-grep-yellow to-grep-orange',
    rewards: '12-55 GREP',
    players: '0.9k',
    preview: 'regex',
  },
  {
    id: 'syntax-sprint',
    name: 'Syntax Sprint',
    description: 'Race against time to fix syntax errors',
    icon: '⚡',
    color: 'from-grep-blue to-grep-cyan',
    rewards: '7-35 GREP',
    players: '1.1k',
    preview: 'stack',
  },
  {
    id: 'crypto-snake',
    name: 'Crypto Snake',
    description: 'Collect crypto coins in a blockchain twist',
    icon: '🐍',
    color: 'from-grep-green to-grep-blue',
    rewards: '5-25 GREP',
    players: '2.0k',
    preview: 'git',
  },
]

// Mini animated preview for each game
function GamePreview({ type }: { type: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let frame = 0

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      frame++

      if (type === 'regex') {
        // Train animation
        const trainX = (frame * 2) % (canvas.width + 40) - 20

        // Draw tracks
        ctx.strokeStyle = '#8B5CF6'
        ctx.lineWidth = 2
        for (let i = 0; i < canvas.width; i += 20) {
          ctx.beginPath()
          ctx.moveTo(i, canvas.height - 10)
          ctx.lineTo(i + 10, canvas.height - 10)
          ctx.stroke()
        }

        // Draw train
        ctx.fillStyle = '#EC4899'
        ctx.fillRect(trainX, canvas.height - 30, 30, 20)
        ctx.fillStyle = '#8B5CF6'
        ctx.beginPath()
        ctx.arc(trainX + 8, canvas.height - 8, 5, 0, Math.PI * 2)
        ctx.arc(trainX + 22, canvas.height - 8, 5, 0, Math.PI * 2)
        ctx.fill()

        // Smoke
        for (let i = 0; i < 3; i++) {
          const smokeX = trainX + 15 + Math.sin(frame * 0.1 + i) * 5
          const smokeY = canvas.height - 40 - i * 10 - (frame % 30)
          const opacity = 0.5 - i * 0.15
          ctx.beginPath()
          ctx.arc(smokeX, smokeY, 5 + i * 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(200, 200, 200, ${opacity})`
          ctx.fill()
        }
      } else if (type === 'stack') {
        // Stack blocks animation
        const blockCount = 4
        const blockHeight = 15
        const blockWidth = 50
        const startX = (canvas.width - blockWidth) / 2

        for (let i = 0; i < blockCount; i++) {
          const y = canvas.height - 10 - (i + 1) * (blockHeight + 3)
          const wobble = Math.sin(frame * 0.05 + i * 0.5) * (i * 0.5)
          const colors = ['#8B5CF6', '#10B981', '#F97316', '#EC4899']

          ctx.fillStyle = colors[i % colors.length]
          ctx.fillRect(startX + wobble, y, blockWidth, blockHeight)

          // Function name text
          ctx.fillStyle = 'white'
          ctx.font = '8px monospace'
          ctx.fillText('fn()', startX + wobble + 12, y + 11)
        }

        // Falling block
        const fallY = ((frame * 2) % 60)
        if (fallY < 40) {
          ctx.fillStyle = '#06B6D4'
          ctx.fillRect(startX, fallY, blockWidth, blockHeight)
          ctx.fillStyle = 'white'
          ctx.font = '8px monospace'
          ctx.fillText('new()', startX + 10, fallY + 11)
        }
      } else if (type === 'git') {
        // Mining grid animation
        const gridSize = 10
        const offsetX = 10
        const offsetY = 10

        for (let x = 0; x < 8; x++) {
          for (let y = 0; y < 5; y++) {
            const revealed = (x + y + Math.floor(frame / 20)) % 5 === 0
            ctx.fillStyle = revealed ? '#10B981' : '#374151'
            ctx.fillRect(offsetX + x * gridSize, offsetY + y * gridSize, gridSize - 1, gridSize - 1)

            if (revealed && (x + y) % 3 === 0) {
              // Gem sparkle
              ctx.fillStyle = '#F59E0B'
              ctx.beginPath()
              ctx.arc(offsetX + x * gridSize + 4, offsetY + y * gridSize + 4, 2, 0, Math.PI * 2)
              ctx.fill()
            }
          }
        }

        // Miner position
        const minerX = offsetX + (Math.floor(frame / 15) % 8) * gridSize + 4
        const minerY = offsetY + (Math.floor(frame / 30) % 5) * gridSize + 4
        ctx.fillStyle = '#8B5CF6'
        ctx.beginPath()
        ctx.arc(minerX, minerY, 4, 0, Math.PI * 2)
        ctx.fill()
      } else if (type === 'quantum') {
        // Quantum particles animation
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2

        // Draw orbiting particles in superposition
        for (let i = 0; i < 4; i++) {
          const angle = (frame * 0.02) + (i * Math.PI / 2)
          const radius = 20
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius

          // Superposition wave effect
          const hue = (frame * 2 + i * 90) % 360
          ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${0.6 + Math.sin(frame * 0.1 + i) * 0.3})`

          // Draw particle with glow
          ctx.shadowColor = `hsla(${hue}, 70%, 60%, 0.8)`
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.arc(x, y, 6, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0

          // Connecting lines for entanglement
          if (i % 2 === 0) {
            const partnerAngle = angle + Math.PI
            const px = centerX + Math.cos(partnerAngle) * radius
            const py = centerY + Math.sin(partnerAngle) * radius
            ctx.strokeStyle = `rgba(236, 72, 153, ${0.3 + Math.sin(frame * 0.1) * 0.2})`
            ctx.setLineDash([2, 2])
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(px, py)
            ctx.stroke()
            ctx.setLineDash([])
          }
        }

        // Central nucleus
        ctx.fillStyle = '#06B6D4'
        ctx.beginPath()
        ctx.arc(centerX, centerY, 4, 0, Math.PI * 2)
        ctx.fill()
      }

      animationId = requestAnimationFrame(animate)
    }

    // Clear canvas initially
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    animate()

    return () => cancelAnimationFrame(animationId)
  }, [type])

  return (
    <canvas
      ref={canvasRef}
      width={100}
      height={70}
      className="rounded-lg"
    />
  )
}

export default function GamesShowcase() {
  const [hoveredGame, setHoveredGame] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalPlayers: 7300,
    totalEarned: 1250000,
    gamesPlayed: 45600,
  })

  // Animate stats counting up
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        totalPlayers: prev.totalPlayers + Math.floor(Math.random() * 3),
        totalEarned: prev.totalEarned + Math.floor(Math.random() * 100),
        gamesPlayed: prev.gamesPlayed + Math.floor(Math.random() * 5),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800/50 to-dark-900" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-grep-purple/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-grep-pink/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-grep-orange/20 to-grep-yellow/20 border border-grep-orange/30 mb-6">
            <Gamepad2 className="w-4 h-4 text-grep-orange" />
            <span className="text-sm font-medium text-grep-orange">Play & Earn</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6">
            The GrepCoin <span className="text-gradient">Arcade</span>
          </h2>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Fun, challenging games that reward your skills with real GREP tokens.
            No luck - just skill.
          </p>
        </div>

        {/* Live stats bar */}
        <div className="flex flex-wrap justify-center gap-8 mb-12 p-6 rounded-2xl bg-dark-800/50 border border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-grep-purple/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-grep-purple" />
            </div>
            <div>
              <div className="text-2xl font-bold">{formatNumber(stats.totalPlayers)}</div>
              <div className="text-sm text-gray-400">Active Players</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-grep-green/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-grep-green" />
            </div>
            <div>
              <div className="text-2xl font-bold">{formatNumber(stats.totalEarned)} <span className="text-grep-green text-lg">GREP</span></div>
              <div className="text-sm text-gray-400">Total Earned</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-grep-orange/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-grep-orange" />
            </div>
            <div>
              <div className="text-2xl font-bold">{formatNumber(stats.gamesPlayed)}</div>
              <div className="text-sm text-gray-400">Games Played</div>
            </div>
          </div>
        </div>

        {/* Games grid - show first 8 games */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="group relative"
              onMouseEnter={() => setHoveredGame(game.id)}
              onMouseLeave={() => setHoveredGame(null)}
            >
              <div className={`relative overflow-hidden rounded-2xl bg-dark-800/50 border border-dark-700 hover:border-dark-500 transition-all duration-300 ${
                hoveredGame === game.id ? 'scale-105 shadow-2xl' : ''
              }`}>
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-5 group-hover:opacity-15 transition-opacity`} />

                <div className="relative p-6">
                  {/* Game icon and preview */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-3xl shadow-lg transform group-hover:scale-110 transition-transform`}>
                      {game.icon}
                    </div>
                    <div className="relative">
                      <GamePreview type={game.preview} />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Game info */}
                  <h3 className="text-xl font-display font-bold mb-2 group-hover:text-gradient transition-all">
                    {game.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {game.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-grep-yellow" />
                      <span className="text-grep-green font-semibold">{game.rewards}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{game.players} playing</span>
                    </div>
                  </div>
                </div>

                {/* Play button overlay on hover */}
                <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-dark-900 via-dark-900/90 to-transparent transform transition-transform duration-300 ${
                  hoveredGame === game.id ? 'translate-y-0' : 'translate-y-full'
                }`}>
                  <div className={`w-full py-3 rounded-xl bg-gradient-to-r ${game.color} text-center font-semibold flex items-center justify-center gap-2`}>
                    <Play className="w-4 h-4" />
                    Play Now
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-grep-purple to-grep-pink font-semibold text-lg hover:opacity-90 transition-opacity group"
          >
            <Gamepad2 className="w-5 h-5" />
            Visit Full Arcade
            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="mt-4 text-gray-400 text-sm">
            More games coming soon! Join the arcade and start earning GREP today.
          </p>
        </div>

        {/* Leaderboard teaser */}
        <div className="mt-16 p-8 rounded-2xl bg-dark-800/30 border border-dark-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-grep-yellow" />
              <h3 className="text-xl font-display font-bold">Top Earners Today</h3>
            </div>
            <Link href="/games" className="text-sm text-grep-purple hover:text-grep-pink transition-colors flex items-center gap-1">
              View Full Leaderboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { rank: 1, name: 'regex_master.eth', earned: '847 GREP', game: 'Grep Rails' },
              { rank: 2, name: '0xStack...42f1', earned: '623 GREP', game: 'Stack Panic' },
              { rank: 3, name: 'git_wizard.eth', earned: '512 GREP', game: 'Merge Miners' },
            ].map((player) => (
              <div key={player.rank} className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/50">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  player.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                  player.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                  'bg-orange-600/20 text-orange-400'
                }`}>
                  #{player.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{player.name}</div>
                  <div className="text-sm text-gray-400">{player.game}</div>
                </div>
                <div className="text-grep-green font-bold">{player.earned}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
