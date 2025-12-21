'use client'
import { useGuild } from '@/hooks/useGuild'
import { GuildCard } from './GuildCard'
import { CreateGuild } from './CreateGuild'

export function GuildDashboard() {
  const { guild, members, isLoading, leaveGuild } = useGuild()

  if (isLoading) return <div className="animate-pulse bg-gray-800 rounded-lg h-64" />

  if (!guild) return <CreateGuild />

  return (
    <div className="space-y-6">
      <GuildCard guild={guild} />
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="font-bold mb-4">Members ({members.length})</h3>
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.userId} className="flex items-center justify-between p-2 bg-gray-900 rounded">
              <span>{m.userId.slice(0, 8)}...</span>
              <span className="text-xs text-gray-400 capitalize">{m.role}</span>
            </div>
          ))}
        </div>
      </div>
      <button onClick={leaveGuild} className="text-red-400 hover:text-red-300">Leave Guild</button>
    </div>
  )
}
