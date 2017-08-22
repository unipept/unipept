import {Node} from "./node.js";

class Tree {
    constructor(id = -1, name = "root") {
        this.root = new Node(id, name);
        this.nodes = new Map();
        this.taxa = [];
    }

    getRoot() {
        return this.root;
    }

    addChild(node, child) {
        this.nodes.set(child.id, child);
        this.taxa.push(child.id);
        node.addChild(child);
    }

    getTaxa() {
        return this.taxa;
    }

    setTaxonNames(taxa) {
        for (let taxon of taxa) {
            this.nodes.get(taxon.id).name = taxon.name;
        }
    }
}

export {Tree};
