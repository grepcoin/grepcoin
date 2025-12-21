export interface Level {
  level: number
  xpRequired: number
  title: string
  perks: string[]
  color: string
}

export const LEVELS: Level[] = [
  { level: 1, xpRequired: 0, title: 'Newcomer', perks: ['Basic access'], color: 'text-gray-400' },
  { level: 5, xpRequired: 500, title: 'Rookie', perks: ['+5% GREP bonus'], color: 'text-green-400' },
  { level: 10, xpRequired: 1500, title: 'Player', perks: ['+10% GREP bonus', 'Custom avatar'], color: 'text-blue-400' },
  { level: 20, xpRequired: 5000, title: 'Veteran', perks: ['+15% GREP bonus', 'Profile badge'], color: 'text-purple-400' },
  { level: 30, xpRequired: 12000, title: 'Expert', perks: ['+20% GREP bonus', 'Early access'], color: 'text-orange-400' },
  { level: 50, xpRequired: 30000, title: 'Master', perks: ['+25% GREP bonus', 'Exclusive events'], color: 'text-yellow-400' },
  { level: 100, xpRequired: 100000, title: 'Legend', perks: ['+30% GREP bonus', 'Legend badge', 'VIP support'], color: 'text-red-400' },
]

export function getLevel(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) return LEVELS[i]
  }
  return LEVELS[0]
}

export function getNextLevel(xp: number): Level | null {
  const current = getLevel(xp)
  const idx = LEVELS.findIndex(l => l.level === current.level)
  return LEVELS[idx + 1] || null
}

export function getXPProgress(xp: number): number {
  const current = getLevel(xp)
  const next = getNextLevel(xp)
  if (!next) return 100
  const xpInLevel = xp - current.xpRequired
  const xpNeeded = next.xpRequired - current.xpRequired
  return Math.floor((xpInLevel / xpNeeded) * 100)
}

export const XP_SOURCES = {
  game_played: 10,
  game_won: 25,
  achievement: 50,
  daily_login: 15,
  referral: 100,
  tournament_win: 200,
}
