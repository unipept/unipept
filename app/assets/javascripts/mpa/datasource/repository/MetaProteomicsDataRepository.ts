import DataRepository from "../DataRepository";
import GoDataSource from "./../GoDataSource";
import TaxaDataSource from "./../TaxaDataSource";
import EcDataSource from "./../EcDataSource";

import { PeptideContainerProcessor } from '../../processors/peptide/container/PeptideContainerProcessor';
import { ProcessedPeptideContainer } from "../../ProcessedPeptideContainer";
import { TaxaPeptideProcessor } from '../../processors/peptide/TaxaPeptideProcessor'
import { GOPeptideProcessor } from "../../processors/peptide/GOPeptideProcessor";
import { ECPeptideProcessor } from "../../processors/peptide/ECPeptideProcessor";
import MetaProteomicsAssay from "../../assay/MetaProteomicsAssay";

export default class MetaProteomicsDataRepository extends DataRepository
{
    private _metaproteomicsAssay: MetaProteomicsAssay;

    private _processor: PeptideContainerProcessor;
    private _processedPeptideContainer: Promise<ProcessedPeptideContainer>;

    private _mpaConfig: MPAConfig;

    public constructor(metaProteomicsAssay: MetaProteomicsAssay, mpaConfig: MPAConfig) 
    {
        super()
        
        this._metaproteomicsAssay = metaProteomicsAssay;

        this._processor = new PeptideContainerProcessor();
        this._processor.registerProgressListener(metaProteomicsAssay);

        this._mpaConfig = mpaConfig;
    }

    protected async initTaxaDataSource(): Promise<void> 
    {
        let processedPeptideContainer = await this._processedPeptideContainer;
        this._taxaSourceCache = new TaxaDataSource(
            TaxaPeptideProcessor.process(processedPeptideContainer), this);
    }

    protected async initGoDataSource(): Promise<void> 
    {
        let processedPeptideContainer = await this._processedPeptideContainer;
        this._goSourceCache = new GoDataSource(
                GOPeptideProcessor.process(processedPeptideContainer),
                processedPeptideContainer, 
                this
            );
    }

    protected async initEcDataSource(): Promise<void> 
    {
        let processedPeptideContainer = await this._processedPeptideContainer;
        this._ecSourceCache = new EcDataSource(
                ECPeptideProcessor.process(processedPeptideContainer),
                processedPeptideContainer,
                this
            );
    }

    async initProcessedPeptideContainer() : Promise<ProcessedPeptideContainer>
    {
        if (!this._processedPeptideContainer) {
            this._processedPeptideContainer = this._processor.process(this._metaproteomicsAssay.peptideContainer, this._mpaConfig);
        }
        return this._processedPeptideContainer;
    }
}