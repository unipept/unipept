import MetaGenomicsAssay from "../../assay/MetaGenomicsAssay";
import MetaProteomicsAssay from "../../assay/MetaProteomicsAssay";
import { BrowserStorageConsts } from "./BrowserStorageConsts";
import BrowserStorageVisitor from "./BrowserStorageVisitor";

export default class BrowserStorageDataReader extends BrowserStorageVisitor
{
    async visitMetaGenomicsAssay(mgAssay: MetaGenomicsAssay): Promise<void> 
    {
        throw new Error("Method not implemented.");
    }
    
    async visitMetaProteomicsAssay(mpAssay: MetaProteomicsAssay): Promise<void> 
    {
        let storage: Storage = this.getStorage();
        let peptidesSerialized = storage.getItem(BrowserStorageConsts.MPA_PEPTIDE_PREFIX + mpAssay.getId());

        if (peptidesSerialized == null) 
        {
            throw "Peptides for dataset " + mpAssay.getId() + " are not available in browser's storage!";
        }

        let parsedPeptides = JSON.parse(peptidesSerialized);
        mpAssay.peptideContainer.setPeptides(parsedPeptides.peptides);
    }
}