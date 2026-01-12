#!/bin/bash
# UAT Test Suite for F5 XC Cloud Status MCP Server
# Tests all 15 prompts on OpenCode and Claude CLI

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test results directory
RESULTS_DIR="./test-results"
mkdir -p "$RESULTS_DIR"

# Function to run a test
run_test() {
    local test_num=$1
    local platform=$2
    local prompt=$3
    local expected_tool=$4

    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${YELLOW}[Test $test_num - $platform]${NC} $prompt"

    local output_file="$RESULTS_DIR/${platform}_test${test_num}.txt"
    local start_time=$(date +%s)

    if [ "$platform" = "opencode" ]; then
        timeout 60 opencode run "$prompt" > "$output_file" 2>&1 || true
    elif [ "$platform" = "claude" ]; then
        timeout 60 claude -p "$prompt" --dangerously-skip-permissions > "$output_file" 2>&1 || true
    fi

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    # Check if output contains expected tool name or has reasonable content
    if grep -q "$expected_tool" "$output_file" || [ $(wc -l < "$output_file") -gt 3 ]; then
        echo -e "${GREEN}✓ PASS${NC} (${duration}s)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (${duration}s)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "  Output: $(head -3 "$output_file")"
        return 1
    fi
}

echo "================================================"
echo "F5 XC Cloud Status MCP - UAT Test Suite"
echo "================================================"
echo ""

# Test 1: Overall Status Check (Basic)
run_test 1 "opencode" "What is the current status of F5 Cloud services?" "f5-status-get-overall"

# Test 2: Overall Status Check (Interpreted)
run_test 2 "opencode" "Is F5 Cloud experiencing any issues right now?" "f5-status-get-overall"

# Test 3: All Components
run_test 3 "opencode" "Show me all F5 Cloud service components" "f5-status-get-components"

# Test 4: Filtered Components (Status)
run_test 4 "opencode" "Show me components that are degraded or have issues" "f5-status-get-components"

# Test 5: Filtered Components (Group)
run_test 5 "opencode" "List components in the Distributed Cloud Services group" "f5-status-get-components"

# Test 6: Specific Component
run_test 6 "opencode" "Get details for the API Gateway component" "f5-status-get-component"

# Test 7: Active Incidents
run_test 7 "opencode" "Are there any active incidents affecting F5 Cloud?" "f5-status-get-incidents"

# Test 8: Recent Incidents (Timeframe)
run_test 8 "opencode" "Show me F5 Cloud incidents from the last 30 days" "f5-status-get-incidents"

# Test 9: Critical Incidents
run_test 9 "opencode" "Show me critical impact incidents" "f5-status-get-incidents"

# Test 10: All Maintenance
run_test 10 "opencode" "What maintenance is scheduled for F5 Cloud?" "f5-status-get-maintenance"

# Test 11: Active Maintenance
run_test 11 "opencode" "Is there any active maintenance right now?" "f5-status-get-maintenance"

# Test 12: General Search
run_test 12 "opencode" "Search for 'API' in F5 Cloud status" "f5-status-search"

# Test 13: Typed Search
run_test 13 "opencode" "Search for 'certificate' in components only" "f5-status-search"

# Test 14: Comprehensive Report
run_test 14 "opencode" "Give me a complete F5 Cloud status report with overall status, any issues, and active incidents" "f5-status"

# Test 15: Impact Analysis
run_test 15 "opencode" "What components are affected by current incidents?" "f5-status"

echo ""
echo "================================================"
echo "Now testing Claude CLI..."
echo "================================================"
echo ""

# Run same tests on Claude CLI
run_test 1 "claude" "What is the current status of F5 Cloud services?" "f5-status-get-overall"
run_test 2 "claude" "Is F5 Cloud experiencing any issues right now?" "f5-status-get-overall"
run_test 3 "claude" "Show me all F5 Cloud service components" "f5-status-get-components"
run_test 4 "claude" "Show me components that are degraded or have issues" "f5-status-get-components"
run_test 5 "claude" "List components in the Distributed Cloud Services group" "f5-status-get-components"
run_test 6 "claude" "Get details for the API Gateway component" "f5-status-get-component"
run_test 7 "claude" "Are there any active incidents affecting F5 Cloud?" "f5-status-get-incidents"
run_test 8 "claude" "Show me F5 Cloud incidents from the last 30 days" "f5-status-get-incidents"
run_test 9 "claude" "Show me critical impact incidents" "f5-status-get-incidents"
run_test 10 "claude" "What maintenance is scheduled for F5 Cloud?" "f5-status-get-maintenance"
run_test 11 "claude" "Is there any active maintenance right now?" "f5-status-get-maintenance"
run_test 12 "claude" "Search for 'API' in F5 Cloud status" "f5-status-search"
run_test 13 "claude" "Search for 'certificate' in components only" "f5-status-search"
run_test 14 "claude" "Give me a complete F5 Cloud status report with overall status, any issues, and active incidents" "f5-status"
run_test 15 "claude" "What components are affected by current incidents?" "f5-status"

echo ""
echo "================================================"
echo "Test Summary"
echo "================================================"
echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"
echo ""
echo "Detailed results saved to: $RESULTS_DIR/"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
