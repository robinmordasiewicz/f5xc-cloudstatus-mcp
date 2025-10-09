# F5 Cloud Status MCP Server - Installation Guide

Complete installation instructions for using this MCP server with various AI tools and IDEs.

## Base Configuration

The standard configuration for all MCP clients:

```json
{
  "mcpServers": {
    "f5-cloud-status": {
      "command": "npx",
      "args": ["-y", "f5cloudstatus-mcp-server@latest"]
    }
  }
}
```

This uses `npx` to automatically download and run the latest version. No manual installation required.

## Table of Contents

- [Claude Desktop](#claude-desktop)
- [Claude Code](#claude-code)
- [VS Code (with GitHub Copilot)](#vs-code-with-github-copilot)
- [Cursor IDE](#cursor-ide)
- [Windsurf](#windsurf)
- [Cline (VS Code Extension)](#cline-vs-code-extension)
- [Alternative Installation Methods](#alternative-installation-methods)
- [Troubleshooting](#troubleshooting)

## Claude Desktop

1. **Locate your configuration file:**
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. **Add the base configuration** (see above)

3. **Restart Claude Desktop**

4. **Verify**: Look for the 🔌 MCP icon showing "f5-cloud-status" connected

## Claude Code

**CLI installation:**
```bash
claude mcp add f5-cloud-status npx f5cloudstatus-mcp-server@latest
```

**Or** use auto-discovery from Claude Desktop config (if `chat.mcp.discovery.enabled` is `true`).

## VS Code (with GitHub Copilot)

**Requirements**: VS Code 1.102 or later

**CLI installation:**
```bash
code --add-mcp '{"name":"f5-cloud-status","command":"npx","args":["f5cloudstatus-mcp-server@latest"]}'
```

**Or enable auto-discovery:**
```json
{
  "chat.mcp.discovery.enabled": true
}
```

**Or manual configuration** in `settings.json`:
```json
{
  "chat.mcp.servers": {
    "f5-cloud-status": {
      "command": "npx",
      "args": ["-y", "f5cloudstatus-mcp-server@latest"]
    }
  }
}
```

## Cursor IDE

**One-click install:**
1. Open **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type **"Cursor Settings"** → **MCP**
3. Browse and click **Install** for F5 Cloud Status

**Or manual configuration:**
- **Project**: Create `.cursor/mcp.json` with base configuration
- **Global**: Create `~/.cursor/mcp.json` with base configuration

## Windsurf

**Plugin Store:**
1. Click **Plugins** in Cascade panel → Search **"F5 Cloud Status"** → **Install**

**Or manual:**
1. **Windsurf Settings** → **Cascade** → **MCP Servers** → **Add Custom Server**
2. Add base configuration

## Cline (VS Code Extension)

1. Install **Cline** extension in VS Code
2. Add base configuration to Cline's MCP settings or VS Code `settings.json`:
   ```json
   {
     "cline.mcpServers": {
       "f5-cloud-status": {
         "command": "npx",
         "args": ["-y", "f5cloudstatus-mcp-server@latest"]
       }
     }
   }
   ```
3. Restart VS Code

See [Cline MCP docs](https://docs.cline.bot/mcp/configuring-mcp-servers) for more details.

## Alternative Installation Methods

### Global NPM Installation

```bash
npm install -g f5cloudstatus-mcp-server
```

Configuration:
```json
{
  "mcpServers": {
    "f5-cloud-status": {
      "command": "f5cloudstatus-mcp"
    }
  }
}
```

### Local Development Build

For contributors and developers modifying the source:

```bash
git clone https://github.com/robinmordasiewicz/f5cloudstatus-mcp-server.git
cd f5cloudstatus-mcp-server
npm install
npm run build
```

Configuration with absolute path:
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

### Environment Configuration

Optional `.env` file for custom settings:

```bash
# API Configuration
API_BASE_URL=https://www.f5cloudstatus.com/api/v2
API_TIMEOUT=10000

# Cache TTL (milliseconds)
CACHE_TTL_STATUS=30000
CACHE_TTL_COMPONENTS=60000

# Logging
LOG_LEVEL=info
```

## Troubleshooting

### Server Not Connecting

**Check Node.js Installation:**
```bash
node --version
npm --version
```

Required: Node.js 18.0.0 or later

**Verify Package Installation:**
```bash
npm list -g f5cloudstatus-mcp-server
```

**Test Server Standalone:**
```bash
npx f5cloudstatus-mcp-server
# Should output: "MCP Server started and listening on stdio"
```

### Tools Not Appearing

1. **Restart the application** completely
2. **Check configuration syntax** - JSON must be valid
3. **Verify paths** are correct (especially on Windows)
4. **Check logs** for error messages:
   - Set `LOG_LEVEL=debug` in `.env`
   - Look for server startup messages

### Permission Errors

**Never use sudo with npm** - it creates permission issues.

**Fix npm permissions:**
```bash
# Option 1: Use a version manager (recommended)
# Install nvm (Node Version Manager) and reinstall Node.js

# Option 2: Configure npm to use user directory
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Windows-Specific Issues

**Playwright Browser Installation:**
```bash
npx playwright install chromium
```

**Path Issues:**
- Always use **absolute paths** in Windows configurations
- Use double backslashes (`\\`) in JSON
- Reference `node.exe` explicitly instead of `npx`

### Network Issues

**Test connectivity:**
```bash
curl https://www.f5cloudstatus.com/api/v2/summary.json
```

**Check firewall** if behind corporate proxy

### Slow Performance

- First request may be slow (data fetching)
- Subsequent requests use cache (30s-5min TTL)
- Increase cache TTL values in `.env` if needed
- The web scraper (Playwright) only runs as fallback when API fails

## Getting Help

- **GitHub Issues**: https://github.com/robinmordasiewicz/f5cloudstatus-mcp-server/issues
- **NPM Package**: https://www.npmjs.com/package/f5cloudstatus-mcp-server
- **Documentation**: See [README.md](README.md) for usage examples

## Verifying Installation

Once installed, test the server by asking your AI assistant:

```
What is the current status of F5 Cloud services?
```

Or:

```
Show me all F5 Distributed Cloud components
```

The AI should respond with live status information from F5's status page.

## Next Steps

- See [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) for 14 real-world usage examples
- Check [DOCUMENTATION.md](DOCUMENTATION.md) for complete API reference
- Review [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
