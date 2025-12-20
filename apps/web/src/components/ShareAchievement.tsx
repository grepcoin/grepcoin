'use client'

import { ShareButton } from './ShareButton'

interface Props {
  achievementName: string
  rarity: string
}

export function ShareAchievement({ achievementName, rarity }: Props) {
  const rarityEmoji = {
    common: '⭐',
    rare: '💫',
    epic: '🌟',
    legendary: '✨'
  }[rarity.toLowerCase()] || '🏆'

  const text = `${rarityEmoji} Just unlocked "${achievementName}" on GrepCoin!\n\nJoin me and earn crypto by playing games 🎮`

  return (
    <div className="mt-4">
      <ShareButton
        title={`Achievement: ${achievementName}`}
        text={text}
        hashtags={['GrepCoin', 'Achievement', 'Web3Gaming']}
      />
    </div>
  )
}
