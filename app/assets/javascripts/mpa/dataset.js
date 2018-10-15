import {Resultset} from "./resultset.js";
import {Node} from "./node.js";
import {Tree} from "./tree.js";
import {postJSON} from "../utils.js";

const TAXA_URL = "/private_api/taxa";

/**
 * Class that represents a single dataset containing a list of peptides.
 *
 *
 *
 */
class Dataset {
    /**
     * Creates a Dataset object based on a list of peptides
     *
     * @param  {string[]}  [peptides=[]] A list of peptides (strings)
     */
    constructor(peptides = []) {
        this.originalPeptides = Dataset.cleanPeptides(peptides);

        /** @type {Tree} */
        this.tree = null;
        this._fa = null;
        this.baseFa = null;

        /** @type {Map<number,TaxonInfo>} */
        this.taxonMap = new Map();
        this.taxonMap.set(1, {id: 1, rank: "no rank", name: "root"});
    }

    /**
     * Processes the list of peptides set in the dataset and returns a
     * taxonomic tree.
     *
     * @param  {MPAConfig}  mpaConfig
     * @return {Promise<Tree>} Taxonomic tree
     */
    async search(mpaConfig) {
        this.resultset = new Resultset(this, mpaConfig);
        await this.resultset.process();
        const tree = this.buildTree(this.resultset.processedPeptides.values());
        const taxonInfo = Dataset.getTaxonInfo(tree.getTaxa());
        tree.setCounts();
        tree.setTaxonNames(await taxonInfo);
        tree.sortTree();
        this.tree = tree;
        this._fa = null;
        this.addTaxonInfo(await taxonInfo);
        return tree;
    }

    /**
     * Reprocesses functional analysis data with other cutoff
     * @param {number} cutoff as percent (0-100)
     * @param {string[]} sequences array of peptides to take into account
     */
    async reprocessFA(cutoff = 50, sequences = null) {
        await this.resultset.proccessFA(cutoff, sequences);
        this._fa = this.resultset.fa;
    }

    /**
     * Sets the surrent FA summary as base, accesible trough baseFa.
     */
    setBaseFA() {
        this.baseFa = this.fa.clone();
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
     * Creates a tree like structure, that is this.tree where each node has an
     * `included` property. This property indicaes if this node or any of its
     * childs contain the saught for functional annlotation (code).
     *
     * @param  {string} code The FA term to look for
     *   from
     * @return {Promise<Object>} A taxon tree-like object annotated with `included`
     */
    async getFATree(code) {
        const pepts = (await this.getPeptidesByFA(code)).map(pept => pept.sequence);
        return this.tree.getRoot().callRecursivelyPostOder((t, c) => {
            const included = c.some(x => x.included) || t.values.some(pept => pepts.includes(pept.sequence));
            return Object.assign(Object.assign({}, t), {included: included, children: c});
        });
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
     * @return {Promise<string>} The analysis result in csv format
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
     * @param {String[]} sequences List of sequences to limit to
     * @return {Promise<{sequence, hits, type, annotatedCount,allCount,relativeCount,count,lca,lcaName}[]>} A list of objects representing
     *                                                   the matches
     */
    getPeptidesByFA(faName, sequences) {
        return this.resultset.getPeptidesByFA(faName, sequences);
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
        return postJSON(TAXA_URL, JSON.stringify({taxids: taxids}));
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
     * The URL to fetch taxon info
     */
    static get TAXA_URL() {
        return TAXA_URL;
    }

    /**
     *
     * @return {GroupedFA} Functional annotaions
     */
    get fa() {
        return this._fa;
    }
}

export {Dataset};
