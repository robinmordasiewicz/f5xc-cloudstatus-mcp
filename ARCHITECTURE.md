# F5 Status MCP Server - Architecture Design

## System Overview

The F5 Status MCP Server is a Model Context Protocol (MCP) server that provides programmatic access to F5 Cloud service status information from https://www.f5cloudstatus.com.

### Design Goals

1. **Reliability**: Robust data fetching with fallback mechanisms
2. **Performance**: Efficient caching and minimal API calls
3. **Simplicity**: Clean interfaces following MCP standards
4. **Maintainability**: Modular design with clear separation of concerns
5. **Extensibility**: Easy to add new tools and data sources

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MCP Client (Claude Desktop)               │
└────────────────────┬────────────────────────────────────────────┘
                     │ MCP Protocol (stdio)
                     │
┌────────────────────┴────────────────────────────────────────────┐
│                     F5 Status MCP Server                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              MCP Server Layer                             │  │
│  │  - Tool Registration                                      │  │
│  │  - Request Handling                                       │  │
│  │  - Response Formatting                                    │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                            │
│  ┌──────────────────┴───────────────────────────────────────┐  │
│  │              Business Logic Layer                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────────────┐    │  │
│  │  │  Status    │  │ Component  │  │    Incident     │    │  │
│  │  │  Service   │  │  Service   │  │    Service      │    │  │
│  │  └────────────┘  └────────────┘  └─────────────────┘    │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                            │
│  ┌──────────────────┴───────────────────────────────────────┐  │
│  │              Data Access Layer                            │  │
│  │  ┌──────────────────────┐  ┌──────────────────────────┐  │  │
│  │  │   API Client         │  │   Web Scraper            │  │  │
│  │  │   (Primary)          │  │   (Fallback)             │  │  │
│  │  └──────────────────────┘  └──────────────────────────┘  │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                            │
│  ┌──────────────────┴───────────────────────────────────────┐  │
│  │              Caching Layer                                │  │
│  │  - In-Memory Cache with TTL                               │  │
│  │  - Configurable Expiry Times                              │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ HTTPS
                     │
