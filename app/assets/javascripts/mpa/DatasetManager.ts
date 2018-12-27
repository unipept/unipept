import PeptideContainer from "./PeptideContainer";
import {StorageType} from "./StorageType";
import {get, getJSON} from "../utils";

export default class DatasetManager {
    public static readonly MPA_STORAGE_PREFIX: string = "mpa-";
    public static readonly MPA_METADATA_PREFIX: string = DatasetManager.MPA_STORAGE_PREFIX + "metadata-";
    public static readonly MPA_PEPTIDE_PREFIX: string = DatasetManager.MPA_STORAGE_PREFIX + "peptide-";

    public datasets: PeptideContainer[] = [];
    public selectedDatasets: PeptideContainer[] = [];

    private storageTypes: StorageType[] = [StorageType.LocalStorage, StorageType.SessionStorage];

    /**
     * List all datasets that are stored in local storage memory.
     *
     * @return A list containing all datasets stored in this manager's corresponding storage type and sorted
     *         alphabetically by name.
     */
    async listDatasets(): Promise<PeptideContainer[]> {
        let output: PeptideContainer[] = [];
        for (let storageType of this.storageTypes) {
            let storage = this.getStorage(storageType);
            for (let i = 0; i < storage.length; i++) {
                let key = storage.key(i);
                if (key.startsWith(DatasetManager.MPA_METADATA_PREFIX)) {
                    let dataset = new PeptideContainer(key.substr(DatasetManager.MPA_METADATA_PREFIX.length));
                    await dataset.deserialize(storageType);
                    output.push(dataset);
                }
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

    /**
     * Removes all datasets from the browser's storage.
     */
    async clearStorage(): Promise<void> {
        for (let storageType of this.storageTypes) {
            let storage = this.getStorage(storageType);
            let toRemove = [];

            for (let i = 0; i < storage.length; i++) {
                let key = storage.key(i);
                if (key.startsWith(DatasetManager.MPA_STORAGE_PREFIX)) {
                    toRemove.push(key);
                }
            }

            for (let key of toRemove) {
                storage.removeItem(key);
            }
        }
    }

    private getStorage(storageType: StorageType): Storage {
        if (storageType === StorageType.LocalStorage) {
            return window.localStorage;
        } else {
            return window.sessionStorage;
        }
    }
}
