import {addCopy, downloadDataByForm, logToGoogle, triggerDownloadModal, numberToPercent, stringTitleize, toCSVString} from "../utils.js";
import {Dataset} from "./dataset.js";
import {constructSearchtree} from "./searchtree.js";
import {showInfoModal} from "../modal.js";
import {AmountTable} from "../components/amounttable.js";
import "unipept-visualizations/dist/unipept-visualizations.es5.js";
import GOTerms from "../components/goterms.js";
import ECNumbers from "../components/ecnumbers.js";

/* eslint require-jsdoc: off */
class MPA {
    constructor(peptides = [], il = true, dupes = true, missed = false) {
        this.datasets = [];
        this.searchSettings = {
            il: il,
            dupes: dupes,
            missed: missed,
        };
        this.addDataset(peptides);
        this.setUpForm(peptides, il, dupes, missed);
        this.setUpButtons();
        this.setUpSaveImage();
        this.setUpFullScreen();
        this.setUpActionBar();
    }

    /**
     * Creates a new dataset based on a list of peptides. After creating, an
     * analysis is run with the current search settings. The returned Promise
     * contains the new dataset and resolves after the analysis is complete.
     *
     * @param  {string[]}  peptides The list of peptides to analyse
     * @return {Promise<Dataset>} Promise of the created dataset object.
     */
    async addDataset(peptides) {
        this.enableProgressBar(true, true);
        let dataset = new Dataset(peptides);
        this.datasets.push(dataset);
        await this.analyse(this.searchSettings);
        this.enableProgressBar(false);
        return dataset;
    }

    /**
     * Analyses the current dataset for a given set of search settings. Returns
     * an empty Promise that resolves when the analysis is done.
     *
     * @param  {object}  searchSettings The searchsettings (il, dupes, missed)
     *   to use.
     * @return {Promise<Dataset>} The dataset on which the analysis was
     *   performed
     */
    async analyse(searchSettings) {
        const dataset = this.datasets[0];
        await dataset.search(this.searchSettings);
        this.setUpVisualisations(dataset.tree);
        this.setUpFAVisualisations(dataset.fa);
        this.setUpMissedPeptides(dataset.getMissedPeptides());
        this.updateStats(dataset.getNumberOfMatchedPeptides(), dataset.getNumberOfSearchedForPeptides());
        return dataset;
    }

    downloadPeptidesFor(name) {
        const dataset = this.datasets[0];
        const result = [["sequence", "count", "evidence"]]
            .concat(dataset.getPeptidesByFA(name)
                .map(x => [x.sequence, x.totalCount, x.relativeCount]));
        downloadDataByForm(toCSVString(result), name+".csv", "text/csv");
    }

    /**
     * Updates the search settings and reruns the analysis. Resolves when the
     * analysis is done.
     *
     * @param  {boolean}  il equate il
     * @param  {boolean}  dupes  filter duplicates
     * @param  {boolean}  missed enable advancedMissedCleavageHandling
     */
    async updateSearchSettings({il, dupes, missed}) {
        this.searchSettings = {il: il, dupes: dupes, missed: missed};
        this.enableProgressBar(true, true);
        $("#search-intro").text("Please wait while we process your data");
        await this.analyse(this.searchSettings);
        this.enableProgressBar(false);
    }

    setUpVisualisations(tree) {
        const data = JSON.stringify(tree.getRoot());
        this.sunburst = this.setUpSunburst(JSON.parse(data));
        this.treemap = this.setUpTreemap(JSON.parse(data));
        this.treeview = this.setUpTreeview(JSON.parse(data));
        this.searchTree = constructSearchtree(tree, this.searchSettings.il);
    }


    /**
     * Recalculate the FA data to only use data of the specified taxon id.
     *
     * This automatically takes into account the selected percent level
     *
     * @param {string} [name="Organism"] The chosen name
     * @param {int} [id=-1] the taxon id whose sequences should be taken into account
     *                      use -1 to use everything (Organism)
     */
    redoFAcalculations(name="Organism", id=-1) {
        $(".mpa-scope").text(name);
        const percent = $("#goFilterPerc").val()*1; // TODO remove
        const dataset = this.datasets[0];
        dataset.reprocessFA(percent, id > 0 ? dataset.tree.getAllSequences(id) : null)
            .then(()=>this.setUpFAVisualisations(dataset.fa));
    }

    setUpFAVisualisations({go, ec}) {
        this.setUpGo(go);
        this.setUpEC(ec);
    }

