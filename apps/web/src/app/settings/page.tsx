'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import PushNotificationPrompt from '@/components/PushNotificationPrompt'
import { usePushNotifications, useNotificationPreferences } from '@/hooks/usePushNotifications'
import { NotificationType, createNotificationPayload } from '@/lib/push-notifications'
import { Bell, Mail, CheckCircle, XCircle } from 'lucide-react'
import { useEmailPreferences } from '@/hooks/useEmailPreferences'
import EmailVerificationBanner from '@/components/EmailVerificationBanner'

interface UserSettings {
  displayName: string
  avatar: string
  soundEnabled: boolean
  notificationsEnabled: boolean
  theme: 'dark' | 'light' | 'system'
}

export default function SettingsPage() {
  const { address, isConnected } = useAccount()
  const [settings, setSettings] = useState<UserSettings>({
    displayName: '',
    avatar: '',
    soundEnabled: true,
    notificationsEnabled: true,
    theme: 'dark'
  })
  const [userId, setUserId] = useState<string>()
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [testingNotification, setTestingNotification] = useState(false)

  const { isSubscribed } = usePushNotifications(userId)
  const { preferences, updatePreferences } = useNotificationPreferences(userId)

  // Email preferences
  const {
    status: emailStatus,
    loading: emailLoading,
    subscribeEmail,
    updatePreferences: updateEmailPreferences,
    resendVerification,
    unsubscribeAll,
  } = useEmailPreferences()

  const [emailInput, setEmailInput] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)

  useEffect(() => {
    if (isConnected) {
      fetch('/api/users/settings')
        .then(res => res.json())
        .then(data => {
          if (data.settings) setSettings(data.settings)
          if (data.userId) setUserId(data.userId)
        })
    }
  }, [isConnected])

  const handleTestNotification = async () => {
    if (!isSubscribed) {
      setMessage('Please enable push notifications first')
      return
    }

    setTestingNotification(true)
    setMessage('')

    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        setMessage('Test notification sent! Check your notifications.')
      } else {
        setMessage('Failed to send test notification')
      }
    } catch {
      setMessage('Error sending test notification')
    } finally {
      setTestingNotification(false)
    }
  }

  const handleEmailSubscribe = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      setEmailMessage('Please enter a valid email address')
      return
    }

    setEmailSaving(true)
    setEmailMessage('')

    const result = await subscribeEmail(emailInput)
    if (result.success) {
      setEmailMessage('Verification email sent! Check your inbox.')
      setEmailInput('')
    } else {
      setEmailMessage(result.error || 'Failed to send verification email')
    }

    setEmailSaving(false)
  }

  const handleEmailPreferenceToggle = async (key: string, value: boolean) => {
    const result = await updateEmailPreferences({ [key]: value })
    if (!result.success) {
      setEmailMessage(result.error || 'Failed to update preferences')
    }
  }

  const handleUnsubscribeAll = async () => {
    if (!confirm('Are you sure you want to remove your email and unsubscribe from all notifications?')) {
      return
    }

    setEmailSaving(true)
    const result = await unsubscribeAll()
    if (result.success) {
      setEmailMessage('Successfully unsubscribed from all emails')
    } else {
      setEmailMessage(result.error || 'Failed to unsubscribe')
    }
    setEmailSaving(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (res.ok) {
        setMessage('Settings saved successfully!')
      } else {
        setMessage('Failed to save settings')
      }
    } catch {
      setMessage('Error saving settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Please connect your wallet to access settings
      </div>
    )
  }

  const avatars = ['🎮', '🚀', '💎', '🔥', '⚡', '🎯', '🏆', '👾']

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Display Name */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Profile</h2>
            <label className="block mb-4">
              <span className="text-gray-400 mb-2 block">Display Name</span>
              <input
                type="text"
                value={settings.displayName}
                onChange={e => setSettings(s => ({ ...s, displayName: e.target.value }))}
                placeholder="Enter display name"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                maxLength={20}
              />
            </label>

            <div>
              <span className="text-gray-400 mb-2 block">Avatar</span>
              <div className="flex gap-2 flex-wrap">
                {avatars.map(avatar => (
                  <button
                    key={avatar}
                    onClick={() => setSettings(s => ({ ...s, avatar }))}
                    className={`text-2xl p-2 rounded-lg ${
                      settings.avatar === avatar
                        ? 'bg-emerald-600 ring-2 ring-emerald-400'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Preferences</h2>

            <label className="flex items-center justify-between mb-4">
              <span>Sound Effects</span>
              <button
                onClick={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.soundEnabled ? 'bg-emerald-600' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </label>

            <label className="flex items-center justify-between mb-4">
              <span>Notifications</span>
              <button
                onClick={() => setSettings(s => ({ ...s, notificationsEnabled: !s.notificationsEnabled }))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.notificationsEnabled ? 'bg-emerald-600' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                  settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </label>

            <div>
              <span className="text-gray-400 mb-2 block">Theme</span>
              <div className="flex gap-2">
                {(['dark', 'light', 'system'] as const).map(theme => (
                  <button
                    key={theme}
                    onClick={() => setSettings(s => ({ ...s, theme }))}
                    className={`px-4 py-2 rounded-lg capitalize ${
                      settings.theme === theme
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold">Email Notifications</h2>
            </div>

            {emailStatus?.email && !emailStatus.verified && (
              <EmailVerificationBanner onResend={resendVerification} />
            )}

            {!emailStatus?.email ? (
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">
                  Add your email to receive weekly digests, achievement notifications, and more.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                  <button
                    onClick={handleEmailSubscribe}
                    disabled={emailSaving}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium disabled:opacity-50"
                  >
                    {emailSaving ? 'Adding...' : 'Add Email'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{emailStatus.email}</span>
                  </div>
                  {emailStatus.verified ? (
                    <div className="flex items-center gap-1 text-emerald-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-yellow-400 text-sm">
                      <XCircle className="w-4 h-4" />
                      Not Verified
                    </div>
                  )}
                </div>

                {emailStatus.verified && (
                  <>
                    <div className="pt-4 border-t border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-300 mb-3">
                        Email Types
                      </h3>

                      <div className="space-y-3">
                        <label className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-300">Welcome Emails</span>
                            <p className="text-xs text-gray-500">Get started guides and tips</p>
                          </div>
                          <button
                            onClick={() =>
                              handleEmailPreferenceToggle(
                                'welcomeEnabled',
                                !emailStatus.preferences.welcomeEnabled
                              )
                            }
                            className={`w-12 h-6 rounded-full transition-colors ${
                              emailStatus.preferences.welcomeEnabled
                                ? 'bg-emerald-600'
                                : 'bg-gray-600'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                                emailStatus.preferences.welcomeEnabled
                                  ? 'translate-x-6'
                                  : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </label>

                        <label className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-300">Weekly Digest</span>
                            <p className="text-xs text-gray-500">
                              Summary of your stats and achievements
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleEmailPreferenceToggle(
                                'weeklyDigestEnabled',
                                !emailStatus.preferences.weeklyDigestEnabled
                              )
                            }
                            className={`w-12 h-6 rounded-full transition-colors ${
                              emailStatus.preferences.weeklyDigestEnabled
                                ? 'bg-emerald-600'
                                : 'bg-gray-600'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                                emailStatus.preferences.weeklyDigestEnabled
                                  ? 'translate-x-6'
                                  : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </label>

                        <label className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-300">Achievement Unlocked</span>
                            <p className="text-xs text-gray-500">
                              Get notified when you unlock achievements
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleEmailPreferenceToggle(
                                'achievementEnabled',
                                !emailStatus.preferences.achievementEnabled
                              )
                            }
                            className={`w-12 h-6 rounded-full transition-colors ${
                              emailStatus.preferences.achievementEnabled
                                ? 'bg-emerald-600'
                                : 'bg-gray-600'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                                emailStatus.preferences.achievementEnabled
                                  ? 'translate-x-6'
                                  : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </label>

                        <label className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-300">Reward Claims</span>
                            <p className="text-xs text-gray-500">
                              When you have GREP ready to claim
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleEmailPreferenceToggle(
                                'rewardClaimEnabled',
                                !emailStatus.preferences.rewardClaimEnabled
                              )
                            }
                            className={`w-12 h-6 rounded-full transition-colors ${
                              emailStatus.preferences.rewardClaimEnabled
                                ? 'bg-emerald-600'
                                : 'bg-gray-600'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                                emailStatus.preferences.rewardClaimEnabled
                                  ? 'translate-x-6'
                                  : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </label>

                        <label className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-300">Tournament Starts</span>
                            <p className="text-xs text-gray-500">
                              When tournaments are about to begin
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleEmailPreferenceToggle(
                                'tournamentStartEnabled',
                                !emailStatus.preferences.tournamentStartEnabled
                              )
                            }
                            className={`w-12 h-6 rounded-full transition-colors ${
                              emailStatus.preferences.tournamentStartEnabled
                                ? 'bg-emerald-600'
                                : 'bg-gray-600'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                                emailStatus.preferences.tournamentStartEnabled
                                  ? 'translate-x-6'
                                  : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </label>

                        <label className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-300">Friend Requests</span>
                            <p className="text-xs text-gray-500">
                              When someone wants to connect
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleEmailPreferenceToggle(
                                'friendRequestEnabled',
                                !emailStatus.preferences.friendRequestEnabled
                              )
                            }
                            className={`w-12 h-6 rounded-full transition-colors ${
                              emailStatus.preferences.friendRequestEnabled
                                ? 'bg-emerald-600'
                                : 'bg-gray-600'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                                emailStatus.preferences.friendRequestEnabled
                                  ? 'translate-x-6'
                                  : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={handleUnsubscribeAll}
                      disabled={emailSaving}
                      className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-colors disabled:opacity-50 border border-red-600/30"
                    >
                      Unsubscribe from All Emails
                    </button>
                  </>
                )}
              </div>
            )}

            {emailMessage && (
              <p
                className={`text-sm mt-3 ${
                  emailMessage.includes('success') || emailMessage.includes('sent')
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                {emailMessage}
              </p>
            )}
          </div>

          {/* Push Notifications */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Push Notifications</h2>
            <PushNotificationPrompt userId={userId} />

            {isSubscribed && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Notification Types</h3>

                <label className="flex items-center justify-between">
                  <span className="text-gray-300">Achievements</span>
                  <button
                    onClick={() => updatePreferences({ achievements: !preferences.achievements })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      preferences.achievements ? 'bg-emerald-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                      preferences.achievements ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-gray-300">Rewards & Earnings</span>
                  <button
                    onClick={() => updatePreferences({ rewards: !preferences.rewards })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      preferences.rewards ? 'bg-emerald-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                      preferences.rewards ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-gray-300">Friends & Social</span>
                  <button
                    onClick={() => updatePreferences({ friends: !preferences.friends })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      preferences.friends ? 'bg-emerald-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                      preferences.friends ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-gray-300">Tournaments</span>
                  <button
                    onClick={() => updatePreferences({ tournaments: !preferences.tournaments })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      preferences.tournaments ? 'bg-emerald-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                      preferences.tournaments ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-gray-300">Auctions & Marketplace</span>
                  <button
                    onClick={() => updatePreferences({ auctions: !preferences.auctions })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      preferences.auctions ? 'bg-emerald-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                      preferences.auctions ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-gray-300">System Announcements</span>
                  <button
                    onClick={() => updatePreferences({ system: !preferences.system })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      preferences.system ? 'bg-emerald-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                      preferences.system ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </label>

                <button
                  onClick={handleTestNotification}
                  disabled={testingNotification}
                  className="w-full mt-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  {testingNotification ? 'Sending...' : 'Send Test Notification'}
                </button>
              </div>
            )}
          </div>

          {/* Wallet Info */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Wallet</h2>
            <p className="text-gray-400 text-sm break-all">{address}</p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>

          {message && (
            <p className={`text-center ${message.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
