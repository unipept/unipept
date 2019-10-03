import {StorageType} from "./StorageType";
import {get, getJSON} from "../utils";
import Assay from "./assay/Assay";
import MetaProteomicsAssay from "./assay/MetaProteomicsAssay";
import { BrowserStorageConsts } from "./visitors/storage/BrowserStorageConsts";
import BrowserStorageMetadataReader from "./visitors/storage/BrowserStorageMetadataReader";
import BrowserStorageRemover from "./visitors/storage/BrowserStorageRemover";

export default class DatasetManager 
{
    /**
     * List all datasets that are stored in local storage memory.
     *
     * @return A list containing all datasets stored in this manager's corresponding storage type and sorted
     *         alphabetically by name.
     */
    async listDatasets(): Promise<Assay[]> 
    {
        let output: MetaProteomicsAssay[] = [];
        let metadataReader: BrowserStorageMetadataReader = new BrowserStorageMetadataReader(StorageType.LocalStorage)
        let storage = window.localStorage;

        for (let i = 0; i < storage.length; i++) 
        {
            let key = storage.key(i);
            if (key.startsWith(BrowserStorageConsts.MPA_METADATA_PREFIX)) 
            {
                let dataset = new MetaProteomicsAssay(key.substr(BrowserStorageConsts.MPA_METADATA_PREFIX.length), StorageType.LocalStorage);
                await dataset.visit(metadataReader)
                output.push(dataset);
            }
        }

        return output.sort(function(a, b) {
            return a.getName() < b.getName()? -1 : 1;
        })
    }

    /**
     * Returns a dataset that was fetched from the Pride-archive.
     *
     * @param id The Pride-assay id that's associated with the requested dataset.
     * @param progressCallback Callback that's invoked with new progress when available.
     * @return A list of peptides associated with the given pride assay.
     */
    async loadPrideDataset(id: number, progressCallback: (number) => void = (n) => {}): Promise<string[]> {
        progressCallback(0);

        let batchSize: number = 1000;
        let peptides: string[] = [];

        let datasetSize: number = await get("https://www.ebi.ac.uk/pride/ws/archive/peptide/count/assay/" + id);
        let urls: string[] = [];
        let page: number;


        for (page = 0; page * batchSize < datasetSize; page++) {
            urls.push("https://www.ebi.ac.uk/pride/ws/archive/peptide/list/assay/" + id + "?show=" + batchSize + "&page=" + page);
        }

        page = 0;
        await urls.map(getJSON).reduce(
            function (sequence: Promise<void>, batchPromise) {
                return sequence.then(function () {
                    return batchPromise;
                }).then(function (response: any) {
                    page++;

                    progressCallback((10 + (90 * page * batchSize) / datasetSize) / 100);
                    peptides = peptides.concat(response.list.map(function (d) {
                        return d.sequence;
                    }));
                });
            }, Promise.resolve()
        );

        return peptides;
    }

    async deleteDatasetFromStorage(dataSet: Assay): Promise<void> 
    {
        let browserStorageRemover = new BrowserStorageRemover(dataSet.getStorageType())
        dataSet.visit(browserStorageRemover);
    }
}
