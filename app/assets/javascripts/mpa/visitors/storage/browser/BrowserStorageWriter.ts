import MetaGenomicsAssay from "../../../assay/MetaGenomicsAssay";
import MetaProteomicsAssay from "../../../assay/MetaProteomicsAssay";
import PeptideContainer from "../../../PeptideContainer";
import { BrowserStorageConsts } from "./BrowserStorageConsts";
import { BrowserStorageCommon } from "./BrowserStorageCommon";
import { StorageType } from "../../../StorageType";

export namespace BrowserStorageWriter
{
    export async function writeMetaGenomicsAssay(mgAssay: MetaGenomicsAssay, storageType: StorageType): Promise<void> 
    {
        throw new Error("Method not implemented.");
    }
    
    export async function writeMetaProteomicsAssay(mpAssay: MetaProteomicsAssay, storageType: StorageType): Promise<void> 
    {
        let storage: Storage = BrowserStorageCommon.getStorage(storageType);
        let peptideContainer: PeptideContainer = mpAssay.peptideContainer;

        if(!mpAssay.getId())
        {
            mpAssay.setId(BrowserStorageCommon.generateUniqueId())
        }

        let metadata = JSON.stringify({
            id: mpAssay.getId(),
            name: mpAssay.getName(),
            amount: peptideContainer.getAmountOfPeptides(),
            date: mpAssay.getDateFormatted(),
            type: storageType
        });

        storage.setItem(BrowserStorageConsts.MPA_METADATA_PREFIX + mpAssay.getId(), metadata);
        storage.setItem(BrowserStorageConsts.MPA_PEPTIDE_PREFIX + mpAssay.getId(), JSON.stringify({peptides: peptideContainer.getPeptides()}));
    }
}