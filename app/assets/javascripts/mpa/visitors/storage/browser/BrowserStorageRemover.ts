import MetaGenomicsAssay from "../../../assay/MetaGenomicsAssay";
import MetaProteomicsAssay from "../../../assay/MetaProteomicsAssay";
import { BrowserStorageConsts } from "./BrowserStorageConsts";
import { BrowserStorageCommon } from "./BrowserStorageCommon";
import { StorageType } from "../../../StorageType";

export namespace BrowserStorageRemover
{
    export async function removeMetaGenomicsAssay(mgAssay: MetaGenomicsAssay, storageType: StorageType): Promise<void> 
    {
        throw new Error("Method not implemented.");
    }
    
    export async function removeMetaProteomicsAssay(mpAssay: MetaProteomicsAssay, storageType: StorageType): Promise<void> 
    {
        let storage: Storage = BrowserStorageCommon.getStorage(storageType);
        storage.removeItem(BrowserStorageConsts.MPA_METADATA_PREFIX + mpAssay.getId());
        storage.removeItem(BrowserStorageConsts.MPA_PEPTIDE_PREFIX + mpAssay.getId());
    }
}