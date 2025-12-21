'use client'
import { useState, useEffect, useCallback } from 'react'
import { ITEMS, Item, InventoryItem } from '@/lib/inventory'

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => { setInventory(data.items || []); setIsLoading(false) })
      .catch(() => setIsLoading(false))
  }, [])

  const items = inventory.map(inv => ({
    ...inv,
    item: ITEMS.find(i => i.id === inv.itemId)!,
  })).filter(i => i.item)

  const consumeItem = useCallback(async (itemId: string) => {
    const res = await fetch('/api/inventory/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    })
    const data = await res.json()
    if (data.success) {
      setInventory(prev => prev.map(i =>
        i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i
      ).filter(i => i.quantity > 0))
    }
    return data
  }, [])

  const equipItem = useCallback(async (itemId: string) => {
    await fetch('/api/inventory/equip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    })
    setInventory(prev => prev.map(i => ({ ...i, equipped: i.itemId === itemId })))
  }, [])

  return { items, isLoading, consumeItem, equipItem }
}
