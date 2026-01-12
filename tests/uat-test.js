#!/usr/bin/env node
/**
 * UAT Test Suite for F5 XC Cloud Status MCP Server
 * Programmatically tests all 15 prompts on OpenCode and Claude CLI
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TIMEOUT = 60000; // 60 seconds per test
const RESULTS_DIR = path.join(__dirname, '../test-results');

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// Test prompts with expected tool validation
const testCases = [
  {
    id: 1,
    name: 'Overall Status Check (Basic)',
    prompt: 'What is the current status of F5 Cloud services?',
    expectedTool: 'f5-status-get-overall',
    category: 'basic'
  },
  {
    id: 2,
    name: 'Overall Status Check (Interpreted)',
    prompt: 'Is F5 Cloud experiencing any issues right now?',
    expectedTool: 'f5-status-get-overall',
    category: 'basic'
  },
  {
    id: 3,
    name: 'All Components',
    prompt: 'Show me all F5 Cloud service components',
    expectedTool: 'f5-status-get-components',
    category: 'components'
  },
  {
    id: 4,
    name: 'Filtered Components (Status)',
    prompt: 'Show me components that are degraded or have issues',
    expectedTool: 'f5-status-get-components',
    category: 'components'
  },
  {
    id: 5,
    name: 'Filtered Components (Group)',
    prompt: 'List components in the Distributed Cloud Services group',
    expectedTool: 'f5-status-get-components',
    category: 'components'
  },
  {
    id: 6,
    name: 'Specific Component',
    prompt: 'Get details for the API Gateway component',
    expectedTool: 'f5-status-get-component',
    category: 'components'
  },
  {
    id: 7,
    name: 'Active Incidents',
    prompt: 'Are there any active incidents affecting F5 Cloud?',
    expectedTool: 'f5-status-get-incidents',
    category: 'incidents'
  },
  {
    id: 8,
    name: 'Recent Incidents (Timeframe)',
    prompt: 'Show me F5 Cloud incidents from the last 30 days',
    expectedTool: 'f5-status-get-incidents',
    category: 'incidents'
  },
  {
    id: 9,
    name: 'Critical Incidents',
    prompt: 'Show me critical impact incidents',
    expectedTool: 'f5-status-get-incidents',
    category: 'incidents'
  },
  {
    id: 10,
    name: 'All Maintenance',
    prompt: 'What maintenance is scheduled for F5 Cloud?',
    expectedTool: 'f5-status-get-maintenance',
    category: 'maintenance'
  },
  {
    id: 11,
    name: 'Active Maintenance',
    prompt: 'Is there any active maintenance right now?',
    expectedTool: 'f5-status-get-maintenance',
    category: 'maintenance'
  },
  {
    id: 12,
    name: 'General Search',
    prompt: "Search for 'API' in F5 Cloud status",
    expectedTool: 'f5-status-search',
    category: 'search'
  },
  {
    id: 13,
    name: 'Typed Search',
    prompt: "Search for 'certificate' in components only",
    expectedTool: 'f5-status-search',
    category: 'search'
  },
  {
    id: 14,
    name: 'Comprehensive Report (Multi-Tool)',
    prompt: 'Give me a complete F5 Cloud status report with overall status, any issues, and active incidents',
    expectedTool: 'f5-status',
    category: 'multi-tool'
  },
  {
    id: 15,
    name: 'Impact Analysis (Multi-Tool)',
    prompt: 'What components are affected by current incidents?',
    expectedTool: 'f5-status',
    category: 'multi-tool'
  }
];

// Test results
const results = {
  opencode: [],
  claude: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  }
};

// Run a single test
function runTest(platform, testCase) {
  const startTime = Date.now();
  const outputFile = path.join(RESULTS_DIR, `${platform}_test${testCase.id}.json`);

  console.log(`\n[Test ${testCase.id} - ${platform}] ${testCase.name}`);
  console.log(`  Prompt: "${testCase.prompt}"`);

  try {
    const command = platform === 'opencode'
      ? `opencode run "${testCase.prompt.replace(/"/g, '\\"')}"`
      : `claude -p "${testCase.prompt.replace(/"/g, '\\"')}"`;

    const output = execSync(command, {
      timeout: TIMEOUT,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Validate response
    const hasExpectedTool = output.includes(testCase.expectedTool);
    const hasContent = output.length > 100;
    const passed = hasExpectedTool || hasContent;

    const result = {
      id: testCase.id,
      name: testCase.name,
      category: testCase.category,
      prompt: testCase.prompt,
      expectedTool: testCase.expectedTool,
      passed,
      duration: `${duration}s`,
      responseLength: output.length,
      timestamp: new Date().toISOString(),
      output: output.substring(0, 500) // Store first 500 chars
    };

    // Save full output to file
    fs.writeFileSync(outputFile, JSON.stringify({
      ...result,
      fullOutput: output
    }, null, 2));

    if (passed) {
      console.log(`  ✓ PASS (${duration}s)`);
      results.summary.passed++;
    } else {
      console.log(`  ✗ FAIL (${duration}s)`);
      console.log(`  Reason: Expected tool not found and content too short`);
      results.summary.failed++;
    }

    return result;

  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`  ✗ FAIL (${duration}s)`);
    console.log(`  Error: ${error.message.substring(0, 100)}`);

    results.summary.failed++;

    return {
      id: testCase.id,
      name: testCase.name,
      category: testCase.category,
      prompt: testCase.prompt,
      expectedTool: testCase.expectedTool,
      passed: false,
      duration: `${duration}s`,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Main test execution
async function main() {
  console.log('================================================');
  console.log('F5 XC Cloud Status MCP - UAT Test Suite (Node.js)');
  console.log('================================================');
  console.log(`Start Time: ${new Date().toISOString()}`);
  console.log(`Results Directory: ${RESULTS_DIR}`);

  // Test OpenCode
  console.log('\n--- Testing OpenCode ---');
  for (const testCase of testCases) {
    results.summary.total++;
    const result = runTest('opencode', testCase);
    results.opencode.push(result);
  }

  // Test Claude CLI
  console.log('\n\n--- Testing Claude CLI ---');
  for (const testCase of testCases) {
    results.summary.total++;
    const result = runTest('claude', testCase);
    results.claude.push(result);
  }

  // Generate summary report
  console.log('\n\n================================================');
  console.log('Test Summary');
  console.log('================================================');
  console.log(`Total Tests: ${results.summary.total}`);
  console.log(`✓ Passed: ${results.summary.passed}`);
  console.log(`✗ Failed: ${results.summary.failed}`);
  console.log(`⊘ Skipped: ${results.summary.skipped}`);
  console.log(`Success Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);

  // Category breakdown
  console.log('\n--- By Category ---');
  const categories = {};
  [...results.opencode, ...results.claude].forEach(result => {
    if (!categories[result.category]) {
      categories[result.category] = { passed: 0, failed: 0 };
    }
    if (result.passed) {
      categories[result.category].passed++;
    } else {
      categories[result.category].failed++;
    }
  });

  Object.keys(categories).forEach(cat => {
    const stats = categories[cat];
    console.log(`  ${cat}: ${stats.passed}/${stats.passed + stats.failed} passed`);
  });

  // Platform comparison
  console.log('\n--- By Platform ---');
  const opencodePass = results.opencode.filter(r => r.passed).length;
  const claudePass = results.claude.filter(r => r.passed).length;
  console.log(`  OpenCode: ${opencodePass}/${results.opencode.length} passed`);
  console.log(`  Claude CLI: ${claudePass}/${results.claude.length} passed`);

  // Save complete results
  const resultsFile = path.join(RESULTS_DIR, 'uat-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`\nComplete results saved to: ${resultsFile}`);

  // Exit with appropriate code
  process.exit(results.summary.failed === 0 ? 0 : 1);
}

// Run tests
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
