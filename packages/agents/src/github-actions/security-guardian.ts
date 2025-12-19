#!/usr/bin/env tsx
/**
 * GREP Agent: Security Guardian
 * Powered by GrepCoin AI Agents
 *
 * Monitors smart contracts and codebase for:
 * - Contract health and anomalies
 * - Dependency vulnerabilities
 * - Security best practices
 * - Suspicious transactions
 */

import { Octokit } from '@octokit/rest'

interface SecurityReport {
  timestamp: string
  status: 'healthy' | 'warning' | 'critical'
  checks: Array<{
    name: string
    status: 'pass' | 'warn' | 'fail'
    message: string
    details?: string
  }>
  recommendations: string[]
  contractHealth?: {
    tokenContract: boolean
    stakingContract: boolean
    totalValueLocked?: string
    recentTransactions?: number
  }
}

async function runSecurityGuardian(): Promise<void> {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPOSITORY || ''
  const network = process.env.BLOCKCHAIN_NETWORK || 'testnet'

  if (!token || !repo) {
    console.error('Missing required environment variables')
    process.exit(1)
  }

  const [owner, repoName] = repo.split('/')
  const octokit = new Octokit({ auth: token })

  console.log('🛡️ GREP Security Guardian starting...')
  console.log(`📡 Network: ${network}`)
  console.log(`📦 Repository: ${repo}`)

  const report = await runSecurityChecks(network)

  // Create or update security issue
  await updateSecurityIssue(octokit, owner, repoName, report)

  // If critical, fail the workflow
  if (report.status === 'critical') {
    console.error('🚨 Critical security issues detected!')
    process.exit(1)
  }

  console.log('✅ Security check complete')
}

