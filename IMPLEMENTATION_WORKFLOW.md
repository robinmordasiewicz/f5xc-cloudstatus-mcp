# F5 Status MCP Server - Implementation Workflow

## Overview

This document provides a comprehensive, step-by-step implementation plan for building the F5 Status MCP Server based on the architecture design.

**Timeline**: 5 weeks
**Strategy**: Phased implementation with progressive feature delivery
**Approach**: Test-driven development with continuous integration

## Prerequisites

### Required Tools
- Node.js 18+ and npm/yarn
- TypeScript 5+
- Git for version control
- Claude Desktop for MCP testing

### Required Knowledge
- TypeScript/JavaScript
- MCP Protocol fundamentals
- REST APIs and web scraping
- Testing frameworks (Jest)

### Environment Setup Checklist
- [ ] Node.js and npm installed
- [ ] TypeScript compiler installed globally
- [ ] Git repository initialized
- [ ] IDE/editor configured (VS Code recommended)
- [ ] Claude Desktop installed for testing

---

## Phase 1: Project Foundation (Days 1-3)

### Objective
Set up project infrastructure and core dependencies

### Tasks

#### 1.1 Initialize Project Structure
**Priority**: Critical
**Estimated Time**: 2 hours

```bash
# Create project directory
mkdir f5cloudstatus-mcp-server
cd f5cloudstatus-mcp-server

# Initialize npm project
npm init -y

# Initialize TypeScript
npx tsc --init

# Initialize Git
git init
echo "node_modules/" > .gitignore
echo "dist/" >> .gitignore
echo ".env" >> .gitignore
```

**Deliverable**: Basic project skeleton with package.json and tsconfig.json

---

#### 1.2 Install Core Dependencies
**Priority**: Critical
**Estimated Time**: 1 hour

```bash
# MCP SDK
npm install @modelcontextprotocol/sdk

# HTTP client
npm install axios

# Web scraping (fallback)
npm install playwright

# Utilities
npm install dotenv

# Development dependencies
npm install -D typescript @types/node
npm install -D jest @types/jest ts-jest
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier
```

**Deliverable**: Complete package.json with all dependencies

---

#### 1.3 Configure TypeScript
**Priority**: Critical
**Estimated Time**: 30 minutes

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

**Deliverable**: Configured TypeScript compiler

---

#### 1.4 Create Directory Structure
**Priority**: Critical
**Estimated Time**: 30 minutes

```bash
mkdir -p src/{server,services,data-access,cache,tools,types,utils}
mkdir -p tests/{unit,integration,e2e,fixtures}
mkdir -p docs
```

**Deliverable**: Complete directory structure matching architecture

---

#### 1.5 Setup Testing Framework
**Priority**: Critical
**Estimated Time**: 1 hour

Create `jest.config.js`:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

Add test scripts to `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  }
}
```

**Deliverable**: Working test infrastructure

---

#### 1.6 Create Type Definitions
**Priority**: High
**Estimated Time**: 2 hours

**File**: `src/types/domain.ts`
```typescript
export type StatusLevel = "operational" | "degraded" | "partial_outage" | "major_outage";
export type IndicatorLevel = "none" | "minor" | "major" | "critical";

export interface OverallStatus {
  status: StatusLevel;
  indicator: IndicatorLevel;
  description: string;
  updated_at: string;
}

export interface Component {
  id: string;
  name: string;
  status: string;
  group: string;
  uptime?: string;
  description?: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  name: string;
  status: string;
  impact: string;
  created_at: string;
  updated_at: string;
  shortlink: string;
  updates: IncidentUpdate[];
}

export interface IncidentUpdate {
  status: string;
  body: string;
  created_at: string;
}

export interface Maintenance {
  id: string;
  name: string;
  scheduled_for: string;
  scheduled_until: string;
  status: string;
  impact: string;
  components: string[];
  updates: IncidentUpdate[];
}

export interface UptimeData {
  percentage: number;
  startDate: string;
  endDate: string;
  dailyStats: DailyUptimeStat[];
}

export interface DailyUptimeStat {
  date: string;
  uptime: number;
  incidents: number;
}
```

**File**: `src/types/api.ts`
```typescript
// Raw API response types
export interface RawStatusResponse {
  page: {
    id: string;
    name: string;
    url: string;
    updated_at: string;
  };
  status: {
    indicator: string;
    description: string;
  };
}

export interface RawComponent {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  position: number;
  description: string | null;
  showcase: boolean;
  group_id: string | null;
  page_id: string;
  group: boolean;
  only_show_if_degraded: boolean;
}

export interface RawIncident {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  monitoring_at: string | null;
  resolved_at: string | null;
  impact: string;
  shortlink: string;
  started_at: string;
  page_id: string;
  incident_updates: RawIncidentUpdate[];
}

export interface RawIncidentUpdate {
  id: string;
  status: string;
  body: string;
  incident_id: string;
  created_at: string;
  updated_at: string;
  display_at: string;
  affected_components: any[];
}
```

