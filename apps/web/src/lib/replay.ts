export interface ReplayFrame {
  timestamp: number
  action: string
  data: Record<string, unknown>
}

export interface GameReplay {
  id: string
  gameSlug: string
  userId: string
  score: number
  frames: ReplayFrame[]
  duration: number
  createdAt: Date
}

export class ReplayRecorder {
  private frames: ReplayFrame[] = []
  private startTime: number = 0
  private isRecording: boolean = false

  start() {
    this.frames = []
    this.startTime = Date.now()
    this.isRecording = true
  }

  record(action: string, data: Record<string, unknown> = {}) {
    if (!this.isRecording) return

    this.frames.push({
      timestamp: Date.now() - this.startTime,
      action,
      data,
    })
  }

  stop(): ReplayFrame[] {
    this.isRecording = false
    return this.frames
  }

  getDuration(): number {
    return Date.now() - this.startTime
  }

  getFrames(): ReplayFrame[] {
    return [...this.frames]
  }
}

export class ReplayPlayer {
  private frames: ReplayFrame[] = []
  private currentIndex: number = 0
  private isPlaying: boolean = false
  private startTime: number = 0
  private playbackSpeed: number = 1
  private onFrame: ((frame: ReplayFrame) => void) | null = null
  private animationId: number | null = null

  load(frames: ReplayFrame[]) {
    this.frames = frames
    this.currentIndex = 0
  }

  play(onFrame: (frame: ReplayFrame) => void) {
    this.onFrame = onFrame
    this.isPlaying = true
    this.startTime = Date.now()
    this.tick()
  }

  private tick = () => {
    if (!this.isPlaying) return

    const elapsed = (Date.now() - this.startTime) * this.playbackSpeed

    while (
      this.currentIndex < this.frames.length &&
      this.frames[this.currentIndex].timestamp <= elapsed
    ) {
      if (this.onFrame) {
        this.onFrame(this.frames[this.currentIndex])
      }
      this.currentIndex++
    }

    if (this.currentIndex < this.frames.length) {
      this.animationId = requestAnimationFrame(this.tick)
    } else {
      this.isPlaying = false
    }
  }

  pause() {
    this.isPlaying = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
  }

  setSpeed(speed: number) {
    this.playbackSpeed = speed
  }

  getProgress(): number {
    if (this.frames.length === 0) return 0
    return this.currentIndex / this.frames.length
  }
}
