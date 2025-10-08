# F5 Cloud Status MCP Server - Documentation Index

Complete documentation for the F5 Cloud Status MCP Server.

## Getting Started

### For End Users

1. **[QUICKSTART.md](QUICKSTART.md)** ⭐ START HERE
   - 5-minute setup guide
   - Step-by-step installation
   - First-time configuration
   - Verification and testing

2. **[README.md](README.md)** - Main Documentation
   - Feature overview
   - Complete installation instructions
   - MCP client configuration (Claude Desktop)
   - All 6 MCP tools reference
   - Troubleshooting guide

3. **[USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)** - Real-World Examples
   - 14 practical examples
   - Expected responses
   - Advanced query patterns
   - Monitoring workflows
   - Tips for effective queries

## Configuration

### MCP Configuration Files

- **[.mcp.json](.mcp.json)** - MCP Server Configuration
  - Ready-to-use configuration
  - Environment variable examples
  - Alternative configurations

- **[.env.example](.env.example)** - Environment Template
  - API configuration
  - Cache TTL settings
  - Scraper options
  - Logging configuration

### Application Configuration

- **[tsconfig.json](tsconfig.json)** - TypeScript Configuration
- **[jest.config.js](jest.config.js)** - Testing Configuration
- **[package.json](package.json)** - Project Metadata & Scripts

## Architecture & Design

### For Developers

1. **[ARCHITECTURE.md](ARCHITECTURE.md)** - System Architecture
   - High-level design
   - 4-layer architecture
   - Component interactions
   - TypeScript interfaces
   - Error handling strategy
   - Testing approach
   - Migration path

2. **[ANALYSIS.md](ANALYSIS.md)** - Website Analysis
   - Original research
   - Component discovery (148 components)
   - Data extraction strategy
   - DOM structure analysis
   - API endpoint identification

3. **[IMPLEMENTATION_WORKFLOW.md](IMPLEMENTATION_WORKFLOW.md)** - Implementation Plan
   - 5-phase development plan
   - 25-day timeline
   - Detailed tasks
   - Code examples
   - Success criteria

## Source Code Documentation

### Project Structure

```
src/
├── cache/              # Caching service implementation
│   ├── cache-service.ts
│   └── index.ts
├── data-access/        # API client and web scraper
│   ├── api-client.ts
│   ├── web-scraper.ts
│   ├── data-access-layer.ts
│   └── index.ts
├── server/             # MCP server implementation
│   ├── mcp-server.ts
│   └── index.ts
├── services/           # Business logic services
│   ├── status-service.ts
│   ├── component-service.ts
│   ├── incident-service.ts
│   └── index.ts
├── tools/              # MCP tool definitions and handlers
│   ├── tool-definitions.ts
│   ├── tool-handler.ts
│   └── index.ts
├── types/              # TypeScript type definitions
│   ├── domain.ts       # Domain model types
│   ├── api.ts          # API response types
│   └── index.ts
└── utils/              # Utilities
    ├── config.ts       # Configuration management
    ├── errors.ts       # Error classes
    ├── logger.ts       # Logging utility
    └── index.ts
```

### Key Concepts

**Layered Architecture:**
1. **MCP Server Layer** - Protocol implementation, tool handling
2. **Business Logic Layer** - Services for status, components, incidents
3. **Cache Layer** - TTL-based caching with configurable durations
4. **Data Access Layer** - API client with web scraper fallback

**Design Patterns:**
- **Facade Pattern** - DataAccessLayer coordinates API and scraper
- **Service Pattern** - Business logic separated from data access
- **Factory Pattern** - createXxx() functions for dependency injection
- **Strategy Pattern** - API-first with fallback to web scraping

## API Reference

### MCP Tools

All tools are documented in [README.md](README.md#mcp-tools):

1. `f5-status-get-overall` - Overall system status
2. `f5-status-get-components` - Component listing with filters
3. `f5-status-get-component` - Single component details
4. `f5-status-get-incidents` - Incident tracking
5. `f5-status-get-maintenance` - Maintenance windows
6. `f5-status-search` - Cross-entity search

### TypeScript Types

**Domain Types** (`src/types/domain.ts`):
- `OverallStatus`, `StatusLevel`, `IndicatorLevel`
- `Component`, `ComponentGroup`
- `Incident`, `IncidentStatus`, `IncidentUpdate`
- `Maintenance`
- `UptimeData`, `DailyUptimeStat`

**API Types** (`src/types/api.ts`):
- `RawStatusResponse`, `RawSummaryResponse`
- `RawComponent`, `RawComponentGroup`
- `RawIncident`, `RawIncidentUpdate`
- `RawMaintenance`

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/           # Unit tests for individual modules
├── integration/    # Integration tests for combined modules
├── e2e/            # End-to-end tests for full workflows
└── fixtures/       # Test data and mocks
```

**Coverage Requirements:**
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Development Workflow

### Quick Commands

```bash
# Development (watch mode)
npm run dev

# Build for production
npm run build

# Code quality
npm run lint
npm run format

# Testing
npm test
npm run test:coverage
```

### Contributing Guidelines

See [README.md#contributing](README.md#contributing) for:
- Code style requirements
- Testing requirements
- Documentation standards
- Pull request process

## Deployment

### Building for Production

```bash
# Install dependencies
npm install

# Run build
npm run build

# Test the build
npm start
```

### Environment Variables

All configuration via environment variables (see [.env.example](.env.example)):

- **API Configuration** - Base URL, timeouts, retry settings
- **Scraper Configuration** - Browser settings for fallback
- **Cache Configuration** - TTL for different data types
- **Logging** - Log level control

### Running in Production

```bash
# Using npm
npm start

# Using node directly
node dist/index.js

# Using the binary
f5-status-mcp
```

## Troubleshooting

### Common Issues

Detailed troubleshooting guide in [README.md#troubleshooting](README.md#troubleshooting):

- Server connection issues
- Data retrieval problems
- Performance concerns
- Playwright browser setup

### Debug Mode

Enable detailed logging:

```bash
LOG_LEVEL=debug npm start
```

Or in `.env`:
```
LOG_LEVEL=debug
```

### Getting Help

1. Check the troubleshooting section in README.md
2. Review logs with LOG_LEVEL=debug
3. Check GitHub issues
4. Open a new issue with logs and configuration

## Additional Resources

### External Documentation

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [F5 Cloud Status Website](https://www.f5cloudstatus.com)
- [Atlassian Statuspage API](https://developer.statuspage.io/)
- [Playwright Documentation](https://playwright.dev/)

### Related Projects

- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude Desktop](https://claude.ai/desktop)

## Version History

### Version 1.0.0 (Current)

**Features:**
- ✅ Complete MCP server implementation
- ✅ 6 MCP tools for status monitoring
- ✅ API client with retry logic
- ✅ Web scraper fallback
- ✅ TTL-based caching
- ✅ Comprehensive error handling
- ✅ TypeScript with strict mode
- ✅ Full documentation

**Pending:**
- ⏳ Comprehensive test suite
- ⏳ CI/CD pipeline
- ⏳ npm package publication

## License

MIT - See [LICENSE](LICENSE) file for details

## Contributing

Contributions welcome! See [README.md#contributing](README.md#contributing) for guidelines.

---

**Quick Navigation:**
- New user? → [QUICKSTART.md](QUICKSTART.md)
- Need examples? → [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)
- Full reference? → [README.md](README.md)
- Developer docs? → [ARCHITECTURE.md](ARCHITECTURE.md)
