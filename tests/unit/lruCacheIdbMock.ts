// In-memory replacement for lru-cache-idb, because Node has no IndexedDB.
// Use it with vi.mock("lru-cache-idb", () => import(".../lruCacheIdbMock")) and clear memoryCache in beforeEach.
export const memoryCache = new Map<string, unknown>();

export function createCacheIdb<T>() {
    return {
        getAll: async (keys: string[]) =>
            new Map(keys.filter(key => memoryCache.has(key)).map(key => [key, memoryCache.get(key) as T])),
        setAll: async (entries: Map<string, T>) => {
            entries.forEach((value, key) => memoryCache.set(key, value));
        },
    };
}
