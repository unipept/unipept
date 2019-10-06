import Visitor from "../Visitor";
import MetaGenomicsAssay from "../../assay/MetaGenomicsAssay";
import MetaProteomicsAssay from "../../assay/MetaProteomicsAssay";

import { BrowserStorageDataReader } from "./browser/BrowserStorageDataReader";

import { StorageType } from "../../StorageType";

export default class StorageDataReader implements Visitor
{
    visitMetaGenomicsAssay(mgAssay: MetaGenomicsAssay): Promise<void> 
    {
        let storageType = mgAssay.getStorageType();

        switch(storageType)
        {
            case StorageType.LocalStorage:
            case StorageType.SessionStorage:
                return BrowserStorageDataReader.readMetaGenomicsAssay(mgAssay, storageType);
        }
    }

    visitMetaProteomicsAssay(mpAssay: MetaProteomicsAssay): Promise<void> 
    {
        let storageType = mpAssay.getStorageType();

        switch(storageType)
        {
            case StorageType.LocalStorage:
            case StorageType.SessionStorage:
                return BrowserStorageDataReader.readMetaProteomicsAssay(mpAssay, storageType);
        }
    }
}