'use client'

import { useEffect, useRef } from 'react'

interface Coin {
  x: number
  y: number
  size: number
  speed: number
  rotation: number
  rotationSpeed: number
  opacity: number
  type: 'gold' | 'purple' | 'pink'
}

export default function CoinRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Create coins
    const coins: Coin[] = []
    const coinCount = Math.floor(window.innerWidth / 50)

    for (let i = 0; i < coinCount; i++) {
      coins.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: 8 + Math.random() * 12,
        speed: 0.5 + Math.random() * 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: 0.01 + Math.random() * 0.03,
        opacity: 0.1 + Math.random() * 0.2,
        type: ['gold', 'purple', 'pink'][Math.floor(Math.random() * 3)] as Coin['type'],
      })
    }

    const colors = {
      gold: { main: '#EAB308', shadow: '#CA8A04' },
      purple: { main: '#8B5CF6', shadow: '#7C3AED' },
      pink: { main: '#EC4899', shadow: '#DB2777' },
    }

    const drawCoin = (coin: Coin) => {
      ctx.save()
      ctx.translate(coin.x, coin.y)
      ctx.rotate(coin.rotation)
      ctx.globalAlpha = coin.opacity

      const { main, shadow } = colors[coin.type]

      // Coin body (ellipse to simulate 3D rotation)
      const stretch = Math.abs(Math.sin(coin.rotation * 2))
      const width = coin.size * (0.3 + stretch * 0.7)

      // Shadow
      ctx.beginPath()
      ctx.ellipse(2, 2, width, coin.size, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fill()

      // Main coin
      const gradient = ctx.createLinearGradient(-width, -coin.size, width, coin.size)
      gradient.addColorStop(0, main)
      gradient.addColorStop(0.5, shadow)
      gradient.addColorStop(1, main)

      ctx.beginPath()
      ctx.ellipse(0, 0, width, coin.size, 0, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Shine
      ctx.beginPath()
      ctx.ellipse(-width * 0.3, -coin.size * 0.3, width * 0.2, coin.size * 0.3, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.fill()

      // G symbol
      if (stretch > 0.5) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.font = `bold ${coin.size * 0.8}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('G', 0, 0)
      }

      ctx.restore()
    }

    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      coins.forEach(coin => {
        // Update
        coin.y += coin.speed
        coin.rotation += coin.rotationSpeed
        coin.x += Math.sin(coin.y * 0.01) * 0.3 // Gentle sway

        // Reset when off screen
        if (coin.y > canvas.height + coin.size) {
          coin.y = -coin.size * 2
          coin.x = Math.random() * canvas.width
        }

        // Draw
        drawCoin(coin)
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  )
}
