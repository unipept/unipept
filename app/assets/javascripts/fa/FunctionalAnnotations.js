/* eslint valid-jsdoc: "off" */


/**
 * Abstract class that represents Functional annotaions either grouped or not.
 * (Composite pattern)
 */
export class FunctionalAnnotations {
    /**
     *
     * @param {string} name
     * @param {Object<string, FunctionalAnnotations>} childeren
     * @param {FATrustInfo} trustInfo
     */
    constructor(name, childeren, trustInfo) {
        this._trust = trustInfo;
        this._childeren = childeren;
        this.name = name;
    }

    /**
     * Get the data for a certain annotaion
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
     * @return {FATrustInfo}
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
     * @param {function(FAInfo, FAInfo): number} f
     * @return {any[]}
     */
    getSorted(f = (a, b) => b.value - a.value) {
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
     * @return {FunctionalAnnotations} The subgroup
     *
     */
    getGroup(location) {
        if (location in this._childeren) {
            return this._childeren[location];
        }
        throw new Error("Sugroup " + location + " Does not exist");
    }

    /**
     * @return {string} the human readable name of this set
     */
    getName() {
        return this.name;
    }

    /**
     * @return {FunctionalAnnotations} a clone of `this`
     */
    clone() {
        throw new Error("Not implemented");
    }
}

/**
 * Class that represents a simple functional annotaions database with
 * no substructures
 */
export class SingleFA extends FunctionalAnnotations {
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
     * Get the data for a certain annotaion
     * @param {string} code
     * @param {string} key
     * @param {any} [fallback=0]
     * @return {any} The data for the annotaion of the code
     */
    valueOf(code, key = "value", fallback = 0) {
        if (this._map.has(code)) {
            return this._map.get(code)[key] || fallback;
        }
        return fallback;
    }

    /**
     * Itterate over the data in this FA data
     */
    * getData() {
        yield* this._data;
    }

    /**
     * Get the group FunctionalAnnotations of a code
     * @param {string} code
     */
    groupOf(code) {
        return this;
    }

    /**
     * Get the group FunctionalAnnotations of a code
     * @param {string} code
     */
    groupNameOf(code) {
        return null;
    }

    /**
     * @returns {SingleFA}
     */
    clone() {
        return new SingleFA(this.name, this._data, this._trust);
    }
}

/**
 * Group of functional annotaions
 */
export class GroupedFA extends FunctionalAnnotations {
    /**
     *
     * @param {Object.<string, FunctionalAnnotations>} mapping
     * @param {function(string):string} locator
     *   Function that determines in which group a key is
     */
    constructor(name, mapping, locator, trust = {trustCount: 0, annotatedCount: 0, totalCount: 0}) {
        super(name, mapping, trust);
        this._locator = locator;
    }

    /**
     * Get the data for a certain annotaion
     * @param {string} code
     * @param {string} key
     * @param {any} [fallback=0]
     * @return {any} The data for the annotaion of the code
     */
    valueOf(code, key = "value", fallback = 0) {
        const location = this._locator(code);
        if (location in this._childeren) {
            return this._childeren[location].valueOf(code, key, fallback);
        }
        return fallback;
    }

    /**
     * Get the FunctionalAnnotations of a code
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
     * Get the group FunctionalAnnotations of a code
     * @param {string} code
     */
    groupNameOf(code) {
        return this._locator(code);
    }

    /**
     * @returns {GroupedFA}
     */
    clone() {
        const clonedChilds = {};
        for (const n in this._childeren) {
            if (this.getGroup(n) !== null) {
                clonedChilds[n] = this.getGroup(n).clone();
            }
        }
        return new GroupedFA(this.name, this._childeren, this._locator);
    }
}
