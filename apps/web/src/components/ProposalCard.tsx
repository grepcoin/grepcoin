'use client'

import type { Proposal } from '@/hooks/useGovernance'

interface Props {
  proposal: Proposal
  onVote: (proposalId: number, support: boolean) => void
  hasVoted?: boolean
}

export function ProposalCard({ proposal, onVote, hasVoted }: Props) {
  const totalVotes = parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes)
  const forPercentage = totalVotes > 0 ? (parseFloat(proposal.forVotes) / totalVotes) * 100 : 50

  const stateColors: Record<string, string> = {
    active: 'bg-blue-500',
    succeeded: 'bg-emerald-500',
    defeated: 'bg-red-500',
    executed: 'bg-purple-500',
    cancelled: 'bg-gray-500',
  }

  const isActive = proposal.state === 'active'
  const timeLeft = proposal.endTime.getTime() - Date.now()
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)))

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold">{proposal.title}</h3>
            <p className="text-sm text-gray-400 mt-1">
              by {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${stateColors[proposal.state]}`}>
            {proposal.state.toUpperCase()}
          </span>
        </div>

        <p className="text-gray-300 mb-4">{proposal.description}</p>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-emerald-400">For: {parseFloat(proposal.forVotes).toLocaleString()}</span>
            <span className="text-red-400">Against: {parseFloat(proposal.againstVotes).toLocaleString()}</span>
          </div>
          <div className="h-3 bg-red-500/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${forPercentage}%` }}
            />
          </div>
        </div>

        {isActive && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {hoursLeft}h remaining
            </p>
            {!hasVoted ? (
              <div className="flex gap-2">
                <button
                  onClick={() => onVote(proposal.id, true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium"
                >
                  👍 Vote For
                </button>
                <button
                  onClick={() => onVote(proposal.id, false)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium"
                >
                  👎 Vote Against
                </button>
              </div>
            ) : (
              <span className="text-gray-400 text-sm">✓ You voted</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
