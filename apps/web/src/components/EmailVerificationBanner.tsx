// Email Verification Banner Component
'use client'

import { useState, useEffect } from 'react'
import { useEmailStatus } from '@/hooks/useEmailPreferences'

interface EmailVerificationBannerProps {
  onResend?: () => Promise<{ success: boolean; error?: string } | void>
  onDismiss?: () => void
}

export default function EmailVerificationBanner({
  onResend,
  onDismiss,
}: EmailVerificationBannerProps) {
  const { email, verified, loading } = useEmailStatus()
  const [dismissed, setDismissed] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  // Check if banner was previously dismissed (in session storage)
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('emailVerificationDismissed')
    if (wasDismissed) {
      setDismissed(true)
    }
  }, [])

  // Don't show banner if:
  // - Still loading
  // - No email set
  // - Email already verified
  // - User dismissed the banner
  if (loading || !email || verified || dismissed) {
    return null
  }

  const handleResend = async () => {
    setResending(true)
    setResendMessage(null)

    try {
      if (onResend) {
        await onResend()
        setResendMessage('Verification email sent! Check your inbox.')
      }
    } catch (error: any) {
      setResendMessage(error.message || 'Failed to resend email')
    } finally {
      setResending(false)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('emailVerificationDismissed', 'true')
    if (onDismiss) {
      onDismiss()
    }
  }

  return (
    <div className="bg-gradient-to-r from-emerald-900/50 to-emerald-800/50 border border-emerald-700/50 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-5 h-5 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h3 className="font-semibold text-emerald-100">
              Verify Your Email
            </h3>
          </div>
          <p className="text-sm text-emerald-200/90 mb-3">
            We sent a verification link to <strong>{email}</strong>. Please
            check your inbox and click the link to enable email notifications.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm font-medium text-emerald-300 hover:text-emerald-200
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {resending ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>

          {resendMessage && (
            <p
              className={`text-sm mt-2 ${
                resendMessage.includes('sent')
                  ? 'text-emerald-300'
                  : 'text-red-300'
              }`}
            >
              {resendMessage}
            </p>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="text-emerald-400 hover:text-emerald-300 transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
