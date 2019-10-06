import Visitor from "../Visitor";
import MetaGenomicsAssay from "../../assay/MetaGenomicsAssay";
import MetaProteomicsAssay from "../../assay/MetaProteomicsAssay";

import { BrowserStorageMetadataReader } from "./browser/BrowserStorageMetadataReader";

import { StorageType } from "../../StorageType";

export default class StorageMetadataReader implements Visitor
{
    visitMetaGenomicsAssay(mgAssay: MetaGenomicsAssay): Promise<void> 
    {
        let storageType = mgAssay.getStorageType();

        switch(storageType)
        {
            case StorageType.LocalStorage:
            case StorageType.SessionStorage:
                return BrowserStorageMetadataReader.readMetaGenomicsAssay(mgAssay, storageType);
        }
    }

    visitMetaProteomicsAssay(mpAssay: MetaProteomicsAssay): Promise<void> 
    {
        let storageType = mpAssay.getStorageType();

        switch(storageType)
        {   
            case StorageType.LocalStorage:
            case StorageType.SessionStorage:
                return BrowserStorageMetadataReader.readMetaProteomicsAssay(mpAssay, storageType);
        }
    }
}