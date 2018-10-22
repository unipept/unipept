import "unipept-visualizations/dist/unipept-visualizations.es5.js";
import {AmountTable} from "../components/amount_table.js";
import {FunctionalAnnotations} from "../fa/FunctionalAnnotations.js"; // eslint-disable-line no-unused-vars
import ECNumbers from "../fa/ecnumbers.js";
import GOTerms from "../fa/goterms.js";
import {showInfoModal} from "../modal.js";
import {showNotification} from "../notifications.js";
import {addCopy, downloadDataByForm, logToGoogle, numberToPercent, stringTitleize, toCSVString, triggerDownloadModal, showError, showInfo} from "../utils.js";
import {Dataset} from "./dataset.js";
import {constructSearchtree} from "./searchtree.js";
import {DatasetManager} from "./datasetManager";
/* eslint require-jsdoc: off */

/**
 * @typedef MPADisplaySettings
 * @type {object}
 * @property {{sortFunc,field,name,format,formatData,shadeField}} sortFA
 * @property {boolean} onlyStarredFA
 * @property {number} percentFA
 */

/**
 * The Multi Peptide Analysis frontend class
 */
class MPA {
    /**
     * Setup the MPA gui
     * @param {string[]} selectedDatasets List of all datasets that should be compared and loaded
     */
    constructor(selectedDatasets = []) {
        this.datasetManager = new DatasetManager();

        /** @type {Dataset[]} */
        this.datasets = [];
        this.names = [];

        /** @type {MPAConfig[]} */
        this.searchSettings = [];
        this.searchTerms = [];

        // @ts-ignore because it will be filled by setUpButtons
        this.displaySettings = {
            onlyStarredFA: false,
        };

        // Stores the current dataset that's being worked with
        this.currentDataSet = 0;

        this.processDatasets(selectedDatasets);

        // TODO fix form for multiple datasets
        //this.setUpForm(peptides);
        this.setUpButtons();
        this.setUpHelp();
        this.setUpSaveImage();
        this.setUpFullScreen();
        this.setUpActionBar();
    }

    showError(error) {
        showError(error, `
        An error occured while proccesing your peptides. 
        Try resubmitting your peptides. 
        Contact us if the problem persists.`);
    }

    /**
     * This function processes every dataset indicated by name from the given list of dataset names.
     *
     * @param {String[]} names A list of names of all datasets that should be processed.
     * @returns {Promise<void>}
     */
    async processDatasets(names) {
        this.enableProgressBar(true, true);
        this.enableProgressBar(true, false, "#progress-fa-analysis");
        this.disableGui();
        for (let name of names) {
            try {
                let dataset = await this.datasetManager.loadDataset(name);

                // Check if dataset does indeed exist in the local storage
                if (dataset) {
                    this.searchTerms.push({
                        id: 1,
                        term: "Organism"
                    });

                    this.searchSettings.push(dataset.configuration);
                    this.names.push(dataset.name);
                    await this.processDataset(dataset);
                } else {
                    showInfo("Dataset " + name + " was not found in local storage and is not included in the comparison.");
                }
            } catch(err) {
                showError(err, "Something went wrong while loading dataset " + name + ".");
            }
        }
        this.enableProgressBar(false);
        this.disableGui(false);
    }

    async processDataset(data) {
        let dataset = new Dataset(data.peptides);
        this.datasets.push(dataset);
        this.currentDataSet = this.datasets.length - 1;

        this.setUpDatasetButton(data);
        await this.analyse(this.searchSettings[this.currentDataSet]);
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
        this.enableProgressBar(true, false, "#progress-fa-analysis");
        this.disableGui();
        await this.processDataset(peptides);
        this.enableProgressBar(false);
        this.disableGui(false);
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
        const dataset = this.datasets[this.currentDataSet];
        await dataset.search(this.searchSettings[this.currentDataSet]).catch(error => this.showError(error));
        this.setUpVisualisations(dataset.tree);
        this.updateStats(dataset);
        return dataset;
    }

    async downloadPeptidesFor(name, sequences) {
        const dataset = this.datasets[this.currentDataSet];
        const result = [[
            "peptide",
            "spectral count",
            "matching proteins",
            "matching proteins with " + name,
            "percentage proteins with " + name,
            "lca",
        ]]
            .concat((await dataset.getPeptidesByFA(name, sequences))
                .map(x => [
                    x.sequence,
                    x.count,
                    x.allCount,
                    x.hits,
                    100 * x.hits / x.allCount,
                    x.lcaName,
                ]));
        downloadDataByForm(toCSVString(result), name + ".csv", "text/csv");
    }

