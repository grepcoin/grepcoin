import { Client, TextChannel } from 'discord.js'
import { Activity, createActivityEmbed, createHighlightEmbed } from '../embeds'

// Highlight thresholds
const HIGH_SCORE_THRESHOLD = 10000
const HIGHLIGHT_KEYWORDS = ['legendary', 'epic', 'first', 'streak', 'milestone']

export class ActivityPoller {
  private client: Client
  private activityChannelId: string | undefined
  private highlightsChannelId: string | undefined
  private webAppUrl: string
  private pollInterval: number
  private lastActivityId: string | null = null
  private intervalId: NodeJS.Timeout | null = null

  constructor(
    client: Client,
    options: {
      activityChannelId?: string
      highlightsChannelId?: string
      webAppUrl?: string
      pollInterval?: number
    } = {}
  ) {
    this.client = client
    this.activityChannelId = options.activityChannelId
    this.highlightsChannelId = options.highlightsChannelId
    this.webAppUrl = options.webAppUrl || 'http://localhost:3000'
    this.pollInterval = options.pollInterval || 30000 // 30 seconds
  }

  /**
   * Start polling for new activities
   */
  async start(): Promise<void> {
    if (!this.activityChannelId && !this.highlightsChannelId) {
      console.log('[ActivityPoller] No channel IDs configured, skipping activity polling')
      return
    }

    console.log(`[ActivityPoller] Starting activity polling (interval: ${this.pollInterval}ms)`)

    // Initial poll to set lastActivityId without posting
    await this.initializeLastActivity()

    // Start periodic polling
    this.intervalId = setInterval(() => this.poll(), this.pollInterval)
  }

  /**
   * Stop polling
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('[ActivityPoller] Stopped activity polling')
    }
  }

  /**
   * Initialize by fetching the latest activity ID without posting
   */
  private async initializeLastActivity(): Promise<void> {
    try {
      const activities = await this.fetchActivities(1)
      if (activities.length > 0) {
        this.lastActivityId = activities[0].id
        console.log(`[ActivityPoller] Initialized with last activity: ${this.lastActivityId}`)
      }
    } catch (error) {
      console.error('[ActivityPoller] Failed to initialize:', error)
    }
  }

  /**
   * Poll for new activities and post them to Discord
   */
  private async poll(): Promise<void> {
    try {
      const activities = await this.fetchActivities(20)

      // Filter to only new activities
      const newActivities = this.filterNewActivities(activities)

      if (newActivities.length === 0) {
        return
      }

      console.log(`[ActivityPoller] Found ${newActivities.length} new activities`)

      // Process activities in chronological order (oldest first)
      for (const activity of newActivities.reverse()) {
        await this.processActivity(activity)
      }

      // Update last activity ID
      this.lastActivityId = activities[0].id
    } catch (error) {
      console.error('[ActivityPoller] Poll error:', error)
    }
  }

  /**
   * Fetch activities from the web app API
   */
  private async fetchActivities(limit: number): Promise<Activity[]> {
    const response = await fetch(`${this.webAppUrl}/api/activity?limit=${limit}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch activities: ${response.statusText}`)
    }

    const data = await response.json()
    return data.activities || []
  }

  /**
   * Filter activities to only include new ones
   */
  private filterNewActivities(activities: Activity[]): Activity[] {
    if (!this.lastActivityId) {
      return activities
    }

    const lastIndex = activities.findIndex(a => a.id === this.lastActivityId)

    if (lastIndex === -1) {
      // Last activity not found, return all (might have been a lot of activity)
      return activities
    }

    // Return activities before the last known one
    return activities.slice(0, lastIndex)
  }

  /**
   * Process and post a single activity
   */
  private async processActivity(activity: Activity): Promise<void> {
    // Check if this is a highlight
    const highlightReason = this.getHighlightReason(activity)

    // Post to highlights channel if it's a highlight
    if (highlightReason && this.highlightsChannelId) {
      await this.postToChannel(
        this.highlightsChannelId,
        createHighlightEmbed(activity, highlightReason)
      )
    }

    // Post to activity channel
    if (this.activityChannelId) {
      await this.postToChannel(
        this.activityChannelId,
        createActivityEmbed(activity)
      )
    }
  }

  /**
   * Check if an activity qualifies as a highlight
   * Returns the reason if it's a highlight, null otherwise
   */
  private getHighlightReason(activity: Activity): string | null {
    // High score
    if (activity.type === 'score' && activity.value && activity.value >= HIGH_SCORE_THRESHOLD) {
      return `🔥 HIGH SCORE ALERT! ${activity.value.toLocaleString()} points!`
    }

    // Check message for highlight keywords
    const messageLower = activity.message.toLowerCase()

    if (messageLower.includes('legendary')) {
      return '⭐ LEGENDARY Achievement!'
    }

    if (messageLower.includes('epic')) {
      return '💫 EPIC Achievement!'
    }

    if (messageLower.includes('first') && activity.type === 'achievement') {
      return '🎉 First-time Achievement!'
    }

    if (messageLower.includes('day 7') || messageLower.includes('streak')) {
      return '🔥 Streak Milestone!'
    }

    if (messageLower.includes('milestone')) {
      return '🏅 Milestone Reached!'
    }

    return null
  }

  /**
   * Post an embed to a Discord channel
   */
  private async postToChannel(channelId: string, embed: any): Promise<void> {
    try {
      const channel = await this.client.channels.fetch(channelId)

      if (!channel || !(channel instanceof TextChannel)) {
        console.error(`[ActivityPoller] Channel ${channelId} not found or not a text channel`)
        return
      }

      await channel.send({ embeds: [embed] })
    } catch (error) {
      console.error(`[ActivityPoller] Failed to post to channel ${channelId}:`, error)
    }
  }
}
