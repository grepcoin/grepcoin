#!/usr/bin/env tsx
/**
 * GREP Agent: PR Reviewer (Claude-Powered)
 *
 * Uses Claude to provide intelligent code reviews for GrepCoin PRs
 */

import { Octokit } from '@octokit/rest'
import { askClaude, PROMPTS } from './claude-client'

interface ReviewResult {
  summary: string
  aiAnalysis: string
  staticIssues: Array<{
    file: string
    line?: number
    severity: 'critical' | 'warning' | 'info'
    message: string
    suggestion?: string
  }>
  approved: boolean
}

async function reviewPR(): Promise<void> {
  const token = process.env.GITHUB_TOKEN
  const prNumber = parseInt(process.env.PR_NUMBER || '0')
  const repo = process.env.GITHUB_REPOSITORY || ''
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (!token || !prNumber || !repo) {
    console.error('Missing required environment variables: GITHUB_TOKEN, PR_NUMBER, GITHUB_REPOSITORY')
    process.exit(1)
  }

  const [owner, repoName] = repo.split('/')
  const octokit = new Octokit({ auth: token })

  console.log('🤖 GREP Agent (Claude-Powered) reviewing PR...')
  console.log(`📋 PR #${prNumber} in ${repo}`)

  // Get PR details
  const { data: pr } = await octokit.pulls.get({
    owner,
    repo: repoName,
    pull_number: prNumber
  })

  console.log(`📝 Title: ${pr.title}`)
  console.log(`👤 Author: ${pr.user?.login}`)

  // Get changed files
  const { data: files } = await octokit.pulls.listFiles({
    owner,
    repo: repoName,
    pull_number: prNumber
  })

  console.log(`📁 Files changed: ${files.length}`)

  // Perform review
  const review = await performReview(files, pr.title, pr.body || '', !!anthropicKey)

  // Post review comment
  const commentBody = formatReviewComment(review, prNumber, pr.user?.login || 'contributor')

  await octokit.issues.createComment({
    owner,
    repo: repoName,
    issue_number: prNumber,
    body: commentBody
  })

  console.log('✅ Review posted')

  // Request changes if critical issues
  if (!review.approved) {
    await octokit.pulls.createReview({
      owner,
      repo: repoName,
      pull_number: prNumber,
      event: 'REQUEST_CHANGES',
      body: '🚨 Please address the critical issues found in the review.'
    })
    process.exit(1)
  }
}

async function performReview(
  files: Array<{ filename: string; status: string; additions: number; deletions: number; patch?: string }>,
  title: string,
  body: string,
  useAI: boolean
): Promise<ReviewResult> {
  const staticIssues: ReviewResult['staticIssues'] = []
  let aiAnalysis = ''

  // Build context for Claude
  const changedCode: string[] = []
  const fileList = files.map(f => `- ${f.filename} (+${f.additions}/-${f.deletions})`).join('\n')

  for (const file of files) {
    if (!file.patch) continue

    // Static analysis
    runStaticChecks(file, staticIssues)

    // Collect code for AI analysis (limit size)
    if (changedCode.join('\n').length < 15000) {
      changedCode.push(`\n--- ${file.filename} ---\n${file.patch}`)
    }
  }

  // Claude AI analysis
  if (useAI && changedCode.length > 0) {
    console.log('🧠 Running Claude analysis...')
    try {
      const context = `
## Pull Request
**Title:** ${title}
**Description:** ${body || 'No description provided'}

## Files Changed
${fileList}

## Code Changes (diff format)
${changedCode.join('\n')}
`
      const response = await askClaude(PROMPTS.codeReview, context, { maxTokens: 2048 })
      aiAnalysis = response.content
      console.log(`📊 Claude used ${response.usage.inputTokens} input, ${response.usage.outputTokens} output tokens`)
    } catch (error) {
      console.error('Claude analysis failed:', error)
      aiAnalysis = '*AI analysis unavailable*'
    }
  }

  // Determine approval
  const criticalCount = staticIssues.filter(i => i.severity === 'critical').length
  const approved = criticalCount === 0

  // Generate summary
  const summary = `Reviewed ${files.length} files with ${files.reduce((s, f) => s + f.additions, 0)} additions and ${files.reduce((s, f) => s + f.deletions, 0)} deletions. Found ${staticIssues.length} static issues (${criticalCount} critical).`

  return { summary, aiAnalysis, staticIssues, approved }
}

