#!/usr/bin/env tsx
/**
 * GREP Agent: Debug Helper (Claude-Powered)
 *
 * Automatically investigates and helps debug issues by:
 * - Analyzing error messages and stack traces
 * - Finding related code in the codebase
 * - Suggesting potential fixes
 * - Linking to similar resolved issues
 */

import { Octokit } from '@octokit/rest'
import { askClaude } from './claude-client'
import { execSync } from 'child_process'

const DEBUG_PROMPT = `You are an expert debugger for GrepCoin, a Web3 gaming platform.

Your task is to analyze a bug report and provide actionable debugging assistance.

Tech stack context:
- Frontend: Next.js 15, React 18, TypeScript, wagmi/viem for Web3
- Smart Contracts: Solidity 0.8.24 on Base L2
- Backend: Next.js API routes, Prisma ORM, PostgreSQL
- Auth: Sign-In with Ethereum (SIWE)

When analyzing bugs:
1. Parse any error messages or stack traces
2. Identify the likely root cause
3. Suggest specific files/functions to investigate
4. Provide step-by-step debugging instructions
5. Offer potential fixes with code snippets
6. Mention any related patterns you've seen

Output format:
## 🔍 Issue Analysis
[Brief summary of what the bug appears to be]

## 🎯 Likely Root Cause
[Most probable cause based on the description]

## 📁 Files to Investigate
- \`path/to/file.ts\` - [why this file]
- [more files...]

## 🔧 Debugging Steps
1. [Step 1]
2. [Step 2]
...

## 💡 Potential Fixes
\`\`\`typescript
// Suggested fix
\`\`\`

## ⚠️ Things to Check
- [Additional considerations]

Be concise but thorough. Prioritize the most likely cause.`

async function debugHelper(): Promise<void> {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPOSITORY || ''
  const issueNumber = parseInt(process.env.ISSUE_NUMBER || '0')

  if (!token || !repo || !issueNumber) {
    console.error('Missing required environment variables')
    process.exit(1)
  }

  const [owner, repoName] = repo.split('/')
  const octokit = new Octokit({ auth: token })

  console.log('🐛 GREP Debug Helper analyzing issue...')

  // Get issue details
  const { data: issue } = await octokit.issues.get({
    owner,
    repo: repoName,
    issue_number: issueNumber
  })

  // Check if it's a bug
  const isBug = issue.labels.some((l: { name?: string }) =>
    typeof l === 'object' && l.name?.toLowerCase().includes('bug')
  )

  if (!isBug) {
    console.log('⏭️ Issue is not labeled as bug, skipping debug analysis')
    return
  }

  console.log(`📋 Issue #${issueNumber}: ${issue.title}`)

  // Search codebase for related files
  const relatedFiles = searchCodebase(issue.title, issue.body || '')

  // Build context for Claude
  const context = `
## Bug Report
**Title:** ${issue.title}
**Description:**
${issue.body || 'No description provided'}

## Related Files Found in Codebase
${relatedFiles.length > 0 ? relatedFiles.join('\n') : 'No specific files identified'}

## Repository Structure
- apps/web/ - Next.js frontend
- apps/discord-bot/ - Discord bot
- packages/contracts/ - Solidity smart contracts
- packages/agents/ - AI agents
`

  // Get Claude analysis
  console.log('🧠 Analyzing with Claude...')
  const response = await askClaude(DEBUG_PROMPT, context, { maxTokens: 2048 })

  // Post analysis as comment
  const comment = `## 🤖 GREP Debug Helper

I've analyzed this bug report. Here's what I found:

${response.content}

---
<sub>🤖 Automated analysis by GREP Debug Helper | [Need human help? Tag a maintainer]</sub>`

  await octokit.issues.createComment({
    owner,
    repo: repoName,
    issue_number: issueNumber,
    body: comment
  })

  console.log('✅ Debug analysis posted')
}

function searchCodebase(title: string, body: string): string[] {
  const files: string[] = []
  const searchTerms = extractKeywords(title + ' ' + body)

  for (const term of searchTerms.slice(0, 5)) { // Limit searches
    try {
      const result = execSync(
        `grep -rl --include="*.ts" --include="*.tsx" --include="*.sol" "${term}" . 2>/dev/null | head -5`,
        { encoding: 'utf8', cwd: process.cwd() }
      )
      files.push(...result.trim().split('\n').filter(Boolean))
    } catch {
      // No matches
    }
  }

  // Dedupe and limit
  return Array.from(new Set(files)).slice(0, 10).map(f => `- \`${f}\``)
}

function extractKeywords(text: string): string[] {
  // Extract meaningful keywords for searching
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3)
    .filter(w => !['this', 'that', 'with', 'from', 'have', 'been', 'would', 'could', 'should'].includes(w))

  // Prioritize technical terms
  const techTerms = words.filter(w =>
    ['error', 'wallet', 'token', 'stake', 'game', 'score', 'auth', 'login', 'connect',
      'transaction', 'contract', 'prisma', 'database', 'api', 'component', 'hook',
      'state', 'effect', 'render', 'build', 'deploy'].includes(w)
  )

  return [...new Set([...techTerms, ...words])].slice(0, 10)
}

// Run
debugHelper().catch((error) => {
  console.error('❌ Debug helper failed:', error)
  process.exit(1)
})
