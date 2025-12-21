export interface Season {
  id: string
  name: string
  theme: string
  startDate: Date
  endDate: Date
  rewards: SeasonReward[]
  challenges: SeasonChallenge[]
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

export interface SeasonReward {
  id: string
  name: string
  description: string
  type: 'grep' | 'badge' | 'cosmetic' | 'multiplier'
  value: number | string
  requiredPoints: number
  icon: string
}

export interface SeasonChallenge {
  id: string
  name: string
  description: string
  type: 'daily' | 'weekly' | 'season'
  target: number
  points: number
  icon: string
}

export const CURRENT_SEASON: Season = {
  id: 'winter-2024',
  name: 'Winter Wonderland',
  theme: 'winter',
  startDate: new Date('2024-12-01'),
  endDate: new Date('2025-01-31'),
  colors: {
    primary: '#60a5fa',
    secondary: '#1e3a5f',
    accent: '#93c5fd',
  },
  rewards: [
    { id: 'r1', name: '500 GREP', description: 'Bonus tokens', type: 'grep', value: 500, requiredPoints: 100, icon: '🪙' },
    { id: 'r2', name: 'Snowflake Badge', description: 'Winter badge', type: 'badge', value: 'snowflake', requiredPoints: 250, icon: '❄️' },
    { id: 'r3', name: '1.5x Multiplier', description: '24h boost', type: 'multiplier', value: 1.5, requiredPoints: 500, icon: '⚡' },
    { id: 'r4', name: '2000 GREP', description: 'Big reward', type: 'grep', value: 2000, requiredPoints: 1000, icon: '💰' },
    { id: 'r5', name: 'Ice Crown', description: 'Legendary cosmetic', type: 'cosmetic', value: 'ice_crown', requiredPoints: 2000, icon: '👑' },
  ],
  challenges: [
    { id: 'c1', name: 'Daily Player', description: 'Play 3 games today', type: 'daily', target: 3, points: 10, icon: '🎮' },
    { id: 'c2', name: 'Score Hunter', description: 'Score 5000 points today', type: 'daily', target: 5000, points: 15, icon: '🎯' },
    { id: 'c3', name: 'Weekly Warrior', description: 'Play 20 games this week', type: 'weekly', target: 20, points: 50, icon: '⚔️' },
    { id: 'c4', name: 'High Scorer', description: 'Score 50000 points this week', type: 'weekly', target: 50000, points: 75, icon: '🏆' },
    { id: 'c5', name: 'Season Champion', description: 'Play 100 games this season', type: 'season', target: 100, points: 200, icon: '🏅' },
  ],
}

export function getSeasonProgress(startDate: Date, endDate: Date): number {
  const now = Date.now()
  const start = startDate.getTime()
  const end = endDate.getTime()

  if (now < start) return 0
  if (now > end) return 100

  return Math.round(((now - start) / (end - start)) * 100)
}

export function getTimeRemaining(endDate: Date): string {
  const now = Date.now()
  const end = endDate.getTime()
  const diff = end - now

  if (diff <= 0) return 'Ended'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `${days}d ${hours}h remaining`
  return `${hours}h remaining`
}
