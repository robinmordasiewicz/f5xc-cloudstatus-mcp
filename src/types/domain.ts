/**
 * Domain types for F5 Cloud Status MCP Server
 * These types represent the business domain model
 */

/**
 * Status levels for overall system status
 */
export type StatusLevel = 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage';

/**
 * Indicator levels for component status
 */
export type IndicatorLevel = 'none' | 'minor' | 'major' | 'critical';

/**
 * Overall system status
 */
export interface OverallStatus {
  status: StatusLevel;
  indicator: IndicatorLevel;
  description: string;
  lastUpdated: Date;
}

/**
 * Component representing a service or infrastructure element
 */
export interface Component {
  id: string;
  name: string;
  status: IndicatorLevel;
  description?: string;
  group?: string;
  position: number;
  onlyShowIfDegraded: boolean;
  uptime?: UptimeData;
}

/**
 * Uptime statistics for a component
 */
export interface UptimeData {
  rangeStart: Date;
  rangeEnd: Date;
  uptimePercentage: number;
  majorOutageCount: number;
  partialOutageCount: number;
  dailyStats: DailyUptimeStat[];
}

/**
 * Daily uptime statistics
 */
export interface DailyUptimeStat {
  date: Date;
  uptimePercentage: number;
  majorOutageHours: number;
  partialOutageHours: number;
}

/**
 * Incident status progression
 */
export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'postmortem';

/**
 * Impact level of an incident
 */
export type IncidentImpact = 'none' | 'minor' | 'major' | 'critical';

/**
 * Incident affecting services
 */
export interface Incident {
  id: string;
  name: string;
  status: IncidentStatus;
  impact: IncidentImpact;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  shortlink: string;
  updates: IncidentUpdate[];
  affectedComponents: string[];
}

/**
 * Update posted to an incident
 */
export interface IncidentUpdate {
  id: string;
  status: IncidentStatus;
  body: string;
  createdAt: Date;
  displayAt: Date;
  affectedComponents: string[];
}

/**
 * Scheduled maintenance window
 */
export interface Maintenance {
  id: string;
  name: string;
  status: 'scheduled' | 'in_progress' | 'verifying' | 'completed';
  impact: IncidentImpact;
  scheduledFor: Date;
  scheduledUntil: Date;
  createdAt: Date;
  updatedAt: Date;
  shortlink: string;
  updates: IncidentUpdate[];
  affectedComponents: string[];
}

/**
 * Component group/category
 */
export interface ComponentGroup {
  id: string;
  name: string;
  description?: string;
  position: number;
  components: Component[];
}
