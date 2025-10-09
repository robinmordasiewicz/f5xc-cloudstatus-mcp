/**
 * Cache service for F5 Status MCP Server
 * Implements TTL-based caching with type safety
 */

import { CacheError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Cache entry with expiration
 */
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

/**
 * Cache service class
 */
export class CacheService {
  private cache: Map<string, CacheEntry<unknown>>;
  private readonly name: string;

  constructor(name: string = 'default') {
    this.cache = new Map();
    this.name = name;
  }

  /**
   * Get value from cache or fetch if missing/expired
   */
  async get<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
    try {
      // Check cache
      const cached = this.cache.get(key) as CacheEntry<T> | undefined;

      if (cached && cached.expiry > Date.now()) {
        logger.debug(`Cache hit for key: ${key}`, { name: this.name });
        return cached.data;
      }

      // Cache miss or expired
      logger.debug(`Cache miss for key: ${key}`, { name: this.name });
      const data = await fetcher();

      // Store in cache
      this.set(key, data, ttl);

      return data;
    } catch (error) {
      logger.error(`Cache get error for key: ${key}`, error);
      throw new CacheError(`Failed to get cache entry: ${key}`, error);
    }
  }

  /**
   * Set value in cache with TTL
   */
  set<T>(key: string, data: T, ttl: number): void {
    try {
      const expiry = Date.now() + ttl;
      this.cache.set(key, { data, expiry });
      logger.debug(`Cache set for key: ${key}`, {
        name: this.name,
        ttl,
        expiry: new Date(expiry).toISOString(),
      });
    } catch (error) {
      logger.error(`Cache set error for key: ${key}`, error);
      throw new CacheError(`Failed to set cache entry: ${key}`, error);
    }
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;

    if (cached.expiry <= Date.now()) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get value directly from cache (without fetcher)
   */
  getDirect<T>(key: string): T | undefined {
    const cached = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!cached) return undefined;

    if (cached.expiry <= Date.now()) {
      this.delete(key);
      return undefined;
    }

    return cached.data;
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug(`Cache delete for key: ${key}`, { name: this.name });
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    logger.info(`Cache cleared`, { name: this.name, entriesCleared: size });
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    entries: Array<{
      key: string;
      expiresIn: number;
      expiresAt: string;
    }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      expiresIn: Math.max(0, entry.expiry - now),
      expiresAt: new Date(entry.expiry).toISOString(),
    }));

    return {
      size: this.cache.size,
      entries,
    };
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry <= now) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Cleaned expired cache entries`, {
        name: this.name,
        count: cleaned,
      });
    }

    return cleaned;
  }

  /**
   * Invalidate cache entries matching pattern
   */
  invalidatePattern(pattern: RegExp): number {
    let invalidated = 0;

    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    if (invalidated > 0) {
      logger.info(`Invalidated cache entries by pattern`, {
        name: this.name,
        pattern: pattern.toString(),
        count: invalidated,
      });
    }

    return invalidated;
  }
}

/**
 * Create a cache service instance
 */
export function createCacheService(name?: string): CacheService {
  return new CacheService(name);
}
