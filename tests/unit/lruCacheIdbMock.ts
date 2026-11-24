// In-memory replacement for lru-cache-idb, because Node has no IndexedDB.
// Use it with vi.mock("lru-cache-idb", () => import(".../lruCacheIdbMock")) and clear memoryCache in beforeEach.
export const memoryCache = new Map<string, unknown>();

export function createCacheIdb<T>() {
    return {
        get: async (key: string) => memoryCache.get(key) as T | undefined,
        set: async (key: string, value: T) => {
            memoryCache.set(key, value);
        },
    };
}
