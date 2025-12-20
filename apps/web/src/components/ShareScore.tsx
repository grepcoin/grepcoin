'use client'

import { ShareButton } from './ShareButton'

interface Props {
  gameName: string
  score: number
  grepEarned: number
}

export function ShareScore({ gameName, score, grepEarned }: Props) {
  const text = `🎮 Just scored ${score.toLocaleString()} in ${gameName} and earned ${grepEarned} GREP!\n\nPlay to earn crypto at GrepCoin 🪙`

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="font-bold mb-2">Share your score!</h3>
      <p className="text-gray-400 text-sm mb-3">{text}</p>
      <ShareButton
        title={`${gameName} Score`}
        text={text}
        hashtags={['GrepCoin', 'PlayToEarn', gameName.replace(/\s/g, '')]}
      />
    </div>
  )
}
