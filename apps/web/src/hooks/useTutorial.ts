'use client'

import { useState, useEffect } from 'react'
import { getTutorial } from '@/lib/tutorials'

export function useTutorial(gameSlug: string) {
  const [showTutorial, setShowTutorial] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(`tutorial-${gameSlug}`)
    if (!seen) {
      setShowTutorial(true)
    } else {
      setCompleted(true)
    }
  }, [gameSlug])

  const steps = getTutorial(gameSlug)

  const completeTutorial = () => {
    localStorage.setItem(`tutorial-${gameSlug}`, 'true')
    setShowTutorial(false)
    setCompleted(true)
  }

  const resetTutorial = () => {
    localStorage.removeItem(`tutorial-${gameSlug}`)
    setShowTutorial(true)
    setCompleted(false)
  }

  return {
    showTutorial,
    completed,
    steps,
    completeTutorial,
    resetTutorial
  }
}
