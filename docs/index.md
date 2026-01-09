# F5 Distributed Cloud Status MCP Server

A Model Context Protocol (MCP) server for monitoring F5 Cloud service status, providing real-time status information, component health, incidents, and scheduled maintenance.

## Features

- **Real-time Status Monitoring**: Get current operational status of F5 Cloud services
- **Component Tracking**: Monitor 148+ individual service components across multiple categories
- **Incident Management**: Track active and historical incidents with detailed updates
- **Maintenance Windows**: Access scheduled, active, and upcoming maintenance information
- **Dual Data Sources**: API-first with automatic web scraper fallback for reliability
- **Intelligent Caching**: TTL-based caching with configurable durations per data type
- **Comprehensive Search**: Search across components, incidents, and maintenance by keyword

## Quick Start

Install via npx:

```bash
npx @robinmordasiewicz/f5xc-cloudstatus-mcp@latest
```

Or add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "f5xc-cloudstatus": {
      "command": "npx",
      "args": ["-y", "@robinmordasiewicz/f5xc-cloudstatus-mcp@latest"]
    }
  }
}
```

## Documentation

- [Quick Start Guide](QUICKSTART.md) - Get started in 5 minutes
- [User Guide](USER_GUIDE.md) - Comprehensive usage documentation
- [Usage Examples](USAGE_EXAMPLES.md) - Real-world usage scenarios
- [Developer Guide](DEVELOPERS.md) - Development setup and workflows
- [Architecture](ARCHITECTURE.md) - System design and architecture

## Available Tools

The server provides six MCP tools for interacting with F5 Cloud status:

1. **`f5-status-get-overall`** - Get the current overall status of F5 Cloud services
2. **`f5-status-get-components`** - Get all service components with current status
3. **`f5-status-get-component`** - Get detailed information about a specific component
4. **`f5-status-get-incidents`** - Get current and recent incidents
5. **`f5-status-get-maintenance`** - Get scheduled maintenance windows
6. **`f5-status-search`** - Search for components, incidents, or maintenance by keyword

## Installation Options

### Claude Desktop

1. **Locate your configuration file:**
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. **Add the configuration** (see above)

3. **Restart Claude Desktop**

4. **Verify**: Look for the 🔌 MCP icon showing "f5xc-cloudstatus" connected

### Claude Code

```bash
claude mcp add f5xc-cloudstatus npx @robinmordasiewicz/f5xc-cloudstatus-mcp@latest
```

### Other Clients

See the [Quick Start Guide](QUICKSTART.md) for VS Code, Cursor, Windsurf, and Cline installation instructions.

## Development

This project uses **fully automated CI/CD** with version bumping. See [CI/CD documentation](CICD.md) for details.

## Links

- [GitHub Repository](https://github.com/robinmordasiewicz/f5xc-cloudstatus-mcp)
- [NPM Package](https://www.npmjs.com/package/@robinmordasiewicz/f5xc-cloudstatus-mcp)
- [GitHub Package](https://github.com/robinmordasiewicz/f5xc-cloudstatus-mcp/pkgs/npm/f5xc-cloudstatus-mcp)
- [Issues](https://github.com/robinmordasiewicz/f5xc-cloudstatus-mcp/issues)

## License

MIT - See [LICENSE](https://github.com/robinmordasiewicz/f5xc-cloudstatus-mcp/blob/main/LICENSE) file for details
