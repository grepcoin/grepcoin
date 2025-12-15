import { z } from 'zod'
import { createPublicClient, http, formatEther, parseAbi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { Agent } from '../core/agent'
import type { AgentConfig, AIProvider, Task, Tool } from '../core/types'

const SYSTEM_PROMPT = `You are the Guardian Agent for GrepCoin - responsible for monitoring smart contract health and security.

Your role is to:
1. Monitor smart contract activity
2. Detect unusual patterns or potential exploits
3. Track token metrics (supply, transfers, staking)
4. Alert on critical issues
5. Generate security reports

You have access to blockchain data through tools. Analyze patterns and report anomalies.

Alert Thresholds:
- Large transfers: > 100,000 GREP in single tx
- Unusual staking: > 10 stakes in 1 minute from same address
- Contract interactions: Failed txs > 10% of total
- TVL changes: > 20% change in 1 hour

When you detect issues, categorize severity:
- CRITICAL: Potential exploit, immediate action needed
- HIGH: Unusual activity, investigation needed
- MEDIUM: Notable pattern, monitoring needed
- LOW: Minor anomaly, log for review`

// Contract ABIs (simplified)
const TOKEN_ABI = parseAbi([
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)'
])

const STAKING_ABI = parseAbi([
  'function totalStaked() view returns (uint256)',
  'function stakersCount() view returns (uint256)',
  'event Staked(address indexed user, uint256 amount, uint8 tier)',
  'event Unstaked(address indexed user, uint256 amount)'
])

const tools: Tool[] = [
  {
    name: 'get_token_metrics',
    description: 'Get current token metrics from the blockchain',
    parameters: z.object({
      network: z.enum(['mainnet', 'testnet']).default('testnet')
    }),
    execute: async ({ network }) => {
      // In production, this would read from actual contracts
      return {
        totalSupply: '100000000',
        circulatingSupply: '15000000',
        holders: 1250,
        transfers24h: 487,
        network
      }
    }
  },
  {
    name: 'get_staking_metrics',
    description: 'Get current staking pool metrics',
    parameters: z.object({
      network: z.enum(['mainnet', 'testnet']).default('testnet')
    }),
    execute: async ({ network }) => {
      return {
        totalStaked: '8500000',
        stakersCount: 342,
        tvl: '$85,000',
        averageStake: '24854',
        tierDistribution: {
          flexible: 45,
          bronze: 30,
          silver: 15,
          gold: 7,
          diamond: 3
        },
        network
      }
    }
  },
  {
    name: 'get_recent_transactions',
    description: 'Get recent contract transactions',
    parameters: z.object({
      contract: z.enum(['token', 'staking']),
      limit: z.number().default(10)
    }),
    execute: async ({ contract, limit }) => {
      // In production, this would fetch from blockchain/indexer
      return {
        contract,
        transactions: [
          { type: 'stake', amount: '5000', user: '0x123...', timestamp: Date.now() - 60000 },
          { type: 'transfer', amount: '1000', from: '0x456...', to: '0x789...', timestamp: Date.now() - 120000 }
        ].slice(0, limit)
      }
    }
  },
  {
    name: 'check_anomalies',
    description: 'Check for anomalies in recent activity',
    parameters: z.object({
      timeframe: z.enum(['1h', '24h', '7d']).default('24h')
    }),
    execute: async ({ timeframe }) => {
      // In production, this would analyze patterns
      return {
        timeframe,
        anomalies: [],
        largeTransfers: 0,
        failedTxs: 2,
        unusualPatterns: false
      }
    }
  },
  {
    name: 'send_alert',
    description: 'Send an alert to the team',
    parameters: z.object({
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      title: z.string(),
      description: z.string(),
      data: z.any().optional()
    }),
    execute: async ({ severity, title, description, data }) => {
      console.log(`[ALERT:${severity.toUpperCase()}] ${title}: ${description}`)
      // In production, this would send to Discord/Telegram/PagerDuty
      return { sent: true, severity, title }
    }
  },
  {
    name: 'generate_report',
    description: 'Generate a security/health report',
    parameters: z.object({
      type: z.enum(['daily', 'weekly', 'incident']),
      includeMetrics: z.boolean().default(true)
    }),
    execute: async ({ type, includeMetrics }) => {
      return { type, includeMetrics, generated: true, timestamp: new Date().toISOString() }
    }
  }
]

