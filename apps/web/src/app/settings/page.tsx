'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

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
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (isConnected) {
      fetch('/api/users/settings')
        .then(res => res.json())
        .then(data => {
          if (data.settings) setSettings(data.settings)
        })
    }
  }, [isConnected])

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
