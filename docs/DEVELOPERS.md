# Developer Guide

This guide is for contributors and developers working on the F5 Cloud Status MCP server codebase.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Architecture](#architecture)
- [Testing](#testing)
- [Error Handling](#error-handling)
- [Logging](#logging)
- [Contributing](#contributing)

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 11.5.1 (for Trusted Publishing)
- Git

### Clone and Install

```bash
git clone https://github.com/robinmordasiewicz/f5xc-cloudstatus-mcp.git
cd f5xc-cloudstatus-mcp
npm install
npm run build
```

### MCP Client Configuration for Local Development

Add this to your MCP client configuration file (e.g., Claude Desktop config):

```json
{
  "mcpServers": {
    "f5cloudstatus": {
      "command": "node",
      "args": [
        "/absolute/path/to/f5xc-cloudstatus-mcp/dist/index.js"
      ],
      "env": {
        "API_BASE_URL": "https://www.f5cloudstatus.com/api/v2",
        "API_TIMEOUT": "10000",
        "API_RETRY_ATTEMPTS": "3",
        "API_RETRY_DELAY": "1000",
        "SCRAPER_BASE_URL": "https://www.f5cloudstatus.com",
        "SCRAPER_TIMEOUT": "30000",
        "SCRAPER_HEADLESS": "true",
        "CACHE_TTL_STATUS": "30000",
        "CACHE_TTL_COMPONENTS": "60000",
        "CACHE_TTL_INCIDENTS": "120000",
        "CACHE_TTL_MAINTENANCE": "300000",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

Replace `/absolute/path/to/f5xc-cloudstatus-mcp` with your actual project path.

### Environment Configuration

Create a `.env` file in the project root for custom settings:

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
LOG_LEVEL=debug  # debug, info, warn, error
```

## Project Structure

```
src/
├── cache/           # Caching service
│   ├── cache-service.ts
│   └── index.ts
├── data-access/     # API client and web scraper
│   ├── api-client.ts
│   ├── data-access-layer.ts
│   ├── web-scraper.ts
│   └── index.ts
├── server/          # MCP server implementation
│   ├── mcp-server.ts
│   └── index.ts
├── services/        # Business logic services
│   ├── component-service.ts
│   ├── incident-service.ts
│   ├── status-service.ts
│   └── index.ts
├── tools/           # MCP tool definitions and handlers
│   ├── tool-definitions.ts
│   ├── tool-handler.ts
│   └── index.ts
├── types/           # TypeScript type definitions
│   ├── api.ts
│   ├── domain.ts
│   └── index.ts
└── utils/           # Utilities (config, errors, logger)
    ├── config.ts
    ├── errors.ts
    ├── logger.ts
    └── index.ts

tests/
├── unit/            # Unit tests
│   ├── services/
│   └── utils/
├── integration/     # Integration tests
├── e2e/             # End-to-end tests
└── fixtures/        # Test fixtures
    ├── api-responses/
    └── mocks/
```

## Development Workflow

### Available Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm run dev` - Watch mode for development
- `npm start` - Start the MCP server
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Lint TypeScript files
- `npm run format` - Format code with Prettier

### Development Cycle

1. **Make changes** to TypeScript source files in `src/`
2. **Build** with `npm run build` or use watch mode with `npm run dev`
3. **Test** your changes with `npm test`
4. **Lint** with `npm run lint`
5. **Format** with `npm run format`

### Running the Server

```bash
# Build first
npm run build

# Start the server
npm start
```

The server will start and listen on stdio for MCP protocol messages.

### Debugging

Set `LOG_LEVEL=debug` in your `.env` file for detailed logging:

```bash
LOG_LEVEL=debug npm start
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

#### MCP Server Layer
Implements the Model Context Protocol for tool discovery and execution. Handles incoming requests and routes them to appropriate tool handlers.

**Files**: `src/server/mcp-server.ts`

#### Business Logic Layer
Contains the core business logic for status monitoring, component tracking, and incident management.

**Files**:
- `src/services/status-service.ts`
- `src/services/component-service.ts`
- `src/services/incident-service.ts`

#### Cache Layer
TTL-based caching service with configurable durations per data type. Reduces API calls and improves response times.

**Files**: `src/cache/cache-service.ts`

#### Data Access Layer
Coordinates between the API client and web scraper, providing automatic fallback when the API is unavailable.

**Files**:
- `src/data-access/data-access-layer.ts`
- `src/data-access/api-client.ts`
- `src/data-access/web-scraper.ts`

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage Requirements

- **Minimum coverage**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Writing Tests

Tests are located in the `tests/` directory:

- **Unit tests**: `tests/unit/` - Test individual functions and classes
- **Integration tests**: `tests/integration/` - Test component interactions
- **E2E tests**: `tests/e2e/` - Test complete workflows
- **Fixtures**: `tests/fixtures/` - Mock data and test helpers

Example unit test:

```typescript
import { createStatusService } from '../../src/services/status-service';

describe('StatusService', () => {
  it('should get overall status', async () => {
    const service = createStatusService(mockDataAccess, mockCache);
    const status = await service.getOverallStatus();

    expect(status.indicator).toBe('none');
    expect(status.isOperational).toBe(true);
  });
});
```

## Error Handling

The server implements comprehensive error handling with custom error types:

### Error Types

- **APIError**: API request failures
  ```typescript
  throw new APIError('Failed to fetch status', { statusCode: 500 });
  ```

- **ScraperError**: Web scraping failures
  ```typescript
  throw new ScraperError('Failed to scrape page', { url: pageUrl });
  ```

- **DataUnavailableError**: Both API and scraper failed
  ```typescript
  throw new DataUnavailableError('No data source available');
  ```

- **ConfigurationError**: Invalid configuration
  ```typescript
  throw new ConfigurationError('Missing API_BASE_URL');
  ```

- **ValidationError**: Invalid tool input
  ```typescript
  throw new ValidationError('Invalid component ID');
  ```

- **CacheError**: Cache operation failures
  ```typescript
  throw new CacheError('Failed to set cache value');
  ```

- **TimeoutError**: Request timeouts
  ```typescript
  throw new TimeoutError('Request timed out after 10s');
  ```

- **NotFoundError**: Resource not found
  ```typescript
  throw new NotFoundError('Component not found', { id: componentId });
  ```

### Error Context

All errors include detailed context for debugging:

```typescript
const error = new APIError('Request failed', {
  statusCode: 404,
  url: 'https://api.example.com/status',
  method: 'GET'
});

console.log(error.code);     // 'API_ERROR'
console.log(error.details);  // { statusCode: 404, url: '...', method: 'GET' }
```

## Logging

### Log Levels

Configure logging via the `LOG_LEVEL` environment variable:

- `debug`: Detailed debugging information
- `info`: General informational messages (default)
- `warn`: Warning messages
- `error`: Error messages only

### Using the Logger

```typescript
import { logger } from './utils/logger';

logger.debug('Detailed debug information', { context: 'value' });
logger.info('Information message');
logger.warn('Warning message', { issue: 'details' });
logger.error('Error occurred', error);
```

### Log Format

Logs are written to stderr with ISO 8601 timestamps:

```
2025-01-15T10:30:00.000Z [INFO] MCP Server started
2025-01-15T10:30:01.123Z [DEBUG] Handling ListTools request
2025-01-15T10:30:02.456Z [ERROR] API request failed: 500
```

## Contributing

We welcome contributions! Please follow these guidelines:

### Code Quality Standards

1. **All tests must pass**: `npm test`
2. **Code must be formatted**: `npm run format`
3. **No linting errors**: `npm run lint`
4. **Coverage thresholds met**: 70% minimum
5. **Type safety**: No TypeScript errors

### Pull Request Process

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make your changes**
4. **Write/update tests**
5. **Run quality checks**:
   ```bash
   npm test
   npm run lint
   npm run format
   ```
6. **Commit your changes** with clear messages
7. **Push to your fork**
8. **Create a Pull Request**

### Commit Messages

Use clear, descriptive commit messages:

```
feat: Add support for maintenance window filtering
fix: Handle null component descriptions
docs: Update API reference for new search options
test: Add integration tests for incident service
```

### Code Style

- Follow existing code patterns
- Use TypeScript types properly
- Write clear, self-documenting code
- Add comments for complex logic
- Keep functions small and focused

### Testing Requirements

- Write tests for new features
- Update tests for bug fixes
- Maintain or improve coverage
- Test edge cases and error conditions

## Troubleshooting

### Server not connecting

- Ensure you ran `npm run build` after code changes
- Check the absolute path in your MCP configuration
- Look at logs for error messages: `LOG_LEVEL=debug npm start`

### No data returned

- Verify network connectivity to https://www.f5cloudstatus.com
- Check API responses with debug logging
- Test the API directly: `curl https://www.f5cloudstatus.com/api/v2/status.json`

### Playwright browser issues

- Install Playwright browsers: `npx playwright install chromium`
- Set `SCRAPER_HEADLESS=true` in `.env`
- The scraper is only used as fallback when API fails

### Build errors

**Error: `tsc: command not found`**

This means dependencies are not installed. Run:
```bash
npm install
```

**Error: `EACCES: permission denied` during npm install**

Your npm cache has permission issues. Fix with:
```bash
sudo chown -R $(id -u):$(id -g) "$HOME/.npm"
npm cache clean --force
npm install
```

**General build troubleshooting:**

- Delete `dist/` and `node_modules/`
- Run `npm install` again
- Check Node.js version: `node --version` (should be >= 18.0.0)

## Release Process

See [NPM_TRUSTED_PUBLISHING_SETUP.md](NPM_TRUSTED_PUBLISHING_SETUP.md) for details on publishing new versions with npm Trusted Publishing.

Quick release:

```bash
# Update version
npm version patch  # or minor, or major

# Push changes
git push && git push --tags

# Create GitHub release (triggers automated npm publish)
gh release create v1.0.x --generate-notes
```

## Support

- **Issues**: [GitHub Issues](https://github.com/robinmordasiewicz/f5xc-cloudstatus-mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/robinmordasiewicz/f5xc-cloudstatus-mcp/discussions)
- **Documentation**: See the documentation site

## License

MIT - See [LICENSE](https://github.com/robinmordasiewicz/f5xc-cloudstatus-mcp/blob/main/LICENSE) file for details
