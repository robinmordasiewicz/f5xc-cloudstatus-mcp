# Usage Examples - F5 Cloud Status MCP Server

Real-world examples of using the F5 Cloud Status MCP Server with Claude Desktop.

## Basic Status Checks

### Example 1: Check Overall Status

**You ask:**
> What is the current operational status of F5 Cloud services?

**Claude uses:** `f5-status-get-overall`

**Response:**
```
The F5 Cloud services are currently operational. All systems are running normally with no reported issues. The overall status indicator is "none" (green), meaning there are no service disruptions at this time. Last updated: [timestamp].
```

### Example 2: List All Components

**You ask:**
> Show me all F5 Cloud service components and their current status

**Claude uses:** `f5-status-get-components`

**Response:**
```
I found 148 F5 Cloud components across 6 main categories:

**Distributed Cloud Services** (operational)
- API Gateway: operational
- Load Balancer: operational
- WAF: operational
...

**Summary:**
- Total components: 148
- Operational: 147
- Degraded: 1

The "XC Observability - Metrics" component is experiencing minor issues.
```

## Filtering and Search

### Example 3: Find Degraded Services

**You ask:**
> Are there any F5 Cloud components that are degraded or having issues right now?

**Claude uses:** `f5-status-get-components` with status filters

**Response:**
```
Yes, there is currently 1 component experiencing issues:

**XC Observability - Metrics**
- Status: Minor (degraded performance)
- Group: Distributed Cloud Services
- Description: Intermittent delays in metric collection

All other 147 components are operational.
```

### Example 4: Search for Specific Service

**You ask:**
> What's the status of the API Gateway service?

**Claude uses:** `f5-status-get-component` or `f5-status-search`

**Response:**
```
The F5 Distributed Cloud Services - API Gateway is currently operational with no reported issues.

Component Details:
- ID: component-abc123
- Status: Operational
- Group: Distributed Cloud Services
- Position: 5
- No current incidents affecting this component
```

## Incident Monitoring

### Example 5: Check Active Incidents

**You ask:**
> Are there any active incidents affecting F5 Cloud services?

**Claude uses:** `f5-status-get-incidents` with `unresolved_only: true`

**Response:**
```
Yes, there is currently 1 active incident:

**Incident: XC Observability Metrics Delays**
- Status: Monitoring
- Impact: Minor
- Created: 2 hours ago
- Affected components: XC Observability - Metrics

Latest update (30 minutes ago):
"The issue has been identified and resolved. We are monitoring to ensure stability."

No other active incidents at this time.
```

### Example 6: Recent Incident History

**You ask:**
> Show me all incidents from the past 7 days

**Claude uses:** `f5-status-get-incidents` with `days: 7`

**Response:**
```
There have been 3 incidents in the past 7 days:

1. **XC Observability Metrics Delays** (Minor)
   - Status: Resolved
   - Duration: 2 hours
   - Resolved: 1 hour ago

2. **API Gateway Timeout Issues** (Minor)
   - Status: Resolved
   - Duration: 45 minutes
   - Resolved: 3 days ago

3. **WAF Rule Update Delays** (Minor)
   - Status: Resolved
   - Duration: 1.5 hours
   - Resolved: 5 days ago

All incidents were minor and have been fully resolved.
```

### Example 7: Critical Incidents Only

**You ask:**
> Have there been any critical or major incidents in the last 30 days?

**Claude uses:** `f5-status-get-incidents` with `days: 30` and `impact: critical` / `impact: major`

**Response:**
```
Good news! There have been no critical or major incidents affecting F5 Cloud services in the past 30 days.

All reported incidents (5 total) were classified as minor with quick resolution times (average 90 minutes).
```

## Maintenance Windows

### Example 8: Upcoming Maintenance

**You ask:**
> Are there any scheduled maintenance windows for F5 Cloud services?

**Claude uses:** `f5-status-get-maintenance` with `upcoming_only: true`

**Response:**
```
Yes, there are 2 upcoming maintenance windows scheduled:

1. **Database Infrastructure Upgrade**
   - Scheduled: Tomorrow at 2:00 AM - 4:00 AM UTC
   - Impact: Minor (brief interruptions possible)
   - Affected: Distributed Cloud Services - Data Plane
   - Details: Routine database maintenance for improved performance

2. **Certificate Renewal - Global**
   - Scheduled: Next week, Sunday at 1:00 AM - 3:00 AM UTC
   - Impact: None expected
   - Affected: SSL/TLS services globally
   - Details: Scheduled certificate rotation

Both maintenance windows are during low-traffic periods to minimize impact.
```

### Example 9: Active Maintenance

**You ask:**
> Is there any maintenance happening right now?

**Claude uses:** `f5-status-get-maintenance` with `active_only: true`

