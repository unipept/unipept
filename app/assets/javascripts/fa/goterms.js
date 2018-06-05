import {GroupedFA, SingleFA} from "../fa/FunctionalAnnotations";
import {postJSON} from "../utils.js";

const NAMESPACES = ["biological process", "cellular component", "molecular function"];
const BATCH_SIZE = 1000;

/**
 * @typedef {Object} GOInfo
 * @property {number}   value  Number of peptides that were matched
 * @property {string}   name Number of peptides that were matched
 * @property {string}   code Number of peptides that were matched
 * @property {string}   [namespace] Number of peptides that were matched
 */

/**
 * A class representing GOTerms
 *
 * Keeps a statc cache of GOTerm data (like namespaces)
 */
export default class GOTerms extends GroupedFA {
    /**
     * Static cache of GO term information
     * @access private
     */
    static goData = new Map();

    /**
     * Use GOTerms.make() and GOTerms.makeAssured()
     * @param {Object.<string, SingleFA>} data
     * @param {FATrustInfo} trust
     * @access private
     */
    constructor(data, trust) {
        super("GO Terms", data, t => GOTerms.namespaceOf(t, null), trust);
    }

    // -------------- Factories ------------------------------
    /**
     *
     * @param {Object<string,GOInfo[]>} results
     * @param {FATrustInfo} trust
     * @return {GOTerms} Go term overview of the data
     */
    static make(results, trust) {
        const d = {};
        for (const ns of NAMESPACES) {
            const nsData = results[ns] || [];
            GOTerms._addData(nsData, ns);
            d[ns] = new SingleFA(ns, nsData, trust);
        }
        return new GOTerms(d, trust);
    }

    /**
     *
     * @param {Object<String,any[]>} results
     * @param {FATrustInfo} trust
     * @return {Promise<GOTerms>} Go term overview of the data
     */
    static async makeAssured(results, trust) {
        const obj = GOTerms.make(results, trust);
        await obj.assureData();
        return obj;
    }


    /**
     * Ingest new GOTerm data, USE WITH CARE
     * @param {Map} newGoData
     */
    static ingestGoData(newGoData) {
        GOTerms.goData = new Map(newGoData);
    }

    // ------------------- Static getters ---------------
    /**
     * @param {string} goTerm
     * @param {string} key
     * @param {any} fallback value to use goTerm not found
     * @return {any} The value of the `key` property of `goTerm`
     * @access private
     */
    static _staticOf(goTerm, key, fallback) {
        if (GOTerms.goData.has(goTerm)) {
            return this.goData.get(goTerm)[key];
        }
        return fallback;
    }

    /**
     * @param {string} code
     * @param {string} fallback value to use goTerm not found
     * @return {string} The namespace of the given GO term
     */
    static namespaceOf(code, fallback = "Unknown") {
        return this._staticOf(code, "namespace", fallback);
    }

    /**
     * @param {string} code
     * @param {string} fallback value to use goTerm not found
     * @return {string} The name of the given GO term
     */
    static nameOf(code, fallback = "Unknown") {
        return this._staticOf(code, "name", fallback);
    }


    /**
     * Add GO terms to the global map
     * @param {GOInfo[]} newTerms list of new GO Terms
     * @param {string} [namespace = null] namsepace to use if not given
     * @access private
     */
    static _addData(newTerms, namespace = null) {
        newTerms.forEach(go => {
            if (!GOTerms.goData.has(go.code) && (namespace != null || go.namespace) && go.name) {
                GOTerms.goData.set(go.code, {
                    name: go.name,
                    namespace: go.namespace || namespace,
                    code: go.code,
                });
            }
        });
    }

    /**
     * Ensure that all data is availible
     */
    async assureData() {
        await GOTerms.fetch(...[...this].map(x => x.code));
    }

    /**
     * Fetch the names and data of the GO terms that are not yet in the static map of
     * names
     * @param {string[]} codes array of GO terms that should be in the cache
     */
    static async fetch(...codes) {
        const todo = codes.filter(c => !this.goData.has(c));
        if (todo.length > 0) {
            for (let i = 0; i < todo.length; i += BATCH_SIZE) {
                const res = await postJSON("/private_api/goterms", JSON.stringify({
                    goterms: todo.slice(i, i + BATCH_SIZE),
                }));
                GOTerms._addData(res);
            }
        }
    }

    // ------------------ UTILITY ---------------------------

    /**
     * @param {string[]} terms the terms to show in the chart (at least one)
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
