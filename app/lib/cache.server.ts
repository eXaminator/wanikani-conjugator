interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const TTL_MS = 60 * 60 * 1000; // 1 hour

export function getCached<T>(key: string): T | null {
    const entry = cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (Date.now() - entry.timestamp > TTL_MS) {
        cache.delete(key);
        return null;
    }

    return entry.data;
}

export function setCache<T>(key: string, data: T): void {
    cache.set(key, { data, timestamp: Date.now() });
}

export function invalidateCache(key?: string): void {
    if (key) {
        cache.delete(key);
    } else {
        cache.clear();
    }
}
