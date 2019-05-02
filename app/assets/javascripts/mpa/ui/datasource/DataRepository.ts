import Resultset from "../../Resultset";
import GoDataSource from "./GoDataSource";
import Sample from "../../Sample";
import TaxaDataSource from "./TaxaDataSource";
import ProgressListener from "../../ProgressListener";
import Tree from "../../Tree";

// @ts-ignore
import worker from "workerize-loader!./worker.js";
import PeptideInfo from "../../PeptideInfo";
import { postJSON } from "../../../utils";
import NewGoTerms from "../../../fa/NewGoTerms";
import GoTerm from "../../../fa/GoTerm";
import { GoNameSpace } from "../../../fa/GoNameSpace";


export default class DataRepository {
    private readonly _sample: Sample;
    private _progressListeners: ProgressListener[] = [];
    private _tree: Tree;
    private _mpaConfig: MPAConfig;
    // Maps a namespace onto a GoDataSource object. This map functions as a cache for these DataSources.
    private _goDataSources: Map<string, GoDataSource> = new Map();
    private _goTerms: Map<GoNameSpace, GoTerm> = new Map();

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
     * 
     * @param namespace The GO-namespace for which a new DataSource should be constructed.
     */
    public async createGoDataSource(namespace: GoNameSpace): Promise<GoDataSource> {
        await this.process();
        let source: GoDataSource = this._goDataSources.get(namespace);
        if (source) {
            return source;
        } else {
            source = new GoDataSource(this, namespace);
            this._goDataSources.set(namespace, source);
            return source;
        }
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

        let wrkr = worker();
        wrkr.onmessage = m => {
            if (m.data.type == "progress") {
                this.setWorkerProgress(m.data.value);
            }
        };

        let {processed, missed, numMatched, numSearched}: {processed: PeptideInfo[], missed: string[], numMatched: number, numSearched: number} 
            = await wrkr.process(this._sample.originalPeptides, this._mpaConfig);
        let processedPeptides: Map<string, PeptideInfo> = new Map();
        for (const p of processed) {
            processedPeptides.set(p.sequence, p);
        }

        this._tree = new Tree(processed);
        const taxonInfo = await Sample.getTaxonInfo(this._tree.getTaxa());
        this._tree.setTaxonNames(taxonInfo);
        this._tree.sortTree();
    }

    /**
     * Fetches the taxon info from the Unipept API for a list of taxon id's and returns an Array of objects containing 
     * the id, name and rank for each result.
     *
     * @param taxids Array containing taxon id integers
     * @return containing an array of result objects
     * with id, name and rank fields
     */
    private static getTaxonInfo(taxids: number[]): Promise<TaxonInfo[]> {
        return postJSON(Sample.TAXA_URL, JSON.stringify({taxids: taxids}));
    }
}