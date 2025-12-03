// API Response Caching Utilities

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ResponseCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 100; // Maximum number of entries
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

  // Get data from cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Set data in cache
  set<T>(key: string, data: T, ttl?: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  // Clear cache
  clear(): void {
    this.cache.clear();
  }

  // Clear expired entries
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

// Create singleton instance
export const responseCache = new ResponseCache();

// Utility function to create cache keys
export const createCacheKey = (endpoint: string, params?: Record<string, any>): string => {
  const paramString = params ? JSON.stringify(params) : '';
  return `${endpoint}${paramString ? ':' + paramString : ''}`;
};

// Higher-order function for caching API calls
export const withCache = <T>(
  fn: () => Promise<T>,
  key: string,
  ttl?: number
): Promise<T> => {
  return new Promise(async (resolve, reject) => {
    // Try to get from cache first
    const cached = responseCache.get<T>(key);
    if (cached !== null) {
      resolve(cached);
      return;
    }

    // If not in cache, call the function
    try {
      const result = await fn();
      responseCache.set(key, result, ttl);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

// Clear cache periodically (every 10 minutes)
if (typeof window !== 'undefined') {
  setInterval(() => {
    responseCache.clearExpired();
  }, 10 * 60 * 1000);
}
