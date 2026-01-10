// Copyright (c) 2026 Robin Mordasiewicz. MIT License.

import type { Component, Incident, Maintenance, OverallStatus, IncidentUpdate } from '../../src/types/domain.js';

/**
 * Test utilities and helper functions
 */

// Mock domain object creators
export function createMockComponent(overrides?: Partial<Component>): Component {
  return {
    id: 'test-component-id',
    name: 'Test Component',
    status: 'none',
    position: 1,
    onlyShowIfDegraded: false,
    ...overrides
  };
}

export function createMockIncident(overrides?: Partial<Incident>): Incident {
  return {
    id: 'test-incident-id',
    name: 'Test Incident',
    status: 'investigating',
    impact: 'minor',
    createdAt: new Date('2025-01-15T08:00:00.000Z'),
    updatedAt: new Date('2025-01-15T10:00:00.000Z'),
    shortlink: 'https://status.f5.com/test',
    updates: [],
    affectedComponents: [],
    ...overrides
  };
}

export function createMockIncidentUpdate(overrides?: Partial<IncidentUpdate>): IncidentUpdate {
  return {
    id: 'test-update-id',
    status: 'investigating',
    body: 'Test update message',
    createdAt: new Date('2025-01-15T08:00:00.000Z'),
    displayAt: new Date('2025-01-15T08:00:00.000Z'),
    affectedComponents: [],
    ...overrides
  };
}

export function createMockMaintenance(overrides?: Partial<Maintenance>): Maintenance {
  return {
    id: 'test-maintenance-id',
    name: 'Test Maintenance',
    status: 'scheduled',
    impact: 'minor',
    scheduledFor: new Date('2025-01-16T02:00:00.000Z'),
    scheduledUntil: new Date('2025-01-16T04:00:00.000Z'),
    createdAt: new Date('2025-01-10T10:00:00.000Z'),
    updatedAt: new Date('2025-01-10T10:00:00.000Z'),
    shortlink: 'https://status.f5.com/maintenance/test',
    updates: [],
    affectedComponents: [],
    ...overrides
  };
}

export function createMockOverallStatus(overrides?: Partial<OverallStatus>): OverallStatus {
  return {
    status: 'operational',
    indicator: 'none',
    description: 'All Systems Operational',
    lastUpdated: new Date('2025-01-15T10:30:00.000Z'),
    ...overrides
  };
}

// Async testing utilities
export function waitFor(condition: () => boolean, timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      if (condition()) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        reject(new Error('Timeout waiting for condition'));
      }
    }, 100);
  });
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Date utilities for consistent testing
export function mockDate(date: Date | string): void {
  const mockNow = new Date(date).getTime();
  jest.spyOn(Date, 'now').mockReturnValue(mockNow);
}

export function restoreDate(): void {
  jest.restoreAllMocks();
}

// Array utilities
export function expectArrayContains<T>(array: T[], matcher: Partial<T>): boolean {
  return array.some(item =>
    Object.entries(matcher).every(([key, value]) =>
      (item as any)[key] === value
    )
  );
}

export function sortByField<T>(array: T[], field: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
    if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

// Error assertion utilities
export async function expectAsyncError(fn: () => Promise<any>, errorType?: new (...args: any[]) => Error): Promise<Error> {
  try {
    await fn();
    throw new Error('Expected function to throw, but it did not');
  } catch (error) {
    if (errorType && !(error instanceof errorType)) {
      throw new Error(`Expected ${errorType.name} but got ${(error as Error).constructor.name}`);
    }
    return error as Error;
  }
}

// Type guards for testing
export function isOperational(status: OverallStatus): boolean {
  return status.status === 'operational' && status.indicator === 'none';
}

export function isUnresolvedIncident(incident: Incident): boolean {
  return incident.status !== 'resolved' && incident.status !== 'postmortem';
}

export function isActiveMaintenance(maintenance: Maintenance): boolean {
  return maintenance.status === 'in_progress';
}

export function isUpcomingMaintenance(maintenance: Maintenance, now: Date = new Date()): boolean {
  return maintenance.status === 'scheduled' && maintenance.scheduledFor > now;
}
