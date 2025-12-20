'use client'

import { useState, useEffect } from 'react'
import { soundManager } from '@/lib/sounds'

export function SoundToggle() {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    setEnabled(soundManager.isEnabled())
  }, [])

  const toggle = () => {
    const newState = !enabled
    setEnabled(newState)
    soundManager.setEnabled(newState)
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
      title={enabled ? 'Mute sounds' : 'Enable sounds'}
    >
      {enabled ? '🔊' : '🔇'}
    </button>
  )
}
