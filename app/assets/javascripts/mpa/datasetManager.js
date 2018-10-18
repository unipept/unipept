/**
 * Class that manages all dataset's stored by the user in local storage and the ability to serialize or restore them.
 */
class DatasetManager {
    constructor() {
        this.localStorage = window.localStorage;
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

    /**
     * List all datasets that are stored in local storage memory.
     *
     * @return {String[]} A list containing all names of the datasets stored in local storage.
     */
    listDatasets() {
        let output = [];
        for (let i = 0; i < this.localStorage.length; i++) {
            let key = this.localStorage.key(i);
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
     */
    storeDataset(peptides, configuration, name = "") {
        // TODO how should we name nameless datasets?
        if (!name) {
            name = "Dataset"
        }

        let serialized = this.serialize(peptides, configuration, name);
        this.localStorage.setItem(this.prefix + name, serialized);
    }

    /**
     * Transforms the given Dataset object into a JSON-string.
     *
     * @param {String[]} peptides List of peptides that should be stored in local storage.
     * @param {MPAConfig} configuration Configuration containing the current state of the search settings.
     * @param {String} name Optional, name of the dataset.
     * @return {String} A JSON-string representing the object.
     */
    serialize(peptides, configuration, name) {
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
