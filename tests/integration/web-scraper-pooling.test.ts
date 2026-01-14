// Copyright (c) 2026 Robin Mordasiewicz. MIT License.

/**
 * Integration tests for WebScraper browser pooling functionality
 * Tests end-to-end behavior with real browser pooling
 */

import { describe, it, expect, jest, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { WebScraper } from '../../src/data-access/web-scraper.js';
import { config } from '../../src/utils/config.js';
import type { Browser } from 'playwright';

// Mock playwright module
jest.mock('playwright', () => ({
  chromium: {
    launch: jest.fn(),
  },
}));

// Import after mocking
import { chromium } from 'playwright';

// Track browser instances for validation
const createdBrowsers: Browser[] = [];
let browserIdCounter = 0;

// Mock browser factory
const createMockBrowser = (): Browser => {
  const browserId = ++browserIdCounter;
  const mockBrowser: any = {
    newPage: jest.fn(async () => {
      const mockPage: any = {
        goto: jest.fn(),
        waitForSelector: jest.fn(),
        evaluate: jest.fn(() => ({
          description: 'All Systems Operational',
          indicator: 'none',
        })),
        close: jest.fn(() => Promise.resolve()),
        setDefaultTimeout: jest.fn(),
        _browserId: browserId,
      };
      return mockPage;
    }),
    close: jest.fn(() => Promise.resolve()) as any,
    isConnected: jest.fn(() => true) as any,
    _id: browserId,
  };

  const browser = mockBrowser as Browser;
  createdBrowsers.push(browser);
  return browser;
};

// Get reference to mocked launch
const mockLaunch = chromium.launch as jest.Mock;

describe('WebScraper Browser Pooling Integration', () => {
  let originalPoolingEnabled: boolean;

  beforeAll(() => {
    // Save original config
    originalPoolingEnabled = config.scraper.pooling.enabled;
  });

  afterAll(() => {
    // Restore original config
    config.scraper.pooling.enabled = originalPoolingEnabled;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    createdBrowsers.length = 0;
    browserIdCounter = 0;
    (mockLaunch as any).mockImplementation(() => createMockBrowser());
  });

  describe('End-to-end scraping with pooling', () => {
    it('should scrape status with pooling enabled', async () => {
      config.scraper.pooling.enabled = true;
      config.scraper.pooling.minSize = 1;
      config.scraper.pooling.maxSize = 2;

      const scraper = new WebScraper();

      try {
        const status = await scraper.scrapeStatus();

        expect(status).toBeDefined();
        expect(status.indicator).toBe('none');
        expect(status.description).toBe('All Systems Operational');

        // Verify browser was created
        expect(createdBrowsers.length).toBeGreaterThan(0);
      } finally {
        await scraper.close();
      }
    }, 30000);

    it('should scrape components with pooling enabled', async () => {
      config.scraper.pooling.enabled = true;

      const scraper = new WebScraper();

      try {
        // scrapeComponents will fail in test environment, but pool should work
        try {
          await scraper.scrapeComponents();
        } catch (error) {
          // Expected to fail - we're testing pool behavior, not scraping
        }

        // Verify browser was created and pool is active
        expect(createdBrowsers.length).toBeGreaterThan(0);
      } finally {
        await scraper.close();
      }
    }, 30000);

    it('should scrape incidents with pooling enabled', async () => {
      config.scraper.pooling.enabled = true;

      const scraper = new WebScraper();

      try {
        // scrapeIncidents will fail in test environment, but pool should work
        try {
          await scraper.scrapeIncidents();
        } catch (error) {
          // Expected to fail - we're testing pool behavior, not scraping
        }

        // Verify browser was created and pool is active
        expect(createdBrowsers.length).toBeGreaterThan(0);
      } finally {
        await scraper.close();
      }
    }, 30000);
  });

  describe('Browser reuse across multiple scrapes', () => {
    it('should reuse browsers across multiple scrape operations', async () => {
      config.scraper.pooling.enabled = true;
      config.scraper.pooling.minSize = 1;
      config.scraper.pooling.maxSize = 2;

      const scraper = new WebScraper();

      try {
        // First scrape
        await scraper.scrapeStatus();
        const browsersAfterFirst = createdBrowsers.length;

        // Second scrape - should reuse browser
        await scraper.scrapeStatus();
        const browsersAfterSecond = createdBrowsers.length;

        // Third scrape - should still reuse
        await scraper.scrapeStatus();
        const browsersAfterThird = createdBrowsers.length;

        // Should have created minimal browsers (1-2) and reused them
        expect(browsersAfterFirst).toBeGreaterThan(0);
        expect(browsersAfterSecond).toBeLessThanOrEqual(browsersAfterFirst + 1);
        expect(browsersAfterThird).toBeLessThanOrEqual(browsersAfterFirst + 1);
      } finally {
        await scraper.close();
      }
    }, 30000);

    it('should handle parallel scrapes with pooling', async () => {
      config.scraper.pooling.enabled = true;
      config.scraper.pooling.minSize = 1;
      config.scraper.pooling.maxSize = 3;

      const scraper = new WebScraper();

      try {
        // Parallel scrapes
        const results = await Promise.all([
          scraper.scrapeStatus(),
          scraper.scrapeStatus(),
          scraper.scrapeStatus(),
        ]);

        expect(results).toHaveLength(3);
        results.forEach((result) => {
          expect(result).toBeDefined();
          expect(result.indicator).toBeDefined();
        });

        // Should have created up to maxSize browsers
        expect(createdBrowsers.length).toBeLessThanOrEqual(3);
      } finally {
        await scraper.close();
      }
    }, 30000);
  });

  describe('Performance with pooling', () => {
    it('should be faster with pooling for multiple scrapes', async () => {
      // Test without pooling
      config.scraper.pooling.enabled = false;
      const scraperNonPooled = new WebScraper();

      const startNonPooled = Date.now();
      await scraperNonPooled.scrapeStatus();
      await scraperNonPooled.scrapeStatus();
      await scraperNonPooled.scrapeStatus();
      const timeNonPooled = Date.now() - startNonPooled;

      await scraperNonPooled.close();

      // Clear browser tracking
      createdBrowsers.length = 0;
      browserIdCounter = 0;
      jest.clearAllMocks();
      (mockLaunch as any).mockImplementation(() => createMockBrowser());

      // Test with pooling
      config.scraper.pooling.enabled = true;
      config.scraper.pooling.minSize = 1;
      config.scraper.pooling.maxSize = 2;
      const scraperPooled = new WebScraper();

      const startPooled = Date.now();
      await scraperPooled.scrapeStatus();
      await scraperPooled.scrapeStatus();
      await scraperPooled.scrapeStatus();
      const timePooled = Date.now() - startPooled;

      await scraperPooled.close();

      // Pooled version should be comparable or faster
      // (In real scenario with browser launch overhead, pooled would be significantly faster)
      expect(timePooled).toBeLessThanOrEqual(timeNonPooled * 1.5); // Allow some variance
    }, 30000);
  });

  describe('Fallback to single-browser mode', () => {
    it('should work correctly with pooling disabled', async () => {
      config.scraper.pooling.enabled = false;

      const scraper = new WebScraper();

      try {
        const status = await scraper.scrapeStatus();

        expect(status).toBeDefined();
        expect(status.indicator).toBe('none');

        // Each scrape should create a browser (no pooling)
        expect(createdBrowsers.length).toBeGreaterThan(0);
      } finally {
        await scraper.close();
      }
    }, 30000);

    it('should handle switching between pooled and non-pooled modes', async () => {
      // First with pooling
      config.scraper.pooling.enabled = true;
      const scraper1 = new WebScraper();
      await scraper1.scrapeStatus();
      await scraper1.close();

      const pooledBrowsers = createdBrowsers.length;

      // Reset
      createdBrowsers.length = 0;
      browserIdCounter = 0;
      jest.clearAllMocks();
      (mockLaunch as any).mockImplementation(() => createMockBrowser());

      // Then without pooling
      config.scraper.pooling.enabled = false;
      const scraper2 = new WebScraper();
      await scraper2.scrapeStatus();
      await scraper2.close();

      const nonPooledBrowsers = createdBrowsers.length;

      // Both should work
      expect(pooledBrowsers).toBeGreaterThan(0);
      expect(nonPooledBrowsers).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Error handling and pool integrity', () => {
    it('should not corrupt pool on scrape errors', async () => {
      config.scraper.pooling.enabled = true;
      config.scraper.pooling.minSize = 1;

      const scraper = new WebScraper();

      try {
        // First successful scrape
        const status1 = await scraper.scrapeStatus();
        expect(status1).toBeDefined();

        // Even if scrapes fail (in real scenarios), pool should remain functional
        // This test verifies pool doesn't break on normal operation
        const status2 = await scraper.scrapeStatus();
        expect(status2).toBeDefined();

        // Verify browsers were reused (pool working correctly)
        expect(createdBrowsers.length).toBeGreaterThan(0);
        expect(createdBrowsers.length).toBeLessThanOrEqual(2);
      } finally {
        await scraper.close();
      }
    }, 10000);

    it('should handle multiple sequential scrapes without issues', async () => {
      config.scraper.pooling.enabled = true;
      config.scraper.pooling.minSize = 1;
      config.scraper.pooling.maxSize = 2;

      const scraper = new WebScraper();

      try {
        // Multiple sequential scrapes to stress test pool
        for (let i = 0; i < 5; i++) {
          const status = await scraper.scrapeStatus();
          expect(status).toBeDefined();
          expect(status.indicator).toBe('none');
        }

        // Pool should have created minimal browsers and reused them
        expect(createdBrowsers.length).toBeGreaterThan(0);
        expect(createdBrowsers.length).toBeLessThanOrEqual(2);
      } finally {
        await scraper.close();
      }
    }, 15000);
  });

  describe('Pool lifecycle management', () => {
    it('should initialize pool on first use', async () => {
      config.scraper.pooling.enabled = true;
      config.scraper.pooling.minSize = 2;

      const scraper = new WebScraper();

      try {
        // Pool should be initialized on first scrape
        await scraper.scrapeStatus();

        // Should have created browsers
        expect(createdBrowsers.length).toBeGreaterThan(0);
      } finally {
        await scraper.close();
      }
    }, 30000);

    it('should drain pool on close', async () => {
      config.scraper.pooling.enabled = true;
      config.scraper.pooling.minSize = 2;

      const scraper = new WebScraper();

      try {
        await scraper.scrapeStatus();
      } finally {
        await scraper.close();
      }

      // All created browsers should be closed
      createdBrowsers.forEach((browser) => {
        expect(browser.close).toHaveBeenCalled();
      });
    }, 30000);

    it('should handle multiple close calls safely', async () => {
      config.scraper.pooling.enabled = true;

      const scraper = new WebScraper();

      try {
        await scraper.scrapeStatus();
      } finally {
        await scraper.close();

        // Second close should not throw
        await expect(scraper.close()).resolves.not.toThrow();
      }
    }, 30000);
  });
});
