import { MetaGenomicsAssay } from "../../assay/MetaGenomicsAssay";
import { MetaProteomicsAssay } from "../../assay/MetaProteomicsAssay";
import { BrowserStorageConsts } from "./BrowserStorageConsts";
import BrowserStorageVisitor from "./BrowserStorageVisitor";

export default class LocalStorageMetadataReader extends BrowserStorageVisitor
{
    async visitMetaGenomicsAssay(mgAssay: MetaGenomicsAssay): Promise<void> 
    {
        throw new Error("Method not implemented.");
    }
    
    async visitMetaProteomicsAssay(mpAssay: MetaProteomicsAssay): Promise<void> 
    {
        let storage: Storage = this.getStorage();
        let serializedMetadata = storage.getItem(BrowserStorageConsts.MPA_METADATA_PREFIX + mpAssay.id);
        let parsedMeta = JSON.parse(serializedMetadata);
        mpAssay.name = parsedMeta.name;
        let splitDate = parsedMeta.date.split("/");
        mpAssay.date = new Date(splitDate[0], splitDate[1] - 1, splitDate[2]);
        mpAssay.peptideContainer.setAmountOfPeptides(parsedMeta.amount);
    }
}