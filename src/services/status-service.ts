/**
 * Status Service
 * Business logic for overall F5 Cloud status
 */

import { DataAccessLayer } from '../data-access/index.js';
import { CacheService } from '../cache/index.js';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import type { OverallStatus, StatusLevel, IndicatorLevel } from '../types/domain.js';
import type { RawStatusResponse } from '../types/api.js';

/**
 * Status Service class
 */
export class StatusService {
  private dataAccess: DataAccessLayer;
  private cache: CacheService;

  constructor(dataAccess: DataAccessLayer, cache: CacheService) {
    this.dataAccess = dataAccess;
    this.cache = cache;
  }

  /**
   * Get overall status
   */
  async getOverallStatus(): Promise<OverallStatus> {
    logger.debug('Getting overall status');

    return this.cache.get(
      'overall-status',
      config.cache.ttlStatus,
      async () => {
        const rawStatus = await this.dataAccess.getStatus();
        return this.transformStatus(rawStatus);
      }
    );
  }

  /**
   * Get status description
   */
  async getStatusDescription(): Promise<string> {
    const status = await this.getOverallStatus();
    return status.description;
  }

  /**
   * Get status indicator
   */
  async getStatusIndicator(): Promise<IndicatorLevel> {
    const status = await this.getOverallStatus();
    return status.indicator;
  }

  /**
   * Check if system is operational
   */
  async isOperational(): Promise<boolean> {
    const status = await this.getOverallStatus();
    return status.status === 'operational';
  }

  /**
   * Check if system has any issues
   */
  async hasIssues(): Promise<boolean> {
    const status = await this.getOverallStatus();
    return status.indicator !== 'none';
  }

  /**
   * Get status level as human-readable string
   */
  async getStatusLevel(): Promise<StatusLevel> {
    const status = await this.getOverallStatus();
    return status.status;
  }

  /**
   * Transform raw status to domain model
   */
  private transformStatus(
    rawStatus: RawStatusResponse | OverallStatus
  ): OverallStatus {
    // If already transformed (from scraper), return as-is
    if ('lastUpdated' in rawStatus) {
      return rawStatus;
    }

    // Transform API response
    return {
      status: this.mapIndicatorToStatus(rawStatus.status.indicator),
      indicator: rawStatus.status.indicator,
      description: rawStatus.status.description,
      lastUpdated: new Date(rawStatus.page.updated_at),
    };
  }

  /**
   * Map API indicator to status level
   */
  private mapIndicatorToStatus(indicator: IndicatorLevel): StatusLevel {
    switch (indicator) {
      case 'none':
        return 'operational';
      case 'minor':
        return 'degraded_performance';
      case 'major':
        return 'partial_outage';
      case 'critical':
        return 'major_outage';
    }
  }

  /**
   * Invalidate status cache
   */
  invalidateCache(): void {
    this.cache.delete('overall-status');
    logger.info('Status cache invalidated');
  }
}

/**
 * Create status service instance
 */
export function createStatusService(
  dataAccess: DataAccessLayer,
  cache: CacheService
): StatusService {
  return new StatusService(dataAccess, cache);
}