function runStaticChecks(
  file: { filename: string; patch?: string },
  issues: ReviewResult['staticIssues']
): void {
  const patch = file.patch || ''
  const filename = file.filename

  // Skip static analysis on our own agent files (they contain the patterns)
  if (filename.includes('github-actions/') && filename.endsWith('-reviewer.ts')) {
    return
  }

  // Skip secret detection on workflow files (they reference secrets, not hardcode them)
  const isWorkflowFile = filename.endsWith('.yml') || filename.endsWith('.yaml')

  // Only analyze added lines (lines starting with +)
  const addedLines = patch
    .split('\n')
    .filter(line => line.startsWith('+') && !line.startsWith('+++'))
    .join('\n')

  if (!addedLines) return

  // Security checks (skip some for workflow files)
  const securityPatterns = [
    { pattern: /eval\s*\(/, message: 'eval() usage - potential code injection', severity: 'critical' as const, skipWorkflow: false },
    { pattern: /dangerouslySetInnerHTML/, message: 'dangerouslySetInnerHTML - ensure content is sanitized', severity: 'warning' as const, skipWorkflow: false },
    { pattern: /innerHTML\s*=/, message: 'Direct innerHTML assignment - XSS risk', severity: 'critical' as const, skipWorkflow: false },
    { pattern: /\btx\.origin\b/, message: 'tx.origin usage - vulnerable to phishing', severity: 'critical' as const, skipWorkflow: false },
    { pattern: /selfdestruct|suicide/, message: 'selfdestruct usage - dangerous in upgradeable contracts', severity: 'warning' as const, skipWorkflow: false },
    { pattern: /["'`](?:[^"'`]*(?:password|secret|api_key|private_key)[^"'`]*=\s*["'`][^"'`]+["'`])/i, message: 'Potential hardcoded secret', severity: 'critical' as const, skipWorkflow: true },
  ]

  for (const { pattern, message, severity, skipWorkflow } of securityPatterns) {
    if (skipWorkflow && isWorkflowFile) continue
    if (pattern.test(addedLines)) {
      issues.push({ file: filename, severity, message })
    }
  }

  // TypeScript/JavaScript checks (only on added lines)
  if (filename.match(/\.(ts|tsx|js|jsx)$/)) {
    if (/:\s*any\b|as\s+any\b/.test(addedLines)) {
      issues.push({ file: filename, severity: 'warning', message: 'Usage of "any" type reduces type safety' })
    }
    // Skip console.log warnings for agent files (they use logging for CI output)
    if (/console\.(log|debug|info)\(/.test(addedLines) && !filename.includes('test') && !filename.includes('agents')) {
      issues.push({ file: filename, severity: 'info', message: 'Console statement - remove before production' })
    }
    if (/TODO|FIXME|HACK|XXX/.test(addedLines)) {
      issues.push({ file: filename, severity: 'info', message: 'TODO/FIXME comment found' })
    }
  }

  // Solidity checks
  if (filename.endsWith('.sol')) {
    if (/\.call\{value/.test(addedLines) && !/nonReentrant|ReentrancyGuard/.test(addedLines)) {
      issues.push({ file: filename, severity: 'warning', message: 'External call without visible reentrancy protection' })
    }
    if (/block\.timestamp/.test(addedLines)) {
      issues.push({ file: filename, severity: 'info', message: 'block.timestamp usage - can be manipulated by miners' })
    }
  }
}

function formatReviewComment(review: ReviewResult, prNumber: number, author: string): string {
  const statusBadge = review.approved
    ? '![Status: Approved](https://img.shields.io/badge/status-approved-brightgreen)'
    : '![Status: Changes Requested](https://img.shields.io/badge/status-changes%20requested-red)'

  let comment = `## 🤖 GREP Agent Code Review

${statusBadge}

Hey @${author}! I've reviewed your changes. Here's what I found:

### 📊 Summary
${review.summary}

`

  // AI Analysis section
  if (review.aiAnalysis && review.aiAnalysis !== '*AI analysis unavailable*') {
    comment += `### 🧠 Claude Analysis

${review.aiAnalysis}

`
  }

  // Static issues
  if (review.staticIssues.length > 0) {
    comment += `### 🔍 Static Analysis

| Severity | File | Issue |
|----------|------|-------|
`
    for (const issue of review.staticIssues) {
      const emoji = issue.severity === 'critical' ? '🔴' : issue.severity === 'warning' ? '🟡' : '🔵'
      comment += `| ${emoji} ${issue.severity} | \`${issue.file}\` | ${issue.message} |\n`
    }
    comment += '\n'
  } else {
    comment += `### ✅ Static Analysis
No issues detected by static analysis.

`
  }

  comment += `---
<sub>🤖 Powered by GREP Agent + Claude | PR #${prNumber} | [GrepCoin](https://grepcoin.io)</sub>`

  return comment
}

// Run
reviewPR().catch((error) => {
  console.error('❌ Review failed:', error)
  process.exit(1)
})
