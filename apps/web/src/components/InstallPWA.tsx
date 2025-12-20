'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowInstall(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowInstall(false)
    localStorage.setItem('pwa-dismissed', 'true')
  }

  if (!showInstall || localStorage.getItem('pwa-dismissed')) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-gray-800 rounded-lg p-4 shadow-xl border border-gray-700 z-50">
      <div className="flex items-start gap-3">
        <span className="text-3xl">📱</span>
        <div className="flex-1">
          <h3 className="font-bold text-white">Install GrepCoin</h3>
          <p className="text-gray-400 text-sm">Add to home screen for the best experience</p>
        </div>
        <button onClick={handleDismiss} className="text-gray-500 hover:text-white">✕</button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleInstall}
          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
        >
          Later
        </button>
      </div>
    </div>
  )
}
