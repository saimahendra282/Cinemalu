import NodeCache from 'node-cache';

// Cache configuration
const cache = new NodeCache({
  stdTTL: 60 * 60, // 1 hour default
  checkperiod: 60 * 10, // Check for expired keys every 10 minutes
  useClones: false,
});

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
    return cache.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
    return 0;
  }
}

export function flushCache(): void {
  try {
    cache.flushAll();
  } catch (error) {
    console.error('Cache flush error:', error);
  }
}

export function getCacheStats() {
  return cache.getStats();
}