import { StorageType } from "../../../StorageType";
import { BrowserStorageConsts } from "./BrowserStorageConsts";

export namespace BrowserStorageCommon
{
    export function getStorage(storageType: StorageType)
    {
        if (storageType === StorageType.LocalStorage) {
            return window.localStorage;
        } else {
            return window.sessionStorage;
        }
    }

    export function generateUniqueId(): string 
    {
        let counter = window.localStorage.getItem(BrowserStorageConsts.MPA_STORAGE_PREFIX + "unique-id-counter");
        let counterValue = 0;
        if (counter) {
            counterValue = parseInt(counter) + 1;
        }
        window.localStorage.setItem(BrowserStorageConsts.MPA_STORAGE_PREFIX + "unique-id-counter", counterValue.toString());
        return counter;
    }
}