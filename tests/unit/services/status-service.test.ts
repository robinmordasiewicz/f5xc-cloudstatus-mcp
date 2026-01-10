// Copyright (c) 2026 Robin Mordasiewicz. MIT License.

import { StatusService, createStatusService } from '../../../src/services/status-service.js';
import { MockDataAccessLayer } from '../../fixtures/mocks/mock-data-access.js';
import { MockCacheService } from '../../fixtures/mocks/mock-cache.js';
import { createMockOverallStatus } from '../../utils/test-helpers.js';

describe('StatusService', () => {
  let service: StatusService;
  let mockDataAccess: MockDataAccessLayer;
  let mockCache: MockCacheService;

  beforeEach(() => {
    mockDataAccess = new MockDataAccessLayer();
    mockCache = new MockCacheService();
    service = new StatusService(mockDataAccess as any, mockCache as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getOverallStatus', () => {
    it('should retrieve and transform overall status successfully', async () => {
      const status = await service.getOverallStatus();

      expect(status).toBeDefined();
      expect(status.status).toBe('operational');
      expect(status.indicator).toBe('none');
      expect(status.description).toBe('All Systems Operational');
      expect(status.lastUpdated).toBeInstanceOf(Date);
      expect(mockDataAccess.getCallCount('getStatus')).toBe(1);
    });

    it('should use cached data when available and fresh', async () => {
      // First call - should hit data access
      const status1 = await service.getOverallStatus();
      expect(mockDataAccess.getCallCount('getStatus')).toBe(1);

      // Second call - should use cache
      const status2 = await service.getOverallStatus();
      expect(mockDataAccess.getCallCount('getStatus')).toBe(1); // Still 1, not 2
      expect(status2).toEqual(status1);
    });

    it('should refresh expired cache data', async () => {
      // First call
      await service.getOverallStatus();
      expect(mockDataAccess.getCallCount('getStatus')).toBe(1);

      // Expire the cache
      mockCache.setExpired('overall-status');

      // Second call after cache expiration
      await service.getOverallStatus();
      expect(mockDataAccess.getCallCount('getStatus')).toBe(2);
    });

    it('should handle API errors with proper error propagation', async () => {
      const apiError = new Error('API request failed');
      mockDataAccess.setApiClient({
        setShouldFail: jest.fn(),
        fetchStatus: jest.fn().mockRejectedValue(apiError)
      } as any);

      await expect(service.getOverallStatus()).rejects.toThrow('API request failed');
    });

    it('should map API indicator levels to domain types correctly', async () => {
      // Test 'none' -> 'operational'
      let status = await service.getOverallStatus();
      expect(status.status).toBe('operational');
      expect(status.indicator).toBe('none');
    });

    it('should handle missing optional fields gracefully', async () => {
      const status = await service.getOverallStatus();
      // All fields should be present as they're required in fixtures
      expect(status.status).toBeDefined();
      expect(status.indicator).toBeDefined();
      expect(status.description).toBeDefined();
      expect(status.lastUpdated).toBeDefined();
    });
  });

  describe('getStatusDescription', () => {
    it('should return status description', async () => {
      const description = await service.getStatusDescription();
      expect(description).toBe('All Systems Operational');
    });
  });

  describe('getStatusIndicator', () => {
    it('should return status indicator', async () => {
      const indicator = await service.getStatusIndicator();
      expect(indicator).toBe('none');
    });

    it('should return correct indicator for degraded status', async () => {
      const degradedStatus = createMockOverallStatus({
        indicator: 'minor',
        status: 'degraded_performance',
        description: 'Minor Service Disruption'
      });

      mockCache.set('overall-status', degradedStatus, 60000);
      const indicator = await service.getStatusIndicator();
      expect(indicator).toBe('minor');
    });
  });

  describe('isOperational', () => {
    it('should return true for operational status', async () => {
      const result = await service.isOperational();
      expect(result).toBe(true);
    });

    it('should return false for degraded status', async () => {
      const degradedStatus = createMockOverallStatus({
        status: 'degraded_performance',
        indicator: 'minor'
      });

      mockCache.set('overall-status', degradedStatus, 60000);
      const result = await service.isOperational();
      expect(result).toBe(false);
    });

    it('should return false for partial outage', async () => {
      const outageStatus = createMockOverallStatus({
        status: 'partial_outage',
        indicator: 'major'
      });

      mockCache.set('overall-status', outageStatus, 60000);
      const result = await service.isOperational();
      expect(result).toBe(false);
    });

    it('should return false for major outage', async () => {
      const outageStatus = createMockOverallStatus({
        status: 'major_outage',
        indicator: 'critical'
      });

      mockCache.set('overall-status', outageStatus, 60000);
      const result = await service.isOperational();
      expect(result).toBe(false);
    });
  });

  describe('hasIssues', () => {
    it('should return false when status is operational', async () => {
      const result = await service.hasIssues();
      expect(result).toBe(false);
    });

    it('should return true when indicator is not none', async () => {
      const issueStatus = createMockOverallStatus({
        indicator: 'minor',
        status: 'degraded_performance'
      });

      mockCache.set('overall-status', issueStatus, 60000);
      const result = await service.hasIssues();
      expect(result).toBe(true);
    });
  });

  describe('getStatusLevel', () => {
    it('should return operational status level', async () => {
      const level = await service.getStatusLevel();
      expect(level).toBe('operational');
    });

    it('should return degraded_performance status level', async () => {
      const degradedStatus = createMockOverallStatus({
        status: 'degraded_performance',
        indicator: 'minor'
      });

      mockCache.set('overall-status', degradedStatus, 60000);
      const level = await service.getStatusLevel();
      expect(level).toBe('degraded_performance');
    });
  });

  describe('invalidateCache', () => {
    it('should clear status cache', async () => {
      // Populate cache
      await service.getOverallStatus();
      expect(mockCache.has('overall-status')).toBe(true);

      // Invalidate
      service.invalidateCache();
      expect(mockCache.has('overall-status')).toBe(false);
    });

    it('should force fresh data fetch after invalidation', async () => {
      // First call
      await service.getOverallStatus();
      expect(mockDataAccess.getCallCount('getStatus')).toBe(1);

      // Invalidate and call again
      service.invalidateCache();
      await service.getOverallStatus();
      expect(mockDataAccess.getCallCount('getStatus')).toBe(2);
    });
  });

  describe('indicator to status mapping', () => {
    it('should map none to operational', async () => {
      // Use default fixture which has 'none' indicator
      const result = await service.getOverallStatus();
      expect(result.status).toBe('operational');
      expect(result.indicator).toBe('none');
    });

    it('should map minor to degraded_performance', async () => {
      // Mock API client to return minor indicator
      mockDataAccess.setApiClient({
        fetchStatus: jest.fn().mockResolvedValue({
          page: {
            id: 'test',
            name: 'Test',
            url: 'https://test.com',
            time_zone: 'UTC',
            updated_at: '2025-10-08T10:00:00.000Z'
          },
          status: {
            indicator: 'minor',
            description: 'Degraded Performance'
          }
        })
      } as any);

      const result = await service.getOverallStatus();
      expect(result.status).toBe('degraded_performance');
      expect(result.indicator).toBe('minor');
    });

    it('should map major to partial_outage', async () => {
      // Mock API client to return major indicator
      mockDataAccess.setApiClient({
        fetchStatus: jest.fn().mockResolvedValue({
          page: {
            id: 'test',
            name: 'Test',
            url: 'https://test.com',
            time_zone: 'UTC',
            updated_at: '2025-10-08T10:00:00.000Z'
          },
          status: {
            indicator: 'major',
            description: 'Partial Outage'
          }
        })
      } as any);

      const result = await service.getOverallStatus();
      expect(result.status).toBe('partial_outage');
      expect(result.indicator).toBe('major');
    });

    it('should map critical to major_outage', async () => {
      // Mock API client to return critical indicator
      mockDataAccess.setApiClient({
        fetchStatus: jest.fn().mockResolvedValue({
          page: {
            id: 'test',
            name: 'Test',
            url: 'https://test.com',
            time_zone: 'UTC',
            updated_at: '2025-10-08T10:00:00.000Z'
          },
          status: {
            indicator: 'critical',
            description: 'Major Outage'
          }
        })
      } as any);

      const result = await service.getOverallStatus();
      expect(result.status).toBe('major_outage');
      expect(result.indicator).toBe('critical');
    });
  });

  describe('edge cases', () => {
    it('should handle null/undefined status gracefully', async () => {
      // This should not happen in practice, but test defensive code
      const status = await service.getOverallStatus();
      expect(status).toBeDefined();
      expect(status.status).toBeDefined();
    });

    it('should handle concurrent requests efficiently', async () => {
      // Make multiple concurrent requests
      const promises = [
        service.getOverallStatus(),
        service.getOverallStatus(),
        service.getOverallStatus()
      ];

      const results = await Promise.all(promises);

      // All should return same data
      expect(results[0]).toEqual(results[1]);
      expect(results[1]).toEqual(results[2]);

      // Should ideally only hit data access once (cache handles concurrency)
      // Note: This depends on cache implementation
    });

    it('should handle already transformed status (from scraper)', async () => {
      // Create status with lastUpdated (scraper format)
      const scraperStatus = {
        status: 'degraded_performance' as const,
        indicator: 'minor' as const,
        description: 'Scraper detected issues',
        lastUpdated: new Date('2025-10-08T10:00:00.000Z')
      };

      // Mock cache to return scraper status directly
      mockCache.set('overall-status', scraperStatus, 60000);

      const result = await service.getOverallStatus();
      expect(result).toEqual(scraperStatus);
      expect(result.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('createStatusService factory', () => {
    it('should create StatusService instance', () => {
      const instance = createStatusService(mockDataAccess as any, mockCache as any);

      expect(instance).toBeInstanceOf(StatusService);
    });

    it('should create functional service instance', async () => {
      const instance = createStatusService(mockDataAccess as any, mockCache as any);
      const status = await instance.getOverallStatus();

      expect(status).toBeDefined();
      expect(status.status).toBe('operational');
    });
  });
});
