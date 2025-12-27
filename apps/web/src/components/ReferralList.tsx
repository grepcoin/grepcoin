'use client'

interface Referral {
  id: string
  wallet: string
  joinedAt: Date
  gamesPlayed: number
  earned: number
}

interface Props {
  referrals: Referral[]
}

export function ReferralList({ referrals }: Props) {
  if (referrals.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 text-center text-gray-400">
        <p className="text-4xl mb-4">👥</p>
        <p>No referrals yet. Share your link to start earning!</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <h3 className="font-bold">Your Referrals ({referrals.length})</h3>
      </div>

      <div className="divide-y divide-gray-700">
        {referrals.map(ref => (
          <div key={ref.id} className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-sm">
                {ref.wallet ? `${ref.wallet.slice(0, 6)}...${ref.wallet.slice(-4)}` : 'Unknown'}
              </p>
              <p className="text-sm text-gray-400">
                Joined {new Date(ref.joinedAt).toLocaleDateString()} • {ref.gamesPlayed} games
              </p>
            </div>
            <div className="text-right">
              <p className="text-emerald-400 font-bold">+{ref.earned} GREP</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
