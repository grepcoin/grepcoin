import { EmbedBuilder } from 'discord.js'

// Color scheme for different embed types
export const COLORS = {
  score: 0x00ff00,        // Green
  achievement: 0xffd700,  // Gold
  reward: 0x00bfff,       // Blue
  challenge: 0xff6b6b,    // Coral
  alert_low: 0xffff00,    // Yellow
  alert_medium: 0xffa500, // Orange
  alert_high: 0xff4500,   // Red-Orange
  alert_critical: 0xff0000, // Red
  health: 0x9932cc,       // Purple
  info: 0x5865f2,         // Discord Blurple
}

// Activity types from the web app
export interface Activity {
  id: string
  type: string
  wallet: string
  username?: string
  game?: string
  value?: number
  message: string
  icon: string
  createdAt: string
}

// Health metrics from GuardianAgent
export interface HealthMetrics {
  token: {
    totalSupply: string
    circulatingSupply?: string
    holders?: number
    volume24h?: string
  }
  staking: {
    totalStaked: string
    activeStakers: number
    tvl?: string
    averageStake?: string
    tierDistribution?: Record<string, number>
  }
  status: 'healthy' | 'warning' | 'critical'
  lastChecked: Date
}

// Alert from GuardianAgent
export interface Alert {
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  data?: Record<string, any>
  timestamp: Date
}

/**
 * Create an embed for activity events (scores, achievements, rewards)
 */
export function createActivityEmbed(activity: Activity): EmbedBuilder {
  const color = getActivityColor(activity.type)
  const playerName = activity.username || shortenWallet(activity.wallet)

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`${activity.icon} ${getActivityTitle(activity.type)}`)
    .setDescription(formatActivityMessage(activity, playerName))
    .setTimestamp(new Date(activity.createdAt))
    .setFooter({ text: 'GrepCoin Arcade' })

  if (activity.game) {
    embed.addFields({ name: 'Game', value: activity.game, inline: true })
  }

  if (activity.value) {
    embed.addFields({ name: getValueLabel(activity.type), value: activity.value.toLocaleString(), inline: true })
  }

  return embed
}

/**
 * Create a highlight embed for notable achievements
 */
export function createHighlightEmbed(activity: Activity, reason: string): EmbedBuilder {
  const playerName = activity.username || shortenWallet(activity.wallet)

  const embed = new EmbedBuilder()
    .setColor(COLORS.achievement)
    .setTitle('🏆 HIGHLIGHT')
    .setDescription(`**${reason}**\n\n${activity.icon} ${playerName} ${activity.message}`)
    .setTimestamp(new Date(activity.createdAt))
    .setFooter({ text: 'GrepCoin Arcade | Featured Achievement' })

  if (activity.game) {
    embed.addFields({ name: 'Game', value: activity.game, inline: true })
  }

  if (activity.value) {
    embed.addFields({ name: getValueLabel(activity.type), value: activity.value.toLocaleString(), inline: true })
  }

  return embed
}

/**
 * Create a health check embed
 */
export function createHealthEmbed(metrics: HealthMetrics): EmbedBuilder {
  const statusEmoji = metrics.status === 'healthy' ? '✅' : metrics.status === 'warning' ? '⚠️' : '🚨'
  const statusText = metrics.status.charAt(0).toUpperCase() + metrics.status.slice(1)

  const embed = new EmbedBuilder()
    .setColor(metrics.status === 'healthy' ? COLORS.health : metrics.status === 'warning' ? COLORS.alert_medium : COLORS.alert_critical)
    .setTitle('💜 Contract Health Check')
    .setDescription(`Status: ${statusEmoji} **${statusText}**`)
    .addFields(
      {
        name: '🪙 Token Metrics',
        value: [
          `Total Supply: ${metrics.token.totalSupply}`,
          metrics.token.circulatingSupply ? `Circulating: ${metrics.token.circulatingSupply}` : null,
          metrics.token.holders ? `Holders: ${metrics.token.holders.toLocaleString()}` : null,
          metrics.token.volume24h ? `24h Volume: ${metrics.token.volume24h}` : null,
        ].filter(Boolean).join('\n'),
        inline: true,
      },
      {
        name: '📊 Staking Metrics',
        value: [
          `Total Staked: ${metrics.staking.totalStaked}`,
          `Active Stakers: ${metrics.staking.activeStakers.toLocaleString()}`,
          metrics.staking.tvl ? `TVL: ${metrics.staking.tvl}` : null,
          metrics.staking.averageStake ? `Avg Stake: ${metrics.staking.averageStake}` : null,
        ].filter(Boolean).join('\n'),
        inline: true,
      }
    )
    .setTimestamp(metrics.lastChecked)
    .setFooter({ text: 'GrepCoin Guardian | Automated Health Check' })

  if (metrics.staking.tierDistribution) {
    const tierText = Object.entries(metrics.staking.tierDistribution)
      .map(([tier, count]) => `${tier}: ${count}`)
      .join(' | ')
    embed.addFields({ name: 'Tier Distribution', value: tierText, inline: false })
  }

  return embed
}

