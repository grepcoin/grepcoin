import { PrismaClient } from '@prisma/client'
import { GameMetrics } from '../types'

interface GameScore {
  id: string
  userId: string
  score: number
  duration: number | null
  createdAt: Date
}

export class GameMetricsAnalyzer {
  private prisma: PrismaClient

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient()
  }

  async analyzeGame(gameSlug: string): Promise<GameMetrics | null> {
    const game = await this.prisma.game.findUnique({
      where: { slug: gameSlug },
      include: {
        scores: {
          orderBy: { createdAt: 'desc' },
          take: 1000
        }
      }
    })

    if (!game) return null

    const scores = game.scores as GameScore[]
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const recentScores7d = scores.filter((s: GameScore) => s.createdAt >= sevenDaysAgo)
    const recentScores30d = scores.filter((s: GameScore) => s.createdAt >= thirtyDaysAgo)

    const uniquePlayers = new Set(scores.map((s: GameScore) => s.userId)).size
    const avgScore = scores.length > 0
      ? scores.reduce((sum: number, s: GameScore) => sum + s.score, 0) / scores.length
      : 0
    const avgDuration = scores.length > 0
      ? scores.reduce((sum: number, s: GameScore) => sum + (s.duration || 0), 0) / scores.length
      : 0

    // Estimate difficulty distribution based on scores
    const maxPossibleScore = game.maxReward * 100 // rough estimate
    const difficultyDistribution = this.calculateDifficultyDistribution(scores, maxPossibleScore)

    // Calculate trend
    const weeklyRate = recentScores7d.length / 7
    const monthlyRate = recentScores30d.length / 30
    let trend: 'rising' | 'stable' | 'declining' = 'stable'
    if (weeklyRate > monthlyRate * 1.2) trend = 'rising'
    else if (weeklyRate < monthlyRate * 0.8) trend = 'declining'

    return {
      gameSlug: game.slug,
      gameName: game.name,
      totalPlays: scores.length,
      uniquePlayers,
      avgScore: Math.round(avgScore),
      avgDuration: Math.round(avgDuration),
      completionRate: this.estimateCompletionRate(scores),
      difficultyDistribution,
      recentTrends: {
        playsLast7Days: recentScores7d.length,
        playsLast30Days: recentScores30d.length,
        trend
      }
    }
  }

  async analyzeAllGames(): Promise<GameMetrics[]> {
    const games = await this.prisma.game.findMany({
      where: { isActive: true },
      select: { slug: true }
    })

    const metrics: GameMetrics[] = []
    for (const game of games) {
      const gameMetrics = await this.analyzeGame(game.slug)
      if (gameMetrics) metrics.push(gameMetrics)
    }

    return metrics
  }

  private calculateDifficultyDistribution(
    scores: { score: number }[],
    maxScore: number
  ): GameMetrics['difficultyDistribution'] {
    if (scores.length === 0) {
      return { easy: 0, medium: 0, hard: 0, expert: 0 }
    }

    const distribution = { easy: 0, medium: 0, hard: 0, expert: 0 }

    for (const score of scores) {
      const ratio = score.score / maxScore
      if (ratio < 0.25) distribution.easy++
      else if (ratio < 0.5) distribution.medium++
      else if (ratio < 0.75) distribution.hard++
      else distribution.expert++
    }

    // Convert to percentages
    const total = scores.length
    return {
      easy: Math.round((distribution.easy / total) * 100),
      medium: Math.round((distribution.medium / total) * 100),
      hard: Math.round((distribution.hard / total) * 100),
      expert: Math.round((distribution.expert / total) * 100)
    }
  }

  private estimateCompletionRate(scores: { duration: number | null }[]): number {
    if (scores.length === 0) return 0

    // Games with duration > 30 seconds are considered "completed"
    const completed = scores.filter(s => (s.duration || 0) > 30).length
    return Math.round((completed / scores.length) * 100)
  }

  async disconnect() {
    await this.prisma.$disconnect()
  }
}
