'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Gamepad2, Heart, User, Trophy, Star, BarChart3, Settings, LogOut, Bell, Coins } from 'lucide-react'
import { useAccount, useDisconnect } from 'wagmi'
import { useAuth } from '@/context/AuthContext'
import { useStaking } from '@/context/StakingContext'
import Logo from './Logo'
import WalletButton from './WalletButton'

const NAV_LINKS = [
  { href: '/games', label: 'Games', icon: Gamepad2 },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/battle-pass', label: 'Battle Pass', icon: Star },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
]

const LANDING_LINKS = [
  { name: 'Story', href: '#story' },
  { name: 'Features', href: '#features' },
  { name: 'Tokenomics', href: '#tokenomics' },
  { name: 'Roadmap', href: '#roadmap' },
  { name: 'Community', href: '#community' },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifications] = useState(0) // TODO: Wire to notification count from API
  const pathname = usePathname()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { user, isAuthenticated, signOut } = useAuth()
  const { grepBalance } = useStaking()

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dropdown]')) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Determine if we're on the landing page
  const isLandingPage = pathname === '/'

  const handleDisconnect = async () => {
    await signOut()
    disconnect()
    setUserMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/95 backdrop-blur-lg border-b border-dark-600/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="group hover:opacity-90 transition-opacity">
            <Logo size={36} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isLandingPage ? (
              // Landing page links
              LANDING_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                >
                  {link.name}
                </a>
              ))
            ) : (
              // App navigation links
              NAV_LINKS.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-medium ${
                      isActive
                        ? 'bg-gradient-to-r from-grep-purple to-grep-pink text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-dark-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                )
              })
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* GREP Balance Preview (only when connected and not on landing) */}
            {isConnected && !isLandingPage && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-dark-700/50 rounded-lg border border-grep-orange/30">
                <Coins className="w-4 h-4 text-grep-orange" />
                <span className="text-sm font-semibold text-grep-orange">
                  {grepBalance.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400">GREP</span>
              </div>
            )}

            {/* Notification Bell (only when connected) */}
            {isConnected && !isLandingPage && (
              <button className="relative p-2 rounded-lg hover:bg-dark-700 transition-colors">
                <Bell className="w-5 h-5 text-gray-400" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-grep-pink rounded-full flex items-center justify-center text-xs font-bold">
                    {notifications}
                  </span>
                )}
              </button>
            )}

            {/* CTA Buttons (landing page only) */}
            {isLandingPage && (
              <>
                <Link
                  href="/fundraise"
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-grep-purple/20 border border-grep-purple/50 text-grep-purple font-semibold hover:bg-grep-purple/30 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  Back Us
                </Link>
                <Link
                  href="/games"
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-grep-orange to-grep-yellow text-dark-900 font-semibold hover:opacity-90 transition-opacity"
                >
                  <Gamepad2 className="w-4 h-4" />
                  Play
                </Link>
              </>
            )}

            {/* User Menu Dropdown */}
            {isConnected && isAuthenticated ? (
              <div className="relative hidden md:block" data-dropdown>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setUserMenuOpen(!userMenuOpen)
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg hover:border-dark-500 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-grep-purple to-grep-pink flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">
                    {user?.username || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-dark-800 rounded-xl shadow-xl border border-dark-700 py-2 z-50">
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-dark-700 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-dark-700 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-2 border-dark-700" />
                    <button
                      onClick={handleDisconnect}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-dark-700 transition-colors text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:block">
                <WalletButton />
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-dark-700 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-dark-800 border-b border-dark-600/50">
          <div className="px-4 py-4 space-y-3">
            {/* GREP Balance (mobile) */}
            {isConnected && !isLandingPage && (
              <div className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-700/50 rounded-lg border border-grep-orange/30 mb-4">
                <Coins className="w-5 h-5 text-grep-orange" />
                <span className="font-semibold text-grep-orange">
                  {grepBalance.toLocaleString()}
                </span>
                <span className="text-sm text-gray-400">GREP</span>
              </div>
            )}

            {/* Navigation Links */}
            {isLandingPage ? (
              LANDING_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-300 hover:text-white transition-colors font-medium py-2"
                >
                  {link.name}
                </a>
              ))
            ) : (
              NAV_LINKS.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-grep-purple to-grep-pink text-white'
                        : 'text-gray-300 hover:bg-dark-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                )
              })
            )}

            {/* CTA Buttons (mobile - landing page) */}
            {isLandingPage && (
              <div className="pt-4 space-y-3">
                <Link
                  href="/fundraise"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl bg-grep-purple/20 border border-grep-purple/50 text-grep-purple font-semibold"
                >
                  <Heart className="w-4 h-4" />
                  Back Us
                </Link>
                <Link
                  href="/games"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl bg-gradient-to-r from-grep-orange to-grep-yellow text-dark-900 font-semibold"
                >
                  <Gamepad2 className="w-4 h-4" />
                  Play & Earn
                </Link>
              </div>
            )}

            {/* User Actions (mobile) */}
            {isConnected && isAuthenticated ? (
              <div className="pt-4 space-y-2 border-t border-dark-700">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={() => {
                    handleDisconnect()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-dark-700 rounded-lg transition-colors text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-dark-700">
                <WalletButton />
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
