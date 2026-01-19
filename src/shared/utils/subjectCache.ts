import type { Subject } from '@shared/types/types';

const DB_NAME = 'wanikani_cache';
const DB_VERSION = 1;
const STORE_NAME = 'subjects';
const CACHE_KEY = 'all_subjects';
const FORCE_RELOAD_KEY = 'wanikani_force_reload';
export const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

interface CacheEntry {
    key: string;
    subjects: Subject[];
    timestamp: number;
}

function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            }
        };
    });
}

export async function getCachedSubjects(): Promise<Subject[] | null> {
    // Check force reload flag first
    const forceReload = sessionStorage.getItem(FORCE_RELOAD_KEY);
    if (forceReload) {
        sessionStorage.removeItem(FORCE_RELOAD_KEY);
        return null;
    }

    try {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(CACHE_KEY);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const entry = request.result as CacheEntry | undefined;
                if (!entry) {
                    resolve(null);
                    return;
                }

                const cacheAge = Date.now() - entry.timestamp;
                if (cacheAge > CACHE_DURATION_MS) {
                    resolve(null);
                    return;
                }

                resolve(entry.subjects);
            };

            transaction.oncomplete = () => db.close();
        });
    } catch {
        return null;
    }
}

export async function setCachedSubjects(subjects: Subject[]): Promise<void> {
    try {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const entry: CacheEntry = {
                key: CACHE_KEY,
                subjects,
                timestamp: Date.now(),
            };

            const request = store.put(entry);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();

            transaction.oncomplete = () => db.close();
        });
    } catch {
        // Silently fail - caching is optional
    }
}

export function invalidateCache(): void {
    sessionStorage.setItem(FORCE_RELOAD_KEY, 'true');
}
