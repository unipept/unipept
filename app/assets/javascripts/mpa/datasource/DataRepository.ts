import Resultset from "../Resultset";
import GoDataSource from "./GoDataSource";
import Sample from "../Sample";
import TaxaDataSource from "./TaxaDataSource";
import ProgressListener from "../ProgressListener";
import Tree from "../Tree";

// @ts-ignore
import newworker from "workerize-loader!./../newworker.js";
import PeptideInfo from "../PeptideInfo";
import { postJSON } from "../../utils";
import NewGoTerms from "../../fa/NewGoTerms";
import GoTerm from "../../fa/GoTerm";
import { GoNameSpace } from "../../fa/GoNameSpace";
import FATrust from "../../fa/FATrust";
import { MPAFAResult } from "../newworker";


export default class DataRepository {
    private readonly _sample: Sample;
    private _progressListeners: ProgressListener[] = [];
    private _tree: Tree;
    private _mpaConfig: MPAConfig;
    private _goTerms: Map<GoNameSpace, GoTerm> = new Map();
    private _worker;

    public constructor(sample: Sample, mpaConfig: MPAConfig) {
        this._sample = sample;
        this._mpaConfig = mpaConfig;
    }

    public registerProgressListener(listener: ProgressListener): void {
        this._progressListeners.push(listener);
    }

    public async createTaxaDataSource(): Promise<TaxaDataSource> {
        await this.process();
        return new TaxaDataSource(this);
    }

    /**
     * Creates a new GoDataSource, or returns one from the cache if the requested namespace was already queried.
     */
    public async createGoDataSource(): Promise<GoDataSource> {
        await this.process();
        return new GoDataSource(this);
    }

    public get tree(): Tree {
        return this._tree;
    }

    public setWorkerProgress(value: number): void {
        for (let listener of this._progressListeners) {
            listener.onProgressUpdate(value);
        }
    }

    /**
     * Compute all necessary data for the given sample using a worker thread.
     */
    private async process() {
        if (this._tree) {
            return;
        }

        this._worker = newworker();
        this._worker.onmessage = m => {
            if (m.data.type == "progress") {
                this.setWorkerProgress(m.data.value);
            }
        };

        let {processed, missed, numMatched, numSearched}: {processed: PeptideInfo[], missed: string[], numMatched: number, numSearched: number} 
            = await this._worker.process(this._sample.originalPeptides, this._mpaConfig);
        let processedPeptides: Map<string, PeptideInfo> = new Map();
        for (const p of processed) {
            processedPeptides.set(p.sequence, p);
        }

        this._tree = new Tree(processed);
        const taxonInfo = await Sample.getTaxonInfo(this._tree.getTaxa());
        this._tree.setTaxonNames(taxonInfo);
        this._tree.sortTree();
    }

    public async computeGoTerms(percent = 50, sequences = null): Promise<[Map<GoNameSpace, GoTerm[]>, Map<GoNameSpace, FATrust>]> {
        let {data, trust} = await this._worker.summarizeGo(percent, sequences);

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

    /**
     * Fetches the taxon info from the Unipept API for a list of taxon id's and returns an Array of objects containing 
     * the id, name and rank for each result.
     *
     * @param taxids Array containing taxon id integers
     * @return containing an array of result objects with id, name and rank fields
     */
    private static getTaxonInfo(taxids: number[]): Promise<TaxonInfo[]> {
        return postJSON(Sample.TAXA_URL, JSON.stringify({taxids: taxids}));
    }
}