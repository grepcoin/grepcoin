/**
 * Game submission data for validation
 */
export interface GameSubmissionData {
  gameSlug: string
  userId: string
  score: number
  streak?: number
  duration: number // in milliseconds
  sessionStartTime?: number // timestamp when session started
  previousScore?: number // previous score from this user in this game
  submissionHistory?: SubmissionRecord[] // recent submissions from this user
}

/**
 * Previous submission record for rate validation
 */
export interface SubmissionRecord {
  timestamp: number
  gameSlug: string
  score: number
}

/**
 * Game configuration for validation
 */
export interface GameConfig {
  slug: string
  minScore: number
  maxScore: number
  minDuration: number // minimum realistic duration in ms
  maxDuration: number // maximum realistic duration in ms
  maxStreakValue: number
  maxScorePerMinute: number // maximum score achievable per minute
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings?: string[]
  confidence?: number // 0-1, how confident we are this is legitimate
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxPerMinute: number
  maxPerHour: number
  cooldownMs: number // required time between submissions
}
