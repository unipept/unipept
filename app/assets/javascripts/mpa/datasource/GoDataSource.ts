import DataElement from "./DataElement";
import DataRepository from "./DataRepository";
import { GoNameSpace } from "../../fa/GoNameSpace";
import DataSource from "./DataSource";
import GoTerm from "../../fa/GoTerm";
import FATrust from "../../fa/FATrust";

export default class GoDataSource extends DataSource  {
    private _namespace: GoNameSpace;
    private _originalTerms: Map<GoNameSpace, GoTerm[]> = new Map();
    private _originalTrust: Map<GoNameSpace, FATrust> = new Map();

    // TODO fix cache!
    private _cache; 

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
        // Cache can only be used when no items were given!
        if (sequences === null || sequences.length === 0) {
            if (this._originalTerms.has(namespace)) {
                return this._originalTerms.get(namespace);
            }
        }
        let result: [Map<GoNameSpace, GoTerm[]>, Map<GoNameSpace, FATrust>] = await this._repository.computeGoTerms(cutoff, sequences);

        if (sequences === null || sequences.length === 0) {
            for (let ns of Object.keys(GoNameSpace)) {
                this._originalTerms.set(ns as GoNameSpace, result[0].get(ns as GoNameSpace));
                this._originalTrust.set(ns as GoNameSpace, result[1].get(ns as GoNameSpace));
            }
        }

        return result[0].get(namespace);
    }

    public async getTrust(namespace: GoNameSpace, cutoff: number = 50, sequences: string[] = null): Promise<FATrust> {
        // Cache can only be used when no items were given!
        if (sequences === null || sequences.length === 0) {
            if (this._originalTrust.has(namespace)) {
                return this._originalTrust.get(namespace);
            }
        }

        let result: [Map<GoNameSpace, GoTerm[]>, Map<GoNameSpace, FATrust>] = await this._repository.computeGoTerms(cutoff, sequences);

        if (sequences === null || sequences.length === 0) {
            for (let ns of Object.keys(GoNameSpace)) {
                this._originalTerms.set(ns as GoNameSpace, result[0].get(ns as GoNameSpace));
                this._originalTrust.set(ns as GoNameSpace, result[1].get(ns as GoNameSpace));
            }
        }

        return result[1].get(namespace);
    }
}
