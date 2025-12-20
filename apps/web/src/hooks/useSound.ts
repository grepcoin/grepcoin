'use client'

import { useCallback } from 'react'
import { soundManager } from '@/lib/sounds'

type SoundName = 'click' | 'success' | 'error' | 'achievement' | 'levelUp' | 'coin' | 'gameOver' | 'start'

export function useSound() {
  const play = useCallback((name: SoundName) => {
    soundManager.play(name)
  }, [])

  const playClick = useCallback(() => play('click'), [play])
  const playSuccess = useCallback(() => play('success'), [play])
  const playError = useCallback(() => play('error'), [play])
  const playAchievement = useCallback(() => play('achievement'), [play])
  const playLevelUp = useCallback(() => play('levelUp'), [play])
  const playCoin = useCallback(() => play('coin'), [play])
  const playGameOver = useCallback(() => play('gameOver'), [play])
  const playStart = useCallback(() => play('start'), [play])

  return {
    play,
    playClick,
    playSuccess,
    playError,
    playAchievement,
    playLevelUp,
    playCoin,
    playGameOver,
    playStart,
    setEnabled: soundManager.setEnabled.bind(soundManager),
    setVolume: soundManager.setVolume.bind(soundManager),
    isEnabled: soundManager.isEnabled.bind(soundManager),
    getVolume: soundManager.getVolume.bind(soundManager),
  }
}
