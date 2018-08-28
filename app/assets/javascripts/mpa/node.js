
/**
 * Node that represents a node in a (taxonomy)tree
 */
class Node {
    /**
     * Creates a node based on a mandatory id. Name and rank are optional.
     *
     * @param  {number} id        The taxon id of the node
     * @param  {String} [name=""] The name of the organism
     * @param  {String} [rank="no rank"] The taxonomic rank of the organism
     */
    constructor(id, name = "", rank = "no rank") {
        this.id = id;
        this.name = name;
        this.rank = rank;
        /** @type Node[] */
        this.children = [];
        this.values = [];
        this.data = {
            self_count: 0,
        };
    }

    /**
     * Searches for a node with the given taxon id in its children. Returns null
     * if it is not found.
     *
     * @param  {number} taxId The taxon id to search for
     * @return {Node} A matching Node object or null
     */
    getChild(taxId) {
        for (let child of this.children) {
            if (child.id === taxId) {
                return child;
            }
        }
        return null;
    }

    /**
     * Returns the number of children for this node.
     *
     * @return {number} The number of children
     */
    getChildCount() {
        return this.children.length;
    }

    /**
     * !! Please use the addChild function of the parent tree instead !!
     * Adds a child to this node.
     *
     * @param {Node} node The child to add
     */
    addChild(node) {
        this.children.push(node);
    }

    /**
     * Adds a peptide value to this node and updates its self_count
     *
     * @param {PeptideInfo} peptide The peptide value to add
     */
    addValue(peptide) {
        this.values.push({
            sequence: peptide.sequence,
            count: peptide.count,
            lca: peptide.lca,
        });
        this.data.self_count += peptide.count;
    }

    /**
     * Returns the number of peptides associated with this node and all of its
     * children
     *
     * @return {number} The number of peptides
     */
    getCounts() {
        if (this.data.count === undefined) {
            this.data.count = this.data.self_count;
            if (this.getChildCount() !== 0) {
                this.data.count += this.children.reduce((sum, c) => sum + c.getCounts(), 0);
            }
        }
        return this.data.count;
    }

    /**
     * Recursively calls a function on this object and its children
     *
     * @param  {function} f The function to call
     */
    callRecursively(f) {
        f.call(this);
        if (this.children) {
            this.children.forEach(c => {
                c.callRecursively(f);
            });
        }
    }

    /**
     * Recursively calls a function on this object and its children  + data of child
     *
     * @param  {function(Node,any): any} f The function to call
     * @return {any} cs
     */
    callRecursivelyPostOder(f) {
        let childResults = [];
        if (this.children) {
            childResults = this.children.map(c =>
                c.callRecursivelyPostOder(f));
        }
        return f(this, childResults);
    }
}

export {Node};
