export * from './types'
export * from './validators/score-validator'
export * from './validators/timing-validator'
export * from './validators/rate-validator'

import { GameSubmissionData, ValidationResult } from './types'
import { validateScore } from './validators/score-validator'
import { validateTiming } from './validators/timing-validator'
import { validateRate } from './validators/rate-validator'

export function validateGameSubmission(data: GameSubmissionData): ValidationResult {
  const allErrors: string[] = []
  const allWarnings: string[] = []
  let minConfidence = 1.0

  const scoreResult = validateScore(data)
  allErrors.push(...scoreResult.errors)
  if (scoreResult.warnings) allWarnings.push(...scoreResult.warnings)
  if (scoreResult.confidence !== undefined) minConfidence = Math.min(minConfidence, scoreResult.confidence)

  const timingResult = validateTiming(data)
  allErrors.push(...timingResult.errors)
  if (timingResult.warnings) allWarnings.push(...timingResult.warnings)
  if (timingResult.confidence !== undefined) minConfidence = Math.min(minConfidence, timingResult.confidence)

  const rateResult = validateRate(data)
  allErrors.push(...rateResult.errors)
  if (rateResult.warnings) allWarnings.push(...rateResult.warnings)
  if (rateResult.confidence !== undefined) minConfidence = Math.min(minConfidence, rateResult.confidence)

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings.length > 0 ? allWarnings : undefined,
    confidence: minConfidence,
  }
}
