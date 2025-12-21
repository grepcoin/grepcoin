import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    guild: {
      id: '1',
      name: 'Alpha Squad',
      tag: 'ALFA',
      description: 'Top players',
      icon: '⚔️',
      level: 5,
      xp: 2500,
      memberCount: 12,
      maxMembers: 20,
      ownerId: 'u1',
      createdAt: new Date()
    },
    members: [
      { userId: 'u1', role: 'owner', joinedAt: new Date(), contribution: 500 },
      { userId: 'u2', role: 'member', joinedAt: new Date(), contribution: 200 },
    ]
  })
}
