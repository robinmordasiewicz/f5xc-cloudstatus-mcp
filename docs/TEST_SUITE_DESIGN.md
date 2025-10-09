# Test Suite Design Specification

## Overview

Comprehensive testing strategy for F5 Cloud Status MCP Server to achieve 70% code coverage across all layers.

**Current State**: 0% coverage, 0 test files
**Target State**: 70% coverage (branches, functions, lines, statements)
**Estimated Effort**: 40-80 hours

## Test Architecture

### Three-Layer Testing Strategy

```
┌─────────────────────────────────────────┐
│         E2E Tests (20%)                 │
│  Complete MCP tool workflows            │
│  Real browser integration (Playwright)  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│     Integration Tests (30%)             │
│  Data Access Layer coordination         │
│  API + Scraper fallback behavior        │
│  Cache TTL and eviction scenarios       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│       Unit Tests (50%)                  │
│  Service business logic                 │
│  Utility functions                      │
│  Error handling and validation          │
└─────────────────────────────────────────┘
```

## Test File Structure

```
tests/
├── unit/                          # Unit tests (isolated components)
│   ├── services/
│   │   ├── status-service.test.ts
│   │   ├── component-service.test.ts
│   │   └── incident-service.test.ts
│   ├── cache/
│   │   └── cache-service.test.ts
│   ├── utils/
│   │   ├── config.test.ts
│   │   ├── errors.test.ts
│   │   └── logger.test.ts
│   └── tools/
│       ├── tool-definitions.test.ts
│       └── tool-handler.test.ts
│
├── integration/                   # Integration tests (multiple components)
│   ├── data-access/
│   │   ├── api-client.test.ts
│   │   ├── web-scraper.test.ts
│   │   └── data-access-layer.test.ts
│   └── server/
│       └── mcp-server.test.ts
│
├── e2e/                          # End-to-end tests (complete workflows)
│   ├── tools/
│   │   ├── get-overall-status.test.ts
│   │   ├── get-components.test.ts
│   │   ├── get-component.test.ts
│   │   ├── get-incidents.test.ts
│   │   ├── get-maintenance.test.ts
│   │   └── search.test.ts
│   └── scenarios/
│       ├── error-propagation.test.ts
│       └── cache-behavior.test.ts
│
└── fixtures/                     # Test data and mocks
    ├── api-responses/
    │   ├── status.json
    │   ├── summary.json
    │   ├── components.json
    │   ├── incidents.json
    │   └── maintenance.json
    ├── scraped-data/
    │   ├── homepage.html
    │   └── components-page.html
    └── mocks/
        ├── mock-api-client.ts
        ├── mock-scraper.ts
        └── mock-cache.ts
```

## Component Test Specifications

### 1. Unit Tests - Services Layer

#### StatusService (src/services/status-service.ts)

**Test Coverage Target**: 85%

**Test Cases**:
```typescript
describe('StatusService', () => {
  describe('getOverallStatus', () => {
    it('should retrieve and transform overall status successfully')
    it('should handle API errors with proper error propagation')
    it('should use cached data when available and fresh')
    it('should refresh expired cache data')
    it('should map API indicator levels to domain types correctly')
    it('should handle missing optional fields gracefully')
  })

  describe('isOperational', () => {
    it('should return true for "operational" status')
    it('should return false for degraded/outage statuses')
    it('should handle edge cases with null/undefined status')
  })
})
```

**Mock Dependencies**:
- Mock DataAccessLayer: Provides controlled API/scraper responses
- Mock CacheService: Controls cache hit/miss scenarios
- Fixture data: status.json with various indicator levels

#### ComponentService (src/services/component-service.ts)

**Test Coverage Target**: 85%

