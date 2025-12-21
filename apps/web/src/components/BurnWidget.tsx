'use client'

import { useState } from 'react'
import { useBurn } from '@/hooks/useBurn'

const BURN_REASONS = [
  'Boost earnings multiplier',
  'Unlock exclusive cosmetics',
  'Support the ecosystem',
  'Reduce supply',
  'Custom reason',
]

export function BurnWidget() {
  const { totalBurned, userBurned, userTier, approve, burn, isApproving, isBurning, isConfirming } = useBurn()
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState(BURN_REASONS[0])
  const [customReason, setCustomReason] = useState('')
  const [step, setStep] = useState<'input' | 'approve' | 'burn'>('input')

  const handleApprove = async () => {
    await approve(amount)
    setStep('burn')
  }

  const handleBurn = async () => {
    const finalReason = reason === 'Custom reason' ? customReason : reason
    await burn(amount, finalReason)
    setAmount('')
    setStep('input')
  }

  return (
    <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🔥</span>
        <div>
          <h2 className="text-xl font-bold">Burn GREP</h2>
          <p className="text-gray-400 text-sm">Permanently remove tokens from circulation</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-black/30 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{parseFloat(totalBurned).toLocaleString()}</p>
          <p className="text-gray-400 text-sm">Total Burned</p>
        </div>
        <div className="bg-black/30 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-orange-400">{parseFloat(userBurned).toLocaleString()}</p>
          <p className="text-gray-400 text-sm">You Burned</p>
        </div>
        <div className="bg-black/30 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{userTier}</p>
          <p className="text-gray-400 text-sm">Your Tier</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Amount to Burn</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter GREP amount"
            className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
          >
            {BURN_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {reason === 'Custom reason' && (
          <input
            type="text"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Enter your reason"
            className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3"
          />
        )}

        {step === 'input' && (
          <button
            onClick={() => setStep('approve')}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg font-bold"
          >
            Continue to Burn
          </button>
        )}

        {step === 'approve' && (
          <button
            onClick={handleApprove}
            disabled={isApproving || isConfirming}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-lg font-bold"
          >
            {isApproving || isConfirming ? 'Approving...' : 'Approve GREP'}
          </button>
        )}

        {step === 'burn' && (
          <button
            onClick={handleBurn}
            disabled={isBurning || isConfirming}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg font-bold"
          >
            {isBurning || isConfirming ? 'Burning...' : `🔥 Burn ${amount} GREP`}
          </button>
        )}
      </div>
    </div>
  )
}
