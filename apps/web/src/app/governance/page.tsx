'use client'

import { useState } from 'react'
import { useGovernance } from '@/hooks/useGovernance'
import { ProposalCard } from '@/components/ProposalCard'
import { CreateProposal } from '@/components/CreateProposal'

export default function GovernancePage() {
  const { proposals, proposalCount, isLoading, vote } = useGovernance()
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all')

  const filteredProposals = proposals.filter((p) => {
    if (filter === 'all') return true
    if (filter === 'active') return p.state === 'active'
    return p.state !== 'active'
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Governance</h1>
          <p className="text-gray-400 mt-1">{proposalCount} total proposals</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold"
        >
          + New Proposal
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'closed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === f
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-4">🗳️</p>
          <p>No proposals found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onVote={vote}
            />
          ))}
        </div>
      )}

      {showCreate && <CreateProposal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
