'use client'
import { useInventory } from '@/hooks/useInventory'
import { ItemCard } from './ItemCard'

export function InventoryGrid() {
  const { items, isLoading, consumeItem, equipItem } = useInventory()

  if (isLoading) return <div className="animate-pulse bg-gray-800 rounded-lg h-64" />

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Inventory ({items.length})</h2>
      {items.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No items yet</p>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          {items.map(({ item, quantity, equipped }) => (
            <ItemCard key={item.id} item={item} quantity={quantity} equipped={equipped}
              onUse={() => consumeItem(item.id)} onEquip={() => equipItem(item.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
