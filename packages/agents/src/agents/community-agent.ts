import { z } from 'zod'
import { Agent } from '../core/agent'
import type { AgentConfig, AIProvider, Task, Tool } from '../core/types'

const SYSTEM_PROMPT = `You are GrepBot, the official community assistant for GrepCoin - an AI-built crypto arcade platform.

Your role is to:
1. Answer questions about GrepCoin, GREP tokens, staking, and the games
2. Help users troubleshoot issues
3. Welcome new members and guide them
4. Moderate conversations (flag inappropriate content)
5. Share updates and announcements
6. Foster a positive community atmosphere

Key facts about GrepCoin:
- 8 arcade games: Grep Rails, Stack Panic, Merge Miners, Quantum Grep, Bug Hunter, Crypto Snake, Syntax Sprint, RegEx Crossword
- GREP token on Base L2 (Coinbase's Ethereum layer 2)
- 5 staking tiers: Flexible (1.1x), Bronze (1.25x), Silver (1.5x), Gold (1.75x), Diamond (2x)
- Built through human-AI collaboration
- 100% open source (MIT license)
- Company: GrepLabs LLC (Delaware, USA)

Guidelines:
- Be friendly, helpful, and concise
- Never provide financial advice
- Direct complex issues to human moderators
- Use emojis sparingly but appropriately
- Always be honest about being an AI`

// Tools for the community agent
const tools: Tool[] = [
  {
    name: 'get_token_info',
    description: 'Get current GREP token information',
    parameters: z.object({}),
    execute: async () => ({
      name: 'GREP',
      network: 'Base L2',
      totalSupply: '100,000,000',
      stakingTiers: ['Flexible', 'Bronze', 'Silver', 'Gold', 'Diamond'],
      website: 'https://grepcoin.io'
    })
  },
  {
    name: 'get_game_info',
    description: 'Get information about a specific game',
    parameters: z.object({
      game: z.string().describe('The game name')
    }),
    execute: async ({ game }) => {
      const games: Record<string, any> = {
        'grep-rails': { name: 'Grep Rails', description: 'Build train tracks by matching regex patterns', difficulty: 'Medium' },
        'stack-panic': { name: 'Stack Panic', description: 'Clear function calls before they overflow', difficulty: 'Hard' },
        'merge-miners': { name: 'Merge Miners', description: 'Navigate Git branches and collect rewards', difficulty: 'Medium' },
        'quantum-grep': { name: 'Quantum Grep', description: 'Match quantum particle patterns', difficulty: 'Hard' },
        'bug-hunter': { name: 'Bug Hunter', description: 'Find and squash bugs in code', difficulty: 'Easy' },
        'crypto-snake': { name: 'Crypto Snake', description: 'Classic snake with blockchain vibes', difficulty: 'Easy' },
        'syntax-sprint': { name: 'Syntax Sprint', description: 'Build code from falling tokens', difficulty: 'Medium' },
        'regex-crossword': { name: 'RegEx Crossword', description: 'Solve crosswords with regex clues', difficulty: 'Hard' }
      }
      return games[game.toLowerCase().replace(' ', '-')] || { error: 'Game not found' }
    }
  },
  {
    name: 'get_staking_info',
    description: 'Get staking tier information',
    parameters: z.object({
      tier: z.string().optional().describe('Specific tier to get info for')
    }),
    execute: async ({ tier }) => {
      const tiers = {
        flexible: { minimum: '100 GREP', lock: 'None', multiplier: '1.1x', bonusPlays: '+2' },
        bronze: { minimum: '1,000 GREP', lock: '7 days', multiplier: '1.25x', bonusPlays: '+5' },
        silver: { minimum: '5,000 GREP', lock: '14 days', multiplier: '1.5x', bonusPlays: '+10' },
        gold: { minimum: '10,000 GREP', lock: '30 days', multiplier: '1.75x', bonusPlays: '+15' },
        diamond: { minimum: '50,000 GREP', lock: '90 days', multiplier: '2.0x', bonusPlays: '+25' }
      }
      if (tier) {
        return tiers[tier.toLowerCase() as keyof typeof tiers] || { error: 'Tier not found' }
      }
      return tiers
    }
  },
  {
    name: 'flag_message',
    description: 'Flag a message for human moderator review',
    parameters: z.object({
      reason: z.string().describe('Reason for flagging'),
      messageId: z.string().describe('ID of the message'),
      severity: z.enum(['low', 'medium', 'high']).describe('Severity level')
    }),
    execute: async ({ reason, messageId, severity }) => {
      // In production, this would send to a moderation queue
      console.log(`[FLAG] Message ${messageId} flagged: ${reason} (${severity})`)
      return { flagged: true, messageId, reason, severity }
    }
  }
]

export class CommunityAgent extends Agent {
  constructor(provider: AIProvider) {
    const config: AgentConfig = {
      name: 'CommunityAgent',
      description: 'Manages Discord community, answers questions, moderates',
      systemPrompt: SYSTEM_PROMPT,
      tools,
      temperature: 0.7,
      maxTokens: 500
    }
    super(config, provider)
  }

  protected async handleTask(task: Task): Promise<any> {
    switch (task.type) {
      case 'answer_question':
        return this.chat(task.data.question)

      case 'welcome_member':
        return this.chat(`Please welcome a new member named ${task.data.username} to the GrepCoin community. Give them a brief intro and point them to helpful resources.`)

      case 'moderate_message':
        return this.chat(`Review this message for moderation: "${task.data.content}". Is it appropriate? Should it be flagged?`)

      case 'generate_faq_response':
        return this.chat(`Generate a helpful FAQ response for: ${task.data.topic}`)

      default:
        throw new Error(`Unknown task type: ${task.type}`)
    }
  }

  protected async periodicCheck(): Promise<void> {
    // In production, this would check for:
    // - Unanswered questions in Discord
    // - New member welcomes needed
    // - Messages that need moderation
    console.log(`[${this.name}] Periodic check completed`)
  }

  // Quick methods for common tasks
  async answerQuestion(question: string): Promise<string> {
    return this.chat(question)
  }

  async welcomeMember(username: string): Promise<string> {
    return this.chat(`Welcome ${username} to the GrepCoin community! Give them a warm greeting and quick intro.`)
  }

  async moderateMessage(content: string): Promise<{ safe: boolean; reason?: string }> {
    const response = await this.chat(
      `Moderate this message. Reply with JSON: {"safe": true/false, "reason": "explanation if not safe"}\n\nMessage: "${content}"`
    )
    try {
      return JSON.parse(response)
    } catch {
      return { safe: true }
    }
  }
}
