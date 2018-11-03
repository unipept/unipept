import {LOCAL_STORAGE_TYPE, SESSION_STORAGE_TYPE} from "./storageTypeConstants";

class MPAAnalysisContainer {
    /**
     * @param {string} jsonData A valid JSON-representation of an MPAAnalysisContainer-object.
     * @returns {MPAAnalysisContainer}
     */
    static fromJSON(jsonData) {
        let deserialized = JSON.parse(jsonData);
        return new MPAAnalysisContainer(deserialized.type, deserialized.id);
    }

    constructor(type, id) {
        this._type = type;
        this._id = id;
    }

    isLocalStorage() {
        return this._type === LOCAL_STORAGE_TYPE;
    }

    isSessionStorage() {
        return this._type === SESSION_STORAGE_TYPE;
    }

    getId() {
        return this._id;
    }

    getType() {
        return this._type;
    }

    toJSON() {
        return {
            type: this._type,
            id: this._id
        }
    }
}

export {MPAAnalysisContainer};
