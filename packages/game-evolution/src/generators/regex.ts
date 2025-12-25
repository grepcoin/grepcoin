import { ContentGenerator } from './base'
import { RegexPattern, GameMetrics } from '../types'

export class RegexPatternGenerator extends ContentGenerator {
  private readonly systemPrompt = `You are an expert regex pattern designer for a programming-themed arcade game called "Grep Rails".

Your task is to generate regex patterns that are:
1. Educational - teach real regex concepts
2. Fun - progressively challenging
3. Testable - have clear matching and non-matching examples

Tier definitions:
- Tier 1 (Easy): Basic character classes [a-z], [0-9], simple quantifiers +, *
- Tier 2 (Medium): Word boundaries, alternation |, groups (), specific quantifiers {n,m}
- Tier 3 (Hard): Lookahead (?=), lookbehind (?<=), non-capturing groups (?:)
- Tier 4 (Expert): Complex combinations, nested groups, advanced assertions

Always respond with valid JSON only.`

  async generatePatterns(
    count: number,
    tier: 1 | 2 | 3 | 4,
    metrics?: GameMetrics
  ): Promise<RegexPattern[]> {
    const context = metrics
      ? `Current game stats: ${metrics.totalPlays} plays, ${metrics.avgScore} avg score, completion rate ${metrics.completionRate}%.`
      : ''

    const prompt = `Generate ${count} unique regex patterns for Tier ${tier}.
${context}

Return a JSON array with this structure:
[{
  "pattern": "^[a-z]+$",
  "display": "^[a-z]+$",
  "hint": "lowercase letters only",
  "examples": {
    "matches": ["hello", "world", "abc"],
    "nonMatches": ["Hello", "123", "a1b2"]
  },
  "tier": ${tier}
}]

Requirements:
- Patterns must be valid JavaScript regex
- Include 3-5 matching and 3-5 non-matching examples
- Hints should be concise (under 30 chars)
- Each pattern should teach a distinct concept`

    const response = await this.generate(this.systemPrompt, prompt)
    const patterns = this.parseJSON<RegexPattern[]>(response)

    if (!patterns) return []

    // Validate patterns
    return patterns.filter(p => this.validatePattern(p))
  }

  private validatePattern(pattern: RegexPattern): boolean {
    try {
      const regex = new RegExp(pattern.pattern)

      // Verify matches work
      const matchesValid = pattern.examples.matches.every(m => regex.test(m))
      const nonMatchesValid = pattern.examples.nonMatches.every(m => !regex.test(m))

      return matchesValid && nonMatchesValid
    } catch {
      return false
    }
  }
}
