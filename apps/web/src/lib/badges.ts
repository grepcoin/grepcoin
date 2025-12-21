export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  category: BadgeCategory
  requirement: BadgeRequirement
}

export type BadgeCategory = 'gameplay' | 'social' | 'achievement' | 'special' | 'seasonal'

export interface BadgeRequirement {
  type: 'games_played' | 'score_total' | 'friends_count' | 'streak_days' | 'achievements' | 'referrals' | 'special'
  value: number
}

export const BADGES: Badge[] = [
  // Gameplay badges
  { id: 'first_game', name: 'First Steps', description: 'Play your first game', icon: '🎮', rarity: 'common', category: 'gameplay', requirement: { type: 'games_played', value: 1 } },
  { id: 'gamer_10', name: 'Getting Started', description: 'Play 10 games', icon: '🕹️', rarity: 'common', category: 'gameplay', requirement: { type: 'games_played', value: 10 } },
  { id: 'gamer_100', name: 'Dedicated Gamer', description: 'Play 100 games', icon: '🏆', rarity: 'rare', category: 'gameplay', requirement: { type: 'games_played', value: 100 } },
  { id: 'gamer_1000', name: 'Gaming Legend', description: 'Play 1000 games', icon: '👑', rarity: 'legendary', category: 'gameplay', requirement: { type: 'games_played', value: 1000 } },

  // Score badges
  { id: 'score_10k', name: 'Point Collector', description: 'Earn 10,000 total points', icon: '⭐', rarity: 'common', category: 'gameplay', requirement: { type: 'score_total', value: 10000 } },
  { id: 'score_100k', name: 'Point Master', description: 'Earn 100,000 total points', icon: '🌟', rarity: 'rare', category: 'gameplay', requirement: { type: 'score_total', value: 100000 } },
  { id: 'score_1m', name: 'Point Legend', description: 'Earn 1,000,000 total points', icon: '✨', rarity: 'legendary', category: 'gameplay', requirement: { type: 'score_total', value: 1000000 } },

  // Social badges
  { id: 'first_friend', name: 'Friendly', description: 'Add your first friend', icon: '🤝', rarity: 'common', category: 'social', requirement: { type: 'friends_count', value: 1 } },
  { id: 'popular', name: 'Popular', description: 'Have 10 friends', icon: '🌐', rarity: 'rare', category: 'social', requirement: { type: 'friends_count', value: 10 } },
  { id: 'influencer', name: 'Influencer', description: 'Have 50 friends', icon: '📢', rarity: 'epic', category: 'social', requirement: { type: 'friends_count', value: 50 } },

  // Streak badges
  { id: 'streak_7', name: 'Week Warrior', description: '7-day play streak', icon: '🔥', rarity: 'rare', category: 'achievement', requirement: { type: 'streak_days', value: 7 } },
  { id: 'streak_30', name: 'Month Master', description: '30-day play streak', icon: '💪', rarity: 'epic', category: 'achievement', requirement: { type: 'streak_days', value: 30 } },
  { id: 'streak_100', name: 'Unstoppable', description: '100-day play streak', icon: '🏅', rarity: 'legendary', category: 'achievement', requirement: { type: 'streak_days', value: 100 } },

  // Referral badges
  { id: 'referrer', name: 'Recruiter', description: 'Refer 1 friend', icon: '📨', rarity: 'common', category: 'social', requirement: { type: 'referrals', value: 1 } },
  { id: 'ambassador', name: 'Ambassador', description: 'Refer 10 friends', icon: '🎖️', rarity: 'epic', category: 'social', requirement: { type: 'referrals', value: 10 } },

  // Special badges
  { id: 'early_adopter', name: 'Early Adopter', description: 'Joined during beta', icon: '🚀', rarity: 'legendary', category: 'special', requirement: { type: 'special', value: 0 } },
  { id: 'og', name: 'OG', description: 'Original community member', icon: '💎', rarity: 'legendary', category: 'special', requirement: { type: 'special', value: 0 } },
]

export const RARITY_COLORS: Record<Badge['rarity'], string> = {
  common: 'bg-gray-600',
  rare: 'bg-blue-600',
  epic: 'bg-purple-600',
  legendary: 'bg-yellow-600',
}
