import { LRUCache } from 'lru-cache';

// Cache configurations in seconds
export const CACHE_TTL = {
    AQI: 15 * 60,            // 15 minutes
    WEATHER: 15 * 60,        // 15 minutes
    GEOCODE: 24 * 60 * 60,   // 24 hours
    RECOMMENDATION: 2 * 60 * 60 // 2 hours
};

const options = {
    max: 500, // Maximum number of items in the cache
    // We'll manage TTL per item in cacheSet
};

const cache = new LRUCache<string, any>(options);

/**
 * Get a value from the cache
 */
export function cacheGet<T>(key: string): T | undefined {
    return cache.get(key) as T | undefined;
}

/**
 * Set a value in the cache with a specific TTL
 */
export function cacheSet<T>(key: string, value: T, ttlSeconds: number): void {
    cache.set(key, value, { ttl: ttlSeconds * 1000 });
}

/**
 * Invalidate a specific cache key
 */
export function cacheInvalidate(key: string): void {
    cache.delete(key);
}

/**
 * Clear the entire cache
 */
export function cacheClear(): void {
    cache.clear();
}
