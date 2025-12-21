'use client'

import { SeasonBanner } from '@/components/SeasonBanner'
import { SeasonChallenges } from '@/components/SeasonChallenges'
import { SeasonRewards } from '@/components/SeasonRewards'

export default function SeasonsPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <SeasonBanner />
      <SeasonRewards />
      <SeasonChallenges />
    </div>
  )
}
