# Quick Start Guide - F5 Cloud Status MCP Server

Get up and running with the F5 Cloud Status MCP Server in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- An MCP-compatible AI tool (Claude Desktop, VS Code, Cursor, or Windsurf)

## Option 1: NPM Package (Recommended - Fastest Setup)

### For Claude Desktop

**Step 1:** Locate your Claude Desktop configuration file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Step 2:** Add this configuration:

```json
{
  "mcpServers": {
    "f5-cloud-status": {
      "command": "npx",
      "args": ["-y", "f5cloudstatus-mcp-server"]
    }
  }
}
```

**Step 3:** Restart Claude Desktop

**Step 4:** Look for the 🔌 MCP icon - you should see "f5-cloud-status" connected!

### For Claude Code

Simply run:

```bash
claude code mcp add f5cloudstatus-mcp-server
```

### For VS Code (with GitHub Copilot)

Open Extensions view and search for `@mcp`, then install **F5 Cloud Status**.

Or enable auto-discovery in VS Code settings:
```json
{
  "chat.mcp.discovery.enabled": true
}
```

### For Cursor IDE

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Search for "Cursor Settings"
3. Click MCP and browse for F5 Cloud Status
4. Click Install

### For Windsurf

1. Click Plugins icon in Cascade panel
2. Search for "F5 Cloud Status"
3. Click Install

## Option 2: Global Installation

If you prefer a global installation:

```bash
# Install globally
npm install -g f5cloudstatus-mcp-server
```

Then configure:

```json
{
  "mcpServers": {
    "f5-cloud-status": {
      "command": "f5cloudstatus-mcp"
    }
  }
}
```

## Option 3: For Developers (Local Build)

**Only if you want to modify the source code:**

### 1. Clone and Build

```bash
git clone https://github.com/robinmordasiewicz/f5cloudstatus-mcp-server.git
cd f5cloudstatus-mcp-server
npm install
npm run build
```

### 2. Test Locally (Optional)

```bash
npm start
```

You should see:
```
[INFO] MCP Server started and listening on stdio
```

Press `Ctrl+C` to stop.

### 3. Configure with Absolute Path

Edit your MCP client configuration with the absolute path to `dist/index.js`:

**macOS/Linux:**
```json
{
  "mcpServers": {
    "f5-cloud-status": {
      "command": "node",
      "args": ["/absolute/path/to/f5cloudstatus-mcp-server/dist/index.js"]
    }
  }
}
```

**Windows:**
```json
{
  "mcpServers": {
    "f5-cloud-status": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": ["C:\\path\\to\\f5cloudstatus-mcp-server\\dist\\index.js"]
    }
  }
}
```

**Note:** Replace paths with your actual project location. The npx method (Option 1) is much simpler!

## Try It Out

Ask your AI assistant any of these questions:

1. **"What is the current status of F5 Cloud services?"**
   - Uses: `f5-status-get-overall`

2. **"Show me all F5 Cloud components that are having issues"**
   - Uses: `f5-status-get-components` with status filter

3. **"Are there any active incidents?"**
   - Uses: `f5-status-get-incidents`

4. **"What maintenance is scheduled for F5 Cloud?"**
   - Uses: `f5-status-get-maintenance`

5. **"Search for anything related to API Gateway"**
   - Uses: `f5-status-search`

## Common Issues

### Server not connecting

**Using npx method:**
```bash
# Test if npx works
npx f5cloudstatus-mcp-server
# Should show: "MCP Server started and listening on stdio"
```

**Check Node.js version:**
```bash
node --version  # Should be 18.0.0 or higher
npm --version
```

### Tools not appearing in AI assistant

1. **Restart the application completely**
2. **Check configuration syntax** - JSON must be valid
3. **Verify paths** if using local build (must be absolute paths)

### Permission errors (when installing globally)

**Never use sudo with npm!**

Fix permissions:
```bash
# Use a version manager instead
# Install nvm: https://github.com/nvm-sh/nvm
nvm install --lts
nvm use --lts
```

### Playwright browser not found (rare - only if API fails)

```bash
npx playwright install chromium
```

The web scraper only runs as a fallback when the API fails.

## Optional: Environment Configuration

The server works with sensible defaults. To customize:

Create a `.env` file (anywhere in your system):

```bash
# API Configuration (optional)
API_BASE_URL=https://www.f5cloudstatus.com/api/v2
API_TIMEOUT=10000

# Cache TTL in milliseconds (optional)
CACHE_TTL_STATUS=30000
CACHE_TTL_COMPONENTS=60000

# Logging (optional)
LOG_LEVEL=info  # debug, info, warn, error
```

The `.env` file will be automatically loaded.

## Next Steps

- **📦 Full Installation Guide**: [INSTALLATION.md](INSTALLATION.md) - Detailed setup for all tools
- **📖 Usage Examples**: [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) - 14 real-world examples
- **📚 Complete Documentation**: [README.md](README.md) - All features and tools
- **🏗️ Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md) - System design details

## Development

Want to modify the server?

```bash
# Watch mode for development
npm run dev

# Run tests
npm test

# Check code quality
npm run lint
```

See the [README.md](README.md) for complete development documentation.

## Getting Help

- **GitHub Issues**: https://github.com/robinmordasiewicz/f5cloudstatus-mcp-server/issues
- **NPM Package**: https://www.npmjs.com/package/f5cloudstatus-mcp-server
- **Troubleshooting**: See [INSTALLATION.md](INSTALLATION.md) for detailed troubleshooting
