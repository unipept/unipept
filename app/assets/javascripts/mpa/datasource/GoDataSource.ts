import DataElement from "./DataElement";
import DataRepository from "./DataRepository";
import { GoNameSpace } from "../../fa/GoNameSpace";
import DataSource from "./DataSource";
import GoTerm from "../../fa/GoTerm";
import FATrust from "../../fa/FATrust";
import sha256 from "crypto-js/sha256";
import { MPAFAResult } from "../newworker";

/**
 * A GoDataSource can be used to access all GoTerms associated with a specific Sample. Note that this class contains
 * an extensive cache that reduces the amount of information that must be transfered between the server and the client's
 * browser.
 * 
 * @see Sample
 */
export default class GoDataSource extends DataSource  {
    // Map that caches the original set of GoTerms
    private _originalTerms: Map<GoNameSpace, GoTerm[]> = new Map();
    // Map that caches the original set of Trusts.
    private _originalTrust: Map<GoNameSpace, FATrust> = new Map();

    // Keeps track of the 5 last requested items in this cache. It maps a sequence list hash onto all information
    // associated with this sequence list and cutoff.
    private _cache: Map<string, Map<GoNameSpace, [GoTerm[], FATrust]>> = new Map(); 
    // This list is used to check what the 5 last requested items were. This list contains (in order) the hashes of
    // the 5 last requested sequence lists. Note that the original terms are not accounted as one item in the cache.
    private _cachedSequencesLRU: string[] = [];

    private static readonly MAX_CACHE_SIZE: number = 5;

    public async getTopItems(n: number, namespace: GoNameSpace): Promise<GoTerm[]> {
        return null;
    }

    /**
     * Get all GO-terms for a specific cutoff, and taking into account only those sequences found in the given
     * sequences array.
     * 
     * @param namespace the specific GO namespace for which GO-terms should be returned.
     * @param cutoff as percent (0-100)
     * @param sequences array of peptides to take into account
     */
    public async getGoTerms(namespace: GoNameSpace, cutoff: number = 50, sequences: string[] = null): Promise<GoTerm[]> {
        let result: [GoTerm[], FATrust] = await this.getFromCache(namespace, cutoff, sequences);
        return result[0];
    }

    /**
     * Get the Trust level of some specific configuration for retrieving GO-terms.
     * 
     * @param namespace 
     * @param cutoff 
     * @param sequences 
     */
    public async getTrust(namespace: GoNameSpace, cutoff: number = 50, sequences: string[] = null): Promise<FATrust> {
        let result: [GoTerm[], FATrust] = await this.getFromCache(namespace, cutoff, sequences);
        return result[1];
    }

    private async computeGoTerms(percent = 50, sequences = null): Promise<[Map<GoNameSpace, GoTerm[]>, Map<GoNameSpace, FATrust>]> {
        let worker = await this._repository.getWorker();

        let {data, trust} = await worker.summarizeGo(percent, sequences);

        let dataOutput: Map<GoNameSpace, GoTerm[]> = new Map();
        for (let namespace of Object.values(GoNameSpace)) {
            let items: MPAFAResult[] = data[namespace];
            let convertedItems: GoTerm[] = [];
            for (let item of items) {
                let namespace: GoNameSpace;

                if (item.namespace === GoNameSpace.BiologicalProcess.toString()) {
                    namespace = GoNameSpace.BiologicalProcess;
                } else if (item.namespace === GoNameSpace.CellularComponent.toString()) {
                    namespace = GoNameSpace.CellularComponent;
                } else {
                    namespace = GoNameSpace.MolecularFunction;
                }

                convertedItems.push(new GoTerm(item.code, item.name, namespace, item.numberOfPepts, item.fractionOfPepts));
            }
            dataOutput.set(namespace, convertedItems);
        }

        let trustOutput: Map<GoNameSpace, FATrust> = new Map();
        for (let namespace of Object.values(GoNameSpace)) {
            let originalTrust: {trustCount: number, annotatedCount: number, totalCount: number} = trust[namespace];
            let convertedTrust: FATrust = new FATrust();
            convertedTrust.trustCount = originalTrust.trustCount;
            convertedTrust.annotatedCount = originalTrust.annotatedCount;
            convertedTrust.totalCount = originalTrust.totalCount;

            trustOutput.set(namespace, convertedTrust);
        }
        
        return [dataOutput, trustOutput];
    }

    private async getFromCache(namespace: GoNameSpace, cutoff: number = 50, sequences: string[] = null): Promise<[GoTerm[], FATrust]> {
        // If no sequences are given, we need to check the original cache
        if ((sequences === null || sequences.length === 0) && cutoff == 50) {
            if (!this._originalTerms.has(namespace)) {
                // If it's not in the cache, add it!
                let result: [Map<GoNameSpace, GoTerm[]>, Map<GoNameSpace, FATrust>] = await this.computeGoTerms(cutoff, sequences);
                for (let ns of Object.values(GoNameSpace)) {
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
                let result: [Map<GoNameSpace, GoTerm[]>, Map<GoNameSpace, FATrust>] = await this.computeGoTerms(cutoff, sequences);
                // Enter the item into the cache
                this._cachedSequencesLRU.unshift(sequenceHash);
                let cacheMap: Map<GoNameSpace, [GoTerm[], FATrust]> = new Map();
                for (let namespace of Object.values(GoNameSpace)) {
                    cacheMap.set(namespace, [result[0].get(namespace), result[1].get(namespace)]);
                }
                this._cache.set(sequenceHash, cacheMap);

                // Remove the item that's currently last in the cache (if the cache is full)
                if (this._cachedSequencesLRU.length > GoDataSource.MAX_CACHE_SIZE) {
                    let hashToRemove: string = this._cachedSequencesLRU.pop();
                    this._cache.delete(hashToRemove);
                }

                // Now return the item we have just put into the cache
                return this._cache.get(sequenceHash).get(namespace);
            }
        }        
    }
}