/**
 * Create an alert embed
 */
export function createAlertEmbed(alert: Alert): EmbedBuilder {
  const severityConfig = {
    low: { color: COLORS.alert_low, emoji: '📢', label: 'LOW' },
    medium: { color: COLORS.alert_medium, emoji: '⚠️', label: 'MEDIUM' },
    high: { color: COLORS.alert_high, emoji: '🚨', label: 'HIGH' },
    critical: { color: COLORS.alert_critical, emoji: '🆘', label: 'CRITICAL' },
  }

  const config = severityConfig[alert.severity]

  const embed = new EmbedBuilder()
    .setColor(config.color)
    .setTitle(`${config.emoji} SECURITY ALERT [${config.label}]`)
    .setDescription(`**${alert.title}**\n\n${alert.description}`)
    .setTimestamp(alert.timestamp)
    .setFooter({ text: 'GrepCoin Guardian | Security Monitoring' })

  if (alert.data) {
    const dataFields = Object.entries(alert.data)
      .slice(0, 5) // Limit to 5 fields
      .map(([key, value]) => ({
        name: formatFieldName(key),
        value: String(value).slice(0, 100),
        inline: true,
      }))

    if (dataFields.length > 0) {
      embed.addFields(...dataFields)
    }
  }

  return embed
}

/**
 * Create a stats embed for platform statistics
 */
export function createStatsEmbed(stats: {
  totalPlayers: number
  totalGrepEarned: number
  totalGamesPlayed: number
  activeGames: number
  todayGames: number
  todayGrep: number
}): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(COLORS.info)
    .setTitle('📊 GrepCoin Platform Statistics')
    .addFields(
      { name: '👥 Total Players', value: stats.totalPlayers.toLocaleString(), inline: true },
      { name: '🎮 Games Played', value: stats.totalGamesPlayed.toLocaleString(), inline: true },
      { name: '💰 GREP Earned', value: stats.totalGrepEarned.toLocaleString(), inline: true },
      { name: '📅 Today\'s Games', value: stats.todayGames.toLocaleString(), inline: true },
      { name: '📅 Today\'s GREP', value: stats.todayGrep.toLocaleString(), inline: true },
      { name: '🕹️ Active Games', value: stats.activeGames.toString(), inline: true },
    )
    .setTimestamp()
    .setFooter({ text: 'GrepCoin Arcade' })
}

// Helper functions

function getActivityColor(type: string): number {
  switch (type) {
    case 'score':
      return COLORS.score
    case 'achievement':
      return COLORS.achievement
    case 'reward':
      return COLORS.reward
    case 'challenge':
      return COLORS.challenge
    default:
      return COLORS.info
  }
}

function getActivityTitle(type: string): string {
  switch (type) {
    case 'score':
      return 'New Score!'
    case 'achievement':
      return 'Achievement Unlocked!'
    case 'reward':
      return 'Reward Claimed!'
    case 'challenge':
      return 'Challenge Completed!'
    default:
      return 'Activity'
  }
}

function getValueLabel(type: string): string {
  switch (type) {
    case 'score':
      return 'Score'
    case 'achievement':
    case 'reward':
    case 'challenge':
      return 'GREP Earned'
    default:
      return 'Value'
  }
}

function formatActivityMessage(activity: Activity, playerName: string): string {
  return `**${playerName}** ${activity.message}`
}

function shortenWallet(wallet: string): string {
  if (wallet.length <= 10) return wallet
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
}

function formatFieldName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}
