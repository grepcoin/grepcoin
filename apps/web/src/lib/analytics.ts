type EventName =
  | 'page_view'
  | 'game_start'
  | 'game_complete'
  | 'score_submit'
  | 'achievement_unlock'
  | 'wallet_connect'
  | 'wallet_disconnect'
  | 'share_click'
  | 'referral_click'
  | 'battle_pass_claim'
  | 'tournament_join'

interface EventProperties {
  [key: string]: string | number | boolean | undefined
}

class Analytics {
  private queue: Array<{ name: EventName; properties: EventProperties; timestamp: number }> = []
  private userId: string | null = null

  setUserId(userId: string | null) {
    this.userId = userId
  }

  track(name: EventName, properties: EventProperties = {}) {
    const event = {
      name,
      properties: {
        ...properties,
        userId: this.userId,
        url: typeof window !== 'undefined' ? window.location.href : '',
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    }

    this.queue.push(event)

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics:', name, properties)
    }

    // Send to server (batched)
    this.flush()
  }

  private async flush() {
    if (this.queue.length === 0) return

    const events = [...this.queue]
    this.queue = []

    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      })
    } catch {
      // Re-queue on failure
      this.queue.unshift(...events)
    }
  }

  // Convenience methods
  pageView(page: string) {
    this.track('page_view', { page })
  }

  gameStart(gameSlug: string) {
    this.track('game_start', { gameSlug })
  }

  gameComplete(gameSlug: string, score: number, duration: number) {
    this.track('game_complete', { gameSlug, score, duration })
  }

  scoreSubmit(gameSlug: string, score: number, grepEarned: number) {
    this.track('score_submit', { gameSlug, score, grepEarned })
  }

  achievementUnlock(achievementId: string, achievementName: string) {
    this.track('achievement_unlock', { achievementId, achievementName })
  }

  walletConnect(address: string) {
    this.track('wallet_connect', { address })
  }

  shareClick(platform: string, contentType: string) {
    this.track('share_click', { platform, contentType })
  }
}

export const analytics = new Analytics()
