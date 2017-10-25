import {MPA} from "./index.js";
import {Node} from "./node.js";
import {Tree} from "./tree.js";

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

const BATCH_SIZE = 100,
    PEPT2LCA_URL = "/mpa/pept2lca",
    TAXA_URL = "/mpa/taxa";

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
        this.processedPeptides = [];
        this.missedPeptides = [];
        this.tree = null;
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
    async process(il, dupes, missed) {
        const peptideMap = this.preparePeptides(il, dupes, missed);
        const peptideList = Array.from(peptideMap.keys());
        this.processedPeptides = [];
        for (let i = 0; i < peptideList.length; i += BATCH_SIZE) {
            const data = JSON.stringify({
                peptides: peptideList.slice(i, i + BATCH_SIZE),
                equate_il: il,
                missed: missed,
            });
            const result = await Dataset.postJSON(PEPT2LCA_URL, data);
            this.processedPeptides.push(...result.peptides);
        }
        for (const peptide of this.processedPeptides) {
            peptide.count = dupes ? 1 : peptideMap.get(peptide.sequence);
        }
        const tree = this.buildTree(this.processedPeptides, peptideMap, dupes);
        const taxonInfo = Dataset.getTaxonInfo(tree.getTaxa());
        tree.setCounts();
        tree.setTaxonNames(await taxonInfo);
        tree.sortTree();
        this.setMissedPeptides(peptideList, this.processedPeptides);
        this.tree = tree;
        this.addTaxonInfo(await taxonInfo);
        return tree;
    }

    /**
     * Creates a hierarchic tree structure based on the input peptides. This is
     * also set as the tree property of the Dataset object.
     *
     * @param  {PeptideInfo[]} peptides A list of peptides to build the tree
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
     * Prepares the list of originalPeptides for use in the application by
     * cleaving, filtering, equating IL and finally generating a frequence table
     *
     * @param  {boolean} il should we equate I and L
     * @param  {boolean} dupes should we filter duplicates?
     * @param  {boolean} missed will we perform advancedMissedCleavageHandling
     * @return {Map.<string, number>} A frequency table of the cleaned up
     *   peptides
     */
    preparePeptides(il, dupes, missed) {
        let peptides = Dataset.cleavePeptides(this.originalPeptides, missed);
        peptides = Dataset.filterShortPeptides(peptides);
        peptides = Dataset.equateIL(peptides, il);
        peptides = Dataset.indexPeptides(peptides);
        return peptides;
    }

    /**
     * Calculates the missed peptides and sets the object property
     *
     * @param {string[]} peptideList The peptides we searched for
     * @param {PeptideInfo[]} processedPeptides The list of results
     */
    setMissedPeptides(peptideList, processedPeptides) {
        const foundPeptides = new Set(processedPeptides.map(p => p.sequence));
        this.missedPeptides = peptideList.filter(p => !foundPeptides.has(p));
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
        let result = "peptide,lca," + MPA.RANKS + "\n";
        for (const peptide of this.processedPeptides) {
            let row = peptide.sequence + ",";
            row += this.taxonMap.get(peptide.lca).name + ",";
            row += peptide.lineage.map(e => {
                if (e === null) return "";
                return this.taxonMap.get(e).name;
            });
            row += "\n";
            result += row.repeat(peptide.count);
        }
        return result;
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
     * Creates a frequency table for a list of peptides
     *
     * @param  {string[]} peptides A list of peptides
     * @return {Map.<string, number>} A map containing the frequency of
     *   each peptide
     */
    static indexPeptides(peptides) {
        const peptideMap = new Map();
        for (let peptide of peptides) {
            const count = peptideMap.get(peptide) || 0;
            peptideMap.set(peptide, count + 1);
        }
        return peptideMap;
    }

    /**
     * Splits all peptides after every K or R if not followed by P if
     * advancedMissedCleavageHandling isn't set
     *
     * @param  {string[]} peptides The list of peptides
     * @param  {boolean} advancedMissedCleavageHandling Should we do
     *   advancedMissedCleavageHandling?
     * @return {string[]} The list of cleaved peptides
     */
    static cleavePeptides(peptides, advancedMissedCleavageHandling) {
        if (!advancedMissedCleavageHandling) {
            return peptides.join("+")
                .replace(/([KR])([^P])/g, "$1+$2")
                .replace(/([KR])([^P+])/g, "$1+$2")
                .split("+");
        }
        return peptides;
    }

    /**
     * Filters out all peptides with a length lower than 5
     *
     * @param  {string[]} peptides A list of peptides
     * @return {string[]} A filtered list of peptides
     */
    static filterShortPeptides(peptides) {
        return peptides.filter(p => p.length >= 5);
    }

    /**
     * Replaces every I with an L if equateIL is set to true
     *
     * @param  {string[]} peptides An array of peptides in upper case
     * @param  {boolean}  equateIL Only makes the replacement if this is true
     * @return {string[]} The peptides where the replacements are made
     */
    static equateIL(peptides, equateIL) {
        if (equateIL) {
            return peptides.map(p => p.replace(/I/g, "L"));
        }
        return peptides;
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
}

export {Dataset};
