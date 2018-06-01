/* eslint valid-jsdoc: "off" */

/**
 * @typedef {Object} FAInfo
 * @property {number}   value  Number of peptides that were matched
 * @property {string}   name Number of peptides that were matched
 */


/**
 * @typedef {Object} FATrustInfo
 * @property {number}   trustCount  Number of peptides that were matched
 * @property {number}   annotatedCount  Number of peptides that were matched
 * @property {number}   totalCount  Number of peptides that were matched
 */


/**
 * Abstract class that represents Functional annotaions either grouped or not
 */
class FunctionalAnnotaions {
    /**
     *
     * @param {string} name
     * @param {Object<string, FunctionalAnnotaions>} childeren
     * @param {FATrustInfo} trustInfo
     */
    constructor(name, childeren, trustInfo) {
        this._trust = trustInfo;
        this._childeren = childeren;
        this.name = name;
    }

    /**
     * Get the data for a certaian annotaion
     * @param {string} code
     * @param {string} key
     * @param {any} [fallback=0]
     * @return {any} The data for the annotaion of the code
     */
    valueOf(code, key = "value", fallback = 0) {
        throw new Error("valueOf not implemented");
    }

    /**
     * Get the trust level for this resultset
     * @return {object}
     */
    getTrust() {
        const data = Object.assign({}, this._trust);
        data.totalTrust = this._trust.trustCount / this._trust.totalCount;
        data.annotatedTrust = this._trust.trustCount / this._trust.annotatedCount || 0;
        data.annotaionAmount = this._trust.annotatedCount / this._trust.totalCount || 0;
        return data;
    }

    /**
     * Iterator of all data
     */
    * getData() {
        for (const c of Object.values(this._childeren)) {
            yield* c.getData();
        }
    }

    /**
     * Get an array of all annotaions in this set and sort them
     * by the goven function.
     * @param {(a:any, b:any) => number} f
     */
    getSortedBy(f = x => x.code) {
        return [...this].sort(f);
    }

    /**
     * Make FA itteratiable
     */
    [Symbol.iterator]() {
        return this.getData();
    }

    /**
     * Get a subgroup
     * @param {string} location
     * @return {FunctionalAnnotaions} The subgroup
     *
     */
    getGroup(location) {
        if (location in this._childeren) {
            return this._childeren[location];
        }
        throw new Error("Sugroup " + location + " Does not exist");
    }
}

/**
 * Class that represents a simple functional annotaions database with
 * no substructures
 */
export class SingleFA extends FunctionalAnnotaions {
    /**
     * Make a simple FA
     */
    constructor(name, data, trust) {
        super(name, {}, trust);
        this._map = new Map();
        this._data = [...data];
        this._data.forEach(d => {
            this._map.set(d.code, d);
        });
    }

    /**
     * Get the data for a certaian annotaion
     * @param {string} code
     * @return {object} The data for the annotaion of the code
     */
    valueOf(code, key = "value", fallback = 0) {
        if (this._map.has(code)) {
            return this._map.get(code)[key] || fallback;
        }
        return fallback;
    }

    /**
     * get data
     */
    * getData() {
        yield* this._data;
    }

    /**
     * Get the group FunctionalAnnotaions of a code
     * @param {string} code
     */
    groupOf(code) {
        return this;
    }

    /**
     * Get the group FunctionalAnnotaions of a code
     * @param {string} code
     */
    groupNameOf(code) {
        return null;
    }
}

/**
 *
 */
export class GroupedFA extends FunctionalAnnotaions {
    /**
     *
     * @param {object} mapping
     * @param {function(string):string} locator
     *   Function that determines in which group a key is
     */
    constructor(name, mapping, locator) {
        super(name, mapping, {trustCount: 0, annotatedCount: 0, totalCount: 0});
        this._locator = locator;
    }

    /**
     * Get the data for a certaian annotaion
     * @param {string} code
     * @return {object} The data for the annotaion of the code
     */
    valueOf(code, key = "value", fallback = 0) {
        const location = this._locator(code);
        if (location in this._childeren) {
            return this._childeren[location].valueOf(code, key, fallback);
        }
        return fallback;
    }

    /**
     * Get the FunctionalAnnotaions of a code
     * @param {string} code
     */
    groupOf(code) {
        const location = this._locator(code);
        if (location in this._childeren) {
            return this._childeren[location];
        }
        return null;
    }

    /**
     * Get the group FunctionalAnnotaions of a code
     * @param {string} code
     */
    groupNameOf(code) {
        return this._locator(code);
    }
}
