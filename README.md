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

**Config file locations:**
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

## Performance

### Browser Pooling

The MCP server uses browser instance pooling for 40-60% faster scraping performance. Browser instances are reused across operations instead of creating new ones each time.

**Configuration:**
- `SCRAPER_POOLING_ENABLED=true` - Enable/disable pooling (default: true)
- `SCRAPER_POOLING_MIN_SIZE=1` - Minimum browsers in pool (default: 1)
- `SCRAPER_POOLING_MAX_SIZE=3` - Maximum browsers in pool (default: 3)
- `SCRAPER_POOLING_IDLE_TIMEOUT=60000` - Close idle browsers after ms (default: 60s)
- `SCRAPER_POOLING_ACQUIRE_TIMEOUT=10000` - Browser acquisition timeout (default: 10s)
- `SCRAPER_POOLING_HEALTH_CHECK_INTERVAL=30000` - Health check frequency (default: 30s)
- `SCRAPER_POOLING_ENABLE_METRICS=true` - Track performance metrics (default: true)

**Performance Gains:**
- Single scrape: ~50% faster (2500ms → 1200ms)
- Parallel scrapes: ~51% faster (8300ms → 4100ms)
- Cache hit rate: >80% after warmup

**Resource Usage:**
- Each browser: ~150MB memory
- Max pool (3 browsers): ~450MB memory
- Idle cleanup: Automatic after 60s

**Disable if needed:**
```bash
SCRAPER_POOLING_ENABLED=false
```

## Links

- [npm](https://www.npmjs.com/package/@robinmordasiewicz/f5xc-cloudstatus-mcp)
- [GitHub](https://github.com/robinmordasiewicz/f5xc-cloudstatus-mcp)
- [Issues](https://github.com/robinmordasiewicz/f5xc-cloudstatus-mcp/issues)

## License

MIT
