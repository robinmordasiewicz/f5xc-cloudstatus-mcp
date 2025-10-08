/**
 * Incident Service
 * Business logic for F5 Cloud incidents and maintenance
 */

import { DataAccessLayer } from '../data-access/index.js';
import { CacheService } from '../cache/index.js';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { NotFoundError } from '../utils/errors.js';
import type { Incident, IncidentStatus, IncidentImpact, Maintenance } from '../types/domain.js';
import type { RawIncidentsResponse, RawIncident, RawMaintenance, RawScheduledMaintenancesResponse } from '../types/api.js';

/**
 * Incident Service class
 */
export class IncidentService {
  private dataAccess: DataAccessLayer;
  private cache: CacheService;

  constructor(dataAccess: DataAccessLayer, cache: CacheService) {
    this.dataAccess = dataAccess;
    this.cache = cache;
  }

  /**
   * Get all incidents
   */
  async getAllIncidents(): Promise<Incident[]> {
    logger.debug('Getting all incidents');

    return this.cache.get(
      'all-incidents',
      config.cache.ttlIncidents,
      async () => {
        const rawIncidents = await this.dataAccess.getIncidents();
        return this.transformIncidents(rawIncidents);
      }
    );
  }

  /**
   * Get unresolved incidents
   */
  async getUnresolvedIncidents(): Promise<Incident[]> {
    logger.debug('Getting unresolved incidents');

    return this.cache.get(
      'unresolved-incidents',
      config.cache.ttlIncidents,
      async () => {
        const rawIncidents = await this.dataAccess.getUnresolvedIncidents();
        return rawIncidents.incidents.map((raw) => this.transformIncident(raw));
      }
    );
  }

  /**
   * Get incident by ID
   */
  async getIncidentById(id: string): Promise<Incident> {
    const incidents = await this.getAllIncidents();
    const incident = incidents.find((i) => i.id === id);

    if (!incident) {
      throw new NotFoundError(`Incident not found: ${id}`);
    }

    return incident;
  }

  /**
   * Get incidents by status
   */
  async getIncidentsByStatus(status: IncidentStatus): Promise<Incident[]> {
    const incidents = await this.getAllIncidents();
    return incidents.filter((i) => i.status === status);
  }

  /**
   * Get incidents by impact
   */
  async getIncidentsByImpact(impact: IncidentImpact): Promise<Incident[]> {
    const incidents = await this.getAllIncidents();
    return incidents.filter((i) => i.impact === impact);
  }

  /**
   * Get recent incidents (last N days)
   */
  async getRecentIncidents(days: number = 7): Promise<Incident[]> {
    const incidents = await this.getAllIncidents();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return incidents.filter((i) => i.createdAt >= cutoff);
  }

  /**
   * Check if there are active incidents
   */
  async hasActiveIncidents(): Promise<boolean> {
    const unresolved = await this.getUnresolvedIncidents();
    return unresolved.length > 0;
  }

  /**
   * Get all scheduled maintenances
   */
  async getAllMaintenances(): Promise<Maintenance[]> {
    logger.debug('Getting all maintenances');

    return this.cache.get(
      'all-maintenances',
      config.cache.ttlMaintenance,
      async () => {
        const rawMaintenances = await this.dataAccess.getScheduledMaintenances();
        return this.transformMaintenances(rawMaintenances);
      }
    );
  }

  /**
   * Get active maintenances
   */
  async getActiveMaintenances(): Promise<Maintenance[]> {
    logger.debug('Getting active maintenances');

    return this.cache.get(
      'active-maintenances',
      config.cache.ttlMaintenance,
      async () => {
        const rawMaintenances = await this.dataAccess.getActiveMaintenances();
        return rawMaintenances.scheduled_maintenances.map((raw) =>
          this.transformMaintenance(raw)
        );
      }
    );
  }

