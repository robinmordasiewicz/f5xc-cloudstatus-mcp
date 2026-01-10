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
 * Generate dynamic dates for test fixtures relative to current time
 */
function getDynamicDates() {
  const now = new Date();
  const daysAgo = (days: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    return date.toISOString();
  };

  return {
    now: now.toISOString(),
    oneDayAgo: daysAgo(1),
    twoDaysAgo: daysAgo(2),
    threeDaysAgo: daysAgo(3),
    sixDaysAgo: daysAgo(6),
    sevenDaysAgo: daysAgo(7),
  };
}

/**
 * Update incident dates to be dynamic relative to current time
 */
function makeDynamicIncidents(fixture: any): RawIncidentsResponse {
  const dates = getDynamicDates();
  const incidents = JSON.parse(JSON.stringify(fixture)) as RawIncidentsResponse;

  // Update page timestamp
  incidents.page.updated_at = dates.now;

  // Update incident-1 (created 6 days ago, updated today)
  if (incidents.incidents[0]) {
    incidents.incidents[0].created_at = dates.sixDaysAgo;
    incidents.incidents[0].updated_at = dates.now;
    incidents.incidents[0].monitoring_at = dates.now;
    incidents.incidents[0].started_at = dates.sixDaysAgo;

    // Update incident-1 updates
    if (incidents.incidents[0].incident_updates[0]) {
      incidents.incidents[0].incident_updates[0].created_at = dates.sixDaysAgo;
      incidents.incidents[0].incident_updates[0].updated_at = dates.sixDaysAgo;
      incidents.incidents[0].incident_updates[0].display_at = dates.sixDaysAgo;
    }
    if (incidents.incidents[0].incident_updates[1]) {
      incidents.incidents[0].incident_updates[1].created_at = dates.twoDaysAgo;
      incidents.incidents[0].incident_updates[1].updated_at = dates.twoDaysAgo;
      incidents.incidents[0].incident_updates[1].display_at = dates.twoDaysAgo;
    }
    if (incidents.incidents[0].incident_updates[2]) {
      incidents.incidents[0].incident_updates[2].created_at = dates.now;
      incidents.incidents[0].incident_updates[2].updated_at = dates.now;
      incidents.incidents[0].incident_updates[2].display_at = dates.now;
    }

    // Update component timestamp
    if (incidents.incidents[0].components[0]) {
      incidents.incidents[0].components[0].updated_at = dates.now;
    }
  }

  // Update incident-2 (created 7 days ago, resolved same day)
  if (incidents.incidents[1]) {
    incidents.incidents[1].created_at = dates.sevenDaysAgo;
    incidents.incidents[1].updated_at = dates.sevenDaysAgo;
    incidents.incidents[1].monitoring_at = dates.sevenDaysAgo;
    incidents.incidents[1].resolved_at = dates.sevenDaysAgo;
    incidents.incidents[1].started_at = dates.sevenDaysAgo;

    // Update incident-2 updates
    if (incidents.incidents[1].incident_updates[0]) {
      incidents.incidents[1].incident_updates[0].created_at = dates.sevenDaysAgo;
      incidents.incidents[1].incident_updates[0].updated_at = dates.sevenDaysAgo;
      incidents.incidents[1].incident_updates[0].display_at = dates.sevenDaysAgo;
    }
  }

  return incidents;
}

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
    const dynamicIncidents = makeDynamicIncidents(incidentsFixture);
    return this.executeRequest('fetchIncidents', dynamicIncidents);
  }

  async fetchMaintenance(): Promise<RawScheduledMaintenancesResponse> {
    return this.executeRequest('fetchMaintenance', maintenanceFixture as RawScheduledMaintenancesResponse);
  }
}
