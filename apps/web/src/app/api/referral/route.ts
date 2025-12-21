import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { cookies } from 'next/headers'
import { nanoid } from 'nanoid'
import { parseSessionToken } from '@/lib/auth'

const REFERRAL_BONUS = 100 // GREP bonus for new user
const REFERRER_PERCENTAGE = 10 // % of referee's earnings
const MAX_REFERRAL_REWARD = 5000 // Max GREP from single referral
const REFERRAL_DURATION_DAYS = 30

// Generate a unique referral code
function generateReferralCode(): string {
  return nanoid(8).toUpperCase()
}

// GET - Get user's referral info
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const session = parseSessionToken(sessionToken)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    let user = await prisma.user.findUnique({
      where: { walletAddress: session.address },
      include: {
        referralsMade: {
          include: {
            referee: {
              select: {
                username: true,
                walletAddress: true,
                createdAt: true,
              },
            },
          },
        },
        referredBy: {
          include: {
            referrer: {
              select: {
                username: true,
                walletAddress: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate referral code if user doesn't have one
    if (!user.referralCode) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { referralCode: generateReferralCode() },
        include: {
          referralsMade: {
            include: {
              referee: {
                select: {
                  username: true,
                  walletAddress: true,
                  createdAt: true,
                },
              },
            },
          },
          referredBy: {
            include: {
              referrer: {
                select: {
                  username: true,
                  walletAddress: true,
                },
              },
            },
          },
        },
      })
    }

    // Calculate total earned from referrals
    const totalEarnedFromReferrals = user.referralsMade.reduce(
      (sum, ref) => sum + ref.rewardPaid,
      0
    )

    // Count active referrals (within 30 days)
    const now = new Date()
    const activeReferrals = user.referralsMade.filter(
      (ref) => ref.expiresAt > now && ref.rewardPaid < ref.maxReward
    )

    return NextResponse.json({
      referralCode: user.referralCode,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://grepcoin.com'}?ref=${user.referralCode}`,
      totalReferrals: user.referralsMade.length,
      activeReferrals: activeReferrals.length,
      totalEarned: totalEarnedFromReferrals,
      referrals: user.referralsMade.map((ref) => ({
        referee: ref.referee.username || `${ref.referee.walletAddress.slice(0, 6)}...${ref.referee.walletAddress.slice(-4)}`,
        rewardPaid: ref.rewardPaid,
        maxReward: ref.maxReward,
        createdAt: ref.createdAt,
        expiresAt: ref.expiresAt,
        isActive: ref.expiresAt > now && ref.rewardPaid < ref.maxReward,
      })),
      referredBy: user.referredBy
        ? {
            referrer: user.referredBy.referrer.username ||
              `${user.referredBy.referrer.walletAddress.slice(0, 6)}...${user.referredBy.referrer.walletAddress.slice(-4)}`,
            bonusReceived: REFERRAL_BONUS,
          }
        : null,
    })
  } catch (error) {
    console.error('Referral GET error:', error)
    return NextResponse.json(
      { error: 'Failed to get referral info' },
      { status: 500 }
    )
  }
}

// POST - Apply referral code (for new users)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const session = parseSessionToken(sessionToken)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: session.address },
      include: { referredBy: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already has a referrer
    if (user.referredBy) {
      return NextResponse.json(
        { error: 'You have already been referred' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ error: 'Referral code required' }, { status: 400 })
    }

    // Find referrer by code
    const referrer = await prisma.user.findUnique({
      where: { referralCode: code.toUpperCase() },
    })

    if (!referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
    }

    // Can't refer yourself
    if (referrer.id === user.id) {
      return NextResponse.json({ error: 'Cannot use your own referral code' }, { status: 400 })
    }

    // Create referral relationship
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + REFERRAL_DURATION_DAYS)

    const referral = await prisma.referral.create({
      data: {
        referrerId: referrer.id,
        refereeId: user.id,
        code: `${code.toUpperCase()}-${user.id.slice(0, 6)}`,
        maxReward: MAX_REFERRAL_REWARD,
        expiresAt,
      },
    })

    // Give referee welcome bonus
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.dailyStats.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      update: {
        grepEarned: { increment: REFERRAL_BONUS },
      },
      create: {
        userId: user.id,
        date: today,
        grepEarned: REFERRAL_BONUS,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'reward',
        wallet: session.address,
        username: user.username,
        value: REFERRAL_BONUS,
        message: `Welcome bonus from referral: ${REFERRAL_BONUS} GREP`,
        icon: '🎉',
      },
    })

    return NextResponse.json({
      success: true,
      bonus: REFERRAL_BONUS,
      referrer: referrer.username || `${referrer.walletAddress.slice(0, 6)}...${referrer.walletAddress.slice(-4)}`,
      message: `You received ${REFERRAL_BONUS} GREP welcome bonus!`,
    })
  } catch (error) {
    console.error('Referral POST error:', error)
    return NextResponse.json(
      { error: 'Failed to apply referral code' },
      { status: 500 }
    )
  }
}
