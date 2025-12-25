import { ContentGenerator } from './base'
import { CodeSnippet, GameMetrics } from '../types'

export class CodeSnippetGenerator extends ContentGenerator {
  private readonly systemPrompt = `You are an expert code reviewer creating bug-hunting challenges for a programming game called "Bug Hunter".

Your task is to generate code snippets with intentional bugs that players must find.

Bug types by tier:
- Tier 1 (syntax): Missing semicolons, brackets, quotes
- Tier 2 (typo): Variable name typos, wrong method names
- Tier 3 (logic): Off-by-one errors, wrong operators, incorrect conditions
- Tier 4 (subtle): Race conditions, memory leaks, security issues, edge cases

Guidelines:
- Code should be realistic JavaScript/TypeScript
- Bugs should be findable by reading carefully
- Each snippet should be 3-8 lines
- Bug should be on a single identifiable line

Always respond with valid JSON only.`

  async generateSnippets(
    count: number,
    tier: 1 | 2 | 3 | 4,
    metrics?: GameMetrics
  ): Promise<CodeSnippet[]> {
    const bugTypes: Record<number, string[]> = {
      1: ['syntax'],
      2: ['typo', 'undefined'],
      3: ['logic', 'runtime'],
      4: ['security', 'performance', 'edge-case']
    }

    const context = metrics
      ? `Players have ${metrics.completionRate}% completion rate. ${
          metrics.completionRate > 80 ? 'Make these slightly harder.' : 'Keep difficulty balanced.'
        }`
      : ''

    const prompt = `Generate ${count} code snippets with bugs for Tier ${tier}.
Bug types to use: ${bugTypes[tier].join(', ')}
${context}

Return a JSON array with this structure:
[{
  "lines": ["function add(a, b) {", "  return a + a;", "}"],
  "bugLine": 1,
  "bugType": "logic",
  "explanation": "Should be 'a + b' not 'a + a'",
  "tier": ${tier},
  "points": ${50 + tier * 25}
}]

Requirements:
- bugLine is 0-indexed
- Code must be syntactically parseable (except for syntax bugs)
- Explanation should be clear but not give away the answer
- Use modern JavaScript/TypeScript patterns`

    const response = await this.generate(this.systemPrompt, prompt)
    const snippets = this.parseJSON<CodeSnippet[]>(response)

    if (!snippets) return []

    // Validate snippets
    return snippets.filter(s => this.validateSnippet(s))
  }

  private validateSnippet(snippet: CodeSnippet): boolean {
    // Basic validation
    if (!snippet.lines || snippet.lines.length < 2) return false
    if (snippet.bugLine < 0 || snippet.bugLine >= snippet.lines.length) return false
    if (!snippet.explanation || snippet.explanation.length < 10) return false

    return true
  }
}
