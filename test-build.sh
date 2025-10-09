#!/bin/bash

# MCPB Build and Test Script
# This script builds and validates your MCPB package locally before pushing to GitHub

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check prerequisites
print_step "Checking prerequisites..."

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    print_error "jq is not installed. Install with: brew install jq (macOS) or apt-get install jq (Linux)"
    exit 1
fi
print_success "jq is installed"

# Check if node is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Install from: https://nodejs.org/"
    exit 1
fi
print_success "Node.js $(node --version) is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm $(npm --version) is installed"

# Check if MCPB CLI is installed
if ! command -v mcpb &> /dev/null; then
    print_warning "MCPB CLI is not installed. Installing now..."
    npm install -g @anthropic-ai/mcpb
    print_success "MCPB CLI installed"
else
    print_success "MCPB CLI is installed"
fi

# Validate manifest.json
print_step "Validating manifest.json..."

if [ ! -f "manifest.json" ]; then
    print_error "manifest.json not found in current directory"
    exit 1
fi

if ! jq empty manifest.json 2>/dev/null; then
    print_error "manifest.json is not valid JSON"
    exit 1
fi

print_success "manifest.json is valid JSON"

# Extract and display key information
PACKAGE_ID=$(jq -r '.id' manifest.json)
PACKAGE_VERSION=$(jq -r '.version' manifest.json)
PACKAGE_NAME=$(jq -r '.name' manifest.json)

echo ""
echo "Package Information:"
echo "  ID:      $PACKAGE_ID"
echo "  Name:    $PACKAGE_NAME"
echo "  Version: $PACKAGE_VERSION"
echo ""

# Install dependencies
print_step "Installing dependencies..."

if [ -f "package.json" ]; then
    npm ci --quiet
    print_success "Dependencies installed"
else
    print_warning "No package.json found, skipping dependency installation"
fi

# Clean old builds
print_step "Cleaning old builds..."

rm -f *.mcpb
print_success "Old builds removed"

# Build MCPB package
print_step "Building MCPB package..."

if mcpb pack; then
    print_success "MCPB package built successfully"
else
    print_error "Failed to build MCPB package"
    exit 1
fi
