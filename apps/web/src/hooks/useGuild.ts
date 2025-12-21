'use client'
import { useState, useEffect, useCallback } from 'react'
import { Guild, GuildMember } from '@/lib/guilds'

export function useGuild() {
  const [guild, setGuild] = useState<Guild | null>(null)
  const [members, setMembers] = useState<GuildMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/guilds/my')
      .then(res => res.json())
      .then(data => { setGuild(data.guild); setMembers(data.members || []); setIsLoading(false) })
      .catch(() => setIsLoading(false))
  }, [])

  const createGuild = useCallback(async (name: string, tag: string, description: string) => {
    const res = await fetch('/api/guilds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, tag, description }),
    })
    const data = await res.json()
    if (data.guild) setGuild(data.guild)
    return data
  }, [])

  const leaveGuild = useCallback(async () => {
    await fetch('/api/guilds/leave', { method: 'POST' })
    setGuild(null)
    setMembers([])
  }, [])

  return { guild, members, isLoading, createGuild, leaveGuild }
}
