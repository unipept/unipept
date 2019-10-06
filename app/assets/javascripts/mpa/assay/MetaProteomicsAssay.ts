import Assay from "./Assay";
import PeptideContainer from "../PeptideContainer";
import Visitor from "../visitors/Visitor";
import MetaProteomicsDataRepository from "../datasource/repository/MetaProteomicsDataRepository";
import ProgressListener from "../ProgressListener";
import StorageDataReader from "../visitors/storage/StorageDataReader";

export default class MetaProteomicsAssay extends Assay implements ProgressListener
{
    public peptideContainer: PeptideContainer = new PeptideContainer();

    async initDataRepository(mpaConfig: MPAConfig) 
    {
        let dataReader = new StorageDataReader();
        await this.visit(dataReader);
        let dataRepo = new MetaProteomicsDataRepository(this, mpaConfig);
        await dataRepo.initProcessedPeptideContainer();
        this._dataRepository = dataRepo;
    }

    async visit(visitor: Visitor): Promise<void> 
    {
        await visitor.visitMetaProteomicsAssay(this);
    }

    /**
     * @returns The peptides that are stored in this container.
     */
    getPeptides(): string[]
    {
        return this.peptideContainer.getPeptides();
    }
    
    /**
     * Update the list of peptides that belong to this dataset. Note that the amount of peptides that stored is also
     * directly updated by this function. There's no need to invoke {@link PeptideContainer#setAmountOfPeptides}
     * afterwards.
     *
     * @param peptides The list of peptides that forms the heart of this dataset.
     */
    setPeptides(peptides: string[]) 
    {
        this.peptideContainer.setPeptides(peptides)
    }

    getAmountOfPeptides(): number 
    {
        return this.peptideContainer.getAmountOfPeptides();
    }

    setAmountOfPeptides(amount: number)
    {
        this.peptideContainer.setAmountOfPeptides(amount)
    }

    onProgressUpdate(progress: number): void 
    {
        this.progress = progress;
    }
}