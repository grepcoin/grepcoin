'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  type: 'game' | 'player' | 'achievement' | 'page'
  title: string
  description: string
  href: string
  icon: string
}

const staticPages: SearchResult[] = [
  { type: 'page', title: 'Games', description: 'Browse all games', href: '/games', icon: '🎮' },
  { type: 'page', title: 'Leaderboard', description: 'Top players', href: '/leaderboard', icon: '🏆' },
  { type: 'page', title: 'Profile', description: 'Your profile', href: '/profile', icon: '👤' },
  { type: 'page', title: 'Settings', description: 'Account settings', href: '/settings', icon: '⚙️' },
  { type: 'page', title: 'Battle Pass', description: 'Season rewards', href: '/battle-pass', icon: '⭐' },
  { type: 'page', title: 'Stats', description: 'Your statistics', href: '/stats', icon: '📊' },
]

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const router = useRouter()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(o => !o)
      }
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(staticPages)
      return
    }

    const filtered = staticPages.filter(p =>
      p.title.toLowerCase().includes(q.toLowerCase()) ||
      p.description.toLowerCase().includes(q.toLowerCase())
    )

    // Fetch games and players
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setResults([...filtered, ...data.results])
        return
      }
    } catch {}

    setResults(filtered)
  }, [])

  useEffect(() => {
    search(query)
  }, [query, search])

  const handleSelect = (result: SearchResult) => {
    router.push(result.href)
    setIsOpen(false)
    setQuery('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-start justify-center pt-20 z-50 p-4" onClick={() => setIsOpen(false)}>
      <div className="bg-gray-800 rounded-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-700">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search games, players, pages..."
            className="w-full bg-transparent text-white text-lg outline-none"
            autoFocus
          />
        </div>

        <div className="max-h-80 overflow-y-auto">
          {results.map((result, i) => (
            <button
              key={i}
              onClick={() => handleSelect(result)}
              className="w-full flex items-center gap-3 p-4 hover:bg-gray-700 text-left"
            >
              <span className="text-2xl">{result.icon}</span>
              <div>
                <p className="font-medium text-white">{result.title}</p>
                <p className="text-sm text-gray-400">{result.description}</p>
              </div>
              <span className="ml-auto text-xs text-gray-500 capitalize">{result.type}</span>
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-gray-700 text-center text-gray-500 text-sm">
          Press <kbd className="px-1 bg-gray-700 rounded">Esc</kbd> to close
        </div>
      </div>
    </div>
  )
}