    /**
     * Create visualisations of the GO numbers
     * @param {GOTerms} go Data about GO Terms
     */
    setUpGo(go) {
        const goPanel = d3.select("#goPanel");
        goPanel.html("");
        for (let variant of GOTerms.NAMESPACES) {
            const variantName = stringTitleize(variant);

            const article = goPanel.append("div").attr("class", "row");
            article.append("h3").text(variantName);
            this.setUpGoTable(go, variant, article);
            this.setUpQuickGo(go, variant, variantName, article);
        }
    }

    setUpGoTable(goResultset, variant, target) {
        const tablepart = target.append("div").attr("class", "col-xs-8");
        new AmountTable({
            title: `GO terms - ${variant}`,
            el: tablepart,
            header: ["Score", "GO term", "Name", ""],
            data: goResultset.sortedTerms(variant),
            limit: 5,
            contents: [
                { // Count
                    text: d => d.value.toString(),
                    html: d => numberToPercent(d.value, 2),
                    style: {"width": "5em"},
                    shade: d=>100*d.value,
                },
                { // Go term
                    html: d => `<a href="https://www.ebi.ac.uk/QuickGO/term/${d.code}" target="_blank">${d.code}</a>`,
                    text: d => d.code,
                    style: {"width": "7em"},
                },
                { // name
                    text: d => GOTerms.nameOf(d.code),
                },
                { // List
                    builder: cell => {
                        const link = cell.append("button");
                        link.classed("btn btn-default btn-xs", true);
                        link.on("click", d => this.downloadPeptidesFor(d.code));
                        link.html("<span class='glyphicon glyphicon-download-alt'></span>");
                    },
                    text: d => "",
                    style: {"width": "1.5em"},
                },
            ],
            tooltip: d => this.tooltipGO(d.code, goResultset, d),
            tooltipID: "#tooltip",
        }).draw();
    }

    setUpQuickGo(goResultset, variant, variantName, target) {
        const top5 = goResultset.sortedTerms(variant).slice(0, 5).map(x => x.code);
        const quickGoChartURL = GOTerms.quickGOChartURL(top5);
        const top5WithNames = top5.map(x => `${GOTerms.nameOf(x)} (${numberToPercent(goResultset.getValueOf(x))})`);
        const top5sentence = top5WithNames.slice(0, -1).join(", ")
                             + (top5.length > 1 ? " and ": "")
                             + top5WithNames[top5WithNames.length-1];
        target
            .append("div").attr("class", "col-xs-4")
            .append("img")
            .attr("src", quickGoChartURL)
            .attr("class", "quickGoThumb")
            .attr("title", `QuickGO chart of ${top5sentence}`)
            .on("click", () => {
                showInfoModal("QuickGo "+variantName, `
                    This chart shows the realationship between the ${top5.length} most occuring GO terms: ${top5sentence}.<br/>
                    <a href="${quickGoChartURL}" target="_blank" title="Click to enlarge in new tab"><img style="max-width:100%" src="${quickGoChartURL}" alt="QuickGO chart of ${top5sentence}"/></a>
                    <br>
                    Provided by <a href="https://www.ebi.ac.uk/QuickGO/annotations?goId=${top5.join(",")}" target="_blank">QuickGo</a>.`,
                {wide: true});
            });
    }

