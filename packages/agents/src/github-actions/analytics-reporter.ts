#!/usr/bin/env tsx
/**
 * GREP Agent: Analytics Reporter
 * Powered by GrepCoin AI Agents
 *
 * Generates automated reports on:
 * - Repository activity and health
 * - Code quality trends
 * - Contributor activity
 * - Issue/PR statistics
 */

import { Octokit } from '@octokit/rest'

interface AnalyticsReport {
  period: string
  timestamp: string
  metrics: {
    commits: number
    pullRequests: {
      opened: number
      merged: number
      closed: number
    }
    issues: {
      opened: number
      closed: number
      avgTimeToClose: string
    }
    contributors: string[]
    codeChanges: {
      additions: number
      deletions: number
      filesChanged: number
    }
  }
  highlights: string[]
  concerns: string[]
}

async function runAnalyticsReporter(): Promise<void> {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPOSITORY || ''
  const reportType = process.env.REPORT_TYPE || 'weekly'

  if (!token || !repo) {
    console.error('Missing required environment variables')
    process.exit(1)
  }

  const [owner, repoName] = repo.split('/')
  const octokit = new Octokit({ auth: token })

  console.log('📊 GREP Analytics Reporter starting...')
  console.log(`📦 Repository: ${repo}`)
  console.log(`📅 Report type: ${reportType}`)

  const report = await generateReport(octokit, owner, repoName, reportType)
  await postReport(octokit, owner, repoName, report)

  console.log('✅ Analytics report generated')
}

async function generateReport(
  octokit: Octokit,
  owner: string,
  repo: string,
  reportType: string
): Promise<AnalyticsReport> {
  const now = new Date()
  const daysBack = reportType === 'daily' ? 1 : reportType === 'weekly' ? 7 : 30

  const since = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

  console.log(`\n📈 Collecting data from ${since.toISOString()} to ${now.toISOString()}\n`)

  // Get commits
  console.log('🔍 Fetching commits...')
  const { data: commits } = await octokit.repos.listCommits({
    owner,
    repo,
    since: since.toISOString(),
    per_page: 100
  })

  // Get pull requests
  console.log('🔍 Fetching pull requests...')
  const { data: prs } = await octokit.pulls.list({
    owner,
    repo,
    state: 'all',
    sort: 'updated',
    direction: 'desc',
    per_page: 100
  })

  const recentPRs = prs.filter(pr => new Date(pr.updated_at) >= since)

  // Get issues
  console.log('🔍 Fetching issues...')
  const { data: issues } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: 'all',
    since: since.toISOString(),
    per_page: 100
  })

  // Filter out PRs from issues
  const actualIssues = issues.filter(i => !i.pull_request)

  // Calculate metrics
  const contributors = Array.from(new Set(commits.map(c => c.author?.login || c.commit.author?.name || 'unknown')))

  const prsOpened = recentPRs.filter(pr => new Date(pr.created_at) >= since).length
  const prsMerged = recentPRs.filter(pr => pr.merged_at && new Date(pr.merged_at) >= since).length
  const prsClosed = recentPRs.filter(pr => pr.state === 'closed' && !pr.merged_at).length

  const issuesOpened = actualIssues.filter(i => new Date(i.created_at) >= since).length
  const issuesClosed = actualIssues.filter(i => i.closed_at && new Date(i.closed_at) >= since).length

  // Calculate average time to close issues
  const closedIssues = actualIssues.filter(i => i.closed_at)
  let avgTimeToClose = 'N/A'
  if (closedIssues.length > 0) {
    const totalMs = closedIssues.reduce((sum, i) => {
      return sum + (new Date(i.closed_at!).getTime() - new Date(i.created_at).getTime())
    }, 0)
    const avgMs = totalMs / closedIssues.length
    const avgDays = Math.round(avgMs / (1000 * 60 * 60 * 24))
    avgTimeToClose = avgDays === 0 ? 'Same day' : `${avgDays} day${avgDays === 1 ? '' : 's'}`
  }

  // Estimate code changes from commits
  let additions = 0
  let deletions = 0
  let filesChanged = 0

  for (const commit of commits.slice(0, 20)) { // Limit API calls
    try {
      const { data: commitData } = await octokit.repos.getCommit({
        owner,
        repo,
        ref: commit.sha
      })
      additions += commitData.stats?.additions || 0
      deletions += commitData.stats?.deletions || 0
      filesChanged += commitData.files?.length || 0
    } catch {
      // Skip on error
    }
  }

  // Generate highlights and concerns
  const highlights: string[] = []
  const concerns: string[] = []

  if (commits.length > 0) {
    highlights.push(`📝 ${commits.length} commits from ${contributors.length} contributor${contributors.length === 1 ? '' : 's'}`)
  }

  if (prsMerged > 0) {
    highlights.push(`🎉 ${prsMerged} PR${prsMerged === 1 ? '' : 's'} merged`)
  }

  if (issuesClosed > issuesOpened) {
    highlights.push(`✅ Closing more issues than opening (${issuesClosed} closed vs ${issuesOpened} opened)`)
  }

  if (commits.length === 0) {
    concerns.push('⚠️ No commits in this period - project may be stale')
  }

  if (issuesOpened > issuesClosed * 2) {
    concerns.push(`📈 Issue backlog growing (${issuesOpened} opened vs ${issuesClosed} closed)`)
  }

  const openPRs = recentPRs.filter(pr => pr.state === 'open')
  if (openPRs.length > 5) {
    concerns.push(`📋 ${openPRs.length} open PRs need review`)
  }

  // Stale PR check
  const stalePRs = openPRs.filter(pr => {
    const lastUpdated = new Date(pr.updated_at)
    const daysOld = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
    return daysOld > 7
  })

  if (stalePRs.length > 0) {
    concerns.push(`🕐 ${stalePRs.length} PR${stalePRs.length === 1 ? '' : 's'} stale for > 7 days`)
  }

  return {
    period: `${reportType} (${since.toLocaleDateString()} - ${now.toLocaleDateString()})`,
    timestamp: now.toISOString(),
    metrics: {
      commits: commits.length,
      pullRequests: {
        opened: prsOpened,
        merged: prsMerged,
        closed: prsClosed
      },
      issues: {
        opened: issuesOpened,
        closed: issuesClosed,
        avgTimeToClose
      },
      contributors,
      codeChanges: {
        additions,
        deletions,
        filesChanged
      }
    },
    highlights,
    concerns
  }
}

