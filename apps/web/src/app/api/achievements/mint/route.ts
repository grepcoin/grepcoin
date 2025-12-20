import { NextRequest, NextResponse } from 'next/server'
import { parseSessionToken } from '@/lib/auth'
import prisma from '@/lib/db'
import { createPublicClient, createWalletClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'

const ACHIEVEMENTS_CONTRACT = process.env.ACHIEVEMENTS_CONTRACT_ADDRESS

export async function POST(request: NextRequest) {
  const session = parseSessionToken(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { achievementId } = await request.json()

  // Verify user has unlocked this achievement
  const userAchievement = await prisma.userAchievement.findFirst({
    where: {
      userId: session.userId,
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
