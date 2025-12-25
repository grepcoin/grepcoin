import { ContentGenerator } from './base'
import { CodeSnippet, GameMetrics } from '../types'

export class CodeSnippetGenerator extends ContentGenerator {
  private readonly systemPrompt = `You generate JavaScript code snippets with bugs as JSON. Output a JSON object with a "snippets" array.

Bug types by tier:
- Tier 1: Missing semicolons, brackets, quotes (syntax)
- Tier 2: Variable typos, wrong method names (typo)
- Tier 3: Off-by-one, wrong operators, bad conditions (logic)
- Tier 4: Security issues, edge cases, race conditions (subtle)`

  async generateSnippets(
    count: number,
    tier: 1 | 2 | 3 | 4,
    metrics?: GameMetrics
  ): Promise<CodeSnippet[]> {
    const bugTypes: Record<number, string> = {
      1: 'syntax',
      2: 'typo',
      3: 'logic',
      4: 'security'
    }

    const prompt = `Generate ${count} JavaScript code snippets with ${bugTypes[tier]} bugs.

Output JSON format:
{"snippets":[{"lines":["function add(a, b) {","  return a + a;","}"],"bugLine":1,"bugType":"${bugTypes[tier]}","explanation":"Wrong variable used","tier":${tier},"points":${50 + tier * 25}}]}

Each snippet needs: lines (3-6 code lines), bugLine (0-indexed), bugType, explanation (under 50 chars), tier, points.`

    const response = await this.generate(this.systemPrompt, prompt)
    const result = this.parseJSON<{ snippets?: CodeSnippet[] } | CodeSnippet[]>(response)

    if (!result) return []

    // Handle both array and object with snippets key
    const snippets = Array.isArray(result) ? result : (result.snippets || [])
    if (!Array.isArray(snippets)) return []

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
