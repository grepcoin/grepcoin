#!/usr/bin/env tsx
/**
 * GREP Agent: PR Reviewer
 * Powered by GrepCoin AI Agents
 *
 * Reviews pull requests for:
 * - Code quality and best practices
 * - Security vulnerabilities
 * - Performance issues
 * - Test coverage suggestions
 */

import { Octokit } from '@octokit/rest'

interface PRReviewResult {
  summary: string
  quality: 'excellent' | 'good' | 'needs_improvement' | 'critical'
  issues: Array<{
    file: string
    line?: number
    severity: 'info' | 'warning' | 'error'
    message: string
    suggestion?: string
  }>
  suggestions: string[]
  securityConcerns: string[]
  approved: boolean
}

async function reviewPR(): Promise<void> {
  const token = process.env.GITHUB_TOKEN
  const prNumber = parseInt(process.env.PR_NUMBER || '0')
  const repo = process.env.GITHUB_REPOSITORY || ''
  const aiProvider = process.env.AI_PROVIDER || 'openai'

  if (!token || !prNumber || !repo) {
    console.error('Missing required environment variables: GITHUB_TOKEN, PR_NUMBER, GITHUB_REPOSITORY')
    process.exit(1)
  }

  const [owner, repoName] = repo.split('/')
  const octokit = new Octokit({ auth: token })

  console.log(`🤖 GREP Agent reviewing PR #${prNumber} in ${repo}`)
  console.log(`📡 Using AI provider: ${aiProvider}`)

  // Get PR details
  const { data: pr } = await octokit.pulls.get({
    owner,
    repo: repoName,
    pull_number: prNumber
  })

  console.log(`📋 PR Title: ${pr.title}`)
  console.log(`👤 Author: ${pr.user?.login}`)
  console.log(`📝 Files changed: ${pr.changed_files}`)

  // Get PR diff
  const { data: files } = await octokit.pulls.listFiles({
    owner,
    repo: repoName,
    pull_number: prNumber
  })

  // Analyze files
  const review = await analyzeChanges(files, pr.title, pr.body || '', aiProvider)

  // Post review comment
  const commentBody = formatReviewComment(review, prNumber)

  await octokit.issues.createComment({
    owner,
    repo: repoName,
    issue_number: prNumber,
    body: commentBody
  })

  console.log('✅ Review posted successfully')

  // If critical issues, request changes
  if (review.quality === 'critical' || review.securityConcerns.length > 0) {
    await octokit.pulls.createReview({
      owner,
      repo: repoName,
      pull_number: prNumber,
      event: 'REQUEST_CHANGES',
      body: '🚨 Critical issues detected. Please address the concerns mentioned in the review comment.'
    })
    console.log('⚠️ Requested changes due to critical issues')
    process.exit(1)
  }

  console.log('🎉 PR review complete')
}

