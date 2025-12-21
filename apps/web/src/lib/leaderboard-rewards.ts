export interface RewardTier {
  rankStart: number
  rankEnd: number
  grepAmount: number
  badgeId?: string
  multiplierBonus?: number // e.g., 1.05 = 5% bonus
}

export interface RewardDistribution {
  id: string
  period: 'weekly' | 'monthly'
  startDate: Date
  endDate: Date
  status: 'upcoming' | 'active' | 'distributing' | 'completed'
  tiers: RewardTier[]
  totalPool: number
}

// Weekly reward tiers - every Sunday
export const WEEKLY_REWARD_TIERS: RewardTier[] = [
  // Top 3 get special badges and large rewards
  { rankStart: 1, rankEnd: 1, grepAmount: 5000, badgeId: 'weekly_champion', multiplierBonus: 1.10 },
  { rankStart: 2, rankEnd: 2, grepAmount: 3000, badgeId: 'weekly_runner_up', multiplierBonus: 1.05 },
  { rankStart: 3, rankEnd: 3, grepAmount: 2000, badgeId: 'weekly_third_place', multiplierBonus: 1.03 },

  // Top 10 get rewards
  { rankStart: 4, rankEnd: 5, grepAmount: 1000 },
  { rankStart: 6, rankEnd: 10, grepAmount: 500 },
]

// Monthly reward tiers - every 1st of the month
export const MONTHLY_REWARD_TIERS: RewardTier[] = [
  // Top 3 get legendary badges and huge rewards
  { rankStart: 1, rankEnd: 1, grepAmount: 25000, badgeId: 'monthly_legend', multiplierBonus: 1.25 },
  { rankStart: 2, rankEnd: 2, grepAmount: 15000, badgeId: 'monthly_master', multiplierBonus: 1.15 },
  { rankStart: 3, rankEnd: 3, grepAmount: 10000, badgeId: 'monthly_expert', multiplierBonus: 1.10 },

  // Top 25 get substantial rewards
  { rankStart: 4, rankEnd: 5, grepAmount: 5000, multiplierBonus: 1.05 },
  { rankStart: 6, rankEnd: 10, grepAmount: 3000 },
  { rankStart: 11, rankEnd: 15, grepAmount: 2000 },
  { rankStart: 16, rankEnd: 25, grepAmount: 1000 },
]

// Distribution schedule constants
export const DISTRIBUTION_SCHEDULE = {
  weekly: {
    dayOfWeek: 0, // Sunday
    hour: 0, // Midnight UTC
  },
  monthly: {
    dayOfMonth: 1, // First day of month
    hour: 0, // Midnight UTC
  },
}

// Calculate next distribution date
export function getNextDistributionDate(type: 'weekly' | 'monthly'): Date {
  const now = new Date()

  if (type === 'weekly') {
    const nextSunday = new Date(now)
    nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7))
    nextSunday.setUTCHours(0, 0, 0, 0)
    return nextSunday
  } else {
    // Next month, 1st day
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    nextMonth.setUTCHours(0, 0, 0, 0)
    return nextMonth
  }
}

// Get current period start date
export function getCurrentPeriodStart(type: 'weekly' | 'monthly'): Date {
  const now = new Date()

  if (type === 'weekly') {
    // Last Sunday
    const lastSunday = new Date(now)
    const daysSinceSunday = now.getDay()
    lastSunday.setDate(now.getDate() - daysSinceSunday)
    lastSunday.setUTCHours(0, 0, 0, 0)
    return lastSunday
  } else {
    // First day of current month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    monthStart.setUTCHours(0, 0, 0, 0)
    return monthStart
  }
}

// Calculate total pool for a period
export function calculateTotalPool(tiers: RewardTier[]): number {
  return tiers.reduce((sum, tier) => {
    const playersInTier = tier.rankEnd - tier.rankStart + 1
    return sum + (tier.grepAmount * playersInTier)
  }, 0)
}

// Get reward for a specific rank
export function getRewardForRank(rank: number, tiers: RewardTier[]): RewardTier | null {
  return tiers.find(tier => rank >= tier.rankStart && rank <= tier.rankEnd) || null
}

// Badge definitions for rewards
export const REWARD_BADGES = {
  // Weekly badges
  weekly_champion: {
    id: 'weekly_champion',
    name: 'Weekly Champion',
    description: 'Ranked #1 in weekly leaderboard',
    icon: '👑',
    rarity: 'legendary' as const,
    category: 'achievement' as const,
  },
  weekly_runner_up: {
    id: 'weekly_runner_up',
    name: 'Weekly Runner-Up',
    description: 'Ranked #2 in weekly leaderboard',
    icon: '🥈',
    rarity: 'epic' as const,
    category: 'achievement' as const,
  },
  weekly_third_place: {
    id: 'weekly_third_place',
    name: 'Weekly Bronze',
    description: 'Ranked #3 in weekly leaderboard',
    icon: '🥉',
    rarity: 'rare' as const,
    category: 'achievement' as const,
  },

  // Monthly badges
  monthly_legend: {
    id: 'monthly_legend',
    name: 'Monthly Legend',
    description: 'Dominated the monthly leaderboard',
    icon: '🏆',
    rarity: 'legendary' as const,
    category: 'achievement' as const,
  },
  monthly_master: {
    id: 'monthly_master',
    name: 'Monthly Master',
    description: 'Ranked #2 in monthly leaderboard',
    icon: '💎',
    rarity: 'legendary' as const,
    category: 'achievement' as const,
  },
  monthly_expert: {
    id: 'monthly_expert',
    name: 'Monthly Expert',
    description: 'Ranked #3 in monthly leaderboard',
    icon: '⭐',
    rarity: 'epic' as const,
    category: 'achievement' as const,
  },
}

// Calculate time remaining until distribution
export function getTimeUntilDistribution(nextDate: Date): {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
} {
  const now = new Date()
  const total = nextDate.getTime() - now.getTime()

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  }

  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))

  return { days, hours, minutes, seconds, total }
}
