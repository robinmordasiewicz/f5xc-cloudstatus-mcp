import type {
  RawStatusResponse,
  RawSummaryResponse,
  RawIncidentsResponse,
  RawScheduledMaintenancesResponse
} from '../../../src/types/api.js';

import statusFixture from '../api-responses/status.json';
import statusDegradedFixture from '../api-responses/status-degraded.json';
import summaryFixture from '../api-responses/summary.json';
import incidentsFixture from '../api-responses/incidents.json';
import maintenanceFixture from '../api-responses/maintenance.json';

/**
 * Mock APIClient for testing
 */
export class MockAPIClient {
  private shouldFail = false;
  private failureError: Error | null = null;
  private delay = 0;
  private callCounts = new Map<string, number>();

  // Test control methods
  setShouldFail(fail: boolean, error?: Error): void {
    this.shouldFail = fail;
    this.failureError = error || new Error('API request failed');
  }

  setDelay(ms: number): void {
    this.delay = ms;
  }

  resetCallCounts(): void {
    this.callCounts.clear();
  }

  getCallCount(method: string): number {
    return this.callCounts.get(method) || 0;
  }

  // Private helper to track calls and handle failures
  private async executeRequest<T>(method: string, response: T): Promise<T> {
    this.callCounts.set(method, (this.callCounts.get(method) || 0) + 1);

    if (this.delay) {
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }

    if (this.shouldFail) {
      throw this.failureError;
    }

    return response;
  }

  async fetchStatus(): Promise<RawStatusResponse> {
    return this.executeRequest('fetchStatus', statusFixture as RawStatusResponse);
  }

  async fetchStatusDegraded(): Promise<RawStatusResponse> {
    return this.executeRequest('fetchStatusDegraded', statusDegradedFixture as RawStatusResponse);
  }

  async fetchSummary(): Promise<RawSummaryResponse> {
    return this.executeRequest('fetchSummary', summaryFixture as RawSummaryResponse);
  }

  async fetchIncidents(): Promise<RawIncidentsResponse> {
    return this.executeRequest('fetchIncidents', incidentsFixture as RawIncidentsResponse);
  }

  async fetchMaintenance(): Promise<RawScheduledMaintenancesResponse> {
    return this.executeRequest('fetchMaintenance', maintenanceFixture as RawScheduledMaintenancesResponse);
  }
}
