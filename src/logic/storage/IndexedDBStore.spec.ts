import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IndexedDBStore } from './IndexedDBStore';

describe('IndexedDBStore', () => {
    let store: IndexedDBStore;
    const dbName = 'test-db';
    const storeName = 'test-store';

    beforeEach(async () => {
        // Clear DB
        const req = indexedDB.deleteDatabase(dbName);
        await new Promise((resolve, reject) => {
            req.onsuccess = resolve;
            req.onerror = reject;
            req.onblocked = () => {
                // If blocked, it means a connection is still open.
                // We shouldn't reach here if afterEach works, but just in case.
                console.warn('DB delete blocked');
            };
        });

        store = new IndexedDBStore(dbName, storeName);
    });

    afterEach(async () => {
        if (store) {
            await store.close();
        }
    });

    it('should set and get items', async () => {
        await store.setItem('key1', 'value1');
        const val = await store.getItem<string>('key1');
        expect(val).toBe('value1');
    });

    it('should return null for missing items', async () => {
        const val = await store.getItem<string>('missing');
        expect(val).toBeNull();
    });

    it('should remove items', async () => {
        await store.setItem('key1', 'value1');
        await store.removeItem('key1');
        const val = await store.getItem<string>('key1');
        expect(val).toBeNull();
    });

    it('should list keys', async () => {
        await store.setItem('key1', 'value1');
        await store.setItem('key2', 'value2');
        const keys = await store.keys();
        expect(keys.sort()).toEqual(['key1', 'key2']);
    });

    it('should store objects', async () => {
        const obj = { foo: 'bar', baz: 123 };
        await store.setItem('obj', obj);
        const val = await store.getItem<{ foo: string, baz: number }>('obj');
        expect(val).toEqual(obj);
    });

    it('should store Blobs', async () => {
        // Blob constructor might not be available in Node environment without polyfill?
        // fake-indexeddb handles IDB logic, but Blob is a global.
        // Node 18+ has Blob global. Vitest environment is node by default but we can check.
        // If not available, we can skip or mock.
        if (typeof Blob !== 'undefined') {
            const blob = new Blob(['hello world'], { type: 'text/plain' });
            await store.setItem('blob', blob);
            const val = await store.getItem<Blob>('blob');
            expect(val).toBeInstanceOf(Blob);
            expect(await val?.text()).toBe('hello world');
        } else {
            console.warn('Blob not available, skipping test');
        }
    });
});