**Test Cases**:
```typescript
describe('ComponentService', () => {
  describe('getAllComponents', () => {
    it('should retrieve all components with summary statistics')
    it('should group components by category correctly')
    it('should calculate operational vs degraded counts')
    it('should handle empty component lists')
    it('should use cache when available')
  })

  describe('getComponentsByStatus', () => {
    it('should filter components by "none" status')
    it('should filter components by "minor" status')
    it('should filter components by "major" status')
    it('should filter components by "critical" status')
    it('should return empty array when no matches')
  })

  describe('getComponentsByGroup', () => {
    it('should filter components by group name')
    it('should handle case-insensitive group matching')
    it('should return empty array for non-existent groups')
  })

  describe('getComponentById', () => {
    it('should retrieve component by ID successfully')
    it('should throw NotFoundError for non-existent ID')
    it('should include uptime data when available')
  })

  describe('getComponentByName', () => {
    it('should retrieve component by exact name match')
    it('should handle case-sensitive name matching')
    it('should throw NotFoundError for non-existent name')
  })

  describe('searchComponents', () => {
    it('should search by partial name match')
    it('should search by description content')
    it('should search by group name')
    it('should return ranked results by relevance')
    it('should handle empty search queries')
  })
})
```

**Mock Dependencies**:
- Mock DataAccessLayer with 148 components fixture
- Mock CacheService for TTL testing
- Fixture: components.json with various statuses and groups

#### IncidentService (src/services/incident-service.ts)

**Test Coverage Target**: 85%

**Test Cases**:
```typescript
describe('IncidentService', () => {
  describe('getIncidents', () => {
    it('should retrieve all incidents within default timeframe')
    it('should filter by custom days parameter')
    it('should filter by incident status')
    it('should filter by impact level')
    it('should filter unresolved only')
    it('should sort incidents by created date descending')
    it('should include summary statistics')
  })

  describe('getActiveIncidents', () => {
    it('should return only unresolved incidents')
    it('should exclude resolved and postmortem incidents')
    it('should calculate time since creation')
  })

  describe('getIncidentById', () => {
    it('should retrieve incident with all updates')
    it('should include affected component details')
    it('should throw NotFoundError for invalid ID')
  })

  describe('getMaintenanceWindows', () => {
    it('should retrieve all maintenance windows')
    it('should filter by maintenance status')
    it('should filter active maintenance only')
    it('should filter upcoming maintenance only')
    it('should include scheduling information')
  })

  describe('searchIncidents', () => {
    it('should search by incident name')
    it('should search by update body content')
    it('should search by affected component names')
    it('should rank results by relevance')
  })

  describe('time calculations', () => {
    it('should calculate duration for resolved incidents')
    it('should calculate elapsed time for active incidents')
    it('should handle timezone conversions correctly')
  })
})
```

**Mock Dependencies**:
- Mock DataAccessLayer with varied incident statuses
- Mock Date.now() for consistent time calculations
- Fixture: incidents.json and maintenance.json

### 2. Unit Tests - Cache Layer

#### CacheService (src/cache/cache-service.ts)

**Test Coverage Target**: 90%

**Test Cases**:
```typescript
describe('CacheService', () => {
  describe('get', () => {
    it('should return cached value when fresh')
    it('should return null when cache expired')
    it('should return null when key does not exist')
    it('should handle concurrent reads correctly')
  })

  describe('set', () => {
    it('should store value with TTL')
    it('should overwrite existing cached value')
    it('should handle different data types (objects, arrays, primitives)')
    it('should respect custom TTL overrides')
  })

  describe('has', () => {
    it('should return true for existing fresh cache')
    it('should return false for expired cache')
    it('should return false for non-existent keys')
  })

  describe('delete', () => {
    it('should remove cached value')
    it('should handle deleting non-existent keys gracefully')
  })

  describe('clear', () => {
    it('should remove all cached values')
    it('should reset cache to empty state')
  })

  describe('TTL expiration', () => {
    it('should expire cache after configured TTL')
    it('should not expire cache before TTL')
    it('should handle different TTLs per key')
  })
})
```

**Mock Dependencies**:
- Jest fake timers for TTL testing
- No external dependencies (pure in-memory cache)

### 3. Unit Tests - Utilities

#### Config (src/utils/config.ts)

**Test Cases**:
```typescript
describe('Config', () => {
  it('should load configuration from environment variables')
  it('should use default values when env vars missing')
  it('should validate required configuration')
  it('should throw ConfigurationError for invalid values')
  it('should parse numeric environment variables correctly')
  it('should handle boolean environment variables')
})
```

