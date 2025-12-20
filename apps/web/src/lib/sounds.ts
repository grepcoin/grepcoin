type SoundName = 'click' | 'success' | 'error' | 'achievement' | 'levelUp' | 'coin' | 'gameOver' | 'start'

class SoundManager {
  private sounds: Map<SoundName, HTMLAudioElement> = new Map()
  private enabled: boolean = true
  private volume: number = 0.5

  constructor() {
    if (typeof window !== 'undefined') {
      this.enabled = localStorage.getItem('sound-enabled') !== 'false'
      this.volume = parseFloat(localStorage.getItem('sound-volume') || '0.5')
    }
  }

  private getSound(name: SoundName): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null

    if (!this.sounds.has(name)) {
      const audio = new Audio(`/sounds/${name}.mp3`)
      audio.volume = this.volume
      this.sounds.set(name, audio)
    }
    return this.sounds.get(name) || null
  }

  play(name: SoundName) {
    if (!this.enabled) return

    const sound = this.getSound(name)
    if (sound) {
      sound.currentTime = 0
      sound.play().catch(() => {})
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
    localStorage.setItem('sound-enabled', String(enabled))
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
    localStorage.setItem('sound-volume', String(this.volume))
    this.sounds.forEach(sound => {
      sound.volume = this.volume
    })
  }

  isEnabled() {
    return this.enabled
  }

  getVolume() {
    return this.volume
  }
}

export const soundManager = new SoundManager()
