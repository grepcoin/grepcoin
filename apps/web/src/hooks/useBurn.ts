'use client'

import { useState, useCallback } from 'react'
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'

const BURNER_ADDRESS = process.env.NEXT_PUBLIC_BURNER_ADDRESS as `0x${string}`
const GREP_ADDRESS = process.env.NEXT_PUBLIC_GREP_ADDRESS as `0x${string}`

const BURNER_ABI = [
  {
    name: 'burn',
    type: 'function',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'reason', type: 'string' },
    ],
    outputs: [],
  },
  {
    name: 'totalBurned',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'userTotalBurned',
    type: 'function',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'getUserTier',
    type: 'function',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'string' }],
  },
] as const

const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const

export function useBurn() {
  const { address } = useAccount()
  const [isApproving, setIsApproving] = useState(false)
  const [isBurning, setIsBurning] = useState(false)

  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const { data: totalBurned } = useReadContract({
    address: BURNER_ADDRESS,
    abi: BURNER_ABI,
    functionName: 'totalBurned',
  })

  const { data: userBurned } = useReadContract({
    address: BURNER_ADDRESS,
    abi: BURNER_ABI,
    functionName: 'userTotalBurned',
    args: address ? [address] : undefined,
  })

  const { data: userTier } = useReadContract({
    address: BURNER_ADDRESS,
    abi: BURNER_ABI,
    functionName: 'getUserTier',
    args: address ? [address] : undefined,
  })

  const approve = useCallback(async (amount: string) => {
    setIsApproving(true)
    try {
      writeContract({
        address: GREP_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [BURNER_ADDRESS, parseEther(amount)],
      })
    } finally {
      setIsApproving(false)
    }
  }, [writeContract])

  const burn = useCallback(async (amount: string, reason: string) => {
    setIsBurning(true)
    try {
      writeContract({
        address: BURNER_ADDRESS,
        abi: BURNER_ABI,
        functionName: 'burn',
        args: [parseEther(amount), reason],
      })
    } finally {
      setIsBurning(false)
    }
  }, [writeContract])

  return {
    totalBurned: totalBurned ? formatEther(totalBurned as bigint) : '0',
    userBurned: userBurned ? formatEther(userBurned as bigint) : '0',
    userTier: (userTier as string) || 'None',
    approve,
    burn,
    isApproving,
    isBurning,
    isConfirming,
    isSuccess,
  }
}
