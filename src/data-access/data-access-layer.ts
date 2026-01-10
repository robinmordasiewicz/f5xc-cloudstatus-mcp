// Copyright (c) 2026 Robin Mordasiewicz. MIT License.

/**
 * Data Access Layer
 * Coordinates between API client and web scraper with automatic fallback
 */

import { APIClient, createAPIClient } from './api-client.js';
import { WebScraper, createWebScraper } from './web-scraper.js';
import { DataUnavailableError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import type {
  RawStatusResponse,
  RawSummaryResponse,
  RawIncidentsResponse,
  RawUnresolvedIncidentsResponse,
  RawScheduledMaintenancesResponse,
  RawActiveMaintenancesResponse,
  RawUpcomingMaintenancesResponse,
  RawComponentsResponse,
} from '../types/api.js';
import type { OverallStatus, Component, Incident } from '../types/domain.js';

/**
 * Data Access Layer class
 */
export class DataAccessLayer {
  private apiClient: APIClient;
  private scraper: WebScraper;
  private useScraperFallback: boolean;

  constructor(useScraperFallback: boolean = true) {
    this.apiClient = createAPIClient();
    this.scraper = createWebScraper();
    this.useScraperFallback = useScraperFallback;
  }

  /**
   * Fetch overall status
   */
  async getStatus(): Promise<RawStatusResponse | OverallStatus> {
    try {
      logger.debug('Fetching status from API');
      return await this.apiClient.fetchStatus();
    } catch (error) {
      logger.warn('API status fetch failed, attempting scraper fallback', error);
      return this.fallbackToScraper(() => this.scraper.scrapeStatus(), 'status');
    }
  }

  /**
   * Fetch summary
   */
  async getSummary(): Promise<RawSummaryResponse> {
    try {
      logger.debug('Fetching summary from API');
      return await this.apiClient.fetchSummary();
    } catch (error) {
      logger.warn('API summary fetch failed', error);
      throw this.createDataUnavailableError('summary', error);
    }
  }

  /**
   * Fetch components
   */
  async getComponents(): Promise<RawComponentsResponse | Component[]> {
    try {
      logger.debug('Fetching components from API');
      return await this.apiClient.fetchComponents();
    } catch (error) {
      logger.warn('API components fetch failed, attempting scraper fallback', error);
      return this.fallbackToScraper(() => this.scraper.scrapeComponents(), 'components');
    }
  }

  /**
   * Fetch incidents
   */
  async getIncidents(): Promise<RawIncidentsResponse | Incident[]> {
    try {
      logger.debug('Fetching incidents from API');
      return await this.apiClient.fetchIncidents();
    } catch (error) {
      logger.warn('API incidents fetch failed, attempting scraper fallback', error);
      return this.fallbackToScraper(() => this.scraper.scrapeIncidents(), 'incidents');
    }
  }

  /**
   * Fetch unresolved incidents
   */
  async getUnresolvedIncidents(): Promise<RawUnresolvedIncidentsResponse> {
    try {
      logger.debug('Fetching unresolved incidents from API');
      return await this.apiClient.fetchUnresolvedIncidents();
    } catch (error) {
      logger.warn('API unresolved incidents fetch failed', error);
      throw this.createDataUnavailableError('unresolved incidents', error);
    }
  }

  /**
   * Fetch scheduled maintenances
   */
  async getScheduledMaintenances(): Promise<RawScheduledMaintenancesResponse> {
    try {
      logger.debug('Fetching scheduled maintenances from API');
      return await this.apiClient.fetchScheduledMaintenances();
    } catch (error) {
      logger.warn('API scheduled maintenances fetch failed', error);
      throw this.createDataUnavailableError('scheduled maintenances', error);
    }
  }

  /**
   * Fetch active maintenances
   */
  async getActiveMaintenances(): Promise<RawActiveMaintenancesResponse> {
    try {
      logger.debug('Fetching active maintenances from API');
      return await this.apiClient.fetchActiveMaintenances();
    } catch (error) {
      logger.warn('API active maintenances fetch failed', error);
      throw this.createDataUnavailableError('active maintenances', error);
    }
  }

  /**
   * Fetch upcoming maintenances
   */
  async getUpcomingMaintenances(): Promise<RawUpcomingMaintenancesResponse> {
    try {
      logger.debug('Fetching upcoming maintenances from API');
      return await this.apiClient.fetchUpcomingMaintenances();
    } catch (error) {
      logger.warn('API upcoming maintenances fetch failed', error);
      throw this.createDataUnavailableError('upcoming maintenances', error);
    }
  }

  /**
   * Fetch all data (status, components, incidents)
   */
  async getAll(): Promise<{
    status: RawStatusResponse | OverallStatus;
    components: RawComponentsResponse | Component[];
    incidents: RawIncidentsResponse | Incident[];
  }> {
    const [status, components, incidents] = await Promise.all([
      this.getStatus(),
      this.getComponents(),
      this.getIncidents(),
    ]);

    return { status, components, incidents };
  }

  /**
   * Close resources
   */
  async close(): Promise<void> {
    await this.scraper.close();
  }

  /**
   * Fallback to scraper if enabled
   */
  private async fallbackToScraper<T>(scraperFn: () => Promise<T>, dataType: string): Promise<T> {
    if (!this.useScraperFallback) {
      throw this.createDataUnavailableError(dataType, 'Scraper fallback disabled');
    }

    try {
      logger.info(`Using scraper fallback for ${dataType}`);
      return await scraperFn();
    } catch (scraperError) {
      logger.error(`Scraper fallback failed for ${dataType}`, scraperError);
      throw this.createDataUnavailableError(dataType, scraperError);
    }
  }

  /**
   * Create data unavailable error
   */
  private createDataUnavailableError(dataType: string, error: unknown): DataUnavailableError {
    return new DataUnavailableError(`Unable to fetch ${dataType} from API or scraper`, {
      dataType,
      error,
    });
  }
}

/**
 * Create data access layer instance
 */
export function createDataAccessLayer(useScraperFallback?: boolean): DataAccessLayer {
  return new DataAccessLayer(useScraperFallback);
}
