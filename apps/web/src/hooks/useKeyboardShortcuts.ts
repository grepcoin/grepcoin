'use client'

import { useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts(customShortcuts: Shortcut[] = []) {
  const router = useRouter()

  const defaultShortcuts: Shortcut[] = useMemo(() => [
    { key: 'g', description: 'Go to Games', action: () => router.push('/games') },
    { key: 'l', description: 'Go to Leaderboard', action: () => router.push('/leaderboard') },
    { key: 'p', description: 'Go to Profile', action: () => router.push('/profile') },
    { key: 's', description: 'Go to Settings', action: () => router.push('/settings') },
    { key: 'h', description: 'Go Home', action: () => router.push('/') },
    { key: '?', shift: true, description: 'Show shortcuts', action: () => {
      window.dispatchEvent(new CustomEvent('toggle-shortcuts-modal'))
    }},
  ], [router])

  const shortcuts = useMemo(() => [...defaultShortcuts, ...customShortcuts], [defaultShortcuts, customShortcuts])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if typing in input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }

    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey)
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
      const altMatch = shortcut.alt ? e.altKey : !e.altKey

      if (e.key.toLowerCase() === shortcut.key.toLowerCase() && ctrlMatch && shiftMatch && altMatch) {
        e.preventDefault()
        shortcut.action()
        break
      }
    }
  }, [shortcuts])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return shortcuts
}
