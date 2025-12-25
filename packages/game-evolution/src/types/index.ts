export interface GameMetrics {
  gameSlug: string
  gameName: string
  totalPlays: number
  uniquePlayers: number
  avgScore: number
  avgDuration: number
  completionRate: number
  difficultyDistribution: {
    easy: number
    medium: number
    hard: number
    expert: number
  }
  recentTrends: {
    playsLast7Days: number
    playsLast30Days: number
    trend: 'rising' | 'stable' | 'declining'
  }
}

export interface ContentSuggestion {
  type: 'regex_pattern' | 'code_snippet' | 'puzzle' | 'level' | 'challenge'
  game: string
  tier: 1 | 2 | 3 | 4
  content: Record<string, unknown>
  reasoning: string
}

export interface EvolutionPlan {
  id: string
  createdAt: string
  metrics: GameMetrics[]
  suggestions: ContentSuggestion[]
  summary: string
  estimatedImpact: string
}

export interface RegexPattern {
  pattern: string
  display: string
  hint: string
  examples: {
    matches: string[]
    nonMatches: string[]
  }
  tier: 1 | 2 | 3 | 4
}

export interface CodeSnippet {
  lines: string[]
  bugLine: number
  bugType: 'syntax' | 'typo' | 'logic' | 'runtime' | 'security'
  explanation: string
  tier: 1 | 2 | 3 | 4
  points: number
}

export interface RegexPuzzle {
  size: 3 | 4 | 5
  rowPatterns: string[]
  colPatterns: string[]
  solution: string[][]
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  points: number
}

export interface QuantumLevel {
  name: string
  targetPattern: number[]
  particles: number
  timeLimit: number
  requiredScore: number
}

export interface GeneratorConfig {
  model: 'claude-3-haiku-20240307' | 'claude-3-5-sonnet-20241022'
  maxTokens: number
  temperature: number
}
