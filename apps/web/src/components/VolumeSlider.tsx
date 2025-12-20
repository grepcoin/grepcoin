'use client'

import { useState, useEffect } from 'react'
import { soundManager } from '@/lib/sounds'

export function VolumeSlider() {
  const [volume, setVolume] = useState(0.5)

  useEffect(() => {
    setVolume(soundManager.getVolume())
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    soundManager.setVolume(newVolume)
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400">🔈</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={handleChange}
        className="w-24 accent-emerald-500"
      />
      <span className="text-gray-400">🔊</span>
    </div>
  )
}
