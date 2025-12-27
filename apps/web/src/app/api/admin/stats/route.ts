import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/auth'

const ADMIN_WALLETS = [process.env.ADMIN_WALLET?.toLowerCase()]

export async function GET(_request: NextRequest) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')?.value

  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = parseSessionToken(sessionToken)
  if (!session || !ADMIN_WALLETS.includes(session.address.toLowerCase())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalUsers, globalStats, activeToday] = await Promise.all([
    prisma.user.count(),
    prisma.globalStats.findUnique({ where: { id: 'global' } }),
    prisma.dailyStats.count({ where: { date: { gte: today } } })
  ])

  return NextResponse.json({
    totalUsers,
    totalGamesPlayed: Number(globalStats?.totalGamesPlayed || 0),
    totalGrepEarned: Number(globalStats?.totalGrepEarned || 0),
    activeToday
  })
}