interface Alert {
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  timestamp: Date
  resolved: boolean
}

export class GuardianAgent extends Agent {
  private alerts: Alert[] = []
  private lastMetrics: any = null

  constructor(provider: AIProvider) {
    const config: AgentConfig = {
      name: 'GuardianAgent',
      description: 'Monitors smart contracts and security',
      systemPrompt: SYSTEM_PROMPT,
      tools,
      temperature: 0.3, // Lower temperature for more consistent analysis
      maxTokens: 1000
    }
    super(config, provider)
  }

  protected async handleTask(task: Task): Promise<any> {
    switch (task.type) {
      case 'check_health':
        return this.checkContractHealth()

      case 'analyze_transaction':
        return this.analyzeTransaction(task.data.txHash)

      case 'generate_report':
        return this.generateSecurityReport(task.data.type)

      case 'investigate_alert':
        return this.investigateAlert(task.data.alertId)

      default:
        throw new Error(`Unknown task type: ${task.type}`)
    }
  }

  protected async periodicCheck(): Promise<void> {
    // Run health check every interval
    const health = await this.checkContractHealth()

    // Store metrics for comparison
    if (this.lastMetrics) {
      // Check for significant changes
      const tvlChange = this.calculateChange(this.lastMetrics.staking?.totalStaked, health.staking?.totalStaked)
      if (Math.abs(tvlChange) > 20) {
        await this.createAlert('high', 'Large TVL Change', `TVL changed by ${tvlChange.toFixed(2)}%`)
      }
    }

    this.lastMetrics = health
    console.log(`[${this.name}] Health check completed`)
  }

  async checkContractHealth(): Promise<any> {
    const prompt = `Perform a health check on the GrepCoin contracts.

Use the available tools to:
1. Get token metrics
2. Get staking metrics
3. Check for anomalies in the last 24h

Analyze the data and report:
- Overall health status (healthy/warning/critical)
- Any concerns or anomalies
- Key metrics summary

Return a structured JSON response.`

    const response = await this.chat(prompt)

    try {
      return JSON.parse(response)
    } catch {
      return { status: 'healthy', rawResponse: response }
    }
  }

  async analyzeTransaction(txHash: string): Promise<any> {
    const prompt = `Analyze this transaction: ${txHash}

Determine:
1. Transaction type (transfer, stake, unstake, etc.)
2. Amounts involved
3. Whether it's suspicious
4. Risk level

Return a JSON analysis.`

    return this.chat(prompt)
  }

  async generateSecurityReport(type: 'daily' | 'weekly' | 'incident' = 'daily'): Promise<string> {
    const prompt = `Generate a ${type} security report for GrepCoin.

Include:
1. Contract health summary
2. Key metrics and changes
3. Any alerts or incidents
4. Recommendations

Format as a clear, readable report.`

    return this.chat(prompt)
  }

  async investigateAlert(alertId: string): Promise<any> {
    const alert = this.alerts.find(a => a.title === alertId)
    if (!alert) return { error: 'Alert not found' }

    const prompt = `Investigate this alert:

Title: ${alert.title}
Severity: ${alert.severity}
Description: ${alert.description}
Time: ${alert.timestamp.toISOString()}

Use available tools to gather more information and determine:
1. Root cause
2. Impact assessment
3. Recommended actions
4. Whether to escalate`

    return this.chat(prompt)
  }

  private async createAlert(severity: Alert['severity'], title: string, description: string): Promise<void> {
    const alert: Alert = {
      severity,
      title,
      description,
      timestamp: new Date(),
      resolved: false
    }
    this.alerts.push(alert)

    // Send notification
    console.log(`[ALERT:${severity.toUpperCase()}] ${title}: ${description}`)
  }

  private calculateChange(oldValue: string | number, newValue: string | number): number {
    const old = typeof oldValue === 'string' ? parseFloat(oldValue) : oldValue
    const current = typeof newValue === 'string' ? parseFloat(newValue) : newValue
    if (old === 0) return 0
    return ((current - old) / old) * 100
  }

  // Get all alerts
  getAlerts(severity?: Alert['severity']): Alert[] {
    if (severity) {
      return this.alerts.filter(a => a.severity === severity)
    }
    return [...this.alerts]
  }

  // Resolve an alert
  resolveAlert(title: string): void {
    const alert = this.alerts.find(a => a.title === title)
    if (alert) {
      alert.resolved = true
    }
  }
}
