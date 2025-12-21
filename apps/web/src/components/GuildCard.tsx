'use client'
import { Guild } from '@/lib/guilds'

interface Props { guild: Guild; onJoin?: () => void }

export function GuildCard({ guild, onJoin }: Props) {
  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-4">
        <span className="text-4xl">{guild.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold">{guild.name}</span>
            <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">[{guild.tag}]</span>
          </div>
          <p className="text-sm text-gray-400">Lv.{guild.level} • {guild.memberCount}/{guild.maxMembers} members</p>
        </div>
        {onJoin && <button onClick={onJoin} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg">Join</button>}
      </div>
    </div>
  )
}