┌────────────────────┴────────────────────────────────────────────┐
│                  F5 Cloud Status Website                         │
│  - Statuspage API (https://www.f5cloudstatus.com/api/v2/)      │
│  - HTML Frontend (https://www.f5cloudstatus.com/)              │
└──────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. MCP Server Layer

**Responsibility**: Handle MCP protocol communication

**Components**:
- `MCPServer`: Main server instance
- `ToolRegistry`: Register and manage available tools
- `RequestHandler`: Process incoming MCP requests
- `ResponseFormatter`: Format responses according to MCP spec

**Key Files**:
```
src/server/
├── index.ts              # Server entry point
├── tool-registry.ts      # Tool registration and discovery
├── request-handler.ts    # MCP request processing
└── response-formatter.ts # Response formatting utilities
```

**Interface**:
```typescript
interface MCPServerConfig {
  name: string;
  version: string;
  capabilities: {
    tools: boolean;
    resources?: boolean;
    prompts?: boolean;
  };
}

class MCPServer {
  constructor(config: MCPServerConfig);
  registerTools(tools: Tool[]): void;
  start(): Promise<void>;
  stop(): Promise<void>;
}
```

### 2. Business Logic Layer

**Responsibility**: Implement core business functionality

#### 2.1 StatusService

**Purpose**: Overall system status operations

**Operations**:
- `getOverallStatus()`: Fetch current overall status
- `getSystemIndicator()`: Get status indicator level

**File**: `src/services/status-service.ts`

```typescript
interface OverallStatus {
  status: StatusLevel;
  indicator: IndicatorLevel;
  description: string;
  updated_at: string;
}

type StatusLevel = "operational" | "degraded" | "partial_outage" | "major_outage";
type IndicatorLevel = "none" | "minor" | "major" | "critical";

class StatusService {
  constructor(
    private dataAccess: DataAccessLayer,
    private cache: CacheService
  ) {}

  async getOverallStatus(): Promise<OverallStatus>;
}
```

#### 2.2 ComponentService

**Purpose**: Component-level status operations

**Operations**:
- `listComponents(filters?)`: List all or filtered components
- `getComponent(id)`: Get specific component details
- `getComponentUptime(id, range?)`: Get uptime statistics

**File**: `src/services/component-service.ts`

```typescript
interface Component {
  id: string;
  name: string;
  status: string;
  group: string;
  uptime?: string;
  description?: string;
  updated_at: string;
}

interface ComponentFilters {
  category?: string;
  status?: string;
  includeUptime?: boolean;
}

class ComponentService {
  constructor(
    private dataAccess: DataAccessLayer,
    private cache: CacheService
  ) {}

  async listComponents(filters?: ComponentFilters): Promise<Component[]>;
  async getComponent(id: string): Promise<Component>;
  async getComponentUptime(id: string, range?: number): Promise<UptimeData>;
}
```

#### 2.3 IncidentService

**Purpose**: Incident and maintenance operations

**Operations**:
- `listIncidents(options?)`: List recent incidents
- `getIncident(id)`: Get specific incident details
- `getScheduledMaintenance(upcoming?)`: Get maintenance windows

**File**: `src/services/incident-service.ts`

```typescript
interface Incident {
  id: string;
  name: string;
  status: string;
  impact: string;
  created_at: string;
  updated_at: string;
  shortlink: string;
  updates: IncidentUpdate[];
}

interface IncidentUpdate {
  status: string;
  body: string;
  created_at: string;
}

interface IncidentOptions {
  limit?: number;
  status?: string;
  daysBack?: number;
}

class IncidentService {
  constructor(
    private dataAccess: DataAccessLayer,
    private cache: CacheService
  ) {}

  async listIncidents(options?: IncidentOptions): Promise<Incident[]>;
  async getIncident(id: string): Promise<Incident>;
  async getScheduledMaintenance(upcoming?: boolean): Promise<Maintenance[]>;
}
```

### 3. Data Access Layer

**Responsibility**: Fetch data from external sources

#### 3.1 API Client (Primary)

**Purpose**: Interact with Statuspage API

**File**: `src/data-access/api-client.ts`

```typescript
interface APIClientConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

class APIClient {
  constructor(config: APIClientConfig);

  async fetchStatus(): Promise<RawStatusData>;
  async fetchComponents(): Promise<RawComponent[]>;
  async fetchIncidents(): Promise<RawIncident[]>;
  async fetchScheduledMaintenance(): Promise<RawMaintenance[]>;
  async fetchSummary(): Promise<RawSummary>;

  private async request<T>(endpoint: string): Promise<T>;
  private async retry<T>(fn: () => Promise<T>, attempts: number): Promise<T>;
}
```

#### 3.2 Web Scraper (Fallback)

**Purpose**: Extract data from HTML when API unavailable

**File**: `src/data-access/web-scraper.ts`

```typescript
interface ScraperConfig {
  baseUrl: string;
  timeout: number;
  headless: boolean;
}

class WebScraper {
  constructor(config: ScraperConfig);

  async scrapeStatus(): Promise<RawStatusData>;
  async scrapeComponents(): Promise<RawComponent[]>;
  async scrapeIncidents(): Promise<RawIncident[]>;

  private async launchBrowser(): Promise<Browser>;
  private async extractData(page: Page, selectors: Selectors): Promise<any>;
}
```

#### 3.3 Data Access Facade

**Purpose**: Abstract data source selection

**File**: `src/data-access/index.ts`

```typescript
class DataAccessLayer {
  constructor(
    private apiClient: APIClient,
    private webScraper: WebScraper,
    private preferAPI: boolean = true
  ) {}

  async fetchStatus(): Promise<RawStatusData> {
    try {
      if (this.preferAPI) {
        return await this.apiClient.fetchStatus();
      }
    } catch (error) {
      console.warn('API failed, falling back to scraper');
    }
    return await this.webScraper.scrapeStatus();
  }

  // Similar methods for other data types
}
```

### 4. Caching Layer

**Responsibility**: Reduce external API calls and improve performance

**File**: `src/cache/cache-service.ts`

```typescript
interface CacheConfig {
  ttl: {
    status: number;        // 30 seconds
    components: number;    // 60 seconds
    incidents: number;     // 120 seconds
    maintenance: number;   // 300 seconds
  };
}

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();

  constructor(private config: CacheConfig) {}

  async get<T>(
    key: string,
    ttl: number,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(key);

    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });

    return data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}
```

## MCP Tools Implementation

### Tool Definitions

```typescript
// src/tools/index.ts

export const tools: Tool[] = [
  {
    name: "f5-status-get-overall",
    description: "Get overall F5 Cloud service status",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "f5-status-list-components",
    description: "List all F5 Cloud service components with status",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Filter by category (e.g., 'Services', 'North America PoPs')"
        },
        status: {
          type: "string",
          description: "Filter by status (e.g., 'Operational', 'Degraded')"
        },
        includeUptime: {
          type: "boolean",
          description: "Include uptime percentage data"
        }
      }
    }
  },
  {
    name: "f5-status-get-component",
    description: "Get detailed status for a specific component",
    inputSchema: {
      type: "object",
      properties: {
        componentId: {
          type: "string",
          description: "Component ID or name"
        }
      },
      required: ["componentId"]
    }
  },
  {
    name: "f5-status-list-incidents",
    description: "List recent service incidents",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of incidents to return (default: 10)"
        },
        status: {
          type: "string",
          description: "Filter by status (Investigating, Identified, Monitoring, Resolved)"
        },
        daysBack: {
          type: "number",
          description: "How many days to look back (default: 14)"
        }
      }
    }
  },
  {
    name: "f5-status-get-scheduled-maintenance",
    description: "Get upcoming scheduled maintenance windows",
    inputSchema: {
      type: "object",
      properties: {
        upcoming: {
          type: "boolean",
          description: "Only return future maintenance (default: true)"
        }
      }
    }
  },
  {
    name: "f5-status-get-uptime",
    description: "Get uptime statistics for components",
    inputSchema: {
      type: "object",
      properties: {
        componentId: {
          type: "string",
          description: "Specific component ID (optional, returns overall if not specified)"
        },
        range: {
          type: "number",
          description: "Days to include in uptime calculation (default: 60)"
        }
      }
    }
  }
];
```

### Tool Handler Implementation

```typescript
// src/tools/handler.ts

export class ToolHandler {
  constructor(
    private statusService: StatusService,
    private componentService: ComponentService,
    private incidentService: IncidentService
  ) {}

  async handleTool(name: string, args: any): Promise<any> {
    switch (name) {
      case "f5-status-get-overall":
        return await this.statusService.getOverallStatus();

      case "f5-status-list-components":
        return await this.componentService.listComponents(args);

      case "f5-status-get-component":
        return await this.componentService.getComponent(args.componentId);

      case "f5-status-list-incidents":
        return await this.incidentService.listIncidents(args);

      case "f5-status-get-scheduled-maintenance":
        return await this.incidentService.getScheduledMaintenance(args.upcoming);

      case "f5-status-get-uptime":
        return await this.componentService.getComponentUptime(
          args.componentId,
          args.range
        );

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
}
```

## Directory Structure

```
f5cloudstatus-mcp-server/
├── src/
│   ├── server/
│   │   ├── index.ts                 # Server entry point
│   │   ├── tool-registry.ts         # Tool registration
│   │   ├── request-handler.ts       # Request processing
│   │   └── response-formatter.ts    # Response formatting
│   │
│   ├── services/
│   │   ├── status-service.ts        # Overall status logic
│   │   ├── component-service.ts     # Component operations
│   │   └── incident-service.ts      # Incident/maintenance logic
│   │
│   ├── data-access/
│   │   ├── index.ts                 # Data access facade
│   │   ├── api-client.ts            # Statuspage API client
│   │   └── web-scraper.ts           # Web scraping fallback
│   │
│   ├── cache/
│   │   └── cache-service.ts         # Caching implementation
│   │
│   ├── tools/
│   │   ├── index.ts                 # Tool definitions
│   │   └── handler.ts               # Tool execution logic
│   │
│   ├── types/
│   │   ├── mcp.ts                   # MCP protocol types
│   │   ├── domain.ts                # Domain model types
│   │   └── api.ts                   # API response types
│   │
│   └── utils/
│       ├── logger.ts                # Logging utilities
│       ├── errors.ts                # Error handling
│       └── config.ts                # Configuration management
│
├── tests/
│   ├── unit/                        # Unit tests
│   ├── integration/                 # Integration tests
│   └── fixtures/                    # Test fixtures
│
├── docs/
│   ├── ANALYSIS.md                  # Initial analysis
│   ├── ARCHITECTURE.md              # This document
│   └── API.md                       # API documentation
│
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Data Flow

### Example: Get Overall Status

```
1. MCP Client sends request:
   {
     "method": "tools/call",
     "params": {
       "name": "f5-status-get-overall"
     }
   }

2. MCP Server → RequestHandler
   - Validates request
   - Routes to ToolHandler

3. ToolHandler → StatusService
   - Calls getOverallStatus()

4. StatusService → CacheService
   - Check cache for 'overall-status'

5a. Cache HIT:
    - Return cached data
    - Skip to step 8

5b. Cache MISS:
    - Continue to step 6

6. StatusService → DataAccessLayer
   - Call fetchStatus()

7. DataAccessLayer:
   7a. Try APIClient.fetchStatus()
   7b. If fails, fallback to WebScraper.scrapeStatus()

8. Data flows back:
   DataAccessLayer → StatusService → ToolHandler → ResponseFormatter

9. ResponseFormatter → MCP Client:
   {
     "content": [
       {
         "type": "text",
         "text": JSON.stringify({
           status: "operational",
           indicator: "none",
           description: "All Systems Operational",
           updated_at: "2025-10-08T16:30:00Z"
         })
       }
     ]
   }
```

## Error Handling Strategy

### Error Types

```typescript
// src/utils/errors.ts

export class F5StatusError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'F5StatusError';
  }
}

