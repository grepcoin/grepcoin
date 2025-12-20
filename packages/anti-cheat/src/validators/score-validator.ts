import { GameSubmissionData, GameConfig, ValidationResult } from '../types'

/**
 * Game configurations based on PLAN-STREAM2-GAME-BACKEND.md
 */
const GAME_CONFIGS: Record<string, GameConfig> = {
  'regex-rush': {
    slug: 'regex-rush',
    minScore: 0,
    maxScore: 1000,
    minDuration: 30000,
    maxDuration: 300000,
    maxStreakValue: 50,
    maxScorePerMinute: 1000,
  },
  'memory-match': {
    slug: 'memory-match',
    minScore: 0,
    maxScore: 500,
    minDuration: 60000,
    maxDuration: 600000,
    maxStreakValue: 20,
    maxScorePerMinute: 500,
  },
  'speed-type': {
    slug: 'speed-type',
    minScore: 0,
    maxScore: 2000,
    minDuration: 15000,
    maxDuration: 180000,
    maxStreakValue: 100,
    maxScorePerMinute: 2000,
  },
  'code-breaker': {
    slug: 'code-breaker',
    minScore: 0,
    maxScore: 800,
    minDuration: 30000,
    maxDuration: 300000,
    maxStreakValue: 30,
    maxScorePerMinute: 800,
  },
  'bug-hunter': {
    slug: 'bug-hunter',
    minScore: 0,
    maxScore: 1200,
    minDuration: 45000,
    maxDuration: 360000,
    maxStreakValue: 40,
    maxScorePerMinute: 1200,
  },
  'quantum-grep': {
    slug: 'quantum-grep',
    minScore: 0,
    maxScore: 1500,
    minDuration: 60000,
    maxDuration: 420000,
    maxStreakValue: 60,
    maxScorePerMinute: 1500,
  },
  'regex-crossword': {
    slug: 'regex-crossword',
    minScore: 0,
    maxScore: 1000,
    minDuration: 90000,
    maxDuration: 600000,
    maxStreakValue: 25,
    maxScorePerMinute: 600,
  },
  'merge-miners': {
    slug: 'merge-miners',
    minScore: 0,
    maxScore: 3000,
    minDuration: 120000,
    maxDuration: 900000,
    maxStreakValue: 80,
    maxScorePerMinute: 1500,
  },
  'syntax-sprint': {
    slug: 'syntax-sprint',
    minScore: 0,
    maxScore: 1800,
    minDuration: 20000,
    maxDuration: 240000,
    maxStreakValue: 70,
    maxScorePerMinute: 1800,
  },
  'grep-rails': {
    slug: 'grep-rails',
    minScore: 0,
    maxScore: 2500,
    minDuration: 30000,
    maxDuration: 300000,
    maxStreakValue: 90,
    maxScorePerMinute: 2500,
  },
}

export function validateScore(data: GameSubmissionData): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const config = GAME_CONFIGS[data.gameSlug]

  if (!config) {
    errors.push(`Unknown game: ${data.gameSlug}`)
    return { valid: false, errors, warnings }
  }

  if (data.score < config.minScore) {
    errors.push(`Score ${data.score} is below minimum ${config.minScore}`)
  }

  if (data.score > config.maxScore) {
    errors.push(`Score ${data.score} exceeds maximum ${config.maxScore}`)
  }

  if (data.streak !== undefined) {
    if (data.streak < 0) {
      errors.push(`Invalid negative streak: ${data.streak}`)
    }

    if (data.streak > config.maxStreakValue) {
      errors.push(`Streak ${data.streak} exceeds maximum ${config.maxStreakValue}`)
    }

    if (data.streak > config.maxStreakValue * 0.8 && data.score < config.maxScore * 0.3) {
      warnings.push(`High streak (${data.streak}) with low score (${data.score}) is unusual`)
    }
  }

  if (data.previousScore !== undefined) {
    const scoreDiff = data.score - data.previousScore
    const maxJump = config.maxScore * 0.5

    if (scoreDiff > maxJump) {
      warnings.push(`Large score jump: ${data.previousScore} -> ${data.score}`)
    }

    if (data.previousScore === 0 && data.score > config.maxScore * 0.9) {
      errors.push(`Suspicious score progression: 0 to ${data.score}`)
    }
  }

  const durationMinutes = data.duration / 60000
  const scorePerMinute = data.score / durationMinutes

  if (scorePerMinute > config.maxScorePerMinute * 1.1) {
    errors.push(`Score rate ${scorePerMinute.toFixed(0)} points/min exceeds maximum`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
    confidence: errors.length === 0 ? (warnings.length === 0 ? 1.0 : 0.7) : 0.0,
  }
}

export function getGameConfig(gameSlug: string): GameConfig | undefined {
  return GAME_CONFIGS[gameSlug]
}

export function getSupportedGames(): string[] {
  return Object.keys(GAME_CONFIGS)
}
