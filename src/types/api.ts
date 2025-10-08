/**
 * API response types for Atlassian Statuspage API v2
 * These types represent raw API responses from www.f5cloudstatus.com
 */

/**
 * Raw status API response
 * Endpoint: /api/v2/status.json
 */
export interface RawStatusResponse {
  page: {
    id: string;
    name: string;
    url: string;
    time_zone: string;
    updated_at: string;
  };
  status: {
    indicator: 'none' | 'minor' | 'major' | 'critical';
    description: string;
  };
}

/**
 * Raw summary API response
 * Endpoint: /api/v2/summary.json
 */
export interface RawSummaryResponse {
  page: {
    id: string;
    name: string;
    url: string;
    time_zone: string;
    updated_at: string;
  };
  components: RawComponent[];
  incidents: RawIncident[];
  scheduled_maintenances: RawMaintenance[];
  status: {
    indicator: 'none' | 'minor' | 'major' | 'critical';
    description: string;
  };
}

/**
 * Raw component from API
 */
export interface RawComponent {
  id: string;
  name: string;
  status: 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage';
  created_at: string;
  updated_at: string;
  position: number;
  description: string | null;
  showcase: boolean;
  start_date: string | null;
  group_id: string | null;
  group: boolean;
  only_show_if_degraded: boolean;
  components?: string[];
}

/**
 * Raw component group from API
 */
export interface RawComponentGroup {
  id: string;
  name: string;
  description: string | null;
  position: number;
  components: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Raw incident from API
 */
export interface RawIncident {
  id: string;
  name: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'postmortem';
  created_at: string;
  updated_at: string;
  monitoring_at: string | null;
  resolved_at: string | null;
  impact: 'none' | 'minor' | 'major' | 'critical';
  shortlink: string;
  started_at: string;
  page_id: string;
  incident_updates: RawIncidentUpdate[];
  components: RawComponent[];
}

/**
 * Raw incident update from API
 */
export interface RawIncidentUpdate {
  id: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'postmortem';
  body: string;
  incident_id: string;
  created_at: string;
  updated_at: string;
  display_at: string;
  affected_components: Array<{
    code: string;
    name: string;
    old_status: string;
    new_status: string;
  }> | null;
  deliver_notifications: boolean;
  custom_tweet: string | null;
  tweet_id: string | null;
}

/**
 * Raw scheduled maintenance from API
 */
export interface RawMaintenance {
  id: string;
  name: string;
  status: 'scheduled' | 'in_progress' | 'verifying' | 'completed';
  created_at: string;
  updated_at: string;
  monitoring_at: string | null;
  resolved_at: string | null;
  impact: 'none' | 'minor' | 'major' | 'critical';
  shortlink: string;
  started_at: string;
  page_id: string;
  incident_updates: RawIncidentUpdate[];
  components: RawComponent[];
  scheduled_for: string;
  scheduled_until: string;
}

/**
 * Raw incidents API response
 * Endpoint: /api/v2/incidents.json
 */
export interface RawIncidentsResponse {
  page: {
    id: string;
    name: string;
    url: string;
    time_zone: string;
    updated_at: string;
  };
  incidents: RawIncident[];
}

/**
 * Raw unresolved incidents API response
 * Endpoint: /api/v2/incidents/unresolved.json
 */
export interface RawUnresolvedIncidentsResponse {
  page: {
    id: string;
    name: string;
    url: string;
    time_zone: string;
    updated_at: string;
  };
  incidents: RawIncident[];
}

/**
 * Raw scheduled maintenances API response
 * Endpoint: /api/v2/scheduled-maintenances.json
 */
export interface RawScheduledMaintenancesResponse {
  page: {
    id: string;
    name: string;
    url: string;
    time_zone: string;
    updated_at: string;
  };
  scheduled_maintenances: RawMaintenance[];
}

/**
 * Raw active scheduled maintenances API response
 * Endpoint: /api/v2/scheduled-maintenances/active.json
 */
export interface RawActiveMaintenancesResponse {
  page: {
    id: string;
    name: string;
    url: string;
    time_zone: string;
    updated_at: string;
  };
  scheduled_maintenances: RawMaintenance[];
}

/**
 * Raw upcoming scheduled maintenances API response
 * Endpoint: /api/v2/scheduled-maintenances/upcoming.json
 */
export interface RawUpcomingMaintenancesResponse {
  page: {
    id: string;
    name: string;
    url: string;
    time_zone: string;
    updated_at: string;
  };
  scheduled_maintenances: RawMaintenance[];
}

/**
 * Raw components API response
 * Endpoint: /api/v2/components.json
 */
export interface RawComponentsResponse {
  page: {
    id: string;
    name: string;
    url: string;
    time_zone: string;
    updated_at: string;
  };
  components: RawComponent[];
}
