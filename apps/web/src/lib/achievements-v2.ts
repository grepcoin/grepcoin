export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  tiers: AchievementTierData[]
}

export interface AchievementTierData {
  tier: AchievementTier
  target: number
  reward: { grep: number; xp: number }
}

export const TIER_COLORS: Record<AchievementTier, string> = {
  bronze: 'text-orange-400 border-orange-400',
  silver: 'text-gray-300 border-gray-300',
  gold: 'text-yellow-400 border-yellow-400',
  platinum: 'text-cyan-300 border-cyan-300',
  diamond: 'text-blue-300 border-blue-300',
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'games-played',
    name: 'Game Master',
    description: 'Play games',
    icon: '🎮',
    category: 'gameplay',
    tiers: [
      { tier: 'bronze', target: 10, reward: { grep: 50, xp: 25 } },
      { tier: 'silver', target: 50, reward: { grep: 150, xp: 75 } },
      { tier: 'gold', target: 200, reward: { grep: 400, xp: 200 } },
      { tier: 'platinum', target: 500, reward: { grep: 1000, xp: 500 } },
      { tier: 'diamond', target: 1000, reward: { grep: 2500, xp: 1250 } },
    ],
  },
  {
    id: 'total-score',
    name: 'Score Legend',
    description: 'Earn total points',
    icon: '⭐',
    category: 'gameplay',
    tiers: [
      { tier: 'bronze', target: 10000, reward: { grep: 75, xp: 40 } },
      { tier: 'silver', target: 100000, reward: { grep: 250, xp: 125 } },
      { tier: 'gold', target: 500000, reward: { grep: 750, xp: 375 } },
      { tier: 'platinum', target: 2000000, reward: { grep: 2000, xp: 1000 } },
      { tier: 'diamond', target: 10000000, reward: { grep: 5000, xp: 2500 } },
    ],
  },
  {
    id: 'referrals',
    name: 'Ambassador',
    description: 'Refer friends',
    icon: '🤝',
    category: 'social',
    tiers: [
      { tier: 'bronze', target: 1, reward: { grep: 100, xp: 50 } },
      { tier: 'silver', target: 5, reward: { grep: 300, xp: 150 } },
      { tier: 'gold', target: 15, reward: { grep: 750, xp: 375 } },
      { tier: 'platinum', target: 50, reward: { grep: 2000, xp: 1000 } },
      { tier: 'diamond', target: 100, reward: { grep: 5000, xp: 2500 } },
    ],
  },
]
