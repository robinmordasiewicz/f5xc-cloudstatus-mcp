/**
 * Mock CacheService for testing
 */
export class MockCacheService {
  private cache = new Map<string, { data: any; expiry: number }>();

  async get<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
    const entry = this.cache.get(key);

    // Check if cached and not expired
    if (entry && entry.expiry > Date.now()) {
      return entry.data as T;
    }

    // Cache miss or expired - call fetcher
    const data = await fetcher();
    this.set(key, data, ttl);
    return data;
  }

  set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }

  getDirect<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (entry.expiry <= Date.now()) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  invalidatePattern(pattern: RegExp): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  // Test helper methods
  getCacheSize(): number {
    return this.cache.size;
  }

  setExpired(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      entry.expiry = Date.now() - 1000; // Set to 1 second in the past
    }
  }
}
