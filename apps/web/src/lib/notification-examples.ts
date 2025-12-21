/**
 * Push Notification Integration Examples
 *
 * This file contains example implementations for sending push notifications
 * in various scenarios throughout the GrepCoin platform.
 */

import { sendToUser, sendToUsers, sendToAll } from './send-push'
import { NotificationType, createNotificationPayload } from './push-notifications'

// Achievement Unlock Notification
export async function notifyAchievementUnlock(
  userId: string,
  achievementName: string,
  reward: number
) {
  const notification = createNotificationPayload(
    NotificationType.ACHIEVEMENT,
    'Achievement Unlocked!',
    `You earned "${achievementName}" and ${reward} GREP!`,
    {
      icon: '/icon.svg',
      badge: '/icon.svg',
      url: '/achievements',
      data: {
        achievementName,
        reward,
      },
    }
  )

  return await sendToUser(userId, notification)
}

// GREP Token Reward Notification
export async function notifyRewardClaim(
  userId: string,
  amount: number,
  source: string
) {
  const notification = createNotificationPayload(
    NotificationType.REWARD,
    'GREP Earned!',
    `You received ${amount} GREP from ${source}`,
    {
      icon: '/icon.svg',
      badge: '/icon.svg',
      url: '/profile',
      data: {
        amount,
        source,
      },
    }
  )

  return await sendToUser(userId, notification)
}

// Friend Request Notification
export async function notifyFriendRequest(
  userId: string,
  fromUsername: string
) {
  const notification = createNotificationPayload(
    NotificationType.FRIEND,
    'New Friend Request',
    `${fromUsername} sent you a friend request`,
    {
      icon: '/icon.svg',
      badge: '/icon.svg',
      url: '/friends',
      data: {
        fromUsername,
      },
    }
  )

  return await sendToUser(userId, notification)
}

// Friend Request Accepted Notification
export async function notifyFriendAccepted(
  userId: string,
  username: string
) {
  const notification = createNotificationPayload(
    NotificationType.FRIEND,
    'Friend Request Accepted',
    `${username} accepted your friend request!`,
    {
      icon: '/icon.svg',
      badge: '/icon.svg',
      url: '/friends',
      data: {
        username,
      },
    }
  )

  return await sendToUser(userId, notification)
}

// Tournament Starting Notification
export async function notifyTournamentStart(
  participantIds: string[],
  tournamentName: string,
  tournamentId: string
) {
  const notification = createNotificationPayload(
    NotificationType.TOURNAMENT,
    'Tournament Starting!',
    `${tournamentName} is starting now. Good luck!`,
    {
      icon: '/icon.svg',
      badge: '/icon.svg',
      url: `/tournaments/${tournamentId}`,
      data: {
        tournamentName,
        tournamentId,
      },
    }
  )

  return await sendToUsers(participantIds, notification)
}

// Tournament Results Notification
export async function notifyTournamentResults(
  userId: string,
  tournamentName: string,
  rank: number,
  prize: number
) {
  const notification = createNotificationPayload(
    NotificationType.TOURNAMENT,
    'Tournament Results',
    `You ranked #${rank} in ${tournamentName} and won ${prize} GREP!`,
    {
      icon: '/icon.svg',
      badge: '/icon.svg',
      url: '/tournaments',
      data: {
        tournamentName,
        rank,
        prize,
      },
    }
  )

  return await sendToUser(userId, notification)
}

// Auction Outbid Notification
export async function notifyOutbid(
  userId: string,
  itemName: string,
  auctionId: string
) {
  const notification = createNotificationPayload(
    NotificationType.AUCTION,
    'You\'ve been outbid!',
    `Someone outbid you on ${itemName}`,
    {
      icon: '/icon.svg',
      badge: '/icon.svg',
      url: `/auctions/${auctionId}`,
      data: {
        itemName,
        auctionId,
      },
    }
  )

  return await sendToUser(userId, notification)
}

// Auction Won Notification
export async function notifyAuctionWon(
  userId: string,
  itemName: string,
  finalBid: number
) {
  const notification = createNotificationPayload(
    NotificationType.AUCTION,
    'Auction Won!',
    `You won ${itemName} for ${finalBid} GREP!`,
    {
      icon: '/icon.svg',
      badge: '/icon.svg',
      url: '/inventory',
      data: {
        itemName,
        finalBid,
      },
    }
  )

  return await sendToUser(userId, notification)
}

