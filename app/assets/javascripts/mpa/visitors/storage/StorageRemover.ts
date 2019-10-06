import Visitor from "../Visitor";
import MetaGenomicsAssay from "../../assay/MetaGenomicsAssay";
import MetaProteomicsAssay from "../../assay/MetaProteomicsAssay";

import { BrowserStorageRemover } from "./browser/BrowserStorageRemover";

import { StorageType } from "../../StorageType";

export default class StorageRemover implements Visitor
{
    visitMetaGenomicsAssay(mgAssay: MetaGenomicsAssay): Promise<void> 
    {
        let storageType = mgAssay.getStorageType();

        switch(storageType)
        {
            case StorageType.LocalStorage:
            case StorageType.SessionStorage:
                return BrowserStorageRemover.removeMetaGenomicsAssay(mgAssay, storageType);
        }
    }

    visitMetaProteomicsAssay(mpAssay: MetaProteomicsAssay): Promise<void> 
    {
        let storageType = mpAssay.getStorageType();

        switch(storageType)
        {
            case StorageType.LocalStorage:
            case StorageType.SessionStorage:
                return BrowserStorageRemover.removeMetaProteomicsAssay(mpAssay, storageType);
        }
    }
}