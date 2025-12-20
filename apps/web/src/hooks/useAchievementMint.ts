'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

const ACHIEVEMENTS_ABI = [
  {
    name: 'mint',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'achievementId', type: 'uint256' },
      { name: 'signature', type: 'bytes' }
    ],
    outputs: []
  }
] as const

export function useAchievementMint() {
  const { address } = useAccount()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const mintAchievement = async (achievementId: string) => {
    if (!address) {
      setError('Wallet not connected')
      return
    }

    setIsPending(true)
    setError(null)

    try {
      // Get mint data from API
      const res = await fetch('/api/achievements/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ achievementId })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to prepare mint')
      }

      const { mintData } = await res.json()

      // Execute mint transaction
      writeContract({
        address: mintData.contractAddress as `0x${string}`,
        abi: ACHIEVEMENTS_ABI,
        functionName: 'mint',
        args: [address, BigInt(mintData.achievementId), '0x']
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Mint failed')
    } finally {
      setIsPending(false)
    }
  }

  return {
    mintAchievement,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    txHash: hash
  }
}
