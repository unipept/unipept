import {Node} from "./node.js";
import {Tree} from "./tree.js";

const BATCH_SIZE = 100,
    PEPT2LCA_URL = "/mpa/pept2lca",
    TAXA_URL = "/mpa/taxa";

class Dataset {
    constructor(peptides = []) {
        this.originalPeptides = Dataset.cleanPeptides(peptides);
        this.length = this.originalPeptides.length;
    }

    async process() {
        const peptides = [];
        for (let i = 0; i < this.length; i += BATCH_SIZE) {
            const data = JSON.stringify({
                peptides: this.originalPeptides.slice(i, i + BATCH_SIZE),
            });
            const result = await Dataset.postJSON(PEPT2LCA_URL, data);
            peptides.push(...result.peptides);
        }
        const tree = this.aggregate(peptides);
        const taxonInfo = Dataset.getTaxonInfo(tree.getTaxa());
        tree.setCounts();
        tree.setTaxonNames(await taxonInfo);
        return tree;
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

    static getTaxonInfo(taxids) {
        return Dataset.postJSON(TAXA_URL, JSON.stringify({taxids: taxids}));
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
