// Copyright (c) 2026 Robin Mordasiewicz. MIT License.

/**
 * Type definitions index
 * Re-exports all types for convenient importing
 */

// Domain types
export type {
  StatusLevel,
  IndicatorLevel,
  OverallStatus,
  Component,
  ComponentGroup,
  UptimeData,
  DailyUptimeStat,
  IncidentStatus,
  IncidentImpact,
  Incident,
  IncidentUpdate,
  Maintenance,
} from './domain.js';

// API types
export type {
  RawStatusResponse,
  RawSummaryResponse,
  RawComponent,
  RawComponentGroup,
  RawIncident,
  RawIncidentUpdate,
  RawMaintenance,
  RawIncidentsResponse,
  RawUnresolvedIncidentsResponse,
  RawScheduledMaintenancesResponse,
  RawActiveMaintenancesResponse,
  RawUpcomingMaintenancesResponse,
  RawComponentsResponse,
} from './api.js';
