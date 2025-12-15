import { z } from 'zod'
import { Agent } from '../core/agent'
import type { AgentConfig, AIProvider, Task, Tool } from '../core/types'

const SYSTEM_PROMPT = `You are the Analytics Agent for GrepCoin - responsible for tracking metrics and generating insights.

Your role is to:
1. Track key performance indicators (KPIs)
2. Generate daily/weekly reports
3. Identify trends and patterns
4. Provide actionable insights
5. Monitor community growth

Key Metrics to Track:
- Website: visitors, page views, bounce rate, time on site
- Games: plays, scores, average session length, retention
- Token: holders, transfers, price (if listed), volume
- Staking: TVL, staker count, tier distribution
- Community: Discord members, Twitter followers, GitHub stars
- Fundraising: backers, amount raised, conversion rate

Report Types:
- Daily Summary: Quick overview of key metrics
- Weekly Deep Dive: Trends, insights, recommendations
- Monthly Review: Comprehensive analysis, goal tracking
- Ad-hoc Analysis: Specific questions or investigations`

const tools: Tool[] = [
  {
    name: 'get_website_metrics',
    description: 'Get website analytics data',
    parameters: z.object({
      period: z.enum(['today', '7d', '30d', '90d']).default('7d')
    }),
    execute: async ({ period }) => ({
      period,
      visitors: Math.floor(Math.random() * 10000) + 1000,
      pageViews: Math.floor(Math.random() * 50000) + 5000,
      bounceRate: (Math.random() * 30 + 30).toFixed(1) + '%',
      avgSessionDuration: Math.floor(Math.random() * 180) + 60 + 's',
      topPages: ['/games', '/', '/fundraise', '/games/grep-rails', '/games/stack-panic']
    })
  },
  {
    name: 'get_game_metrics',
    description: 'Get game-specific metrics',
    parameters: z.object({
      game: z.string().optional(),
      period: z.enum(['today', '7d', '30d']).default('7d')
    }),
    execute: async ({ game, period }) => ({
      period,
      game: game || 'all',
      totalPlays: Math.floor(Math.random() * 5000) + 500,
      uniquePlayers: Math.floor(Math.random() * 1000) + 100,
      avgScore: Math.floor(Math.random() * 5000) + 1000,
      avgSessionLength: Math.floor(Math.random() * 300) + 60 + 's',
      retention: {
        day1: '45%',
        day7: '25%',
        day30: '15%'
      }
    })
  },
  {
    name: 'get_community_metrics',
    description: 'Get community growth metrics',
    parameters: z.object({
      platform: z.enum(['discord', 'twitter', 'github', 'all']).default('all')
    }),
    execute: async ({ platform }) => ({
      platform,
      discord: { members: 1250, activeDaily: 180, messagesPerDay: 450 },
      twitter: { followers: 3200, engagementRate: '4.5%', impressions: 85000 },
      github: { stars: 127, forks: 23, contributors: 8 }
    })
  },
  {
    name: 'get_fundraising_metrics',
    description: 'Get fundraising campaign metrics',
    parameters: z.object({}),
    execute: async () => ({
      totalRaised: 12500,
      goal: 35000,
      backers: 87,
      avgContribution: 143.68,
      conversionRate: '2.3%',
      daysRemaining: 18,
      projectedTotal: 28000
    })
  },
  {
    name: 'compare_periods',
    description: 'Compare metrics between two periods',
    parameters: z.object({
      metric: z.string(),
      period1: z.string(),
      period2: z.string()
    }),
    execute: async ({ metric, period1, period2 }) => ({
      metric,
      period1: { period: period1, value: Math.floor(Math.random() * 1000) },
      period2: { period: period2, value: Math.floor(Math.random() * 1000) },
      change: (Math.random() * 40 - 20).toFixed(1) + '%'
    })
  },
  {
    name: 'generate_chart_data',
    description: 'Generate data for charts/visualizations',
    parameters: z.object({
      metric: z.string(),
      chartType: z.enum(['line', 'bar', 'pie']),
      dataPoints: z.number().default(7)
    }),
    execute: async ({ metric, chartType, dataPoints }) => ({
      metric,
      chartType,
      data: Array.from({ length: dataPoints }, (_, i) => ({
        label: `Day ${i + 1}`,
        value: Math.floor(Math.random() * 1000) + 100
      }))
    })
  }
]