    /**
     * Updates the search settings and reruns the analysis. Resolves when the
     * analysis is done.
     *
     * @param  {MPAConfig}  searchSettings
     */
    async updateSearchSettings(searchSettings) {
        this.searchSettings[this.currentDataSet] = searchSettings;
        this.enableProgressBar(true, true);
        this.enableProgressBar(true, false, "#progress-fa-analysis");
        $("#search-intro").text("Please wait while we process your data");
        await this.analyse(this.searchSettings[this.currentDataSet]);
        this.enableProgressBar(false);
    }

    /**
     * Create the visualisations of the taxonomic tree
     * @param {Tree} tree taxonomic tree
     */
    setUpVisualisations(tree) {
        const data = JSON.stringify(tree.getRoot());
        this.sunburst = this.setUpSunburst(JSON.parse(data));
        this.treemap = this.setUpTreemap(JSON.parse(data));
        this.treeview = this.setUpTreeview(JSON.parse(data));
        this.searchTree = constructSearchtree(tree, this.searchSettings[this.currentDataSet].il, d => this.search(d.id, d.name, 1000));
    }

    /**
     * Creates a line indicating the trust of the function annotations
     * @param {FunctionalAnnotations} fa
     * @param {String} kind Human readable word that fits in "To have at least one … assigned to it"
     * @return {string}
     */
    trustLine(fa, kind) {
        const trust = fa.getTrust();
        if (trust.annotatedCount === 0) {
            return `<strong>No peptide</strong> has a ${kind} assigned to it.`;
        }
        if (trust.annotatedCount === trust.totalCount) {
            return `<strong>All peptides</strong> ${trust.annotatedCount <= 5 ? `(only ${trust.annotatedCount})` : ""} have at least one ${kind} assigned to them.`;
        }
        if (trust.annotatedCount === 1) {
            return `Only <strong>one peptide</strong> (${numberToPercent(trust.annotaionAmount)}) has at least one ${kind} assigned to it.`;
        }
        return `<strong>${trust.annotatedCount} peptides</strong> (${numberToPercent(trust.annotaionAmount)}) have at least one ${kind} assigned to them.`;
    }

    /**
     * Recalculate the FA data to only use data of the specified taxon id.
     *
     * This automatically takes into account the selected percent level
     *
     * @param {string} [name="Organism"] The chosen name
     * @param {number} [id=-1]
     *    the taxon id whose sequences should be taken into account use -1 to use everything (Organism)
     * @param {number} [timeout=500]
     *    Time to wait since last invocation to start the lookup process (in ms)
     */
    redoFAcalculations(name = "Organism", id = -1, timeout = 500) {
        this.enableProgressBar(true, false, "#progress-fa-analysis");
        clearTimeout(this._redoFAcalculationsTimeout);

        const percent = this.displaySettings.percentFA;
        const dataset = this.datasets[this.currentDataSet];
        let sequences = null;

        this._redoFAcalculationsTimeout = setTimeout(() => {
            if (id > 0) {
                const taxonData = dataset.tree.nodes.get(id);
                sequences = dataset.tree.getAllSequences(id);
                $(".mpa-fa-scope").text(`${taxonData.name} (${taxonData.rank})`);
                $(".mpa-fa-numpepts").text("");
                $("#fa-filter-warning").show();
            } else {
                $("#fa-filter-warning").hide();
            }

            dataset.reprocessFA(percent, sequences)
                .then(() => {
                    if (dataset.baseFa === null) {
                        dataset.setBaseFA();
                    }

                    const num = dataset.fa.getTrust().totalCount;
                    $(".mpa-fa-numpepts").text(`${num} peptide${num === 1 ? "" : "s"}`);
                    this.setUpFAVisualisations(dataset.fa, id === -1 ? null : dataset.baseFa);
                    this.enableProgressBar(false, false, "#progress-fa-analysis");
                    $("#snapshot-fa").prop("disabled", false);
                    $("#mpa-fa-filter-precent").prop("disabled", false);
                    $("#fa-tabs").find("input, select").prop("disabled", false);
                });
        }, timeout);
    }


    /**
     * set up analysis pannel
     * @param {FunctionalAnnotations} fa Functional annotations
     * @param {FunctionalAnnotations} [oldFa=null]
     *     Snapshot of functional annotations for comparison
     */
    setUpFAVisualisations(fa, oldFa = null) {
        this.setUpGo(fa, oldFa);
        this.setUpEC(fa, oldFa);
    }

