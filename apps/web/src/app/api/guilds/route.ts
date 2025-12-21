import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { name, tag, description } = await req.json()

  // Mock guild creation
  const guild = {
    id: Math.random().toString(36).substring(7),
    name,
    tag,
    description,
    icon: '🛡️',
    level: 1,
    xp: 0,
    memberCount: 1,
    maxMembers: 10,
    ownerId: 'currentUser',
    createdAt: new Date()
  }

  return NextResponse.json({ guild, success: true })
}

export async function GET() {
  // Mock list of all guilds
  return NextResponse.json({
    guilds: [
      {
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
      {
        id: '2',
        name: 'Code Warriors',
        tag: 'CODE',
        description: 'Elite coders',
        icon: '💻',
        level: 3,
        xp: 1200,
        memberCount: 8,
        maxMembers: 15,
        ownerId: 'u2',
        createdAt: new Date()
      }
    ]
  })
}
