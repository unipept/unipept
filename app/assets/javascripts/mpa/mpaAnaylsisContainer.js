import {LOCAL_STORAGE_TYPE, SESSION_STORAGE_TYPE} from "./storageTypeConstants";

class MPAAnalysisContainer {
    /**
     * @param {string} jsonData A valid JSON-representation of an MPAAnalysisContainer-object.
     * @returns {MPAAnalysisContainer}
     */
    static fromJSON(jsonData) {
        let deserialized = JSON.parse(jsonData);
        return new MPAAnalysisContainer(deserialized.type, deserialized.name);
    }

    constructor(type, name) {
        this._type = type;
        this._name = name;
    }

    isLocalStorage() {
        return this._type === LOCAL_STORAGE_TYPE;
    }

    isSessionStorage() {
        return this._type === SESSION_STORAGE_TYPE;
    }

    getName() {
        return this._name;
    }

    getType() {
        return this._type;
    }

    toJSON() {
        return {
            type: this._type,
            name: this._name
        }
    }
}

export {MPAAnalysisContainer};
