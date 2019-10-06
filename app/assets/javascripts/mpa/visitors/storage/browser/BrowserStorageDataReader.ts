import MetaGenomicsAssay from "../../../assay/MetaGenomicsAssay";
import MetaProteomicsAssay from "../../../assay/MetaProteomicsAssay";
import { BrowserStorageConsts } from "./BrowserStorageConsts";
import { BrowserStorageCommon } from "./BrowserStorageCommon";
import { StorageType } from "../../../StorageType";

export namespace BrowserStorageDataReader
{
    export async function readMetaGenomicsAssay(mgAssay: MetaGenomicsAssay, storageType: StorageType): Promise<void> 
    {
        throw new Error("Method not implemented.");
    }
    
    export async function readMetaProteomicsAssay(mpAssay: MetaProteomicsAssay, storageType: StorageType): Promise<void> 
    {
        let storage: Storage = BrowserStorageCommon.getStorage(storageType);
        let peptidesSerialized = storage.getItem(BrowserStorageConsts.MPA_PEPTIDE_PREFIX + mpAssay.getId());

        if (peptidesSerialized == null) 
        {
            throw "Peptides for dataset " + mpAssay.getId() + " are not available in browser's storage!";
        }

        let parsedPeptides = JSON.parse(peptidesSerialized);
        mpAssay.peptideContainer.setPeptides(parsedPeptides.peptides);
    }
}