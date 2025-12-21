'use client'
import { useState, useEffect } from 'react'
import { AuctionWithDetails, calculateQuickBids, formatGREP, formatTimeRemaining } from '@/lib/auctions'
import { usePlaceBid } from '@/hooks/useAuctions'
import { RARITY_COLORS } from '@/lib/inventory'

interface BidModalProps {
  auction: AuctionWithDetails
  onClose: () => void
  onSuccess: () => void
}

export function BidModal({ auction, onClose, onSuccess }: BidModalProps) {
  const { placeBid, isPlacingBid, error } = usePlaceBid()
  const [bidAmount, setBidAmount] = useState(0)
  const [customBid, setCustomBid] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(auction.endTime))

  const quickBids = calculateQuickBids(
    auction.currentBid,
    auction.startingPrice,
    auction.minIncrement
  )

  // Set initial bid amount to minimum
  useEffect(() => {
    setBidAmount(quickBids.min)
  }, [quickBids.min])

  // Update time remaining
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(auction.endTime))
    }, 1000)

    return () => clearInterval(interval)
  }, [auction.endTime])

  const handleQuickBid = (amount: number) => {
    setBidAmount(amount)
    setCustomBid(amount.toString())
  }

  const handleCustomBidChange = (value: string) => {
    setCustomBid(value)
    const numValue = parseInt(value)
    if (!isNaN(numValue) && numValue > 0) {
      setBidAmount(numValue)
    }
  }

  const handleSubmit = async () => {
    if (bidAmount < quickBids.min) {
      return
    }

    const result = await placeBid(auction.id, bidAmount)
    if (result.success) {
      onSuccess()
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border-2 border-purple-500/30 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Place Bid</h2>
            <p className="text-gray-400 text-sm">Time remaining: {timeRemaining}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Item Display */}
        <div
          className={`rounded-xl p-4 mb-6 ${
            RARITY_COLORS[auction.item.rarity as keyof typeof RARITY_COLORS]
          } border-2`}
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">{auction.item.icon}</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{auction.item.name}</h3>
              <p className="text-sm text-gray-400 capitalize">{auction.item.rarity}</p>
            </div>
          </div>
        </div>

        {/* Current Bid Display */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Current Bid</span>
            <span className="text-yellow-400 font-bold text-lg">
              {auction.currentBid > 0 ? formatGREP(auction.currentBid) : formatGREP(auction.startingPrice)} GREP
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Minimum Next Bid</span>
            <span className="text-green-400 font-bold">{formatGREP(quickBids.min)} GREP</span>
          </div>
        </div>

        {/* Quick Bid Buttons */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-3">Quick Bid Options</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickBid(quickBids.plus10)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-bold transition-all"
            >
              +10%
              <div className="text-xs opacity-80">{formatGREP(quickBids.plus10)}</div>
            </button>
            <button
              onClick={() => handleQuickBid(quickBids.plus25)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-lg font-bold transition-all"
            >
              +25%
              <div className="text-xs opacity-80">{formatGREP(quickBids.plus25)}</div>
            </button>
            <button
              onClick={() => handleQuickBid(quickBids.plus50)}
              className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white py-3 rounded-lg font-bold transition-all"
            >
              +50%
              <div className="text-xs opacity-80">{formatGREP(quickBids.plus50)}</div>
            </button>
          </div>
        </div>

        {/* Custom Bid Input */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Custom Bid Amount</label>
          <div className="relative">
            <input
              type="number"
              value={customBid}
              onChange={(e) => handleCustomBidChange(e.target.value)}
              placeholder={quickBids.min.toString()}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border-2 border-gray-700 focus:border-purple-500 focus:outline-none"
              min={quickBids.min}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">GREP</span>
          </div>
          {bidAmount < quickBids.min && (
            <p className="text-red-400 text-xs mt-2">
              Bid must be at least {formatGREP(quickBids.min)} GREP
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Bid Summary */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 mb-6 border border-purple-500/30">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Your Bid</span>
            <span className="text-2xl font-bold text-white">{formatGREP(bidAmount)} GREP</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isPlacingBid}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPlacingBid || bidAmount < quickBids.min}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlacingBid ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Placing Bid...
              </span>
            ) : (
              'Confirm Bid'
            )}
          </button>
        </div>

        {/* Info Note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Note: Bids placed in the last 5 minutes will extend the auction by 5 minutes
        </p>
      </div>
    </div>
  )
}
