import {Node} from "./node.js";

/**
 * Class representing a taxonomic tree that is composed of nodes
 *
 * @typedef {Tree}
 * @type {object}
 * @property {Node} root The root of the tree
 * @property {Map<number, Node>} nodes A mapping of taxon_id to node object of
 *   all nodes in the tree
 * @property {number[]} taxa A list of all taxon id's in the tree
 */
class Tree {
    /**
     * Constructs an empty tree object with just the root. The values of the
     * node are passed as parameters.
     *
     * @param  {Number} [id=-1] The taxon id of the root
     * @param  {String} [name="Organism"] The name of the root
     */
    constructor(id = -1, name = "Organism") {
        this.root = new Node(id, name);
        this.nodes = new Map();
        this.taxa = [];
    }

    /**
     * Returns the root node.
     *
     * @return {Node} The root Node
     */
    getRoot() {
        return this.root;
    }

    /**
     * Adds a child Node to a given Node of the tree. Also updates the set of
     * nodes and taxa that are present in the tree.
     *
     * @param {Node} node The node to which we want to add the child
     * @param {Node} child The child we want to add
     */
    addChild(node, child) {
        this.nodes.set(child.id, child);
        this.taxa.push(child.id);
        node.addChild(child);
    }

    /**
     * Returns a list of all taxon ids present in the tree.
     *
     * @return {number[]} A list of taxon ids in the tree
     */
    getTaxa() {
        return this.taxa;
    }

    /**
     * Composes a list of sequences that were added to a node with a given taxon
     * id.
     *
     * @param  {number} nodeId the taxon id for which we want the sequences
     * @return {string[]} a list of peptides (strings)
     */
    getOwnSequences(nodeId) {
        let node;
        if (Number.isInteger(nodeId)) {
            node = this.nodes.get(nodeId);
        } else {
            node = nodeId;
        }
        return node.values.map(d => d.sequence);
    }

    /**
     * Composes a list of sequences that were added to a node with a given taxon
     * id or any of its children.
     *
     * @param  {number} nodeId the taxon id for which we want the sequences
     * @return {string[]} a list of peptides (strings)
     */
    getAllSequences(nodeId) {
        let node;
        if (Number.isInteger(nodeId)) {
            node = this.nodes.get(nodeId);
        } else {
            node = nodeId;
        }
        let s = this.getOwnSequences(node);
        for (let i = 0; i < node.children.length; i++) {
            s = s.concat(this.getAllSequences(node.children[i].id));
        }
        return s;
    }

    /**
     * Completes the name and rank information present in the tree, from a list
     * of TaxonInfos
     *
     * @param {TaxonInfo[]} taxa The taxoninformation we want to add.
     */
    setTaxonNames(taxa) {
        for (let taxon of taxa) {
            const t = this.nodes.get(taxon.id);
            t.name = taxon.name;
            t.rank = taxon.rank;
        }
    }

    /**
     * Sets the counts of the root of the tree.
     */
    setCounts() {
        this.root.getCounts();
    }

    /**
     * Sorts all children of the tree by name of the organism
     */
    sortTree() {
        this.root.callRecursively( function () {
            this.children.sort(function (a, b) {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });
        });
    }
}

export {Tree};
