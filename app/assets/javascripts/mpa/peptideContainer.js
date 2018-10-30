import {DatasetManager} from "./datasetManager";

class PeptideContainer {
    constructor(name, peptideAmount, date) {
        this._peptides = undefined;
        this._name = name;
        this._peptideAmount = peptideAmount;
        this._date = date;
    }

    setPeptides(peptides) {
        this._peptides = peptides;
    }

    /**
     * @returns {Promise<string[]>} The peptides that are stored in this container.
     */
    async getPeptides() {
        if (this._peptides === undefined) {
            let datasetManager = new DatasetManager();
            await datasetManager.loadPeptides(this);
        }

        return this._peptides;
    }

    getAmountOfPeptides() {
        return this._peptideAmount;
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
        return this._date;
    }

    getMetadataJSON() {
        return {
            name: this._name,
            date: this._date
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
            peptides: this._peptides,
            name: this._name,
            date: this._date
        };
    }
}

export {PeptideContainer};
