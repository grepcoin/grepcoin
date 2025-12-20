import { GameSubmissionData, ValidationResult } from '../types'
import { getGameConfig } from './score-validator'

export function validateTiming(data: GameSubmissionData): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const config = getGameConfig(data.gameSlug)

  if (!config) {
    errors.push(`Unknown game: ${data.gameSlug}`)
    return { valid: false, errors, warnings }
  }

  if (data.duration < 0) {
    errors.push(`Invalid negative duration: ${data.duration}ms`)
  }

  if (data.duration < config.minDuration) {
    errors.push(`Duration ${data.duration}ms is below minimum ${config.minDuration}ms`)
  }

  if (data.duration > config.maxDuration) {
    errors.push(`Duration ${data.duration}ms exceeds maximum ${config.maxDuration}ms`)
  }

  if (data.sessionStartTime) {
    const now = Date.now()
    const sessionAge = now - data.sessionStartTime

    if (data.sessionStartTime > now) {
      errors.push(`Session start time is in the future`)
    }

    const timeTolerance = 5000
    if (Math.abs(sessionAge - data.duration) > timeTolerance) {
      warnings.push(`Session age doesn't match reported duration`)
    }

    const maxSessionAge = 24 * 60 * 60 * 1000
    if (sessionAge > maxSessionAge) {
      errors.push(`Session is too old`)
    }
  }

  const minHumanDuration = 1000
  if (data.duration < minHumanDuration && data.score > 0) {
    errors.push(`Duration ${data.duration}ms is impossibly fast`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
    confidence: errors.length === 0 ? (warnings.length === 0 ? 1.0 : 0.75) : 0.0,
  }
}
