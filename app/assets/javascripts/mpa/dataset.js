import {Node} from "./node.js";
import {Tree} from "./tree.js";

const BATCH_SIZE = 100,
    PEPT2LCA_URL = "/mpa/pept2lca",
    TAXA_URL = "/mpa/taxa";

class Dataset {
    constructor(peptides = []) {
        this.originalPeptides = Dataset.cleanPeptides(peptides);
    }

    async process(il, dupes, missed) {
        const peptideMap = this.preparePeptides(il, dupes, missed);
        const peptideList = Array.from(peptideMap.keys());
        const processedPeptides = [];
        for (let i = 0; i < peptideList.length; i += BATCH_SIZE) {
            const data = JSON.stringify({
                peptides: peptideList.slice(i, i + BATCH_SIZE),
                equate_il: il,
            });
            const result = await Dataset.postJSON(PEPT2LCA_URL, data);
            processedPeptides.push(...result.peptides);
        }
        for (let peptide of processedPeptides) {
            peptide.count = dupes ? 1 : peptideMap.get(peptide.sequence);
        }
        const tree = this.buildTree(processedPeptides, peptideMap, dupes);
        const taxonInfo = Dataset.getTaxonInfo(tree.getTaxa());
        tree.setCounts();
        tree.setTaxonNames(await taxonInfo);
        return tree;
    }

    buildTree(peptides) {
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
        this.tree = tree;
        return tree;
    }

    preparePeptides(il, dupes, missed) {
        let peptides = Dataset.cleavePeptides(this.originalPeptides, missed);
        peptides = Dataset.filterShortPeptides(peptides);
        peptides = Dataset.equateIL(peptides, il);
        peptides = Dataset.indexPeptides(peptides);
        return peptides;
    }

    static getTaxonInfo(taxids) {
        return Dataset.postJSON(TAXA_URL, JSON.stringify({taxids: taxids}));
    }

    static cleanPeptides(peptides) {
        return peptides.map(p => p.toUpperCase());
    }

    static indexPeptides(peptides) {
        const peptideMap = new Map();
        for (let peptide of peptides) {
            const count = peptideMap.get(peptide) || 0;
            peptideMap.set(peptide, count + 1);
        }
        return peptideMap;
    }

    static cleavePeptides(peptides, advancedMissedCleavageHandling) {
        if (!advancedMissedCleavageHandling) {
            return peptides.join("+")
                .replace(/([KR])([^P])/g, "$1+$2")
                .replace(/([KR])([^P+])/g, "$1+$2")
                .split("+");
        }
        return peptides;
    }

    static filterShortPeptides(peptides) {
        return peptides.filter(p => p.length >= 5);
    }

    static equateIL(peptides, equateIL) {
        if (equateIL) {
            return peptides.map(p => p.replace(/I/g, "L"));
        }
        return peptides;
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
