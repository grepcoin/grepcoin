import { z } from 'zod'
import { Agent } from '../core/agent'
import type { AgentConfig, AIProvider, Task, Tool } from '../core/types'

const SYSTEM_PROMPT = `You are the Social Media Manager for GrepCoin - an AI-built crypto arcade platform.

Your role is to:
1. Create engaging tweets about GrepCoin
2. Respond to mentions and comments
3. Generate content for campaigns
4. Track trending topics in crypto gaming
5. Maintain brand voice consistency

Brand Voice Guidelines:
- Friendly and approachable
- Technical but accessible
- Excited about AI + crypto + gaming
- Community-focused
- Honest about being AI-assisted
- Use emojis moderately (1-2 per tweet max)

Key hashtags:
#GrepCoin #PlayToEarn #CryptoGaming #Base #Web3Gaming #AIBuilt

Never:
- Promise financial returns
- Give investment advice
- Make price predictions
- Engage with trolls
- Share sensitive information

Tweet formats that work well:
- Announcements with clear CTAs
- Behind-the-scenes development
- Community highlights
- Educational threads
- Game tips and tricks
- Milestone celebrations`

const tools: Tool[] = [
  {
    name: 'generate_tweet',
    description: 'Generate a tweet for GrepCoin',
    parameters: z.object({
      topic: z.string().describe('Topic of the tweet'),
      style: z.enum(['announcement', 'casual', 'educational', 'hype', 'thread']).describe('Style of tweet'),
      includeLink: z.boolean().optional().describe('Whether to include a link')
    }),
    execute: async ({ topic, style, includeLink }) => {
      // This would be filled by the AI response
      return { topic, style, includeLink, generated: true }
    }
  },
  {
    name: 'generate_thread',
    description: 'Generate a Twitter thread',
    parameters: z.object({
      topic: z.string().describe('Topic of the thread'),
      tweetCount: z.number().min(2).max(10).describe('Number of tweets in thread')
    }),
    execute: async ({ topic, tweetCount }) => {
      return { topic, tweetCount, generated: true }
    }
  },
  {
    name: 'analyze_mention',
    description: 'Analyze a mention/reply and suggest response',
    parameters: z.object({
      content: z.string().describe('The mention content'),
      author: z.string().describe('Author username'),
      sentiment: z.enum(['positive', 'negative', 'neutral', 'question']).describe('Detected sentiment')
    }),
    execute: async ({ content, author, sentiment }) => {
      return { content, author, sentiment, analyzed: true }
    }
  },
  {
    name: 'schedule_content',
    description: 'Schedule content for posting',
    parameters: z.object({
      content: z.string().describe('Content to post'),
      platform: z.enum(['twitter', 'discord']).describe('Platform'),
      scheduledTime: z.string().describe('ISO timestamp for scheduling')
    }),
    execute: async ({ content, platform, scheduledTime }) => {
      console.log(`[SCHEDULE] ${platform}: "${content.slice(0, 50)}..." at ${scheduledTime}`)
      return { scheduled: true, platform, scheduledTime }
    }
  }
]

export class SocialAgent extends Agent {
  private contentCalendar: Array<{ content: string; scheduledFor: Date; platform: string }> = []

  constructor(provider: AIProvider) {
    const config: AgentConfig = {
      name: 'SocialAgent',
      description: 'Manages social media presence on Twitter/X',
      systemPrompt: SYSTEM_PROMPT,
      tools,
      temperature: 0.8,
      maxTokens: 800
    }
    super(config, provider)
  }

  protected async handleTask(task: Task): Promise<any> {
    switch (task.type) {
      case 'generate_tweet':
        return this.generateTweet(task.data.topic, task.data.style)

      case 'generate_thread':
        return this.generateThread(task.data.topic, task.data.tweetCount)

      case 'respond_to_mention':
        return this.respondToMention(task.data.content, task.data.author)

      case 'daily_content':
        return this.generateDailyContent()

      default:
        throw new Error(`Unknown task type: ${task.type}`)
    }
  }

  protected async periodicCheck(): Promise<void> {
    // Check if we need to generate daily content
    const now = new Date()
    const lastContent = this.recall('lastDailyContent')

    if (!lastContent || (now.getTime() - new Date(lastContent).getTime()) > 24 * 60 * 60 * 1000) {
      await this.generateDailyContent()
      this.remember('lastDailyContent', now.toISOString())
    }

    console.log(`[${this.name}] Periodic check completed`)
  }

  async generateTweet(topic: string, style: 'announcement' | 'casual' | 'educational' | 'hype' | 'thread' = 'casual'): Promise<string> {
    const prompt = `Generate a ${style} tweet about: ${topic}

Requirements:
- Max 280 characters
- Include 1-2 relevant hashtags
- Match the brand voice
- ${style === 'announcement' ? 'Include a clear CTA' : ''}

Return ONLY the tweet text, nothing else.`

    return this.chat(prompt)
  }

  async generateThread(topic: string, tweetCount: number = 5): Promise<string[]> {
    const prompt = `Generate a Twitter thread about: ${topic}

Requirements:
- Exactly ${tweetCount} tweets
- Each tweet max 280 characters
- First tweet should hook the reader
- Use thread numbering (1/, 2/, etc.)
- Last tweet should have a CTA
- Include relevant hashtags in the last tweet

Return each tweet on a new line, separated by ---`

    const response = await this.chat(prompt)
    return response.split('---').map(t => t.trim()).filter(t => t.length > 0)
  }

  async respondToMention(content: string, author: string): Promise<string> {
    const prompt = `Someone mentioned GrepCoin on Twitter:

Author: @${author}
Content: "${content}"

Generate an appropriate response. Be helpful, friendly, and on-brand.
If it's a question, answer it. If it's positive, thank them. If negative, address concerns professionally.

Return ONLY the response text (max 280 chars).`

    return this.chat(prompt)
  }

  async generateDailyContent(): Promise<{ tweets: string[]; thread?: string[] }> {
    // Generate 3 tweets for the day
    const topics = [
      'game tip or trick',
      'community highlight or milestone',
      'educational content about staking or tokens'
    ]

    const tweets: string[] = []
    for (const topic of topics) {
      const tweet = await this.generateTweet(topic, 'casual')
      tweets.push(tweet)
    }

    // Generate one thread per week
    const dayOfWeek = new Date().getDay()
    let thread: string[] | undefined

    if (dayOfWeek === 1) { // Monday
      thread = await this.generateThread('Weekly update on GrepCoin development and community', 5)
    }

    return { tweets, thread }
  }

  // Get content calendar
  getContentCalendar() {
    return [...this.contentCalendar]
  }

  // Add to content calendar
  scheduleContent(content: string, scheduledFor: Date, platform: string = 'twitter') {
    this.contentCalendar.push({ content, scheduledFor, platform })
    this.contentCalendar.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime())
  }
}
