import {Dataset} from "./dataset.js";
import TreeView from "unipept-visualizations/src/treeview/treeview.js";

class MPA {
    constructor(peptides = [], il = true, dupes = true, missed = false) {
        this.datasets = [];
        this.addDataset(peptides);
        this.setUpForm(peptides, il, dupes, missed);
    }

    async addDataset(peptides) {
        this.enableProgressBar(true);
        let dataset = new Dataset(peptides);
        this.datasets.push(dataset);
        let tree = await dataset.process();
        $("#treeview").treeview(tree.getRoot());
        this.enableProgressBar(false);
        return dataset;
    }

    setUpForm(peptides, il, dupes, missed) {
        $("#qs").text(peptides.join("\n"));
        $("#il").prop("checked", il);
        $("#dupes").prop("checked", dupes);
        $("#missed").prop("checked", missed);
    }

    enableProgressBar(enable = true) {
        if (enable) {
            $("#progress-analysis").css("visibility", "visible");
        } else {
            $("#progress-analysis").css("visibility", "hidden");
        }
    }
}

export {MPA};
