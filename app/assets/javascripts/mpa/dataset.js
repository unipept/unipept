import {Resultset} from "./resultset.js";
import {Node} from "./node.js";
import {Tree} from "./tree.js";

const BATCH_SIZE = 100,
    PEPT2LCA_URL = "/mpa/pept2lca",
    PEPT2FA_URL = "/mpa/pept2fa",
    TAXA_URL = "/private_api/taxa";

/**
 * @typedef TaxonInfo
 * @type {object}
 * @property {number} id The taxon id
 * @property {string} name The name of the taxon
 * @property {string} rank The rank of the taxon
 */

/**
 * @typedef PeptideInfo
 * @type {object}
 * @property {string} sequence The peptide sequence
 * @property {number} count The number of times the peptide occurs
 * @property {number} lca The taxon id of the lca
 * @property {number[]} lineage The lineage of the lca
 */

/**
 * Class that represents a single dataset containing a list of peptides.
 *
 * @type {Dataset}
 */
class Dataset {
    /**
     * Creates a Dataset object based on a list of peptides
     *
     * @param  {string[]}  [peptides=[]] A list of peptides (strings)
     */
    constructor(peptides = []) {
        this.originalPeptides = Dataset.cleanPeptides(peptides);
        this.tree = null;
        this.fa = {go: null, ec: null};
        this.taxonMap = new Map();
        this.taxonMap.set(1, {id: 1, ranke: "no rank", name: "root"});
    }

    /**
     * Processes the list of peptides set in the dataset and returns a
     * taxonomic tree.
     *
     * @param  {boolean}  il should we equate I and L
     * @param  {boolean}  dupes should we filter duplicates
     * @param  {boolean}  missed should we perform
     *   advancedMissedCleavageHandling
     * @return {Promise.<Tree>} The taxonomic tree containing all peptides.
     */
    async search({il, dupes, missed}) {
        this.resultset = new Resultset(this, {il, dupes, missed});
        await this.resultset.process();
        const tree = this.buildTree(this.resultset.processedPeptides.values());
        const taxonInfo = Dataset.getTaxonInfo(tree.getTaxa());
        tree.setCounts();
        tree.setTaxonNames(await taxonInfo);
        tree.sortTree();
        this.tree = tree;
        this.fa.go = this.resultset.go;
        this.fa.ec = this.resultset.ec;
        this.addTaxonInfo(await taxonInfo);
        return tree;
    }

    /**
     * Reprocesses functional analysis data with other cutoff
     * @param {int} cutoff as percent (0-100)
     * @param {string[]} sequences array of peptides to take into account
    */
    async reprocessFA(cutoff=50, sequences=null) {
        await this.resultset.proccessFA(cutoff, sequences);
        this.fa = this.resultset.fa;
    }


    /**
     * Creates a hierarchic tree structure based on the input peptides. This is
     * also set as the tree property of the Dataset object.
     *
     * @param  {Iterable<PeptideInfo>} peptides A list of peptides to build the tree
     *   from
     * @return {Tree} A taxon tree containing all peptides
     */
    buildTree(peptides) {
        const tree = new Tree();
        for (const peptide of peptides) {
            let currentNode = tree.getRoot();
            for (const taxid of peptide.lineage) {
                if (taxid !== null) {
                    let newNode = currentNode.getChild(taxid);
                    if (newNode === null) {
                        newNode = new Node(taxid);
                        tree.addChild(currentNode, newNode);
                    }
                    currentNode = newNode;
                }
            }
            currentNode.addValue(peptide);
        }
        return tree;
    }

    /**
     * Adds new taxon info to the global taxon map
     *
     * @param {TaxonInfo[]} taxonInfo A list of new taxon info
     */
    addTaxonInfo(taxonInfo) {
        for (const t of taxonInfo) {
            this.taxonMap.set(t.id, t);
        }
    }

    /**
     * Converts the current analysis to the csv format. Each row contains a
     * peptide and its lineage, with each column being a level in the taxonomy
     *
     * @return {string} The analysis result in csv format
     */
    toCSV() {
        return this.resultset.toCSV();
    }

    /**
     * Returns the number of matched peptides, taking the deduplication setting
     * into account.
     *
     * @return {number} The number of matched peptides
     */
    getNumberOfMatchedPeptides() {
        return this.tree.root.data.count;
    }

    /**
     * Returns the number of searched for peptides, taking the deduplication
     * setting into account.
     *
     * @return {number} The number of searched for peptides
     */
    getNumberOfSearchedForPeptides() {
        return this.resultset.getNumberOfSearchedForPeptides();
    }

    /**
     * Returns the list of unmached peptides for the current resultset
     *
     * @return {string[]} An array of peptides without match
     */
    getMissedPeptides() {
        return this.resultset.missedPeptides;
    }

    /**
     * Returns a list of sequences that have the specified FA term
     * @param {String} faName The name of the FA term (GO:000112, EC:1.5.4.1)
     * @return {[{sequence, totalCount, relativeCount}]} A list of objects representing
     *                                                   the matches
     */
    getPeptidesByFA(faName) {
        return this.resultset.getPeptidesByFA(faName);
    }

    /**
     * Fetches the taxon info from the Unipept API for a list of taxon id's and
     * returns an Array of objects containing the id, name and rank for each
     * result.
     *
     * @param {number[]} taxids Array containing taxon id integers
     * @return {Promise.<TaxonInfo[]>} containing an array of result objects
     * with id, name and rank fields
     */
    static getTaxonInfo(taxids) {
        return Dataset.postJSON(TAXA_URL, JSON.stringify({taxids: taxids}));
    }

    /**
     * Converts a list of peptides to uppercase
     *
     * @param  {string[]} peptides a list of peptides
     * @return {string[]} The converted list
     */
    static cleanPeptides(peptides) {
        return peptides.map(p => p.toUpperCase());
    }

    /**
     * Posts data to a url as json and returns a promise containing the parsed
     * (json) response
     *
     * @param  {string} url The url to which we want to send the request
     * @param  {string} data The data to post in JSON format
     * @return {Promise} A Promise containing the parsed response data
     */
    static postJSON(url, data) {
        return fetch(url, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: data,
        }).then(res => res.json());
    }

    /**
     * The batch size to fetch peptides at a time
     */
    static get BATCH_SIZE() {
        return BATCH_SIZE;
    }

    /**
     * The URL to fetch lca info
     */
    static get PEPT2LCA_URL() {
        return PEPT2LCA_URL;
    }

    /**
     * The URL to fetch fa info
     */
    static get PEPT2FA_URL() {
        return PEPT2FA_URL;
    }

    /**
     * The URL to fetch taxon info
     */
    static get TAXA_URL() {
        return TAXA_URL;
    }
}

export {Dataset};
