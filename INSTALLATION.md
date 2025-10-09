# F5 Cloud Status MCP Server - Installation Guide

Complete installation instructions for using this MCP server with various AI tools and IDEs.

## Table of Contents

- [Quick Install](#quick-install)
- [Claude Desktop](#claude-desktop)
- [Claude Code](#claude-code)
- [VS Code (with GitHub Copilot)](#vs-code-with-github-copilot)
- [Cursor IDE](#cursor-ide)
- [Windsurf](#windsurf)
- [Cline (VS Code Extension)](#cline-vs-code-extension)
- [Troubleshooting](#troubleshooting)

## Quick Install

### NPM Package

```bash
# Global installation (recommended)
npm install -g f5cloudstatus-mcp-server

# Local installation for a specific project
npm install f5cloudstatus-mcp-server
```

### Using npx (No Installation Required)

```bash
npx f5cloudstatus-mcp-server
```

## Claude Desktop

### Method 1: Desktop Extensions (Recommended - 2025)

1. **Open Claude Desktop** and navigate to **Settings > Extensions**
2. Click **"Browse extensions"**
3. Search for **"F5 Cloud Status"** (if available in the directory)
4. Click **"Install"**

### Method 2: Manual Configuration

1. **Locate Configuration File:**
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. **Edit Configuration:**

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

   **Or with global installation:**

   ```json
   {
     "mcpServers": {
       "f5-cloud-status": {
         "command": "f5cloudstatus-mcp"
       }
     }
   }
   ```

3. **Restart Claude Desktop**

4. **Verify**: Look for the 🔌 MCP icon showing "f5-cloud-status" as connected

## Claude Code

Claude Code automatically detects and integrates MCP servers configured in Claude Desktop.

### Option 1: Use Claude Desktop Configuration

Claude Code will auto-discover MCP servers from your Claude Desktop config if `chat.mcp.discovery.enabled` is set to `true`.

### Option 2: Add Directly via Command Line

```bash
claude code mcp add f5cloudstatus-mcp-server
```

### Option 3: Manual Configuration

Add to your Claude Code settings:

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

## VS Code (with GitHub Copilot)

**Requirements**: VS Code 1.102 or later

### Method 1: Extensions Marketplace

1. Open **Extensions view** (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Search for **`@mcp`**
3. Find and install **F5 Cloud Status MCP** (if available)

### Method 2: Command Line

```bash
code --add-mcp '{"name":"f5-cloud-status","command":"npx","args":["-y","f5cloudstatus-mcp-server"]}'
```

### Method 3: Auto-discovery from Claude Desktop

Enable in VS Code settings:

```json
{
  "chat.mcp.discovery.enabled": true
}
```

VS Code will automatically detect MCP servers configured in Claude Desktop.

### Method 4: Manual Configuration

Add to VS Code `settings.json`:

```json
{
  "chat.mcp.servers": {
    "f5-cloud-status": {
      "command": "npx",
      "args": ["-y", "f5cloudstatus-mcp-server"]
    }
  }
}
```

## Cursor IDE

### Method 1: One-Click Install (Recommended)

1. Open **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type **"Cursor Settings"**
3. Click **MCP** in sidebar
4. Browse available servers and click **Install** for F5 Cloud Status

### Method 2: Manual Configuration

**Choose configuration location:**

#### Project-Specific (Recommended for team projects):

Create `.cursor/mcp.json` in your project root:

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

#### Global (For all projects):

Create `~/.cursor/mcp.json`:

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

### Verify Installation

Tools will appear under **"Available Tools"** in the MCP settings page.

## Windsurf

### Method 1: Plugin Store (Recommended)

1. Click **Plugins** icon in Cascade panel (top right)
2. Or go to **Windsurf Settings > Cascade > Plugins**
3. Search for **"F5 Cloud Status"**
4. Click **Install**
5. Leave **Server Config (JSON)** empty for default configuration

### Method 2: Manual Configuration

1. Open **Windsurf Settings**
   - Click "Windsurf - Settings" (bottom right)
   - Or `Cmd+Shift+P` / `Ctrl+Shift+P` → "Open Windsurf Settings"

2. Navigate to **Cascade > MCP Servers**

3. Click **"Add Custom Server +"**

4. Add configuration:

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

5. Alternatively, edit `mcp_config.json` directly for advanced setups

### Communication Methods

Windsurf supports both `stdio` and `SSE` (Server-Sent Events) communication methods.

## Cline (VS Code Extension)

Cline (formerly Claude Dev) is a VS Code extension that supports MCP servers.

### Installation Steps

1. **Install Cline Extension:**
   - Open VS Code Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
   - Search for **"Cline"**
   - Click **Install**

2. **Configure MCP Server:**

   Add to VS Code `settings.json` or Cline's configuration:

   ```json
   {
     "cline.mcpServers": {
       "f5-cloud-status": {
         "command": "npx",
         "args": ["-y", "f5cloudstatus-mcp-server"]
       }
     }
   }
   ```

3. **Restart VS Code** or reload Cline

## Configuration Options

### Environment Variables

Create a `.env` file in your project root (optional):

```bash
# API Configuration
API_BASE_URL=https://www.f5cloudstatus.com/api/v2
API_TIMEOUT=10000

# Cache TTL (milliseconds)
CACHE_TTL_STATUS=30000
CACHE_TTL_COMPONENTS=60000
CACHE_TTL_INCIDENTS=120000
CACHE_TTL_MAINTENANCE=300000

# Logging
LOG_LEVEL=info
```

### Platform-Specific Configurations

#### Windows

**Recommended:** Use npx (works on Windows too):

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

**Alternative:** If npx doesn't work, use absolute paths:

```json
{
  "mcpServers": {
    "f5-cloud-status": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": [
        "C:\\Users\\YourName\\AppData\\Roaming\\npm\\node_modules\\f5cloudstatus-mcp-server\\dist\\index.js"
      ]
    }
  }
}
```

#### macOS/Linux

Standard npx configuration works:

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

### For Developers: Local Build Configuration

**If you've cloned the repository and want to use a local build:**

1. **Clone and build:**
   ```bash
   git clone https://github.com/robinmordasiewicz/f5cloudstatus-mcp-server.git
   cd f5cloudstatus-mcp-server
   npm install
   npm run build
   ```

2. **Configure with absolute path:**

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

**Note:** Using the npm package (npx or global install) is recommended for most users as it provides automatic updates and simpler configuration.

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
