import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/auth'
import prisma from '@/lib/db'

const ACHIEVEMENTS_CONTRACT = process.env.ACHIEVEMENTS_CONTRACT_ADDRESS

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')?.value
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = parseSessionToken(sessionToken)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { achievementId } = await request.json()

  // Find user by wallet address
  const user = await prisma.user.findUnique({
    where: { walletAddress: session.address }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Verify user has unlocked this achievement
  const userAchievement = await prisma.userAchievement.findFirst({
    where: {
      userId: user.id,
      achievementId,
      unlockedAt: { not: null },
      mintedAt: null  // Not already minted
    },
    include: { achievement: true }
  })

  if (!userAchievement) {
    return NextResponse.json({ error: 'Achievement not eligible for minting' }, { status: 400 })
  }

  // Return mint data for client-side transaction
  // Client will use wagmi to execute the mint
  return NextResponse.json({
    success: true,
    mintData: {
      achievementId: userAchievement.achievement.id,
      name: userAchievement.achievement.name,
      rarity: userAchievement.achievement.rarity,
      contractAddress: ACHIEVEMENTS_CONTRACT
    }
  })
}
