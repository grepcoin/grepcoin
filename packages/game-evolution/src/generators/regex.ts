import { ContentGenerator } from './base'
import { RegexPattern, GameMetrics } from '../types'

export class RegexPatternGenerator extends ContentGenerator {
  private readonly systemPrompt = `You generate regex patterns as JSON. Output a JSON object with a "patterns" array.

Tier definitions:
- Tier 1: Basic [a-z], [0-9], quantifiers +, *
- Tier 2: Word boundaries \\b, alternation |, groups (), quantifiers {n,m}
- Tier 3: Lookahead (?=), lookbehind (?<=), non-capturing (?:)
- Tier 4: Complex nested patterns, multiple assertions`

  async generatePatterns(
    count: number,
    tier: 1 | 2 | 3 | 4,
    metrics?: GameMetrics
  ): Promise<RegexPattern[]> {
    const prompt = `Generate ${count} regex patterns for Tier ${tier}.

Output JSON format:
{"patterns":[{"pattern":"^[a-z]+$","display":"^[a-z]+$","hint":"lowercase only","examples":{"matches":["hello","world","test"],"nonMatches":["Hello","123","A1"]},"tier":${tier}}]}

Each pattern needs: pattern, display, hint (under 25 chars), examples with 3 matches and 3 nonMatches, tier.`

    const response = await this.generate(this.systemPrompt, prompt)
    const result = this.parseJSON<{ patterns?: RegexPattern[] } | RegexPattern[]>(response)

    if (!result) return []

    // Handle both array and object with patterns key
    const patterns = Array.isArray(result) ? result : (result.patterns || [])
    if (!Array.isArray(patterns)) return []

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