**Deliverable**: Complete type definitions for domain and API models

---

#### 1.7 Configuration Management
**Priority**: High
**Estimated Time**: 1 hour

**File**: `src/utils/config.ts`
```typescript
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
    baseUrl: process.env.API_BASE_URL || "https://www.f5cloudstatus.com/api/v2",
    timeout: parseInt(process.env.API_TIMEOUT || "10000"),
    retryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS || "3"),
    retryDelay: parseInt(process.env.API_RETRY_DELAY || "1000")
  },
  scraper: {
    baseUrl: process.env.SCRAPER_BASE_URL || "https://www.f5cloudstatus.com",
    timeout: parseInt(process.env.SCRAPER_TIMEOUT || "30000"),
    headless: process.env.SCRAPER_HEADLESS !== "false"
  },
  cache: {
    ttl: {
      status: parseInt(process.env.CACHE_TTL_STATUS || "30000"),
      components: parseInt(process.env.CACHE_TTL_COMPONENTS || "60000"),
      incidents: parseInt(process.env.CACHE_TTL_INCIDENTS || "120000"),
      maintenance: parseInt(process.env.CACHE_TTL_MAINTENANCE || "300000")
    }
  },
  logging: {
    level: (process.env.LOG_LEVEL as any) || 'info'
  }
};

export function loadConfig(): Config {
  return defaultConfig;
}
```

Create `.env.example`:
```bash
# API Configuration
API_BASE_URL=https://www.f5cloudstatus.com/api/v2
API_TIMEOUT=10000
API_RETRY_ATTEMPTS=3
API_RETRY_DELAY=1000

# Scraper Configuration
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

**Deliverable**: Configuration system with environment variable support

---

#### 1.8 Error Handling Foundation
**Priority**: High
**Estimated Time**: 1 hour

**File**: `src/utils/errors.ts`
```typescript
export class F5StatusError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'F5StatusError';
    Error.captureStackTrace(this, this.constructor);
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

export class NotFoundError extends F5StatusError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}
```

**Deliverable**: Custom error classes for error handling

---

#### 1.9 Logging Utility
**Priority**: Medium
**Estimated Time**: 1 hour

**File**: `src/utils/logger.ts`
```typescript
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  debug(message: string, meta?: any): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta || '');
    }
  }

  info(message: string, meta?: any): void {
    if (this.level <= LogLevel.INFO) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta || '');
    }
  }

  warn(message: string, meta?: any): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta || '');
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

