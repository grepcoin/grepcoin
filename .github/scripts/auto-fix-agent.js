/**
 * Auto-Fix Agent for GitHub Actions CI/CD Pipeline
 * Analyzes failed CI runs and attempts to automatically fix common issues
 */

const { Octokit } = require('@octokit/rest');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const {
  parseAllErrors,
  formatErrorsForClaude
} = require('./error-parser');

/**
 * Create Claude API client
 * @returns {Anthropic} Configured Claude client
 */
function createClaudeClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  return new Anthropic({
    apiKey: apiKey
  });
}

/**
 * Fetch workflow run logs from GitHub
 * @param {Octokit} octokit - GitHub API client
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} runId - Workflow run ID
 * @returns {Promise<string>} Combined logs from all jobs
 */
async function fetchWorkflowLogs(octokit, owner, repo, runId) {
  try {
    console.log(`Fetching logs for workflow run ${runId}...`);

    // Get all jobs for this workflow run
    const { data: jobs } = await octokit.actions.listJobsForWorkflowRun({
      owner,
      repo,
      run_id: runId
    });

    let combinedLogs = '';

    // Fetch logs for each failed job
    for (const job of jobs.jobs) {
      if (job.conclusion === 'failure') {
        console.log(`Fetching logs for failed job: ${job.name}`);

        try {
          const { data: logs } = await octokit.actions.downloadJobLogsForWorkflowRun({
            owner,
            repo,
            job_id: job.id
          });

          combinedLogs += `\n\n=== Job: ${job.name} ===\n`;
          combinedLogs += logs.toString();
        } catch (error) {
          console.warn(`Failed to fetch logs for job ${job.id}:`, error.message);
        }
      }
    }

    return combinedLogs;
  } catch (error) {
    console.error('Error fetching workflow logs:', error);
    throw error;
  }
}

/**
 * Read file contents from the repository
 * @param {string} filePath - Relative path to file
 * @returns {Promise<string>} File contents
 */
async function readFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  return await fs.readFile(fullPath, 'utf-8');
}

/**
 * Write file contents to the repository
 * @param {string} filePath - Relative path to file
 * @param {string} content - New file contents
 */
async function writeFile(filePath, content) {
  const fullPath = path.join(process.cwd(), filePath);
  await fs.writeFile(fullPath, content, 'utf-8');
}

/**
 * Ask Claude to analyze errors and suggest fixes
 * @param {Anthropic} claude - Claude API client
 * @param {Array<Object>} errors - Parsed errors
 * @param {Object} fileContents - Map of file paths to contents
 * @returns {Promise<Array<Object>>} Suggested fixes
 */
async function analyzeErrorsWithClaude(claude, errors, fileContents) {
  const errorDescription = formatErrorsForClaude(errors);

  // Build file context
  let fileContext = '\n\n## Relevant Files\n\n';
  for (const [filePath, content] of Object.entries(fileContents)) {
    fileContext += `### ${filePath}\n\`\`\`\n${content}\n\`\`\`\n\n`;
  }

  const prompt = `You are an expert code assistant helping to automatically fix CI/CD failures.

${errorDescription}

${fileContext}

Please analyze these errors and provide specific fixes. For each fix, respond with a JSON object containing:
- file: the file path
- action: "replace" or "delete_line"
- oldCode: the exact code to replace (must match exactly, including whitespace)
- newCode: the corrected code (or empty string for delete_line)
- explanation: brief explanation of the fix

Return ONLY a JSON array of fix objects, nothing else. Example:
[
  {
    "file": "src/example.ts",
    "action": "replace",
    "oldCode": "const x = 1;",
    "newCode": "const x: number = 1;",
    "explanation": "Added type annotation to fix TS error"
  }
]

Focus on:
1. ESLint auto-fixable issues (unused vars, missing semicolons, formatting)
2. Simple TypeScript errors (missing types, import errors)
3. Basic test fixes (incorrect assertions, missing imports)

Only suggest fixes you are confident about. If uncertain, omit the fix.`;

  console.log('Asking Claude to analyze errors...');

  const message = await claude.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const response = message.content[0].text;
  console.log('Claude response:', response);

  // Parse JSON response
  try {
    // Extract JSON from response (in case there's extra text)
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('No JSON array found in Claude response');
      return [];
    }

    const fixes = JSON.parse(jsonMatch[0]);
    return fixes;
  } catch (error) {
    console.error('Failed to parse Claude response as JSON:', error);
    return [];
  }
}

/**
 * Apply fixes to files
 * @param {Array<Object>} fixes - Fixes to apply
 * @returns {Promise<number>} Number of fixes applied
 */
async function applyFixes(fixes) {
  let appliedCount = 0;

  for (const fix of fixes) {
    try {
      console.log(`Applying fix to ${fix.file}: ${fix.explanation}`);

      const content = await readFile(fix.file);

      if (fix.action === 'replace') {
        if (!content.includes(fix.oldCode)) {
          console.warn(`Could not find exact match for old code in ${fix.file}, skipping...`);
          continue;
        }

        const newContent = content.replace(fix.oldCode, fix.newCode);
        await writeFile(fix.file, newContent);
        appliedCount++;
      } else if (fix.action === 'delete_line') {
        const newContent = content.replace(fix.oldCode + '\n', '');
        await writeFile(fix.file, newContent);
        appliedCount++;
      }
    } catch (error) {
      console.error(`Failed to apply fix to ${fix.file}:`, error);
    }
  }

  return appliedCount;
}

