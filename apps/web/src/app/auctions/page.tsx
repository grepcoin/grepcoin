'use client'
import { useState } from 'react'
import { useAuctions } from '@/hooks/useAuctions'
import { AuctionCard } from '@/components/AuctionCard'
import { BidModal } from '@/components/BidModal'
import { AuctionWithDetails } from '@/lib/auctions'

const ITEM_TYPES = [
  { id: 'all', name: 'All Items', icon: '🎯' },
  { id: 'cosmetic', name: 'Cosmetics', icon: '👑' },
  { id: 'booster', name: 'Boosters', icon: '⚡' },
  { id: 'consumable', name: 'Consumables', icon: '📦' },
  { id: 'badge', name: 'Badges', icon: '💎' },
]

export default function AuctionsPage() {
  const [selectedType, setSelectedType] = useState('all')
  const [selectedAuction, setSelectedAuction] = useState<AuctionWithDetails | null>(null)
  const [showBidModal, setShowBidModal] = useState(false)

  // Fetch all active auctions
  const {
    auctions: allAuctions,
    isLoading: isLoadingAll,
    refetch: refetchAll,
  } = useAuctions({
    itemType: selectedType === 'all' ? undefined : selectedType,
    limit: 50,
    autoRefresh: true,
  })

  // Fetch ending soon auctions
  const {
    auctions: endingSoonAuctions,
    isLoading: isLoadingEndingSoon,
    refetch: refetchEndingSoon,
  } = useAuctions({
    endingSoon: true,
    limit: 10,
    autoRefresh: true,
  })

  const handleBidClick = (auction: AuctionWithDetails) => {
    setSelectedAuction(auction)
    setShowBidModal(true)
  }

  const handleBidSuccess = () => {
    setShowBidModal(false)
    refetchAll()
    refetchEndingSoon()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Auction House
          </h1>
          <p className="text-gray-400 text-lg">
            Bid on exclusive items and collectibles
          </p>
        </div>

        {/* Ending Soon Section */}
        {!isLoadingEndingSoon && endingSoonAuctions.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">🔥</span>
              <h2 className="text-2xl font-bold text-red-500">Ending Soon</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {endingSoonAuctions.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  onBidClick={() => handleBidClick(auction)}
                  compact
                />
              ))}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {ITEM_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedType === type.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {type.icon} {type.name}
            </button>
          ))}
        </div>

        {/* All Auctions */}
        {isLoadingAll ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="text-gray-400 mt-4">Loading auctions...</p>
          </div>
        ) : allAuctions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏛️</div>
            <h3 className="text-2xl font-bold mb-2">No Active Auctions</h3>
            <p className="text-gray-400">Check back later for new listings!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allAuctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                onBidClick={() => handleBidClick(auction)}
              />
            ))}
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-purple-500">{allAuctions.length}</div>
            <div className="text-sm text-gray-400">Active Auctions</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-red-500">{endingSoonAuctions.length}</div>
            <div className="text-sm text-gray-400">Ending Soon</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-yellow-500">
              {allAuctions.reduce((sum, a) => sum + a.bidCount, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Bids</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-500">
              {Math.max(...allAuctions.map((a) => a.currentBid || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Highest Bid (GREP)</div>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      {showBidModal && selectedAuction && (
        <BidModal
          auction={selectedAuction}
          onClose={() => setShowBidModal(false)}
          onSuccess={handleBidSuccess}
        />
      )}
    </div>
  )
}
