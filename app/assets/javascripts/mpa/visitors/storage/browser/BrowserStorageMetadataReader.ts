import MetaGenomicsAssay from "../../../assay/MetaGenomicsAssay";
import MetaProteomicsAssay from "../../../assay/MetaProteomicsAssay";
import { BrowserStorageConsts } from "./BrowserStorageConsts";
import { BrowserStorageCommon } from "./BrowserStorageCommon";
import { StorageType } from "../../../StorageType";

export namespace BrowserStorageMetadataReader
{
    export async function readMetaGenomicsAssay(mgAssay: MetaGenomicsAssay, storageType: StorageType): Promise<void> 
    {
        throw new Error("Method not implemented.");
    }
    
    export async function readMetaProteomicsAssay(mpAssay: MetaProteomicsAssay, storageType: StorageType): Promise<void> 
    {
        let storage: Storage = BrowserStorageCommon.getStorage(storageType);
        let serializedMetadata = storage.getItem(BrowserStorageConsts.MPA_METADATA_PREFIX + mpAssay.getId());
        let parsedMeta = JSON.parse(serializedMetadata);
        mpAssay.setName(parsedMeta.name);
        let splitDate = parsedMeta.date.split("/");
        mpAssay.setDate(new Date(splitDate[0], splitDate[1] - 1, splitDate[2]));
        mpAssay.peptideContainer.setAmountOfPeptides(parsedMeta.amount);
    }
}