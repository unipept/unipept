import {GroupedFA, SingleFA} from "../fa/FunctionalAnnotations";
import {postJSON} from "../utils.js";

const NAMESPACES = ["biological process", "cellular component", "molecular function"];
const BATCH_SIZE = 1000;

/**
 *
 */
export default class GOTerms extends GroupedFA {
    /**
     * Static cache of GO term information
     * @access private
     */
    static goData = new Map();

    /**
     * Use GOTerms.make() and GOTerms.makeAssured()
     * @access private
     */
    constructor(data) {
        super("GO Terms", data, t => GOTerms.namespaceOf(t, null));
    }

    // -------------- Factories ------------------------------
    /**
     *
     * @param {[FAInfo]} results
     */
    static make({data: results}, trust) {
        const d = {};
        for (const ns of NAMESPACES) {
            const nsData = results[ns] || [];
            GOTerms._addData(nsData, ns);
            const nsTrust = {trustCount: 0, annotatedCount: 0, totalCount: 0};
            d[ns] = new SingleFA(ns, nsData, nsTrust);
        }
        return new GOTerms(d);
    }

    /**
     *
     * @param {*} args
     */
    static async makeAssured(...args) {
        const obj = GOTerms.make(...args);
        await obj.assureData();
        return obj;
    }

    /**
     * Clone an EC numbers instance
     * @param {ECNumbers} other
     * @todo fix
     */
    static makeClone(other, newGoData = null) {
        if (newGoData !== null) {
            GOTerms.goData = new Map(newGoData);
        }
        GOTerms._addData(other._data);
        return new GOTerms(other._data, other._trust);
    }

    static ingestGoData(newGoData) {
        GOTerms.goData = new Map(newGoData);
    }

    // ------------------- Static getters ---------------
    /**
     * @param {*} goTerm
     * @param {*} key
     * @param {*} fallback value to use goTerm not found
     * @return {*} The value of the `key` property of `goTerm`
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
     * @param {[FACounts]} newTerms list of new GO Terms
     * @param {[FACounts]} [namespace = null] namsepace to use if not given
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
     * @param {[string]} codes array of GO terms that should be in the cache
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