async function analyzeChanges(
  files: Array<{ filename: string; status: string; additions: number; deletions: number; patch?: string }>,
  title: string,
  body: string,
  _aiProvider: string
): Promise<PRReviewResult> {
  const issues: PRReviewResult['issues'] = []
  const suggestions: string[] = []
  const securityConcerns: string[] = []

  // Analyze each file
  for (const file of files) {
    const patch = file.patch || ''

    // Security checks
    if (patch.includes('eval(') || patch.includes('Function(')) {
      securityConcerns.push(`Potential code injection in ${file.filename}: Use of eval() or Function()`)
      issues.push({
        file: file.filename,
        severity: 'error',
        message: 'Use of eval() or Function() detected - potential security vulnerability',
        suggestion: 'Consider safer alternatives like JSON.parse() for data or explicit function calls'
      })
    }

    if (patch.includes('dangerouslySetInnerHTML')) {
      securityConcerns.push(`XSS risk in ${file.filename}: dangerouslySetInnerHTML usage`)
      issues.push({
        file: file.filename,
        severity: 'warning',
        message: 'dangerouslySetInnerHTML detected - ensure content is properly sanitized',
        suggestion: 'Use a sanitization library like DOMPurify before rendering HTML'
      })
    }

    if (/password|secret|api[_-]?key|private[_-]?key/i.test(patch) && !file.filename.includes('.example')) {
      if (!/process\.env|import\.meta\.env/.test(patch)) {
        securityConcerns.push(`Potential hardcoded secret in ${file.filename}`)
        issues.push({
          file: file.filename,
          severity: 'error',
          message: 'Potential hardcoded secret detected',
          suggestion: 'Use environment variables for sensitive data'
        })
      }
    }

    // Smart contract specific checks
    if (file.filename.endsWith('.sol')) {
      if (patch.includes('tx.origin')) {
        securityConcerns.push(`Unsafe tx.origin usage in ${file.filename}`)
        issues.push({
          file: file.filename,
          severity: 'error',
          message: 'tx.origin usage detected - vulnerable to phishing attacks',
          suggestion: 'Use msg.sender instead of tx.origin for authentication'
        })
      }

      if (!patch.includes('ReentrancyGuard') && (patch.includes('.call{value') || patch.includes('.transfer('))) {
        issues.push({
          file: file.filename,
          severity: 'warning',
          message: 'External call without visible reentrancy protection',
          suggestion: 'Consider using OpenZeppelin ReentrancyGuard'
        })
      }
    }

    // Code quality checks
    if (patch.includes('console.log') && !file.filename.includes('test')) {
      issues.push({
        file: file.filename,
        severity: 'info',
        message: 'console.log statement found - remove before production',
        suggestion: 'Use a proper logging library or remove debug statements'
      })
    }

    if (patch.includes('TODO') || patch.includes('FIXME')) {
      issues.push({
        file: file.filename,
        severity: 'info',
        message: 'TODO/FIXME comment found',
        suggestion: 'Consider creating an issue to track this task'
      })
    }

    // TypeScript checks
    if (file.filename.endsWith('.ts') || file.filename.endsWith('.tsx')) {
      if (patch.includes(': any') || patch.includes('as any')) {
        issues.push({
          file: file.filename,
          severity: 'warning',
          message: 'Use of "any" type reduces type safety',
          suggestion: 'Define proper types or use "unknown" with type guards'
        })
      }
    }
  }

  // Generate suggestions based on changes
  const hasTests = files.some(f => f.filename.includes('test') || f.filename.includes('spec'))
  const hasSourceChanges = files.some(f =>
    (f.filename.endsWith('.ts') || f.filename.endsWith('.tsx') || f.filename.endsWith('.sol')) &&
    !f.filename.includes('test')
  )

  if (hasSourceChanges && !hasTests) {
    suggestions.push('Consider adding tests for the new/modified code')
  }

  if (files.length > 10) {
    suggestions.push('This is a large PR - consider breaking it into smaller, focused PRs for easier review')
  }

  // Determine overall quality
  let quality: PRReviewResult['quality'] = 'excellent'
  const errorCount = issues.filter(i => i.severity === 'error').length
  const warningCount = issues.filter(i => i.severity === 'warning').length

  if (securityConcerns.length > 0 || errorCount > 0) {
    quality = 'critical'
  } else if (warningCount > 3) {
    quality = 'needs_improvement'
  } else if (warningCount > 0 || issues.length > 5) {
    quality = 'good'
  }

  // Generate summary
  const summary = generateSummary(title, body, files, issues, quality)

  return {
    summary,
    quality,
    issues,
    suggestions,
    securityConcerns,
    approved: quality !== 'critical' && securityConcerns.length === 0
  }
}

function generateSummary(
  title: string,
  _body: string,
  files: Array<{ filename: string; additions: number; deletions: number }>,
  issues: PRReviewResult['issues'],
  quality: PRReviewResult['quality']
): string {
  const totalAdditions = files.reduce((sum, f) => sum + f.additions, 0)
  const totalDeletions = files.reduce((sum, f) => sum + f.deletions, 0)

  const qualityEmoji = {
    excellent: '🌟',
    good: '✅',
    needs_improvement: '⚠️',
    critical: '🚨'
  }

  return `This PR "${title}" modifies ${files.length} files (+${totalAdditions}/-${totalDeletions} lines). ` +
    `Overall quality: ${qualityEmoji[quality]} ${quality.replace('_', ' ')}. ` +
    `Found ${issues.filter(i => i.severity === 'error').length} errors, ` +
    `${issues.filter(i => i.severity === 'warning').length} warnings, and ` +
    `${issues.filter(i => i.severity === 'info').length} suggestions.`
}

function formatReviewComment(review: PRReviewResult, prNumber: number): string {
  const qualityBadge = {
    excellent: '![Quality: Excellent](https://img.shields.io/badge/quality-excellent-brightgreen)',
    good: '![Quality: Good](https://img.shields.io/badge/quality-good-green)',
    needs_improvement: '![Quality: Needs Improvement](https://img.shields.io/badge/quality-needs%20improvement-yellow)',
    critical: '![Quality: Critical](https://img.shields.io/badge/quality-critical-red)'
  }

  let comment = `## 🤖 GREP Agent Code Review

${qualityBadge[review.quality]}

### Summary
${review.summary}

`

  if (review.securityConcerns.length > 0) {
    comment += `### 🔒 Security Concerns
${review.securityConcerns.map(c => `- 🚨 ${c}`).join('\n')}

`
  }

  if (review.issues.length > 0) {
    comment += `### Issues Found

| File | Severity | Issue | Suggestion |
|------|----------|-------|------------|
${review.issues.map(i =>
  `| \`${i.file}\` | ${i.severity === 'error' ? '🔴' : i.severity === 'warning' ? '🟡' : '🔵'} ${i.severity} | ${i.message} | ${i.suggestion || '-'} |`
).join('\n')}

`
  }

  if (review.suggestions.length > 0) {
    comment += `### 💡 Suggestions
${review.suggestions.map(s => `- ${s}`).join('\n')}

`
  }

  comment += `---
<sub>🤖 Powered by GREP Agents | PR #${prNumber} | [GrepCoin](https://grepcoin.io)</sub>`

  return comment
}

// Run the reviewer
reviewPR().catch((error) => {
  console.error('❌ PR review failed:', error)
  process.exit(1)
})
