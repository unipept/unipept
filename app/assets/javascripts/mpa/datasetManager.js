/**
 * Class that manages all dataset's stored by the user in local storage and the ability to serialize or restore them.
 */
import {PeptideContainer} from "./peptideContainer";

class DatasetManager {
    constructor() {
        // The prefix that's used to identify the mpa-datasets in local storage.
        this.prefix = 'mpa-';
        this.metadataPrefix = this.prefix + 'metadata-';
        this.peptidePrefix = this.prefix + 'peptide-';
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
     * @returns {Promise<PeptideContainer[]>} All peptide container objects that are currently selected by the user,
     *          sorted by name.
     */
    async getSelectedDatasets() {
        let output = [];
        for (let selectedName of this._selectedDatasets) {
            output.push(await this.loadDataset(selectedName));
        }
        return output.sort(function(a, b) {
            return a.name < b.name;
        })
    }

    /**
     * @param name Unique name of the dataset for which it should be checked if he is currently selected.
     * @returns {boolean} True if selected, false otherwise.
     */
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
     * @param {String} name Name of the dataset.
     * @return {PeptideContainer} All information found about the dataset associated with the given name.
     */
    async storeDataset(peptides, name) {
        let date = new Date();
        let peptideContainer = new PeptideContainer(peptides, name, date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDay());
        window.localStorage.setItem(this.metadataPrefix + name, JSON.stringify(peptideContainer.getMetadataJSON()));
        window.localStorage.setItem(this.peptidePrefix + name, JSON.stringify(peptideContainer.getDataJSON()));
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
        let serializedData = window.localStorage.getItem(this.metadataPrefix + name);
        if (serializedData != null) {
            let deserializedData = JSON.parse(serializedData);

            return new PeptideContainer(
                deserializedData.name,
                deserializedData.date
            );
        }
        return null;
    }

    async loadPeptides(peptideContainer) {
        let serializedData = window.localStorage.getItem(this.metadataPrefix + name);
        if (serializedData != null) {
            let deserializedData = JSON.parse(serializedData);
            peptideContainer.setPeptides(deserializedData.peptides);
        }
    }

    /**
     * Remove a specific dataset from local storage.
     *
     * @param name Name of the dataset that should be removed from local storage.
     */
    async removeDataset(name) {
        window.localStorage.removeItem(this.metadataPrefix + name);
        window.localStorage.removeItem(this.peptidePrefix + name);
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
