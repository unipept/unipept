import GoDataSource from "./GoDataSource";
import Sample from "../Sample";
import TaxaDataSource from "./TaxaDataSource";
import ProgressListener from "../ProgressListener";

import EcDataSource from "./EcDataSource";

import {PeptideContainerProcessor} from '../processors/peptide/container/PeptideContainerProcessor';
import { ProcessedPeptideContainer } from "../ProcessedPeptideContainer";
import { TaxaPeptideProcessor } from '../processors/peptide/TaxaPeptideProcessor'
import { GOPeptideProcessor } from "../processors/peptide/GOPeptideProcessor";

// @ts-ignore
import newworker from "workerize-loader!./../newworker.js";
import { ECPeptideProcessor } from "../processors/peptide/ECPeptideProcessor";

export default class DataRepository {
    private readonly _sample: Sample;
    private _progressListeners: ProgressListener[] = [];

    private _processor: PeptideContainerProcessor;
    private _processedPeptideContainer: Promise<ProcessedPeptideContainer>;

    // TODO: get rid of this worker
    private _worker;
    private _workerPromise: Promise<any>;

    private _mpaConfig: MPAConfig;

    private _taxaSourceCache: TaxaDataSource;
    private _goSourceCache: GoDataSource;
    private _ecSourceCache: EcDataSource;

    public constructor(sample: Sample, mpaConfig: MPAConfig) {
        this._processor = new PeptideContainerProcessor();

        this._sample = sample;
        this._mpaConfig = mpaConfig;
    }

    public registerProgressListener(listener: ProgressListener): void {
        this._progressListeners.push(listener);
    }

    public async createTaxaDataSource(): Promise<TaxaDataSource> {
        if (!this._taxaSourceCache) 
        {
            let processedPeptideContainer = await this._processedPeptideContainer;
            this._taxaSourceCache = new TaxaDataSource(
                TaxaPeptideProcessor.process(processedPeptideContainer), this);
        }
        return this._taxaSourceCache;
    }

    /**
     * Creates a new GoDataSource, or returns one from the cache if the requested namespace was already queried.
     */
    public async createGoDataSource(): Promise<GoDataSource> {
        if (!this._goSourceCache) 
        {
            let processedPeptideContainer = await this._processedPeptideContainer;
            this._goSourceCache = new GoDataSource(
                GOPeptideProcessor.process(processedPeptideContainer),
                processedPeptideContainer, 
                this
            );
        }
        return this._goSourceCache;
    }

    public async createEcDataSource(): Promise<EcDataSource> {
        if (!this._ecSourceCache) 
        {
            let processedPeptideContainer = await this._processedPeptideContainer;
            this._ecSourceCache = new EcDataSource(
                ECPeptideProcessor.process(processedPeptideContainer),
                processedPeptideContainer,
                this
            );
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
    public async getProcessedPeptideContainer() : Promise<ProcessedPeptideContainer>{
        if (!this._processedPeptideContainer) {
            this._processedPeptideContainer = this._processor.process(this._sample.peptideContainer, this._mpaConfig);
        }
        return this._processedPeptideContainer;
    }

    public async getWorker(): Promise<any> {
        if (!this._workerPromise) {
            let peptides = await this._sample.peptideContainer.getPeptides();
            peptides = Sample.cleanPeptides(peptides);

            this._worker = newworker();
            this._worker.onmessage = m => {
                if (m.data.type == "progress") {
                    this.setWorkerProgress(m.data.value);
                }
            };

            this._workerPromise = this._worker.process(peptides, this._mpaConfig);
        }
        await this._workerPromise;
        return this._worker;
    }
}