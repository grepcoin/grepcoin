'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'

const GOVERNANCE_ADDRESS = process.env.NEXT_PUBLIC_GOVERNANCE_ADDRESS as `0x${string}`

const GOVERNANCE_ABI = [
  {
    name: 'propose',
    type: 'function',
    inputs: [
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'vote',
    type: 'function',
    inputs: [
      { name: 'proposalId', type: 'uint256' },
      { name: 'support', type: 'bool' },
    ],
    outputs: [],
  },
  {
    name: 'proposalCount',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'getVotes',
    type: 'function',
    inputs: [{ name: 'proposalId', type: 'uint256' }],
    outputs: [
      { name: 'forVotes', type: 'uint256' },
      { name: 'againstVotes', type: 'uint256' },
    ],
  },
  {
    name: 'hasVoted',
    type: 'function',
    inputs: [
      { name: 'proposalId', type: 'uint256' },
      { name: 'voter', type: 'address' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const

export interface Proposal {
  id: number
  title: string
  description: string
  proposer: string
  forVotes: string
  againstVotes: string
  startTime: Date
  endTime: Date
  state: 'active' | 'succeeded' | 'defeated' | 'executed' | 'cancelled'
}

export function useGovernance() {
  const { address: _address } = useAccount()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { writeContract } = useWriteContract()

  const { data: proposalCount } = useReadContract({
    address: GOVERNANCE_ADDRESS,
    abi: GOVERNANCE_ABI,
    functionName: 'proposalCount',
  })

  useEffect(() => {
    fetch('/api/governance/proposals')
      .then((res) => res.json())
      .then((data) => {
        setProposals(data.proposals || [])
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  const createProposal = useCallback(async (title: string, description: string) => {
    writeContract({
      address: GOVERNANCE_ADDRESS,
      abi: GOVERNANCE_ABI,
      functionName: 'propose',
      args: [title, description],
    })
  }, [writeContract])

  const vote = useCallback(async (proposalId: number, support: boolean) => {
    writeContract({
      address: GOVERNANCE_ADDRESS,
      abi: GOVERNANCE_ABI,
      functionName: 'vote',
      args: [BigInt(proposalId), support],
    })
  }, [writeContract])

  return {
    proposals,
    proposalCount: proposalCount ? Number(proposalCount) : 0,
    isLoading,
    createProposal,
    vote,
  }
}