    /**
     * Create visualisations of the GO numbers
     * @param {FunctionalAnnotations} fa Functional annotations
     * @param {FunctionalAnnotations} [oldFa=null]
     *     Snapshot of functional annotations for comparison
     */
    setUpGo(fa, oldFa = null) {
        const go = fa.getGroup("GO");
        const goOld = oldFa === null ? null : oldFa.getGroup("GO");

        $("#go-summary").html(this.trustLine(go, "GO term"));
        const goPanel = d3.select("#goPanel");
        goPanel.html("");
        for (let variant of GOTerms.NAMESPACES) {
            const nsFagroup = go.getGroup(variant);
            const oldNsFagroup = goOld === null ? null : goOld.getGroup(variant);
            const article = goPanel.append("div").attr("class", "row");
            article.append("h3").text(stringTitleize(variant));
            this.setUpGoTable(nsFagroup, article, oldNsFagroup);
            this.setUpQuickGo(nsFagroup, article);
        }
    }

    addFADownloadBtn(cell, codeFn) {
        const downloadLink = cell.append("span");
        downloadLink.classed("glyphicon glyphicon-download glyphicon-inline down btn-icon", true)
            .attr("title", "Download CSV of the matched peptides")
            .attr("role", "button")
            .attr("tabindex", 0)
            .on("click", d => {
                d3.event.stopPropagation();
                this.downloadPeptidesFor(codeFn(d), Object.keys(d.sequences));
            });

        // HACK: d3 to jQuery
        $(downloadLink[0]).tooltip();
    }

    /**
     * Generate the extra inforamtion when clicked on a row in FA tables
     * @param {*} d
     * @param {string} code
     * @param {*} container
     * @param {number} width
     */
    faMoreinfo(d, code, container, width) {
        const dataset = this.datasets[this.currentDataSet];
        const $container = $(container);

        const $dlbtn = $(`
        <button class='btn btn-default btn-xs btn-animate pull-right'>
            <span class='glyphicon glyphicon-download down'></span>
            Save as image
        </button>`);

        $container.append($dlbtn);

        const highlightColor = "#ffc107";
        const highlightColorFunc = d => (d.included ? highlightColor : "lightgrey");
        dataset.getFATree(code).then(faTree => $container.treeview(faTree, {
            width: width,
            height: 310,
            getTooltip: this.tooltipContent,
            colors: highlightColor,
            linkStrokeColor: ({target: d}) => highlightColorFunc(d),
            nodeStrokeColor: highlightColorFunc,
            nodeFillColor: highlightColorFunc,
            enableAutoExpand: 0.3,
        }));

        $dlbtn.click(() => {
            logToGoogle("Multi peptide", "Save Image for FA");
            triggerDownloadModal($container.find("svg"), null, "unipept_treeview_" + code);
        });
    }


    /**
     *
     * @param {FunctionalAnnotations} goResultset
     * @param {*} target
     * @param {FunctionalAnnotations} oldGoResultset
     */
    setUpGoTable(goResultset, target, oldGoResultset = null) {
        const sortOrder = this.displaySettings.sortFA;
        const tablepart = target.append("div").attr("class", "col-xs-8");
        let data = goResultset.getSorted(sortOrder.sortFunc);
        new AmountTable({
            title: `GO terms - ${goResultset.getName()}`,
            el: tablepart,
            data: data,
            limit: 5,
            contents: [
                {
                    title: sortOrder.name,
                    text: d => d[sortOrder.field].toString(),
                    html: d => sortOrder.format(d),
                    style: {"width": "5em"},
                    shade: d => 100 * d[sortOrder.shadeField],
                },
                {
                    title: "GO term",
                    html: d => `<a href="https://www.ebi.ac.uk/QuickGO/term/${d.code}" target="_blank">${d.code}</a>`,
                    text: d => d.code,
                    style: {"width": "7em"},
                },
                {
                    title: "Name",
                    text: d => GOTerms.nameOf(d.code),
                },
                {
                    builder: cell => {
                        this.addFADownloadBtn(cell, d => d.code);
                    },
                    text: d => "",
                    style: {"width": "6em", "text-align": "right"},
                    exported: false,
                },
            ],
            more: (d, container) => this.faMoreinfo(d, d.code, container, 535),
            tooltip: d => this.tooltipGO(d.code, goResultset, oldGoResultset),
            tooltipID: "#tooltip",
        }).draw();
    }