// Auction Ending Soon Notification
export async function notifyAuctionEndingSoon(
  userId: string,
  itemName: string,
  minutesLeft: number,
  auctionId: string
) {
  const notification = createNotificationPayload(
    NotificationType.AUCTION,
    'Auction Ending Soon',
    `${itemName} auction ends in ${minutesLeft} minutes!`,
    {
      icon: '/icon.svg',
      badge: '/icon.svg',
      url: `/auctions/${auctionId}`,
      data: {
        itemName,
        minutesLeft,
        auctionId,
      },
    }
  )

  return await sendToUser(userId, notification)
}

// Daily Reward Available Notification
export async function notifyDailyReward(userId: string, reward: number) {
  const notification = createNotificationPayload(
    NotificationType.REWARD,
    'Daily Reward Available!',
    `Claim your ${reward} GREP daily reward now!`,
    {
      icon: '/icon.svg',
      badge: '/icon.svg',
      url: '/rewards',
      data: {
        reward,
      },
    }
  )

  return await sendToUser(userId, notification)
}

// Season Ending Notification
export async function notifySeasonEnding(hoursLeft: number) {
  const notification = createNotificationPayload(
    NotificationType.SYSTEM,
    'Season Ending Soon',
    `Current season ends in ${hoursLeft} hours! Claim your rewards!`,
    {
      icon: '/icon.svg',
      badge: '/icon.svg',
      url: '/seasons',
      data: {
        hoursLeft,
      },
    }
  )

  return await sendToAll(notification, {
    batchSize: 100,
    delayBetweenBatches: 2000,
  })
}

// New Feature Announcement
export async function notifyNewFeature(
  title: string,
  description: string,
  url: string
) {
  const notification = createNotificationPayload(
    NotificationType.SYSTEM,
    title,
    description,
    {
      icon: '/icon.svg',
      badge: '/icon.svg',
      url,
    }
  )

  return await sendToAll(notification, {
    batchSize: 100,
    delayBetweenBatches: 2000,
  })
}

// Leaderboard Position Notification
export async function notifyLeaderboardPosition(
  userId: string,
  rank: number,
  category: string
) {
  const notification = createNotificationPayload(
    NotificationType.SYSTEM,
    'Leaderboard Update',
    `You're now ranked #${rank} in ${category}!`,
    {
      icon: '/icon.svg',
      badge: '/icon.svg',
      url: '/leaderboard',
      data: {
        rank,
        category,
      },
    }
  )

  return await sendToUser(userId, notification)
}

// Battle Pass Level Up Notification
export async function notifyBattlePassLevelUp(
  userId: string,
  level: number,
  rewards: string[]
) {
  const notification = createNotificationPayload(
    NotificationType.REWARD,
    'Battle Pass Level Up!',
    `You reached level ${level}! Claim your rewards: ${rewards.join(', ')}`,
    {
      icon: '/icon.svg',
      badge: '/icon.svg',
      url: '/battle-pass',
      data: {
        level,
        rewards,
      },
    }
  )

  return await sendToUser(userId, notification)
}

// Quest Completed Notification
export async function notifyQuestCompleted(
  userId: string,
  questName: string,
  reward: number
) {
  const notification = createNotificationPayload(
    NotificationType.ACHIEVEMENT,
    'Quest Completed!',
    `You completed "${questName}" and earned ${reward} GREP!`,
    {
      icon: '/icon.svg',
      badge: '/icon.svg',
      url: '/quests',
      data: {
        questName,
        reward,
      },
    }
  )

  return await sendToUser(userId, notification)
}

// Streak Milestone Notification
export async function notifyStreakMilestone(
  userId: string,
  days: number,
  bonus: number
) {
  const notification = createNotificationPayload(
    NotificationType.ACHIEVEMENT,
    'Streak Milestone!',
    `${days} day streak! You earned a ${bonus} GREP bonus!`,
    {
      icon: '/icon.svg',
      badge: '/icon.svg',
      url: '/profile',
      data: {
        days,
        bonus,
      },
    }
  )

  return await sendToUser(userId, notification)
}
