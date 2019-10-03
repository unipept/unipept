import { MetaGenomicsAssay } from "../../assay/MetaGenomicsAssay";
import { MetaProteomicsAssay } from "../../assay/MetaProteomicsAssay";
import { BrowserStorageConsts } from "./BrowserStorageConsts";
import PeptideContainer from "../../PeptideContainer";
import BrowserStorageVisitor from "./BrowserStorageVisitor";

export default class BrowserStorageWriter extends BrowserStorageVisitor
{
    async visitMetaGenomicsAssay(mgAssay: MetaGenomicsAssay): Promise<void> 
    {
        throw new Error("Method not implemented.");
    }    
    
    async visitMetaProteomicsAssay(mpAssay: MetaProteomicsAssay): Promise<void> 
    {
        let storage: Storage = this.getStorage();
        let peptideContainer: PeptideContainer = mpAssay.peptideContainer;

        let metadata = JSON.stringify({
            id: mpAssay.id,
            name: mpAssay.name,
            amount: peptideContainer.getAmountOfPeptides(),
            date: mpAssay.getDateFormatted(),
            type: mpAssay.storageType
        });

        storage.setItem(BrowserStorageConsts.MPA_METADATA_PREFIX + mpAssay.id, metadata);
        storage.setItem(BrowserStorageConsts.MPA_PEPTIDE_PREFIX + mpAssay.id, JSON.stringify({peptides: peptideContainer.getPeptides()}));
    }
}