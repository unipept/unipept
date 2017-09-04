import {Dataset} from "./dataset.js";
import "unipept-visualizations/src/treemap/treemap.js";
import "unipept-visualizations/src/treeview/treeview.js";
import "unipept-visualizations/src/sunburst/sunburst.js";

class MPA {
    constructor(peptides = [], il = true, dupes = true, missed = false) {
        this.datasets = [];
        this.searchSettings = {
            il: il,
            dupes: dupes,
            missed: missed,
        };
        this.addDataset(peptides).then( dataset => {
            this.setUpVisualisations(dataset.tree.getRoot());
        });
        this.setUpForm(peptides, il, dupes, missed);
    }

    async addDataset(peptides) {
        this.enableProgressBar(true);
        let dataset = new Dataset(peptides);
        this.datasets.push(dataset);
        await dataset.process(this.searchSettings.il, this.searchSettings.dupes, this.searchSettings.missed);
        this.enableProgressBar(false);
        return dataset;
    }

    setUpVisualisations(root) {
        const data = JSON.stringify(root);
        this.setUpSunburst(JSON.parse(data));
        $("#mpa-treemap").treemap(JSON.parse(data));
        $("#mpa-treeview").treeview(JSON.parse(data));
    }

    setUpForm(peptides, il, dupes, missed) {
        $("#qs").text(peptides.join("\n"));
        $("#il").prop("checked", il);
        $("#dupes").prop("checked", dupes);
        $("#missed").prop("checked", missed);
    }

    setUpSunburst(data) {
        $("#mpa-sunburst").sunburst(data, {
            width: 740,
            height: 740,
            getTooltip: this.tooltipContent,
            getTitleText: d => `${d.name} (${d.rank})`,
        });
    }

    enableProgressBar(enable = true) {
        if (enable) {
            $("#progress-analysis").css("visibility", "visible");
        } else {
            $("#progress-analysis").css("visibility", "hidden");
        }
    }

    tooltipContent(d) {
        return "<b>" + d.name + "</b> (" + d.data.rank + ")<br/>" +
            (!d.data.self_count ? "0" : d.data.self_count) +
            (d.data.self_count && d.data.self_count === 1 ? " sequence" : " sequences") + " specific to this level<br/>" +
            (!d.data.count ? "0" : d.data.count) +
            (d.data.count && d.data.count === 1 ? " sequence" : " sequences") + " specific to this level or lower";
    }
}

export {MPA};
