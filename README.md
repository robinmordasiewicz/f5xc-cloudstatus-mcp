# F5 Cloud Status MCP Server

A Model Context Protocol (MCP) server for monitoring F5 Cloud service status, providing real-time status information, component health, incidents, and scheduled maintenance.

> **🚀 Quick Start:** New to MCP servers? See [QUICKSTART.md](QUICKSTART.md) for a 5-minute setup guide.
>
> **📦 Installation:** See [INSTALLATION.md](INSTALLATION.md) for setup in Claude Desktop, VS Code, Cursor, Windsurf, and more.
>
> **📚 Full Documentation:** See [DOCUMENTATION.md](DOCUMENTATION.md) for complete documentation index.

## Features

- **Real-time Status Monitoring**: Get current operational status of F5 Cloud services
- **Component Tracking**: Monitor 148+ individual service components across multiple categories
- **Incident Management**: Track active and historical incidents with detailed updates
- **Maintenance Windows**: Access scheduled, active, and upcoming maintenance information
- **Dual Data Sources**: API-first with automatic web scraper fallback for reliability
- **Intelligent Caching**: TTL-based caching with configurable durations per data type
- **Comprehensive Search**: Search across components, incidents, and maintenance by keyword

## Installation

### Quick Start

**Base configuration** for most MCP clients:

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

**Command-line install** for Claude Code:
```bash
claude mcp add f5-cloud-status npx f5cloudstatus-mcp@latest
```

