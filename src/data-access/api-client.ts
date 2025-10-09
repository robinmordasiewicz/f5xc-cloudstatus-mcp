/**
 * API client for F5 Cloud Status
 * Implements retry logic with exponential backoff
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { config } from '../utils/config.js';
import { APIError, TimeoutError } from '../utils/errors.js';
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

/**
 * API Client class
 */
export class APIClient {
  private client: AxiosInstance;
  private readonly retryAttempts: number;
  private readonly retryDelay: number;

  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'F5-Status-MCP-Server/1.0',
      },
    });

    this.retryAttempts = config.api.retryAttempts;
    this.retryDelay = config.api.retryDelay;

    // Add request logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`API request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('API request error', error);
        return Promise.reject(error);
      }
    );

    // Add response logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`API response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('API response error', error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Fetch overall status
   */
  async fetchStatus(): Promise<RawStatusResponse> {
    return this.request<RawStatusResponse>('/status.json');
  }

  /**
   * Fetch summary (status, components, incidents, maintenance)
   */
  async fetchSummary(): Promise<RawSummaryResponse> {
    return this.request<RawSummaryResponse>('/summary.json');
  }

  /**
   * Fetch all components
   */
  async fetchComponents(): Promise<RawComponentsResponse> {
    return this.request<RawComponentsResponse>('/components.json');
  }

  /**
   * Fetch all incidents
   */
  async fetchIncidents(): Promise<RawIncidentsResponse> {
    return this.request<RawIncidentsResponse>('/incidents.json');
  }

  /**
   * Fetch unresolved incidents
   */
  async fetchUnresolvedIncidents(): Promise<RawUnresolvedIncidentsResponse> {
    return this.request<RawUnresolvedIncidentsResponse>('/incidents/unresolved.json');
  }

  /**
   * Fetch all scheduled maintenances
   */
  async fetchScheduledMaintenances(): Promise<RawScheduledMaintenancesResponse> {
    return this.request<RawScheduledMaintenancesResponse>('/scheduled-maintenances.json');
  }

  /**
   * Fetch active scheduled maintenances
   */
  async fetchActiveMaintenances(): Promise<RawActiveMaintenancesResponse> {
    return this.request<RawActiveMaintenancesResponse>('/scheduled-maintenances/active.json');
  }

  /**
   * Fetch upcoming scheduled maintenances
   */
  async fetchUpcomingMaintenances(): Promise<RawUpcomingMaintenancesResponse> {
    return this.request<RawUpcomingMaintenancesResponse>('/scheduled-maintenances/upcoming.json');
  }

  /**
   * Make HTTP request with retry logic
   */
  private async request<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
    return this.retry(async () => {
      try {
        const response = await this.client.get<T>(url, options);
        return response.data;
      } catch (error) {
        this.handleError(error, url);
        throw error; // Never reached due to handleError throwing
      }
    });
  }

  /**
   * Retry function with exponential backoff
   */
  private async retry<T>(fn: () => Promise<T>, attempt: number = 0): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= this.retryAttempts) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = this.retryDelay * Math.pow(2, attempt);
      logger.warn(`Retry attempt ${attempt + 1}/${this.retryAttempts} after ${delay}ms`, {
        error: this.getErrorMessage(error),
      });

      await this.sleep(delay);
      return this.retry(fn, attempt + 1);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown, url: string): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Timeout error
      if (axiosError.code === 'ECONNABORTED') {
        throw new TimeoutError(`API request timeout: ${url}`, {
          url,
          timeout: config.api.timeout,
        });
      }

      // Network error
      if (axiosError.code === 'ENOTFOUND' || axiosError.code === 'ECONNREFUSED') {
        throw new APIError(`API network error: ${url}`, {
          url,
          code: axiosError.code,
          message: axiosError.message,
        });
      }

      // HTTP error
      if (axiosError.response) {
        throw new APIError(`API HTTP error: ${axiosError.response.status} ${url}`, {
          url,
          status: axiosError.response.status,
          statusText: axiosError.response.statusText,
          data: axiosError.response.data,
        });
      }

      // Request error
      throw new APIError(`API request error: ${url}`, {
        url,
        message: axiosError.message,
      });
    }

    // Unknown error
    throw new APIError(`Unknown API error: ${url}`, {
      url,
      error: String(error),
    });
  }

  /**
   * Get error message from unknown error
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  /**
   * Sleep helper for retry delay
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Create API client instance
 */
export function createAPIClient(): APIClient {
  return new APIClient();
}
