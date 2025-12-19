#!/usr/bin/env tsx
/**
 * GREP Agent: Issue Triage
 * Powered by GrepCoin AI Agents
 *
 * Automatically triages new issues:
 * - Labels based on content analysis
 * - Assigns to appropriate team members
 * - Provides helpful first response
 * - Links to relevant documentation
 */

import { Octokit } from '@octokit/rest'

interface TriageResult {
  labels: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  suggestedAssignees: string[]
  autoResponse: string
  relatedDocs: string[]
}

const LABEL_KEYWORDS: Record<string, string[]> = {
  bug: ['bug', 'error', 'crash', 'broken', 'not working', 'fails', 'exception', 'issue'],
  enhancement: ['feature', 'request', 'add', 'improve', 'enhancement', 'would be nice', 'suggestion'],
  documentation: ['docs', 'documentation', 'readme', 'guide', 'tutorial', 'example'],
  security: ['security', 'vulnerability', 'exploit', 'attack', 'injection', 'xss', 'csrf'],
  smart_contracts: ['contract', 'solidity', 'staking', 'token', 'blockchain', 'web3', 'wallet'],
  frontend: ['ui', 'ux', 'css', 'styling', 'layout', 'responsive', 'component', 'react', 'next'],
  backend: ['api', 'server', 'database', 'prisma', 'endpoint', 'authentication'],
  game: ['game', 'score', 'leaderboard', 'play', 'level', 'achievement'],
  question: ['how', 'what', 'why', 'when', 'help', 'question', '?']
}

const DOCS_LINKS: Record<string, string> = {
  staking: '/docs/staking.md',
  token: '/docs/tokenomics.md',
  game: '/docs/games.md',
  security: '/SECURITY.md',
  contributing: '/CONTRIBUTING.md',
  general: '/README.md'
}

async function runIssueTriage(): Promise<void> {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPOSITORY || ''
  const issueNumber = parseInt(process.env.ISSUE_NUMBER || '0')

  if (!token || !repo || !issueNumber) {
    console.error('Missing required environment variables')
    process.exit(1)
  }

  const [owner, repoName] = repo.split('/')
  const octokit = new Octokit({ auth: token })

  console.log('🏷️ GREP Issue Triage Agent starting...')
  console.log(`📦 Repository: ${repo}`)
  console.log(`🔢 Issue: #${issueNumber}`)

  // Get issue details
  const { data: issue } = await octokit.issues.get({
    owner,
    repo: repoName,
    issue_number: issueNumber
  })

  // Skip if it's a PR
  if (issue.pull_request) {
    console.log('⏭️ Skipping - this is a pull request')
    return
  }

  // Skip if already labeled (not new)
  if (issue.labels.length > 0) {
    console.log('⏭️ Skipping - issue already has labels')
    return
  }

  console.log(`📋 Issue: "${issue.title}"`)
  console.log(`👤 Author: ${issue.user?.login}`)

  // Analyze and triage
  const result = triageIssue(issue.title, issue.body || '')

  // Ensure labels exist
  await ensureLabelsExist(octokit, owner, repoName, result.labels)

  // Apply labels
  await octokit.issues.addLabels({
    owner,
    repo: repoName,
    issue_number: issueNumber,
    labels: result.labels
  })
  console.log(`🏷️ Applied labels: ${result.labels.join(', ')}`)

  // Add priority label
  const priorityLabels: Record<string, string> = {
    low: 'priority: low',
    medium: 'priority: medium',
    high: 'priority: high',
    critical: 'priority: critical'
  }

  await ensureLabelsExist(octokit, owner, repoName, [priorityLabels[result.priority]])
  await octokit.issues.addLabels({
    owner,
    repo: repoName,
    issue_number: issueNumber,
    labels: [priorityLabels[result.priority]]
  })
  console.log(`⚡ Priority: ${result.priority}`)

  // Post auto-response
  await octokit.issues.createComment({
    owner,
    repo: repoName,
    issue_number: issueNumber,
    body: result.autoResponse
  })
  console.log('💬 Posted auto-response')

  console.log('✅ Issue triage complete')
}

