export interface Guild {
  id: string
  name: string
  tag: string
  description: string
  icon: string
  level: number
  xp: number
  memberCount: number
  maxMembers: number
  ownerId: string
  createdAt: Date
}

export interface GuildMember {
  userId: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: Date
  contribution: number
}

export const GUILD_PERKS = [
  { level: 1, perk: 'Guild chat' },
  { level: 3, perk: '+5% GREP bonus' },
  { level: 5, perk: 'Guild events' },
  { level: 10, perk: '+10% GREP bonus' },
  { level: 15, perk: 'Guild tournaments' },
  { level: 20, perk: '+15% GREP bonus' },
]

export const GUILD_COSTS = { create: 1000, rename: 500 }
