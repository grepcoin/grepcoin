'use client'

import { useState } from 'react'
import { Trophy, Clock, Users, Coins, Gamepad2, CheckCircle, Timer, XCircle } from 'lucide-react'
import { useTournaments } from '@/hooks/useTournaments'

type StatusFilter = 'all' | 'REGISTRATION' | 'ACTIVE' | 'COMPLETED'

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'REGISTRATION', label: 'Registration' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
]

function getStatusBadge(status: string) {
  switch (status) {
    case 'REGISTRATION':
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
          <Timer className="w-3 h-3" />
          Registration
        </span>
      )
    case 'ACTIVE':
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
          <Gamepad2 className="w-3 h-3" />
          Active
        </span>
      )
    case 'COMPLETED':
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium">
          <CheckCircle className="w-3 h-3" />
          Completed
        </span>
      )
    case 'CANCELLED':
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
          <XCircle className="w-3 h-3" />
          Cancelled
        </span>
      )
    default:
      return null
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function TournamentsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const { tournaments, isLoading, error } = useTournaments({
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: 50,
  })

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            Tournaments
          </h1>
          <p className="text-gray-400 mt-1">Compete for GREP prizes in timed events</p>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mb-8">
          {STATUS_FILTERS.map(filter => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === filter.value
                  ? 'bg-grep-purple text-white'
                  : 'bg-dark-800 text-gray-400 hover:bg-dark-700 hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-grep-orange border-t-transparent rounded-full" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20 text-red-400">
            {error}
          </div>
        )}

        {/* Tournaments Grid */}
        {!isLoading && !error && (
          <div className="grid gap-6 md:grid-cols-2">
            {tournaments.length === 0 ? (
              <div className="col-span-2 text-center py-20 text-gray-400">
                No tournaments found
              </div>
            ) : (
              tournaments.map(tournament => (
                <div
                  key={tournament.id}
                  className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden hover:border-dark-500 transition-colors"
                >
                  {/* Tournament Header */}
                  <div className="p-6 border-b border-dark-600">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
                      {getStatusBadge(tournament.status)}
                    </div>
                    <p className="text-gray-400 text-sm">
                      Game: <span className="text-white capitalize">{tournament.gameSlug.replace(/-/g, ' ')}</span>
                    </p>
                  </div>

                  {/* Tournament Stats */}
                  <div className="grid grid-cols-2 gap-4 p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                        <Coins className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{tournament.prizePool.toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">Prize Pool</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">
                          {tournament.participantCount}/{tournament.maxPlayers}
                        </p>
                        <p className="text-gray-400 text-sm">Players</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{formatDate(tournament.startTime)}</p>
                        <p className="text-gray-400 text-sm">Start Time</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <Coins className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{tournament.entryFee || 'Free'}</p>
                        <p className="text-gray-400 text-sm">Entry Fee</p>
                      </div>
                    </div>
                  </div>

                  {/* Top Players */}
                  {tournament.topParticipants && tournament.topParticipants.length > 0 && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-400 text-sm mb-3">Top Players</p>
                      <div className="flex -space-x-2">
                        {tournament.topParticipants.slice(0, 5).map((participant, index) => (
                          <div
                            key={participant.id}
                            className="w-8 h-8 rounded-full bg-gradient-to-r from-grep-purple to-grep-pink flex items-center justify-center text-white text-xs font-bold border-2 border-dark-800"
                            title={participant.user.username || formatAddress(participant.user.walletAddress)}
                          >
                            {participant.user.username?.[0]?.toUpperCase() ||
                             participant.user.walletAddress[2].toUpperCase()}
                          </div>
                        ))}
                        {tournament.participantCount > 5 && (
                          <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center text-gray-400 text-xs font-bold border-2 border-dark-800">
                            +{tournament.participantCount - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="px-6 pb-6">
                    {tournament.status === 'REGISTRATION' && (
                      <button className="w-full py-3 bg-gradient-to-r from-grep-purple to-grep-pink text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
                        Join Tournament
                      </button>
                    )}
                    {tournament.status === 'ACTIVE' && (
                      <button className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors">
                        Play Now
                      </button>
                    )}
                    {tournament.status === 'COMPLETED' && (
                      <button className="w-full py-3 bg-dark-700 text-gray-400 font-semibold rounded-lg cursor-default">
                        View Results
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
