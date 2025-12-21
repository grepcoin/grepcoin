export interface ReferralTier {
  id: string
  name: string
  minReferrals: number
  rewardPerReferral: number
  bonusReward: number
  perks: string[]
  icon: string
  color: string
}

export const REFERRAL_TIERS: ReferralTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    minReferrals: 0,
    rewardPerReferral: 100,
    bonusReward: 0,
    perks: ['100 GREP per referral'],
    icon: '🌱',
    color: 'bg-gray-600',
  },
  {
    id: 'bronze',
    name: 'Bronze Recruiter',
    minReferrals: 5,
    rewardPerReferral: 125,
    bonusReward: 250,
    perks: ['125 GREP per referral', '+250 GREP tier bonus'],
    icon: '🥉',
    color: 'bg-orange-700',
  },
  {
    id: 'silver',
    name: 'Silver Recruiter',
    minReferrals: 15,
    rewardPerReferral: 150,
    bonusReward: 750,
    perks: ['150 GREP per referral', '+750 GREP tier bonus', 'Custom referral link'],
    icon: '🥈',
    color: 'bg-gray-400',
  },
  {
    id: 'gold',
    name: 'Gold Ambassador',
    minReferrals: 30,
    rewardPerReferral: 200,
    bonusReward: 2000,
    perks: ['200 GREP per referral', '+2000 GREP tier bonus', 'Ambassador badge', 'Priority support'],
    icon: '🥇',
    color: 'bg-yellow-500',
  },
  {
    id: 'diamond',
    name: 'Diamond Partner',
    minReferrals: 50,
    rewardPerReferral: 300,
    bonusReward: 5000,
    perks: ['300 GREP per referral', '+5000 GREP tier bonus', 'Partner badge', 'Revenue share', 'Direct team contact'],
    icon: '💎',
    color: 'bg-cyan-400',
  },
]

export function getTier(referralCount: number): ReferralTier {
  for (let i = REFERRAL_TIERS.length - 1; i >= 0; i--) {
    if (referralCount >= REFERRAL_TIERS[i].minReferrals) {
      return REFERRAL_TIERS[i]
    }
  }
  return REFERRAL_TIERS[0]
}

export function getNextTier(referralCount: number): ReferralTier | null {
  const currentTier = getTier(referralCount)
  const currentIndex = REFERRAL_TIERS.findIndex(t => t.id === currentTier.id)
  return REFERRAL_TIERS[currentIndex + 1] || null
}

export function calculateTotalEarnings(referralCount: number): number {
  let total = 0
  let remaining = referralCount

  for (let i = REFERRAL_TIERS.length - 1; i >= 0; i--) {
    const tier = REFERRAL_TIERS[i]
    if (remaining >= tier.minReferrals) {
      const referralsInTier = remaining - (i > 0 ? REFERRAL_TIERS[i - 1].minReferrals : 0)
      total += referralsInTier * tier.rewardPerReferral
      total += tier.bonusReward
      remaining = i > 0 ? REFERRAL_TIERS[i - 1].minReferrals : 0
    }
  }

  return total
}