#### Errors (src/utils/errors.ts)

**Test Cases**:
```typescript
describe('Error Classes', () => {
  describe('F5StatusError', () => {
    it('should create base error with name and message')
    it('should maintain error stack trace')
  })

  describe('APIError', () => {
    it('should include status code and response data')
    it('should format error message with context')
  })

  describe('DataUnavailableError', () => {
    it('should indicate both API and scraper failed')
  })

  describe('ValidationError', () => {
    it('should include validation details')
  })

  // Test all 9 error types
})
```

### 4. Integration Tests - Data Access Layer

#### APIClient (src/data-access/api-client.ts)

**Test Coverage Target**: 75%

**Test Cases**:
```typescript
describe('APIClient', () => {
  describe('HTTP requests', () => {
    it('should make successful GET request')
    it('should include proper headers and user agent')
    it('should handle 200 OK responses')
    it('should handle 404 Not Found responses')
    it('should handle 500 Server Error responses')
    it('should respect configured timeout')
  })

  describe('retry logic', () => {
    it('should retry on network errors')
    it('should retry on 5xx errors')
    it('should not retry on 4xx errors')
    it('should use exponential backoff between retries')
    it('should fail after max retry attempts')
    it('should succeed on retry after transient failure')
  })

  describe('endpoint methods', () => {
    it('should fetch status from /api/v2/status.json')
    it('should fetch summary from /api/v2/summary.json')
    it('should fetch components from /api/v2/components.json')
    it('should fetch incidents from /api/v2/incidents.json')
    it('should fetch maintenance from /api/v2/scheduled-maintenances.json')
  })

  describe('error handling', () => {
    it('should throw APIError with proper context')
    it('should throw TimeoutError on request timeout')
    it('should handle malformed JSON responses')
  })
})
```

**Mock Dependencies**:
- Mock axios or use axios-mock-adapter
- Network simulation with delays and failures
- Fixture: Complete API response set

#### WebScraper (src/data-access/web-scraper.ts)

**Test Coverage Target**: 70%

**Test Cases**:
```typescript
describe('WebScraper', () => {
  describe('browser initialization', () => {
    it('should launch browser with configured options')
    it('should use headless mode in production')
    it('should configure proper viewport size')
  })

  describe('scraping methods', () => {
    it('should scrape overall status from homepage')
    it('should scrape component list and statuses')
    it('should scrape component groups')
    it('should extract incident information')
    it('should extract maintenance windows')
  })

  describe('DOM parsing', () => {
    it('should handle missing DOM elements gracefully')
    it('should extract text content correctly')
    it('should parse status indicators')
    it('should identify component hierarchy')
  })

  describe('error handling', () => {
    it('should throw ScraperError on navigation timeout')
    it('should throw ScraperError on selector not found')
    it('should cleanup browser on error')
    it('should retry on transient failures')
  })

  describe('resource management', () => {
    it('should close browser after scraping')
    it('should handle concurrent scraping requests')
  })
})
```

**Mock Dependencies**:
- Playwright with mock pages
- Fixture HTML files (homepage, components page)
- Mock browser context

#### DataAccessLayer (src/data-access/data-access-layer.ts)

**Test Coverage Target**: 85%

**Test Cases**:
```typescript
describe('DataAccessLayer', () => {
  describe('API-first strategy', () => {
    it('should prefer API client over scraper')
    it('should use API when available')
    it('should not call scraper when API succeeds')
  })

  describe('fallback mechanism', () => {
    it('should fallback to scraper when API fails')
    it('should try scraper on API timeout')
    it('should try scraper on API 5xx errors')
    it('should not fallback on API 4xx errors (invalid request)')
  })

  describe('data transformation', () => {
    it('should transform API responses to domain models')
    it('should transform scraped data to domain models')
    it('should ensure consistent data format from both sources')
  })

  describe('error scenarios', () => {
    it('should throw DataUnavailableError when both sources fail')
    it('should include context about both failures')
    it('should log fallback attempts')
  })

  describe('method coverage', () => {
    it('should fetch overall status (API or scraper)')
    it('should fetch components (API or scraper)')
    it('should fetch incidents (API or scraper)')
    it('should fetch maintenance (API or scraper)')
  })
})
```

