'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

const ADMIN_WALLETS = [process.env.NEXT_PUBLIC_ADMIN_WALLET?.toLowerCase()]

interface Stats {
  totalUsers: number
  totalGamesPlayed: number
  totalGrepEarned: number
  activeToday: number
}

export default function AdminDashboard() {
  const { address, isConnected } = useAccount()
  const [stats, setStats] = useState<Stats | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (address && ADMIN_WALLETS.includes(address.toLowerCase())) {
      setIsAdmin(true)
      fetchStats()
    }
  }, [address])

  const fetchStats = async () => {
    const res = await fetch('/api/admin/stats')
    if (res.ok) {
      const data = await res.json()
      setStats(data)
    }
  }

  if (!isConnected) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      Connect wallet to access admin
    </div>
  }

  if (!isAdmin) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      Access denied
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Users" value={stats?.totalUsers || 0} icon="👥" />
          <StatCard title="Games Played" value={stats?.totalGamesPlayed || 0} icon="🎮" />
          <StatCard title="GREP Earned" value={stats?.totalGrepEarned || 0} icon="🪙" />
          <StatCard title="Active Today" value={stats?.activeToday || 0} icon="📈" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminSection title="Quick Actions">
            <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left">
              Create Tournament
            </button>
            <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left">
              Create Event
            </button>
            <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left">
              Manage Games
            </button>
          </AdminSection>

          <AdminSection title="Recent Activity">
            <p className="text-gray-400">Activity feed coming soon...</p>
          </AdminSection>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-emerald-400">{value.toLocaleString()}</p>
      <p className="text-gray-400 text-sm">{title}</p>
    </div>
  )
}

function AdminSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  )
}
