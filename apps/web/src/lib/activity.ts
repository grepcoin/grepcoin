export type ActivityType =
  | 'game_played'
  | 'achievement_unlocked'
  | 'level_up'
  | 'friend_added'
  | 'reward_claimed'
  | 'tournament_joined'
  | 'tournament_won'
  | 'stake_created'
  | 'referral_joined'

export interface Activity {
  id: string
  type: ActivityType
  userId: string
  data: Record<string, unknown>
  createdAt: Date
}

export const ACTIVITY_CONFIG: Record<ActivityType, { icon: string; verb: string; color: string }> = {
  game_played: { icon: '🎮', verb: 'played', color: 'text-blue-400' },
  achievement_unlocked: { icon: '🏆', verb: 'unlocked', color: 'text-yellow-400' },
  level_up: { icon: '⬆️', verb: 'reached', color: 'text-purple-400' },
  friend_added: { icon: '🤝', verb: 'became friends with', color: 'text-green-400' },
  reward_claimed: { icon: '🎁', verb: 'claimed', color: 'text-pink-400' },
  tournament_joined: { icon: '⚔️', verb: 'joined', color: 'text-orange-400' },
  tournament_won: { icon: '👑', verb: 'won', color: 'text-yellow-500' },
  stake_created: { icon: '📈', verb: 'staked', color: 'text-emerald-400' },
  referral_joined: { icon: '📨', verb: 'referred', color: 'text-cyan-400' },
}

export function formatActivityMessage(activity: Activity): string {
  const config = ACTIVITY_CONFIG[activity.type]
  const data = activity.data

  switch (activity.type) {
    case 'game_played':
      return `${config.verb} ${data.gameName} and scored ${(data.score as number).toLocaleString()}`
    case 'achievement_unlocked':
      return `${config.verb} "${data.achievementName}"`
    case 'level_up':
      return `${config.verb} level ${data.level}`
    case 'friend_added':
      return `${config.verb} ${data.friendName}`
    case 'reward_claimed':
      return `${config.verb} ${data.amount} GREP`
    case 'tournament_joined':
      return `${config.verb} tournament "${data.tournamentName}"`
    case 'tournament_won':
      return `${config.verb} tournament "${data.tournamentName}" (${data.prize} GREP)`
    case 'stake_created':
      return `${config.verb} ${data.amount} GREP`
    case 'referral_joined':
      return `${config.verb} a new player who joined`
    default:
      return 'performed an action'
  }
}

export function getRelativeTime(date: Date): string {
  const now = Date.now()
  const diff = now - new Date(date).getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}
