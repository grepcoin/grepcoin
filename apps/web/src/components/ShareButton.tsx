'use client'

import { useState } from 'react'

interface Props {
  title: string
  text: string
  url?: string
  hashtags?: string[]
}

export function ShareButton({ title, text, url, hashtags = ['GrepCoin', 'Web3Gaming'] }: Props) {
  const [copied, setCopied] = useState(false)
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  const shareData = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}&hashtags=${hashtags.join(',')}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
    discord: shareUrl // Copy to clipboard for Discord
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(`${text}\n${shareUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex gap-2">
      <a
        href={shareData.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] rounded-lg text-white"
        title="Share on Twitter"
      >
        𝕏
      </a>
      <a
        href={shareData.telegram}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-[#0088cc] hover:bg-[#0077b5] rounded-lg text-white"
        title="Share on Telegram"
      >
        ✈️
      </a>
      <button
        onClick={copyToClipboard}
        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
        title="Copy link"
      >
        {copied ? '✓' : '🔗'}
      </button>
    </div>
  )
}
