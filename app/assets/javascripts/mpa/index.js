import {Dataset} from "./dataset.js";
import TreeView from "unipept-visualizations/src/treeview/treeview.js";

class MPA {
    constructor(peptides = []) {
        this.datasets = [];
        this.addDataset(peptides);
    }

    async addDataset(peptides) {
        let dataset = new Dataset(peptides);
        this.datasets.push(dataset);
        let tree = await dataset.process();
        $("#treeview").treeview(tree.getRoot(), {
            width: 900,
            height: 600,
        });
        console.log(tree);
    }
}

export {MPA};
