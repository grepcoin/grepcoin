// Email Notification Examples
// This file shows how to integrate email notifications into your application

import { sendEmail } from './send-email'
import { EmailType } from '@prisma/client'

/**
 * Send achievement notification
 * Call this when a user unlocks an achievement
 */
export async function notifyAchievementUnlocked(
  userId: string,
  email: string,
  achievement: {
    name: string
    description: string
    icon: string
    rarity: string
    reward: number
  },
  username: string
) {
  return await sendEmail(
    email,
    EmailType.ACHIEVEMENT,
    {
      username,
      achievement,
    },
    { userId }
  )
}

/**
 * Send reward claim notification
 * Call this when a user has rewards available to claim
 */
export async function notifyRewardAvailable(
  userId: string,
  email: string,
  username: string,
  amount: number
) {
  const claimUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://grepcoin.io'}/rewards`

  return await sendEmail(
    email,
    EmailType.REWARD_CLAIM,
    {
      username,
      amount,
      claimUrl,
    },
    { userId }
  )
}

/**
 * Send tournament starting notification
 * Call this 30 minutes before a tournament starts
 */
export async function notifyTournamentStarting(
  userId: string,
  email: string,
  username: string,
  tournament: {
    name: string
    gameSlug: string
    startTime: Date
    endTime: Date
    prizePool: number
    entryFee: number
  }
) {
  return await sendEmail(
    email,
    EmailType.TOURNAMENT_START,
    {
      username,
      tournament,
    },
    { userId }
  )
}

/**
 * Send friend request notification
 * Call this when a user receives a friend request
 */
export async function notifyFriendRequest(
  userId: string,
  email: string,
  username: string,
  friendUsername: string,
  friendWallet: string
) {
  return await sendEmail(
    email,
    EmailType.FRIEND_REQUEST,
    {
      username,
      friendUsername,
      friendWallet,
    },
    { userId }
  )
}

/**
 * Example: Integration with achievement unlock
 */
export async function onAchievementUnlocked(
  userId: string,
  achievementId: string
) {
  const { prisma } = await import('./db')

  // Get user and achievement data
  const [user, achievement] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { emailSettings: true },
    }),
    prisma.achievement.findUnique({
      where: { id: achievementId },
    }),
  ])

  if (!user || !achievement) return

  // Check if user has email notifications enabled
  if (
    user.emailSettings?.email &&
    user.emailSettings.verified &&
    user.emailSettings.achievementEnabled &&
    !user.emailSettings.unsubscribedAll
  ) {
    await notifyAchievementUnlocked(
      user.id,
      user.emailSettings.email,
      achievement,
      user.username || 'Player'
    )
  }
}

/**
 * Example: Integration with reward claims
 */
export async function onRewardThresholdReached(
  userId: string,
  totalRewards: number
) {
  const { prisma } = await import('./db')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { emailSettings: true },
  })

  if (!user?.emailSettings?.email || !user.emailSettings.verified) return
  if (!user.emailSettings.rewardClaimEnabled || user.emailSettings.unsubscribedAll) return

  await notifyRewardAvailable(
    user.id,
    user.emailSettings.email,
    user.username || 'Player',
    totalRewards
  )
}

/**
 * Example: Schedule tournament notifications
 * Call this 30 minutes before tournament start
 */
export async function scheduleTournamentNotifications(tournamentId: string) {
  const { prisma } = await import('./db')

  // Get tournament and participants
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      participants: {
        include: {
          user: {
            include: { emailSettings: true },
          },
        },
      },
    },
  })

  if (!tournament) return

  // Send notification to all participants
  const notifications = tournament.participants.map((participant) => {
    const user = participant.user
    if (!user.emailSettings?.email || !user.emailSettings.verified) return null
    if (!user.emailSettings.tournamentStartEnabled || user.emailSettings.unsubscribedAll) {
      return null
    }

    return notifyTournamentStarting(
      user.id,
      user.emailSettings.email,
      user.username || 'Player',
      {
        name: tournament.name,
        gameSlug: tournament.gameSlug,
        startTime: tournament.startTime,
        endTime: tournament.endTime,
        prizePool: tournament.prizePool,
        entryFee: tournament.entryFee,
      }
    )
  })

  await Promise.allSettled(notifications.filter(Boolean))
}

/**
 * Example: Send friend request notification
 */
export async function onFriendRequestSent(
  requesterId: string,
  recipientId: string
) {
  const { prisma } = await import('./db')

  const [requester, recipient] = await Promise.all([
    prisma.user.findUnique({
      where: { id: requesterId },
    }),
    prisma.user.findUnique({
      where: { id: recipientId },
      include: { emailSettings: true },
    }),
  ])

  if (!requester || !recipient) return
  if (!recipient.emailSettings?.email || !recipient.emailSettings.verified) return
  if (!recipient.emailSettings.friendRequestEnabled || recipient.emailSettings.unsubscribedAll) {
    return
  }

  await notifyFriendRequest(
    recipient.id,
    recipient.emailSettings.email,
    recipient.username || 'Player',
    requester.username || 'Someone',
    requester.walletAddress
  )
}

/**
 * Batch send example: Send to multiple users
 */
export async function batchSendAchievementNotifications(
  achievements: Array<{
    userId: string
    achievementId: string
  }>
) {
  const results = await Promise.allSettled(
    achievements.map((item) => onAchievementUnlocked(item.userId, item.achievementId))
  )

  const succeeded = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  return { succeeded, failed, total: achievements.length }
}
