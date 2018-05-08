import {postJSON} from "../utils.js";

/**
 * @typedef {Object} FACounts
 * @property {number} value count
 * @property {string} name  The name of the GO/EC number
 * @property {string} code  The code of the GO/EC number
 */

const BATCH_SIZE = 1000;
const NAMESPACES = ["biological process", "cellular component", "molecular function"];

/**
 * Class that helps organizing GO terms
 */
export default class GOTerms {
    /**
     * Static cache of GO term information
     * @access private
     */
    static goData = new Map();

    /**
     * Creates a new GOTerms
     * TODO
     * @param  {[FACounts]} [go=[]] list of GO terms with their counts
     * @param {bool} [ensureData=true] fetch names for this resultset in the background,ss
     *                                 if false, you must call `ensureData()` on this object.
     * @param {bool} [clone=false] *for internal use*
     */
    constructor({numAnnotatedProteins = null, data = []}, ensureData = true, clone = false) {
        if (clone) return;
        this.numTotalSet = numAnnotatedProteins;
        this.go = new Map();
        Object.entries(data).forEach(([ns, v]) => v.forEach(goTerm => {
            this.go.set(goTerm.code, Object.assign({namespace: ns}, goTerm));
        }));
        GOTerms.addData(Array.from(this.go.values()));

        // Sort values to store and have every namespace
        this.data = {};
        for (const namespace of NAMESPACES) {
            if (namespace in data) {
                this.data[namespace] = Array.from(data[namespace]).sort((a, b) => (b.value - a.value));
            } else {
                this.data[namespace] = [];
            }
        }

        if (ensureData) {
            this.ensureData();
        }
    }

    /**
     * Make a new GOTerms form a clone
     * @param {GOTerms} other
     * @param {GOTerms} [base=null] optional GoTerms instance to reuse
     * @return {GOTerms} filled GOTerms instance
     */
    static clone(other, base = null) {
        let go = base;
        if (base === null) {
            go = new GOTerms({}, true, true);
        }
        go.numTotalSet = other.numTotalSet;
        go.data = other.data;
        go.go = other.go;
        return go;
    }

    /**
    /**
     * Fetch the names of the GO terms and await them
     */
    async ensureData() {
        await GOTerms.addMissingNames(Array.from(this.go.keys()));
    }

    /**
     * @return {int} number of annotated peptides
     */
    getTotalSetSize() {
        return this.numTotalSet;
    }

    /**
     * Returns the originally supplied set of GO Terms
     * sorted by value for a specific namespace
     * @param  {String} namespace The namespace (one of GOTerms.NAMESPACES)
     * @return {[FACounts]} Sorted GO Terms
     */
    sortedTerms(namespace) {
        return this.data[namespace];
    }

    /**
     * Get the count of the GO term in the data set
     * @param  {string} goTerm the GO term (form "GO:0005886")
     * @return {number}        count of the GO term
     */
    getValueOf(goTerm) {
        if (this.go.has(goTerm)) {
            return this.go.get(goTerm).value;
        }
        return 0;
    }


    /**
     * Get the count of the GO term in the data set as fraction of the total size
     * of the set
     * @param  {string} goTerm the GO term (form "GO:0005886")
     * @return {number}        fraction of the GO term
     */
    getFractionOf(goTerm) {
        return this.getValueOf(goTerm) / this.numTotalSet;
    }


    /**
     * Gets the name of associated with an GO Term
     *
     * @param  {string} goTerm The code of the GO Term (like "GO:0006423")
     * @return {string}       The name of the GO Term
     */
    static nameOf(goTerm) {
        if (this.goData.has(goTerm)) {
            return this.goData.get(goTerm).name;
        }
        return "Unknown";
    }

    /**
     * Give the namespace of a GO term
     *
     * @param  {string} goTerm The code of the GO Term
     * @return {[string]}  Ancestors of the GO Term (from specific to generic)
     */
    static namespaceOf(goTerm) {
        if (this.goData.has(goTerm)) {
            return this.goData.get(goTerm).namespace;
        }
        return "Unknown";
    }


    /**
     * Add GO terms to the global map
     * @param {[FACounts]} newTerms list of new GO Terms
     * @access private
     */
    static addData(newTerms) {
        newTerms.forEach(go => {
            if (!this.goData.has(go.code) && go.namespace && go.name) {
                this.goData.set(go.code, go);
            }
        });
    }

    /**
     * Fetch the names and data of the GO terms that are not yet in the static map of
     * names
     * @param {[string]} codes array of GO terms that should be in the cache
     */
    static async addMissingNames(codes) {
        const todo = codes.filter(c => !this.goData.has(c));
        if (todo.length > 0) {
            for (let i = 0; i < todo.length; i += BATCH_SIZE) {
                const res = await postJSON("/private_api/goterms", JSON.stringify({
                    goterms: todo.slice(i, i + BATCH_SIZE),
                }));
                GOTerms.addData(res);
            }
        }
    }

    /**
     * Cone the GO Term information into the current GOTerm static value
     *
     * Needed to work properly with WebWorkers that do not share these statics
     *
     * @param {iteratable<FAInfo>} data inforamtion about GO Terms
     */
    static ingestData(data) {
        GOTerms.goData = data;
    }

    /**
     * @param {[string]} terms the terms to show in the chart (at least one)
     * @return {string} The QuickGo chart URL of the given GO terms
     */
    static quickGOChartURL(terms) {
        return `https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/${terms.join(",")}/chart`;
    }

    /**
     * Get a list of the 3 root namespaces of the Gene Ontology
     */
    static get NAMESPACES() {
        return NAMESPACES;
    }
}
