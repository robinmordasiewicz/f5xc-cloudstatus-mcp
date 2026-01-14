// Copyright (c) 2026 Robin Mordasiewicz. MIT License.

/**
 * Unit tests for BrowserPool
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { BrowserPool, type BrowserPoolConfig } from '../../../src/data-access/browser-pool.js';
import type { Browser, Page } from 'playwright';

// Mock playwright module first
jest.mock('playwright', () => ({
  chromium: {
    launch: jest.fn(),
  },
}));

// Import playwright after mocking
import { chromium } from 'playwright';

// Mock browser and page
const mockPage: Partial<Page> = {
  close: jest.fn(() => Promise.resolve()),
};

const mockBrowser: Partial<Browser> = {
  newPage: jest.fn(() => Promise.resolve(mockPage as Page)),
  close: jest.fn(() => Promise.resolve()),
  isConnected: jest.fn(() => true),
};

// Get reference to mocked launch function
const mockLaunch = chromium.launch as jest.Mock;

describe('BrowserPool', () => {
  let pool: BrowserPool;
  let defaultConfig: BrowserPoolConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    (mockBrowser.newPage as any).mockResolvedValue(mockPage as Page);
    (mockBrowser.close as any).mockResolvedValue(undefined);
    (mockBrowser.isConnected as any).mockReturnValue(true);
    (mockPage.close as any).mockResolvedValue(undefined);
    (mockLaunch as any).mockResolvedValue(mockBrowser as Browser);

    defaultConfig = {
      minSize: 1,
      maxSize: 3,
      idleTimeout: 60000,
      acquireTimeout: 10000,
      healthCheckInterval: 30000,
      enableMetrics: true,
      headless: true,
      timeout: 30000,
    };
  });

  afterEach(async () => {
    if (pool) {
      await pool.close();
    }
  });

  describe('initialize', () => {
    it('should create minSize browsers on initialization', async () => {
      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      expect(mockLaunch).toHaveBeenCalledTimes(1);
      expect(mockLaunch).toHaveBeenCalledWith({
        headless: true,
        timeout: 30000,
      });
    });

    it('should create multiple browsers when minSize > 1', async () => {
      defaultConfig.minSize = 2;
      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      expect(mockLaunch).toHaveBeenCalledTimes(2);
    });

    it('should handle browser creation failures gracefully', async () => {
      (mockLaunch as any).mockRejectedValueOnce(new Error('Launch failed'));

      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      // Should log warning but not throw
      expect(mockLaunch).toHaveBeenCalledTimes(1);
    });
  });

  describe('acquire', () => {
    it('should return browser from pool (cache hit)', async () => {
      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      const browser1 = await pool.acquire();
      await pool.release(browser1);

      // Clear launch mock to verify reuse
      mockLaunch.mockClear();

      const browser2 = await pool.acquire();

      expect(browser2).toBe(mockBrowser);
      expect(mockLaunch).not.toHaveBeenCalled(); // No new browser created
    });

    it('should create new browser if pool empty (cache miss)', async () => {
      pool = new BrowserPool(defaultConfig);
      // Don't initialize - pool starts empty

      const browser = await pool.acquire();

      expect(browser).toBe(mockBrowser);
      expect(mockLaunch).toHaveBeenCalledTimes(1);
    });

    it('should create new browser if under maxSize', async () => {
      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      mockLaunch.mockClear();

      // Acquire without releasing - should create new browser
      await pool.acquire();
      await pool.acquire();

      expect(mockLaunch).toHaveBeenCalledTimes(1); // One new browser created
    });

    it('should throw on timeout when pool exhausted', async () => {
      defaultConfig.maxSize = 1;
      defaultConfig.acquireTimeout = 500; // Short timeout for test
      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      await pool.acquire();
      // Don't release browser

      await expect(pool.acquire()).rejects.toThrow('Browser acquisition timeout');
    }, 10000);

    it('should wait for release and acquire when browser becomes available', async () => {
      defaultConfig.maxSize = 1;
      defaultConfig.acquireTimeout = 2000;
      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      const browser1 = await pool.acquire();

      // Release after delay
      setTimeout(async () => {
        await pool.release(browser1);
      }, 500);

      // Should wait and successfully acquire
      const browser2 = await pool.acquire();
      expect(browser2).toBe(mockBrowser);
    }, 10000);
  });

  describe('release', () => {
    it('should return browser to pool and mark idle', async () => {
      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      const browser = await pool.acquire();
      await pool.release(browser);

      mockLaunch.mockClear();

      // Next acquire should reuse the released browser
      const browser2 = await pool.acquire();
      expect(browser2).toBe(mockBrowser);
      expect(mockLaunch).not.toHaveBeenCalled();
    });

    it('should perform health check before returning to pool', async () => {
      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      const browser = await pool.acquire();
      await pool.release(browser);

      // Health check should call newPage and close it
      expect(mockBrowser.newPage).toHaveBeenCalled();
    });

    it('should handle release of non-pooled browser gracefully', async () => {
      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      const externalBrowser = {} as Browser;

      // Should not throw
      await expect(pool.release(externalBrowser)).resolves.toBeUndefined();
    });
  });

  describe('health check', () => {
    it('should detect crashed browsers', async () => {
      const crashedBrowser: Partial<Browser> = {
        newPage: jest.fn(() => Promise.resolve(mockPage as Page)),
        close: jest.fn(() => Promise.resolve()),
        isConnected: jest.fn(() => false),
      };

      (mockLaunch as any)
        .mockResolvedValueOnce(crashedBrowser as Browser)
        .mockResolvedValue(mockBrowser as Browser);

      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      const browser = await pool.acquire();
      await pool.release(browser);

      // Crashed browser should be closed
      expect(crashedBrowser.close).toHaveBeenCalled();
    });

    it('should replace crashed browsers to maintain minSize', async () => {
      const crashedBrowser: Partial<Browser> = {
        newPage: jest.fn(() => Promise.resolve(mockPage as Page)),
        close: jest.fn(() => Promise.resolve()),
        isConnected: jest.fn(() => false),
      };

      (mockLaunch as any)
        .mockResolvedValueOnce(crashedBrowser as Browser)
        .mockResolvedValue(mockBrowser as Browser);

      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      const browser = await pool.acquire();
      await pool.release(browser);

      // Should create replacement browser
      expect(mockLaunch).toHaveBeenCalledTimes(2); // Initial + replacement
    });

    it('should handle health check failures', async () => {
      const faultyBrowser: Partial<Browser> = {
        newPage: jest.fn(() => Promise.reject(new Error('Page creation failed'))),
        close: jest.fn(() => Promise.resolve()),
        isConnected: jest.fn(() => true),
      };

      (mockLaunch as any)
        .mockResolvedValueOnce(faultyBrowser as Browser)
        .mockResolvedValue(mockBrowser as Browser);

      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      const browser = await pool.acquire();
      await pool.release(browser);

      // Faulty browser should be removed
      expect(faultyBrowser.close).toHaveBeenCalled();
    });
  });

  describe('metrics', () => {
    it('should track acquisition metrics', async () => {
      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      const browser1 = await pool.acquire();
      await pool.release(browser1);

      const browser2 = await pool.acquire();
      await pool.release(browser2);

      const metrics = pool.getMetrics();

      expect(metrics.totalAcquisitions).toBe(2);
      expect(metrics.avgAcquisitionTime).toBeGreaterThanOrEqual(0);
      expect(metrics.browsersCreated).toBe(1);
    });

    it('should calculate cache hit rate correctly', async () => {
      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      // First acquire - cache hit (from initialized pool)
      const browser1 = await pool.acquire();
      await pool.release(browser1);

      // Second acquire - cache hit
      const browser2 = await pool.acquire();
      await pool.release(browser2);

      const metrics = pool.getMetrics();

      expect(metrics.cacheHitRate).toBeGreaterThan(0);
      expect(metrics.cacheHitRate).toBeLessThanOrEqual(1);
    });

    it('should track pool utilization', async () => {
      defaultConfig.maxSize = 2;
      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      await pool.acquire();

      const metrics = pool.getMetrics();

      expect(metrics.poolUtilization).toBe(0.5); // 1 in use out of 2 max
    });

    it('should not track metrics when disabled', async () => {
      defaultConfig.enableMetrics = false;
      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      await pool.acquire();

      const metrics = pool.getMetrics();

      expect(metrics.totalAcquisitions).toBe(0);
    });
  });

  describe('drain', () => {
    it('should wait for in-flight operations', async () => {
      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      const browser = await pool.acquire();

      // Start drain in background
      const drainPromise = pool.drain(2000);

      // Release browser after delay
      setTimeout(async () => {
        await pool.release(browser);
      }, 500);

      await drainPromise;

      // Pool should be closed
      const metrics = pool.getMetrics();
      expect(metrics.browsersClosed).toBeGreaterThan(0);
    }, 10000);

    it('should timeout if operations exceed drain timeout', async () => {
      defaultConfig.maxSize = 1;
      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      await pool.acquire();
      // Don't release browser

      await pool.drain(500); // Short timeout

      // Should force close even with in-flight operation
      const metrics = pool.getMetrics();
      expect(metrics.browsersClosed).toBeGreaterThan(0);
    }, 10000);
  });

  describe('close', () => {
    it('should close all browsers immediately', async () => {
      defaultConfig.minSize = 2;
      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      await pool.close();

      expect(mockBrowser.close).toHaveBeenCalledTimes(2);
    });

    it('should clear pool after closing', async () => {
      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      await pool.close();

      // Attempting to acquire after close should throw
      await expect(pool.acquire()).rejects.toThrow('Browser pool is closing');
    });

    it('should handle browser close errors gracefully', async () => {
      const errorBrowser: Partial<Browser> = {
        newPage: jest.fn(() => Promise.resolve(mockPage as Page)),
        close: jest.fn(() => Promise.reject(new Error('Close failed'))),
        isConnected: jest.fn(() => true),
      };

      (mockLaunch as any).mockResolvedValue(errorBrowser as Browser);

      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      // Should not throw even if browser close fails
      await expect(pool.close()).resolves.toBeUndefined();
    });
  });

  describe('configuration validation', () => {
    it('should respect minSize configuration', async () => {
      defaultConfig.minSize = 3;
      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      expect(mockLaunch).toHaveBeenCalledTimes(3);
    });

    it('should respect maxSize configuration', async () => {
      defaultConfig.minSize = 1;
      defaultConfig.maxSize = 2;
      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      await pool.acquire();
      await pool.acquire();

      // Both browsers should be created
      expect(mockLaunch).toHaveBeenCalledTimes(2);
    });

    it('should use configured headless mode', async () => {
      defaultConfig.headless = false;
      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      expect(mockLaunch).toHaveBeenCalledWith({
        headless: false,
        timeout: 30000,
      });
    });

    it('should use configured timeout', async () => {
      defaultConfig.timeout = 60000;
      pool = new BrowserPool(defaultConfig);
      await pool.initialize();

      expect(mockLaunch).toHaveBeenCalledWith({
        headless: true,
        timeout: 60000,
      });
    });
  });
});