    /**
     * Generate a tooltip for an GO term
     * @param  {string}    goTerm   The Ec term to generate a tooltip for
     * @param  {GOTerms} [goResultSet=null]  A `GOTerms` summary
     * @param  {object} [allData=null]  all the data for debugging TODO remove
     * @return {string}    HTML for the tooltip
     */
    tooltipGO(goTerm, goResultSet = null, allData = null) {
        let result = `
            <h4 class="tooltip-fa-title">
                <span class="tooltip-fa-title-name">${GOTerms.nameOf(goTerm)}</span>
                <span class="tooltip-go-title-term small"> ${goTerm}</span>
            </h4>
            <span class="tooltip-go-domain">${stringTitleize(GOTerms.namespaceOf(goTerm))}</span>`;

        if (goResultSet != null) {
            result += `<div class="tooltip-fa-text">Evidence score of ${numberToPercent(goResultSet.getValueOf(goTerm), 2)}</div>`;
        }

        if (allData != null) {
            result += "<table class='table table-condensed'>"+Object.entries(allData).map( ([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")+"</table>";
        }
        return result;
    }

    setUpEC(ecResultset) {
        this.setUpECTree(ecResultset);
        this.setUpECTable(ecResultset);
    }

    /**
     * Generate a tooltip for an EC number
     * @param  {string}    ecNumber   The Ec number to generate a tooltip for
     * @param  {ECNumbers} [ecResultSet=null]  A `ECNumbers` summary
     * @param  {object} [allData=null]  all the data for debugging TODO remove
     * @return {string}    HTML for the tooltip
     */
    tooltipEC(ecNumber, ecResultSet = null, allData=null) {
        const fmt= x=>`<div class="tooltip-ec-ancestor"><span class="tooltip-ec-term">EC ${x}</span><span class="tooltip-ec-name">${ECNumbers.nameOf(x)}</span></div>`;

        let result = `
            <h4 class="tooltip-fa-title">
                <span class="tooltip-fa-title-name">${ECNumbers.nameOf(ecNumber)}</span>
                <span class="tooltip-ec-term small"> EC ${ecNumber}</span>
            </h4>`;

        if (ECNumbers.ancestorsOf(ecNumber).length > 0) {
            result += `${ECNumbers.ancestorsOf(ecNumber).map(c => fmt(c)).join("\n")}`;
        }

        if (ecResultSet != null) {
            result += `<div class="tooltip-fa-text">Evidence score of ${numberToPercent(ecResultSet.getValueOf(ecNumber), 2)}</div>`;
        }

        if (allData != null) {
            result += "<table class='table table-condensed'>"+Object.entries(allData).map( ([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")+"</table>";
        }
        return result;
    }

    /**
     * Create the EC treeview
     *
     * @param {ECNumbers} ecResultSet  A `ECNumbers` summary
     * @return {TreeView} The created treeview
     */
    setUpECTree(ecResultSet) {
        const tree = ecResultSet.createTree("#ecTreeView", {
            width: 916,
            height: 500,
            getTooltip: d => {
                const fullcode = (d.name + ".-.-.-.-").split(".").splice(0, 4).join(".");
                let tip = this.tooltipEC(fullcode);
                tip += `<div class="tooltip-fa-text">
                        Evidence score of ${numberToPercent(d.data.count, 2)} for this and child EC numbers, `;

                if (d.data.self_count == 0) {
                    tip += "no specific annotations";
                } else {
                    if (d.data.self_count == d.data.count) {
                        tip += " all specifically for this number";
                    } else {
                        tip += ` ${numberToPercent(d.data.self_count, 2)} specificly for this number`;
                    }
                }

                tip += "</div>";
                return tip;
            },
        });

        // save tree button
        $("#save-btn-ec").click(() => {
            logToGoogle("Multi peptide", "Save EC Image");
            triggerDownloadModal("#ecTreeView svg", null, "unipept_treeview");
        });

        return tree;
    }

    /**
     * Create the EC amount table
     *
     * @param {ECNumbers} ecResultSet  A `ECNumbers` summary
     */
    setUpECTable(ecResultSet) {
        const target = d3.select("#ecTable");
        target.html("");
        new AmountTable({
            title: "EC numbers",
            el: target,
            header: ["Score", "EC-Number", "Name", ""],
            data: ecResultSet.sortedTerms(),
            limit: 5,
            contents: [
                { // Count
                    text: d => d.value.toString(),
                    html: d => numberToPercent(d.value),
                    style: {"width": "5em"},
                    shade: d=>100*d.value,
                },
                { // EC-number
                    html: d => {
                        const spans = d.code.split(".").map(e => `<span>${e}</span>`).join(".");
                        return `<a href="https://enzyme.expasy.org/EC/${d.code}" class="ec-number-formatted" target="_blank">${spans}</a>`;
                    },
                    text: d => d.code,
                    style: {"width": "8em"},
                },
                { // name
                    text: d => ECNumbers.nameOf(d.code),
                },
                { // List
                    builder: cell => {
                        const link = cell.append("button");
                        link.classed("btn btn-default btn-xs", true);
                        link.on("click", d => this.downloadPeptidesFor("EC:"+d.code));
                        link.html("<span class='glyphicon glyphicon-download-alt'></span>");
                    },
                    text: d => "",
                    style: {"width": "1.5em"},
                },
            ],
            tooltip: d => this.tooltipEC(d.code, ecResultSet, d),
            tooltipID: "#tooltip",
        }).draw();
    }

    /**
     * Show a list peptides for which we got no result;
     *
     * @param {string[]} missedPeptides The list of missed peptides
     */
    setUpMissedPeptides(missedPeptides) {
        const missedHTML = missedPeptides.sort().map(p => `<li><a href="http://blast.ncbi.nlm.nih.gov/Blast.cgi?PAGE_TYPE=BlastSearch&amp;SET_SAVED_SEARCH=on&amp;USER_FORMAT_DEFAULTS=on&amp;PAGE=Proteins&amp;PROGRAM=blastp&amp;QUERY=${p}&amp;GAPCOSTS=11%201&amp;EQ_MENU=Enter%20organism%20name%20or%20id--completions%20will%20be%20suggested&amp;DATABASE=nr&amp;BLAST_PROGRAMS=blastp&amp;MAX_NUM_SEQ=100&amp;SHORT_QUERY_ADJUST=on&amp;EXPECT=10&amp;WORD_SIZE=3&amp;MATRIX_NAME=BLOSUM62&amp;COMPOSITION_BASED_STATISTICS=2&amp;SHOW_OVERVIEW=on&amp;SHOW_LINKOUT=on&amp;ALIGNMENT_VIEW=Pairwise&amp;MASK_CHAR=2&amp;MASK_COLOR=1&amp;GET_SEQUENCE=on&amp;NEW_VIEW=on&amp;NUM_OVERVIEW=100&amp;DESCRIPTIONS=100&amp;ALIGNMENTS=100&amp;FORMAT_OBJECT=Alignment&amp;FORMAT_TYPE=HTML&amp;OLD_BLAST=false" target="_blank">${p}</a> <span class="glyphicon glyphicon-share-alt"></span></li>`);
        $(".mismatches").html(missedHTML.join(""));
    }

    /**
     * Update the intro text to display the search stats.
     *
     * @param  {number} matches The number of matched peptides
     * @param  {total} total The total number of peptides searched for
     */
    updateStats(matches, total) {
        $("#search-intro").text(`We managed to match ${matches} of your ${total} peptides.`);
    }

    setUpForm(peptides, il, dupes, missed) {
        $("#qs").text(peptides.join("\n"));
        $("#il").prop("checked", il);
        $("#dupes").prop("checked", dupes);
        $("#missed").prop("checked", missed);

        // enable tooltips
        $(".js-has-hover-tooltip").tooltip({
            container: "body",
            placement: "right",
        });
        $(".js-has-focus-tooltip").tooltip({
            trigger: "focus",
            container: "body",
            placement: "right",
        });
    }

    setUpButtons() {
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

        // treemap reset
        $("#treemap-reset").click(() => this.treemap.reset());

        // treeview reset
        $("#treeview-reset").click(() => this.treeview.reset());

        // download results
        $("#mpa-download-results").click(() => downloadDataByForm(this.datasets[0].toCSV(), "mpa_result.csv"));
        // update settings
        $("#mpa-update-settings").click(() => this.updateSearchSettings({
            il: $("#il").prop("checked"),
            dupes: $("#dupes").prop("checked"),
            missed: $("#missed").prop("checked"),
        }));

        /* TODO remove*/
        const $perSelector = $("#goFilterPerc");
        $perSelector.val(50);
        $perSelector.change(()=>{
            this.redoFAcalculations();
        });

        // copy to clipboard button for missed peptides
        addCopy("#copy-missed span", () => $(".mismatches").text().replace(/ /g, "\n"));
    }

    setUpSaveImage() {
        $("#buttons").prepend("<button id='save-btn' class='btn btn-default btn-xs btn-animate'><span class='glyphicon glyphicon-download down'></span> Save as image</button>");
        $("#save-btn").click(() => this.saveImage());
    }

    setUpFullScreen() {
        if (fullScreenApi.supportsFullScreen) {
            $("#buttons").prepend("<button id='zoom-btn' class='btn btn-default btn-xs btn-animate'><span class='glyphicon glyphicon-resize-full grow'></span> Enter full screen</button>");
            $("#zoom-btn").click(() => {
                logToGoogle("Multi Peptide", "Full Screen", this.getActiveTab());
                window.fullScreenApi.requestFullScreen($(".full-screen-container").get(0));
            });
            $(document).bind(fullScreenApi.fullScreenEventName, () => this.resizeFullScreen(this));
        }
    }

    setUpActionBar() {
        $(".fullScreenActions a").tooltip({placement: "bottom", delay: {"show": 300, "hide": 300}});
        $(".fullScreenActions .reset").click(() => this.mapping(this.getActiveTab()).reset());
        $(".fullScreenActions .download").click(() => this.saveImage());
        $(".fullScreenActions .exit").click(() => window.fullScreenApi.cancelFullScreen());
    }

    resizeFullScreen(context = this) {
        const activeTab = context.getActiveTab();
        const isFullScreen = window.fullScreenApi.isFullScreen();

        // sync tabs
        $("ul.visualisations li.active").removeClass("active");
        $("ul.visualisations li").each(function (i, el) {
            if ($(el).find("a").attr("href") === "#" + activeTab + "Wrapper") {
                $(el).addClass("active");
            }
        });

        // class
        $(".full-screen-container").toggleClass("full-screen", isFullScreen);
        $(".full-screen-container").toggleClass("not-full-screen", !isFullScreen);

        // tooltip
        if (isFullScreen) {
            $(".tip").appendTo(".full-screen-container");
        } else {
            $(".tip").appendTo("body");
        }

        // update visualisations
        context.sunburst.setFullScreen(isFullScreen);
        context.treemap.setFullScreen(isFullScreen);
        context.treeview.setFullScreen(isFullScreen);
    }

    setUpSunburst(data) {
        return $("#mpa-sunburst").sunburst(data, {
            width: 740,
            height: 740,
            radius: 740 / 2,
            getTooltip: this.tooltipContent,
            getTitleText: d => `${d.name} (${d.rank})`,
            rerootCallback: d => this.search(d.id, d.name, 1000),
        });
    }

    setUpTreemap(data) {
        return $("#mpa-treemap").treemap(data, {
            width: 916,
            height: 600,
            levels: 28,
            getBreadcrumbTooltip: d => d.rank,
            getTooltip: this.tooltipContent,
            getLabel: d => `${d.name} (${d.data.self_count}/${d.data.count})`,
            getLevel: d => MPA.RANKS.indexOf(d.rank),
            rerootCallback: d => this.search(d.id, d.name),
        });
    }

    setUpTreeview(data) {
        return $("#mpa-treeview").html("").treeview(data, {
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
            rerootCallback: d => this.search(d.id, d.name, 1000),
        });
    }

    enableProgressBar(enable = true, determinate = false) {
        if (enable) {
            $("#progress-analysis").css("visibility", "visible");
            $("#progress-analysis").toggleClass("unipept-progress-determinate", determinate);
            $("#progress-analysis").toggleClass("unipept-progress-indeterminate", !determinate);
            this.setProgressValue(0);
            eventBus.on("dataset-progress", this.setProgressValue);
        } else {
            $("#progress-analysis").css("visibility", "hidden");
            this.setProgressValue(0);
            eventBus.off("dataset-progress", this.setProgressValue);
        }
    }

    setProgressValue(value = 0) {
        $("#progress-analysis .progressbar").css("width", `${value * 100}%`);
    }

    tooltipContent(d) {
        return "<b>" + d.name + "</b> (" + d.rank + ")<br/>" +
            (!d.data.self_count ? "0" : d.data.self_count) +
            (d.data.self_count && d.data.self_count === 1 ? " sequence" : " sequences") + " specific to this level<br/>" +
            (!d.data.count ? "0" : d.data.count) +
            (d.data.count && d.data.count === 1 ? " sequence" : " sequences") + " specific to this level or lower";
    }

    getActiveTab() {
        const activePane = $(".full-screen-container div.active").attr("id");
        return activePane.split("Wrapper")[0];
    }

    mapping(tab) {
        return this[tab];
    }

    saveImage() {
        const activeTab = this.getActiveTab();
        $(".debug_dump").hide();
        logToGoogle("Multi Peptide", "Save Image", activeTab);
        if (activeTab === "sunburst") {
            d3.selectAll(".toHide").attr("class", "arc hidden");
            triggerDownloadModal("#mpa-sunburst > svg", null, "unipept_sunburst");
            d3.selectAll(".hidden").attr("class", "arc toHide");
        } else if (activeTab === "treemap") {
            triggerDownloadModal(null, "#mpa-treemap", "unipept_treemap");
        } else {
            triggerDownloadModal("#mpa-treeview svg", null, "unipept_treeview");
        }
    }

    /**
     * Propagate selections in the visualisation to the search tree and
     * The functional analysis data.
     *
     * @param {integer} id            Taxon id to inspect
     * @param {string} searchTerm     Search term to put in box
     * @param {integer} [timeout=500] timeout in ms to wait before processing
     * @todo add search term to FA explanation to indicate filtering
     */
    search(id, searchTerm, timeout = 500) {
        let localTerm = searchTerm;
        if (localTerm === "Organism") {
            localTerm = "";
        }
        setTimeout(() => this.searchTree.search(localTerm), timeout);
        setTimeout(() => this.redoFAcalculations(searchTerm, id), timeout);
    }

    static get RANKS() {
        return ["superkingdom", "kingdom", "subkingdom", "superphylum", "phylum", "subphylum", "superclass", "class", "subclass", "infraclass", "superorder", "order", "suborder", "infraorder", "parvorder", "superfamily", "family", "subfamily", "tribe", "subtribe", "genus", "subgenus", "species group", "species subgroup", "species", "subspecies", "varietas", "forma"];
    }
}

export {MPA};