**Mock Dependencies**:
- Mock APIClient
- Mock WebScraper
- Both success and failure scenarios

### 5. Integration Tests - MCP Server

#### MCPServer (src/server/mcp-server.ts)

**Test Cases**:
```typescript
describe('MCPServer', () => {
  describe('server initialization', () => {
    it('should initialize with MCP SDK')
    it('should register all 6 tools')
    it('should configure stdio transport')
    it('should handle startup errors gracefully')
  })

  describe('tool registration', () => {
    it('should list all available tools')
    it('should provide tool schemas with Zod validation')
    it('should include tool descriptions')
  })

  describe('request handling', () => {
    it('should route tool calls to correct handlers')
    it('should validate tool inputs with Zod schemas')
    it('should return tool results in MCP format')
    it('should handle tool execution errors')
  })

  describe('error propagation', () => {
    it('should convert service errors to MCP errors')
    it('should include error context in responses')
    it('should log errors appropriately')
  })
})
```

### 6. E2E Tests - MCP Tools

**Test all 6 tools end-to-end with real data flow**

#### Tool: f5-status-get-overall

**Test Cases**:
```typescript
describe('f5-status-get-overall E2E', () => {
  it('should return overall status with all required fields')
  it('should include lastUpdated timestamp')
  it('should include isOperational boolean')
  it('should use cached data on subsequent calls')
  it('should handle API failures with scraper fallback')
  it('should return proper MCP error on complete failure')
})
```

#### Tool: f5-status-get-components

**Test Cases**:
```typescript
describe('f5-status-get-components E2E', () => {
  it('should return all components when no filters')
  it('should filter by status parameter')
  it('should filter by group parameter')
  it('should include summary statistics')
  it('should include component groups')
  it('should validate input parameters with Zod')
  it('should handle invalid filter values')
})
```

#### Tool: f5-status-get-component

**Test Cases**:
```typescript
describe('f5-status-get-component E2E', () => {
  it('should retrieve component by ID')
  it('should retrieve component by name')
  it('should require either id or name parameter')
  it('should return NotFoundError for invalid component')
  it('should include uptime data when available')
})
```

#### Tool: f5-status-get-incidents

**Test Cases**:
```typescript
describe('f5-status-get-incidents E2E', () => {
  it('should return incidents with default 7-day window')
  it('should filter by custom days parameter')
  it('should filter by status parameter')
  it('should filter by impact parameter')
  it('should filter unresolved_only')
  it('should validate days parameter (1-90 range)')
  it('should include incident updates')
  it('should include affected components')
})
```

#### Tool: f5-status-get-maintenance

**Test Cases**:
```typescript
describe('f5-status-get-maintenance E2E', () => {
  it('should return all maintenance windows')
  it('should filter by status parameter')
  it('should filter active_only')
  it('should filter upcoming_only')
  it('should include scheduling information')
  it('should include affected components')
})
```

#### Tool: f5-status-search

**Test Cases**:
```typescript
describe('f5-status-search E2E', () => {
  it('should search across all types by default')
  it('should search components only when type=components')
  it('should search incidents only when type=incidents')
  it('should search maintenance only when type=maintenance')
  it('should rank results by relevance')
  it('should include result counts in summary')
  it('should require non-empty query parameter')
})
```

## Test Fixtures Design

### API Response Fixtures

**tests/fixtures/api-responses/status.json**:
```json
{
  "page": {
    "id": "test-page-id",
    "name": "F5 Distributed Cloud Services",
    "url": "https://www.f5cloudstatus.com",
    "time_zone": "America/Los_Angeles",
    "updated_at": "2025-01-15T10:30:00.000Z"
  },
  "status": {
    "indicator": "none",
    "description": "All Systems Operational"
  }
}
```