export class APIError extends F5StatusError {
  constructor(message: string, statusCode: number) {
    super(message, 'API_ERROR', statusCode);
  }
}

export class ScraperError extends F5StatusError {
  constructor(message: string) {
    super(message, 'SCRAPER_ERROR');
  }
}

export class CacheError extends F5StatusError {
  constructor(message: string) {
    super(message, 'CACHE_ERROR');
  }
}

export class ValidationError extends F5StatusError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}
```

### Error Handling Flow

```typescript
// src/server/request-handler.ts

async handleRequest(request: MCPRequest): Promise<MCPResponse> {
  try {
    const result = await this.toolHandler.handleTool(
      request.params.name,
      request.params.arguments
    );

    return {
      content: [{
        type: "text",
        text: JSON.stringify(result, null, 2)
      }]
    };

  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        content: [{
          type: "text",
          text: `Invalid request: ${error.message}`
        }],
        isError: true
      };
    }

    if (error instanceof APIError || error instanceof ScraperError) {
      return {
        content: [{
          type: "text",
          text: `Service temporarily unavailable: ${error.message}`
        }],
        isError: true
      };
    }

    // Unknown error
    console.error('Unexpected error:', error);
    return {
      content: [{
        type: "text",
        text: "An unexpected error occurred"
      }],
      isError: true
    };
  }
}
```

## Configuration Management

```typescript
// src/utils/config.ts

