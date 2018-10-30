/**
 * Class that manages all dataset's stored by the user in local storage and the ability to serialize or restore them.
 */
import {PeptideContainer} from "./peptideContainer";

class DatasetManager {
    constructor() {
        // The prefix that's used to identify the mpa-datasets in local storage.
        this.prefix = 'mpa-';
        this._selectedDatasets = [];
    }

    /**
     * Toggle the selected property of a dataset.
     *
     * @param {string} name Unique name of the dataset that should be selected.
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


    /**
     * Set the current selected status of the dataset with the given name.
     *
     * @param {string} name Unique name of the dataset whose selection status should be changed.
     * @param {boolean} select Current selection status of the dataset.
     */
    selectDataset(name, select = true) {
        let index = this._selectedDatasets.indexOf(name);

        if (index === -1) {
            if (select) {
                this._selectedDatasets.push(name);
            } else {
                this._selectedDatasets.splice(index, 1);
            }
        }
    }

    /**
     * @returns {Promise<PeptideContainer[]>} All peptide container objects that are currently selected by the user.
     */
    async getSelectedDatasets() {
        let output = [];
        for (let selectedName of this._selectedDatasets) {
            output.push(await this.loadDataset(selectedName));
        }
        return output;
    }

    isDatasetSelected(name) {
        return this._selectedDatasets.indexOf(name) !== -1;
    }

    getAmountOfSelectedDatasets() {
        return this._selectedDatasets.length;
    }

    /**
     * List all datasets that are stored in local storage memory.
     *
     * @return {PeptideContainer[]} A list containing all datasets stored in local storage and sorted alphabetically by name.
     */
    async listDatasets() {
        let output = [];
        for (let i = 0; i < window.localStorage.length; i++) {
            let key = window.localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                let dataset = await this.loadDataset(key.substr(this.prefix.length));
                output.push(dataset)
            }
        }
        return output.sort(function(a, b) {
            return a.name < b.name;
        })
    }

    /**
     * Serialize and store given peptides (and corresponding configuration) in local storage.
     *
     * @param {String[]} peptides List of peptides that should be stored in local storage.
     * @param {boolean} equateIl Should IL be equalised in the analysis?
     * @param {boolean} dupes Should duplicates be filtered from the results?
     * @param {boolean} missed Is advanced missing cleavage enabled?
     * @param {String} name Optional, name of the dataset.
     * @return {PeptideContainer} All information found about the dataset associated with the given name.
     */
    async storeDataset(peptides, equateIl, dupes, missed, name = "") {
        // TODO how should we name nameless datasets?
        if (!name) {
            name = "Dataset"
        }

        let peptideContainer = new PeptideContainer(peptides, equateIl, dupes, missed, name);
        window.localStorage.setItem(this.prefix + name, JSON.stringify(peptideContainer));
        return peptideContainer;
    }

    /**
     * Look up the given name in local storage and load all data associated with it.
     *
     * @param {String} name The name of the data set that should be looked up.
     * @return{?PeptideContainer} An object containing the name, the peptides and the configuration of the dataset associated with the
     *         given name. Returns null when a dataset with the given name was not found in local storage.
     */
    async loadDataset(name) {
        let serializedData = window.localStorage.getItem(this.prefix + name);
        if (serializedData != null) {
            let deserializedData = JSON.parse(serializedData);
            let config = deserializedData.configuration;
            return new PeptideContainer(
                deserializedData.peptides,
                config.il,
                config.dupes,
                config.missed,
                deserializedData.name
            );
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
        let toRemove = [];
        for (let i = 0; i < window.localStorage.length; i++) {
            let key = window.localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                toRemove.push(key);
            }
        }

        for (let key of toRemove) {
            window.localStorage.removeItem(key);
        }

        this._selectedDatasets = [];
    }
}

export {DatasetManager};
