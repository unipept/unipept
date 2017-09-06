import {Node} from "./node.js";

class Tree {
    constructor(id = -1, name = "Organism") {
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

    getOwnSequences(nodeId) {
        let node;
        if (Number.isInteger(nodeId)) {
            node = this.nodes.get(nodeId);
        } else {
            node = nodeId;
        }
        return node.values.map(d => d.sequence);
    }

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

    setTaxonNames(taxa) {
        for (let taxon of taxa) {
            const t = this.nodes.get(taxon.id);
            t.name = taxon.name;
            t.rank = taxon.rank;
        }
    }

    setCounts() {
        this.root.getCounts();
    }

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