    /**
     *
     * @param {FunctionalAnnotations} goResultset
     * @param {*} target
     */
    setUpQuickGo(goResultset, target) {
        const sortOrder = this.displaySettings.sortFA;
        /** @type {string[]} */
        const top5 = goResultset.getSorted(sortOrder.sortFunc).slice(0, 5).map(x => x.code);

        if (top5.length > 0) {
            const quickGoChartSmallURL = GOTerms.quickGOChartURL(top5, false);
            const quickGoChartURL = GOTerms.quickGOChartURL(top5, true);

            const top5WithNames = top5.map(x => `${GOTerms.nameOf(x)} (${sortOrder.formatData(goResultset.valueOf(x, sortOrder.field))})`);
            const top5sentence = top5WithNames.slice(0, -1).join(", ")
                + (top5.length > 1 ? " and " : "")
                + top5WithNames[top5WithNames.length - 1];
            target
                .append("div").attr("class", "col-xs-4")
                .append("img")
                .attr("src", quickGoChartSmallURL)
                .attr("class", "quickGoThumb")
                .attr("title", `QuickGO chart of ${top5sentence}`)
                .on("click", () => {
                    // Content with thumbnail image
                    const $modal = showInfoModal("QuickGo " + goResultset.getName(), `
                        This chart shows the realationship between the ${top5.length} most occuring GO terms: ${top5sentence}.<br/>
                        <a href="${quickGoChartURL}" target="_blank" title="Click to enlarge in new tab"><img style="max-width:100%" src="${quickGoChartSmallURL}" alt="QuickGO chart of ${top5sentence}"/></a>
                        <br>
                        Provided by <a href="https://www.ebi.ac.uk/QuickGO/annotations?goId=${top5.join(",")}" target="_blank">QuickGo</a>.`,
                    {wide: true});

                    // load full image, once loaded, replace src
                    const fullImage = new Image();
                    fullImage.onload = () => {
                        $modal.find("img").first().attr("src", quickGoChartURL);
                    };
                    fullImage.src = quickGoChartURL;
                });
        }
    }

    /**
     *
     * @param {*} thing
     * @param {FunctionalAnnotations} cur A FunctionalAnnotations that contains the term
     * @param {FunctionalAnnotations} [old=null] A FunctionalAnnotations that contains the term
     * @return {string} HTML content for tooltip
     */
    tootipResultSet(thing, cur, old = null) {
        const curdata = key => cur.valueOf(thing, key);
        let result = "";
        if (cur !== null) {
            result += "<div class=\"tooltip-fa-text\">";
            result += `Assigned to <strong>${numberToPercent(curdata("fractionOfPepts"), 2)}</strong> of peptides (<strong>${curdata("numberOfPepts")}</strong>)`;
            if (old != null) {
                result += "<div class=\"tooltip-extra\">";
                const newValue = curdata("fractionOfPepts");
                const oldValue = old.valueOf(thing, "fractionOfPepts");
                const diff = (newValue - oldValue) / (newValue + oldValue);
                if (Math.abs(diff) > 0.001) {
                    result += `<span class='glyphicon glyphicon-inline glyphicon-arrow-${diff > 0 ? "up" : "down"}'></span> `;
                }
                result += `was ${numberToPercent(oldValue, 2)} for entire dataset`;
                result += "</div>";
            }
            result += "</div>";

            if (window.showTrust) {
                result += "<br><div class=\"tooltip-extra\">";
                result += `Average support ratio of ${numberToPercent(curdata("weightedValue") / curdata("numberOfPepts"))}.`;
                result += "</div>";
                result += "<div class=\"tooltip-extra\">";
                result += `trust: ${numberToPercent(curdata("trust"), 2)}`;
                result += "</div>";
            }
        }
        return result;
    }

    /**
     * Generate a tooltip for an GO term
     * @param  {string}    goTerm   The Ec term to generate a tooltip for
     * @param  {FunctionalAnnotations} [faResultSet=null]  A `GOTerms` summary
     * @param  {FunctionalAnnotations} [oldFaResultSet=null]  A `GOTerms` summary snapshot
     * @return {string}    HTML for the tooltip
     */
    tooltipGO(goTerm, faResultSet = null, oldFaResultSet = null) {
        let result = `
            <h4 class="tooltip-fa-title">
                <span class="tooltip-fa-title-name">${GOTerms.nameOf(goTerm)}</span>
            </h4>
            <span class="tooltip-go-domain">${stringTitleize(GOTerms.namespaceOf(goTerm))}</span> — <span class="tooltip-go-title-term"> ${goTerm}</span>`;

        result += this.tootipResultSet(goTerm, faResultSet, oldFaResultSet);
        return result;
    }

