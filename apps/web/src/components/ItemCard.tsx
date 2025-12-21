'use client'
import { Item, RARITY_COLORS } from '@/lib/inventory'

interface Props {
  item: Item
  quantity: number
  equipped?: boolean
  onUse?: () => void
  onEquip?: () => void
}

export function ItemCard({ item, quantity, equipped, onUse, onEquip }: Props) {
  return (
    <div className={`border-2 rounded-xl p-3 ${RARITY_COLORS[item.rarity]} ${equipped ? 'ring-2 ring-emerald-400' : ''}`}>
      <div className="text-4xl text-center mb-2">{item.icon}</div>
      <p className="font-bold text-sm text-center truncate">{item.name}</p>
      <p className="text-xs text-gray-400 text-center">x{quantity}</p>
      <div className="flex gap-1 mt-2">
        {item.type === 'booster' || item.type === 'consumable' ? (
          <button onClick={onUse} className="flex-1 text-xs py-1 bg-emerald-600 hover:bg-emerald-700 rounded">Use</button>
        ) : item.type === 'cosmetic' ? (
          <button onClick={onEquip} className="flex-1 text-xs py-1 bg-blue-600 hover:bg-blue-700 rounded">
            {equipped ? 'Equipped' : 'Equip'}
          </button>
        ) : null}
      </div>
    </div>
  )
}
