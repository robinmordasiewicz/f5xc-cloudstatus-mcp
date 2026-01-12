# F5 XC Cloud Status MCP - Test Suite

This directory contains automated UAT (User Acceptance Testing) tests for the F5 XC Cloud Status MCP server across multiple CLI platforms.

## Test Files

- **`uat-test.sh`** - Bash-based test runner (simple, portable)
- **`uat-test.js`** - Node.js-based test runner (structured output, JSON results)
- **`test-results/`** - Directory containing test execution results

## Prerequisites

Before running tests:

1. **Node.js 18.0.0+** installed
2. **OpenCode CLI** installed (`which opencode`)
3. **Claude CLI** installed (`which claude`)
4. **MCP servers configured** on both platforms
5. **Internet connection** for F5 Cloud API access

Verify prerequisites:
```bash
node --version  # Should be v18.0.0+
opencode --version
claude --version
```

## Running Tests

### Quick Test (Bash)

Run all 30 tests (15 prompts × 2 platforms):

```bash
cd tests
./uat-test.sh
```

**Output:**
- Real-time pass/fail for each test
- Summary with total/passed/failed counts
- Individual test results in `test-results/` directory

**Estimated Time:** 15-30 minutes (depends on API response times)

### Structured Test (Node.js)

Run with structured JSON output:

```bash
cd tests
node uat-test.js
```

**Features:**
- JSON-formatted test results
- Category breakdown (basic, components, incidents, maintenance, search, multi-tool)
- Platform comparison (OpenCode vs Claude CLI)
- Detailed error messages
- Response length validation

**Output Files:**
- `test-results/uat-results.json` - Complete test results
- `test-results/opencode_test[1-15].json` - Individual OpenCode test results
- `test-results/claude_test[1-15].json` - Individual Claude CLI test results

### NPM Scripts (from project root)

```bash
# Run bash tests
npm run test:uat:bash

# Run Node.js tests
npm run test:uat:node

# Run all tests
npm test
```

## Test Cases

### 15 UAT Prompts Tested

| ID | Category | Test Name | Expected Tool |
|----|----------|-----------|---------------|
| 1 | Basic | Overall Status Check (Basic) | f5-status-get-overall |
| 2 | Basic | Overall Status Check (Interpreted) | f5-status-get-overall |
| 3 | Components | All Components | f5-status-get-components |
| 4 | Components | Filtered Components (Status) | f5-status-get-components |
| 5 | Components | Filtered Components (Group) | f5-status-get-components |
| 6 | Components | Specific Component | f5-status-get-component |
| 7 | Incidents | Active Incidents | f5-status-get-incidents |
| 8 | Incidents | Recent Incidents (Timeframe) | f5-status-get-incidents |
| 9 | Incidents | Critical Incidents | f5-status-get-incidents |
| 10 | Maintenance | All Maintenance | f5-status-get-maintenance |
| 11 | Maintenance | Active Maintenance | f5-status-get-maintenance |
| 12 | Search | General Search | f5-status-search |
| 13 | Search | Typed Search | f5-status-search |
| 14 | Multi-Tool | Comprehensive Report | f5-status-* |
| 15 | Multi-Tool | Impact Analysis | f5-status-* |

### Platforms Tested

- **OpenCode** - Terminal editor with MCP support
- **Claude CLI** - Command-line interface for Claude

## Platform-Specific Notes

### Claude CLI Permission Handling

Claude CLI requires the `--dangerously-skip-permissions` flag for automated testing:

```bash
claude -p "your prompt" --dangerously-skip-permissions
```

**Why this is needed:**
- Claude CLI has a security feature that requires interactive consent for MCP tool usage
- This is appropriate for manual usage but blocks automated testing
- The flag bypasses permission prompts during test execution
- OpenCode does not require this flag

**Security Note:**
- This flag should ONLY be used in automated testing environments
- Do NOT use in production or manual testing contexts
- The flag is called "dangerously" for a reason - use with caution
- For manual testing, omit the flag to preserve interactive permission prompts

