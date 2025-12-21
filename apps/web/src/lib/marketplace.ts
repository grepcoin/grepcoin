export type Currency = 'grep' | 'eth'
export type ListingStatus = 'active' | 'sold' | 'cancelled' | 'expired'

export interface Listing {
  id: string
  sellerId: string
  sellerUsername?: string
  sellerWallet: string
  itemId: string
  itemName: string
  itemType: string
  itemRarity: string
  itemIcon: string
  price: number
  currency: Currency
  status: ListingStatus
  listedAt: Date
  expiresAt: Date
  soldAt?: Date
  buyerId?: string
  buyerUsername?: string
}

export interface MarketplaceFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  currency?: Currency
  sortBy?: 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc' | 'popular'
  page?: number
  limit?: number
}

// Marketplace fee: 5% of sale price
export const MARKETPLACE_FEE = 0.05

// Default listing duration: 7 days
export const DEFAULT_LISTING_DURATION = 7 * 24 * 60 * 60 * 1000

// Helper function to calculate marketplace fee
export function calculateFee(price: number): number {
  return Math.floor(price * MARKETPLACE_FEE)
}

// Helper function to calculate seller proceeds (price - fee)
export function calculateSellerProceeds(price: number): number {
  return price - calculateFee(price)
}

// Helper function to format price display
export function formatPrice(price: number, currency: Currency): string {
  if (currency === 'grep') {
    return `${price.toLocaleString()} GREP`
  }
  return `${(price / 1e18).toFixed(4)} ETH`
}

// Helper function to check if listing is expired
export function isListingExpired(expiresAt: Date): boolean {
  return new Date(expiresAt) < new Date()
}

// Helper function to get time remaining
export function getTimeRemaining(expiresAt: Date): string {
  const now = new Date()
  const expires = new Date(expiresAt)
  const diff = expires.getTime() - now.getTime()

  if (diff <= 0) {
    return 'Expired'
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days}d ${hours}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

// Validate listing price
export function validatePrice(price: number, currency: Currency): { valid: boolean; error?: string } {
  if (price <= 0) {
    return { valid: false, error: 'Price must be greater than 0' }
  }

  if (currency === 'grep') {
    if (price < 100) {
      return { valid: false, error: 'Minimum price is 100 GREP' }
    }
    if (price > 1000000) {
      return { valid: false, error: 'Maximum price is 1,000,000 GREP' }
    }
  }

  return { valid: true }
}

// Get rarity color classes
export function getRarityColor(rarity: string): string {
  const rarityColors: Record<string, string> = {
    common: 'border-gray-500 bg-gray-900/50',
    rare: 'border-blue-500 bg-blue-900/30',
    epic: 'border-purple-500 bg-purple-900/30',
    legendary: 'border-yellow-500 bg-yellow-900/30',
  }
  return rarityColors[rarity] || rarityColors.common
}

// Get rarity text color
export function getRarityTextColor(rarity: string): string {
  const textColors: Record<string, string> = {
    common: 'text-gray-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-yellow-400',
  }
  return textColors[rarity] || textColors.common
}
