# F5 Cloud Status MCP Server - User Guide

A comprehensive guide for using the F5 Cloud Status MCP Server with Claude Desktop to monitor F5 Cloud service health and availability.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Core Concepts](#core-concepts)
4. [Available Tools](#available-tools)
5. [Common Workflows](#common-workflows)
6. [Advanced Usage](#advanced-usage)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## Introduction

### What is the F5 Cloud Status MCP Server?

The F5 Cloud Status MCP Server is a Model Context Protocol (MCP) server that provides real-time monitoring and status information for F5 Cloud services. It enables Claude Desktop to:

- **Monitor service health** across 150+ F5 Cloud components
- **Track incidents** and understand service disruptions
- **View maintenance windows** to plan deployments
- **Search status information** by component, service, or keyword
- **Analyze historical reliability** with incident trends

### Who Should Use This Guide?

This guide is for:

- **DevOps Engineers** managing F5 Cloud deployments
- **Site Reliability Engineers** monitoring service health
- **System Administrators** planning maintenance windows
- **Development Teams** checking pre-deployment status
- **Support Teams** troubleshooting service issues

### Prerequisites

Before using this server, ensure you have:

- **Claude Desktop** installed and configured
- **Node.js 18+** installed on your system
- **Internet connectivity** to access F5 Cloud status API
- **Basic familiarity** with Claude Desktop and MCP concepts

---

## Getting Started

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/robinmordasiewicz/www.f5cloudstatus.com.git
   cd www.f5cloudstatus.com
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the server:**
   ```bash
   npm run build
   ```

### Configuration

1. **Create environment configuration:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your preferences:**
   ```bash
   # API Configuration
   API_BASE_URL=https://www.f5cloudstatus.com/api/v2
   API_TIMEOUT=10000

   # Cache TTL (milliseconds)
   CACHE_TTL_STATUS=30000
   CACHE_TTL_COMPONENTS=60000
   CACHE_TTL_INCIDENTS=120000
   CACHE_TTL_MAINTENANCE=300000

   # Logging
   LOG_LEVEL=info
   ```

3. **Configure Claude Desktop:**

   Open your Claude Desktop configuration file:
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux:** `~/.config/Claude/claude_desktop_config.json`

   Add the server configuration:
   ```json
   {
     "mcpServers": {
       "f5-status": {
         "command": "node",
         "args": [
           "/absolute/path/to/www.f5cloudstatus.com/dist/index.js"
         ]
       }
     }
   }
   ```

4. **Restart Claude Desktop** to load the MCP server

5. **Verify connection:**
   - Look for the 🔌 MCP icon in Claude Desktop
   - Confirm "f5-status" appears as a connected server

### First Query

Try your first status query:

```
What is the current operational status of F5 Cloud services?
```

Claude will use the MCP server to fetch real-time status information and provide a summary.

---

## Core Concepts

### Components

**Components** are individual F5 Cloud services organized into groups:

- **Distributed Cloud Services** - Core platform services (API Gateway, Load Balancer, WAF, etc.)
- **Edge PoPs** - Geographic points of presence (North America, Europe, Asia Pacific, etc.)
- **Bot Defense Services** - Bot protection across multiple cloud providers
- **Network Services** - Proxy, routed, and transit carrier services
- **Observability** - Monitoring, metrics, logging, and alerting services

Each component has:
- **Name** - Human-readable service name
- **Status** - Operational state (operational, degraded, major, critical)
- **Group** - Category or geographic location
- **Description** - Service purpose and details

### Status Levels

The server tracks four status levels:

| Status | Indicator | Meaning |
|--------|-----------|---------|
| **Operational** | `none` (green) | Service functioning normally |
| **Degraded** | `minor` (yellow) | Partial functionality or performance issues |
| **Partial Outage** | `major` (orange) | Significant service disruption |
| **Major Outage** | `critical` (red) | Complete service unavailability |

### Incidents

**Incidents** represent service disruptions with detailed tracking:

- **Status** - Investigation phase (investigating, identified, monitoring, resolved, postmortem)
- **Impact** - Severity level (none, minor, major, critical)
- **Affected Components** - Services impacted by the incident
- **Updates** - Chronological status updates from F5 engineers
- **Timeline** - Creation, update, and resolution timestamps

### Maintenance Windows

**Maintenance windows** are planned service updates:

- **Scheduled** - Future planned maintenance
- **In Progress** - Active maintenance currently underway
- **Verifying** - Maintenance complete, verification in progress
- **Completed** - Maintenance finished successfully

### Caching

The server implements intelligent caching to minimize API calls:

- **Overall Status** - 30 seconds TTL
- **Components** - 60 seconds TTL
- **Incidents** - 2 minutes TTL
- **Maintenance** - 5 minutes TTL

First queries may be slower as data is fetched. Subsequent queries within the TTL window return cached results instantly.

---

## Available Tools

The MCP server provides six tools for monitoring F5 Cloud status:

### 1. f5-status-get-overall

**Get overall service status**

**Purpose:** Quick health check of the entire F5 Cloud platform

**Parameters:** None

**Example Query:**
```
What's the current status of F5 Cloud services?
```

**Response:**
```json
{
  "status": "operational",
  "indicator": "none",
  "description": "All Systems Operational",
  "lastUpdated": "2025-10-08T16:30:00Z",
  "isOperational": true
}
```

**Use Cases:**
- Daily status checks
- Dashboard health indicators
- Pre-deployment validation
- Monitoring automation

---

### 2. f5-status-get-components

**List all service components with status**

**Purpose:** View detailed status across all F5 Cloud components

**Parameters:**
- `status` (optional) - Filter by status: `none`, `minor`, `major`, `critical`
- `group` (optional) - Filter by group name

**Example Queries:**
```
Show me all F5 Cloud components
List degraded F5 services
Show components in the Distributed Cloud Services group
```

**Response:**
```json
{
  "components": [
    {
      "id": "abc123",
      "name": "API Gateway",
      "status": "none",
      "group": "Distributed Cloud Services",
      "description": "API Gateway service"
    }
  ],
  "groups": [
    {
      "name": "Distributed Cloud Services",
      "componentCount": 45
    }
  ],
  "summary": {
    "total": 154,
    "operational": 153,
    "degraded": 1
  }
}
```

**Use Cases:**
- Service inventory
- Health monitoring dashboards
- Identifying degraded services
- Group-based status views

---

### 3. f5-status-get-component

**Get specific component details**

**Purpose:** Deep dive into a single service component

**Parameters:**
- `id` (optional) - Component ID
- `name` (optional) - Component name

**Note:** Either `id` or `name` must be provided

**Example Queries:**
```
What's the status of the API Gateway?
Show me details for component abc123
Check the Load Balancer service status
```

**Response:**
```json
{
  "id": "abc123",
  "name": "API Gateway",
  "status": "none",
  "group": "Distributed Cloud Services",
  "description": "API Gateway service",
  "position": 5,
  "isOperational": true
}
```

**Use Cases:**
- Component-specific monitoring
- Troubleshooting specific services
- Pre-deployment component checks
- Service detail investigation

---

### 4. f5-status-get-incidents

**List recent service incidents**

**Purpose:** Track active and historical service disruptions

**Parameters:**
- `status` (optional) - Filter by status: `investigating`, `identified`, `monitoring`, `resolved`, `postmortem`
- `impact` (optional) - Filter by impact: `none`, `minor`, `major`, `critical`
- `days` (optional) - Days to look back (1-90, default: 7)
- `unresolved_only` (optional) - Show only active incidents (default: false)

**Example Queries:**
```
Are there any active incidents?
Show incidents from the past 30 days
List critical incidents only
What incidents are currently being monitored?
```

**Response:**
```json
{
  "incidents": [
    {
      "id": "inc456",
      "name": "API Gateway Timeout Issues",
      "status": "monitoring",
      "impact": "minor",
      "createdAt": "2025-10-08T14:00:00Z",
      "updatedAt": "2025-10-08T16:00:00Z",
      "shortlink": "https://status.f5.com/incidents/456",
      "affectedComponents": ["abc123"],
      "latestUpdate": {
        "status": "monitoring",
        "body": "Issue resolved, monitoring for stability",
        "timestamp": "2025-10-08T16:00:00Z"
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

**Use Cases:**
- Incident response
- Root cause analysis
- Reliability tracking
- Historical incident review
- Impact assessment

---

### 5. f5-status-get-maintenance

**View scheduled maintenance windows**

**Purpose:** Plan deployments around scheduled maintenance

**Parameters:**
- `status` (optional) - Filter by status: `scheduled`, `in_progress`, `verifying`, `completed`
- `active_only` (optional) - Show only active maintenance (default: false)
- `upcoming_only` (optional) - Show only future maintenance (default: false)

**Example Queries:**
```
Are there any upcoming maintenance windows?
Is maintenance happening now?
Show scheduled maintenance for next week
```

**Response:**
```json
{
  "maintenances": [
    {
      "id": "maint789",
      "name": "Database Infrastructure Upgrade",
      "status": "scheduled",
      "impact": "minor",
      "scheduledFor": "2025-10-09T02:00:00Z",
      "scheduledUntil": "2025-10-09T04:00:00Z",
      "shortlink": "https://status.f5.com/maintenance/789",
      "affectedComponents": ["data-plane-123"],
      "latestUpdate": {
        "status": "scheduled",
        "body": "Scheduled database maintenance",
        "timestamp": "2025-10-08T10:00:00Z"
      }
    }
  ],
  "summary": {
    "total": 2,
    "active": 0,
    "upcoming": 2
  }
}
```

**Use Cases:**
- Deployment planning
- Change management
- Maintenance coordination
- Service window awareness
- Impact mitigation

---

### 6. f5-status-search

**Search across all status information**

**Purpose:** Find components, incidents, or maintenance by keyword

**Parameters:**
- `query` (required) - Search term or pattern
- `type` (optional) - Search scope: `components`, `incidents`, `maintenance`, `all` (default: `all`)

**Example Queries:**
```
Search for anything related to "API Gateway"
Find incidents mentioning "timeout"
Search components for "observability"
```

**Response:**
```json
{
  "query": "api gateway",
  "type": "all",
  "results": {
    "components": [
      {
        "id": "abc123",
        "name": "API Gateway",
        "status": "none",
        "group": "Distributed Cloud Services"
      }
    ],
    "incidents": [
      {
        "id": "inc456",
        "name": "API Gateway Timeout Issues",
        "status": "resolved"
      }
    ],
    "maintenances": []
  },
  "summary": {
    "components": 1,
    "incidents": 1,
    "maintenances": 0,
    "total": 2
  }
}
```

**Use Cases:**
- Quick keyword searches
- Component discovery
- Related incident finding
- Cross-domain investigation
- Information discovery

---

## Common Workflows

### Workflow 1: Daily Status Check

**Goal:** Get a comprehensive daily status report

**Steps:**

1. **Check overall status:**
   ```
   What's the overall F5 Cloud status?
   ```

2. **Identify any issues:**
   ```
   Are there any degraded components?
   ```

3. **Review active incidents:**
   ```
   Show me any unresolved incidents
   ```

4. **Check upcoming maintenance:**
   ```
   Any scheduled maintenance this week?
   ```

**Expected Outcome:**
Complete visibility into current service health, active issues, and planned maintenance.

---

### Workflow 2: Pre-Deployment Check

**Goal:** Validate F5 Cloud readiness before deploying

**Steps:**

1. **Verify critical services:**
   ```
   Check status of API Gateway, Load Balancer, and WAF
   ```

2. **Look for active incidents:**
   ```
   Are there any major or critical incidents right now?
   ```

3. **Check maintenance windows:**
   ```
   Is there any maintenance in the next 12 hours?
   ```

4. **Regional verification:**
   ```
   Show status of North America Edge PoPs
   ```

**Expected Outcome:**
Confidence that F5 Cloud infrastructure is stable for deployment.

---

### Workflow 3: Incident Investigation

**Goal:** Understand and troubleshoot a service issue

**Steps:**

1. **Identify affected component:**
   ```
   What's the status of [service name]?
   ```

2. **Find related incidents:**
   ```
   Search for incidents affecting [service name]
   ```

3. **Review incident timeline:**
   ```
   Show details for incident [ID]
   ```

4. **Check historical patterns:**
   ```
   Show incidents from the past 30 days for [service]
   ```

**Expected Outcome:**
Complete understanding of the incident timeline, impact, and resolution status.

---

### Workflow 4: Reliability Analysis

**Goal:** Assess service reliability over time

**Steps:**

1. **Review incident history:**
   ```
   Show all incidents from the past 90 days
   ```

2. **Analyze by impact:**
   ```
   How many critical incidents occurred?
   ```

3. **Identify patterns:**
   ```
   Which components had the most incidents?
   ```

4. **Calculate availability:**
   ```
   What's the overall uptime trend?
   ```

**Expected Outcome:**
Data-driven reliability assessment and trend identification.

---

### Workflow 5: Maintenance Planning

**Goal:** Plan deployments around maintenance windows

**Steps:**

1. **List upcoming maintenance:**
   ```
   Show all scheduled maintenance
   ```

2. **Check affected services:**
   ```
   What components are affected by maintenance [ID]?
   ```

3. **Assess impact:**
   ```
   What's the expected impact of upcoming maintenance?
   ```

4. **Find safe deployment windows:**
   ```
   When is the next maintenance-free period?
   ```

**Expected Outcome:**
Optimized deployment schedule avoiding maintenance windows.

---

## Advanced Usage

### Multi-Tool Queries

Claude can intelligently combine multiple tools to answer complex questions:

**Example 1: Comprehensive Status Report**
```
Give me a complete status report including current health, active incidents,
and upcoming maintenance
```

Claude will:
1. Call `f5-status-get-overall` for overall status
2. Call `f5-status-get-incidents` with `unresolved_only: true`
3. Call `f5-status-get-maintenance` with `upcoming_only: true`
4. Synthesize results into a comprehensive report

**Example 2: Service-Specific Deep Dive**
```
Tell me everything about the API Gateway - current status, recent incidents,
and any scheduled maintenance
```

Claude will:
1. Call `f5-status-search` with query "API Gateway"
2. Call `f5-status-get-component` for detailed status
3. Call `f5-status-get-incidents` filtered for API Gateway
4. Combine results for complete service overview

### Time-Based Filtering

Use natural language for time-based queries:

```
Show incidents from the last 24 hours
List maintenance scheduled for next week
What happened in the past hour?
Any issues in the last 7 days?
```

### Impact-Based Filtering

Filter by severity or impact:

```
Only show critical incidents
List minor service degradations
Are there any major outages?
Show high-impact maintenance windows
```

### Pattern Matching

Use search patterns for flexible queries:

```
Find anything related to "observability"
Search for components with "gateway" in the name
Look for incidents mentioning "timeout"
```

### Regional Queries

Focus on specific geographic regions:

```
Status of all North America PoPs
Show European edge locations
Check Asia Pacific components
```

### Comparative Analysis

Compare across time periods:

```
Compare incidents this month vs last month
Is reliability improving or declining?
How does this week compare to last week?
```

---

## Troubleshooting

### Server Not Connecting

**Symptoms:**
- 🔌 MCP icon doesn't show "f5-status" as connected
- Error messages in Claude Desktop

**Solutions:**

1. **Verify build:**
   ```bash
   npm run build
   ```

2. **Check path in config:**
   - Ensure absolute path is correct
   - No trailing slashes or spaces

3. **Restart Claude Desktop:**
   - Completely quit and relaunch

4. **Check logs:**
   - Set `LOG_LEVEL=debug` in `.env`
   - Review Claude Desktop logs

### No Data Returned

**Symptoms:**
- Queries timeout or return empty results
- "Service unavailable" messages

**Solutions:**

1. **Verify network connectivity:**
   ```bash
   curl https://www.f5cloudstatus.com/api/v2/status.json
   ```

2. **Check API availability:**
   - Visit https://www.f5cloudstatus.com in browser
   - Confirm website is accessible

3. **Clear cache:**
   - Restart the MCP server
   - Cache will refresh on next query

4. **Check fallback scraper:**
   - Install Playwright browsers: `npx playwright install chromium`
   - Set `SCRAPER_HEADLESS=true` in `.env`

### Slow Performance

**Symptoms:**
- First query takes several seconds
- Subsequent queries are fast

**Solutions:**

1. **This is normal behavior:**
   - Initial data fetch populates cache
   - Subsequent queries use cached data

2. **Adjust cache TTL:**
   ```bash
   # Increase cache duration in .env
   CACHE_TTL_COMPONENTS=300000  # 5 minutes
   ```

3. **Check network latency:**
   - Test API response time directly
   - Consider network conditions

### Error Messages

**Common errors and solutions:**

| Error | Cause | Solution |
|-------|-------|----------|
| "Either id or name must be provided" | Missing required parameter | Provide component ID or name |
| "Component not found" | Invalid component identifier | Verify component name/ID |
| "API request failed" | API unavailable | Server will fallback to scraper |
| "Invalid status filter" | Wrong status value | Use: none, minor, major, critical |
| "Invalid date range" | Days parameter out of range | Use 1-90 for days parameter |

---

## Best Practices

### Query Optimization

**✅ Do:**
- Be specific in your queries
- Use natural language
- Combine related questions
- Leverage time-based filters

**❌ Don't:**
- Over-query (respect cache TTL)
- Use ambiguous terms
- Request unnecessary data

### Deployment Planning

**✅ Do:**
- Check status before every deployment
- Review upcoming maintenance windows
- Verify critical component health
- Monitor during deployment

**❌ Don't:**
- Deploy during active incidents
- Ignore maintenance schedules
- Skip pre-deployment checks
- Assume status without verification

### Incident Response

**✅ Do:**
- Check for active incidents first
- Review incident timeline
- Identify affected components
- Monitor resolution progress

**❌ Don't:**
- Panic without verification
- Ignore minor incidents
- Skip incident history review
- Miss related component issues

### Monitoring Strategies

**✅ Do:**
- Establish daily status checks
- Track reliability trends
- Monitor component groups
- Document incident patterns

**❌ Don't:**
- Rely on memory alone
- Ignore degradation warnings
- Skip historical analysis
- Overlook minor issues

### Security Considerations

**✅ Do:**
- Use official API endpoints
- Keep server updated
- Protect configuration files
- Use HTTPS for all requests

**❌ Don't:**
- Modify API endpoints
- Share credentials
- Expose configuration
- Bypass SSL validation

---

## Quick Reference

### Common Query Patterns

| Task | Example Query |
|------|---------------|
| **Overall Status** | "What's the current F5 Cloud status?" |
| **Component Status** | "Check the API Gateway status" |
| **List Components** | "Show all F5 Cloud components" |
| **Find Issues** | "Are there any degraded services?" |
| **Active Incidents** | "Show active incidents" |
| **Incident History** | "List incidents from the past 30 days" |
| **Upcoming Maintenance** | "Any scheduled maintenance?" |
| **Active Maintenance** | "Is maintenance happening now?" |
| **Search** | "Search for 'observability' issues" |
| **Regional Status** | "Status of North America PoPs" |

### Tool Quick Reference

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `get-overall` | System health | None |
| `get-components` | List services | status, group |
| `get-component` | Service details | id or name |
| `get-incidents` | Track issues | status, impact, days |
| `get-maintenance` | Plan windows | status, active_only |
| `search` | Find information | query, type |

### Status Reference

| Level | Indicator | Color | Meaning |
|-------|-----------|-------|---------|
| Operational | none | 🟢 Green | Normal operation |
| Degraded | minor | 🟡 Yellow | Partial issues |
| Partial Outage | major | 🟠 Orange | Significant disruption |
| Major Outage | critical | 🔴 Red | Complete unavailability |

---

## Support

### Getting Help

**Documentation:**
- [README.md](README.md) - Installation and overview
- [QUICKSTART.md](QUICKSTART.md) - 5-minute setup guide
- [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) - 14 detailed examples
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture
- [DOCUMENTATION.md](DOCUMENTATION.md) - Complete documentation index

**Community:**
- GitHub Issues: https://github.com/robinmordasiewicz/www.f5cloudstatus.com/issues
- Bug Reports: Use GitHub issue tracker
- Feature Requests: Submit via GitHub

**Troubleshooting:**
- Enable debug logging: `LOG_LEVEL=debug`
- Check Claude Desktop logs
- Review server build output
- Test API connectivity

### Contributing

Contributions are welcome! Please:
1. Ensure all tests pass: `npm test`
2. Format code: `npm run format`
3. Lint code: `npm run lint`
4. Maintain coverage: 70% minimum

---

## Appendix

### Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `API_BASE_URL` | https://www.f5cloudstatus.com/api/v2 | API endpoint |
| `API_TIMEOUT` | 10000 | API request timeout (ms) |
| `API_RETRY_ATTEMPTS` | 3 | API retry count |
| `API_RETRY_DELAY` | 1000 | Retry delay (ms) |
| `SCRAPER_BASE_URL` | https://www.f5cloudstatus.com | Scraper URL |
| `SCRAPER_TIMEOUT` | 30000 | Scraper timeout (ms) |
| `SCRAPER_HEADLESS` | true | Headless browser mode |
| `CACHE_TTL_STATUS` | 30000 | Status cache TTL (ms) |
| `CACHE_TTL_COMPONENTS` | 60000 | Components cache TTL (ms) |
| `CACHE_TTL_INCIDENTS` | 120000 | Incidents cache TTL (ms) |
| `CACHE_TTL_MAINTENANCE` | 300000 | Maintenance cache TTL (ms) |
| `LOG_LEVEL` | info | Logging level |

### Claude Desktop Configuration Reference

**macOS:**
```json
{
  "mcpServers": {
    "f5-status": {
      "command": "node",
      "args": [
        "/Users/username/www.f5cloudstatus.com/dist/index.js"
      ]
    }
  }
}
```

**Windows:**
```json
{
  "mcpServers": {
    "f5-status": {
      "command": "node",
      "args": [
        "C:\\Users\\username\\www.f5cloudstatus.com\\dist\\index.js"
      ]
    }
  }
}
```

**Linux:**
```json
{
  "mcpServers": {
    "f5-status": {
      "command": "node",
      "args": [
        "/home/username/www.f5cloudstatus.com/dist/index.js"
      ]
    }
  }
}
```

### Component Groups Reference

**Distributed Cloud Services (45+ components):**
- API Gateway, Load Balancer, WAF, VPN Gateway
- DNS Services, Bot Defense, Client-Side Defense
- App Stack, Secure Mesh, Account Protection
- Observability (Metrics, Logs, Traces, Dashboard, Alerts)

**North America Edge PoPs (14 locations):**
- Ashburn VA, New York NY, San Jose CA, Seattle WA
- Dallas TX, Toronto Canada, Montreal Canada
- Atlanta GA, Miami FL, Chicago IL

**Europe/Middle East Edge PoPs (11 locations):**
- Amsterdam, Frankfurt, London, Paris
- Madrid, Lisbon, Stockholm, Dubai, Tel Aviv

**Asia Pacific Edge PoPs (9 locations):**
- Singapore, Sydney, Melbourne, Tokyo
- Osaka, Hong Kong, Mumbai, Chennai, Jakarta

**Network Services (29+ components):**
- Proxy Services (US West, US East, UK, Germany, Asia)
- Routed Services (Multiple regions)
- Transit Carrier Services
- Regional PoPs (Bahrain, Hong Kong, Montreal, Mumbai, Ohio, São Paulo, Sydney, Tokyo)

**Bot Defense Services (56 locations):**
- AWS regions, GCP regions, Azure regions
- Distributed Cloud Protection Manager (US, EU, CA)
- SAFE deployments

---

**Version:** 1.0.0
**Last Updated:** October 2025
**License:** MIT