    /**
     *
     * @param {FunctionalAnnotations} fa Functional annotations
     * @param {FunctionalAnnotations} [oldFa=null]
     *     Snapshot of functional annotations for comparision
     */
    setUpEC(fa, oldFa = null) {
        /** @type {ECNumbers} */
        // @ts-ignore
        const faEC = fa.getGroup("EC");
        $("#ec-summary").html(this.trustLine(faEC, "EC number"));

        this.setUpECTree(faEC);
        this.setUpECTable(fa, oldFa);
    }

    /**
     * Generate a tooltip for an EC number
     * @param  {string}    ecNumber   The EC number to generate a tooltip for
     * @param  {FunctionalAnnotations} [ecResultSet=null]  A `ECNumbers` summary
     * @param  {FunctionalAnnotations} [oldEcResultSet=null]  A `ECNumbers` summary snapshot
     * @return {string}    HTML for the tooltip
     */
    tooltipEC(ecNumber, ecResultSet = null, oldEcResultSet = null) {
        const fmt = x => `<div class="tooltip-ec-ancestor"><span class="tooltip-ec-term">EC ${x}</span><span class="tooltip-ec-name">${ECNumbers.nameOf(x)}</span></div>`;
        const fmth = x => `<div class="tooltip-ec-ancestor tooltip-ec-current"><span class="tooltip-ec-term">EC ${x}</span><h4 class="tooltip-fa-title">${ECNumbers.nameOf(x)}</h4></div>`;

        let result = "";

        if (ECNumbers.ancestorsOf(ecNumber).length > 0) {
            result += `${ECNumbers.ancestorsOf(ecNumber).reverse().map(c => fmt(c)).join("\n")}`;
        }
        result += fmth(ecNumber);

        result += this.tootipResultSet(ecNumber, ecResultSet, oldEcResultSet);
        return result;
    }

    /**
     * Create the EC treeview
     *
     * @param {ECNumbers} ecResultSet  A `ECNumbers` summary
     * @return {TreeView} The created treeview
     */
    setUpECTree(ecResultSet) {
        const $container = $("#ecTreeView output");
        $("#save-btn-ec").unbind("click");
        $container.empty();
        if (ecResultSet.getTrust().annotatedCount > 0) {
            const tree = $container.treeview(ecResultSet.treeSequencesData(), {
                width: 916,
                height: 500,
                enableAutoExpand: true,
                getTooltip: d => {
                    const fullcode = (d.name + ".-.-.-.-").split(".").splice(0, 4).join(".");
                    let tip = this.tooltipEC(fullcode);
                    tip += `<div class="tooltip-fa-text">
                        <strong>${d.data.count} peptides</strong> have at least one EC number within ${fullcode},<br>`;

                    if (d.data.self_count == 0) {
                        tip += "no specific annotations";
                    } else {
                        if (d.data.self_count == d.data.count) {
                            tip += " <strong>all specifically</strong> for this number";
                        } else {
                            tip += ` <strong>${d.data.self_count} specificly</strong> for this number`;
                        }
                    }

                    tip += "</div>";
                    return tip;
                },
            });


            // save tree button
            $("#save-btn-ec").prop("disabled", false)
                .click(() => {
                    logToGoogle("Multi peptide", "Save EC Image");
                    triggerDownloadModal($container.find("svg"), null, "unipept_treeview");
                });
            $("#reset-btn-ec").prop("disabled", false)
                .click(() => {
                    tree.reset();
                });

            return tree;
        } else {
            $("#save-btn-ec").prop("disabled", true);
        }
        return null;
    }

    /**
     * Create the EC amount table
     *
     * @param {FunctionalAnnotations} fa Functional annotations
     * @param {FunctionalAnnotations} [oldFa=null]
     *     Snapshot of functional annotations for comparision
     */
    setUpECTable(fa, oldFa = null) {
        const sortOrder = this.displaySettings.sortFA;

        const ecResultSet = fa.getGroup("EC");
        const oldEcResultSet = oldFa === null ? null : oldFa.getGroup("EC");

        let data = ecResultSet.getSorted(sortOrder.sortFunc);

        const target = d3.select("#ecTable");
        target.html("");
        new AmountTable({
            title: "EC numbers",
            el: target,
            data: data,
            limit: 5,
            contents: [
                {
                    title: sortOrder.name,
                    text: d => d[sortOrder.field].toString(),
                    html: d => sortOrder.format(d),
                    style: {"width": "5em"},
                    shade: d => 100 * d[sortOrder.shadeField],
                },
                {
                    title: "EC number",
                    html: d => {
                        const spans = d.code.split(".").map(e => `<span>${e}</span>`).join(".");
                        return `<a href="https://enzyme.expasy.org/EC/${d.code}" class="ec-number-formatted" target="_blank">${spans}</a>`;
                    },
                    text: d => d.code,
                    style: {"width": "8em"},
                },
                {
                    title: "Name",
                    text: d => ECNumbers.fullNameOf(d.code),
                },
                {
                    builder: cell => {
                        this.addFADownloadBtn(cell, d => "EC:" + d.code);
                    },
                    text: d => "",
                    style: {"width": "5em", "text-align": "right"},
                    exported: false,
                },
            ],
            more: (d, container) => this.faMoreinfo(d, "EC:" + d.code, container, 840),
            tooltip: d => this.tooltipEC(d.code, ecResultSet, oldEcResultSet),
            tooltipID: "#tooltip",
        }).draw();
    }

