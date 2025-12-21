export type ItemType = 'cosmetic' | 'booster' | 'consumable' | 'badge' | 'special'
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface Item {
  id: string
  name: string
  description: string
  type: ItemType
  rarity: ItemRarity
  icon: string
  effect?: { type: string; value: number }
  tradeable: boolean
}

export interface InventoryItem {
  itemId: string
  quantity: number
  acquiredAt: Date
  equipped?: boolean
}

export const ITEMS: Item[] = [
  { id: 'avatar-crown', name: 'Golden Crown', description: 'A royal crown avatar', type: 'cosmetic', rarity: 'legendary', icon: '👑', tradeable: true },
  { id: 'avatar-robot', name: 'Robot Head', description: 'Futuristic robot avatar', type: 'cosmetic', rarity: 'epic', icon: '🤖', tradeable: true },
  { id: 'boost-2x', name: '2x GREP Booster', description: 'Double GREP for 1 hour', type: 'booster', rarity: 'rare', icon: '⚡', effect: { type: 'grep_multiplier', value: 2 }, tradeable: false },
  { id: 'boost-xp', name: 'XP Boost', description: '+50% XP for 1 hour', type: 'booster', rarity: 'rare', icon: '📈', effect: { type: 'xp_multiplier', value: 1.5 }, tradeable: false },
  { id: 'lootbox', name: 'Mystery Box', description: 'Contains random items', type: 'consumable', rarity: 'common', icon: '📦', tradeable: true },
  { id: 'badge-og', name: 'OG Badge', description: 'Early supporter badge', type: 'badge', rarity: 'legendary', icon: '💎', tradeable: false },
]

export const RARITY_COLORS: Record<ItemRarity, string> = {
  common: 'border-gray-500 bg-gray-900',
  rare: 'border-blue-500 bg-blue-900/30',
  epic: 'border-purple-500 bg-purple-900/30',
  legendary: 'border-yellow-500 bg-yellow-900/30',
}
