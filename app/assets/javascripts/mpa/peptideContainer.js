import {DatasetManager} from "./datasetManager";

class PeptideContainer {
    /**
     * Create a new PeptideContainer from a given JSON-representation of a valid container.
     *
     * @param {string} metaData JSON-representation of the metadata that's associated with the given list of peptides.
     * @param {?string} peptideData JSON-representation of the list of peptides that's associated with the given metadata.
     * @return {PeptideContainer} A PeptideContainer that's the living counterpart of the given JSON-string.
     */
    static fromJSON(metaData, peptideData = undefined) {
        let meta = JSON.parse(metaData);
        let splitDate = meta.date.split("/");
        let output = new PeptideContainer(meta.id, meta.name, meta.amount, new Date(splitDate[0], splitDate[1], splitDate[2]), meta.type);
        if (peptideData !== undefined) {
            let peptides = JSON.parse(peptideData);
            output.setPeptides(peptides);
        }
        return output;
    }

    /**
     * Create a new PeptideContainer. A PeptideContainer is actually a representation of a dataset that can be
     * serialized to local storage.
     *
     * @param {string} id The unique id of the stored dataset.
     * @param {string} name The name of the stored dataset.
     * @param {int} peptideAmount The amount of peptides that are to be stored in this container.
     * @param {Date} date The date at which the dataset was first created.
     * @param {string} type One of "local_storage" and "session_storage"
     */
    constructor(id, name, peptideAmount, date, type) {
        this._id = id;
        this._peptides = undefined;
        this._name = name;
        this._peptideAmount = peptideAmount;
        this._date = date;
        this._type = type;
    }

    setPeptides(peptides) {
        this._peptides = peptides;
    }

    /**
     * @returns {Promise<string[]>} The peptides that are stored in this container.
     */
    async getPeptides() {
        if (this._peptides === undefined) {
            let dataSetManager = new DatasetManager(this._type);
            this._peptides = await dataSetManager.loadPeptides(this._id);
        }

        return this._peptides;
    }

    getAmountOfPeptides() {
        return this._peptideAmount;
    }

    /**
     * @returns {string}
     */
    getId() {
        return this._id;
    }

    /**
     * @returns {string}
     */
    getName() {
        return this._name;
    }

    /**
     * @returns {string}
     */
    getDate() {
        return this._date.getFullYear() + "/" + (this._date.getMonth() + 1) + "/" + this._date.getDate();
    }

    getType() {
        return this._type;
    }

    getMetadataJSON() {
        return {
            id: this._id,
            name: this._name,
            amount: this._peptideAmount,
            date: this.getDate(),
            type: this._type
        };
    }

    getDataJSON() {
        return {
            peptides: this._peptides
        };
    }

    /**
     * @return {String} JSON representation of this object
     */
    toJSON() {
        return {
            id: this._id,
            peptides: this._peptides,
            name: this._name,
            amount: this._peptideAmount,
            date: this.getDate(),
            type: this._type
        };
    }
}

export {PeptideContainer};
