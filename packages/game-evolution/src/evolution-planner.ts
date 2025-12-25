import { GameMetricsAnalyzer } from './analyzers'
import { RegexPatternGenerator, CodeSnippetGenerator } from './generators'
import { AIProvider, createProvider, ProviderType } from './providers'
import {
  EvolutionPlan,
  GameMetrics,
  ContentSuggestion
} from './types'

export class EvolutionPlanner {
  private analyzer: GameMetricsAnalyzer
  private regexGenerator: RegexPatternGenerator
  private codeGenerator: CodeSnippetGenerator
  private provider: AIProvider | null = null
  private providerType: ProviderType

  constructor(providerType: ProviderType = 'auto') {
    this.providerType = providerType
    this.analyzer = new GameMetricsAnalyzer()
    this.regexGenerator = new RegexPatternGenerator(providerType)
    this.codeGenerator = new CodeSnippetGenerator(providerType)
  }

  private async ensureProvider(): Promise<AIProvider> {
    if (!this.provider) {
      this.provider = await createProvider(this.providerType)
    }
    return this.provider
  }

  async createEvolutionPlan(): Promise<EvolutionPlan> {
    console.log('📊 Analyzing game metrics...')
    const metrics = await this.analyzer.analyzeAllGames()

    console.log('🎮 Generating content suggestions...')
    const suggestions = await this.generateSuggestions(metrics)

    console.log('📝 Creating evolution summary...')
    const { summary, estimatedImpact } = await this.createSummary(metrics, suggestions)

    const plan: EvolutionPlan = {
      id: `evolution-${Date.now()}`,
      createdAt: new Date().toISOString(),
      metrics,
      suggestions,
      summary,
      estimatedImpact
    }

    await this.analyzer.disconnect()
    return plan
  }

  private async generateSuggestions(metrics: GameMetrics[]): Promise<ContentSuggestion[]> {
    const suggestions: ContentSuggestion[] = []

    for (const gameMetrics of metrics) {
      const gameSuggestions = await this.generateForGame(gameMetrics)
      suggestions.push(...gameSuggestions)
    }

    return suggestions
  }

  private async generateForGame(metrics: GameMetrics): Promise<ContentSuggestion[]> {
    const suggestions: ContentSuggestion[] = []

    // Determine what tier needs more content based on distribution
    const needsTier = this.identifyNeededTier(metrics)

    switch (metrics.gameSlug) {
      case 'grep-rails':
      case 'regex-crossword':
        const patterns = await this.regexGenerator.generatePatterns(3, needsTier, metrics)
        for (const pattern of patterns) {
          suggestions.push({
            type: 'regex_pattern',
            game: metrics.gameSlug,
            tier: needsTier,
            content: pattern as unknown as Record<string, unknown>,
            reasoning: this.getPatternReasoning(metrics, needsTier)
          })
        }
        break

      case 'bug-hunter':
        const snippets = await this.codeGenerator.generateSnippets(3, needsTier, metrics)
        for (const snippet of snippets) {
          suggestions.push({
            type: 'code_snippet',
            game: metrics.gameSlug,
            tier: needsTier,
            content: snippet as unknown as Record<string, unknown>,
            reasoning: this.getSnippetReasoning(metrics, needsTier)
          })
        }
        break

      // Add more game types as needed
    }

    return suggestions
  }

  private identifyNeededTier(metrics: GameMetrics): 1 | 2 | 3 | 4 {
    const dist = metrics.difficultyDistribution

    // If too many players stuck at easy, add more medium content
    if (dist.easy > 50) return 2
    // If players completing hard content, add expert
    if (dist.hard > 30) return 4
    // If medium is dominant, add hard
    if (dist.medium > 40) return 3
    // Default to medium
    return 2
  }

  private getPatternReasoning(metrics: GameMetrics, tier: 1 | 2 | 3 | 4): string {
    const tierNames = { 1: 'easy', 2: 'medium', 3: 'hard', 4: 'expert' }
    return `Adding ${tierNames[tier]} patterns to ${metrics.gameName}. ` +
      `Current completion rate: ${metrics.completionRate}%, ` +
      `${metrics.totalPlays} total plays. ` +
      `Difficulty distribution suggests need for tier ${tier} content.`
  }

  private getSnippetReasoning(metrics: GameMetrics, tier: 1 | 2 | 3 | 4): string {
    const tierNames = { 1: 'syntax', 2: 'typo', 3: 'logic', 4: 'subtle' }
    return `Adding ${tierNames[tier]} bug challenges to ${metrics.gameName}. ` +
      `Players averaging ${metrics.avgScore} points with ${metrics.avgDuration}s sessions.`
  }

  private async createSummary(
    metrics: GameMetrics[],
    suggestions: ContentSuggestion[]
  ): Promise<{ summary: string; estimatedImpact: string }> {
    const provider = await this.ensureProvider()

    const systemPrompt = 'You are a game analytics expert. Respond only with valid JSON.'
    const userPrompt = `Analyze this game evolution plan and provide a brief summary.

Game Metrics:
${JSON.stringify(metrics, null, 2)}

Content Suggestions:
${JSON.stringify(suggestions.map(s => ({
  type: s.type,
  game: s.game,
  tier: s.tier,
  reasoning: s.reasoning
})), null, 2)}

Provide:
1. A 2-3 sentence summary of what's being added
2. Estimated impact on player engagement

Respond in JSON format:
{
  "summary": "...",
  "estimatedImpact": "..."
}`

    try {
      const text = await provider.generate(systemPrompt, userPrompt)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch {
      // Fallback
    }

    return {
      summary: `Adding ${suggestions.length} new content items across ${new Set(suggestions.map(s => s.game)).size} games.`,
      estimatedImpact: 'Expected to improve player retention and engagement.'
    }
  }

  formatPlanAsMarkdown(plan: EvolutionPlan): string {
    let md = `# 🎮 Game Evolution Plan

**ID:** ${plan.id}
**Created:** ${plan.createdAt}

## Summary
${plan.summary}

## Estimated Impact
${plan.estimatedImpact}

---

## 📊 Current Game Metrics

| Game | Plays | Avg Score | Completion | Trend |
|------|-------|-----------|------------|-------|
`

    for (const m of plan.metrics) {
      md += `| ${m.gameName} | ${m.totalPlays} | ${m.avgScore} | ${m.completionRate}% | ${m.recentTrends.trend} |\n`
    }

    md += `\n---\n\n## 🎯 Content Suggestions\n\n`

    const groupedByGame = plan.suggestions.reduce((acc, s) => {
      acc[s.game] = acc[s.game] || []
      acc[s.game].push(s)
      return acc
    }, {} as Record<string, ContentSuggestion[]>)

    for (const [game, suggestions] of Object.entries(groupedByGame)) {
      md += `### ${game}\n\n`

      for (const suggestion of suggestions) {
        md += `#### ${suggestion.type} (Tier ${suggestion.tier})\n`
        md += `> ${suggestion.reasoning}\n\n`
        md += '```json\n' + JSON.stringify(suggestion.content, null, 2) + '\n```\n\n'
      }
    }

    md += `---\n\n*Generated by GrepCoin Game Evolution System*\n`

    return md
  }
}