interface Report {
  type: string
  generatedAt: Date
  content: string
  metrics: any
}

export class AnalyticsAgent extends Agent {
  private reports: Report[] = []

  constructor(provider: AIProvider) {
    const config: AgentConfig = {
      name: 'AnalyticsAgent',
      description: 'Tracks metrics and generates insights',
      systemPrompt: SYSTEM_PROMPT,
      tools,
      temperature: 0.5,
      maxTokens: 1500
    }
    super(config, provider)
  }

  protected async handleTask(task: Task): Promise<any> {
    switch (task.type) {
      case 'daily_report':
        return this.generateDailyReport()

      case 'weekly_report':
        return this.generateWeeklyReport()

      case 'analyze_metric':
        return this.analyzeMetric(task.data.metric)

      case 'compare_performance':
        return this.comparePerformance(task.data.period1, task.data.period2)

      case 'answer_question':
        return this.chat(task.data.question)

      default:
        throw new Error(`Unknown task type: ${task.type}`)
    }
  }

  protected async periodicCheck(): Promise<void> {
    // Generate daily report at midnight
    const now = new Date()
    const lastDaily = this.recall('lastDailyReport')

    if (!lastDaily || this.isDifferentDay(new Date(lastDaily), now)) {
      await this.generateDailyReport()
      this.remember('lastDailyReport', now.toISOString())
    }

    // Generate weekly report on Mondays
    if (now.getDay() === 1) {
      const lastWeekly = this.recall('lastWeeklyReport')
      if (!lastWeekly || this.isDifferentWeek(new Date(lastWeekly), now)) {
        await this.generateWeeklyReport()
        this.remember('lastWeeklyReport', now.toISOString())
      }
    }

    console.log(`[${this.name}] Periodic check completed`)
  }

  async generateDailyReport(): Promise<string> {
    const prompt = `Generate a daily analytics report for GrepCoin.

Use the available tools to gather:
1. Website metrics for today
2. Game metrics for today
3. Community metrics
4. Fundraising status

Format the report with:
- Executive summary (2-3 sentences)
- Key metrics table
- Notable changes from yesterday
- Top performing content/games
- Recommendations for tomorrow

Keep it concise and actionable.`

    const report = await this.chat(prompt)

    this.reports.push({
      type: 'daily',
      generatedAt: new Date(),
      content: report,
      metrics: {}
    })

    return report
  }

  async generateWeeklyReport(): Promise<string> {
    const prompt = `Generate a comprehensive weekly analytics report for GrepCoin.

Use the available tools to gather data for the past 7 days:
1. Website traffic trends
2. Game engagement trends
3. Community growth
4. Fundraising progress
5. Compare to previous week

Format the report with:
- Executive summary
- Week-over-week comparisons
- Trend analysis
- Top performers
- Areas needing attention
- Strategic recommendations

Be thorough but organized.`

    const report = await this.chat(prompt)

    this.reports.push({
      type: 'weekly',
      generatedAt: new Date(),
      content: report,
      metrics: {}
    })

    return report
  }

  async analyzeMetric(metric: string): Promise<string> {
    const prompt = `Analyze the "${metric}" metric for GrepCoin.

Provide:
1. Current value and trend
2. Historical context
3. Benchmarks (if applicable)
4. Factors affecting this metric
5. Recommendations for improvement`

    return this.chat(prompt)
  }

  async comparePerformance(period1: string, period2: string): Promise<string> {
    const prompt = `Compare GrepCoin's performance between ${period1} and ${period2}.

Use available tools to compare:
1. Website metrics
2. Game engagement
3. Community growth
4. Fundraising (if applicable)

Highlight:
- Biggest improvements
- Areas of decline
- What changed between periods
- Lessons learned`

    return this.chat(prompt)
  }

  async askQuestion(question: string): Promise<string> {
    const prompt = `Answer this analytics question about GrepCoin: ${question}

Use available tools to gather relevant data and provide a data-driven answer.`

    return this.chat(prompt)
  }

  // Get recent reports
  getReports(type?: string): Report[] {
    if (type) {
      return this.reports.filter(r => r.type === type)
    }
    return [...this.reports]
  }

  private isDifferentDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() !== date2.toDateString()
  }

  private isDifferentWeek(date1: Date, date2: Date): boolean {
    const week1 = this.getWeekNumber(date1)
    const week2 = this.getWeekNumber(date2)
    return week1 !== week2
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }
}
