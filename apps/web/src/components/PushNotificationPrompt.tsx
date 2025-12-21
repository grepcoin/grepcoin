'use client'

import { useState } from 'react'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { Bell, BellOff, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface PushNotificationPromptProps {
  userId?: string
  onClose?: () => void
}

export default function PushNotificationPrompt({ userId, onClose }: PushNotificationPromptProps) {
  const {
    isSubscribed,
    isLoading,
    error,
    isSupported,
    isGranted,
    subscribeToPush,
    unsubscribeFromPush,
  } = usePushNotifications(userId)

  const [showBenefits, setShowBenefits] = useState(!isSubscribed)

  if (!isSupported) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              Notifications Not Supported
            </h3>
            <p className="text-gray-400 text-sm">
              Your browser does not support push notifications.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribeFromPush()
    } else {
      const success = await subscribeToPush()
      if (success) {
        setShowBenefits(false)
      }
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <div className="p-2 bg-emerald-600/20 rounded-lg">
              <Bell className="w-5 h-5 text-emerald-500" />
            </div>
          ) : (
            <div className="p-2 bg-gray-700 rounded-lg">
              <BellOff className="w-5 h-5 text-gray-400" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-white">Push Notifications</h3>
            <p className="text-sm text-gray-400">
              {isSubscribed ? 'Enabled' : 'Get notified about important events'}
            </p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`w-12 h-6 rounded-full transition-colors ${
            isSubscribed ? 'bg-emerald-600' : 'bg-gray-600'
          } ${isLoading ? 'opacity-50' : ''}`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
              isSubscribed ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Benefits Section */}
      {showBenefits && !isSubscribed && (
        <div className="space-y-3 mb-4">
          <p className="text-gray-300 text-sm font-medium">Get notified about:</p>
          <div className="space-y-2">
            <BenefitItem icon="🏆" text="Achievement unlocks and rewards" />
            <BenefitItem icon="💎" text="GREP token earnings and bonuses" />
            <BenefitItem icon="👥" text="Friend requests and challenges" />
            <BenefitItem icon="🎯" text="Tournament starts and results" />
            <BenefitItem icon="📢" text="Important system announcements" />
          </div>
        </div>
      )}

      {/* Status Message */}
      {isSubscribed && (
        <div className="flex items-center gap-2 p-3 bg-emerald-600/10 border border-emerald-600/20 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <p className="text-emerald-400 text-sm">
            You will receive notifications on this device
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-600/10 border border-red-600/20 rounded-lg">
          <XCircle className="w-4 h-4 text-red-500" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Action Button */}
      {!isSubscribed && (
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold text-white transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Enabling...' : 'Enable Notifications'}
        </button>
      )}
    </div>
  )
}

function BenefitItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <span className="text-gray-300 text-sm">{text}</span>
    </div>
  )
}
