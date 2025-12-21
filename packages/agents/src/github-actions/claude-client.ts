/**
 * Claude API Client for GREP Agents
 * Configured for optimal code analysis with retry logic, streaming, and token tracking
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
  stopReason?: string
}

export interface ClaudeOptions {
  maxTokens?: number
  temperature?: number
  retries?: number
  retryDelayMs?: number
  stream?: boolean
}

export interface TokenUsageTracker {
  totalInputTokens: number
  totalOutputTokens: number
  totalCost: number
  requestCount: number
}

// Token usage tracker for the session
export const tokenUsage: TokenUsageTracker = {
  totalInputTokens: 0,
  totalOutputTokens: 0,
  totalCost: 0,
  requestCount: 0
}

// Pricing per 1M tokens (as of Dec 2024)
const PRICING = {
  'claude-sonnet-4-20250514': {
    input: 3.0,  // $3 per 1M input tokens
    output: 15.0 // $15 per 1M output tokens
  }
}

function calculateCost(inputTokens: number, outputTokens: number, model: string): number {
  const pricing = PRICING[model as keyof typeof PRICING] || PRICING['claude-sonnet-4-20250514']
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output
}

function trackUsage(inputTokens: number, outputTokens: number, model: string): void {
  tokenUsage.totalInputTokens += inputTokens
  tokenUsage.totalOutputTokens += outputTokens
  tokenUsage.totalCost += calculateCost(inputTokens, outputTokens, model)
  tokenUsage.requestCount += 1
}

export function getTokenUsageSummary(): string {
  return `Token Usage Summary:
- Requests: ${tokenUsage.requestCount}
- Input tokens: ${tokenUsage.totalInputTokens.toLocaleString()}
- Output tokens: ${tokenUsage.totalOutputTokens.toLocaleString()}
- Estimated cost: $${tokenUsage.totalCost.toFixed(4)}`
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number,
  delayMs: number
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (error instanceof Anthropic.APIError) {
        if (error.status && [400, 401, 403].includes(error.status)) {
          throw error
        }
      }

      if (attempt < retries) {
        const backoffDelay = delayMs * Math.pow(2, attempt)
        console.log(`Attempt ${attempt + 1} failed: ${lastError.message}. Retrying in ${backoffDelay}ms...`)
        await sleep(backoffDelay)
      }
    }
  }

  throw new Error(`Failed after ${retries + 1} attempts: ${lastError?.message}`)
}

export async function askClaude(
  systemPrompt: string,
  userMessage: string,
  options: ClaudeOptions = {}
): Promise<ClaudeResponse> {
  const {
    maxTokens = 4096,
    temperature = 0.3,
    retries = 3,
    retryDelayMs = 1000,
    stream = false
  } = options

  const model = 'claude-sonnet-4-20250514'

  if (stream) {
    return askClaudeStreaming(systemPrompt, userMessage, { maxTokens, temperature, retries, retryDelayMs })
  }

  const callAPI = async (): Promise<ClaudeResponse> => {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage }
      ]
    })

    const textContent = response.content.find(c => c.type === 'text')
    const content = textContent?.type === 'text' ? textContent.text : ''

    trackUsage(response.usage.input_tokens, response.usage.output_tokens, model)

    return {
      content,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      },
      stopReason: response.stop_reason ?? undefined
    }
  }

  try {
    return await retryWithBackoff(callAPI, retries, retryDelayMs)
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      const errorType = (error as unknown as Record<string, unknown>).type as string | undefined
      throw new Error(
        `Claude API Error (${error.status}): ${error.message}\n` +
        `Type: ${errorType || 'unknown'}\n` +
        `This may be due to: rate limits, invalid API key, or service issues.`
      )
    }
    throw new Error(`Failed to get response from Claude: ${error instanceof Error ? error.message : String(error)}`)
  }
}

async function askClaudeStreaming(
  systemPrompt: string,
  userMessage: string,
  options: ClaudeOptions = {}
): Promise<ClaudeResponse> {
  const {
    maxTokens = 4096,
    temperature = 0.3,
    retries = 3,
    retryDelayMs = 1000
  } = options

  const model = 'claude-sonnet-4-20250514'

  const callAPI = async (): Promise<ClaudeResponse> => {
    const stream = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage }
      ],
      stream: true
    })

    let content = ''
    let inputTokens = 0
    let outputTokens = 0
    let stopReason: string | undefined

    for await (const event of stream) {
      if (event.type === 'message_start') {
        inputTokens = event.message.usage.input_tokens
      } else if (event.type === 'content_block_delta') {
        if (event.delta.type === 'text_delta') {
          content += event.delta.text
        }
      } else if (event.type === 'message_delta') {
        outputTokens = event.usage.output_tokens
        stopReason = event.delta.stop_reason || undefined
      }
    }

    trackUsage(inputTokens, outputTokens, model)

    return {
      content,
      usage: { inputTokens, outputTokens },
      stopReason
    }
  }

  try {
    return await retryWithBackoff(callAPI, retries, retryDelayMs)
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      const errorType = (error as unknown as Record<string, unknown>).type as string | undefined
      throw new Error(
        `Claude API Error (${error.status}): ${error.message}\n` +
        `Type: ${errorType || 'unknown'}`
      )
    }
    throw new Error(`Failed to stream response from Claude: ${error instanceof Error ? error.message : String(error)}`)
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

export const PROMPTS = {
  codeReview: `You are an expert code reviewer for GrepCoin, a Web3 gaming platform built with:
- Frontend: Next.js 15, React 18, TypeScript, Tailwind CSS
- Smart Contracts: Solidity 0.8.24, OpenZeppelin, Hardhat
- Backend: Prisma ORM, PostgreSQL
- Web3: wagmi, viem, SIWE authentication

Your review style:
1. Be concise and actionable - developers should know exactly what to fix
2. Prioritize: Security > Correctness > Performance > Style
3. For each issue, provide: severity (critical, warning, info), file:line, and fix suggestion
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
- CRITICAL: Immediate exploitation possible, funds at risk
- HIGH: Significant vulnerability, exploitation likely
- MEDIUM: Security weakness, exploitation requires conditions
- LOW: Best practice violation, minimal risk
- INFO: Observation, no direct security impact

Output format:
## Security Assessment: [PASS/WARN/FAIL]

## Vulnerabilities Found
### [SEVERITY] [Title]
- **Location**: file:line
- **Description**: What's wrong
- **Impact**: What could happen
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

Be friendly but professional.`,

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
