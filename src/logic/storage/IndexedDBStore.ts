export class IndexedDBStore {
    private dbName: string;
    private storeName: string;
    private dbPromise: Promise<IDBDatabase>;

    constructor(dbName: string, storeName: string) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.dbPromise = this.openDB();
    }

    private openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            // We use version 1. If localforage created the DB, it might be on a different version.
            // However, opening with a version creates a new version if needed.
            // If the DB exists and version is higher, open will fail unless we match it.
            // To be safe, we don't specify version initially to just open it, then check object stores?
            // No, standard way is to open with a specific version or let it be 'any' but 'any' doesn't trigger upgrade.
            // If we want to ensure object store exists, we must trigger upgrade.

            // localforage defaults to version 1.
            const request = indexedDB.open(this.dbName);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };

            request.onsuccess = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                // Check if store exists. If not, we might need to close and reopen with higher version.
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const currentVersion = db.version;
                    db.close();

                    const upgradeRequest = indexedDB.open(this.dbName, currentVersion + 1);
                    upgradeRequest.onupgradeneeded = (e) => {
                        const upgradedDb = (e.target as IDBOpenDBRequest).result;
                        if (!upgradedDb.objectStoreNames.contains(this.storeName)) {
                            upgradedDb.createObjectStore(this.storeName);
                        }
                    };
                    upgradeRequest.onsuccess = (e) => {
                        resolve((e.target as IDBOpenDBRequest).result);
                    };
                    upgradeRequest.onerror = (e) => {
                        reject((e.target as IDBOpenDBRequest).error);
                    };
                } else {
                    resolve(db);
                }
            };

            request.onerror = (event) => {
                reject((event.target as IDBOpenDBRequest).error);
            };
        });
    }

    public async getItem<T = any>(key: string): Promise<T | null> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], "readonly");
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result === undefined ? null : request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    public async setItem<T = any>(key: string, value: T): Promise<T> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.put(value, key);

            request.onsuccess = () => {
                resolve(value);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    public async removeItem(key: string): Promise<void> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(key);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    public async keys(): Promise<string[]> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], "readonly");
            const store = transaction.objectStore(this.storeName);
            const request = store.getAllKeys();

            request.onsuccess = () => {
                resolve(request.result.map(k => String(k)));
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    public async close(): Promise<void> {
        const db = await this.dbPromise;
        db.close();
    }
}
