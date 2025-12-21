// GET /api/email/verify - Verify email with token
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { EmailType } from '@prisma/client'
import { sendEmail } from '@/lib/send-email'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head><title>Verification Error</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #ef4444;">Invalid Verification Link</h1>
          <p>The verification link is missing required parameters.</p>
        </body>
        </html>
        `,
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' },
        }
      )
    }

    // Find verification record
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!verification) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head><title>Verification Error</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #ef4444;">Invalid Token</h1>
          <p>This verification link is invalid or has already been used.</p>
        </body>
        </html>
        `,
        {
          status: 404,
          headers: { 'Content-Type': 'text/html' },
        }
      )
    }

    if (verification.email !== email) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head><title>Verification Error</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #ef4444;">Email Mismatch</h1>
          <p>The email address does not match the verification token.</p>
        </body>
        </html>
        `,
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' },
        }
      )
    }

    // Check if already verified
    if (verification.verified) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Already Verified</title>
          <meta http-equiv="refresh" content="3;url=${process.env.NEXT_PUBLIC_APP_URL || 'https://grepcoin.io'}/settings" />
        </head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #10b981;">Already Verified</h1>
          <p>This email has already been verified.</p>
          <p>Redirecting to settings...</p>
        </body>
        </html>
        `,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }
      )
    }

    // Check if expired
    if (new Date() > verification.expiresAt) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head><title>Verification Expired</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #f59e0b;">Verification Link Expired</h1>
          <p>This verification link has expired. Please request a new one.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://grepcoin.io'}/settings"
             style="display: inline-block; margin-top: 20px; padding: 12px 24px;
                    background: #10b981; color: white; text-decoration: none;
                    border-radius: 6px;">Go to Settings</a>
        </body>
        </html>
        `,
        {
          status: 410,
          headers: { 'Content-Type': 'text/html' },
        }
      )
    }

    // Verify the email
    await prisma.$transaction([
      // Mark verification as verified
      prisma.emailVerification.update({
        where: { id: verification.id },
        data: { verified: true },
      }),
      // Update email settings
      prisma.emailSettings.update({
        where: { userId: verification.userId },
        data: {
          email: verification.email,
          verified: true,
        },
      }),
    ])

    // Send welcome email
    try {
      await sendEmail(
        verification.email,
        EmailType.WELCOME,
        {
          username: verification.user.username || 'Player',
          walletAddress: verification.user.walletAddress,
        },
        {
          userId: verification.userId,
          skipPreferenceCheck: true, // Skip check for welcome email
        }
      )
    } catch (error) {
      console.error('Failed to send welcome email:', error)
      // Don't fail the verification if welcome email fails
    }

    // Return success page with redirect
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verified</title>
        <meta http-equiv="refresh" content="3;url=${process.env.NEXT_PUBLIC_APP_URL || 'https://grepcoin.io'}/settings" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
          }
          .container {
            text-align: center;
            background: #1e293b;
            padding: 50px;
            border-radius: 12px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          .checkmark {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: #10b981;
            display: inline-block;
            margin-bottom: 20px;
            position: relative;
          }
          .checkmark:after {
            content: '✓';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 48px;
          }
          h1 { color: #10b981; margin: 20px 0; }
          p { color: #94a3b8; font-size: 16px; }
          .email { color: #10b981; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="checkmark"></div>
          <h1>Email Verified!</h1>
          <p>Your email <span class="email">${verification.email}</span> has been successfully verified.</p>
          <p style="margin-top: 30px;">Redirecting to settings in 3 seconds...</p>
        </div>
      </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }
    )
  } catch (error: any) {
    console.error('Error in /api/email/verify:', error)
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head><title>Verification Error</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #ef4444;">Verification Error</h1>
        <p>An error occurred while verifying your email.</p>
        <p style="color: #64748b; font-size: 14px;">${error.message}</p>
      </body>
      </html>
      `,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      }
    )
  }
}
