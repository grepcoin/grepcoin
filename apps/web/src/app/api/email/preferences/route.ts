// GET/PUT /api/email/preferences - Manage email preferences
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Fetch email preferences
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      include: { emailSettings: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return email settings or defaults
    if (!user.emailSettings) {
      return NextResponse.json({
        email: null,
        verified: false,
        preferences: {
          welcomeEnabled: true,
          weeklyDigestEnabled: true,
          achievementEnabled: true,
          rewardClaimEnabled: true,
          tournamentStartEnabled: true,
          friendRequestEnabled: true,
          unsubscribedAll: false,
        },
      })
    }

    return NextResponse.json({
      email: user.emailSettings.email,
      verified: user.emailSettings.verified,
      preferences: {
        welcomeEnabled: user.emailSettings.welcomeEnabled,
        weeklyDigestEnabled: user.emailSettings.weeklyDigestEnabled,
        achievementEnabled: user.emailSettings.achievementEnabled,
        rewardClaimEnabled: user.emailSettings.rewardClaimEnabled,
        tournamentStartEnabled: user.emailSettings.tournamentStartEnabled,
        friendRequestEnabled: user.emailSettings.friendRequestEnabled,
        unsubscribedAll: user.emailSettings.unsubscribedAll,
      },
    })
  } catch (error: any) {
    console.error('Error in GET /api/email/preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update email preferences
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, preferences } = body

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Invalid preferences object' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      include: { emailSettings: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.emailSettings) {
      return NextResponse.json(
        { error: 'No email settings found. Please add an email first.' },
        { status: 400 }
      )
    }

    // Build update object with only valid fields
    const updateData: any = {}

    if (typeof preferences.welcomeEnabled === 'boolean') {
      updateData.welcomeEnabled = preferences.welcomeEnabled
    }
    if (typeof preferences.weeklyDigestEnabled === 'boolean') {
      updateData.weeklyDigestEnabled = preferences.weeklyDigestEnabled
    }
    if (typeof preferences.achievementEnabled === 'boolean') {
      updateData.achievementEnabled = preferences.achievementEnabled
    }
    if (typeof preferences.rewardClaimEnabled === 'boolean') {
      updateData.rewardClaimEnabled = preferences.rewardClaimEnabled
    }
    if (typeof preferences.tournamentStartEnabled === 'boolean') {
      updateData.tournamentStartEnabled = preferences.tournamentStartEnabled
    }
    if (typeof preferences.friendRequestEnabled === 'boolean') {
      updateData.friendRequestEnabled = preferences.friendRequestEnabled
    }
    if (typeof preferences.unsubscribedAll === 'boolean') {
      updateData.unsubscribedAll = preferences.unsubscribedAll
    }

    // Update email settings
    const updatedSettings = await prisma.emailSettings.update({
      where: { userId: user.id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: 'Preferences updated',
      preferences: {
        welcomeEnabled: updatedSettings.welcomeEnabled,
        weeklyDigestEnabled: updatedSettings.weeklyDigestEnabled,
        achievementEnabled: updatedSettings.achievementEnabled,
        rewardClaimEnabled: updatedSettings.rewardClaimEnabled,
        tournamentStartEnabled: updatedSettings.tournamentStartEnabled,
        friendRequestEnabled: updatedSettings.friendRequestEnabled,
        unsubscribedAll: updatedSettings.unsubscribedAll,
      },
    })
  } catch (error: any) {
    console.error('Error in PUT /api/email/preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Remove email (unsubscribe completely)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      include: { emailSettings: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.emailSettings) {
      return NextResponse.json({
        success: true,
        message: 'No email settings to remove',
      })
    }

    // Delete email settings
    await prisma.emailSettings.delete({
      where: { userId: user.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Email removed successfully',
    })
  } catch (error: any) {
    console.error('Error in DELETE /api/email/preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