**Test Script Implementation:**
Both test scripts (`uat-test.sh` and `uat-test.js`) automatically use this flag when testing Claude CLI. No additional configuration needed.

## Test Validation

Each test validates:

1. **Tool Invocation** - Correct MCP tool called
2. **Response Content** - Non-empty, meaningful response
3. **Response Time** - < 60 seconds per test
4. **Error Handling** - Graceful handling of empty results

## Success Criteria

A test **PASSES** if:
- ✓ Expected tool name appears in response, OR
- ✓ Response contains substantial content (>100 chars)
- ✓ Completes within timeout (60s)
- ✓ No fatal errors

A test **FAILS** if:
- ✗ Timeout exceeded
- ✗ Command execution error
- ✗ Empty or very short response
- ✗ Wrong tool invoked

## Test Results

### Reading Results

**Bash results:**
```bash
cat test-results/opencode_test1.txt  # Individual test output
cat test-results/claude_test1.txt
```

**Node.js results:**
```bash
cat test-results/uat-results.json    # Complete results with summary
cat test-results/opencode_test1.json # Individual test with metadata
```

### Expected Pass Rate

- **Target:** 100% pass rate (30/30 tests)
- **Minimum Acceptable:** 90% pass rate (27/30 tests)
- **Investigate:** Any test with <80% pass rate

## Troubleshooting Tests

### "Command not found: opencode" or "claude"

**Solution:** Install the missing CLI tool
```bash
# For OpenCode
brew install opencode  # or appropriate installation method

# For Claude CLI
# Follow Claude CLI installation instructions
```

### "Timeout exceeded"

**Causes:**
- Slow network connection
- F5 Cloud API temporarily slow
- Complex queries taking longer than 60s

**Solutions:**
1. Increase timeout in test scripts
2. Check network connectivity
3. Verify F5 Cloud API status: https://www.f5cloudstatus.com

### "MCP server not found"

**Solution:** Configure MCP server for the platform
```bash
# Verify configuration
cat ~/.config/opencode/opencode.json | grep f5xc-cloudstatus
```

See: [Installation Guides](../docs/installation/)

### Tests pass locally but fail in CI

**Causes:**
- CI environment missing prerequisites
- Network restrictions in CI
- MCP servers not configured in CI

**Solutions:**
1. Add prerequisite installation to CI config
2. Ensure CI has network access to F5 Cloud API
3. Configure MCP servers in CI environment setup

## CI/CD Integration

### GitHub Actions Example

```yaml
name: UAT Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install OpenCode
        run: npm install -g @opencode-ai/cli

      - name: Install Claude CLI
        run: npm install -g @anthropic-ai/claude-cli

      - name: Configure MCP Servers
        run: |
          # Configure OpenCode MCP
          # Configure Claude CLI MCP

      - name: Run UAT Tests
        run: npm run test:uat:node

      - name: Upload Test Results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: tests/test-results/
```

## Manual Testing

For manual verification outside automated tests:

```bash
# Test OpenCode manually
opencode run "What is the current status of F5 Cloud services?"

# Test Claude CLI manually
claude -p "What is the current status of F5 Cloud services?"
```

## Continuous Improvement

After running tests:

1. **Review failed tests** - Investigate root cause
2. **Update prompts** - Improve clarity if ambiguous
3. **Adjust timeouts** - If consistent timeout issues
4. **Document edge cases** - Add to troubleshooting guide
5. **Report bugs** - If MCP server issues found

## Next Steps

- Add **unit tests** for individual MCP tools
- Add **integration tests** for VS Code and Claude Desktop
- Add **performance benchmarks** for response times
- Add **load testing** for concurrent requests
- Add **error injection tests** for resilience

---

**Last Updated:** January 2026
**Test Suite Version:** 1.0.0
**Estimated Test Duration:** 15-30 minutes for full suite
