import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({
    items: [
      { itemId: 'avatar-robot', quantity: 1, acquiredAt: new Date(), equipped: true },
      { itemId: 'boost-2x', quantity: 3, acquiredAt: new Date() },
      { itemId: 'lootbox', quantity: 5, acquiredAt: new Date() },
    ]
  })
}
