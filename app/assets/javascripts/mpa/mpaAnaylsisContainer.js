const LOCAL_STORAGE_TYPE = 'local_storage';
const QUICK_SEARCH_TYPE = 'quick_search';

class MPAAnalysisContainer {


    constructor(type, name = undefined, peptideContainer = undefined) {
        this._type = type;
        this._name = name;
        this._peptideContainer = peptideContainer;
    }

    isLocalStorage() {
        return this._type === LOCAL_STORAGE_TYPE;
    }

    isQuickSearch() {
        return this._type === QUICK_SEARCH_TYPE;
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

export {MPAAnalysisContainer, LOCAL_STORAGE_TYPE, QUICK_SEARCH_TYPE};
