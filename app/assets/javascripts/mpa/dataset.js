import {Node} from "./node.js";
import {Tree} from "./tree.js";

const BATCH_SIZE = 1,
    PEPT2LCA_URL = "/mpa/pept2lca";

class Dataset {
    constructor(peptides = []) {
        this.originalPeptides = Dataset.cleanPeptides(peptides);
        this.length = this.originalPeptides.length;
    }

    process() {
        let result = [];
        const startIds = Array.from({length: Math.ceil(this.length/BATCH_SIZE)}, (v, k) => k * BATCH_SIZE);
        return startIds.reduce((sequence, startId) => {
            return sequence.then(() => {
                const data = JSON.stringify({
                    peptides: this.originalPeptides.slice(startId, startId + BATCH_SIZE),
                });
                return Dataset.postJSON(PEPT2LCA_URL, data).then(res => result = result.concat(res.peptides));
            });
        }, Promise.resolve())
            .then(() => this.aggregate(result));
    }

    aggregate(peptides) {
        const tree = new Tree();
        for (let peptide of peptides) {
            let currentNode = tree.getRoot();
            for (let taxid of peptide.lineage) {
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

    static cleanPeptides(peptides) {
        let cleanedPeptides = peptides.map(p => p.toUpperCase());
        return cleanedPeptides;
    }

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
