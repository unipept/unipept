class PeptideContainer {
    constructor(peptides, equateIl, dupes, missed, name, date = new Date()) {
        this._peptides = peptides;
        this._configuration = {
            il: equateIl,
            dupes: dupes,
            missed: missed
        };
        this._name = name;
        this._date = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDay()
    }

    /**
     * @returns {string[]}
     */
    getPeptides() {
        return this._peptides;
    }

    /**
     * @return {MPAConfig}
     */
    getConfiguration() {
        return this._configuration;
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

    /**
     * @return {String} JSON representation of this object
     */
    toJSON() {
        return {
            peptides: this._peptides,
            configuration: this._configuration,
            name: this._name,
            date: this._date
        };
    }
}

export {PeptideContainer};
