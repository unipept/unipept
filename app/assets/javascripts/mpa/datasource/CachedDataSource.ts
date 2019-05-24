import DataSource from "./DataSource";
import FAElement from "../../fa/FAElement";
import FATrust from "../../fa/FATrust";
import sha256 from "crypto-js/sha256";

/**
 * This abstract class provides a generic caching mechanism that can be used for each kind of functional annotation
 * with support for some kind of namespace.
 * 
 * @template T This is the type of namespace that's for caching.
 * @template S This is the type of FAElement that's used for caching.
 */
export abstract class CachedDataSource<T, S extends FAElement> extends DataSource {
    // Map that caches the original set of GoTerms
    protected _originalTerms: Map<T, S[]> = new Map();
    // Map that caches the original set of Trusts.
    protected _originalTrust: Map<T, FATrust> = new Map();

    // Keeps track of the 5 last requested items in this cache. It maps a sequence list hash onto all information
    // associated with this sequence list and cutoff. Note that every list per namespace in the cache is sorted by
    // popularity!
    protected _cache: Map<string, Map<T, [S[], FATrust]>> = new Map(); 
    // This list is used to check what the 5 last requested items were. This list contains (in order) the hashes of
    // the 5 last requested sequence lists. Note that the original terms are not accounted as one item in the cache.
    protected _cachedSequencesLRU: string[] = [];

    protected _inProgress: Map<string, Promise<[Map<T, S[]>, Map<T, FATrust>]>> = new Map();

    protected static readonly MAX_CACHE_SIZE: number = 5;

    protected abstract async computeTerms(percent: number, sequences: string[]): Promise<[Map<T, S[]>, Map<T, FATrust>]>;

    protected async getFromCache(namespace: T, existingNamespaces: T[], cutoff: number = 50, sequences: string[] = null): Promise<[S[], FATrust]> {
        // If no sequences are given, we need to check the original cache
        if ((sequences === null || sequences.length === 0) && cutoff == 50) {
            if (!this._originalTerms.has(namespace)) {
                // If it's not in the cache, add it!

                let result: [Map<T, S[]>, Map<T, FATrust>] = await this.computeTerms(cutoff, sequences);

                for (let ns of existingNamespaces) {
                    this._originalTerms.set(ns, result[0].get(ns));
                    this._originalTrust.set(ns, result[1].get(ns));
                }
            } 
            return [this._originalTerms.get(namespace), this._originalTrust.get(namespace)];
        } else {
            let sequenceHash: string;
            if (sequences === null) {
                sequenceHash = cutoff.toString();
            } else {
                sequenceHash = sha256(sequences.toString()).toString() + cutoff;
            }

            let idx: number = this._cachedSequencesLRU.indexOf(sequenceHash);
            
            if (idx >= 0) {
                // We just need to retrieve the item from the cache, mark it as used, and return it
                this._cachedSequencesLRU.splice(idx, 1);
                this._cachedSequencesLRU.unshift(sequenceHash);
                return this._cache.get(sequenceHash).get(namespace);
            } else {
                // The item is not currently stored in the cache. We need to get it.
                let result: [Map<T, S[]>, Map<T, FATrust>] = await this.computeTerms(cutoff, sequences);

                // Enter the item into the cache
                this._cachedSequencesLRU.unshift(sequenceHash);
                let cacheMap: Map<T, [S[], FATrust]> = new Map();
                for (let namespace of existingNamespaces) {
                    cacheMap.set(namespace, [result[0].get(namespace), result[1].get(namespace)]);
                }
                this._cache.set(sequenceHash, cacheMap);

                // Remove the item that's currently last in the cache (if the cache is full)
                if (this._cachedSequencesLRU.length > CachedDataSource.MAX_CACHE_SIZE) {
                    let hashToRemove: string = this._cachedSequencesLRU.pop();
                    this._cache.delete(hashToRemove);
                }

                // Now return the item we have just put into the cache
                return this._cache.get(sequenceHash).get(namespace);
            }
        }
    }

    protected agregateTrust(trusts: FATrust[]): FATrust {
        // TODO this should be fixed!
        const result = {annotatedCount: 0, totalCount: null, trustCount: 0};
        let sumAnnotated = 0;
        for (const c of trusts) {
            console.log(c.annotatedCount);
            sumAnnotated += c.annotatedCount;
            if (c.annotatedCount > result.annotatedCount) {
                result.annotatedCount = c.annotatedCount;
            }
            if (result.totalCount === null) {
                result.totalCount = c.totalCount;
            }

            if (c.totalCount !== result.totalCount) {
                return null;
            }

            result.trustCount += c.trustCount;
        }
        result.trustCount = (result.trustCount / sumAnnotated) * result.annotatedCount;
        return new FATrust(result.annotatedCount, result.totalCount, result.trustCount);
    }
}