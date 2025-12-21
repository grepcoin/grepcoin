'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Store, SlidersHorizontal, Search, Package, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMarketplace } from '@/hooks/useMarketplace'
import ListingCard from '@/components/ListingCard'
import type { MarketplaceFilters } from '@/lib/marketplace'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

type SortOption = 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc'

const CATEGORIES = [
  { id: '', label: 'All Items' },
  { id: 'cosmetic', label: 'Cosmetics' },
  { id: 'booster', label: 'Boosters' },
  { id: 'consumable', label: 'Consumables' },
  { id: 'badge', label: 'Badges' },
  { id: 'special', label: 'Special' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

export default function MarketplacePage() {
  const { isConnected } = useAccount()
  const { user } = useAuth()
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter state
  const [filters, setFilters] = useState<MarketplaceFilters>({
    category: '',
    minPrice: undefined,
    maxPrice: undefined,
    currency: undefined,
    sortBy: 'date_desc',
    page: 1,
    limit: 20,
  })

  // Fetch listings with current filters
  const { listings, isLoading, error, pagination, refetch } = useMarketplace(filters)

  const handleFilterChange = (key: keyof MarketplaceFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: undefined,
      maxPrice: undefined,
      currency: undefined,
      sortBy: 'date_desc',
      page: 1,
      limit: 20,
    })
    setSearchQuery('')
  }

  const filteredListings = listings.filter((listing) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      listing.itemName.toLowerCase().includes(query) ||
      listing.itemType.toLowerCase().includes(query) ||
      listing.sellerUsername?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Store className="w-8 h-8 text-grep-purple" />
                Marketplace
              </h1>
              <p className="text-gray-400 mt-1">Trade items with other players</p>
            </div>
            <Link
              href="/inventory"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-grep-orange to-yellow-500 text-dark-900 font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Sell Items
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-dark-800 rounded-lg border border-dark-600 p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Store className="w-4 h-4" />
                Active Listings
              </div>
              <div className="text-2xl font-bold text-white">
                {pagination?.total.toLocaleString() || 0}
              </div>
            </div>
            <div className="bg-dark-800 rounded-lg border border-dark-600 p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                Total Volume
              </div>
              <div className="text-2xl font-bold text-grep-orange">
                1.2M GREP
              </div>
            </div>
            <div className="bg-dark-800 rounded-lg border border-dark-600 p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Package className="w-4 h-4" />
                Items Sold (24h)
              </div>
              <div className="text-2xl font-bold text-grep-green">
                156
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search items or sellers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white placeholder-gray-400 focus:outline-none focus:border-grep-purple transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg border flex items-center gap-2 font-medium transition-colors ${
                showFilters
                  ? 'bg-grep-purple border-grep-purple text-white'
                  : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-dark-500'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 p-6 bg-dark-800 rounded-xl border border-dark-600">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-white focus:outline-none focus:border-grep-purple transition-colors"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Min Price (GREP)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice || ''}
                  onChange={(e) =>
                    handleFilterChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  className="w-full px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-white placeholder-gray-500 focus:outline-none focus:border-grep-purple transition-colors"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Max Price (GREP)</label>
                <input
                  type="number"
                  placeholder="No limit"
                  value={filters.maxPrice || ''}
                  onChange={(e) =>
                    handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  className="w-full px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-white placeholder-gray-500 focus:outline-none focus:border-grep-purple transition-colors"
                />
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-white focus:outline-none focus:border-grep-purple transition-colors"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={clearFilters}
              className="text-sm text-grep-purple hover:text-grep-pink transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleFilterChange('category', cat.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filters.category === cat.id
                  ? 'bg-gradient-to-r from-grep-purple to-grep-pink text-white'
                  : 'bg-dark-800 text-gray-400 hover:bg-dark-700 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Not Connected State */}
        {!isConnected && (
          <div className="text-center py-20">
            <Store className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-400 mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-gray-500">
              Connect your wallet to browse and trade items on the marketplace
            </p>
          </div>
        )}

        {/* Loading State */}
        {isConnected && isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-grep-purple border-t-transparent rounded-full" />
          </div>
        )}

        {/* Error State */}
        {isConnected && error && (
          <div className="text-center py-20">
            <div className="text-red-400 mb-4">{error}</div>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 rounded-lg bg-grep-purple text-white font-medium hover:bg-grep-pink transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Listings Grid */}
        {isConnected && !isLoading && !error && (
          <>
            {filteredListings.length === 0 ? (
              <div className="text-center py-20">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-400 mb-2">
                  No items found
                </h2>
                <p className="text-gray-500 mb-4">
                  Try adjusting your filters or check back later
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-lg bg-grep-purple text-white font-medium hover:bg-grep-pink transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {filteredListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      currentUserId={user?.walletAddress}
                      onPurchaseSuccess={refetch}
                      onCancelSuccess={refetch}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(filters.page! - 1)}
                      disabled={filters.page === 1}
                      className="p-2 rounded-lg bg-dark-800 border border-dark-600 text-white hover:bg-dark-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                        .filter((page) => {
                          const current = filters.page || 1
                          return (
                            page === 1 ||
                            page === pagination.pages ||
                            (page >= current - 1 && page <= current + 1)
                          )
                        })
                        .map((page, idx, arr) => (
                          <div key={page} className="flex items-center gap-2">
                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                              <span className="text-gray-500">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filters.page === page
                                  ? 'bg-gradient-to-r from-grep-purple to-grep-pink text-white'
                                  : 'bg-dark-800 border border-dark-600 text-gray-400 hover:bg-dark-700 hover:text-white'
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(filters.page! + 1)}
                      disabled={filters.page === pagination.pages}
                      className="p-2 rounded-lg bg-dark-800 border border-dark-600 text-white hover:bg-dark-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Info Section */}
        <div className="mt-12 p-6 bg-dark-800 rounded-xl border border-dark-600">
          <h2 className="text-lg font-semibold text-white mb-4">Marketplace Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="text-grep-purple font-medium mb-2">Trading Fee</h3>
              <p className="text-gray-400">
                A 5% marketplace fee is applied to all sales. Sellers receive 95% of the listing price.
              </p>
            </div>
            <div>
              <h3 className="text-grep-purple font-medium mb-2">Listing Duration</h3>
              <p className="text-gray-400">
                Listings are active for 7 days. You can cancel your listing at any time to get your item back.
              </p>
            </div>
            <div>
              <h3 className="text-grep-purple font-medium mb-2">Tradeable Items</h3>
              <p className="text-gray-400">
                Only certain items can be traded. Check the item details to see if it's tradeable.
              </p>
            </div>
            <div>
              <h3 className="text-grep-purple font-medium mb-2">Payment Methods</h3>
              <p className="text-gray-400">
                Currently supporting GREP tokens. ETH payments coming soon!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