// Global logger instance
export const logger = new Logger();
```

**Deliverable**: Logging utility with level support

---

### Phase 1 Validation

**Checklist**:
- [ ] Project initialized with all dependencies
- [ ] TypeScript compiles without errors
- [ ] Test framework runs successfully
- [ ] Directory structure matches architecture
- [ ] All type definitions created
- [ ] Configuration system functional
- [ ] Error classes defined
- [ ] Logger utility working

**Command to validate**:
```bash
npm run build
npm test
npm run lint
```

---

## Phase 2: Data Access Layer (Days 4-7)

### Objective
Implement API client and web scraper with caching

### Tasks

#### 2.1 Implement Cache Service
**Priority**: Critical
**Estimated Time**: 3 hours

**File**: `src/cache/cache-service.ts`
```typescript
import { CacheError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface CacheEntry<T> {
  data: T;
  expiry: number;
}

export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();

  async get<T>(
    key: string,
    ttl: number,
    fetcher: () => Promise<T>
  ): Promise<T> {
    try {
      const cached = this.cache.get(key);

      if (cached && cached.expiry > Date.now()) {
        logger.debug(`Cache hit for key: ${key}`);
        return cached.data;
      }

      logger.debug(`Cache miss for key: ${key}`);
      const data = await fetcher();

      this.cache.set(key, {
        data,
        expiry: Date.now() + ttl
      });

      return data;
    } catch (error) {
      throw new CacheError(`Failed to get cached data for ${key}: ${error.message}`);
    }
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    logger.debug(`Cache invalidated for key: ${key}`);
  }

  clear(): void {
    this.cache.clear();
    logger.info('Cache cleared');
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
```

**Test**: `tests/unit/cache/cache-service.test.ts`
```typescript
import { CacheService } from '../../../src/cache/cache-service';

describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService();
  });

  test('returns cached data on cache hit', async () => {
    const fetcher = jest.fn().mockResolvedValue({ data: 'test' });

    const result1 = await cache.get('test-key', 1000, fetcher);
    const result2 = await cache.get('test-key', 1000, fetcher);

    expect(result1).toEqual({ data: 'test' });
    expect(result2).toEqual({ data: 'test' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  test('fetches fresh data on cache miss', async () => {
    const fetcher = jest.fn().mockResolvedValue({ data: 'fresh' });

    const result = await cache.get('new-key', 1000, fetcher);

    expect(result).toEqual({ data: 'fresh' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  test('invalidates cache entry', async () => {
    const fetcher = jest.fn().mockResolvedValue({ data: 'test' });

    await cache.get('test-key', 1000, fetcher);
    cache.invalidate('test-key');
    await cache.get('test-key', 1000, fetcher);

    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
```

**Deliverable**: Functional cache service with tests

---

#### 2.2 Implement API Client
**Priority**: Critical
**Estimated Time**: 4 hours

**File**: `src/data-access/api-client.ts`
```typescript
import axios, { AxiosInstance } from 'axios';
import { APIError } from '../utils/errors';
import { logger } from '../utils/logger';
import { Config } from '../utils/config';
import {
  RawStatusResponse,
  RawComponent,
  RawIncident
} from '../types/api';

export class APIClient {
  private client: AxiosInstance;
  private config: Config['api'];

  constructor(config: Config['api']) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'F5StatusMCP/1.0'
      }
    });
  }

  async fetchStatus(): Promise<RawStatusResponse> {
    return this.request<RawStatusResponse>('/status.json');
  }

  async fetchComponents(): Promise<RawComponent[]> {
    const response = await this.request<{ components: RawComponent[] }>('/components.json');
    return response.components;
  }

  async fetchIncidents(): Promise<RawIncident[]> {
    const response = await this.request<{ incidents: RawIncident[] }>('/incidents.json');
    return response.incidents;
  }

  async fetchScheduledMaintenances(): Promise<any[]> {
    const response = await this.request<{ scheduled_maintenances: any[] }>(
      '/scheduled-maintenances.json'
    );
    return response.scheduled_maintenances;
  }

  async fetchSummary(): Promise<any> {
    return this.request<any>('/summary.json');
  }

  private async request<T>(endpoint: string): Promise<T> {
    return this.retry(
      async () => {
        try {
          logger.debug(`API request: ${endpoint}`);
          const response = await this.client.get<T>(endpoint);
          logger.debug(`API response received for: ${endpoint}`);
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const statusCode = error.response?.status || 500;
            throw new APIError(
              `API request failed: ${error.message}`,
              statusCode
            );
          }
          throw error;
        }
      },
      this.config.retryAttempts
    );
  }

  private async retry<T>(
    fn: () => Promise<T>,
    attempts: number
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < attempts - 1) {
          const delay = this.config.retryDelay * Math.pow(2, i);
          logger.warn(`Request failed, retrying in ${delay}ms...`, {
            attempt: i + 1,
            maxAttempts: attempts
          });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }
}
```

**Test**: `tests/unit/data-access/api-client.test.ts`
```typescript
import axios from 'axios';
import { APIClient } from '../../../src/data-access/api-client';
import { APIError } from '../../../src/utils/errors';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('APIClient', () => {
  let client: APIClient;

  beforeEach(() => {
    const mockCreate = jest.fn().mockReturnValue({
      get: jest.fn()
    });
    mockedAxios.create = mockCreate;

    client = new APIClient({
      baseUrl: 'https://example.com/api',
      timeout: 5000,
      retryAttempts: 2,
      retryDelay: 100
    });
  });

  test('fetchStatus returns status data', async () => {
    const mockData = {
      status: { indicator: 'none', description: 'All Systems Operational' }
    };

    (client as any).client.get = jest.fn().mockResolvedValue({ data: mockData });

    const result = await client.fetchStatus();

    expect(result).toEqual(mockData);
  });

  test('retries on failure', async () => {
    const mockGet = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: { status: 'ok' } });

    (client as any).client.get = mockGet;

    const result = await client.fetchStatus();

    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ status: 'ok' });
  });
});
```

**Deliverable**: API client with retry logic and tests

---

#### 2.3 Implement Web Scraper (Fallback)
**Priority**: High
**Estimated Time**: 6 hours

**File**: `src/data-access/web-scraper.ts`
```typescript
import { chromium, Browser, Page } from 'playwright';
import { ScraperError } from '../utils/errors';
import { logger } from '../utils/logger';
import { Config } from '../utils/config';
import {
  RawStatusResponse,
  RawComponent
} from '../types/api';

export class WebScraper {
  private config: Config['scraper'];
  private browser: Browser | null = null;

  constructor(config: Config['scraper']) {
    this.config = config;
  }

  async scrapeStatus(): Promise<RawStatusResponse> {
    const page = await this.getPage();

    try {
      await page.goto(this.config.baseUrl, {
        waitUntil: 'networkidle',
        timeout: this.config.timeout
      });

      const data = await page.evaluate(() => {
        const statusEl = document.querySelector('h2');
        const status = statusEl?.textContent?.trim() || '';

        return {
          page: {
            id: 'scraped',
            name: 'F5 Status',
            url: window.location.href,
            updated_at: new Date().toISOString()
          },
          status: {
            indicator: status.includes('Operational') ? 'none' : 'major',
            description: status
          }
        };
      });

      logger.debug('Scraped status data');
      return data;
    } catch (error) {
      throw new ScraperError(`Failed to scrape status: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  async scrapeComponents(): Promise<RawComponent[]> {
    const page = await this.getPage();

    try {
      await page.goto(this.config.baseUrl, {
        waitUntil: 'networkidle',
        timeout: this.config.timeout
      });

      const components = await page.evaluate(() => {
        const containers = document.querySelectorAll('[data-component-id]');
        const results: any[] = [];

        containers.forEach(comp => {
          const id = comp.getAttribute('data-component-id') || '';
          const nameEl = comp.querySelector('.name');
          const statusEl = comp.querySelector('.component-status');

          results.push({
            id,
            name: nameEl?.textContent?.trim() || '',
            status: statusEl?.textContent?.trim() || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            position: 0,
            description: null,
            showcase: false,
            group_id: null,
            page_id: 'scraped',
            group: false,
            only_show_if_degraded: false
          });
        });

        return results;
      });

      logger.debug(`Scraped ${components.length} components`);
      return components;
    } catch (error) {
      throw new ScraperError(`Failed to scrape components: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  private async getPage(): Promise<Page> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: this.config.headless
      });
    }

    return this.browser.newPage();
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
```

**Deliverable**: Web scraper with Playwright

---

#### 2.4 Data Access Facade
**Priority**: Critical
**Estimated Time**: 2 hours

**File**: `src/data-access/index.ts`
```typescript
import { APIClient } from './api-client';
import { WebScraper } from './web-scraper';
import { logger } from '../utils/logger';
import {
  RawStatusResponse,
  RawComponent,
  RawIncident
} from '../types/api';

export class DataAccessLayer {
  constructor(
    private apiClient: APIClient,
    private webScraper: WebScraper,
    private preferAPI: boolean = true
  ) {}

  async fetchStatus(): Promise<RawStatusResponse> {
    if (this.preferAPI) {
      try {
        return await this.apiClient.fetchStatus();
      } catch (error) {
        logger.warn('API failed, falling back to scraper for status');
      }
    }

    return await this.webScraper.scrapeStatus();
  }

  async fetchComponents(): Promise<RawComponent[]> {
    if (this.preferAPI) {
      try {
        return await this.apiClient.fetchComponents();
      } catch (error) {
        logger.warn('API failed, falling back to scraper for components');
      }
    }

    return await this.webScraper.scrapeComponents();
  }

  async fetchIncidents(): Promise<RawIncident[]> {
    return await this.apiClient.fetchIncidents();
  }

  async fetchScheduledMaintenances(): Promise<any[]> {
    return await this.apiClient.fetchScheduledMaintenances();
  }

  async close(): Promise<void> {
    await this.webScraper.close();
  }
}
```

**Deliverable**: Data access facade with fallback logic

---

### Phase 2 Validation

**Checklist**:
- [ ] Cache service implemented and tested
- [ ] API client implemented with retry logic
- [ ] Web scraper implemented with Playwright
- [ ] Data access facade provides fallback
- [ ] All unit tests passing
- [ ] Integration tests for API client working

**Command to validate**:
```bash
npm test -- tests/unit/cache
npm test -- tests/unit/data-access
npm run build
```

---

## Phase 3: Business Logic (Days 8-12)

### Objective
Implement core services (Status, Component, Incident)

### Tasks

#### 3.1 Status Service
**Priority**: Critical
**Estimated Time**: 3 hours

**File**: `src/services/status-service.ts`
```typescript
import { DataAccessLayer } from '../data-access';
import { CacheService } from '../cache/cache-service';
import { OverallStatus, StatusLevel, IndicatorLevel } from '../types/domain';
import { Config } from '../utils/config';

export class StatusService {
  constructor(
    private dataAccess: DataAccessLayer,
    private cache: CacheService,
    private config: Config
  ) {}

  async getOverallStatus(): Promise<OverallStatus> {
    return this.cache.get(
      'overall-status',
      this.config.cache.ttl.status,
      async () => {
        const rawStatus = await this.dataAccess.fetchStatus();

        return {
          status: this.mapStatus(rawStatus.status.indicator),
          indicator: this.mapIndicator(rawStatus.status.indicator),
          description: rawStatus.status.description,
          updated_at: rawStatus.page.updated_at
        };
      }
    );
  }

  private mapStatus(indicator: string): StatusLevel {
    switch (indicator.toLowerCase()) {
      case 'none':
        return 'operational';
      case 'minor':
        return 'degraded';
      case 'major':
        return 'partial_outage';
      case 'critical':
        return 'major_outage';
      default:
        return 'operational';
    }
  }

  private mapIndicator(indicator: string): IndicatorLevel {
    const normalized = indicator.toLowerCase();
    if (['none', 'minor', 'major', 'critical'].includes(normalized)) {
      return normalized as IndicatorLevel;
    }
    return 'none';
  }
}
```

**Test**: `tests/unit/services/status-service.test.ts`

**Deliverable**: Status service with caching

---

#### 3.2 Component Service
**Priority**: Critical
**Estimated Time**: 5 hours

**File**: `src/services/component-service.ts`

**Deliverable**: Component service with filtering and uptime

---

#### 3.3 Incident Service
**Priority**: Critical
**Estimated Time**: 5 hours

**File**: `src/services/incident-service.ts`

**Deliverable**: Incident service with maintenance support

---

### Phase 3 Validation

**Checklist**:
- [ ] All three services implemented
- [ ] Services properly use caching
- [ ] Data transformation logic correct
- [ ] Unit tests for all services passing
- [ ] Integration tests working

---

## Phase 4: MCP Integration (Days 13-17)

### Objective
Implement MCP server and tool handlers

### Tasks

#### 4.1 Tool Definitions
**Priority**: Critical
**Estimated Time**: 2 hours

**File**: `src/tools/index.ts`

**Deliverable**: All 6 tool definitions

---

#### 4.2 Tool Handler
**Priority**: Critical
**Estimated Time**: 4 hours

**File**: `src/tools/handler.ts`

**Deliverable**: Tool execution logic

---

#### 4.3 MCP Server
**Priority**: Critical
**Estimated Time**: 6 hours

**File**: `src/server/index.ts`

**Deliverable**: Complete MCP server

---

### Phase 4 Validation

**Checklist**:
- [ ] MCP server starts successfully
- [ ] All tools registered
- [ ] Tool handler processes requests
- [ ] Responses formatted correctly
- [ ] E2E tests passing

---

## Phase 5: Testing & Documentation (Days 18-25)

### Objective
Complete test coverage and documentation

### Tasks

#### 5.1 Integration Tests
**Priority**: High
**Estimated Time**: 8 hours

**Deliverable**: Complete integration test suite

---

#### 5.2 E2E Tests
**Priority**: High
**Estimated Time**: 6 hours

**Deliverable**: E2E tests with real MCP protocol

---

#### 5.3 Documentation
**Priority**: Medium
**Estimated Time**: 6 hours

**Files**:
- README.md
- API.md
- CONTRIBUTING.md
- CHANGELOG.md

**Deliverable**: Complete documentation

---

#### 5.4 Performance Testing
**Priority**: Medium
**Estimated Time**: 4 hours

**Deliverable**: Performance benchmarks

---

## Deployment Checklist

- [ ] Build process works (`npm run build`)
- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] Documentation complete
- [ ] package.json metadata updated
- [ ] README with installation instructions
- [ ] Claude Desktop configuration documented
- [ ] Example usage provided
- [ ] Error scenarios tested

---

## Success Criteria

### Functional Requirements
✅ All 6 MCP tools implemented and working
✅ API client with retry logic
✅ Web scraper fallback functional
✅ Caching reduces API calls
✅ Error handling comprehensive

### Quality Requirements
✅ Test coverage > 70%
✅ No TypeScript errors
✅ Linting passes
✅ Documentation complete

### Performance Requirements
✅ Overall status < 1s response time
✅ Component list < 2s response time
✅ Cache hit rate > 80%

---

## Post-Implementation

### Maintenance Tasks
- Monitor error logs
- Update dependencies
- Respond to API changes
- Add new features as requested

### Future Enhancements
- Historical data storage
- Webhook notifications
- Dashboard visualization
- Multi-region support
