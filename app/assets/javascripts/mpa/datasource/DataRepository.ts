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
import EcDataSource from "./EcDataSource";


export default class DataRepository {
    private readonly _sample: Sample;
    private _progressListeners: ProgressListener[] = [];
    private _worker;
    private _mpaConfig: MPAConfig;

    private _taxaSourceCache: TaxaDataSource;
    private _goSourceCache: GoDataSource;
    private _ecSourceCache: EcDataSource;

    public constructor(sample: Sample, mpaConfig: MPAConfig) {
        this._sample = sample;
        this._mpaConfig = mpaConfig;
    }

    public registerProgressListener(listener: ProgressListener): void {
        this._progressListeners.push(listener);
    }

    public async createTaxaDataSource(): Promise<TaxaDataSource> {
        if (!this._taxaSourceCache) {
            this._taxaSourceCache = new TaxaDataSource(this);
        }
        return this._taxaSourceCache;
    }

    /**
     * Creates a new GoDataSource, or returns one from the cache if the requested namespace was already queried.
     */
    public async createGoDataSource(): Promise<GoDataSource> {
        if (!this._goSourceCache) {
            this._goSourceCache = new GoDataSource(this);
        }
        return this._goSourceCache;
    }

    public async createEcDataSource(): Promise<EcDataSource> {
        if (!this._ecSourceCache) {
            this._ecSourceCache = new EcDataSource(this);
        }
        return this._ecSourceCache;
    }

    public setWorkerProgress(value: number): void {
        for (let listener of this._progressListeners) {
            listener.onProgressUpdate(value);
        }
    }

    /**
     * Returns a fully prepared worker. The worker is initialized with the required state and has already processed
     * all peptides found in this repository's associated sample.
     */
    public async getWorker(): Promise<any> {
        if (!this._worker) {
            this._worker = newworker();
            this._worker.onmessage = m => {
                if (m.data.type == "progress") {
                    this.setWorkerProgress(m.data.value);
                }
            };

            await this._worker.process(this._sample.originalPeptides, this._mpaConfig);
        }
        return this._worker;
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