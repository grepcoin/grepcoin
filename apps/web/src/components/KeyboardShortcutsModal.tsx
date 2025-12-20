'use client'

import { useState, useEffect } from 'react'

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  description: string
}

const defaultShortcuts: Shortcut[] = [
  { key: 'G', description: 'Go to Games' },
  { key: 'L', description: 'Go to Leaderboard' },
  { key: 'P', description: 'Go to Profile' },
  { key: 'S', description: 'Go to Settings' },
  { key: 'H', description: 'Go Home' },
  { key: '?', shift: true, description: 'Show this modal' },
]

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handler = () => setIsOpen(o => !o)
    window.addEventListener('toggle-shortcuts-modal', handler)
    return () => window.removeEventListener('toggle-shortcuts-modal', handler)
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setIsOpen(false)}>
      <div className="bg-gray-800 rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">✕</button>
        </div>

        <div className="space-y-3">
          {defaultShortcuts.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-gray-400">{shortcut.description}</span>
              <kbd className="px-2 py-1 bg-gray-700 rounded text-sm font-mono">
                {shortcut.shift && 'Shift + '}
                {shortcut.ctrl && 'Ctrl + '}
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        <p className="text-gray-500 text-sm mt-6 text-center">
          Press <kbd className="px-1 bg-gray-700 rounded">Esc</kbd> to close
        </p>
      </div>
    </div>
  )
}