    /**
     * Show a list peptides for which we got no result;
     *
     * @param {string[]} missedPeptides The list of missed peptides
     */
    getBlastLinksForMissing(missedPeptides) {
        const missedHTML = missedPeptides.sort().map(p => `<li><a href="http://blast.ncbi.nlm.nih.gov/Blast.cgi?PAGE_TYPE=BlastSearch&amp;SET_SAVED_SEARCH=on&amp;USER_FORMAT_DEFAULTS=on&amp;PAGE=Proteins&amp;PROGRAM=blastp&amp;QUERY=${p}&amp;GAPCOSTS=11%201&amp;EQ_MENU=Enter%20organism%20name%20or%20id--completions%20will%20be%20suggested&amp;DATABASE=nr&amp;BLAST_PROGRAMS=blastp&amp;MAX_NUM_SEQ=100&amp;SHORT_QUERY_ADJUST=on&amp;EXPECT=10&amp;WORD_SIZE=3&amp;MATRIX_NAME=BLOSUM62&amp;COMPOSITION_BASED_STATISTICS=2&amp;SHOW_OVERVIEW=on&amp;SHOW_LINKOUT=on&amp;ALIGNMENT_VIEW=Pairwise&amp;MASK_CHAR=2&amp;MASK_COLOR=1&amp;GET_SEQUENCE=on&amp;NEW_VIEW=on&amp;NUM_OVERVIEW=100&amp;DESCRIPTIONS=100&amp;ALIGNMENTS=100&amp;FORMAT_OBJECT=Alignment&amp;FORMAT_TYPE=HTML&amp;OLD_BLAST=false" target="_blank">${p}</a> <span class="glyphicon glyphicon-share-alt"></span></li>`);
        return missedHTML.join("");
    }

    /**
     * Update the intro text to display the search stats.
     *
     * @param  {Dataset} dataset The dataset to display results for
     */
    updateStats(dataset) {
        const $searchIntro = $("#search-intro");
        const total = dataset.getNumberOfSearchedForPeptides();
        const matches = dataset.getNumberOfMatchedPeptides();
        if (total === matches) {
            $searchIntro.text(`We managed to match all of your ${total} peptides.`);
        } else {
            $searchIntro.html(`We managed to match ${matches} of your ${total} peptides.<br>Unfortunately, <a href="#" title="Show list of mismatches">${total - matches} peptides</a> couldn't be found.`);
            $searchIntro.find("a")
                .tooltip()
                .on("click", e => {
                    e.preventDefault();
                    const missed = dataset.getMissedPeptides();
                    const $content = $(`
                    <div class="card-supporting-text">
                    <button id="clipboard-missing" class="btn btn-default pull-right"><span class="glyphicon glyphicon-copy"></span> Copy to clipboard</button>
                    Sorry, we didn't manage to find ${total - matches} of your peptides${total - matches === missed.length ? "" : ` (${missed.length} ignoring duplicates)`}. You can BLAST them by clicking the links or copy them by
                    using the button on the right.
                    </div>
                    <ul>${this.getBlastLinksForMissing(missed)}</ul>
                    `);
                    const $modal = showInfoModal(`${total - matches} Missed peptides`, $content);
                    addCopy($content.find("button")[0], () => missed.join("\n"), "Copy list to clipboard", $modal[0]);
                });
        }
    }

