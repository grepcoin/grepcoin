'use client'

import { useState, useEffect } from 'react'
import { Shield, Users, Star, Trophy, Plus, Search, ChevronRight } from 'lucide-react'
import { useAccount } from 'wagmi'
import { GUILD_PERKS, GUILD_COSTS } from '@/lib/guilds'

interface Guild {
  id: string
  name: string
  tag: string
  description: string
  icon: string
  level: number
  xp: number
  memberCount: number
  maxMembers: number
}

export default function GuildsPage() {
  const { isConnected } = useAccount()
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [myGuild, setMyGuild] = useState<Guild | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        const res = await fetch('/api/guilds')
        if (res.ok) {
          const data = await res.json()
          setGuilds(data.guilds || [])
        }

        if (isConnected) {
          const myRes = await fetch('/api/guilds/my')
          if (myRes.ok) {
            const myData = await myRes.json()
            setMyGuild(myData.guild || null)
          }
        }
      } catch (error) {
        console.error('Failed to fetch guilds:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGuilds()
  }, [isConnected])

  const filteredGuilds = guilds.filter(guild =>
    guild.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guild.tag.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-grep-purple" />
              Guilds
            </h1>
            <p className="text-gray-400 mt-1">Join a guild to earn bonus GREP rewards</p>
          </div>

          {isConnected && !myGuild && (
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-grep-purple to-grep-pink text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
              <Plus className="w-5 h-5" />
              Create Guild ({GUILD_COSTS.create} GREP)
            </button>
          )}
        </div>

        {/* My Guild Card */}
        {myGuild && (
          <div className="mb-8 p-6 bg-gradient-to-r from-grep-purple/20 to-grep-pink/20 border border-grep-purple/30 rounded-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Your Guild</h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-dark-800 flex items-center justify-center text-3xl">
                {myGuild.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{myGuild.name}</h3>
                  <span className="text-gray-400">[{myGuild.tag}]</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">{myGuild.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-400">
                    <Star className="w-4 h-4 inline mr-1 text-yellow-400" />
                    Level {myGuild.level}
                  </span>
                  <span className="text-sm text-gray-400">
                    <Users className="w-4 h-4 inline mr-1 text-blue-400" />
                    {myGuild.memberCount}/{myGuild.maxMembers} members
                  </span>
                </div>
              </div>
              <button className="px-4 py-2 bg-dark-800 text-white rounded-lg hover:bg-dark-700 transition-colors flex items-center gap-1">
                View <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Guild Perks */}
        <div className="mb-8 p-6 bg-dark-800 rounded-xl border border-dark-600">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Guild Perks
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {GUILD_PERKS.map(perk => (
              <div key={perk.level} className="text-center p-3 bg-dark-700 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Level {perk.level}</p>
                <p className="text-sm text-white font-medium">{perk.perk}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search guilds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-grep-purple"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-grep-orange border-t-transparent rounded-full" />
          </div>
        )}

        {/* Guilds Grid */}
        {!isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGuilds.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-400">
                {searchQuery ? 'No guilds match your search' : 'No guilds yet. Be the first to create one!'}
              </div>
            ) : (
              filteredGuilds.map(guild => (
                <div
                  key={guild.id}
                  className="bg-dark-800 rounded-xl border border-dark-600 p-5 hover:border-dark-500 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-dark-700 flex items-center justify-center text-2xl">
                      {guild.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{guild.name}</h3>
                      <p className="text-gray-400 text-sm">[{guild.tag}]</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-bold">Lv.{guild.level}</p>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{guild.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      <Users className="w-4 h-4 inline mr-1" />
                      {guild.memberCount}/{guild.maxMembers}
                    </span>
                    <button className="px-4 py-2 bg-grep-purple/20 text-grep-purple rounded-lg hover:bg-grep-purple/30 transition-colors text-sm font-medium">
                      Join
                    </button>
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
