import { IncidentService, createIncidentService } from '../../../src/services/incident-service.js';
import { MockDataAccessLayer } from '../../fixtures/mocks/mock-data-access.js';
import { MockCacheService } from '../../fixtures/mocks/mock-cache.js';
import { NotFoundError } from '../../../src/utils/errors.js';

describe('IncidentService', () => {
  let service: IncidentService;
  let mockDataAccess: MockDataAccessLayer;
  let mockCache: MockCacheService;

  beforeEach(() => {
    mockDataAccess = new MockDataAccessLayer();
    mockCache = new MockCacheService();
    service = new IncidentService(mockDataAccess as any, mockCache as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAllIncidents', () => {
    it('should retrieve all incidents successfully', async () => {
      const incidents = await service.getAllIncidents();

      expect(incidents).toBeDefined();
      expect(Array.isArray(incidents)).toBe(true);
      expect(incidents.length).toBe(2);
      expect(mockDataAccess.getCallCount('getIncidents')).toBe(1);
    });

    it('should use cached data when available', async () => {
      // First call
      const incidents1 = await service.getAllIncidents();
      expect(mockDataAccess.getCallCount('getIncidents')).toBe(1);

      // Second call - should use cache
      const incidents2 = await service.getAllIncidents();
      expect(mockDataAccess.getCallCount('getIncidents')).toBe(1); // Still 1
      expect(incidents2).toEqual(incidents1);
    });

    it('should transform incidents with correct structure', async () => {
      const incidents = await service.getAllIncidents();
      const incident = incidents[0];

      expect(incident).toHaveProperty('id');
      expect(incident).toHaveProperty('name');
      expect(incident).toHaveProperty('status');
      expect(incident).toHaveProperty('impact');
      expect(incident).toHaveProperty('createdAt');
      expect(incident).toHaveProperty('updatedAt');
      expect(incident).toHaveProperty('shortlink');
      expect(incident).toHaveProperty('updates');
      expect(incident).toHaveProperty('affectedComponents');
    });

    it('should parse dates correctly', async () => {
      const incidents = await service.getAllIncidents();
      const incident = incidents[0];

      expect(incident.createdAt).toBeInstanceOf(Date);
      expect(incident.updatedAt).toBeInstanceOf(Date);
    });

    it('should include incident updates', async () => {
      const incidents = await service.getAllIncidents();
      const incident = incidents[0];

      expect(incident.updates).toBeDefined();
      expect(Array.isArray(incident.updates)).toBe(true);
      expect(incident.updates.length).toBeGreaterThan(0);
    });
  });

  describe('getUnresolvedIncidents', () => {
    it('should retrieve only unresolved incidents', async () => {
      const incidents = await service.getUnresolvedIncidents();

      expect(incidents.length).toBe(1);
      expect(incidents[0].status).toBe('monitoring');
      expect(incidents[0].id).toBe('incident-1');
    });

    it('should exclude resolved incidents', async () => {
      const incidents = await service.getUnresolvedIncidents();

      const resolvedFound = incidents.some(i => i.status === 'resolved');
      expect(resolvedFound).toBe(false);
    });

    it('should use cached data when available', async () => {
      // First call
      await service.getUnresolvedIncidents();
      expect(mockDataAccess.getCallCount('getUnresolvedIncidents')).toBe(1);

      // Second call - should use cache
      await service.getUnresolvedIncidents();
      expect(mockDataAccess.getCallCount('getUnresolvedIncidents')).toBe(1);
    });
  });

  describe('getIncidentById', () => {
    it('should retrieve incident by ID successfully', async () => {
      const incident = await service.getIncidentById('incident-1');

      expect(incident).toBeDefined();
      expect(incident.id).toBe('incident-1');
      expect(incident.name).toBe('XC Observability Metrics Delays');
    });

    it('should throw NotFoundError for non-existent ID', async () => {
      await expect(service.getIncidentById('non-existent-id'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should throw NotFoundError with descriptive message', async () => {
      await expect(service.getIncidentById('missing'))
        .rejects
        .toThrow('Incident not found: missing');
    });
  });

  describe('getIncidentsByStatus', () => {
    it('should filter incidents by monitoring status', async () => {
      const incidents = await service.getIncidentsByStatus('monitoring');

      expect(incidents.length).toBe(1);
      expect(incidents[0].status).toBe('monitoring');
    });

    it('should filter incidents by resolved status', async () => {
      const incidents = await service.getIncidentsByStatus('resolved');

      expect(incidents.length).toBe(1);
      expect(incidents[0].status).toBe('resolved');
    });

    it('should return empty array when no matches', async () => {
      const incidents = await service.getIncidentsByStatus('investigating');

      expect(incidents).toEqual([]);
    });
  });

  describe('getIncidentsByImpact', () => {
    it('should filter incidents by minor impact', async () => {
      const incidents = await service.getIncidentsByImpact('minor');

      expect(incidents.length).toBe(2);
      incidents.forEach(i => expect(i.impact).toBe('minor'));
    });

    it('should return empty array for impacts with no incidents', async () => {
      const incidents = await service.getIncidentsByImpact('critical');

      expect(incidents).toEqual([]);
    });
  });

  describe('getRecentIncidents', () => {
    it('should get incidents from last 7 days by default', async () => {
      const incidents = await service.getRecentIncidents();

      expect(incidents).toBeDefined();
      expect(Array.isArray(incidents)).toBe(true);
      // Both test incidents are recent
      expect(incidents.length).toBeGreaterThan(0);
    });

    it('should filter by custom number of days', async () => {
      const incidents = await service.getRecentIncidents(30);

      expect(incidents).toBeDefined();
      expect(incidents.length).toBeGreaterThan(0);
    });

    it('should exclude old incidents', async () => {
      const incidents = await service.getRecentIncidents(0);

      // No incidents from today
      expect(incidents.length).toBe(0);
    });
  });

  describe('hasActiveIncidents', () => {
    it('should return true when unresolved incidents exist', async () => {
      const hasActive = await service.hasActiveIncidents();

      expect(hasActive).toBe(true);
    });

    it('should check unresolved incidents', async () => {
      await service.hasActiveIncidents();

      expect(mockDataAccess.getCallCount('getUnresolvedIncidents')).toBeGreaterThan(0);
    });
  });

  describe('getAllMaintenances', () => {
    it('should retrieve all maintenance windows', async () => {
      const maintenances = await service.getAllMaintenances();

      expect(maintenances).toBeDefined();
      expect(Array.isArray(maintenances)).toBe(true);
      expect(maintenances.length).toBe(1);
      expect(mockDataAccess.getCallCount('getScheduledMaintenances')).toBe(1);
    });

    it('should use cached data when available', async () => {
      // First call
      const maint1 = await service.getAllMaintenances();
      expect(mockDataAccess.getCallCount('getScheduledMaintenances')).toBe(1);

      // Second call - should use cache
      const maint2 = await service.getAllMaintenances();
      expect(mockDataAccess.getCallCount('getScheduledMaintenances')).toBe(1);
      expect(maint2).toEqual(maint1);
    });

    it('should transform maintenances with correct structure', async () => {
      const maintenances = await service.getAllMaintenances();
      const maintenance = maintenances[0];

      expect(maintenance).toHaveProperty('id');
      expect(maintenance).toHaveProperty('name');
      expect(maintenance).toHaveProperty('status');
      expect(maintenance).toHaveProperty('scheduledFor');
      expect(maintenance).toHaveProperty('scheduledUntil');
      expect(maintenance).toHaveProperty('updates');
    });

    it('should parse scheduling dates correctly', async () => {
      const maintenances = await service.getAllMaintenances();
      const maintenance = maintenances[0];

      expect(maintenance.scheduledFor).toBeInstanceOf(Date);
      expect(maintenance.scheduledUntil).toBeInstanceOf(Date);
    });
  });

  describe('getActiveMaintenances', () => {
    it('should retrieve only active maintenances', async () => {
      const maintenances = await service.getActiveMaintenances();

      expect(maintenances).toBeDefined();
      expect(Array.isArray(maintenances)).toBe(true);
    });

    it('should use cached data when available', async () => {
      // First call
      await service.getActiveMaintenances();
      expect(mockDataAccess.getCallCount('getActiveMaintenances')).toBe(1);

      // Second call - should use cache
      await service.getActiveMaintenances();
      expect(mockDataAccess.getCallCount('getActiveMaintenances')).toBe(1);
    });

    it('should filter by in_progress status', async () => {
      const maintenances = await service.getActiveMaintenances();

      // No in_progress in fixtures
      expect(maintenances.length).toBe(0);
    });
  });

  describe('getUpcomingMaintenances', () => {
    it('should retrieve only scheduled maintenances', async () => {
      const maintenances = await service.getUpcomingMaintenances();

      expect(maintenances).toBeDefined();
      expect(Array.isArray(maintenances)).toBe(true);
      expect(maintenances.length).toBe(1);
    });

    it('should use cached data when available', async () => {
      // First call
      await service.getUpcomingMaintenances();
      expect(mockDataAccess.getCallCount('getUpcomingMaintenances')).toBe(1);

      // Second call - should use cache
      await service.getUpcomingMaintenances();
      expect(mockDataAccess.getCallCount('getUpcomingMaintenances')).toBe(1);
    });

    it('should filter by scheduled status', async () => {
      const maintenances = await service.getUpcomingMaintenances();

      maintenances.forEach(m => expect(m.status).toBe('scheduled'));
    });
  });

  describe('getMaintenanceById', () => {
    it('should retrieve maintenance by ID successfully', async () => {
      const maintenance = await service.getMaintenanceById('maintenance-1');

      expect(maintenance).toBeDefined();
      expect(maintenance.id).toBe('maintenance-1');
      expect(maintenance.name).toBe('Database Infrastructure Upgrade');
    });

    it('should throw NotFoundError for non-existent ID', async () => {
      await expect(service.getMaintenanceById('non-existent-id'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should throw NotFoundError with descriptive message', async () => {
      await expect(service.getMaintenanceById('missing'))
        .rejects
        .toThrow('Maintenance not found: missing');
    });
  });

  describe('hasActiveMaintenances', () => {
    it('should return false when no active maintenances', async () => {
      const hasActive = await service.hasActiveMaintenances();

      expect(hasActive).toBe(false);
    });

    it('should check active maintenances', async () => {
      await service.hasActiveMaintenances();

      expect(mockDataAccess.getCallCount('getActiveMaintenances')).toBeGreaterThan(0);
    });
  });

  describe('invalidateIncidentsCache', () => {
    it('should invalidate incidents cache using pattern', async () => {
      // Populate caches
      await service.getAllIncidents();
      await service.getUnresolvedIncidents();

      expect(mockCache.has('all-incidents')).toBe(true);
      expect(mockCache.has('unresolved-incidents')).toBe(true);

      // Invalidate
      service.invalidateIncidentsCache();

      expect(mockCache.has('all-incidents')).toBe(false);
      expect(mockCache.has('unresolved-incidents')).toBe(false);
    });
  });

  describe('invalidateMaintenancesCache', () => {
    it('should invalidate maintenances cache using pattern', async () => {
      // Populate caches
      await service.getAllMaintenances();
      await service.getActiveMaintenances();

      expect(mockCache.has('all-maintenances')).toBe(true);
      expect(mockCache.has('active-maintenances')).toBe(true);

      // Invalidate
      service.invalidateMaintenancesCache();

      expect(mockCache.has('all-maintenances')).toBe(false);
      expect(mockCache.has('active-maintenances')).toBe(false);
    });
  });

  describe('invalidateAllCaches', () => {
    it('should invalidate both incidents and maintenances caches', async () => {
      // Populate all caches
      await service.getAllIncidents();
      await service.getAllMaintenances();

      expect(mockCache.has('all-incidents')).toBe(true);
      expect(mockCache.has('all-maintenances')).toBe(true);

      // Invalidate all
      service.invalidateAllCaches();

      expect(mockCache.has('all-incidents')).toBe(false);
      expect(mockCache.has('all-maintenances')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle incidents without affected components', async () => {
      const incidents = await service.getAllIncidents();

      // Check that affectedComponents is always an array
      incidents.forEach(i => {
        expect(Array.isArray(i.affectedComponents)).toBe(true);
      });
    });

    it('should handle incidents without resolved date', async () => {
      const incidents = await service.getAllIncidents();
      const unresolved = incidents.find(i => i.status !== 'resolved');

      expect(unresolved?.resolvedAt).toBeUndefined();
    });

    it('should handle concurrent requests efficiently', async () => {
      const promises = [
        service.getAllIncidents(),
        service.getAllIncidents(),
        service.getAllIncidents()
      ];

      const results = await Promise.all(promises);

      // All should return same data
      expect(results[0]).toEqual(results[1]);
      expect(results[1]).toEqual(results[2]);
    });

    it('should handle already transformed incidents (from scraper)', async () => {
      // Test the scraper fallback path where incidents are pre-transformed
      const scraperIncidents = [
        {
          id: 'scraper-inc-1',
          name: 'Scraper Incident',
          status: 'investigating' as const,
          impact: 'major' as const,
          createdAt: new Date('2025-10-08T10:00:00.000Z'),
          updatedAt: new Date('2025-10-08T11:00:00.000Z'),
          shortlink: 'https://status.com/incidents/scraper-inc-1',
          updates: [],
          affectedComponents: []
        }
      ];

      jest.spyOn(mockDataAccess, 'getIncidents').mockResolvedValue(scraperIncidents as any);
      mockCache.clear();

      const incidents = await service.getAllIncidents();
      expect(incidents).toEqual(scraperIncidents);
      expect(incidents[0].id).toBe('scraper-inc-1');
    });

  });

  describe('createIncidentService factory', () => {
    it('should create IncidentService instance', () => {
      const instance = createIncidentService(mockDataAccess as any, mockCache as any);

      expect(instance).toBeInstanceOf(IncidentService);
    });

    it('should create functional service instance', async () => {
      const instance = createIncidentService(mockDataAccess as any, mockCache as any);
      const incidents = await instance.getAllIncidents();

      expect(incidents).toBeDefined();
      expect(Array.isArray(incidents)).toBe(true);
    });
  });
});
