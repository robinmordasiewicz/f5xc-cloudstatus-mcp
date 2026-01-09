# F5 Cloud Status MCP Server

A Model Context Protocol (MCP) server for monitoring F5 Cloud service status, providing real-time status information, component health, incidents, and scheduled maintenance.

## Features

- **Real-time Status Monitoring**: Get current operational status of F5 Cloud services
- **Component Tracking**: Monitor 148+ individual service components across multiple categories
- **Incident Management**: Track active and historical incidents with detailed updates
- **Maintenance Windows**: Access scheduled, active, and upcoming maintenance information
- **Dual Data Sources**: API-first with automatic web scraper fallback for reliability
- **Intelligent Caching**: TTL-based caching with configurable durations per data type
- **Comprehensive Search**: Search across components, incidents, and maintenance by keyword

## Installation

### Base Configuration

The standard configuration for all MCP clients:

```json
{
  "mcpServers": {
    "f5-cloud-status": {
      "command": "npx",
      "args": ["-y", "f5xc-cloudstatus-mcp@latest"]
    }
  }
}
```

This uses `npx` to automatically download and run the latest version. No manual installation required.

### Claude Desktop

1. **Locate your configuration file:**
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. **Add the base configuration** (see above)

3. **Restart Claude Desktop**

4. **Verify**: Look for the 🔌 MCP icon showing "f5-cloud-status" connected

### Claude Code

**CLI installation:**
```bash
claude mcp add f5-cloud-status npx f5xc-cloudstatus-mcp@latest
```

### VS Code (with GitHub Copilot)

**Requirements**: VS Code 1.102 or later

**CLI installation:**
```bash
code --add-mcp '{"name":"f5-cloud-status","command":"npx","args":["f5xc-cloudstatus-mcp@latest"]}'
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
      "args": ["-y", "f5xc-cloudstatus-mcp@latest"]
    }
  }
}
```

### Cursor IDE

**One-click install:**
1. Open **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type **"Cursor Settings"** → **MCP**
3. Browse and click **Install** for F5 Cloud Status

**Or manual configuration:**
- **Project**: Create `.cursor/mcp.json` with base configuration
- **Global**: Create `~/.cursor/mcp.json` with base configuration

### Windsurf

**Plugin Store:**
1. Click **Plugins** in Cascade panel → Search **"F5 Cloud Status"** → **Install**

**Or manual:**
1. **Windsurf Settings** → **Cascade** → **MCP Servers** → **Add Custom Server**
2. Add base configuration

### Cline (VS Code Extension)

1. Install **Cline** extension in VS Code
2. Add base configuration to Cline's MCP settings or VS Code `settings.json`:
   ```json
   {
     "cline.mcpServers": {
       "f5-cloud-status": {
         "command": "npx",
         "args": ["-y", "f5xc-cloudstatus-mcp@latest"]
       }
     }
   }
   ```
3. Restart VS Code

See [Cline MCP docs](https://docs.cline.bot/mcp/configuring-mcp-servers) for more details.

### Alternative Installation: Global NPM

```bash
npm install -g f5xc-cloudstatus-mcp
```

Configuration:
```json
{
  "mcpServers": {
    "f5-cloud-status": {
      "command": "f5xc-cloudstatus-mcp"
    }
  }
}
```

## Example Queries

Once configured, ask your AI assistant:

> **📖 See [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) for 14 detailed real-world examples with expected responses.**

### Quick Examples

**Check overall status:**
```
What is the current status of F5 Cloud services?
```

**List all components:**
```
Show me all F5 Cloud components and their current operational status
```

**Check for issues:**
```
Are there any F5 Cloud components that are degraded or having issues?
```

**Find specific component:**
```
What is the status of the F5 Distributed Cloud Services API Gateway?
```

**Check for incidents:**
```
Are there any active incidents affecting F5 Cloud services?
```

**Search for maintenance:**
```
Are there any upcoming maintenance windows for F5 Cloud services?
```
## Available Tools

The server provides six MCP tools for interacting with F5 Cloud status:

1. **`f5-status-get-overall`** - Get the current overall status of F5 Cloud services
2. **`f5-status-get-components`** - Get all service components with current status
3. **`f5-status-get-component`** - Get detailed information about a specific component
4. **`f5-status-get-incidents`** - Get current and recent incidents
5. **`f5-status-get-maintenance`** - Get scheduled maintenance windows
6. **`f5-status-search`** - Search for components, incidents, or maintenance by keyword

## Development

This project uses **fully automated CI/CD** with version bumping. See [docs/CICD.md](docs/CICD.md) for details.

## License

MIT - See [LICENSE](LICENSE) file for details

## Support

- **GitHub Issues**: [GitHub Issues](https://github.com/robinmordasiewicz/f5xc-cloudstatus-mcp/issues)
- **NPM Package**: https://www.npmjs.com/package/f5xc-cloudstatus-mcp
