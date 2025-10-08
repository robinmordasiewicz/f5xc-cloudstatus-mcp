import type { Component, Incident } from '../../../src/types/domain.js';
import { MockAPIClient } from './mock-api-client.js';

/**
 * Mock DataAccessLayer for testing
 */
export class MockDataAccessLayer {
  private apiClient: MockAPIClient;
  private callCounts = new Map<string, number>();

  constructor() {
    this.apiClient = new MockAPIClient();
  }

  // Test control methods
  setApiClient(client: MockAPIClient): void {
    this.apiClient = client;
  }

  getCallCount(method: string): number {
    return this.callCounts.get(method) || 0;
  }

  resetCallCounts(): void {
    this.callCounts.clear();
  }

  private trackCall(method: string): void {
    this.callCounts.set(method, (this.callCounts.get(method) || 0) + 1);
  }

  async getStatus() {
    this.trackCall('getStatus');
    return await this.apiClient.fetchStatus();
  }

  async getSummary() {
    this.trackCall('getSummary');
    return await this.apiClient.fetchSummary();
  }

  async getComponents(): Promise<Component[]> {
    this.trackCall('getComponents');
    const summary = await this.apiClient.fetchSummary();

    return summary.components.map(comp => ({
      id: comp.id,
      name: comp.name,
      status: this.mapComponentStatusToIndicator(comp.status),
      description: comp.description || undefined,
      group: comp.group_id || undefined,
      position: comp.position,
      onlyShowIfDegraded: comp.only_show_if_degraded
    }));
  }

  async getIncidents(): Promise<Incident[]> {
    this.trackCall('getIncidents');
    const response = await this.apiClient.fetchIncidents();

    return response.incidents.map(inc => ({
      id: inc.id,
      name: inc.name,
      status: inc.status,
      impact: inc.impact,
      createdAt: new Date(inc.created_at),
      updatedAt: new Date(inc.updated_at),
      resolvedAt: inc.resolved_at ? new Date(inc.resolved_at) : undefined,
      shortlink: inc.shortlink,
      updates: inc.incident_updates.map(upd => ({
        id: upd.id,
        status: upd.status,
        body: upd.body,
        createdAt: new Date(upd.created_at),
        displayAt: new Date(upd.display_at),
        affectedComponents: upd.affected_components?.map(c => c.code) || []
      })),
      affectedComponents: inc.components.map(c => c.id)
    }));
  }

  async getUnresolvedIncidents() {
    this.trackCall('getUnresolvedIncidents');
    const all = await this.apiClient.fetchIncidents();
    return {
      ...all,
      incidents: all.incidents.filter(i => i.status !== 'resolved' && i.status !== 'postmortem')
    };
  }

  async getScheduledMaintenances() {
    this.trackCall('getScheduledMaintenances');
    return await this.apiClient.fetchMaintenance();
  }

  async getActiveMaintenances() {
    this.trackCall('getActiveMaintenances');
    const all = await this.apiClient.fetchMaintenance();
    return {
      ...all,
      scheduled_maintenances: all.scheduled_maintenances.filter(m => m.status === 'in_progress')
    };
  }

  async getUpcomingMaintenances() {
    this.trackCall('getUpcomingMaintenances');
    const all = await this.apiClient.fetchMaintenance();
    return {
      ...all,
      scheduled_maintenances: all.scheduled_maintenances.filter(m => m.status === 'scheduled')
    };
  }

  // Helper methods
  private mapComponentStatusToIndicator(status: string): 'none' | 'minor' | 'major' | 'critical' {
    switch (status) {
      case 'operational': return 'none';
      case 'degraded_performance': return 'minor';
      case 'partial_outage': return 'major';
      case 'major_outage': return 'critical';
      default: return 'none';
    }
  }
}
