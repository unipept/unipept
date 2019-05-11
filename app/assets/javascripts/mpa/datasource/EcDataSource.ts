import DataSource from "./DataSource";
import DataElement from "./DataElement";
import EcNumber from "../../fa/EcNumber";
import { EcNameSpace, convertEcNumberToEcNameSpace } from "../../fa/EcNameSpace";
import FATrust from "../../fa/FATrust";
import { MPAFAResult } from "../newworker";
import { CachedDataSource } from "./CachedDataSource";

export default class EcDataSource extends CachedDataSource<EcNameSpace, EcNumber> {
    /**
     * Retrieve the top n EC-Numbers for a specific namespace. If the namespace is not specified (null), the resulting
     * EC-Numbers will not be restricted to a specific namespace.
     * 
     * @param n The amount of EC-numbers that should be returned. If n is bigger than the amount of EC-Numbers available
     * all available numbers will be returned and the result will contain less than n numbers.
     * @param namespace The EC namespace to which the returned results should belong. Leave blanco if no filtering
     * should be performed.
     * @return A list of EC-Numbers, sorted by popularity.
     */
    public async getTopItems(n: number, namespace: EcNameSpace = null): Promise<EcNumber[]> {
        return null;
    }

    /**
     * Returns a list of EC-Numbers that satisfy the given filtering requirements.
     * 
     * @param namespace The EC-Namespace to which all returned EC-Numbers should belong. If this is null, EC-Numbers
     * from all namespaces will be returned.
     * @param cutoff 
     * @param sequences 
     */
    public async getEcNumbers(namespace: EcNameSpace = null, cutoff: number = 50, sequences: string[] = null): Promise<EcNumber[]> {
        if (namespace) {
            let result: [EcNumber[], FATrust] = await this.getFromCache(namespace, Object.values(EcNameSpace), cutoff, sequences);
            return result[0];
        } else {
            let output: EcNumber[] = [];
            for (let ns of Object.values(EcNameSpace)) {
                let result: [EcNumber[], FATrust] = await this.getFromCache(ns, Object.values(EcNameSpace), cutoff, sequences);
                console.log(result);
                output.push(... result[0]);
            }
            output.sort((a: EcNumber, b: EcNumber) => b.popularity - a.popularity);
            return output;
        }
    }

    protected async computeTerms(percent = 50, sequences = null): Promise<[Map<EcNameSpace, EcNumber[]>, Map<EcNameSpace, FATrust>]> {
        let worker = await this._repository.getWorker();

        let {data, trust} = await worker.summarizeEc(percent, sequences);
        let dataOutput: Map<EcNameSpace, EcNumber[]> = new Map();
        for (let namespace of Object.values(EcNameSpace)) {
            let items: MPAFAResult[] = data[namespace];
            let convertedItems: EcNumber[] = [];
            for (let item of items) {
                convertedItems.push(new EcNumber(item.code, item.name, namespace, item.numberOfPepts, item.fractionOfPepts));
            }
            dataOutput.set(namespace, convertedItems);
        }

        let trustOutput: Map<EcNameSpace, FATrust> = new Map();
        for (let namespace of Object.values(EcNameSpace)) {
            let originalTrust: {trustCount: number, annotatedCount: number, totalCount: number} = trust[namespace];
            let convertedTrust: FATrust = new FATrust(originalTrust.annotatedCount, originalTrust.totalCount, originalTrust.trustCount);
            trustOutput.set(namespace, convertedTrust);
        }

        return [dataOutput, trustOutput];
    }
}