**Response:**
```
No, there is no active maintenance currently in progress. All F5 Cloud services are operating normally.

The next scheduled maintenance is in 8 hours (Database Infrastructure Upgrade).
```

## Advanced Queries

### Example 10: Multi-criteria Search

**You ask:**
> Search for anything related to "observability" in F5 Cloud status

**Claude uses:** `f5-status-search` with query "observability"

**Response:**
```
Found 8 results related to "observability":

**Components (5):**
- XC Observability - Metrics
- XC Observability - Logs
- XC Observability - Traces
- XC Observability - Dashboard
- XC Observability - Alerts

**Incidents (1):**
- XC Observability Metrics Delays (currently monitoring)

**Maintenance (2):**
- Observability Backend Upgrade (completed last week)
- Metrics Database Optimization (upcoming next month)

The Observability - Metrics component is currently experiencing minor issues but is being actively monitored.
```

### Example 11: Component Group Query

**You ask:**
> Show me the status of all components in the "Distributed Cloud Services" group

**Claude uses:** `f5-status-get-components` with `group: "Distributed Cloud Services"`

**Response:**
```
There are 45 components in the Distributed Cloud Services group:

**Operational (44):**
- API Gateway
- Load Balancer
- WAF
- VPN Gateway
- DNS Services
... (39 more)

**Degraded (1):**
- XC Observability - Metrics (minor issues)

Group health: 97.8% operational
```

### Example 12: Historical Trend Analysis

**You ask:**
> What's been the reliability of F5 Cloud services over the past 90 days?

**Claude uses:** `f5-status-get-incidents` with `days: 90`

**Response:**
```
F5 Cloud services have maintained excellent reliability over the past 90 days:

**Incident Summary:**
- Total incidents: 12
- Critical: 0
- Major: 1 (Load Balancer issue, resolved in 4 hours)
- Minor: 11 (average resolution time: 105 minutes)

**Most Affected Components:**
- XC Observability services: 4 incidents
- API Gateway: 2 incidents
- WAF: 2 incidents

**Uptime Trend:**
- Overall system availability: 99.97%
- Average time between incidents: 7.5 days
- Fastest resolution: 15 minutes
- Longest incident: 4 hours (major incident)

The service reliability has been strong with rapid incident resolution.
```

## Monitoring Workflows

### Example 13: Daily Status Check

**You ask:**
> Give me a daily status report for F5 Cloud services

**Claude uses:** Multiple tools (`get-overall`, `get-incidents`, `get-maintenance`)

**Response:**
```
**F5 Cloud Daily Status Report - [Date]**

**Overall Status:** ✅ Operational

**Current Issues:**
- 1 minor incident (Observability Metrics - monitoring)

**Active Incidents:** 1 unresolved
**Recent Incidents (24h):** 1 new, 0 resolved
**Upcoming Maintenance (7 days):** 2 scheduled

**Maintenance This Week:**
- Database upgrade: Tomorrow 2-4 AM UTC
- Certificate renewal: Sunday 1-3 AM UTC

**Recommendation:**
Services are stable. Minor observability issue is being monitored. Plan for brief interruptions during tomorrow's database maintenance window.
```

### Example 14: Pre-Deployment Check

**You ask:**
> Before I deploy to F5 Cloud, are there any current issues or upcoming maintenance I should know about?

**Claude uses:** Multiple tools for comprehensive check

**Response:**
```
**Pre-Deployment Status Check:**

✅ **Safe to Deploy:**
- Overall system status: Operational
- All critical services: Operational
- No major or critical incidents active

⚠️ **Awareness Items:**
1. Minor observability metrics delay (won't affect deployments)
2. Scheduled maintenance in 8 hours (Database - may cause brief connectivity blips)

**Recommendation:**
Deploy now is safe. However, if possible, schedule deployment before the maintenance window (starts in 8 hours) or after it completes (10 hours from now) to avoid any potential edge cases during the upgrade.

**Components Status for Deployment:**
- API Gateway: ✅ Operational
- Load Balancer: ✅ Operational
- WAF: ✅ Operational
- VPN Gateway: ✅ Operational

All deployment-critical services are fully operational.
```

## Tips for Effective Queries

**Be specific about timeframes:**
- "incidents in the last 24 hours"
- "maintenance scheduled for next week"
- "status for the past 30 days"

**Ask for summaries:**
- "give me a summary of current issues"
- "overview of service health"
- "quick status check"

**Filter by impact:**
- "any critical incidents?"
- "show only major issues"
- "minor incidents can be ignored"

**Combine queries:**
- "current status and upcoming maintenance"
- "incidents affecting API Gateway services"
- "observability components with recent issues"

The MCP server will intelligently use the appropriate tools to answer your questions!