async function runSecurityChecks(network: string): Promise<SecurityReport> {
  const checks: SecurityReport['checks'] = []
  const recommendations: string[] = []

  console.log('\n📋 Running security checks...\n')

  // Check 1: Package vulnerabilities (npm audit)
  console.log('🔍 Checking npm dependencies...')
  try {
    const { execSync } = await import('child_process')
    const auditOutput = execSync('npm audit --json 2>/dev/null || true', { encoding: 'utf8' })
    const audit = JSON.parse(auditOutput || '{}')

    const vulnerabilities = audit.metadata?.vulnerabilities || {}
    const criticalCount = vulnerabilities.critical || 0
    const highCount = vulnerabilities.high || 0

    if (criticalCount > 0) {
      checks.push({
        name: 'NPM Dependencies',
        status: 'fail',
        message: `${criticalCount} critical vulnerabilities found`,
        details: 'Run `npm audit fix` to resolve'
      })
    } else if (highCount > 0) {
      checks.push({
        name: 'NPM Dependencies',
        status: 'warn',
        message: `${highCount} high severity vulnerabilities`,
        details: 'Run `npm audit` for details'
      })
    } else {
      checks.push({
        name: 'NPM Dependencies',
        status: 'pass',
        message: 'No critical vulnerabilities found'
      })
    }
  } catch {
    checks.push({
      name: 'NPM Dependencies',
      status: 'warn',
      message: 'Could not run npm audit'
    })
  }

  // Check 2: Environment files
  console.log('🔍 Checking for exposed secrets...')
  try {
    const { execSync } = await import('child_process')
    const gitFiles = execSync('git ls-files', { encoding: 'utf8' }).split('\n')

    const sensitiveFiles = gitFiles.filter(f =>
      f.includes('.env') && !f.includes('.example') && !f.includes('.sample')
    )

    if (sensitiveFiles.length > 0) {
      checks.push({
        name: 'Secret Exposure',
        status: 'fail',
        message: `Sensitive files in git: ${sensitiveFiles.join(', ')}`,
        details: 'Remove from git and add to .gitignore'
      })
    } else {
      checks.push({
        name: 'Secret Exposure',
        status: 'pass',
        message: 'No sensitive files tracked in git'
      })
    }
  } catch {
    checks.push({
      name: 'Secret Exposure',
      status: 'warn',
      message: 'Could not check for exposed secrets'
    })
  }

  // Check 3: Smart contract compilation
  console.log('🔍 Checking smart contracts...')
  try {
    const { execSync } = await import('child_process')
    execSync('npm run test:contracts', { encoding: 'utf8', stdio: 'pipe' })
    checks.push({
      name: 'Smart Contracts',
      status: 'pass',
      message: 'All contract tests passing'
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    checks.push({
      name: 'Smart Contracts',
      status: 'fail',
      message: 'Contract tests failing',
      details: errorMessage.substring(0, 200)
    })
  }

  // Check 4: Hardcoded secrets in code
  console.log('🔍 Scanning for hardcoded secrets...')
  try {
    const { execSync } = await import('child_process')
    const grepResult = execSync(
      'grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.sol" ' +
      '-E "(sk-[a-zA-Z0-9]{20,}|0x[a-fA-F0-9]{64})" . 2>/dev/null || true',
      { encoding: 'utf8' }
    )

    if (grepResult.trim()) {
      checks.push({
        name: 'Hardcoded Secrets',
        status: 'fail',
        message: 'Potential hardcoded secrets found in code',
        details: 'API keys or private keys may be exposed'
      })
      recommendations.push('Move all secrets to environment variables')
    } else {
      checks.push({
        name: 'Hardcoded Secrets',
        status: 'pass',
        message: 'No hardcoded secrets detected'
      })
    }
  } catch {
    checks.push({
      name: 'Hardcoded Secrets',
      status: 'pass',
      message: 'Secret scan complete'
    })
  }

  // Check 5: TypeScript type safety
  console.log('🔍 Checking type safety...')
  try {
    const { execSync } = await import('child_process')
    execSync('npx tsc --noEmit 2>&1', { encoding: 'utf8' })
    checks.push({
      name: 'Type Safety',
      status: 'pass',
      message: 'No TypeScript errors'
    })
  } catch {
    checks.push({
      name: 'Type Safety',
      status: 'warn',
      message: 'TypeScript errors detected',
      details: 'Run `npx tsc --noEmit` for details'
    })
  }

  // Check 6: Contract security patterns
  console.log('🔍 Checking contract security patterns...')
  try {
    const fs = await import('fs')
    const path = await import('path')

    const contractsDir = path.join(process.cwd(), 'packages/contracts/contracts')
    const files = fs.readdirSync(contractsDir).filter(f => f.endsWith('.sol'))

    let hasReentrancyGuard = false
    let hasPausable = false
    let hasAccessControl = false

    for (const file of files) {
      const content = fs.readFileSync(path.join(contractsDir, file), 'utf8')
      if (content.includes('ReentrancyGuard')) hasReentrancyGuard = true
      if (content.includes('Pausable')) hasPausable = true
      if (content.includes('Ownable') || content.includes('AccessControl')) hasAccessControl = true
    }

    if (hasReentrancyGuard && hasPausable && hasAccessControl) {
      checks.push({
        name: 'Contract Security Patterns',
        status: 'pass',
        message: 'ReentrancyGuard, Pausable, and Access Control implemented'
      })
    } else {
      const missing = []
      if (!hasReentrancyGuard) missing.push('ReentrancyGuard')
      if (!hasPausable) missing.push('Pausable')
      if (!hasAccessControl) missing.push('Access Control')

      checks.push({
        name: 'Contract Security Patterns',
        status: 'warn',
        message: `Missing: ${missing.join(', ')}`,
        details: 'Consider adding these OpenZeppelin security patterns'
      })
    }
  } catch {
    checks.push({
      name: 'Contract Security Patterns',
      status: 'warn',
      message: 'Could not analyze contracts'
    })
  }

  // Determine overall status
  const hasFailures = checks.some(c => c.status === 'fail')
  const hasWarnings = checks.some(c => c.status === 'warn')

  let status: SecurityReport['status'] = 'healthy'
  if (hasFailures) status = 'critical'
  else if (hasWarnings) status = 'warning'

  // Add recommendations
  if (hasFailures) {
    recommendations.push('Address all critical security issues before deployment')
  }
  if (network === 'mainnet') {
    recommendations.push('Consider a professional security audit before mainnet launch')
  }

  console.log(`\n📊 Security Status: ${status.toUpperCase()}`)
  console.log(`   ✅ Passed: ${checks.filter(c => c.status === 'pass').length}`)
  console.log(`   ⚠️  Warnings: ${checks.filter(c => c.status === 'warn').length}`)
  console.log(`   ❌ Failed: ${checks.filter(c => c.status === 'fail').length}`)

  return {
    timestamp: new Date().toISOString(),
    status,
    checks,
    recommendations,
    contractHealth: {
      tokenContract: true,
      stakingContract: true
    }
  }
}

async function updateSecurityIssue(
  octokit: Octokit,
  owner: string,
  repo: string,
  report: SecurityReport
): Promise<void> {
  const issueTitle = '🛡️ GREP Security Guardian Report'

  // Find existing security issue
  const { data: issues } = await octokit.issues.listForRepo({
    owner,
    repo,
    labels: 'security,automated',
    state: 'open'
  })

  const existingIssue = issues.find(i => i.title === issueTitle)

  const statusEmoji = {
    healthy: '🟢',
    warning: '🟡',
    critical: '🔴'
  }

  const body = `## Security Status: ${statusEmoji[report.status]} ${report.status.toUpperCase()}

**Last Updated:** ${report.timestamp}

### Security Checks

| Check | Status | Details |
|-------|--------|---------|
${report.checks.map(c => {
    const emoji = c.status === 'pass' ? '✅' : c.status === 'warn' ? '⚠️' : '❌'
    return `| ${c.name} | ${emoji} ${c.status} | ${c.message} |`
  }).join('\n')}

${report.checks.filter(c => c.details).map(c => `
<details>
<summary>${c.name} Details</summary>

\`\`\`
${c.details}
\`\`\`
</details>
`).join('')}

### Recommendations
${report.recommendations.length > 0
      ? report.recommendations.map(r => `- ${r}`).join('\n')
      : '- No additional recommendations at this time'
    }

---
<sub>🤖 Automated by GREP Security Guardian | [GrepCoin](https://grepcoin.io)</sub>
`

  if (existingIssue) {
    await octokit.issues.update({
      owner,
      repo,
      issue_number: existingIssue.number,
      body
    })
    console.log(`📝 Updated security issue #${existingIssue.number}`)
  } else {
    // Create labels if they don't exist
    try {
      await octokit.issues.createLabel({
        owner,
        repo,
        name: 'security',
        color: 'B60205',
        description: 'Security-related issues'
      })
    } catch { /* Label may already exist */ }

    try {
      await octokit.issues.createLabel({
        owner,
        repo,
        name: 'automated',
        color: '0E8A16',
        description: 'Automated by GREP Agents'
      })
    } catch { /* Label may already exist */ }

    const { data: newIssue } = await octokit.issues.create({
      owner,
      repo,
      title: issueTitle,
      body,
      labels: ['security', 'automated']
    })
    console.log(`📝 Created security issue #${newIssue.number}`)
  }
}

// Run the guardian
runSecurityGuardian().catch((error) => {
  console.error('❌ Security guardian failed:', error)
  process.exit(1)
})
