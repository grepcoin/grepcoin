import { GameSubmissionData, SubmissionRecord, RateLimitConfig, ValidationResult } from '../types'

const DEFAULT_RATE_LIMITS: RateLimitConfig = {
  maxPerMinute: 6,
  maxPerHour: 100,
  cooldownMs: 10000,
}

export function validateRate(
  data: GameSubmissionData,
  config: RateLimitConfig = DEFAULT_RATE_LIMITS
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!data.submissionHistory || data.submissionHistory.length === 0) {
    return { valid: true, errors: [], warnings: ['No submission history available'] }
  }

  const now = Date.now()
  const oneMinuteAgo = now - 60000
  const oneHourAgo = now - 3600000

  const submissionsLastMinute = data.submissionHistory.filter(
    (sub) => sub.timestamp > oneMinuteAgo
  ).length

  if (submissionsLastMinute >= config.maxPerMinute) {
    errors.push(`Too many submissions in last minute: ${submissionsLastMinute}`)
  }

  const submissionsLastHour = data.submissionHistory.filter(
    (sub) => sub.timestamp > oneHourAgo
  ).length

  if (submissionsLastHour >= config.maxPerHour) {
    errors.push(`Too many submissions in last hour: ${submissionsLastHour}`)
  }

  const mostRecentSubmission = data.submissionHistory
    .sort((a, b) => b.timestamp - a.timestamp)[0]

  if (mostRecentSubmission) {
    const timeSinceLastSubmission = now - mostRecentSubmission.timestamp
    if (timeSinceLastSubmission < config.cooldownMs) {
      errors.push(`Cooldown period not met`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
    confidence: errors.length === 0 ? (warnings.length === 0 ? 1.0 : 0.8) : 0.0,
  }
}

export function getRemainingQuota(
  submissionHistory: SubmissionRecord[],
  config: RateLimitConfig = DEFAULT_RATE_LIMITS
): { remainingPerMinute: number; remainingPerHour: number; cooldownRemaining: number } {
  const now = Date.now()
  const oneMinuteAgo = now - 60000
  const oneHourAgo = now - 3600000

  const submissionsLastMinute = submissionHistory.filter(
    (sub) => sub.timestamp > oneMinuteAgo
  ).length

  const submissionsLastHour = submissionHistory.filter(
    (sub) => sub.timestamp > oneHourAgo
  ).length

  const mostRecentSubmission = submissionHistory
    .sort((a, b) => b.timestamp - a.timestamp)[0]

  const cooldownRemaining = mostRecentSubmission
    ? Math.max(0, config.cooldownMs - (now - mostRecentSubmission.timestamp))
    : 0

  return {
    remainingPerMinute: Math.max(0, config.maxPerMinute - submissionsLastMinute),
    remainingPerHour: Math.max(0, config.maxPerHour - submissionsLastHour),
    cooldownRemaining,
  }
}
