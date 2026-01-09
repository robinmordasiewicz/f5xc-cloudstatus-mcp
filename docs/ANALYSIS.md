# F5 Cloud Status - Website Analysis & MCP Server Design

## Executive Summary

This document analyzes the F5 Cloud Status website (https://www.f5cloudstatus.com) and proposes an MCP (Model Context Protocol) server design for programmatic access to service status information.

## Website Structure Analysis

### 1. Overall Status
- **Location**: Top-level heading
- **Data**: "All Systems Operational" or degraded status
- **Format**: Plain text status indicator
- **Purpose**: Quick glance at overall system health

### 2. Component Hierarchy

The website organizes services into a hierarchical structure with **148 total components**:

#### Top-Level Service Categories
1. **Services** (22ynq9vg49qm)
   - Core F5 Distributed Cloud services
   - Includes: Portal, Dashboard, App Stack, Secure Mesh, Bot Defense, Client Side Defense, DNS, CDN, Account Protection, NGINX One, etc.

2. **Customer Support, Docs and WebSite** (fr9kjt2hgjkn)
   - Website
   - Customer Support
   - Software Distribution
   - Product Documentation

3. **FedRAMP** (wmm4t37ybgr7)
   - FedRAMP-DNS

4. **Regional PoPs (Points of Presence)**
   - North America PoPs
   - South America PoPs
   - Europe PoPs
   - Asia PoPs
   - Oceania PoPs
   - Middle East PoPs

5. **Legacy Services**
   - Silverline - Legacy
   - Bot and Risk Mgt - Legacy

6. **Internal Testing** ([F5 Internal Under Testing])

### 3. Component Data Structure

Each component contains:

```json
{
  "id": "unique-component-id",
  "name": "Human-readable service name",
  "status": "Operational | Degraded | Down",
  "uptime": "99.97 % uptime" // Optional, only for some components
}
```

**Key Findings**:
- 148 total tracked components
- Each has a unique `data-component-id` attribute
- Status values observed: "Operational"
- Uptime percentages available for major service groups
- Geographic organization (North America, Europe, Asia, South America, Oceania, Middle East)

### 4. Scheduled Maintenance

**Structure**:
```json
{
  "title": "Maintenance description with date/time",
  "link": "URL to detailed incident page",
  "startTime": "ISO 8601 timestamp",
  "endTime": "ISO 8601 timestamp",
  "referenceId": "Internal tracking ID",
  "impact": "Description of expected impact"
}
```

**Current Example**:
- F5 Planned Maintenance for CDN Services Global Controller
- Oct 17, 2025 05:30-10:30 UTC
- Reference ID: SDCCAB-1650

### 5. Past Incidents

**Structure**:
- Organized by date (descending)
- Each day shows either "No incidents" or list of incidents
- Incidents include:
  - Title
  - Link to detailed incident page
  - Timeline of updates with status progression:
    - Investigating → Identified → Update → Monitoring → Resolved

**Incident Status Progression**:
1. **Investigating**: Initial problem detection
2. **Identified**: Root cause found
3. **Update**: Ongoing progress updates
4. **Monitoring**: Fix applied, watching for stability
5. **Resolved**: Issue fully resolved

### 6. Uptime Visualization

- **Format**: SVG graph with tabs representing days
- **Time Range**: 60 days
- **Data Points**: Each tab represents 1 day
- **Visual Indicator**: Color-coded status bars
- **Percentage**: Overall uptime percentage displayed

## Data Extraction Strategy

### HTML/DOM Selectors

```javascript
// Overall Status
document.querySelector('h2').textContent

// Components
document.querySelectorAll('[data-component-id]')
// Each component:
//   - comp.getAttribute('data-component-id')
//   - comp.querySelector('.name').textContent
//   - comp.querySelector('.component-status').textContent
//   - comp.querySelector('.uptime-percent')?.textContent

// Scheduled Maintenance
document.querySelector('.scheduled-maintenance')
//   - .querySelectorAll('.incident-title')

// Past Incidents
document.querySelectorAll('.incident-day')
//   - day.querySelector('.date').textContent
//   - day.querySelectorAll('.incident-title')
```

### API/Backend Discovery

**Platform**: Atlassian Statuspage
- Footer indicates "Powered by Atlassian Statuspage"
- Likely has public API endpoints
- Standard Statuspage API pattern: `https://www.f5cloudstatus.com/api/v2/`

**Potential API Endpoints**:
```
GET /api/v2/status.json              # Overall status
GET /api/v2/components.json          # All components
GET /api/v2/incidents.json           # Recent incidents
GET /api/v2/scheduled-maintenances.json  # Scheduled maintenance
GET /api/v2/summary.json             # Summary data
```

## MCP Server Design

### Tool Specification

#### 1. `f5-status-get-overall`
**Purpose**: Get overall system status
**Parameters**: None
**Returns**:
```typescript
{
  status: "operational" | "degraded" | "partial_outage" | "major_outage",
  indicator: "none" | "minor" | "major" | "critical",
  description: string,
  updated_at: string
}
```

#### 2. `f5-status-list-components`
**Purpose**: List all service components with current status
**Parameters**:
```typescript
{
  category?: string,  // Filter by category (optional)
  status?: string,    // Filter by status (optional)
  includeUptime?: boolean  // Include uptime percentage
}
```
**Returns**:
```typescript
{
  components: Array<{
    id: string,
    name: string,
    status: string,
    group: string,
    uptime?: string
  }>
}
```

#### 3. `f5-status-get-component`
**Purpose**: Get detailed status for a specific component
**Parameters**:
```typescript
{
  componentId: string  // Component ID or name
}
```
**Returns**:
```typescript
{
  id: string,
  name: string,
  status: string,
  group: string,
  uptime: string,
  description: string,
  updated_at: string
}
```

#### 4. `f5-status-list-incidents`
**Purpose**: List recent incidents
**Parameters**:
```typescript
{
  limit?: number,      // Number of incidents to return
  status?: string,     // Filter by status
  daysBack?: number    // How many days to look back
}
```
**Returns**:
```typescript
{
  incidents: Array<{
    id: string,
    name: string,
    status: string,
    impact: string,
    created_at: string,
    updated_at: string,
    shortlink: string,
    updates: Array<{
      status: string,
      body: string,
      created_at: string
    }>
  }>
}
```

#### 5. `f5-status-get-scheduled-maintenance`
**Purpose**: Get upcoming scheduled maintenance windows
**Parameters**:
```typescript
{
  upcoming?: boolean  // Only future maintenance
}
```
**Returns**:
```typescript
{
  maintenance: Array<{
    id: string,
    name: string,
    scheduled_for: string,
    scheduled_until: string,
    status: string,
    impact: string,
    components: string[],
    updates: Array<{
      status: string,
      body: string,
      created_at: string
    }>
  }>
}
```

#### 6. `f5-status-get-uptime`
**Purpose**: Get uptime statistics
**Parameters**:
```typescript
{
  componentId?: string,  // Specific component (optional)
  range?: number         // Days to include (default: 60)
}
```
**Returns**:
```typescript
{
  uptime: {
    percentage: number,
    startDate: string,
    endDate: string,
    dailyStats: Array<{
      date: string,
      uptime: number,
      incidents: number
    }>
  }
}
```

### Implementation Strategy

#### Phase 1: Web Scraping Approach
```typescript
// Use Playwright for reliable data extraction
import { chromium } from 'playwright';

async function extractStatusData(url: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url);

  // Extract data using the selectors identified above
  const data = await page.evaluate(() => {
    // DOM extraction logic
  });

  await browser.close();
  return data;
}
```

#### Phase 2: API Integration (Preferred)
```typescript
// Use Statuspage API if available
const API_BASE = 'https://www.f5cloudstatus.com/api/v2';

async function fetchStatus() {
  const response = await fetch(`${API_BASE}/status.json`);
  return await response.json();
}
```

#### Phase 3: MCP Server Implementation
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: "f5xc-cloudstatus",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "f5-status-get-overall",
      description: "Get overall F5 Cloud service status",
      inputSchema: { type: "object", properties: {} }
    },
    // ... other tools
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Tool implementation
});
```

### Data Refresh Strategy

**Caching**:
- Overall status: Cache for 30 seconds
- Component list: Cache for 60 seconds
- Incidents: Cache for 120 seconds
- Scheduled maintenance: Cache for 300 seconds

**Update Mechanism**:
```typescript
class StatusCache {
  private cache = new Map<string, { data: any, expiry: number }>();

