import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.toLowerCase() || ''

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const results: any[] = []

  // Search games
  const games = await prisma.game.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: 5,
  })

  results.push(...games.map(g => ({
    type: 'game',
    title: g.name,
    description: g.description || '',
    href: `/games/${g.slug}`,
    icon: '🎮',
  })))

  // Search players
  const players = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: q, mode: 'insensitive' } },
        { walletAddress: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: 5,
  })

  results.push(...players.map(p => ({
    type: 'player',
    title: p.username || p.walletAddress.slice(0, 10) + '...',
    description: p.walletAddress,
    href: `/profile/${p.walletAddress}`,
    icon: '👤',
  })))

  return NextResponse.json({ results })
}
