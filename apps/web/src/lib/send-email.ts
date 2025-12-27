// Server-side Email Sender for GrepCoin
import { EmailType } from '@prisma/client'
import { prisma } from './db'
import { resend, EMAIL_CONFIG, getEmailSubject, canSendEmailType, EmailTemplateData } from './email'
import {
  welcomeEmail,
  weeklyDigestEmail,
  achievementEmail,
  rewardClaimEmail,
  tournamentEmail,
  friendRequestEmail,
  verificationEmail,
} from './email-templates'

// Send email function
export async function sendEmail<T extends EmailType>(
  to: string,
  emailType: T,
  data: EmailTemplateData[T],
  options?: {
    userId?: string
    skipPreferenceCheck?: boolean
  }
): Promise<{ success: boolean; error?: string; emailId?: string }> {
  try {
    // Validate email configuration
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return { success: false, error: 'Email service not configured' }
    }

    // Check user preferences if userId provided
    if (options?.userId && !options?.skipPreferenceCheck) {
      const settings = await prisma.emailSettings.findUnique({
        where: { userId: options.userId },
      })

      if (!settings?.email || !settings.verified) {
        return { success: false, error: 'Email not verified' }
      }

      if (!canSendEmailType(emailType, settings)) {
        return { success: false, error: 'User unsubscribed from this email type' }
      }
    }

    // Generate email content
    const subject = getEmailSubject(emailType, data)
    const htmlContent = generateEmailHTML(emailType, data)

    // Add unsubscribe URL to HTML
    const unsubscribeUrl = options?.userId
      ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://grepcoin.io'}/settings?tab=email&unsubscribe=true`
      : ''
    const finalHTML = htmlContent.replace('{{UNSUBSCRIBE_URL}}', unsubscribeUrl)

    // Queue email in database
    const emailQueue = await prisma.emailQueue.create({
      data: {
        userId: options?.userId,
        email: to,
        emailType,
        subject,
        htmlContent: finalHTML,
        data: data as object,
        status: 'PENDING',
      },
    })

    // Send via Resend
    try {
      await resend.emails.send({
        from: EMAIL_CONFIG.FROM_EMAIL,
        to,
        subject,
        html: finalHTML,
      })

      // Update queue status
      await prisma.emailQueue.update({
        where: { id: emailQueue.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      })

      return { success: true, emailId: emailQueue.id }
    } catch (sendError: unknown) {
      console.error('Failed to send email:', sendError)

      // Update queue with error
      await prisma.emailQueue.update({
        where: { id: emailQueue.id },
        data: {
          status: 'FAILED',
          attempts: { increment: 1 },
          lastError: sendError instanceof Error ? sendError.message : 'Unknown error',
        },
      })

      return { success: false, error: sendError instanceof Error ? sendError.message : 'Failed to send' }
    }
  } catch (error: unknown) {
    console.error('Error in sendEmail:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Generate HTML content based on email type
function generateEmailHTML<T extends EmailType>(
  emailType: T,
  data: EmailTemplateData[T]
): string {
  switch (emailType) {
    case EmailType.WELCOME:
      return welcomeEmail(data as any)
    case EmailType.WEEKLY_DIGEST:
      return weeklyDigestEmail(data as any)
    case EmailType.ACHIEVEMENT:
      return achievementEmail(data as any)
    case EmailType.REWARD_CLAIM:
      return rewardClaimEmail(data as any)
    case EmailType.TOURNAMENT_START:
      return tournamentEmail(data as any)
    case EmailType.FRIEND_REQUEST:
      return friendRequestEmail(data as any)
    default:
      throw new Error(`Unknown email type: ${emailType}`)
  }
}

// Send verification email
export async function sendVerificationEmail(
  userId: string,
  email: string,
  username: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const subject = 'Verify your GrepCoin email address'
    const htmlContent = verificationEmail(username, token, email)
    const finalHTML = htmlContent.replace(
      '{{UNSUBSCRIBE_URL}}',
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://grepcoin.io'}/settings?tab=email`
    )

    // Queue email
    const emailQueue = await prisma.emailQueue.create({
      data: {
        userId,
        email,
        emailType: EmailType.WELCOME, // Using WELCOME as verification type
        subject,
        htmlContent: finalHTML,
        status: 'PENDING',
      },
    })

    // Send via Resend
    try {
      await resend.emails.send({
        from: EMAIL_CONFIG.FROM_EMAIL,
        to: email,
        subject,
        html: finalHTML,
      })

      await prisma.emailQueue.update({
        where: { id: emailQueue.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      })

      return { success: true }
    } catch (sendError: any) {
      await prisma.emailQueue.update({
        where: { id: emailQueue.id },
        data: {
          status: 'FAILED',
          attempts: { increment: 1 },
          lastError: sendError.message,
        },
      })

      return { success: false, error: sendError.message }
    }
  } catch (error: any) {
    console.error('Error sending verification email:', error)
    return { success: false, error: error.message }
  }
}

// Send weekly digests (for cron job)
export async function sendWeeklyDigests(): Promise<{
  sent: number
  failed: number
  errors: string[]
}> {
  const results = { sent: 0, failed: 0, errors: [] as string[] }

  try {
    // Get all users with verified emails and weekly digest enabled
    const users = await prisma.user.findMany({
      where: {
        emailSettings: {
          verified: true,
          weeklyDigestEnabled: true,
          unsubscribedAll: false,
        },
      },
      include: {
        emailSettings: true,
      },
    })

    console.log(`Sending weekly digests to ${users.length} users`)

    // Calculate date range for the week
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)

    // Process each user
    for (const user of users) {
      try {
        if (!user.emailSettings?.email) continue

        // Fetch user stats for the week
        const stats = await prisma.dailyStats.aggregate({
          where: {
            userId: user.id,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: {
            grepEarned: true,
            gamesPlayed: true,
          },
          _max: {
            bestStreak: true,
          },
        })

        // Fetch new achievements from the week
        const achievements = await prisma.userAchievement.findMany({
          where: {
            userId: user.id,
            unlockedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            achievement: true,
          },
          take: 5,
        })

        // Get leaderboard rank (simplified - you can enhance this)
        const rank = await prisma.gameScore
          .groupBy({
            by: ['userId'],
            _sum: {
              grepEarned: true,
            },
            orderBy: {
              _sum: {
                grepEarned: 'desc',
              },
            },
          })
          .then((rankings) => {
            const userRankIndex = rankings.findIndex((r) => r.userId === user.id)
            return userRankIndex >= 0 ? userRankIndex + 1 : 999
          })

        // Calculate total rewards
        const totalEarned = stats._sum.grepEarned || 0
        const gamesPlayed = stats._sum.gamesPlayed || 0
        const bestStreak = stats._max.bestStreak || 0

        // Send digest email
        const result = await sendEmail(
          user.emailSettings.email,
          EmailType.WEEKLY_DIGEST,
          {
            username: user.username || 'Player',
            stats: {
              grepEarned: totalEarned,
              gamesPlayed,
              bestStreak,
              rank,
            },
            achievements: achievements.map((ua) => ({
              name: ua.achievement.name,
              icon: ua.achievement.icon,
              reward: ua.achievement.reward,
            })),
            rewards: {
              totalEarned,
              availableToClaim: 0, // You can fetch from rewards table
            },
          },
          { userId: user.id }
        )

        if (result.success) {
          results.sent++
        } else {
          results.failed++
          results.errors.push(`${user.username}: ${result.error}`)
        }
      } catch (error: any) {
        console.error(`Error sending digest to ${user.username}:`, error)
        results.failed++
        results.errors.push(`${user.username}: ${error.message}`)
      }
    }
  } catch (error: any) {
    console.error('Error in sendWeeklyDigests:', error)
    results.errors.push(`Global error: ${error.message}`)
  }

  return results
}

// Retry failed emails
export async function retryFailedEmails(): Promise<{
  retried: number
  succeeded: number
  failed: number
}> {
  const results = { retried: 0, succeeded: 0, failed: 0 }

  try {
    // Get failed emails that haven't exceeded max attempts
    const failedEmails = await prisma.emailQueue.findMany({
      where: {
        status: 'FAILED',
        attempts: {
          lt: EMAIL_CONFIG.MAX_SEND_ATTEMPTS,
        },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      take: 50, // Process 50 at a time
    })

    for (const email of failedEmails) {
      results.retried++

      try {
        await resend.emails.send({
          from: EMAIL_CONFIG.FROM_EMAIL,
          to: email.email,
          subject: email.subject,
          html: email.htmlContent,
        })

        await prisma.emailQueue.update({
          where: { id: email.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
          },
        })

        results.succeeded++
      } catch (error: any) {
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: {
            attempts: { increment: 1 },
            lastError: error.message,
          },
        })

        results.failed++
      }
    }
  } catch (error) {
    console.error('Error retrying failed emails:', error)
  }

  return results
}
