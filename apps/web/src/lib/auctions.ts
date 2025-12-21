// Auction types and utilities for GrepCoin Auction House

export enum AuctionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED',
}

export interface Auction {
  id: string
  sellerId: string
  itemId: string
  startingPrice: number
  currentBid: number
  highestBidderId: string | null
  startTime: Date
  endTime: Date
  status: AuctionStatus
  minIncrement: number
  createdAt: Date
  updatedAt: Date
}

export interface Bid {
  id: string
  auctionId: string
  bidderId: string
  amount: number
  timestamp: Date
  isWinning: boolean
}

export interface AuctionWithDetails extends Auction {
  seller: {
    id: string
    walletAddress: string
    username: string | null
    avatar: string | null
  }
  item: {
    id: string
    name: string
    description: string
    icon: string
    rarity: string
  }
  highestBidder?: {
    id: string
    walletAddress: string
    username: string | null
    avatar: string | null
  }
  bidCount: number
  bids?: Bid[]
}

// Validation helpers
export function validateBid(
  amount: number,
  currentBid: number,
  startingPrice: number,
  minIncrement: number
): { valid: boolean; error?: string } {
  const minRequired = currentBid > 0 ? currentBid + minIncrement : startingPrice

  if (amount < minRequired) {
    return {
      valid: false,
      error: `Bid must be at least ${minRequired} GREP`,
    }
  }

  return { valid: true }
}

// Time helpers
export function getTimeRemaining(endTime: Date): {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
} {
  const total = new Date(endTime).getTime() - Date.now()

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  }

  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))

  return { days, hours, minutes, seconds, total }
}

export function formatTimeRemaining(endTime: Date): string {
  const { days, hours, minutes, seconds, total } = getTimeRemaining(endTime)

  if (total <= 0) {
    return 'Ended'
  }

  if (days > 0) {
    return `${days}d ${hours}h`
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }

  return `${seconds}s`
}

export function isEndingSoon(endTime: Date, threshold: number = 3600000): boolean {
  const remaining = new Date(endTime).getTime() - Date.now()
  return remaining > 0 && remaining <= threshold // Within 1 hour by default
}

// Check if bid was placed in last 5 minutes (for auction extension)
export function shouldExtendAuction(endTime: Date, bidTime: Date): boolean {
  const timeToEnd = new Date(endTime).getTime() - new Date(bidTime).getTime()
  return timeToEnd < 5 * 60 * 1000 // Less than 5 minutes remaining
}

// Calculate new end time if auction needs extension
export function calculateExtendedEndTime(currentEndTime: Date): Date {
  return new Date(new Date(currentEndTime).getTime() + 5 * 60 * 1000) // Add 5 minutes
}

// Quick bid amounts
export function calculateQuickBids(currentBid: number, startingPrice: number, minIncrement: number): {
  min: number
  plus10: number
  plus25: number
  plus50: number
} {
  const minBid = currentBid > 0 ? currentBid + minIncrement : startingPrice

  return {
    min: minBid,
    plus10: Math.ceil(minBid * 1.1),
    plus25: Math.ceil(minBid * 1.25),
    plus50: Math.ceil(minBid * 1.5),
  }
}

// Status checks
export function isAuctionActive(auction: Auction): boolean {
  return (
    auction.status === AuctionStatus.ACTIVE &&
    new Date(auction.endTime).getTime() > Date.now()
  )
}

export function canPlaceBid(auction: Auction, userId: string): boolean {
  if (!isAuctionActive(auction)) {
    return false
  }

  // Can't bid on your own auction
  if (auction.sellerId === userId) {
    return false
  }

  return true
}

// Format currency
export function formatGREP(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount)
}
