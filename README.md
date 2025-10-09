# F5 Cloud Status MCP Server

A Model Context Protocol (MCP) server for monitoring F5 Cloud service status, providing real-time status information, component health, incidents, and scheduled maintenance.

> **🚀 Quick Start:** New to MCP servers? See [QUICKSTART.md](QUICKSTART.md) for a 5-minute setup guide.
>
> **📦 Installation:** See [INSTALLATION.md](INSTALLATION.md) for setup in Claude Desktop, VS Code, Cursor, Windsurf, and more.
>
> **👨‍💻 Developers:** See [DEVELOPERS.md](DEVELOPERS.md) for development setup and contribution guidelines.

## Features

- **Real-time Status Monitoring**: Get current operational status of F5 Cloud services
- **Component Tracking**: Monitor 148+ individual service components across multiple categories
- **Incident Management**: Track active and historical incidents with detailed updates
- **Maintenance Windows**: Access scheduled, active, and upcoming maintenance information
- **Dual Data Sources**: API-first with automatic web scraper fallback for reliability
- **Intelligent Caching**: TTL-based caching with configurable durations per data type
- **Comprehensive Search**: Search across components, incidents, and maintenance by keyword

## Quick Installation

**For most MCP clients**, add this to your configuration:

```json
{
  "mcpServers": {
    "f5-cloud-status": {
      "command": "npx",
      "args": ["-y", "f5cloudstatus-mcp@latest"]
    }
  }
}
```

**For Claude Code**, use the command line:

```bash
claude mcp add f5-cloud-status npx f5cloudstatus-mcp@latest
```

📦 **See [INSTALLATION.md](INSTALLATION.md)** for detailed setup instructions for all MCP clients.

## Client-Specific Setup

### Claude Desktop

Add the configuration above to your `claude_desktop_config.json`:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### VS Code / GitHub Copilot

```bash
code --add-mcp '{"name":"f5-cloud-status","command":"npx","args":["f5cloudstatus-mcp@latest"]}'
```

### Cursor

- **One-click**: Install from Cursor Settings → MCP
- **Manual**: Add configuration to `.cursor/mcp.json`

### Other Clients

See [INSTALLATION.md](INSTALLATION.md) for:
- Cline
- Windsurf
- Custom configurations
- Global npm installation
- Local development setup

## Example Queries

Once configured, ask Claude to use the F5 status tools:

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

**Search across all data:**
```
Search F5 status for anything related to "API Gateway"
```

## Available Tools

The server provides six MCP tools for interacting with F5 Cloud status:

1. **`f5-status-get-overall`** - Get the current overall status of F5 Cloud services
2. **`f5-status-get-components`** - Get all service components with current status
3. **`f5-status-get-component`** - Get detailed information about a specific component
4. **`f5-status-get-incidents`** - Get current and recent incidents
5. **`f5-status-get-maintenance`** - Get scheduled maintenance windows
6. **`f5-status-search`** - Search for components, incidents, or maintenance by keyword

For detailed API documentation and examples, see [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md).

## Troubleshooting

### Server not connecting

- Ensure your MCP client configuration is correct
- Check your MCP client logs for error messages
- Verify network connectivity to https://www.f5cloudstatus.com

### No data returned

- Verify network connectivity to https://www.f5cloudstatus.com
- The server may be starting up (first request can be slow)
- Check your MCP client logs for detailed error messages

### Slow responses

- First request may be slow due to data fetching
- Subsequent requests use cache (30s-5min TTL)
- This is normal behavior for the first query

For more troubleshooting help, see [INSTALLATION.md](INSTALLATION.md#troubleshooting).

## Advanced Configuration

The server supports optional environment variable configuration. See [INSTALLATION.md](INSTALLATION.md#advanced-configuration) for details on:

- Custom API timeouts
- Cache TTL adjustments
- Debug logging
- Scraper configuration

## Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide for new users
- **[INSTALLATION.md](INSTALLATION.md)** - Comprehensive installation guide for all MCP clients
- **[USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)** - 14 detailed real-world usage examples
- **[DEVELOPERS.md](DEVELOPERS.md)** - Development setup and contribution guide

## Contributing

Contributions are welcome! See [DEVELOPERS.md](DEVELOPERS.md) for:

- Development setup
- Project structure
- Testing guidelines
- Code quality standards
- Pull request process

## License

MIT - See [LICENSE](LICENSE) file for details

## Support

- **Issues**: [GitHub Issues](https://github.com/robinmordasiewicz/f5cloudstatus-mcp/issues)
- **Documentation**: See the [docs](.) directory