**tests/fixtures/api-responses/components.json**:
```json
{
  "page": { "id": "test-page-id", "..." },
  "components": [
    {
      "id": "component-1",
      "name": "Distributed Cloud Services - API Gateway",
      "status": "operational",
      "position": 1,
      "description": "API Gateway service",
      "group_id": "group-1",
      "only_show_if_degraded": false
    },
    {
      "id": "component-2",
      "name": "XC Observability - Metrics",
      "status": "degraded_performance",
      "position": 2,
      "description": "Metrics collection service",
      "group_id": "group-1",
      "only_show_if_degraded": false
    }
  ]
}
```

**tests/fixtures/api-responses/incidents.json**:
```json
{
  "page": { "id": "test-page-id", "..." },
  "incidents": [
    {
      "id": "incident-1",
      "name": "XC Observability Metrics Delays",
      "status": "monitoring",
      "impact": "minor",
      "created_at": "2025-01-15T08:00:00.000Z",
      "updated_at": "2025-01-15T10:00:00.000Z",
      "resolved_at": null,
      "shortlink": "https://status.f5.com/incidents/incident-1",
      "incident_updates": [
        {
          "id": "update-1",
          "status": "monitoring",
          "body": "Issue identified and resolved, monitoring for stability",
          "created_at": "2025-01-15T10:00:00.000Z",
          "display_at": "2025-01-15T10:00:00.000Z",
          "affected_components": [
            {
              "code": "component-2",
              "name": "XC Observability - Metrics",
              "old_status": "degraded_performance",
              "new_status": "operational"
            }
          ]
        }
      ],
      "components": [
        { "id": "component-2", "name": "XC Observability - Metrics", "..." }
      ]
    }
  ]
}
```

### Mock Implementations

**tests/fixtures/mocks/mock-api-client.ts**:
```typescript
import { APIClient } from '../../../src/data-access/api-client.js';
import statusFixture from '../api-responses/status.json';
import componentsFixture from '../api-responses/components.json';

export class MockAPIClient implements Partial<APIClient> {
  private shouldFail = false;
  private delay = 0;

  setShouldFail(fail: boolean) {
    this.shouldFail = fail;
  }

  setDelay(ms: number) {
    this.delay = ms;
  }

  async fetchStatus() {
    if (this.delay) await new Promise(r => setTimeout(r, this.delay));
    if (this.shouldFail) throw new Error('API request failed');
    return statusFixture;
  }

  async fetchComponents() {
    if (this.delay) await new Promise(r => setTimeout(r, this.delay));
    if (this.shouldFail) throw new Error('API request failed');
    return componentsFixture;
  }

  // ... other methods
}
```

**tests/fixtures/mocks/mock-cache.ts**:
```typescript
import { CacheService } from '../../../src/cache/cache-service.js';

export class MockCacheService implements CacheService {
  private cache = new Map<string, any>();

  get<T>(key: string): T | null {
    return this.cache.get(key) ?? null;
  }

  set<T>(key: string, value: T, ttl?: number): void {
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}
```

## Testing Utilities

**tests/utils/test-helpers.ts**:
```typescript
import { Component, Incident, OverallStatus } from '../../src/types/domain.js';

export function createMockComponent(overrides?: Partial<Component>): Component {
  return {
    id: 'test-component-id',
    name: 'Test Component',
    status: 'none',
    position: 1,
    onlyShowIfDegraded: false,
    ...overrides
  };
}

export function createMockIncident(overrides?: Partial<Incident>): Incident {
  return {
    id: 'test-incident-id',
    name: 'Test Incident',
    status: 'investigating',
    impact: 'minor',
    createdAt: new Date(),
    updatedAt: new Date(),
    shortlink: 'https://status.f5.com/test',
    updates: [],
    affectedComponents: [],
    ...overrides
  };
}

export function createMockOverallStatus(overrides?: Partial<OverallStatus>): OverallStatus {
  return {
    status: 'operational',
    indicator: 'none',
    description: 'All Systems Operational',
    lastUpdated: new Date(),
    ...overrides
  };
}

export function waitFor(condition: () => boolean, timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      if (condition()) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        reject(new Error('Timeout waiting for condition'));
      }
    }, 100);
  });
}
```

