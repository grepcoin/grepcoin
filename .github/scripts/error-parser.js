/**
 * Error parsing utilities for CI/CD auto-fix agent
 * Extracts structured error information from various tool outputs
 */

/**
 * Parse ESLint errors from log output
 * @param {string} log - Raw log output containing ESLint errors
 * @returns {Array<Object>} Array of parsed ESLint errors
 */
function parseESLintErrors(log) {
  const errors = [];
  const lines = log.split('\n');

  // ESLint format: /path/to/file.ts
  //   line:col  error/warning  message  rule-name
  let currentFile = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for file path (usually starts with / or contains .ts, .js, .tsx, .jsx)
    if (line.match(/^[\s]*\/.*\.(ts|js|tsx|jsx)x?$/)) {
      currentFile = line.trim();
      continue;
    }

    // Check for error line: "  10:5  error  'x' is defined but never used  @typescript-eslint/no-unused-vars"
    const errorMatch = line.match(/^\s*(\d+):(\d+)\s+(error|warning)\s+(.+?)\s+([\w\-/@]+)$/);
    if (errorMatch && currentFile) {
      errors.push({
        type: 'eslint',
        severity: errorMatch[3],
        file: currentFile,
        line: parseInt(errorMatch[1], 10),
        column: parseInt(errorMatch[2], 10),
        message: errorMatch[4].trim(),
        rule: errorMatch[5]
      });
    }
  }

  return errors;
}

/**
 * Parse TypeScript compiler errors from log output
 * @param {string} log - Raw log output containing TypeScript errors
 * @returns {Array<Object>} Array of parsed TypeScript errors
 */
function parseTypeScriptErrors(log) {
  const errors = [];
  const lines = log.split('\n');

  // TypeScript format: path/to/file.ts(line,col): error TS1234: message
  // Also handles: path/to/file.ts:line:col - error TS1234: message

  for (const line of lines) {
    // Format 1: file.ts(10,5): error TS2345: message
    let match = line.match(/^(.+\.tsx?)\((\d+),(\d+)\):\s*(error|warning)\s+TS(\d+):\s*(.+)$/);

    if (match) {
      errors.push({
        type: 'typescript',
        severity: match[4],
        file: match[1],
        line: parseInt(match[2], 10),
        column: parseInt(match[3], 10),
        code: `TS${match[5]}`,
        message: match[6].trim()
      });
      continue;
    }

    // Format 2: file.ts:10:5 - error TS2345: message
    match = line.match(/^(.+\.tsx?):(\d+):(\d+)\s*-\s*(error|warning)\s+TS(\d+):\s*(.+)$/);

    if (match) {
      errors.push({
        type: 'typescript',
        severity: match[4],
        file: match[1],
        line: parseInt(match[2], 10),
        column: parseInt(match[3], 10),
        code: `TS${match[5]}`,
        message: match[6].trim()
      });
    }
  }

  return errors;
}

/**
 * Parse Jest test errors from log output
 * @param {string} log - Raw log output containing Jest errors
 * @returns {Array<Object>} Array of parsed test failures
 */
function parseJestErrors(log) {
  const errors = [];
  const lines = log.split('\n');

  let currentFile = null;
  let currentTest = null;
  let errorMessage = [];
  let inErrorBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for test file: ● path/to/test.spec.ts
    const fileMatch = line.match(/^\s*●\s+(.+\.(?:test|spec)\.(ts|js|tsx|jsx))$/);
    if (fileMatch) {
      currentFile = fileMatch[1];
      continue;
    }

    // Check for test name: ● Test suite name › test name
    const testMatch = line.match(/^\s*●\s+(.+?)(?:\s+›\s+(.+))?$/);
    if (testMatch && !fileMatch) {
      // Save previous error if exists
      if (currentFile && currentTest && errorMessage.length > 0) {
        errors.push({
          type: 'jest',
          file: currentFile,
          testName: currentTest,
          message: errorMessage.join('\n').trim()
        });
      }

      currentTest = testMatch[2] || testMatch[1];
      errorMessage = [];
      inErrorBlock = true;
      continue;
    }

    // Collect error messages
    if (inErrorBlock && line.trim() && !line.match(/^FAIL|^PASS|^Test Suites:/)) {
      errorMessage.push(line);
    }

    // End of error block
    if (line.match(/^FAIL|^PASS|^Test Suites:/) && inErrorBlock) {
      if (currentFile && currentTest && errorMessage.length > 0) {
        errors.push({
          type: 'jest',
          file: currentFile,
          testName: currentTest,
          message: errorMessage.join('\n').trim()
        });
      }
      inErrorBlock = false;
      currentTest = null;
      errorMessage = [];
    }
  }

  // Add last error if exists
  if (currentFile && currentTest && errorMessage.length > 0) {
    errors.push({
      type: 'jest',
      file: currentFile,
      testName: currentTest,
      message: errorMessage.join('\n').trim()
    });
  }

  return errors;
}

/**
 * Format parsed errors for Claude prompt
 * @param {Array<Object>} errors - Array of parsed errors
 * @returns {string} Formatted error description for Claude
 */
function formatErrorsForClaude(errors) {
  if (errors.length === 0) {
    return 'No errors found.';
  }

  let formatted = `Found ${errors.length} error(s) that need fixing:\n\n`;

  // Group errors by type
  const byType = {
    eslint: [],
    typescript: [],
    jest: []
  };

  errors.forEach(error => {
    if (byType[error.type]) {
      byType[error.type].push(error);
    }
  });

  // Format ESLint errors
  if (byType.eslint.length > 0) {
    formatted += '## ESLint Errors\n\n';
    byType.eslint.forEach((error, idx) => {
      formatted += `${idx + 1}. **${error.file}:${error.line}:${error.column}**\n`;
      formatted += `   Rule: \`${error.rule}\`\n`;
      formatted += `   Message: ${error.message}\n\n`;
    });
  }

  // Format TypeScript errors
  if (byType.typescript.length > 0) {
    formatted += '## TypeScript Errors\n\n';
    byType.typescript.forEach((error, idx) => {
      formatted += `${idx + 1}. **${error.file}:${error.line}:${error.column}**\n`;
      formatted += `   Code: \`${error.code}\`\n`;
      formatted += `   Message: ${error.message}\n\n`;
    });
  }

  // Format Jest errors
  if (byType.jest.length > 0) {
    formatted += '## Test Failures\n\n';
    byType.jest.forEach((error, idx) => {
      formatted += `${idx + 1}. **${error.file}**\n`;
      formatted += `   Test: ${error.testName}\n`;
      formatted += `   Error:\n\`\`\`\n${error.message}\n\`\`\`\n\n`;
    });
  }

  return formatted;
}

/**
 * Parse all error types from a log
 * @param {string} log - Raw log output
 * @returns {Array<Object>} Combined array of all parsed errors
 */
function parseAllErrors(log) {
  const eslintErrors = parseESLintErrors(log);
  const tsErrors = parseTypeScriptErrors(log);
  const jestErrors = parseJestErrors(log);

  return [...eslintErrors, ...tsErrors, ...jestErrors];
}

module.exports = {
  parseESLintErrors,
  parseTypeScriptErrors,
  parseJestErrors,
  parseAllErrors,
  formatErrorsForClaude
};