    setUpForm(peptides) {
        $("#qs").val(peptides.join("\n"));
        $("#il").prop("checked", this.searchSettings[this.currentDataSet].il);
        $("#dupes").prop("checked", this.searchSettings[this.currentDataSet].dupes);
        $("#missed").prop("checked", this.searchSettings[this.currentDataSet].missed);

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

    /**
     * Add a new button to the dataset list, based on the information found in local storage, that allows the user to
     * switch between datasets.
     *
     * TODO: Create new JavaScript-object for a dataset as it is represented in local storage.
     * @param data A dataset object containing the information from local storage.
     */
    setUpDatasetButton(data) {
        let $listItem = $("<div class='list-item--three-lines'>");
        let $primaryAction = $("<span class='list-item-primary-action'>");
        let $sampleCheckbox = $("<input type='radio' value='' class='input-item select-dataset-radio-button' disabled>");
        $primaryAction.append($sampleCheckbox);
        $listItem.append($primaryAction);
        let $primaryContent = $("<span class='list-item-primary-content'>");
        $primaryContent.append($("<span>").text(data.name));
        $primaryContent.append($("<span class='list-item-date'>").text(data.date));
        $primaryContent.append(
            $("<span class='list-item-body'>")
                .append($("<div>").text(data.peptides.length + " peptides"))
                .append($("<div>").text("Deduplicate peptides, equate IL"))
        );
        $listItem.append($primaryContent);
        let $secondaryAction = $("<span class='list-item-secondary-action'>");
        $secondaryAction.data("name", data.name);
        $secondaryAction.append($("<span class='glyphicon glyphicon-chevron-right'>"));
        $listItem.append($secondaryAction);

        $("#dataset_list").append($listItem);

        // TODO Fix click handlers!
        let that = this;
        $sampleCheckbox.click(function() {
            $(".select-dataset-radio-button").prop("checked", false);
            $sampleCheckbox.prop("checked", true);
            that.currentDataSet = that.names.indexOf($(this).data("name"));

            that.enableProgressBar(true, true);
            that.enableProgressBar(true, false, "#progress-fa-analysis");

            let dataset = that.datasets[that.currentDataSet];

            that.setUpForm(dataset.originalPeptides);
            that.setUpVisualisations(dataset.tree);
            let searchTerm = that.searchTerms[that.currentDataSet];
            that.search(searchTerm.id, searchTerm.term);
            that.updateStats(dataset);

            that.enableProgressBar(false);
        });

        $secondaryAction.click(function() {
            let datasetName = $(this).data('name');
            let dataset = that.datasets[that.names.indexOf(datasetName)];
            $("#qs").val(dataset.originalPeptides.join("\n"));
            $("#il").prop("checked", dataset.resultset.config.il);
            $("#dupes").prop("checked", dataset.resultset.config.dupes);
            $("#missed").prop("checked", dataset.resultset.config.missed);
            $("#search_name").val(datasetName);
        });
    }

    disableGui(state = true) {
        $(".input-item").prop("disabled", state);
    }

    setUpButtons() {
        // sunburst resetsetUpFAVisualisations
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
        $("#mpa-download-results").click(async () => downloadDataByForm(await this.datasets[this.currentDataSet].toCSV(), "mpa_result.csv", "text/csv"));
        // update settings
        $("#mpa-update-settings").click(() => this.updateSearchSettings({
            il: $("#il").prop("checked"),
            dupes: $("#dupes").prop("checked"),
            missed: $("#missed").prop("checked"),
        }));

        // setup FA percent selector
        const $perSelector = $("#mpa-fa-filter-precent");
        let $perResetLink = null;
        $perSelector.change(() => {
            this.displaySettings.percentFA = $perSelector.val() * 1;
            this.redoFAcalculations();

            if (this.displaySettings.percentFA !== 5) {
                if (!$perResetLink) {
                    $perResetLink = $("<a class=\"pull-right\" href=\"#\">reset to 5%</a>").on("click", e => {
                        e.preventDefault();
                        $perSelector.val(5).trigger("change");
                    });
                    $perResetLink.insertAfter( "#mpa-fa-filter-precent-group" );
                }
            } else {
                $perResetLink.remove();
                $perResetLink = null;
            }
        });
        this.displaySettings.percentFA = $perSelector.val() * 1;


        const $sortOptions = $("#mpa-select-fa-sort-items>li>a");
        const $sortNameContainer = $("#mpa-select-fa-sort-name");
        const setFaSort = ($selected, updateView = true) => {
            const formatters = {
                "int": x => x.toString(),
                "percent": x => numberToPercent(x),
                "2pos": x => x.toFixed(2).toString(),
            };

            const field = $selected.data("field");
            this.displaySettings.sortFA = {
                format: x => formatters[$selected.data("as")](x[field]),
                formatData: x => formatters[$selected.data("as")](x),
                field: field,
                shadeField: $selected.data("shade-field"),
                name: $selected.text(),
                sortFunc: (a, b) => b[field] - a[field],
            };

            $sortOptions.removeClass("active");
            $selected.addClass("active");
            $sortNameContainer.text($selected.text());

            if (updateView) this.setUpFAVisualisations(this.datasets[this.currentDataSet].fa, this.datasets[this.currentDataSet].baseFa);
        };
        setFaSort($("#mpa-select-fa-sort-default"), false);

        $sortOptions.on("click", function (e) {
            e.preventDefault();
            const $this = $(this);
            setFaSort($this);
        });

        $("#fa-undo-filter").click(() => this.redoFAcalculations(undefined, undefined, 0));


        /* Hide fullscreen button when in outline mode */
        $("#viz-tabs a").on("shown.bs.tab", e => {
            if ($(e.target).attr("href") === "#outline") {
                $("#buttons").hide();
            } else {
                $("#buttons").show();
            }
        });

        $("#mpa-fa-advanced-options").on("click", function (event) {
            // The event won't be propagated up to the document NODE and
            // therefore delegated events won't be fired
            event.stopPropagation();
        });

        $("#mpa-add-dataset").click(() => {
            let peptides = $("#qs").val().split("\n");
            let searchName = $("#search_name").val();
            let equateIl = $("#il").is(':checked');
            let filterDuplicates = $("#dupes").is(':checked');
            let handleMissingCleavage = $("#missed").is(':checked');

            this.searchSettings.push({
                il: equateIl,
                dupes: filterDuplicates,
                missed: handleMissingCleavage,
            });

            this.names.push(searchName);

            // Stores the current dataset that's being worked with
            this.addDataset(peptides);
            this.setUpForm(peptides);
        });
    }

    setUpHelp() {
        $(".help[data-help-id]").click(function (e) {
            let title,
                content;
            e.stopPropagation();
            e.preventDefault();
            const $helpContent = $("#" + $(this).data("help-id"));
            title = $helpContent.data("title");
            content = $helpContent.html();
            showInfoModal(title, content, {wide: true});
        });
    }
    setUpSaveImage() {
        $("#buttons").prepend("<button id='save-btn' class='btn btn-default btn-xs btn-animate'><span class='glyphicon glyphicon-download down'></span> Save as image</button>");
        $("#save-btn").click(() => this.saveImage());
    }

    setUpFullScreen() {
        if (window.fullScreenApi.supportsFullScreen) {
            $("#buttons").prepend("<button id='zoom-btn' class='btn btn-default btn-xs btn-animate'><span class='glyphicon glyphicon-resize-full grow'></span> Enter full screen</button>");
            $("#zoom-btn").click(() => {
                logToGoogle("Multi Peptide", "Full Screen", this.getActiveTab());
                window.fullScreenApi.requestFullScreen($(".full-screen-container").get(0));
            });
            $(document).bind(window.fullScreenApi.fullScreenEventName, () => this.resizeFullScreen(this));
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
            enableAutoExpand: true,
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

    enableProgressBar(enable = true, determinate = false, barSelector = "#progress-analysis") {
        const $bar = $(barSelector);
        if (enable) {
            $bar.css("visibility", "visible");
            $bar.toggleClass("unipept-progress-determinate", determinate);
            $bar.toggleClass("unipept-progress-indeterminate", !determinate);
            this.setProgressValue(0);
            eventBus.on("dataset-progress", this.setProgressValue);
        } else {
            $bar.css("visibility", "hidden");
            this.setProgressValue(0);
            eventBus.off("dataset-progress", this.setProgressValue);
        }
    }

    setProgressValue(value = 0, barSelector = "#progress-analysis") {
        $(`${barSelector} .progressbar`).css("width", `${value * 100}%`);
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
     * @param {number} id            Taxon id to inspect
     * @param {string} searchTerm     Search term to put in box
     * @param {number} [timeout=500] timeout in ms to wait before processing
     * @todo add search term to FA explanation to indicate filtering
     */
    search(id, searchTerm, timeout = 500) {
        this.searchTerms[this.currentDataSet] = {
            id: id,
            term: searchTerm
        };

        let localTerm = searchTerm;
        if (localTerm === "Organism") {
            localTerm = "";
        }
        setTimeout(() => this.searchTree.search(localTerm), timeout);
        this.redoFAcalculations(searchTerm, id, timeout);
    }

    static get RANKS() {
        return ["superkingdom", "kingdom", "subkingdom", "superphylum", "phylum", "subphylum", "superclass", "class", "subclass", "infraclass", "superorder", "order", "suborder", "infraorder", "parvorder", "superfamily", "family", "subfamily", "tribe", "subtribe", "genus", "subgenus", "species group", "species subgroup", "species", "subspecies", "varietas", "forma"];
    }
}

export {MPA};