/**
 * Run verification checks
 * @returns {Promise<boolean>} True if all checks pass
 */
async function runVerification() {
  console.log('Running verification checks...');

  try {
    // Try linting
    console.log('Running linter...');
    execSync('npm run lint --workspace=apps/web', { stdio: 'inherit' });
    console.log('Linting passed!');
    return true;
  } catch (error) {
    console.log('Verification checks failed, but continuing...');
    // We'll still create a PR even if checks fail, as it might be a partial fix
    return false;
  }
}

/**
 * Create a fix commit and PR
 * @param {Octokit} octokit - GitHub API client
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} baseBranch - Base branch name
 * @param {Array<Object>} fixes - Applied fixes
 */
async function createFixPR(octokit, owner, repo, baseBranch, fixes) {
  const fixBranch = `autofix/${baseBranch}-${Date.now()}`;

  try {
    // Configure git
    execSync('git config user.name "GrepCoin Auto-Fix Bot"');
    execSync('git config user.email "bot@grepcoin.io"');

    // Create new branch
    console.log(`Creating branch ${fixBranch}...`);
    execSync(`git checkout -b ${fixBranch}`);

    // Stage all changes
    execSync('git add .');

    // Create commit
    const fixSummary = fixes.map(f => `- ${f.file}: ${f.explanation}`).join('\n');
    const commitMessage = `fix(ci): auto-fix CI failures

Applied ${fixes.length} automatic fix(es):
${fixSummary}

Generated by GrepCoin Auto-Fix Agent`;

    execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);

    // Push branch
    console.log('Pushing branch...');
    execSync(`git push origin ${fixBranch}`);

    // Create PR
    console.log('Creating pull request...');
    const { data: pr } = await octokit.pulls.create({
      owner,
      repo,
      title: `[Auto-Fix] Fix CI failures in ${baseBranch}`,
      head: fixBranch,
      base: baseBranch,
      body: `## Auto-Generated Fix

This PR was automatically created by the GrepCoin Auto-Fix Agent to address CI failures.

### Applied Fixes (${fixes.length})

${fixes.map((f, i) => `${i + 1}. **${f.file}**\n   ${f.explanation}`).join('\n\n')}

### Verification

The fixes have been applied and committed. Please review the changes and run CI to verify the fixes work correctly.

---
🤖 Generated by [GrepCoin Auto-Fix Agent](https://github.com/grepcoin/grepcoin)
`
    });

    console.log(`✓ Pull request created: ${pr.html_url}`);
    return pr;
  } catch (error) {
    console.error('Failed to create PR:', error);
    throw error;
  }
}

/**
 * Main entry point
 */
async function main() {
  try {
    console.log('=== GrepCoin Auto-Fix Agent ===\n');

    // Validate environment
    const githubToken = process.env.GITHUB_TOKEN;
    const workflowRunId = process.env.WORKFLOW_RUN_ID;
    const repository = process.env.REPOSITORY;
    const headBranch = process.env.HEAD_BRANCH;

    if (!githubToken || !workflowRunId || !repository) {
      throw new Error('Missing required environment variables');
    }

    const [owner, repo] = repository.split('/');

    // Initialize clients
    const octokit = new Octokit({ auth: githubToken });
    const claude = createClaudeClient();

    // Fetch workflow logs
    const logs = await fetchWorkflowLogs(octokit, owner, repo, parseInt(workflowRunId));

    if (!logs || logs.length === 0) {
      console.log('No logs found, exiting...');
      return;
    }

    // Parse errors
    console.log('Parsing errors from logs...');
    const errors = parseAllErrors(logs);

    if (errors.length === 0) {
      console.log('No parseable errors found, exiting...');
      return;
    }

    console.log(`Found ${errors.length} error(s) to fix`);

    // Get unique file list
    const uniqueFiles = [...new Set(errors.map(e => e.file))];
    console.log(`Affected files: ${uniqueFiles.join(', ')}`);

    // Read file contents
    const fileContents = {};
    for (const filePath of uniqueFiles) {
      try {
        fileContents[filePath] = await readFile(filePath);
      } catch (error) {
        console.warn(`Failed to read ${filePath}:`, error.message);
      }
    }

    // Analyze errors with Claude
    const fixes = await analyzeErrorsWithClaude(claude, errors, fileContents);

    if (fixes.length === 0) {
      console.log('Claude did not suggest any fixes, exiting...');
      return;
    }

    console.log(`Claude suggested ${fixes.length} fix(es)`);

    // Apply fixes
    const appliedCount = await applyFixes(fixes);
    console.log(`Applied ${appliedCount} fix(es)`);

    if (appliedCount === 0) {
      console.log('No fixes were applied, exiting...');
      return;
    }

    // Run verification
    await runVerification();

    // Create PR
    const pr = await createFixPR(octokit, owner, repo, headBranch, fixes);

    console.log('\n✓ Auto-fix completed successfully!');
    console.log(`  PR: ${pr.html_url}`);
  } catch (error) {
    console.error('Auto-fix agent failed:', error);
    process.exit(1);
  }
}

// Run the agent
if (require.main === module) {
  main();
}

module.exports = { main };
