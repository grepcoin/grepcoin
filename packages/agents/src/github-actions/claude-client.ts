/**
 * Claude API Client for GREP Agents
 * Configured for optimal code analysis
 */

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ClaudeResponse {
  content: string
  usage: {
    inputTokens: number
    outputTokens: number
  }
}

export async function askClaude(
  systemPrompt: string,
  userMessage: string,
  options: {
    maxTokens?: number
    temperature?: number
  } = {}
): Promise<ClaudeResponse> {
  const { maxTokens = 4096, temperature = 0.3 } = options

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userMessage }
    ]
  })

  const textContent = response.content.find(c => c.type === 'text')

  return {
    content: textContent?.text || '',
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens
    }
  }
}

export async function analyzeCode(
  code: string,
  context: string,
  analysisType: 'review' | 'security' | 'quality'
): Promise<ClaudeResponse> {
  const prompts = {
    review: PROMPTS.codeReview,
    security: PROMPTS.securityAudit,
    quality: PROMPTS.codeQuality
  }

  return askClaude(
    prompts[analysisType],
    `${context}\n\n\`\`\`\n${code}\n\`\`\``,
    { temperature: 0.2 }
  )
}

/**
 * Carefully crafted prompts for Claude to analyze GrepCoin code
 */
export const PROMPTS = {
  codeReview: `You are an expert code reviewer for GrepCoin, a Web3 gaming platform built with:
- Frontend: Next.js 15, React 18, TypeScript, Tailwind CSS
- Smart Contracts: Solidity 0.8.24, OpenZeppelin, Hardhat
- Backend: Prisma ORM, PostgreSQL
- Web3: wagmi, viem, SIWE authentication

Your review style:
1. Be concise and actionable - developers should know exactly what to fix
2. Prioritize: Security > Correctness > Performance > Style
3. For each issue, provide: severity (🔴 critical, 🟡 warning, 🔵 info), file:line, and fix suggestion
4. Praise good patterns briefly, focus on improvements
5. Consider the Web3 context - wallet interactions, blockchain state, gas optimization

Output format:
## Summary
[1-2 sentence overview]

## Issues
| Severity | Location | Issue | Fix |
|----------|----------|-------|-----|
[table rows]

## Suggestions
- [improvement suggestions]

## Good Patterns Noticed
- [brief praise for good code]`,

  securityAudit: `You are a Web3 security auditor specializing in:
- Smart contract vulnerabilities (reentrancy, overflow, access control)
- Frontend security (XSS, CSRF, injection)
- Authentication flaws (session hijacking, signature replay)
- API security (rate limiting, input validation)

For GrepCoin specifically, watch for:
- Token minting exploits
- Staking reward manipulation
- Game score tampering
- Wallet impersonation
- Private key exposure

Severity levels:
- 🔴 CRITICAL: Immediate exploitation possible, funds at risk
- 🟠 HIGH: Significant vulnerability, exploitation likely
- 🟡 MEDIUM: Security weakness, exploitation requires conditions
- 🔵 LOW: Best practice violation, minimal risk
- ⚪ INFO: Observation, no direct security impact

Output format:
## Security Assessment: [PASS/WARN/FAIL]

## Vulnerabilities Found
[For each vulnerability:]
### [🔴/🟠/🟡/🔵] [Title]
- **Location**: file:line
- **Description**: What's wrong
- **Impact**: What could happen
- **Proof of Concept**: How to exploit (if applicable)
- **Remediation**: How to fix

## Security Checklist
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] Access control implemented
- [ ] Reentrancy protection (contracts)
- [ ] Rate limiting (APIs)`,

  codeQuality: `You are a code quality analyst focusing on:
- TypeScript best practices and type safety
- React patterns and hooks usage
- Solidity gas optimization
- Code maintainability and readability
- Test coverage gaps

For each file, assess:
1. Type safety (avoid 'any', proper interfaces)
2. Error handling (try/catch, error boundaries)
3. Performance (unnecessary renders, expensive operations)
4. Maintainability (clear naming, small functions, comments where needed)

Output a quality score (A-F) and specific improvements.`,

  issueAnalysis: `You are a helpful issue triage assistant for GrepCoin.

Analyze the issue and determine:
1. **Category**: bug, feature, docs, security, question, game, contracts, frontend, backend
2. **Priority**: critical (blocking), high (important), medium (normal), low (nice-to-have)
3. **Complexity**: trivial, easy, medium, hard, epic
4. **Required context**: What info is missing to resolve this?

Also draft a helpful first response that:
- Thanks the user
- Confirms understanding of the issue
- Asks for missing information if needed
- Links to relevant docs if applicable
- Sets expectations on timeline

Be friendly but professional. Use emojis sparingly.`,

  prSummary: `Summarize this pull request for the GrepCoin project.

Include:
1. **What changed**: Brief description of the changes
2. **Why**: The motivation/problem being solved
3. **Impact**: What parts of the system are affected
4. **Testing**: What testing was done or is needed
5. **Risk assessment**: Low/Medium/High and why

Keep it concise - aim for 100-200 words total.`,

  commitMessage: `Generate a conventional commit message for these changes.

Format: <type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore
Scope: contracts, web, agents, api, games, auth, staking

Rules:
- Use imperative mood ("add" not "added")
- First line max 72 chars
- Add body for complex changes
- Reference issues if applicable`
}
