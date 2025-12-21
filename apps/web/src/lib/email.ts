// Email Utilities and Types for GrepCoin
import { Resend } from 'resend'
import { EmailType } from '@prisma/client'

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
export const EMAIL_CONFIG = {
  FROM_EMAIL: process.env.EMAIL_FROM || 'GrepCoin <noreply@grepcoin.io>',
  SUPPORT_EMAIL: 'support@grepcoin.io',
  VERIFICATION_EXPIRY_HOURS: 24,
  MAX_SEND_ATTEMPTS: 3,
  RATE_LIMIT: {
    VERIFICATION: { max: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
    GENERAL: { max: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  },
}

// Email template data types
export interface WelcomeEmailData {
  username: string
  walletAddress: string
}

export interface WeeklyDigestData {
  username: string
  stats: {
    grepEarned: number
    gamesPlayed: number
    bestStreak: number
    rank: number
  }
  achievements: Array<{
    name: string
    icon: string
    reward: number
  }>
  rewards: {
    totalEarned: number
    availableToClaim: number
  }
}

export interface AchievementEmailData {
  username: string
  achievement: {
    name: string
    description: string
    icon: string
    rarity: string
    reward: number
  }
}

export interface RewardClaimData {
  username: string
  amount: number
  claimUrl: string
}

export interface TournamentEmailData {
  username: string
  tournament: {
    name: string
    gameSlug: string
    startTime: Date
    endTime: Date
    prizePool: number
    entryFee: number
  }
}

export interface FriendRequestData {
  username: string
  friendUsername: string
  friendWallet: string
}

// Email type to template data mapping
export type EmailTemplateData = {
  [EmailType.WELCOME]: WelcomeEmailData
  [EmailType.WEEKLY_DIGEST]: WeeklyDigestData
  [EmailType.ACHIEVEMENT]: AchievementEmailData
  [EmailType.REWARD_CLAIM]: RewardClaimData
  [EmailType.TOURNAMENT_START]: TournamentEmailData
  [EmailType.FRIEND_REQUEST]: FriendRequestData
}

// Rate limiting helper
interface RateLimitStore {
  [key: string]: {
    count: number
    resetAt: number
  }
}

const rateLimitStore: RateLimitStore = {}

export function checkRateLimit(
  identifier: string,
  type: 'VERIFICATION' | 'GENERAL'
): { allowed: boolean; resetAt?: Date } {
  const config = EMAIL_CONFIG.RATE_LIMIT[type]
  const now = Date.now()
  const key = `${type}:${identifier}`

  // Clean up expired entries
  if (rateLimitStore[key] && rateLimitStore[key].resetAt < now) {
    delete rateLimitStore[key]
  }

  // Check current limit
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = {
      count: 1,
      resetAt: now + config.windowMs,
    }
    return { allowed: true }
  }

  if (rateLimitStore[key].count >= config.max) {
    return {
      allowed: false,
      resetAt: new Date(rateLimitStore[key].resetAt),
    }
  }

  rateLimitStore[key].count++
  return { allowed: true }
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Generate verification token
export function generateVerificationToken(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return token
}

// Get email subject by type
export function getEmailSubject(type: EmailType, data?: any): string {
  switch (type) {
    case EmailType.WELCOME:
      return 'Welcome to GrepCoin!'
    case EmailType.WEEKLY_DIGEST:
      return `Your Weekly GrepCoin Report - ${data?.stats?.grepEarned || 0} GREP Earned`
    case EmailType.ACHIEVEMENT:
      return `Achievement Unlocked: ${data?.achievement?.name || 'New Achievement'}!`
    case EmailType.REWARD_CLAIM:
      return `${data?.amount || 0} GREP Ready to Claim!`
    case EmailType.TOURNAMENT_START:
      return `Tournament Starting: ${data?.tournament?.name || 'Join Now'}!`
    case EmailType.FRIEND_REQUEST:
      return `${data?.friendUsername || 'Someone'} wants to be your friend on GrepCoin`
    default:
      return 'GrepCoin Notification'
  }
}

// Check if user has email preferences that allow this type
export function canSendEmailType(
  emailType: EmailType,
  preferences: {
    welcomeEnabled: boolean
    weeklyDigestEnabled: boolean
    achievementEnabled: boolean
    rewardClaimEnabled: boolean
    tournamentStartEnabled: boolean
    friendRequestEnabled: boolean
    unsubscribedAll: boolean
  }
): boolean {
  if (preferences.unsubscribedAll) return false

  const typeMap = {
    [EmailType.WELCOME]: preferences.welcomeEnabled,
    [EmailType.WEEKLY_DIGEST]: preferences.weeklyDigestEnabled,
    [EmailType.ACHIEVEMENT]: preferences.achievementEnabled,
    [EmailType.REWARD_CLAIM]: preferences.rewardClaimEnabled,
    [EmailType.TOURNAMENT_START]: preferences.tournamentStartEnabled,
    [EmailType.FRIEND_REQUEST]: preferences.friendRequestEnabled,
  }

  return typeMap[emailType] ?? false
}
