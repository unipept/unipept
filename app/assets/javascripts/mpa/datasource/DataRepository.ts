import GoDataSource from "./GoDataSource";
import TaxaDataSource from "./TaxaDataSource";
import ProgressListener from "../ProgressListener";

import EcDataSource from "./EcDataSource";

import {PeptideContainerProcessor} from '../processors/peptide/container/PeptideContainerProcessor';
import { ProcessedPeptideContainer } from "../ProcessedPeptideContainer";
import { TaxaPeptideProcessor } from '../processors/peptide/TaxaPeptideProcessor'
import { GOPeptideProcessor } from "../processors/peptide/GOPeptideProcessor";

import { ECPeptideProcessor } from "../processors/peptide/ECPeptideProcessor";
import ProgressPublisher from "../ProgressPublisher";
import PeptideContainer from "../PeptideContainer";

export default class DataRepository extends ProgressPublisher implements ProgressListener
{
    private _peptideContainer: PeptideContainer;

    private _processor: PeptideContainerProcessor;
    private _processedPeptideContainer: Promise<ProcessedPeptideContainer>;

    private _mpaConfig: MPAConfig;

    private _taxaSourceCache: TaxaDataSource;
    private _goSourceCache: GoDataSource;
    private _ecSourceCache: EcDataSource;

    public constructor(peptideContainer: PeptideContainer, mpaConfig: MPAConfig) 
    {
        super()
        
        this._peptideContainer = peptideContainer;

        this._processor = new PeptideContainerProcessor();
        this._processor.registerProgressListener(this);

        this._mpaConfig = mpaConfig;
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

    /**
     * Returns a fully prepared worker. The worker is initialized with the required state and has already processed
     * all peptides found in this repository's associated sample.
     */
    public async getProcessedPeptideContainer() : Promise<ProcessedPeptideContainer>{
        if (!this._processedPeptideContainer) {
            this._processedPeptideContainer = this._processor.process(this._peptideContainer, this._mpaConfig);
        }
        return this._processedPeptideContainer;
    }

    onProgressUpdate(progress: number): void 
    {
        this.updateProgress(progress)
    }
}