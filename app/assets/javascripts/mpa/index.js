import {Dataset} from "./dataset.js";
import {constructSearchtree} from "./searchtree.js";
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
            this.setUpVisualisations(dataset.tree);
        });
        this.setUpForm(peptides, il, dupes, missed);
        this.initButtons();
    }

    async addDataset(peptides) {
        this.enableProgressBar(true);
        let dataset = new Dataset(peptides);
        this.datasets.push(dataset);
        await dataset.process(this.searchSettings.il, this.searchSettings.dupes, this.searchSettings.missed);
        this.enableProgressBar(false);
        return dataset;
    }

    setUpVisualisations(tree) {
        const data = JSON.stringify(tree.getRoot());
        this.sunburst = this.setUpSunburst(JSON.parse(data));
        this.treemap = this.setUpTreemap(JSON.parse(data));
        this.treeview = this.setUpTreeview(JSON.parse(data));
        this.searchTree = constructSearchtree(tree, this.searchSettings.il);
    }

    setUpForm(peptides, il, dupes, missed) {
        $("#qs").text(peptides.join("\n"));
        $("#il").prop("checked", il);
        $("#dupes").prop("checked", dupes);
        $("#missed").prop("checked", missed);
    }

    initButtons() {
        // sunburst reset
        $("#sunburst-reset").click(() => this.sunburst.reset());

        // sunburst fixed colors
        $("#colorswap").mouseenter(function () {
            if (!$("#colorswap").hasClass("open")) {
                $("#colorswap-button").dropdown("toggle");
            }
        });
        $("#colorswap").mouseleave(function () {
            if ($("#colorswap").hasClass("open")) {
                $("#colorswap-button").dropdown("toggle");
            }
        });
        $("#colorswap li").tooltip({placement: "right", container: "body"});
        $("#colorswap-checkbox").change(() => {
            this.sunburst.settings.useFixedColors = $("#colorswap-checkbox").is(":checked");
            this.sunburst.redrawColors();
        });
    }

    setUpSunburst(data) {
        return $("#mpa-sunburst").sunburst(data, {
            width: 740,
            height: 740,
            radius: 740 / 2,
            getTooltip: this.tooltipContent,
            getTitleText: d => `${d.name} (${d.rank})`,
            rerootCallback: d => this.search(d.name, 1000),
        });
    }

    setUpTreemap(data) {
        return $("#mpa-treemap").treemap(data, {
            width: 916,
            height: 600,
            getBreadcrumbTooltip: d => d.rank,
            getTooltip: this.tooltipContent,
            getLabel: d => `${d.name} (${d.data.self_count}/${d.data.count})`,
            getLevel: d => MPA.RANKS.indexOf(d.rank),
            rerootCallback: d => this.search(d.name),
        });
    }

    setUpTreeview(data) {
        return $("#mpa-treeview").treeview(data, {
            width: 916,
            height: 600,
            getTooltip: this.tooltipContent,
            colors: d => {
                if (d.name === "Bacteria") return "#1565C0"; // blue
                if (d.name === "Archaea") return "#FF8F00"; // orange
                if (d.name === "Eukaryota") return "#2E7D32"; // green
                if (d.name === "Viruses") return "#C62828"; // red
                return d3.scale.category10().call(this, d);
            },
            rerootCallback: d => this.search(d.name, 1000),
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
        return "<b>" + d.name + "</b> (" + d.rank + ")<br/>" +
            (!d.data.self_count ? "0" : d.data.self_count) +
            (d.data.self_count && d.data.self_count === 1 ? " sequence" : " sequences") + " specific to this level<br/>" +
            (!d.data.count ? "0" : d.data.count) +
            (d.data.count && d.data.count === 1 ? " sequence" : " sequences") + " specific to this level or lower";
    }

    search(searchTerm, timeout = 500) {
        let localTerm = searchTerm;
        if (localTerm === "Organism") {
            localTerm = "";
        }
        setTimeout(() => this.searchTree.search(localTerm), timeout);
    }

    static get RANKS() {
        return ["superkingdom", "kingdom", "subkingdom", "superphylum", "phylum", "subphylum", "superclass", "class", "subclass", "infraclass", "superorder", "order", "suborder", "infraorder", "parvorder", "superfamily", "family", "subfamily", "tribe", "subtribe", "genus", "subgenus", "species group", "species subgroup", "species", "subspecies", "varietas", "forma"];
    }
}

export {MPA};