## Jest Configuration Notes

**Current Configuration** (jest.config.js):
- ✅ Preset: ts-jest with ESM support
- ✅ Test environment: node
- ✅ Test root: `<rootDir>/tests`
- ✅ Test pattern: `**/*.test.ts`
- ✅ Coverage collection: `src/**/*.ts` (excluding types)
- ✅ Coverage thresholds: 70% for all metrics

**No changes needed to jest.config.js** - configuration is already optimal.

## Coverage Targets by Component

| Component | Target | Priority | Estimated Hours |
|-----------|--------|----------|-----------------|
| Services (3 files) | 85% | High | 15-20 |
| Cache Service | 90% | High | 4-6 |
| Utilities | 85% | Medium | 6-8 |
| Data Access Layer | 75% | High | 15-20 |
| Tool Definitions | 80% | Medium | 4-6 |
| Tool Handler | 85% | Medium | 6-8 |
| MCP Server | 70% | Medium | 6-8 |
| E2E Tools | 100% | High | 10-15 |

**Overall Estimated Effort**: 66-91 hours for comprehensive coverage

## Implementation Phases

### Phase 1: Foundation (8-12 hours)
1. Create test file structure and directories
2. Implement test fixtures (API responses, mock data)
3. Create mock implementations (APIClient, Scraper, Cache)
4. Set up test utilities and helpers

**Deliverable**: Complete test infrastructure with fixtures

### Phase 2: Unit Tests - Services (15-20 hours)
1. StatusService tests (4-5 hours)
2. ComponentService tests (6-8 hours)
3. IncidentService tests (5-7 hours)

**Deliverable**: 85% coverage of services layer

### Phase 3: Unit Tests - Utilities & Cache (10-14 hours)
1. CacheService tests (4-6 hours)
2. Config, Errors, Logger tests (6-8 hours)

**Deliverable**: 85%+ coverage of utilities

### Phase 4: Integration Tests (15-20 hours)
1. APIClient tests with retry logic (6-8 hours)
2. WebScraper tests with Playwright (5-7 hours)
3. DataAccessLayer fallback tests (4-5 hours)

**Deliverable**: 75% coverage of data access layer

### Phase 5: E2E Tests (10-15 hours)
1. All 6 MCP tool tests (8-10 hours)
2. Error propagation scenarios (2-3 hours)
3. Cache behavior validation (2 hours)

**Deliverable**: 100% E2E tool coverage

### Phase 6: Validation & Refinement (8-10 hours)
1. Run full test suite
2. Address coverage gaps
3. Optimize slow tests
4. Add edge case coverage

**Deliverable**: 70%+ overall coverage, all tests passing

## Success Criteria

### Coverage Metrics
- ✅ Overall coverage ≥ 70% (branches, functions, lines, statements)
- ✅ Services layer ≥ 85%
- ✅ Cache service ≥ 90%
- ✅ Data access layer ≥ 75%
- ✅ All 6 MCP tools 100% E2E coverage

### Test Quality
- ✅ All tests pass consistently
- ✅ No flaky tests (>99% success rate)
- ✅ Test execution < 30 seconds for unit tests
- ✅ Test execution < 2 minutes total including E2E
- ✅ Clear test descriptions and assertions
- ✅ Proper isolation (no test interdependencies)

### Maintainability
- ✅ Comprehensive fixtures for all scenarios
- ✅ Reusable mock implementations
- ✅ Test utilities for common operations
- ✅ Clear test organization and naming
- ✅ Documentation for complex test scenarios

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test status-service.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="ComponentService"

# Run only unit tests
npm test tests/unit

# Run only integration tests
npm test tests/integration

# Run only E2E tests
npm test tests/e2e
```

## Next Steps

1. Review and approve this test design specification
2. Begin Phase 1: Create test infrastructure
3. Implement tests phase-by-phase with validation
4. Achieve 70% coverage target
5. Integrate tests into CI/CD pipeline

---

**Document Version**: 1.0
**Last Updated**: 2025-01-15
**Status**: Ready for Implementation
