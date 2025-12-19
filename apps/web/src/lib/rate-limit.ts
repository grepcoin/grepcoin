type RateLimitStore = Map<string, { count: number; resetAt: number }>

const stores: Map<string, RateLimitStore> = new Map()

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  limit: number // Max requests per window
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  key: string,
  config: RateLimitConfig,
  storeName: string = 'default'
): RateLimitResult {
  const now = Date.now()

  // Get or create store
  if (!stores.has(storeName)) {
    stores.set(storeName, new Map())
  }
  const store = stores.get(storeName)!

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    for (const [k, v] of store) {
      if (v.resetAt < now) store.delete(k)
    }
  }

  // Get or create entry
  let entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + config.interval }
    store.set(key, entry)
  }

  entry.count++

  return {
    success: entry.count <= config.limit,
    remaining: Math.max(0, config.limit - entry.count),
    resetAt: entry.resetAt,
  }
}

// Pre-configured rate limiters
export const rateLimiters = {
  // Auth endpoints: 10 requests per minute
  auth: (ip: string) => rateLimit(ip, { interval: 60_000, limit: 10 }, 'auth'),

  // Game submissions: 30 per minute per wallet
  gameSubmit: (wallet: string) =>
    rateLimit(wallet, { interval: 60_000, limit: 30 }, 'game-submit'),

  // General API: 100 requests per minute per IP
  api: (ip: string) => rateLimit(ip, { interval: 60_000, limit: 100 }, 'api'),

  // Challenge completions: 5 per minute per wallet
  challenge: (wallet: string) =>
    rateLimit(wallet, { interval: 60_000, limit: 5 }, 'challenge'),
}
