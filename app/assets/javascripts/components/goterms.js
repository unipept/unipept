import {postJSON} from "../utils.js";

/**
 * @typedef {Object} FACounts
 * @property {number} value count
 * @property {string} name  The name of the GO/EC number
 * @property {string} code  The code of the GO/EC number
 */

// const for private methods
const addData = Symbol("[addData]");
const addMissingNames = Symbol("[addMissingNames]");
let goData = new Map();

const NAMESPACES = ["biological process", "cellular component", "molecular function"];

/**
 * Class that helps organizing GO terms
 */
export default class GOTerms {
    /**
     * Creates a new GOTerms
     * @param  {[FACounts]} go list of GO terms with their counts
     */
    constructor({numAnnotatedPeptides, data}) {
        this.numTotalSet = numAnnotatedPeptides;
        this.go = new Map();
        Object.values(data).forEach(v=>v.forEach(goTerm => this.go.set(goTerm.code, goTerm)));
        GOTerms[addData](Array.from(this.go.values()));

        // Sort values to store and have every namespace
        this.data = {};
        for (let namespace of NAMESPACES) {
            if (namespace in data) {
                this.data[namespace] = Array.from(data[namespace]).sort((a, b) => (b.value - a.value));
            } else {
                this.data[namespace] = [];
            }
        }
        // Fetch names in the background, not needed yet
        setTimeout(()=>{
            GOTerms[addMissingNames](Array.from(this.go.keys()));
        }, 0);
    }

    /**
     * @return {int} number of annotated peptides
     */
    getTotalSetSize() {
        return this.numTotalSet;
    }

    /**
     * s
     * @param {string} namespace
     * @return {[FAInfo]} t
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
     * Gets the name of associated with an EC number
     *
     * @param  {string} goTerm The code of the EC number (like "2.3.-.-")
     * @return {string}       The name of the EC number
     */
    static nameOf(goTerm) {
        if (goData.has(goTerm)) {
            return goData.get(goTerm).name;
        }
        return "Unknown";
    }

    /**
     * Give the namespace of a GO term
     *
     * @param  {string} goTerm The code of the EC number
     * @return {[string]}  Ancestors of the EC number (from specific to generic)
     */
    static namespaceOf(goTerm) {
        if (goData.has(goTerm)) {
            return goData.get(goTerm).namespace;
        }
        return "Unknown";
    }


    /**
     * Add GO terms to the global map
     * @param {[FACounts]} newTerms list of new EC numbers
     */
    static [addData](newTerms) {
        newTerms.forEach(go => {
            if (!goData.has(go.code)) {
                goData.set(go.code, go);
            }
        });
    }

    /**
     * Create a map with all EC numbers given and their ancestors even if they
     * are not given
     * @param {[string]} codes array of EC codes that should be in the cache
     */
    static async [addMissingNames](codes) {
        let todo = codes.filter(c => !goData.has(c));
        if (todo.length > 0) {
            let res = await postJSON("/info/goterms", JSON.stringify({goterms: todo}));
            GOTerms[addData](res);
        }
    }

    /**
     * @param {[string]} terms the terms to show in the chart
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
