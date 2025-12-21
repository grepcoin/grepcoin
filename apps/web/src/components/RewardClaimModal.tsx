'use client'

import { useState } from 'react'
import { X, Gift, Coins, Trophy, Sparkles, Crown, Medal, Award, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface RewardClaimModalProps {
  isOpen: boolean
  onClose: () => void
  reward: {
    id: string
    period: string
    rank: number
    grepAmount: number
    badgeId?: string
    badgeName?: string
    badgeIcon?: string
    multiplier?: number
  }
  onClaim: (rewardId: string) => Promise<any>
}

export default function RewardClaimModal({
  isOpen,
  onClose,
  reward,
  onClaim,
}: RewardClaimModalProps) {
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClaim = async () => {
    setIsClaiming(true)
    setError(null)

    try {
      const result = await onClaim(reward.id)
      if (result.success) {
        setClaimed(true)
        setTimeout(() => {
          onClose()
          setClaimed(false)
        }, 3000)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to claim reward')
    } finally {
      setIsClaiming(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-16 h-16 text-yellow-400" />
      case 2:
        return <Medal className="w-16 h-16 text-gray-300" />
      case 3:
        return <Award className="w-16 h-16 text-amber-600" />
      default:
        return <Trophy className="w-16 h-16 text-grep-orange" />
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-dark-800 border border-dark-600 rounded-2xl max-w-md w-full overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-grep-purple to-grep-pink p-6">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="mb-4 flex justify-center"
                  >
                    {getRankIcon(reward.rank)}
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-white mb-2"
                  >
                    {claimed ? 'Reward Claimed!' : 'Claim Your Reward'}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/80"
                  >
                    {reward.period} Leaderboard • Rank #{reward.rank}
                  </motion.p>
                </div>
              </div>

              {/* Content */}
              {!claimed ? (
                <div className="p-6 space-y-6">
                  {/* Rewards Breakdown */}
                  <div className="space-y-4">
                    {/* GREP Reward */}
                    <div className="bg-dark-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-grep-orange/20 flex items-center justify-center">
                            <Coins className="w-6 h-6 text-grep-orange" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">GREP Tokens</div>
                            <div className="text-2xl font-bold text-white">
                              {reward.grepAmount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <Sparkles className="w-6 h-6 text-grep-orange" />
                      </div>
                    </div>

                    {/* Badge Reward */}
                    {reward.badgeId && (
                      <div className="bg-dark-700 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-purple-900/50 flex items-center justify-center text-2xl">
                            {reward.badgeIcon}
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Special Badge</div>
                            <div className="font-bold text-white">{reward.badgeName}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Multiplier Bonus */}
                    {reward.multiplier && (
                      <div className="bg-dark-700 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-green-900/50 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Earning Multiplier</div>
                            <div className="font-bold text-green-400">
                              +{((reward.multiplier - 1) * 100).toFixed(0)}% Boost
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Claim Button */}
                  <button
                    onClick={handleClaim}
                    disabled={isClaiming}
                    className="w-full bg-gradient-to-r from-grep-orange to-grep-pink text-white font-bold py-4 px-6 rounded-lg hover:shadow-lg hover:shadow-grep-orange/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isClaiming ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <Gift className="w-5 h-5" />
                        Claim Rewards
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Rewards will be added to your account immediately
                  </p>
                </div>
              ) : (
                // Success State
                <div className="p-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center"
                  >
                    {/* Celebration Animation */}
                    <div className="mb-6 relative">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          repeatDelay: 0.4,
                        }}
                        className="text-6xl mb-4"
                      >
                        🎉
                      </motion.div>

                      {/* Floating coins */}
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ y: 0, opacity: 1 }}
                          animate={{
                            y: -100,
                            opacity: 0,
                            x: (i - 2) * 30,
                          }}
                          transition={{
                            duration: 1,
                            delay: i * 0.1,
                            repeat: Infinity,
                            repeatDelay: 1,
                          }}
                          className="absolute top-0 left-1/2 -translate-x-1/2"
                        >
                          <Coins className="w-6 h-6 text-grep-orange" />
                        </motion.div>
                      ))}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
                    <p className="text-gray-400 mb-6">
                      Your rewards have been added to your account
                    </p>

                    <div className="bg-dark-700 rounded-lg p-4 inline-block">
                      <div className="text-3xl font-bold text-grep-orange">
                        +{reward.grepAmount.toLocaleString()} GREP
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
