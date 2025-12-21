'use client'
import { useEffect, useState } from 'react'
import { AuctionWithDetails, formatTimeRemaining, formatGREP, isEndingSoon } from '@/lib/auctions'
import { RARITY_COLORS } from '@/lib/inventory'

interface AuctionCardProps {
  auction: AuctionWithDetails
  onBidClick: () => void
  compact?: boolean
}

export function AuctionCard({ auction, onBidClick, compact = false }: AuctionCardProps) {
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(auction.endTime))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(auction.endTime))
    }, 1000)

    return () => clearInterval(interval)
  }, [auction.endTime])

  const minBid = auction.currentBid > 0 ? auction.currentBid + auction.minIncrement : auction.startingPrice
  const isEnding = isEndingSoon(auction.endTime)

  return (
    <div
      className={`relative rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-2xl ${
        RARITY_COLORS[auction.item.rarity as keyof typeof RARITY_COLORS]
      } border-2 ${compact ? 'p-3' : 'p-4'}`}
    >
      {/* Ending Soon Badge */}
      {isEnding && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 animate-pulse">
          🔥 ENDING SOON
        </div>
      )}

      {/* Item Preview */}
      <div className={`text-center mb-3 ${compact ? 'text-5xl' : 'text-6xl'}`}>
        {auction.item.icon}
      </div>

      {/* Item Info */}
      <div className="text-center mb-4">
        <h3 className={`font-bold truncate ${compact ? 'text-sm' : 'text-lg'}`}>
          {auction.item.name}
        </h3>
        <p className="text-xs text-gray-400 capitalize">{auction.item.rarity}</p>
      </div>

      {/* Current Bid */}
      <div className="bg-black/30 rounded-lg p-3 mb-3">
        <div className="text-xs text-gray-400 mb-1">Current Bid</div>
        <div className={`font-bold text-yellow-400 ${compact ? 'text-base' : 'text-xl'}`}>
          {auction.currentBid > 0 ? formatGREP(auction.currentBid) : formatGREP(auction.startingPrice)} GREP
        </div>
        {auction.currentBid === 0 && (
          <div className="text-xs text-gray-500 mt-1">Starting Price</div>
        )}
      </div>

      {/* Stats Row */}
      <div className="flex justify-between items-center mb-3 text-xs">
        <div className="flex items-center gap-1">
          <span>🔨</span>
          <span className="text-gray-400">{auction.bidCount} bids</span>
        </div>
        <div className={`font-bold ${isEnding ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
          {timeRemaining}
        </div>
      </div>

      {/* Seller Info */}
      {!compact && (
        <div className="text-xs text-gray-400 mb-3 flex items-center gap-1">
          <span>Seller:</span>
          <span className="font-mono">
            {auction.seller.username || `${auction.seller.walletAddress.slice(0, 6)}...${auction.seller.walletAddress.slice(-4)}`}
          </span>
        </div>
      )}

      {/* Bid Button */}
      <button
        onClick={onBidClick}
        className={`w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 ${
          compact ? 'py-2 text-sm' : 'py-3'
        }`}
      >
        Place Bid
      </button>

      {/* Minimum Next Bid */}
      <div className="text-center text-xs text-gray-500 mt-2">
        Min. bid: {formatGREP(minBid)} GREP
      </div>
    </div>
  )
}
