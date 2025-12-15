import { Client, TextChannel } from 'discord.js'
import { GuardianAgent, quickAgent } from '@grepcoin/agents'
import { Alert, HealthMetrics, createHealthEmbed, createAlertEmbed } from '../embeds'

export class GuardianMonitor {
  private client: Client
  private agent: GuardianAgent
  private monitoringChannelId: string | undefined
  private healthCheckInterval: number
  private intervalId: NodeJS.Timeout | null = null
  private alerts: Alert[] = []

  constructor(
    client: Client,
    options: {
      monitoringChannelId?: string
      healthCheckInterval?: number
      aiProvider?: 'ollama' | 'openai'
      aiModel?: string
    } = {}
  ) {
    this.client = client
    this.monitoringChannelId = options.monitoringChannelId
    this.healthCheckInterval = options.healthCheckInterval || 5 * 60 * 1000 // 5 minutes

    // Initialize the GuardianAgent
    this.agent = quickAgent('guardian', {
      provider: options.aiProvider || 'ollama',
      model: options.aiModel,
    }) as GuardianAgent
  }

  /**
   * Start the monitoring service
   */
  async start(): Promise<void> {
    if (!this.monitoringChannelId) {
      console.log('[GuardianMonitor] No monitoring channel configured, skipping')
      return
    }

    console.log(`[GuardianMonitor] Starting monitoring (interval: ${this.healthCheckInterval}ms)`)

    // Run initial health check
    await this.runHealthCheck()

    // Start periodic health checks
    this.intervalId = setInterval(() => this.runHealthCheck(), this.healthCheckInterval)
  }

  /**
   * Stop the monitoring service
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('[GuardianMonitor] Stopped monitoring')
    }
  }

  /**
   * Run a health check and post results to Discord
   */
  async runHealthCheck(): Promise<HealthMetrics> {
    console.log('[GuardianMonitor] Running health check...')

    try {
      // Get metrics from the agent's tools
      const tokenMetrics = await this.getTokenMetrics()
      const stakingMetrics = await this.getStakingMetrics()

      // Check for anomalies
      const anomalies = await this.checkAnomalies()

      // Determine overall status
      const status = this.determineStatus(anomalies)

      const healthMetrics: HealthMetrics = {
        token: tokenMetrics,
        staking: stakingMetrics,
        status,
        lastChecked: new Date(),
      }

      // Post to monitoring channel
      if (this.monitoringChannelId) {
        await this.postHealthCheck(healthMetrics)
      }

      // Handle any alerts from anomalies
      if (anomalies.alerts && anomalies.alerts.length > 0) {
        for (const alert of anomalies.alerts) {
          await this.handleAlert(alert)
        }
      }

      console.log(`[GuardianMonitor] Health check complete - Status: ${status}`)

      return healthMetrics
    } catch (error) {
      console.error('[GuardianMonitor] Health check failed:', error)

      // Create an error alert
      const errorAlert: Alert = {
        severity: 'medium',
        title: 'Health Check Failed',
        description: 'The automated health check encountered an error.',
        data: { error: String(error) },
        timestamp: new Date(),
      }

      await this.handleAlert(errorAlert)

      return {
        token: { totalSupply: 'Unknown' },
        staking: { totalStaked: 'Unknown', activeStakers: 0 },
        status: 'warning',
        lastChecked: new Date(),
      }
    }
  }

  /**
   * Handle an alert - store it and post to Discord
   */
  async handleAlert(alert: Alert): Promise<void> {
    // Store alert
    this.alerts.push(alert)

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100)
    }

    // Post to monitoring channel
    if (this.monitoringChannelId) {
      try {
        const channel = await this.client.channels.fetch(this.monitoringChannelId)

        if (channel instanceof TextChannel) {
          const embed = createAlertEmbed(alert)

          // Mention admins for critical alerts
          const content = alert.severity === 'critical'
            ? '@everyone 🚨 **CRITICAL ALERT** - Immediate attention required!'
            : undefined

          await channel.send({ content, embeds: [embed] })
        }
      } catch (error) {
        console.error('[GuardianMonitor] Failed to post alert:', error)
      }
    }

    console.log(`[GuardianMonitor] Alert: [${alert.severity.toUpperCase()}] ${alert.title}`)
  }

  /**
   * Get recent alerts, optionally filtered by severity
   */
  getAlerts(severity?: 'low' | 'medium' | 'high' | 'critical'): Alert[] {
    if (severity) {
      return this.alerts.filter(a => a.severity === severity)
    }
    return [...this.alerts]
  }

  /**
   * Get token metrics (simulated - in production would query blockchain)
   */
  private async getTokenMetrics(): Promise<HealthMetrics['token']> {
    // In production, this would use viem to query the actual contract
    // For now, return simulated data
    return {
      totalSupply: '100,000,000 GREP',
      circulatingSupply: '45,000,000 GREP',
      holders: 1234,
      volume24h: '125,000 GREP',
    }
  }

  /**
   * Get staking metrics (simulated - in production would query blockchain)
   */
  private async getStakingMetrics(): Promise<HealthMetrics['staking']> {
    // In production, this would use viem to query the staking contract
    return {
      totalStaked: '25,000,000 GREP',
      activeStakers: 456,
      tvl: '$2,500,000',
      averageStake: '54,825 GREP',
      tierDistribution: {
        Flexible: 200,
        Bronze: 150,
        Silver: 75,
        Gold: 25,
        Diamond: 6,
      },
    }
  }

  /**
   * Check for anomalies (simulated - in production would analyze real data)
   */
  private async checkAnomalies(): Promise<{ found: boolean; alerts: Alert[] }> {
    // In production, this would:
    // 1. Compare current metrics to historical averages
    // 2. Check for unusual transaction patterns
    // 3. Monitor for large transfers
    // 4. Detect failed transactions

    // For now, return no anomalies (simulated healthy state)
    return {
      found: false,
      alerts: [],
    }
  }

  /**
   * Determine overall status based on anomalies
   */
  private determineStatus(anomalies: { found: boolean; alerts: Alert[] }): 'healthy' | 'warning' | 'critical' {
    if (!anomalies.found || anomalies.alerts.length === 0) {
      return 'healthy'
    }

    const hasCritical = anomalies.alerts.some(a => a.severity === 'critical')
    const hasHigh = anomalies.alerts.some(a => a.severity === 'high')

    if (hasCritical) return 'critical'
    if (hasHigh) return 'warning'
    return 'healthy'
  }

  /**
   * Post health check results to Discord
   */
  private async postHealthCheck(metrics: HealthMetrics): Promise<void> {
    try {
      const channel = await this.client.channels.fetch(this.monitoringChannelId!)

      if (channel instanceof TextChannel) {
        const embed = createHealthEmbed(metrics)
        await channel.send({ embeds: [embed] })
      }
    } catch (error) {
      console.error('[GuardianMonitor] Failed to post health check:', error)
    }
  }

  /**
   * Manual health check trigger (for slash command)
   */
  async manualHealthCheck(): Promise<HealthMetrics> {
    return this.runHealthCheck()
  }
}