  async get(key: string, ttl: number, fetcher: () => Promise<any>) {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, { data, expiry: Date.now() + ttl });
    return data;
  }
}
```

## Key Observations

### Component Organization
1. **Hierarchical Structure**: Services are organized in parent-child relationships
2. **Geographic Distribution**: PoPs (Points of Presence) organized by continent
3. **Service Categories**: Clear separation between production, legacy, and internal testing
4. **148 Components Total**: Comprehensive coverage of all F5 cloud services

### Status Information Quality
1. **Real-time Status**: Current operational state
2. **Historical Uptime**: 60-day uptime percentages
3. **Incident Timeline**: Detailed progression of issue resolution
4. **Maintenance Windows**: Advance notice with impact assessment

### User Experience Patterns
1. **Collapsible Sections**: Reduces visual clutter
2. **Color Coding**: Quick visual status identification
3. **Uptime Graphs**: Visual representation of service reliability
4. **Detailed Incident Reports**: Transparency in issue communication

## Recommended MCP Tool Priority

### High Priority (MVP)
1. `f5-status-get-overall` - Essential for quick health check
2. `f5-status-list-components` - Core functionality
3. `f5-status-list-incidents` - Critical for awareness

### Medium Priority
4. `f5-status-get-scheduled-maintenance` - Important for planning
5. `f5-status-get-component` - Detailed investigation

### Low Priority (Nice to Have)
6. `f5-status-get-uptime` - Historical analysis

## Next Steps

1. **Verify API Availability**: Test Statuspage API endpoints
2. **Implement Core Tools**: Build MVP with 3 high-priority tools
3. **Add Caching Layer**: Implement efficient data refresh
4. **Error Handling**: Handle network failures, rate limiting
5. **Testing**: Comprehensive test suite with different status scenarios
6. **Documentation**: User guide and API reference

## Technical Considerations

### Rate Limiting
- Implement exponential backoff
- Respect HTTP 429 responses
- Cache aggressively to minimize requests

### Error Scenarios
- Network failures
- API unavailable
- Malformed data
- Component not found

### Security
- No authentication required (public data)
- HTTPS only
- Validate all external data
- Sanitize strings before display

### Performance
- Parallel requests for multiple components
- Batch operations where possible
- Stream large data sets
- Efficient JSON parsing
