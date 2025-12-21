'use client'
import { useState } from 'react'
import { useGuild } from '@/hooks/useGuild'
import { GUILD_COSTS } from '@/lib/guilds'

export function CreateGuild() {
  const { createGuild } = useGuild()
  const [name, setName] = useState('')
  const [tag, setTag] = useState('')
  const [desc, setDesc] = useState('')

  const handleCreate = async () => {
    if (name && tag) await createGuild(name, tag, desc)
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">Create a Guild</h2>
      <div className="space-y-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Guild Name" className="w-full bg-gray-900 rounded-lg px-4 py-2" />
        <input value={tag} onChange={e => setTag(e.target.value.toUpperCase().slice(0, 4))} placeholder="Tag (4 chars)" className="w-full bg-gray-900 rounded-lg px-4 py-2" />
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="w-full bg-gray-900 rounded-lg px-4 py-2" />
        <button onClick={handleCreate} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg">
          Create Guild ({GUILD_COSTS.create} GREP)
        </button>
      </div>
    </div>
  )
}