  /**
   * Get upcoming maintenances
   */
  async getUpcomingMaintenances(): Promise<Maintenance[]> {
    logger.debug('Getting upcoming maintenances');

    return this.cache.get(
      'upcoming-maintenances',
      config.cache.ttlMaintenance,
      async () => {
        const rawMaintenances = await this.dataAccess.getUpcomingMaintenances();
        return rawMaintenances.scheduled_maintenances.map((raw) =>
          this.transformMaintenance(raw)
        );
      }
    );
  }

  /**
   * Get maintenance by ID
   */
  async getMaintenanceById(id: string): Promise<Maintenance> {
    const maintenances = await this.getAllMaintenances();
    const maintenance = maintenances.find((m) => m.id === id);

    if (!maintenance) {
      throw new NotFoundError(`Maintenance not found: ${id}`);
    }

    return maintenance;
  }

  /**
   * Check if there are active maintenances
   */
  async hasActiveMaintenances(): Promise<boolean> {
    const active = await this.getActiveMaintenances();
    return active.length > 0;
  }

  /**
   * Transform raw incidents to domain model
   */
  private transformIncidents(
    rawIncidents: RawIncidentsResponse | Incident[]
  ): Incident[] {
    // If already transformed (from scraper), return as-is
    if (Array.isArray(rawIncidents)) {
      return rawIncidents;
    }

    // Transform API response
    return rawIncidents.incidents.map((raw) => this.transformIncident(raw));
  }

  /**
   * Transform single raw incident
   */
  private transformIncident(raw: RawIncident): Incident {
    return {
      id: raw.id,
      name: raw.name,
      status: raw.status,
      impact: raw.impact,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
      resolvedAt: raw.resolved_at ? new Date(raw.resolved_at) : undefined,
      shortlink: raw.shortlink,
      updates: raw.incident_updates.map((update) => ({
        id: update.id,
        status: update.status,
        body: update.body,
        createdAt: new Date(update.created_at),
        displayAt: new Date(update.display_at),
        affectedComponents: update.affected_components?.map((c) => c.code) || [],
      })),
      affectedComponents: raw.components.map((c) => c.id),
    };
  }

  /**
   * Transform raw maintenances to domain model
   */
  private transformMaintenances(
    rawMaintenances: RawScheduledMaintenancesResponse
  ): Maintenance[] {
    return rawMaintenances.scheduled_maintenances.map((raw) =>
      this.transformMaintenance(raw)
    );
  }

  /**
   * Transform single raw maintenance
   */
  private transformMaintenance(raw: RawMaintenance): Maintenance {
    return {
      id: raw.id,
      name: raw.name,
      status: raw.status,
      impact: raw.impact,
      scheduledFor: new Date(raw.scheduled_for),
      scheduledUntil: new Date(raw.scheduled_until),
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
      shortlink: raw.shortlink,
      updates: raw.incident_updates.map((update) => ({
        id: update.id,
        status: update.status,
        body: update.body,
        createdAt: new Date(update.created_at),
        displayAt: new Date(update.display_at),
        affectedComponents: update.affected_components?.map((c) => c.code) || [],
      })),
      affectedComponents: raw.components.map((c) => c.id),
    };
  }

  /**
   * Invalidate incidents cache
   */
  invalidateIncidentsCache(): void {
    this.cache.invalidatePattern(/incidents/);
    logger.info('Incidents cache invalidated');
  }

  /**
   * Invalidate maintenances cache
   */
  invalidateMaintenancesCache(): void {
    this.cache.invalidatePattern(/maintenances/);
    logger.info('Maintenances cache invalidated');
  }

  /**
   * Invalidate all caches
   */
  invalidateAllCaches(): void {
    this.invalidateIncidentsCache();
    this.invalidateMaintenancesCache();
  }
}

/**
 * Create incident service instance
 */
export function createIncidentService(
  dataAccess: DataAccessLayer,
  cache: CacheService
): IncidentService {
  return new IncidentService(dataAccess, cache);
}
