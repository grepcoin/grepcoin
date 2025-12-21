'use client'

import { useState } from 'react'
import { Clock, User, ShoppingCart, X } from 'lucide-react'
import type { Listing } from '@/lib/marketplace'
import {
  formatPrice,
  getTimeRemaining,
  getRarityColor,
  getRarityTextColor,
  calculateFee,
  calculateSellerProceeds,
} from '@/lib/marketplace'
import { buyItem, cancelListing } from '@/hooks/useMarketplace'

interface ListingCardProps {
  listing: Listing
  currentUserId?: string
  onPurchaseSuccess?: () => void
  onCancelSuccess?: () => void
}

export default function ListingCard({
  listing,
  currentUserId,
  onPurchaseSuccess,
  onCancelSuccess,
}: ListingCardProps) {
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOwnListing = currentUserId === listing.sellerId
  const timeRemaining = getTimeRemaining(listing.expiresAt)
  const isExpired = timeRemaining === 'Expired'

  const handleBuy = async () => {
    setIsProcessing(true)
    setError(null)

    const result = await buyItem(listing.id)

    if (result.success) {
      setShowBuyModal(false)
      onPurchaseSuccess?.()
    } else {
      setError(result.error || 'Purchase failed')
    }

    setIsProcessing(false)
  }

  const handleCancel = async () => {
    setIsProcessing(true)
    setError(null)

    const result = await cancelListing(listing.id)

    if (result.success) {
      setShowCancelModal(false)
      onCancelSuccess?.()
    } else {
      setError(result.error || 'Cancellation failed')
    }

    setIsProcessing(false)
  }

  return (
    <>
      <div
        className={`bg-dark-800 rounded-xl border p-4 transition-all hover:border-dark-500 ${getRarityColor(
          listing.itemRarity
        )}`}
      >
        {/* Item Icon/Image */}
        <div className="mb-3">
          <div className="w-full aspect-square rounded-lg bg-dark-700 flex items-center justify-center text-6xl">
            {listing.itemIcon}
          </div>
        </div>

        {/* Item Name & Rarity */}
        <div className="mb-2">
          <h3 className="font-bold text-white mb-1">{listing.itemName}</h3>
          <span className={`text-xs font-medium uppercase ${getRarityTextColor(listing.itemRarity)}`}>
            {listing.itemRarity}
          </span>
        </div>

        {/* Seller Info */}
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
          <User className="w-3 h-3" />
          <span className="truncate">
            {listing.sellerUsername || `${listing.sellerWallet.slice(0, 6)}...${listing.sellerWallet.slice(-4)}`}
          </span>
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="text-2xl font-bold text-grep-orange">
            {formatPrice(listing.price, listing.currency)}
          </div>
          {listing.currency === 'grep' && (
            <div className="text-xs text-gray-400 mt-1">
              Fee: {calculateFee(listing.price)} GREP
            </div>
          )}
        </div>

        {/* Time Remaining */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className={isExpired ? 'text-red-400' : 'text-gray-400'}>
            {timeRemaining}
          </span>
        </div>

        {/* Action Button */}
        {isOwnListing ? (
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={listing.status !== 'active' || isExpired}
            className="w-full py-2 rounded-lg bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel Listing
          </button>
        ) : (
          <button
            onClick={() => setShowBuyModal(true)}
            disabled={listing.status !== 'active' || isExpired}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-grep-purple to-grep-pink text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Buy Now
          </button>
        )}
      </div>

      {/* Buy Confirmation Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl border border-dark-600 p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Confirm Purchase</h2>

            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-dark-700 rounded-lg">
                <div className="text-3xl">{listing.itemIcon}</div>
                <div>
                  <div className="font-medium text-white">{listing.itemName}</div>
                  <div className={`text-xs ${getRarityTextColor(listing.itemRarity)}`}>
                    {listing.itemRarity}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-dark-700 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-white font-medium">
                    {formatPrice(listing.price, listing.currency)}
                  </span>
                </div>
                {listing.currency === 'grep' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Marketplace Fee (5%):</span>
                      <span className="text-gray-400">
                        {calculateFee(listing.price)} GREP
                      </span>
                    </div>
                    <div className="border-t border-dark-600 pt-2 flex justify-between">
                      <span className="text-white font-medium">Total:</span>
                      <span className="text-grep-orange font-bold">
                        {formatPrice(listing.price, listing.currency)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBuyModal(false)}
                disabled={isProcessing}
                className="flex-1 py-2 rounded-lg bg-dark-700 text-white font-medium hover:bg-dark-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBuy}
                disabled={isProcessing}
                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-grep-purple to-grep-pink text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl border border-dark-600 p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Cancel Listing</h2>

            <p className="text-gray-400 mb-6">
              Are you sure you want to cancel this listing? The item will be returned to your inventory.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={isProcessing}
                className="flex-1 py-2 rounded-lg bg-dark-700 text-white font-medium hover:bg-dark-600 transition-colors disabled:opacity-50"
              >
                Keep Listing
              </button>
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Cancelling...' : 'Cancel Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
