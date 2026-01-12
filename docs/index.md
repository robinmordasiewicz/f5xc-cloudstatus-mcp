# F5 Cloud Status MCP Server

MCP server for monitoring F5 Distributed Cloud service status, components, incidents, and maintenance.

## Installation

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

### Config file locations:

- **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) | `%APPDATA%\Claude\claude_desktop_config.json` (Windows)
- **Claude Code**: `claude mcp add f5xc-cloudstatus npx @robinmordasiewicz/f5xc-cloudstatus-mcp@latest`
- **VS Code**: `code --add-mcp '{"name":"f5xc-cloudstatus","command":"npx","args":["@robinmordasiewicz/f5xc-cloudstatus-mcp@latest"]}'`
- **Cursor**: `.cursor/mcp.json`
- **Windsurf**: Plugins → Search "F5 Cloud Status" → Install

## Tools

| Tool | Description |
|------|-------------|
| `f5-status-get-overall` | Current overall status |
| `f5-status-get-components` | All service components with status |
| `f5-status-get-component` | Specific component details |
| `f5-status-get-incidents` | Current and recent incidents |
| `f5-status-get-maintenance` | Scheduled maintenance windows |
| `f5-status-search` | Search components, incidents, maintenance |

## Example Queries

```
What is the current status of F5 Cloud services?
Are there any active incidents?
Show me components that are degraded
What maintenance is scheduled?
Search for API Gateway
```

## Links

- [npm](https://www.npmjs.com/package/@robinmordasiewicz/f5xc-cloudstatus-mcp)
- [GitHub](https://github.com/robinmordasiewicz/f5xc-cloudstatus-mcp)
- [Issues](https://github.com/robinmordasiewicz/f5xc-cloudstatus-mcp/issues)

## License

MIT
