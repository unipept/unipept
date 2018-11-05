/**
 * Class that manages all dataset's stored by the user in local storage and the ability to serialize or restore them.
 */
import {PeptideContainer} from "./peptideContainer";
import {LOCAL_STORAGE_TYPE} from "./storageTypeConstants";

class DatasetManager {
    /**
     * Deserializes a DatasetManager in JSON-format and returns the corresponding real DatasetManager-object.
     *
     * @param {string} input The serialized DatasetManager in JSON-format.
     * @return {DatasetManager}
     */
    static fromJSON(input) {
        let deserialized = JSON.parse(input);
        let output = new DatasetManager(deserialized.storageType);
        output._selectedDatasets = deserialized.selectedDatasets;
        return output;
    }

    constructor(type = LOCAL_STORAGE_TYPE) {
        // The prefix that's used to identify the mpa-datasets in local storage.
        this.prefix = 'mpa-';
        this.metadataPrefix = this.prefix + 'metadata-';
        this.peptidePrefix = this.prefix + 'peptide-';
        this._selectedDatasets = [];
        this.storageType = type;
        if (type === LOCAL_STORAGE_TYPE) {
            this.storage = window.localStorage;
        } else {
            this.storage = window.sessionStorage;
        }
    }

    clearSelection() {
        this._selectedDatasets = [];
    }

    /**
     * Set the current selected status of the dataset with the given name.
     *
     * @param {string} id Unique identifier of the dataset whose selection status should be changed.
     * @param {boolean} select Current selection status of the dataset.
     */
    selectDataset(id, select = true) {
        let index = this._selectedDatasets.indexOf(id);

        if (index === -1 && select) {
            this._selectedDatasets.push(id);
        } else if (!select) {
            this._selectedDatasets.splice(index, 1);
        }
    }

    /**
     * @returns {Promise<PeptideContainer[]>} All peptide container objects that are currently selected by the user,
     *          sorted by name.
     */
    async getSelectedDatasets() {
        let output = [];
        for (let selectedId of this._selectedDatasets) {
            output.push(await this.loadDataset(selectedId));
        }

        return output.sort(function(a, b) {
            return a.getName() < b.getName();
        })
    }

    /**
     * @param id Unique identifier of the dataset for which it should be checked if he is currently selected.
     * @returns {boolean} True if selected, false otherwise.
     */
    isDatasetSelected(id) {
        return this._selectedDatasets.indexOf(id) !== -1;
    }

    getAmountOfSelectedDatasets() {
        return this._selectedDatasets.length;
    }

    /**
     * List all datasets that are stored in local storage memory.
     *
     * @return {Promise<PeptideContainer[]>} A list containing all datasets stored in local storage and sorted alphabetically by name.
     */
    async listDatasets() {
        let output = [];
        for (let i = 0; i < this.storage.length; i++) {
            let key = this.storage.key(i);
            if (key.startsWith(this.metadataPrefix)) {
                let dataset = await this.loadDataset(key.substr(this.metadataPrefix.length));
                output.push(dataset)
            }
        }
        return output.sort(function(a, b) {
            return a.getName() < b.getName();
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
        let id = await this._generateUniqueId();
        let peptideContainer = new PeptideContainer(id, name, peptides.length, new Date());
        peptideContainer.setPeptides(peptides);
        this.storage.setItem(this.metadataPrefix + id, JSON.stringify(peptideContainer.getMetadataJSON()));
        this.storage.setItem(this.peptidePrefix + id, JSON.stringify(peptideContainer.getDataJSON()));
        return peptideContainer;
    }

    /**
     * Look up the given id in local storage and load all data associated with it.
     *
     * @param {String} id The unique identifier of the data set that should be looked up.
     * @return{?PeptideContainer} An object containing the name, the peptides and the configuration of the dataset associated with the
     *         given name. Returns null when a dataset with the given name was not found in local storage.
     */
    async loadDataset(id) {
        let serializedData = this.storage.getItem(this.metadataPrefix + id);
        if (serializedData != null) {
            return PeptideContainer.fromJSON(serializedData);
        }
        return null;
    }

    async loadPeptides(id) {
        let serializedData = this.storage.getItem(this.peptidePrefix + id);
        if (serializedData != null) {
            let deserializedData = JSON.parse(serializedData);
            return deserializedData.peptides;
        }
    }

    /**
     * Remove a specific dataset from local storage.
     *
     * @param {string} id Unique identifier of the dataset that should be removed from local storage.
     */
    async removeDataset(id) {
        this.storage.removeItem(this.metadataPrefix + id);
        this.storage.removeItem(this.peptidePrefix + id);
    }

    /**
     * Removes all datasets from local storage.
     */
    async clearStorage() {
        let toRemove = [];
        for (let i = 0; i < this.storage.length; i++) {
            let key = this.storage.key(i);
            if (key.startsWith(this.prefix)) {
                toRemove.push(key);
            }
        }

        for (let key of toRemove) {
            this.storage.removeItem(key);
        }

        this.t_selectedDatasets = [];
    }

    /**
     * This function looks for the highest id that's been used so far in the storage and creates a new unique id by
     * incrementing the previous highest id by one.
     *
     * @returns {Promise<int>} A newly generated unique identifier that can be used for storing a dataset.
     * @private
     */
    async _generateUniqueId() {
        let counter = window.localStorage.getItem(this.prefix + "unique-id-counter");
        if (counter) {
            counter = parseInt(counter);
            counter++;
        } else {
            counter = 0;
        }
        window.localStorage.setItem(this.prefix + "unique-id-counter", counter);
        return counter;
    }

    /**
     * Serialize the current DatasetManager to JSON.
     */
    toJSON() {
        return {
            selectedDatasets: this._selectedDatasets,
            storageType: this.storageType
        };
    }
}

export {DatasetManager};