async function postReport(
  octokit: Octokit,
  owner: string,
  repo: string,
  report: AnalyticsReport
): Promise<void> {
  const discussionTitle = `📊 ${report.period.split(' ')[0].charAt(0).toUpperCase() + report.period.split(' ')[0].slice(1)} Analytics Report`

  const body = `## 📊 GrepCoin Repository Analytics

**Period:** ${report.period}
**Generated:** ${new Date(report.timestamp).toLocaleString()}

---

### 📈 Key Metrics

| Metric | Value |
|--------|-------|
| 📝 Commits | ${report.metrics.commits} |
| 👥 Active Contributors | ${report.metrics.contributors.length} |
| 🔀 PRs Opened | ${report.metrics.pullRequests.opened} |
| ✅ PRs Merged | ${report.metrics.pullRequests.merged} |
| 🐛 Issues Opened | ${report.metrics.issues.opened} |
| ✔️ Issues Closed | ${report.metrics.issues.closed} |
| ⏱️ Avg Issue Resolution | ${report.metrics.issues.avgTimeToClose} |

### 📊 Code Changes

\`\`\`diff
+ ${report.metrics.codeChanges.additions.toLocaleString()} additions
- ${report.metrics.codeChanges.deletions.toLocaleString()} deletions
📁 ${report.metrics.codeChanges.filesChanged} files changed
\`\`\`

### 🌟 Highlights
${report.highlights.length > 0 ? report.highlights.map(h => `- ${h}`).join('\n') : '- No specific highlights this period'}

${report.concerns.length > 0 ? `### ⚠️ Areas of Attention
${report.concerns.map(c => `- ${c}`).join('\n')}` : ''}

### 👥 Active Contributors
${report.metrics.contributors.map(c => `@${c}`).join(', ') || 'No activity'}

---
<sub>🤖 Generated by GREP Analytics Agent | [GrepCoin](https://grepcoin.io)</sub>
`

  // Post as issue (simpler than discussions)
  try {
    await octokit.issues.createLabel({
      owner,
      repo,
      name: 'analytics',
      color: '6F42C1',
      description: 'Analytics reports from GREP Agent'
    })
  } catch { /* Label may exist */ }

  // Find and close old analytics issues
  const { data: oldIssues } = await octokit.issues.listForRepo({
    owner,
    repo,
    labels: 'analytics,automated',
    state: 'open'
  })

  for (const issue of oldIssues) {
    if (issue.title.includes('Analytics Report')) {
      await octokit.issues.update({
        owner,
        repo,
        issue_number: issue.number,
        state: 'closed'
      })
    }
  }

  // Create new report issue
  const { data: newIssue } = await octokit.issues.create({
    owner,
    repo,
    title: discussionTitle,
    body,
    labels: ['analytics', 'automated']
  })

  console.log(`📝 Analytics report posted as issue #${newIssue.number}`)
}

// Run the reporter
runAnalyticsReporter().catch((error) => {
  console.error('❌ Analytics reporter failed:', error)
  process.exit(1)
})
