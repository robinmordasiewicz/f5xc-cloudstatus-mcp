// Copyright (c) 2026 Robin Mordasiewicz. MIT License.

import { ComponentService, createComponentService } from '../../../src/services/component-service.js';
import { MockDataAccessLayer } from '../../fixtures/mocks/mock-data-access.js';
import { MockCacheService } from '../../fixtures/mocks/mock-cache.js';
import { NotFoundError } from '../../../src/utils/errors.js';

describe('ComponentService', () => {
  let service: ComponentService;
  let mockDataAccess: MockDataAccessLayer;
  let mockCache: MockCacheService;

  beforeEach(() => {
    mockDataAccess = new MockDataAccessLayer();
    mockCache = new MockCacheService();
    service = new ComponentService(mockDataAccess as any, mockCache as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAllComponents', () => {
    it('should retrieve all components successfully', async () => {
      const components = await service.getAllComponents();

      expect(components).toBeDefined();
      expect(Array.isArray(components)).toBe(true);
      expect(components.length).toBe(4);
      expect(mockDataAccess.getCallCount('getComponents')).toBe(1);
    });

    it('should use cached data when available', async () => {
      // First call
      const components1 = await service.getAllComponents();
      expect(mockDataAccess.getCallCount('getComponents')).toBe(1);

      // Second call - should use cache
      const components2 = await service.getAllComponents();
      expect(mockDataAccess.getCallCount('getComponents')).toBe(1); // Still 1
      expect(components2).toEqual(components1);
    });

    it('should transform components with correct structure', async () => {
      const components = await service.getAllComponents();
      const component = components[0];

      expect(component).toHaveProperty('id');
      expect(component).toHaveProperty('name');
      expect(component).toHaveProperty('status');
      expect(component).toHaveProperty('position');
      expect(component).toHaveProperty('onlyShowIfDegraded');
    });

    it('should map component statuses correctly', async () => {
      const components = await service.getAllComponents();

      // component-1: operational -> none
      expect(components[0].status).toBe('none');

      // component-2: degraded_performance -> minor
      expect(components[1].status).toBe('minor');
    });
  });

  describe('getComponentById', () => {
    it('should retrieve component by ID successfully', async () => {
      const component = await service.getComponentById('component-1');

      expect(component).toBeDefined();
      expect(component.id).toBe('component-1');
      expect(component.name).toBe('Distributed Cloud Services - API Gateway');
    });

    it('should throw NotFoundError for non-existent ID', async () => {
      await expect(service.getComponentById('non-existent-id'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should throw NotFoundError with descriptive message', async () => {
      await expect(service.getComponentById('missing'))
        .rejects
        .toThrow('Component not found: missing');
    });
  });

  describe('getComponentByName', () => {
    it('should retrieve component by exact name match', async () => {
      const component = await service.getComponentByName('XC Observability - Metrics');

      expect(component).toBeDefined();
      expect(component.id).toBe('component-2');
      expect(component.name).toBe('XC Observability - Metrics');
    });

    it('should handle case-insensitive name matching', async () => {
      const component = await service.getComponentByName('xc observability - metrics');

      expect(component).toBeDefined();
      expect(component.id).toBe('component-2');
    });

    it('should throw NotFoundError for non-existent name', async () => {
      await expect(service.getComponentByName('Non-Existent Component'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should throw NotFoundError with descriptive message', async () => {
      await expect(service.getComponentByName('Missing'))
        .rejects
        .toThrow('Component not found: Missing');
    });
  });

  describe('getComponentsByStatus', () => {
    it('should filter components by "none" status', async () => {
      const components = await service.getComponentsByStatus('none');

      expect(components.length).toBe(3);
      components.forEach(c => expect(c.status).toBe('none'));
    });

    it('should filter components by "minor" status', async () => {
      const components = await service.getComponentsByStatus('minor');

      expect(components.length).toBe(1);
      expect(components[0].id).toBe('component-2');
      expect(components[0].status).toBe('minor');
    });

    it('should return empty array when no matches', async () => {
      const components = await service.getComponentsByStatus('critical');

      expect(components).toEqual([]);
    });

    it('should filter components by "major" status', async () => {
      const components = await service.getComponentsByStatus('major');
      expect(components.length).toBe(0);
    });
  });

  describe('getComponentsByGroup', () => {
    it('should filter components by group name', async () => {
      const components = await service.getComponentsByGroup('group-1');

      expect(components.length).toBe(3);
      components.forEach(c => expect(c.group).toBe('group-1'));
    });

    it('should filter components by different group', async () => {
      const components = await service.getComponentsByGroup('group-2');

      expect(components.length).toBe(1);
      expect(components[0].id).toBe('component-4');
    });

    it('should return empty array for non-existent group', async () => {
      const components = await service.getComponentsByGroup('non-existent-group');

      expect(components).toEqual([]);
    });
  });

  describe('getDegradedComponents', () => {
    it('should return only non-operational components', async () => {
      const components = await service.getDegradedComponents();

      expect(components.length).toBe(1);
      expect(components[0].id).toBe('component-2');
      expect(components[0].status).not.toBe('none');
    });

    it('should exclude operational components', async () => {
      const components = await service.getDegradedComponents();

      const operationalFound = components.some(c => c.status === 'none');
      expect(operationalFound).toBe(false);
    });
  });

  describe('getOperationalComponents', () => {
    it('should return only operational components', async () => {
      const components = await service.getOperationalComponents();

      expect(components.length).toBe(3);
      components.forEach(c => expect(c.status).toBe('none'));
    });

    it('should exclude degraded components', async () => {
      const components = await service.getOperationalComponents();

      const degradedFound = components.some(c => c.status !== 'none');
      expect(degradedFound).toBe(false);
    });
  });

  describe('getComponentGroups', () => {
    it('should group components correctly', async () => {
      const groups = await service.getComponentGroups();

      expect(groups).toBeDefined();
      expect(Array.isArray(groups)).toBe(true);
      expect(groups.length).toBe(2); // group-1 and group-2
    });

    it('should include component counts per group', async () => {
      const groups = await service.getComponentGroups();

      const group1 = groups.find(g => g.name === 'group-1');
      const group2 = groups.find(g => g.name === 'group-2');

      expect(group1?.components.length).toBe(3);
      expect(group2?.components.length).toBe(1);
    });

    it('should include all components in groups', async () => {
      const groups = await service.getComponentGroups();
      const totalComponents = groups.reduce((sum, g) => sum + g.components.length, 0);

      expect(totalComponents).toBe(4);
    });

    it('should assign group IDs and positions', async () => {
      const groups = await service.getComponentGroups();

      groups.forEach(group => {
        expect(group).toHaveProperty('id');
        expect(group).toHaveProperty('position');
        expect(group.id).toMatch(/^group-\d+$/);
      });
    });
  });

  describe('searchComponents', () => {
    it('should search by partial name match', async () => {
      const components = await service.searchComponents('Observability');

      expect(components.length).toBe(2);
      expect(components[0].name).toContain('Observability');
      expect(components[1].name).toContain('Observability');
    });

    it('should be case-insensitive', async () => {
      const components = await service.searchComponents('observability');

      expect(components.length).toBe(2);
    });

    it('should support regex patterns', async () => {
      const components = await service.searchComponents('XC.*Metrics');

      expect(components.length).toBe(1);
      expect(components[0].id).toBe('component-2');
    });

    it('should return empty array when no matches', async () => {
      const components = await service.searchComponents('NonExistentPattern');

      expect(components).toEqual([]);
    });

    it('should search across all component names', async () => {
      const components = await service.searchComponents('Cloud|WAF');

      expect(components.length).toBeGreaterThan(0);
    });
  });

  describe('getComponentCountByStatus', () => {
    it('should count components by each status', async () => {
      const counts = await service.getComponentCountByStatus();

      expect(counts).toEqual({
        none: 3,
        minor: 1,
        major: 0,
        critical: 0
      });
    });

    it('should include all status levels', async () => {
      const counts = await service.getComponentCountByStatus();

      expect(counts).toHaveProperty('none');
      expect(counts).toHaveProperty('minor');
      expect(counts).toHaveProperty('major');
      expect(counts).toHaveProperty('critical');
    });

    it('should sum to total component count', async () => {
      const counts = await service.getComponentCountByStatus();
      const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

      expect(total).toBe(4);
    });
  });

  describe('isComponentOperational', () => {
    it('should return true for operational component', async () => {
      const isOperational = await service.isComponentOperational('component-1');

      expect(isOperational).toBe(true);
    });

    it('should return false for degraded component', async () => {
      const isOperational = await service.isComponentOperational('component-2');

      expect(isOperational).toBe(false);
    });

    it('should throw NotFoundError for non-existent component', async () => {
      await expect(service.isComponentOperational('non-existent'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('invalidateCache', () => {
    it('should clear components cache', async () => {
      // Populate cache
      await service.getAllComponents();
      expect(mockCache.has('all-components')).toBe(true);

      // Invalidate
      service.invalidateCache();
      expect(mockCache.has('all-components')).toBe(false);
    });

    it('should force fresh data fetch after invalidation', async () => {
      // First call
      await service.getAllComponents();
      expect(mockDataAccess.getCallCount('getComponents')).toBe(1);

      // Invalidate and call again
      service.invalidateCache();
      await service.getAllComponents();
      expect(mockDataAccess.getCallCount('getComponents')).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle empty component list gracefully', async () => {
      // Mock empty response
      mockDataAccess.setApiClient({
        fetchSummary: jest.fn().mockResolvedValue({
          page: { id: 'test', name: 'Test', url: '', time_zone: '', updated_at: '' },
          components: [],
          incidents: [],
          scheduled_maintenances: [],
          status: { indicator: 'none', description: 'OK' }
        })
      } as any);

      const components = await service.getAllComponents();
      expect(components).toEqual([]);

      const groups = await service.getComponentGroups();
      expect(groups).toEqual([]);
    });

    it('should handle components without groups', async () => {
      const groups = await service.getComponentGroups();

      // All our test components have groups, but the method handles ungrouped
      expect(groups.length).toBeGreaterThan(0);
    });

    it('should handle concurrent requests efficiently', async () => {
      const promises = [
        service.getAllComponents(),
        service.getAllComponents(),
        service.getAllComponents()
      ];

      const results = await Promise.all(promises);

      // All should return same data
      expect(results[0]).toEqual(results[1]);
      expect(results[1]).toEqual(results[2]);
    });

    it('should handle components with partial_outage status', async () => {
      mockDataAccess.setApiClient({
        fetchSummary: jest.fn().mockResolvedValue({
          page: { id: 'test', name: 'Test', url: '', time_zone: '', updated_at: '' },
          components: [{
            id: 'comp-outage',
            name: 'Outage Component',
            status: 'partial_outage',
            position: 1,
            group_id: null,
            only_show_if_degraded: false
          }],
          incidents: [],
          scheduled_maintenances: [],
          status: { indicator: 'major', description: 'Partial Outage' }
        })
      } as any);

      const components = await service.getAllComponents();
      expect(components[0].status).toBe('major');
    });

    it('should handle components with major_outage status', async () => {
      mockDataAccess.setApiClient({
        fetchSummary: jest.fn().mockResolvedValue({
          page: { id: 'test', name: 'Test', url: '', time_zone: '', updated_at: '' },
          components: [{
            id: 'comp-critical',
            name: 'Critical Component',
            status: 'major_outage',
            position: 1,
            group_id: null,
            only_show_if_degraded: false
          }],
          incidents: [],
          scheduled_maintenances: [],
          status: { indicator: 'critical', description: 'Major Outage' }
        })
      } as any);

      const components = await service.getAllComponents();
      expect(components[0].status).toBe('critical');
    });

    it('should handle components with unknown status', async () => {
      mockDataAccess.setApiClient({
        fetchSummary: jest.fn().mockResolvedValue({
          page: { id: 'test', name: 'Test', url: '', time_zone: '', updated_at: '' },
          components: [{
            id: 'comp-unknown',
            name: 'Unknown Component',
            status: 'unknown_status',
            position: 1,
            group_id: null,
            only_show_if_degraded: false
          }],
          incidents: [],
          scheduled_maintenances: [],
          status: { indicator: 'none', description: 'OK' }
        })
      } as any);

      const components = await service.getAllComponents();
      expect(components[0].status).toBe('none'); // defaults to 'none'
    });

    it('should handle already transformed components (from scraper)', async () => {
      // Test the scraper fallback path where components are pre-transformed
      // by mocking getComponents to return an array directly
      const scraperComponents = [
        {
          id: 'scraper-comp-1',
          name: 'Scraper Component',
          status: 'minor' as const,
          description: 'From scraper',
          group: 'scraper-group',
          position: 1,
          onlyShowIfDegraded: false
        }
      ];

      // Override the getComponents method to simulate scraper returning pre-transformed data
      jest.spyOn(mockDataAccess, 'getComponents').mockResolvedValue(scraperComponents as any);

      // Clear cache to force fresh fetch
      mockCache.clear();

      const components = await service.getAllComponents();
      expect(components).toEqual(scraperComponents);
      expect(components[0].id).toBe('scraper-comp-1');
    });

    it('should handle "Ungrouped" components in getComponentGroups', async () => {
      // Test components without group assignment
      const ungroupedComponents = [
        {
          id: 'ungrouped-1',
          name: 'Ungrouped Component 1',
          status: 'none' as const,
          position: 1,
          onlyShowIfDegraded: false
        },
        {
          id: 'ungrouped-2',
          name: 'Ungrouped Component 2',
          status: 'none' as const,
          position: 2,
          onlyShowIfDegraded: false
        }
      ];

      jest.spyOn(mockDataAccess, 'getComponents').mockResolvedValue(ungroupedComponents as any);
      mockCache.clear();

      const groups = await service.getComponentGroups();

      // Should create an "Ungrouped" group for components without group field
      const ungroupedGroup = groups.find(g => g.name === 'Ungrouped');
      expect(ungroupedGroup).toBeDefined();
      expect(ungroupedGroup?.components.length).toBe(2);
    });

    it('should handle components without description', async () => {
      mockDataAccess.setApiClient({
        fetchSummary: jest.fn().mockResolvedValue({
          page: { id: 'test', name: 'Test', url: '', time_zone: '', updated_at: '' },
          components: [{
            id: 'comp-no-desc',
            name: 'No Description Component',
            status: 'operational',
            position: 1,
            group_id: null,
            description: null,
            only_show_if_degraded: false
          }],
          incidents: [],
          scheduled_maintenances: [],
          status: { indicator: 'none', description: 'OK' }
        })
      } as any);

      mockCache.clear();

      const components = await service.getAllComponents();
      expect(components[0].description).toBeUndefined();
    });

    it('should handle components without group_id', async () => {
      mockDataAccess.setApiClient({
        fetchSummary: jest.fn().mockResolvedValue({
          page: { id: 'test', name: 'Test', url: '', time_zone: '', updated_at: '' },
          components: [{
            id: 'comp-no-group',
            name: 'No Group Component',
            status: 'operational',
            position: 1,
            group_id: null,
            only_show_if_degraded: false
          }],
          incidents: [],
          scheduled_maintenances: [],
          status: { indicator: 'none', description: 'OK' }
        })
      } as any);

      mockCache.clear();

      const components = await service.getAllComponents();
      expect(components[0].group).toBeUndefined();
    });
  });

  describe('createComponentService factory', () => {
    it('should create ComponentService instance', () => {
      const instance = createComponentService(mockDataAccess as any, mockCache as any);

      expect(instance).toBeInstanceOf(ComponentService);
    });

    it('should create functional service instance', async () => {
      const instance = createComponentService(mockDataAccess as any, mockCache as any);
      const components = await instance.getAllComponents();

      expect(components).toBeDefined();
      expect(Array.isArray(components)).toBe(true);
    });
  });
});