📦 **See [MCP Client Configuration](#mcp-client-configuration)** below for client-specific setup instructions.

### Developer Setup

```bash
git clone https://github.com/robinmordasiewicz/f5cloudstatus-mcp.git
cd f5cloudstatus-mcp
npm install
npm run build
```

## Configuration

Create a `.env` file in the project root based on `.env.example`:

```bash
# API Configuration
API_BASE_URL=https://www.f5cloudstatus.com/api/v2
API_TIMEOUT=10000
API_RETRY_ATTEMPTS=3
API_RETRY_DELAY=1000

# Scraper Configuration (fallback)
SCRAPER_BASE_URL=https://www.f5cloudstatus.com
SCRAPER_TIMEOUT=30000
SCRAPER_HEADLESS=true

# Cache TTL (milliseconds)
CACHE_TTL_STATUS=30000
CACHE_TTL_COMPONENTS=60000
CACHE_TTL_INCIDENTS=120000
CACHE_TTL_MAINTENANCE=300000

# Logging
LOG_LEVEL=info
```

## Building

```bash
npm run build
```

## Running

```bash
npm start
```

## MCP Client Configuration

### Base Configuration

The standard configuration for adding the F5 Cloud Status MCP server:

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

### Client-Specific Setup

#### Claude Code
```bash
claude mcp add f5-cloud-status npx f5cloudstatus-mcp@latest
```

#### Claude Desktop
Add the base configuration to your `claude_desktop_config.json`:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

#### Cline
Use the base configuration in Cline's MCP settings. See [Cline MCP docs](https://docs.cline.bot/mcp/configuring-mcp-servers).

#### Cursor
- **One-click**: Install from Cursor Settings → MCP
- **Manual**: Add base configuration to `.cursor/mcp.json`

#### VS Code / GitHub Copilot
```bash
code --add-mcp '{"name":"f5-cloud-status","command":"npx","args":["f5cloudstatus-mcp@latest"]}'
```

Or enable auto-discovery in VS Code settings:
```json
{
  "chat.mcp.discovery.enabled": true
}
```

#### Windsurf
- **Plugin Store**: Search for "F5 Cloud Status" and click Install
- **Manual**: Add base configuration to Windsurf MCP settings

### Alternative Installation Methods

#### Global NPM Installation
```bash
npm install -g f5cloudstatus-mcp
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

#### Local Development Build
For contributors and developers modifying the source:

```bash
git clone https://github.com/robinmordasiewicz/f5cloudstatus-mcp.git
cd f5cloudstatus-mcp
npm install && npm run build
```

Configuration:
```json
{
  "mcpServers": {
    "f5-cloud-status": {
      "command": "node",
      "args": ["/absolute/path/to/f5cloudstatus-mcp/dist/index.js"]
    }
  }
}
```

📦 **Detailed guides**: See [INSTALLATION.md](INSTALLATION.md) for comprehensive setup instructions.

### Example Queries

Once configured, you can ask Claude to use the F5 status tools.

> **📖 See [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) for 14 detailed real-world examples with expected responses.**

**Quick examples:**

**Check overall status:**
```
What is the current status of F5 Cloud services?
```

**List all components:**
```
Show me all F5 Cloud components and their current operational status
```

**Check for degraded services:**
```
Are there any F5 Cloud components that are degraded or having issues?
```

**Find specific component:**
```
What is the status of the F5 Distributed Cloud Services API Gateway?
```

**Check for active incidents:**
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

### Configuration Files

#### Using .env file (Optional)

The server supports configuration via environment variables. Create a `.env` file for custom settings:

```bash
# API Configuration (optional - has sensible defaults)
API_BASE_URL=https://www.f5cloudstatus.com/api/v2
API_TIMEOUT=10000

# Cache TTL in milliseconds (optional)
CACHE_TTL_STATUS=30000
CACHE_TTL_COMPONENTS=60000

# Logging (optional)
LOG_LEVEL=info  # debug, info, warn, error
```

The `.env` file is automatically loaded by the server when using any installation method (npx, global, or local).

### Troubleshooting

**Server not connecting:**
- Ensure you ran `npm run build` after any code changes
- Check the absolute path in your MCP configuration is correct
- Look at Claude Desktop logs for error messages

**No data returned:**
- Verify network connectivity to https://www.f5cloudstatus.com
- Check LOG_LEVEL=debug in .env for detailed logs
- Test the server standalone: `npm start` (it should show "MCP Server started")

**Slow responses:**
- First request may be slow due to data fetching
- Subsequent requests use cache (30s-5min TTL)
- Increase cache TTL values in .env if needed

**Playwright browser issues:**
- Install Playwright browsers: `npx playwright install chromium`
- Set SCRAPER_HEADLESS=true in production
- The scraper is only used as fallback when API fails

## MCP Tools

The server provides six MCP tools for interacting with F5 Cloud status:

### 1. `f5-status-get-overall`

Get the current overall status of F5 Cloud services.

**Input**: None

**Output**:
```json
{
  "status": "operational",
  "indicator": "none",
  "description": "All Systems Operational",
  "lastUpdated": "2025-01-15T10:30:00.000Z",
  "isOperational": true
}
```

### 2. `f5-status-get-components`

Get all F5 Cloud service components with current status.

**Input**:
- `status` (optional): Filter by status (`none`, `minor`, `major`, `critical`)
- `group` (optional): Filter by group name

**Output**:
```json
{
  "components": [
    {
      "id": "component-123",
      "name": "Distributed Cloud Services - API Gateway",
      "status": "none",
      "group": "Distributed Cloud Services",
      "description": "API Gateway service"
    }
  ],
  "groups": [
    {
      "name": "Distributed Cloud Services",
      "componentCount": 15
    }
  ],
  "summary": {
    "total": 148,
    "operational": 147,
    "degraded": 1
  }
}
```

### 3. `f5-status-get-component`

Get detailed information about a specific component.

**Input** (one required):
- `id`: Component ID
- `name`: Component name

**Output**:
```json
{
  "id": "component-123",
  "name": "Distributed Cloud Services - API Gateway",
  "status": "none",
  "group": "Distributed Cloud Services",
  "description": "API Gateway service",
  "position": 5,
  "isOperational": true
}
```

### 4. `f5-status-get-incidents`

Get current and recent incidents.

**Input** (all optional):
- `status`: Filter by status (`investigating`, `identified`, `monitoring`, `resolved`, `postmortem`)
- `impact`: Filter by impact (`none`, `minor`, `major`, `critical`)
- `days`: Get incidents from last N days (default: 7, max: 90)
- `unresolved_only`: Only return unresolved incidents

**Output**:
```json
{
  "incidents": [
    {
      "id": "incident-456",
      "name": "API Gateway Intermittent Errors",
      "status": "monitoring",
      "impact": "minor",
      "createdAt": "2025-01-15T08:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z",
      "shortlink": "https://status.f5.com/incidents/456",
      "affectedComponents": ["component-123"],
      "latestUpdate": {
        "status": "monitoring",
        "body": "Issue has been resolved and we are monitoring",
        "timestamp": "2025-01-15T10:00:00.000Z"
      }
    }
  ],
  "summary": {
    "total": 5,
    "unresolved": 1,
    "critical": 0,
    "major": 0
  }
}
```

### 5. `f5-status-get-maintenance`

Get scheduled maintenance windows.

**Input** (all optional):
- `status`: Filter by status (`scheduled`, `in_progress`, `verifying`, `completed`)
- `active_only`: Only return active maintenance
- `upcoming_only`: Only return upcoming maintenance

**Output**:
```json
{
  "maintenances": [
    {
      "id": "maintenance-789",
      "name": "Database Maintenance",
      "status": "scheduled",
      "impact": "minor",
      "scheduledFor": "2025-01-20T02:00:00.000Z",
      "scheduledUntil": "2025-01-20T04:00:00.000Z",
      "shortlink": "https://status.f5.com/maintenance/789",
      "affectedComponents": ["component-456"],
      "latestUpdate": {
        "status": "scheduled",
        "body": "Scheduled database maintenance",
        "timestamp": "2025-01-15T10:00:00.000Z"
      }
    }
  ],
  "summary": {
    "total": 3,
    "active": 0,
    "upcoming": 3
  }
}
```

### 6. `f5-status-search`

Search for components, incidents, or maintenance by keyword.

**Input**:
- `query` (required): Search query or pattern
- `type` (optional): Type to search (`components`, `incidents`, `maintenance`, `all`)

**Output**:
```json
{
  "query": "api gateway",
  "type": "all",
  "results": {
    "components": [
      {
        "id": "component-123",
        "name": "Distributed Cloud Services - API Gateway",
        "status": "none",
        "group": "Distributed Cloud Services"
      }
    ],
    "incidents": [],
    "maintenances": []
  },
  "summary": {
    "components": 1,
    "incidents": 0,
    "maintenances": 0,
    "total": 1
  }
}
```

## Architecture

The server follows a layered architecture:

```
┌─────────────────────────────────────────┐
│          MCP Server Layer               │
│  (Tool Definitions & Handler)           │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│        Business Logic Layer             │
│  (Status, Component, Incident Services) │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│          Cache Layer                    │
│  (TTL-based Caching Service)            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│       Data Access Layer                 │
│  (API Client ← → Web Scraper)           │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│     External Data Sources               │
│  (Statuspage API / Website Scraping)    │
└─────────────────────────────────────────┘
```

### Key Components

- **MCP Server**: Implements Model Context Protocol for tool discovery and execution
- **Services**: Business logic for status, components, and incidents
- **Cache Service**: TTL-based caching with configurable durations
- **Data Access Layer**: Coordinates between API client and web scraper
- **API Client**: HTTP client with retry logic and exponential backoff
- **Web Scraper**: Playwright-based fallback for API failures

## Development

### Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm run dev` - Watch mode for development
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Lint TypeScript files
- `npm run format` - Format code with Prettier

### Project Structure

```
src/
├── cache/           # Caching service
├── data-access/     # API client and web scraper
├── server/          # MCP server implementation
├── services/        # Business logic services
├── tools/           # MCP tool definitions and handlers
├── types/           # TypeScript type definitions
└── utils/           # Utilities (config, errors, logger)

tests/
├── unit/            # Unit tests
├── integration/     # Integration tests
├── e2e/             # End-to-end tests
└── fixtures/        # Test fixtures
```

## Error Handling

The server implements comprehensive error handling:

- **APIError**: API request failures
- **ScraperError**: Web scraping failures
- **DataUnavailableError**: Both API and scraper failed
- **ConfigurationError**: Invalid configuration
- **ValidationError**: Invalid tool input
- **CacheError**: Cache operation failures
- **TimeoutError**: Request timeouts
- **NotFoundError**: Resource not found

All errors include detailed context and are properly logged.

## Logging

Logging is configured via the `LOG_LEVEL` environment variable:

- `debug`: Detailed debugging information
- `info`: General informational messages
- `warn`: Warning messages
- `error`: Error messages only

Logs are written to stderr with ISO 8601 timestamps.

## License

MIT

## Contributing

Contributions are welcome! Please ensure:

1. All tests pass (`npm test`)
2. Code is properly formatted (`npm run format`)
3. No linting errors (`npm run lint`)
4. Coverage thresholds are met (70% minimum)

## Support

For issues and questions, please use the GitHub issue tracker.
