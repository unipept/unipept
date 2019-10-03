import Assay from "./Assay";
import PeptideContainer from "../PeptideContainer";
import Visitor from "../visitors/Visitor";
import DataRepository from "../datasource/DataRepository";

export default class MetaProteomicsAssay extends Assay
{
    public peptideContainer: PeptideContainer = new PeptideContainer();

    async initDataRepository(mpaConfig: MPAConfig) 
    {
        this._dataRepository = new DataRepository(this.peptideContainer, mpaConfig);
        await this._dataRepository.getProcessedPeptideContainer()
    }

    async visit(visitor: Visitor): Promise<void> 
    {
        await visitor.visitMetaProteomicsAssay(this);
    }
}