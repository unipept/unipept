import BrowserStorageVisitor from "./BrowserStorageVisitor";
import MetaGenomicsAssay from "../../assay/MetaGenomicsAssay";
import MetaProteomicsAssay from "../../assay/MetaProteomicsAssay";
import { BrowserStorageConsts } from "./BrowserStorageConsts";

export default class BrowserStorageRemover extends BrowserStorageVisitor
{
    async visitMetaGenomicsAssay(mgAssay: MetaGenomicsAssay): Promise<void> 
    {
        throw new Error("Method not implemented.");
    }
    
    async visitMetaProteomicsAssay(mpAssay: MetaProteomicsAssay): Promise<void> 
    {
        let storage: Storage = this.getStorage();
        storage.removeItem(BrowserStorageConsts.MPA_METADATA_PREFIX + mpAssay.getId());
        storage.removeItem(BrowserStorageConsts.MPA_PEPTIDE_PREFIX + mpAssay.getId());
    }
}