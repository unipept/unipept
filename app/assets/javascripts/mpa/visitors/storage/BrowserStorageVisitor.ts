import { StorageType } from "../../StorageType";
import Visitor from "../Visitor";
import { MetaGenomicsAssay } from "../../assay/MetaGenomicsAssay";
import { MetaProteomicsAssay } from "../../assay/MetaProteomicsAssay";
import { BrowserStorageConsts } from "./BrowserStorageConsts";

export default abstract class BrowserStorageVisitor implements Visitor
{
    private _storageType: StorageType;

    constructor(storageType: StorageType)
    {
        this._storageType = storageType;
    }

    get storageType()
    {
        return this._storageType;
    }

    getStorage(): Storage {
        if (this._storageType === StorageType.LocalStorage) {
            return window.localStorage;
        } else {
            return window.sessionStorage;
        }
    }

    /**
     * This function looks for the highest id that's been used so far in the storage and creates a new unique id by
     * incrementing the previous highest id by one.
     *
     * @returns A newly generated unique identifier that can be used for storing a dataset.
     */
    generateUniqueId(): string {
        let counter = window.localStorage.getItem(BrowserStorageConsts.MPA_STORAGE_PREFIX + "unique-id-counter");
        let counterValue = 0;
        if (counter) {
            counterValue = parseInt(counter) + 1;
        }
        window.localStorage.setItem(BrowserStorageConsts.MPA_STORAGE_PREFIX + "unique-id-counter", counterValue.toString());
        return counter;
    }

    abstract visitMetaGenomicsAssay(mgAssay: MetaGenomicsAssay): Promise<void>;
    abstract visitMetaProteomicsAssay(mpAssay: MetaProteomicsAssay): Promise<void>;
}