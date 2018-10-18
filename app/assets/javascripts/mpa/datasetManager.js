import {Dataset} from "dataset"

/**
 * Class that manages all dataset's stored by the user in local storage and the ability to serialize or restore them.
 */
class DatasetManager {
    constructor() {
        this.localStorage = window.localStorage;
        // The prefix that's used to identify the mpa-datasets in local storage.
        this.prefix = 'mpa-';
    }

    /**
     * List all datasets that are stored in local storage memory.
     *
     * @return {Dataset[]} Al list of dataset-objects as found in memory.
     */
    listDatasets() {
        let output = [];
        for (let i = 0; i < this.localStorage.length; i++) {
            let key = this.localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                let data = this.localStorage.getItem(key);
                console.log(data);
            }
        }
    }

    /**
     * Serialize and store the given dataset to local storage.
     *
     * @param {Dataset} dataset The dataset that should be saved to local storage.
     */
    storeDataset(dataset) {
        let serialized = this.serialize(dataset);
    }

    /**
     * Transforms the given Dataset object into a JSON-string.
     *
     * @param {Dataset} dataset The dataset that should be serialized.
     * @return {String} A JSON-string representing the object.
     */
    serialize(dataset) {
        let config = dataset.resultset.config;

        return JSON.stringify({
            "peptides": dataset.originalPeptides,
            "configuration": {
                "il": config.il,
                "dupes": config.dupes,
                "missed": config.missed
            }
        });
    }
}
