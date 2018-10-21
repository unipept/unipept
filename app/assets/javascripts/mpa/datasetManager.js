/**
 * Class that manages all dataset's stored by the user in local storage and the ability to serialize or restore them.
 */
class DatasetManager {
    constructor() {
        // The prefix that's used to identify the mpa-datasets in local storage.
        this.prefix = 'mpa-';
        this._selectedDatasets = [];
    }

    /**
     * Toggle the selected property of a dataset.
     *
     * @param name Unique name of the dataset that should be selected.
     * @return {boolean} Current checked status of the dataset.
     */
    toggleDataset(name) {
        let index = this._selectedDatasets.indexOf(name);

        if (index === -1) {
            this._selectedDatasets.push(name);
            return true;
        }

        this._selectedDatasets.splice(index, 1);
        return false;
    }

    getSelectedDatasets() {
        return this._selectedDatasets;
    }

    isDatasetSelected(name) {
        return this._selectedDatasets.indexOf(name) !== -1;
    }

    /**
     * List all datasets that are stored in local storage memory.
     *
     * @return {String[]} A list containing all names of the datasets stored in local storage.
     */
    async listDatasets() {
        let output = [];
        for (let i = 0; i < window.localStorage.length; i++) {
            let key = window.localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                output.push(key.substr(this.prefix.length))
            }
        }
        return output
    }

    /**
     * Serialize and store given peptides (and corresponding configuration) in local storage.
     *
     * @param {String[]} peptides List of peptides that should be stored in local storage.
     * @param {MPAConfig} configuration Configuration containing the current state of the search settings.
     * @param {String} name Optional, name of the dataset.
     * @return {String} The name that was eventually used to store this dataset.
     */
    async storeDataset(peptides, configuration, name = "") {
        // TODO how should we name nameless datasets?
        if (!name) {
            name = "Dataset"
        }

        let serialized = this._serialize(peptides, configuration, name);
        window.localStorage.setItem(this.prefix + name, serialized);
        return name;
    }

    /**
     * Look up the given name in local storage and load all data associated with it.
     *
     * @param {String} name The name of the data set that should be looked up.
     * @return An object containing the name, the peptides and the configuration of the dataset associated with the
     *         given name. Returns null when a dataset with the given name was not found in local storage.
     */
    async loadDataset(name) {
        let serializedData = window.localStorage.getItem(this.prefix + name);
        if (serializedData != null) {
            return JSON.parse(serializedData);
        }
        return null;
    }

    /**
     * Remove a specific dataset from local storage.
     *
     * @param name Name of the dataset that should be removed from local storage.
     */
    async removeDataset(name) {
        window.localStorage.removeItem(this.prefix + name);
    }

    /**
     * Removes all datasets from local storage.
     */
    async clearStorage() {
        for (let i = 0; i < window.localStorage.length; i++) {
            let key = window.localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                window.localStorage.removeItem(key);
            }
        }

        this._selectedDatasets = [];
    }

    /**
     * Transforms the given Dataset object into a JSON-string.
     *
     * @param {String[]} peptides List of peptides that should be stored in local storage.
     * @param {MPAConfig} configuration Configuration containing the current state of the search settings.
     * @param {String} name Optional, name of the dataset.
     * @return {String} A JSON-string representing the object.
     */
    _serialize(peptides, configuration, name) {
        return JSON.stringify({
            peptides: peptides,
            configuration: {
                il: configuration.il,
                dupes: configuration.dupes,
                missed: configuration.missed
            },
            name: name
        });
    }
}

export {DatasetManager};