export interface Config {
  server: {
    name: string;
    version: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  scraper: {
    baseUrl: string;
    timeout: number;
    headless: boolean;
  };
  cache: {
    ttl: {
      status: number;
      components: number;
      incidents: number;
      maintenance: number;
    };
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
  };
}

export const defaultConfig: Config = {
  server: {
    name: "f5-cloud-status",
    version: "1.0.0"
  },
  api: {
    baseUrl: "https://www.f5cloudstatus.com/api/v2",
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  scraper: {
    baseUrl: "https://www.f5cloudstatus.com",
    timeout: 30000,
    headless: true
  },
  cache: {
    ttl: {
      status: 30000,        // 30 seconds
      components: 60000,    // 60 seconds
      incidents: 120000,    // 2 minutes
      maintenance: 300000   // 5 minutes
    }
  },
  logging: {
    level: 'info'
  }
};

export function loadConfig(): Config {
  // Load from environment variables or config file
  return {
    ...defaultConfig,
    // Override with env vars
  };
}
```

## Logging Strategy

```typescript
// src/utils/logger.ts

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  constructor(private level: LogLevel = LogLevel.INFO) {}

  debug(message: string, meta?: any): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta);
    }
  }

  info(message: string, meta?: any): void {
    if (this.level <= LogLevel.INFO) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta);
    }
  }

  warn(message: string, meta?: any): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta);
    }
  }

  error(message: string, error?: Error, meta?: any): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, {
        error: error?.message,
        stack: error?.stack,
        ...meta
      });
    }
  }
}
```

## Performance Considerations

### 1. Caching Strategy
- **Aggressive caching**: Minimize external calls
- **TTL-based expiry**: Different TTLs for different data types
- **Cache warming**: Pre-populate on startup for critical data

### 2. Connection Pooling
```typescript
// Reuse HTTP connections
const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 10
});
```

### 3. Parallel Requests
```typescript
// When fetching multiple components
async listComponents(): Promise<Component[]> {
  const componentIds = await this.getComponentIds();

  // Fetch all components in parallel
  const components = await Promise.all(
    componentIds.map(id => this.getComponent(id))
  );

  return components;
}
```

### 4. Request Batching
- Batch similar requests within time window
- Reduce redundant API calls

## Security Considerations

### 1. Input Validation
```typescript
function validateComponentId(id: string): void {
  if (!id || typeof id !== 'string') {
    throw new ValidationError('Component ID must be a non-empty string');
  }

  if (id.length > 100) {
    throw new ValidationError('Component ID too long');
  }

  if (!/^[a-z0-9-_]+$/i.test(id)) {
    throw new ValidationError('Component ID contains invalid characters');
  }
}
```

### 2. Rate Limiting
```typescript
class RateLimiter {
  private requests: number[] = [];

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  async checkLimit(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(time => time > now - this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = oldestRequest + this.windowMs - now;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.requests.push(now);
  }
}
```

### 3. HTTPS Enforcement
- All external requests use HTTPS
- Validate SSL certificates
- No sensitive data transmission

## Testing Strategy

### 1. Unit Tests
```typescript
// tests/unit/services/status-service.test.ts

describe('StatusService', () => {
  let service: StatusService;
  let mockDataAccess: jest.Mocked<DataAccessLayer>;
  let mockCache: jest.Mocked<CacheService>;

  beforeEach(() => {
    mockDataAccess = createMockDataAccess();
    mockCache = createMockCache();
    service = new StatusService(mockDataAccess, mockCache);
  });

  test('getOverallStatus returns cached data when available', async () => {
    const cachedStatus = { status: 'operational' };
    mockCache.get.mockResolvedValue(cachedStatus);

    const result = await service.getOverallStatus();

    expect(result).toEqual(cachedStatus);
    expect(mockDataAccess.fetchStatus).not.toHaveBeenCalled();
  });

  test('getOverallStatus fetches fresh data on cache miss', async () => {
    mockCache.get.mockImplementation(async (key, ttl, fetcher) => {
      return await fetcher();
    });

    const freshStatus = { status: 'operational' };
    mockDataAccess.fetchStatus.mockResolvedValue(freshStatus);

    const result = await service.getOverallStatus();

    expect(result).toEqual(freshStatus);
    expect(mockDataAccess.fetchStatus).toHaveBeenCalled();
  });
});
```

### 2. Integration Tests
```typescript
// tests/integration/api-client.test.ts

describe('APIClient Integration', () => {
  let client: APIClient;

  beforeEach(() => {
    client = new APIClient({
      baseUrl: 'https://www.f5cloudstatus.com/api/v2',
      timeout: 10000,
      retryAttempts: 2,
      retryDelay: 100
    });
  });

  test('fetchStatus retrieves real data', async () => {
    const status = await client.fetchStatus();

    expect(status).toHaveProperty('status');
    expect(status.status).toHaveProperty('indicator');
  });

  test('handles API errors gracefully', async () => {
    const badClient = new APIClient({
      baseUrl: 'https://invalid.example.com/api/v2',
      timeout: 1000,
      retryAttempts: 1,
      retryDelay: 100
    });

    await expect(badClient.fetchStatus()).rejects.toThrow(APIError);
  });
});
```

### 3. E2E Tests
```typescript
// tests/e2e/mcp-server.test.ts

describe('MCP Server E2E', () => {
  let server: MCPServer;
  let client: MCPTestClient;

  beforeAll(async () => {
    server = new MCPServer(defaultConfig);
    await server.start();
    client = new MCPTestClient();
  });

  afterAll(async () => {
    await server.stop();
  });

  test('complete workflow: list tools → call tool → get result', async () => {
    // List available tools
    const tools = await client.listTools();
    expect(tools).toContainEqual(
      expect.objectContaining({ name: 'f5-status-get-overall' })
    );

    // Call tool
    const result = await client.callTool('f5-status-get-overall', {});

    // Verify result
    expect(result).toHaveProperty('status');
    expect(['operational', 'degraded', 'partial_outage', 'major_outage'])
      .toContain(result.status);
  });
});
```

## Deployment Architecture

### Development Environment
```
Local Machine
├── MCP Server (stdio)
├── Claude Desktop (MCP client)
└── Test Data/Mocks
```

### Production Environment
```
User's Machine
├── Claude Desktop
│   └── MCP Server (stdio transport)
│       ├── Cache (in-memory)
│       └── HTTP Client
│           └── → F5 Cloud Status Website
```

### Configuration Files

```json
// Claude Desktop config.json
{
  "mcpServers": {
    "f5-cloud-status": {
      "command": "node",
      "args": [
        "/path/to/f5cloudstatus-mcp-server/dist/index.js"
      ],
      "env": {
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

## Scalability Considerations

### Current Design (Single User)
- In-memory cache
- Stdio transport
- No persistent storage

### Future Enhancements (Multi-User)
- Redis cache for shared state
- HTTP/WebSocket transport
- Database for historical data
- Horizontal scaling capability

## Monitoring and Observability

### Metrics to Track
```typescript
interface Metrics {
  requests: {
    total: number;
    byTool: Record<string, number>;
    errors: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  dataAccess: {
    apiCalls: number;
    scraperCalls: number;
    failures: number;
  };
  performance: {
    avgResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
}
```

### Health Check
```typescript
async function healthCheck(): Promise<HealthStatus> {
  const checks = await Promise.all([
    checkAPIAvailability(),
    checkCacheHealth(),
    checkMemoryUsage()
  ]);

  return {
    status: checks.every(c => c.healthy) ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString()
  };
}
```

## Migration Path

### Phase 1: MVP (Week 1-2)
- Implement core 3 tools
- API client only (no scraper)
- Basic in-memory cache
- Essential error handling

### Phase 2: Resilience (Week 3)
- Add web scraper fallback
- Implement retry logic
- Enhanced error handling
- Comprehensive logging

### Phase 3: Full Feature Set (Week 4)
- Implement remaining 3 tools
- Advanced caching strategies
- Performance optimization
- Complete test coverage

### Phase 4: Production Ready (Week 5+)
- Documentation
- Monitoring/metrics
- Security hardening
- User acceptance testing

## Conclusion

This architecture provides:

✅ **Modularity**: Clear separation of concerns
✅ **Reliability**: Fallback mechanisms and error handling
✅ **Performance**: Efficient caching and parallel operations
✅ **Maintainability**: Clean code structure and comprehensive tests
✅ **Extensibility**: Easy to add new tools and features
✅ **MCP Compliance**: Follows Model Context Protocol standards

The design balances simplicity for rapid development with robustness for production use.
