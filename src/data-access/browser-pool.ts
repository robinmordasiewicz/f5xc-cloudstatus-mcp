// Copyright (c) 2026 Robin Mordasiewicz. MIT License.

/**
 * Browser instance pooling for WebScraper
 * Reuses browser instances to reduce latency and overhead
 */

import { chromium, Browser } from 'playwright';
import { ScraperError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Pooled browser metadata wrapper
 */
export interface PooledBrowser {
  browser: Browser;
  id: string;
  createdAt: Date;
  lastUsedAt: Date;
  usageCount: number;
  isHealthy: boolean;
  state: 'idle' | 'in-use' | 'failed';
}

/**
 * Browser pool configuration
 */
export interface BrowserPoolConfig {
  minSize: number;
  maxSize: number;
  idleTimeout: number;
  acquireTimeout: number;
  healthCheckInterval: number;
  enableMetrics: boolean;
  headless: boolean;
  timeout: number;
}

/**
 * Performance metrics
 */
export interface PoolMetrics {
  totalAcquisitions: number;
  avgAcquisitionTime: number;
  cacheHitRate: number;
  poolUtilization: number;
  failedAcquisitions: number;
  browsersCreated: number;
  browsersClosed: number;
}

/**
 * Browser pool class
 */
export class BrowserPool {
  private pool: PooledBrowser[] = [];
  private inUse = new Set<string>();
  private config: BrowserPoolConfig;
  private metrics: PoolMetrics;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private isClosing = false;

  constructor(config: BrowserPoolConfig) {
    this.config = config;
    this.metrics = {
      totalAcquisitions: 0,
      avgAcquisitionTime: 0,
      cacheHitRate: 0,
      poolUtilization: 0,
      failedAcquisitions: 0,
      browsersCreated: 0,
      browsersClosed: 0,
    };
  }

  /**
   * Initialize pool with minimum browsers
   */
  async initialize(): Promise<void> {
    logger.debug(`Initializing browser pool with minSize=${this.config.minSize}`);

    for (let i = 0; i < this.config.minSize; i++) {
      try {
        const pooled = await this.createBrowser();
        this.pool.push(pooled);
      } catch (error) {
        logger.warn(`Failed to initialize browser ${i + 1}/${this.config.minSize}`, error);
      }
    }

    // Start background tasks
    this.startHealthChecks();
    this.startCleanupTask();

    logger.debug(`Browser pool initialized with ${this.pool.length} browsers`);
  }

  /**
   * Acquire browser from pool
   */
  async acquire(): Promise<Browser> {
    if (this.isClosing) {
      throw new ScraperError('Browser pool is closing');
    }

    const startTime = Date.now();
    const deadline = startTime + this.config.acquireTimeout;

    while (Date.now() < deadline) {
      // Try to get idle browser
      const idle = this.pool.find((b) => b.state === 'idle' && b.isHealthy);
      if (idle) {
        idle.state = 'in-use';
        idle.lastUsedAt = new Date();
        idle.usageCount++;
        this.inUse.add(idle.id);
        this.updateMetrics('cache-hit', Date.now() - startTime);
        logger.debug(`Acquired browser ${idle.id} from pool (reuse #${idle.usageCount})`);
        return idle.browser;
      }

      // Try to create new browser if under max
      if (this.pool.length < this.config.maxSize) {
        try {
          const pooled = await this.createBrowser();
          pooled.state = 'in-use';
          this.inUse.add(pooled.id);
          this.pool.push(pooled);
          this.updateMetrics('cache-miss', Date.now() - startTime);
          logger.debug(`Created new browser ${pooled.id} (pool size: ${this.pool.length})`);
          return pooled.browser;
        } catch (error) {
          logger.warn('Failed to create browser', error);
          this.metrics.failedAcquisitions++;
        }
      }

      // Wait for release
      await this.waitForRelease(100);
    }

    this.metrics.failedAcquisitions++;
    throw new ScraperError(
      `Browser acquisition timeout after ${this.config.acquireTimeout}ms (pool size: ${this.pool.length}, in use: ${this.inUse.size})`
    );
  }

  /**
   * Release browser back to pool
   */
  async release(browser: Browser): Promise<void> {
    const pooled = this.pool.find((p) => p.browser === browser);
    if (!pooled) {
      logger.warn('Released browser not in pool (temporary or already removed)');
      return;
    }

    // Health check before returning to pool
    const healthy = await this.healthCheck(pooled);
    if (!healthy) {
      pooled.state = 'failed';
      pooled.isHealthy = false;
      await pooled.browser.close().catch(() => {});
      this.pool = this.pool.filter((p) => p.id !== pooled.id);
      this.inUse.delete(pooled.id);
      this.metrics.browsersClosed++;

      logger.warn(`Browser ${pooled.id} failed health check, removed from pool`);

      // Replace crashed browser to maintain minSize
      if (this.pool.length < this.config.minSize && !this.isClosing) {
        try {
          const replacement = await this.createBrowser();
          this.pool.push(replacement);
          logger.debug(`Created replacement browser ${replacement.id}`);
        } catch (error) {
          logger.warn('Failed to create replacement browser', error);
        }
      }
    } else {
      pooled.state = 'idle';
      pooled.lastUsedAt = new Date();
      this.inUse.delete(pooled.id);
      logger.debug(`Released browser ${pooled.id} back to pool`);
    }
  }

  /**
   * Drain pool gracefully (wait for in-flight operations)
   */
  async drain(timeout: number = 30000): Promise<void> {
    this.isClosing = true;
    this.stopBackgroundTasks();

    logger.debug(`Draining browser pool (${this.inUse.size} operations in-flight)`);

    const deadline = Date.now() + timeout;

    // Wait for in-flight operations
    while (this.inUse.size > 0 && Date.now() < deadline) {
      await this.waitForRelease(500);
    }

    if (this.inUse.size > 0) {
      logger.warn(`Draining pool with ${this.inUse.size} operations still in-flight`);
    }

    await this.close();
  }

  /**
   * Close all browsers immediately
   */
  async close(): Promise<void> {
    this.isClosing = true;
    this.stopBackgroundTasks();

    logger.debug(`Closing browser pool (${this.pool.length} browsers)`);

    // Close all browsers
    await Promise.all(
      this.pool.map((pooled) =>
        pooled.browser.close().catch((err) => {
          logger.warn(`Error closing browser ${pooled.id}`, err);
        })
      )
    );

    this.metrics.browsersClosed += this.pool.length;
    this.pool = [];
    this.inUse.clear();

    this.logFinalMetrics();
  }

  /**
   * Get current pool metrics
   */
  getMetrics(): PoolMetrics {
    return { ...this.metrics };
  }

  /**
   * Create new browser instance
   */
  private async createBrowser(): Promise<PooledBrowser> {
    const browser = await chromium.launch({
      headless: this.config.headless,
      timeout: this.config.timeout,
    });

    const pooled: PooledBrowser = {
      browser,
      id: `browser-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      usageCount: 0,
      isHealthy: true,
      state: 'idle',
    };

    this.metrics.browsersCreated++;
    logger.debug(`Created browser ${pooled.id}`);

    return pooled;
  }

  /**
   * Health check for pooled browser
   */
  private async healthCheck(pooled: PooledBrowser): Promise<boolean> {
    try {
      // Check if browser is connected
      if (!pooled.browser.isConnected()) {
        return false;
      }

      // Try to create and close a test page (lightweight check)
      const page = await pooled.browser.newPage();
      await page.close();
      return true;
    } catch (error) {
      logger.debug(`Browser ${pooled.id} failed health check`, error);
      return false;
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    if (!this.config.healthCheckInterval || this.config.healthCheckInterval <= 0) {
      return;
    }

    this.healthCheckTimer = setInterval(async () => {
      for (const pooled of this.pool) {
        if (pooled.state === 'idle' && pooled.isHealthy) {
          const healthy = await this.healthCheck(pooled);
          if (!healthy) {
            pooled.isHealthy = false;
            pooled.state = 'failed';
            logger.warn(`Health check detected failed browser ${pooled.id}`);
          }
        }
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Start periodic cleanup of idle browsers
   */
  private startCleanupTask(): void {
    if (!this.config.idleTimeout || this.config.idleTimeout <= 0) {
      return;
    }

    this.cleanupTimer = setInterval(async () => {
      await this.cleanupIdleBrowsers();
    }, 30000); // Run cleanup every 30 seconds
  }

  /**
   * Cleanup idle browsers exceeding timeout
   */
  private async cleanupIdleBrowsers(): Promise<void> {
    if (this.isClosing) return;

    const now = Date.now();
    const toClose: PooledBrowser[] = [];

    for (const pooled of this.pool) {
      if (
        pooled.state === 'idle' &&
        now - pooled.lastUsedAt.getTime() > this.config.idleTimeout &&
        this.pool.length > this.config.minSize
      ) {
        toClose.push(pooled);
      }
    }

    for (const pooled of toClose) {
      await pooled.browser.close().catch(() => {});
      this.pool = this.pool.filter((p) => p.id !== pooled.id);
      this.metrics.browsersClosed++;
      logger.debug(
        `Closed idle browser ${pooled.id} (idle for ${Math.round((now - pooled.lastUsedAt.getTime()) / 1000)}s)`
      );
    }
  }

  /**
   * Stop background tasks
   */
  private stopBackgroundTasks(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Wait for browser release
   */
  private async waitForRelease(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Update metrics
   */
  private updateMetrics(event: 'cache-hit' | 'cache-miss', duration: number): void {
    if (!this.config.enableMetrics) return;

    this.metrics.totalAcquisitions++;

    // Update avg acquisition time (running average)
    this.metrics.avgAcquisitionTime =
      (this.metrics.avgAcquisitionTime * (this.metrics.totalAcquisitions - 1) + duration) /
      this.metrics.totalAcquisitions;

    // Update cache hit rate
    if (event === 'cache-hit') {
      this.metrics.cacheHitRate =
        (this.metrics.cacheHitRate * (this.metrics.totalAcquisitions - 1) + 1) /
        this.metrics.totalAcquisitions;
    } else {
      this.metrics.cacheHitRate =
        (this.metrics.cacheHitRate * (this.metrics.totalAcquisitions - 1)) /
        this.metrics.totalAcquisitions;
    }

    // Update pool utilization
    this.metrics.poolUtilization = this.inUse.size / this.config.maxSize;

    // Log periodically
    if (this.metrics.totalAcquisitions % 10 === 0) {
      logger.debug('Browser pool metrics', {
        acquisitions: this.metrics.totalAcquisitions,
        avgTime: `${this.metrics.avgAcquisitionTime.toFixed(1)}ms`,
        hitRate: `${(this.metrics.cacheHitRate * 100).toFixed(1)}%`,
        utilization: `${(this.metrics.poolUtilization * 100).toFixed(1)}%`,
        poolSize: this.pool.length,
        inUse: this.inUse.size,
      });
    }
  }

  /**
   * Log final metrics on close
   */
  private logFinalMetrics(): void {
    if (!this.config.enableMetrics) return;

    logger.info('Browser pool final metrics', {
      totalAcquisitions: this.metrics.totalAcquisitions,
      avgAcquisitionTime: `${this.metrics.avgAcquisitionTime.toFixed(2)}ms`,
      cacheHitRate: `${(this.metrics.cacheHitRate * 100).toFixed(1)}%`,
      browsersCreated: this.metrics.browsersCreated,
      browsersClosed: this.metrics.browsersClosed,
      failedAcquisitions: this.metrics.failedAcquisitions,
    });
  }
}

/**
 * Create browser pool instance
 */
export function createBrowserPool(config: BrowserPoolConfig): BrowserPool {
  return new BrowserPool(config);
}