function triageIssue(title: string, body: string): TriageResult {
  const content = `${title} ${body}`.toLowerCase()

  // Detect labels
  const labels: string[] = []
  for (const [label, keywords] of Object.entries(LABEL_KEYWORDS)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      labels.push(label)
    }
  }

  // Default to 'needs-triage' if no labels detected
  if (labels.length === 0) {
    labels.push('needs-triage')
  }

  // Determine priority
  let priority: TriageResult['priority'] = 'medium'
  if (labels.includes('security')) {
    priority = 'critical'
  } else if (labels.includes('bug') && (content.includes('crash') || content.includes('data loss'))) {
    priority = 'high'
  } else if (labels.includes('question') || labels.includes('documentation')) {
    priority = 'low'
  }

  // Determine category
  let category = 'general'
  if (labels.includes('smart_contracts')) category = 'blockchain'
  else if (labels.includes('frontend')) category = 'frontend'
  else if (labels.includes('backend')) category = 'backend'
  else if (labels.includes('game')) category = 'game'
  else if (labels.includes('security')) category = 'security'

  // Get relevant docs
  const relatedDocs: string[] = []
  if (labels.includes('smart_contracts')) relatedDocs.push(DOCS_LINKS.token)
  if (labels.includes('security')) relatedDocs.push(DOCS_LINKS.security)
  if (labels.includes('question')) relatedDocs.push(DOCS_LINKS.general)
  relatedDocs.push(DOCS_LINKS.contributing)

  // Generate auto-response
  const autoResponse = generateResponse(labels, priority, relatedDocs, category)

  return {
    labels,
    priority,
    category,
    suggestedAssignees: [], // Would need team config
    autoResponse,
    relatedDocs
  }
}

function generateResponse(
  labels: string[],
  priority: TriageResult['priority'],
  docs: string[],
  category: string
): string {
  let response = `👋 Thank you for opening this issue!\n\n`

  response += `🤖 **GREP Agent has automatically triaged this issue:**\n\n`
  response += `- **Category:** ${category}\n`
  response += `- **Priority:** ${priority}\n`
  response += `- **Labels:** ${labels.join(', ')}\n\n`

  if (labels.includes('bug')) {
    response += `### 🐛 Bug Report Checklist\n\n`
    response += `To help us resolve this faster, please ensure you've provided:\n`
    response += `- [ ] Steps to reproduce\n`
    response += `- [ ] Expected behavior\n`
    response += `- [ ] Actual behavior\n`
    response += `- [ ] Environment details (browser, OS, wallet)\n`
    response += `- [ ] Screenshots/error messages if applicable\n\n`
  }

  if (labels.includes('enhancement')) {
    response += `### ✨ Feature Request Info\n\n`
    response += `We'd love to understand more about your suggestion:\n`
    response += `- What problem does this solve?\n`
    response += `- How would you envision this working?\n`
    response += `- Are there any alternatives you've considered?\n\n`
  }

  if (labels.includes('security')) {
    response += `### 🔒 Security Notice\n\n`
    response += `Thank you for reporting a security concern! This has been flagged as **${priority} priority**.\n\n`
    response += `For sensitive vulnerabilities, please also consider reaching out via our [security policy](SECURITY.md).\n\n`
  }

  if (labels.includes('question')) {
    response += `### ❓ Getting Help\n\n`
    response += `While you wait for a response, you might find these resources helpful:\n`
    response += `- [Documentation](README.md)\n`
    response += `- [Discord Community](https://discord.gg/grepcoin)\n\n`
  }

  if (docs.length > 0) {
    response += `### 📚 Related Documentation\n\n`
    response += docs.map(d => `- [${d}](${d})`).join('\n')
    response += `\n\n`
  }

  response += `---\n`
  response += `<sub>🤖 Auto-triaged by GREP Agent | A team member will review this soon</sub>`

  return response
}

async function ensureLabelsExist(
  octokit: Octokit,
  owner: string,
  repo: string,
  labels: string[]
): Promise<void> {
  const labelColors: Record<string, string> = {
    bug: 'D73A4A',
    enhancement: 'A2EEEF',
    documentation: '0075CA',
    security: 'B60205',
    smart_contracts: 'F9D0C4',
    frontend: 'BFD4F2',
    backend: 'C5DEF5',
    game: 'FBCA04',
    question: 'D876E3',
    'needs-triage': 'EDEDED',
    'priority: low': '0E8A16',
    'priority: medium': 'FBCA04',
    'priority: high': 'D93F0B',
    'priority: critical': 'B60205'
  }

  for (const label of labels) {
    try {
      await octokit.issues.createLabel({
        owner,
        repo,
        name: label,
        color: labelColors[label] || '000000'
      })
    } catch {
      // Label already exists
    }
  }
}

// Run the triage
runIssueTriage().catch((error) => {
  console.error('❌ Issue triage failed:', error)
  process.exit(1)
})
