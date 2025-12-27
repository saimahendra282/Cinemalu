// Simple in-memory cache implementation
interface CacheItem<T> {
  value: T;
  expiry: number;
}

class SimpleCache {
  private cache: Map<string, CacheItem<any>> = new Map();

  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }

  set<T>(key: string, value: T, ttlSeconds?: number): boolean {
    const ttl = ttlSeconds || 3600; // 1 hour default
    const expiry = Date.now() + (ttl * 1000);
    
    this.cache.set(key, { value, expiry });
    return true;
  }

  delete(key: string): number {
    return this.cache.delete(key) ? 1 : 0;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Create a single instance
const cache = new SimpleCache();

// Cache durations for different types of data
export const CACHE_DURATION = {
  TRENDING: 60 * 30, // 30 minutes
  POPULAR: 60 * 60, // 1 hour  
  GENRES: 60 * 60 * 24, // 24 hours
  MOVIE_DETAILS: 60 * 60 * 2, // 2 hours
  TV_DETAILS: 60 * 60 * 2, // 2 hours
  SEARCH: 60 * 5, // 5 minutes (light caching)
  STREAM_URLS: 0, // No caching for streaming URLs
} as const;

export function getCached<T>(key: string): T | undefined {
  try {
    return cache.get<T>(key);
  } catch (error) {
    console.error('Cache get error:', error);
    return undefined;
  }
}

export function setCached<T>(key: string, value: T, ttl?: number): boolean {
  try {
    return cache.set(key, value, ttl);
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
}

export function deleteCached(key: string): number {
  try {
    return cache.delete(key);
  } catch (error) {
    console.error('Cache delete error:', error);
    return 0;
  }
}

export function flushCache(): void {
  try {
    cache.clear();
  } catch (error) {
    console.error('Cache flush error:', error);
  }
}

export function getCacheStats() {
  return {
    size: cache.size(),
  };
}