class MPAAnalysisContainer {
    constructor(type, names = undefined, peptideContainer = undefined) {
        this._type = type;
        this._names = names;
        this._peptideContainer = peptideContainer;
    }

    isLocalStorage() {
        return this._type === 'local_storage';
    }

    isQuickSearch() {
        return this._type === 'quick_search';
    }

    getPeptideContainer() {
        return this._peptideContainer;
    }

    getNames() {
        return this._names;
    }

    toJSON() {
        if (this._type === 'local_storage') {
            return {
                type: 'local_storage',
                names: this._names
            }
        } else {
            return {
                type: 'quick_search',
                data: this._peptideContainer
            }
        }
    }
}

export {MPAAnalysisContainer};
