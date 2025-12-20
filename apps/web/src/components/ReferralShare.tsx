'use client'

import { useState } from 'react'

interface Props {
  referralCode: string
}

export function ReferralShare({ referralCode }: Props) {
  const [copied, setCopied] = useState(false)
  const referralUrl = `https://grepcoin.xyz?ref=${referralCode}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-gradient-to-r from-emerald-900/50 to-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-2">Invite Friends, Earn GREP!</h3>
      <p className="text-gray-400 mb-4">Get 100 GREP for each friend who joins and plays.</p>

      <div className="flex gap-2">
        <input
          type="text"
          value={referralUrl}
          readOnly
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm"
        />
        <button
          onClick={copyLink}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="flex gap-2 mt-4">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('🎮 Join me on GrepCoin and earn crypto by playing games!\n\nUse my referral link:')}&url=${encodeURIComponent(referralUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center py-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] rounded-lg"
        >
          Share on 𝕏
        </a>
        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent('Join me on GrepCoin!')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center py-2 bg-[#0088cc] hover:bg-[#0077b5] rounded-lg"
        >
          Share on Telegram
        </a>
      </div>
    </div>
  )
}
