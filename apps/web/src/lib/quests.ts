export type QuestType = 'daily' | 'weekly' | 'special'
export type QuestStatus = 'active' | 'completed' | 'claimed'

export interface Quest {
  id: string
  name: string
  description: string
  type: QuestType
  icon: string
  target: number
  reward: { grep: number; xp: number }
  expiresAt?: Date
}

export interface UserQuest {
  questId: string
  progress: number
  status: QuestStatus
}

export const DAILY_QUESTS: Quest[] = [
  { id: 'd1', name: 'Daily Player', description: 'Play 3 games', type: 'daily', icon: '🎮', target: 3, reward: { grep: 50, xp: 25 } },
  { id: 'd2', name: 'Score Hunter', description: 'Score 5000 points', type: 'daily', icon: '🎯', target: 5000, reward: { grep: 75, xp: 40 } },
  { id: 'd3', name: 'Social Butterfly', description: 'Send a message', type: 'daily', icon: '💬', target: 1, reward: { grep: 25, xp: 15 } },
]

export const WEEKLY_QUESTS: Quest[] = [
  { id: 'w1', name: 'Weekly Warrior', description: 'Play 25 games', type: 'weekly', icon: '⚔️', target: 25, reward: { grep: 300, xp: 150 } },
  { id: 'w2', name: 'High Achiever', description: 'Score 50000 points', type: 'weekly', icon: '🏆', target: 50000, reward: { grep: 500, xp: 250 } },
  { id: 'w3', name: 'Streak Master', description: 'Login 7 days', type: 'weekly', icon: '🔥', target: 7, reward: { grep: 200, xp: 100 } },
]
