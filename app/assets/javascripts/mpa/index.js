import "unipept-visualizations/dist/unipept-visualizations.es5.js";
import {AmountTable} from "../components/amount_table.js";
import {FunctionalAnnotations} from "../fa/FunctionalAnnotations.js"; // eslint-disable-line no-unused-vars
import ECNumbers from "../fa/ecnumbers.js";
import GOTerms from "../fa/goterms.js";
import {showInfoModal} from "../modal.js";
import {showNotification} from "../notifications.js";
import {addCopy, downloadDataByForm, logToGoogle, numberToPercent, stringTitleize, toCSVString, triggerDownloadModal, showError} from "../utils.js";
import {Dataset} from "./dataset.js";
import {constructSearchtree} from "./searchtree.js";

/* eslint require-jsdoc: off */


/**
 * @typedef MPADisplaySettings
 * @type {object}
 * @property {{sortFunc,field,name,format, }} sortFA
 * @property {boolean} onlyStarredFA
 * @property {number} percentFA
 */

/**
 * The Multi Peptide Analysis frontened class
 */
class MPA {
    /**
     * Setup the MPA gui
     * @param {string[]} peptides List of peptides to analyse
     * @param {boolean} il equate I and L
     * @param {boolean} dupes Filter duplicate peptides
     * @param {boolean} missed  Advanced missed cleavage handling
     */
    constructor(peptides = [], il = true, dupes = true, missed = false) {
        /** @type {Dataset[]} */
        this.datasets = [];
        /** @type {MPAConfig} */
        this.searchSettings = {
            il: il,
            dupes: dupes,
            missed: missed,
        };

        /** @type {MPADisplaySettings} */
        // @ts-ignore because it will be filled by setUpButtons
        this.displaySettings = {
            onlyStarredFA: false,
        };

        this.addDataset(peptides).catch(error => this.showError(error));
        this.setUpForm(peptides);
        this.setUpButtons();
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
        this.updateStats(dataset);
        return dataset;
    }

    downloadPeptidesFor(name) {
        const dataset = this.datasets[0];
        const result = [["sequence", "count", "evidence"]]
            .concat(dataset.getPeptidesByFA(name)
                .map(x => [x.sequence, x.totalCount, x.relativeCount]));
        downloadDataByForm(toCSVString(result), name + ".csv", "text/csv");
    }

    /**
     * Updates the search settings and reruns the analysis. Resolves when the
     * analysis is done.
     *
     * @param  {MPAConfig}  searchSettings
     */
    async updateSearchSettings(searchSettings) {
        this.enableProgressBar(true, true);
        this.enableProgressBar(true, false, "#progress-fa-analysis");
        $("#search-intro").text("Please wait while we process your data");
        await this.analyse(this.searchSettings)
            .catch(error => this.showError(error));
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
        this.searchTree = constructSearchtree(tree, this.searchSettings.il);
    }


    /**
     * @return {string[]} list of saved terms
     */
    getFAFavorite() {
        return JSON.parse(localStorage.getItem("saved.fa") || "[]");
    }

    /**
     * @param {string[]} favorites  (new) list of saved terms
     */
    setFAFavorite(favorites) {
        localStorage.setItem("saved.fa", JSON.stringify(favorites));
    }

    /**
     * Add an annotaion to the favorites
     * @param {string} code The code to add/remove form favorites
     * @param {boolean} add true = add, false = delete
     */
    addFAFavorite(code, add) {
        let notification = "Somthing went wrong.";
        let curFavs = this.getFAFavorite();
        if (add) {
            if (!curFavs.includes(code)) {
                curFavs.push(code);
            }
            notification = "Starred " + code;
        } else {
            curFavs = curFavs.filter(x => x !== code);
            notification = "Unstarred " + code;
        }
        this.setFAFavorite(curFavs);
        showNotification(notification, {
            autoHide: true,
            loading: false,
        });
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
     *    Time to wait since last invocation to start the lookup procces (in ms)
     */
    redoFAcalculations(name = "Organism", id = -1, timeout = 500) {
        this.enableProgressBar(true, false, "#progress-fa-analysis");
        clearTimeout(this._redoFAcalculationsTimeout);

        const percent = this.displaySettings.percentFA;
        const dataset = this.datasets[0];
        let sequences = null;

        this._redoFAcalculationsTimeout = setTimeout(() => {
            if (id > 0) {
                sequences = dataset.tree.getAllSequences(id);
                $(".mpa-fa-scope").text(name);
                $(".mpa-fa-numpepts").text(`${sequences.length} peptide${sequences.length === 1 ? "" : "s"}`);
                $("#fa-filter-warning").show();
            } else {
                $("#fa-filter-warning").hide();
            }

            dataset.reprocessFA(percent, sequences)
                .then(() => {
                    this.setUpFAVisualisations(dataset.fa, dataset.baseFa);
                    this.enableProgressBar(false, false, "#progress-fa-analysis");
                    $("#snapshot-fa").prop("disabled", false);
                    $("#fa-tabs").find("input, select").prop("disabled", false);
                });
        }, timeout);
    }


    /**
     * set up analysis pannel
     * @param {FunctionalAnnotations} fa Functional annotations
     * @param {FunctionalAnnotations} [oldFa=null]
     *     Snapshot of functional annotations for comparision
     */
    setUpFAVisualisations(fa, oldFa = null) {
        this.setUpGo(fa, oldFa);
        this.setUpEC(fa, oldFa);
    }

    /**
     * Create visualisations of the GO numbers
     * @param {FunctionalAnnotations} fa Functional annotations
     * @param {FunctionalAnnotations} [oldFa=null]
     *     Snapshot of functional annotations for comparision
     */
    setUpGo(fa, oldFa = null) {
        const go = fa.getGroup("GO");
        const goOld = oldFa === null ? null : oldFa.getGroup("GO");

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


    addFAFavoriteBtn(cell, codeFn) {
        const starred = this.getFAFavorite();

        const fav = cell.append("button");
        fav.classed("btn btn-default btn-xs save-fa-btn", true);
        fav.classed("saved", d => starred.includes(codeFn(d)));

        const that = this;
        fav.on("click", function (d) {
            d3.event.stopPropagation();
            const classes = this.classList;
            classes.toggle("saved");
            that.addFAFavorite(codeFn(d), classes.contains("saved"));
        });
        fav.html("<span class='glyphicon glyphicon-star'></span>");
    }

    addFADownloadBtn(cell, codeFn) {
        const downloadLink = cell.append("button");
        downloadLink.classed("btn btn-default btn-xs", true)
            .html("<span class='glyphicon glyphicon-download-alt'></span>")
            .on("click", d => {
                d3.event.stopPropagation();
                this.downloadPeptidesFor(codeFn(d));
            });
    }

    /**
     * Generate the extra inforamtion when clicked on a row in FA tables
     * @param {*} d
     * @param {string} code
     * @param {*} container
     * @param {number} width
     */
    faMoreinfo(d, code, container, width) {
        const dataset = this.datasets[0];
        const $container = $(container);

        const $dlbtn = $(`
        <button class='btn btn-default btn-xs btn-animate pull-right'>
            <span class='glyphicon glyphicon-download down'></span>
            Save as image
        </button>`);

        $container.append($dlbtn);

        $container.append(`<small>
            <span class="glyphicon glyphicon-stats"></span>
            Assinged to ${d.numberOfPepts} of the ${dataset.getNumberOfMatchedPeptides()} peptides (${numberToPercent(d.numberOfPepts / dataset.getNumberOfMatchedPeptides())}).
            <br/>
            <span class="glyphicon glyphicon-stats"></span>
            The normalised occurrence score is ${numberToPercent(d.value)} (${d.weightedValue.toFixed(2)}).
        
            </small>`);


        $container.append("<div></div>").treeview(dataset.getFATree(code), {
            width: width,
            height: 310,
            getTooltip: this.tooltipContent,
            colors: "#2196f3",
            linkStrokeColor: ({target: d}) => (d.included ? d.color || "grey" : "grey"),
            nodeStrokeColor: d => (d.included ? d.color || "grey" : "grey"),
            nodeFillColor: d => (d.included ? d.color || "grey" : "grey"),
            enableAutoExpand: 0.3,
        });

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
        const starred = this.getFAFavorite();

        let data = goResultset.getSorted(sortOrder.sortFunc);
        if (this.displaySettings.onlyStarredFA) {
            data = data.filter(x => starred.includes(x.code));
        }
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
                    shade: d => 100 * d.value,
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
                        this.addFAFavoriteBtn(cell, d => d.code);
                        this.addFADownloadBtn(cell, d => d.code);
                    },
                    text: d => "",
                    style: {"width": "6em", "text-align": "right"},
                    exported: false,
                },
            ],
            more: (d, container) => this.faMoreinfo(d, d.code, container, 550),
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
        /** @type {string[]} */
        const top5 = goResultset.getSorted(this.displaySettings.sortFA.sortFunc).slice(0, 5).map(x => x.code);

        if (top5.length > 0) {
            const quickGoChartURL = GOTerms.quickGOChartURL(top5);
            const top5WithNames = top5.map(x => `${GOTerms.nameOf(x)} (${numberToPercent(goResultset.valueOf(x))})`);
            const top5sentence = top5WithNames.slice(0, -1).join(", ")
                + (top5.length > 1 ? " and " : "")
                + top5WithNames[top5WithNames.length - 1];
            target
                .append("div").attr("class", "col-xs-4")
                .append("img")
                .attr("src", quickGoChartURL)
                .attr("class", "quickGoThumb")
                .attr("title", `QuickGO chart of ${top5sentence}`)
                .on("click", () => {
                    showInfoModal("QuickGo " + goResultset.getName(), `
                        This chart shows the realationship between the ${top5.length} most occuring GO terms: ${top5sentence}.<br/>
                        <a href="${quickGoChartURL}" target="_blank" title="Click to enlarge in new tab"><img style="max-width:100%" src="${quickGoChartURL}" alt="QuickGO chart of ${top5sentence}"/></a>
                        <br>
                        Provided by <a href="https://www.ebi.ac.uk/QuickGO/annotations?goId=${top5.join(",")}" target="_blank">QuickGo</a>.`,
                    {wide: true});
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
            if (old != null) {
                const newValue = curdata("value");
                const oldValue = old.valueOf(thing);
                const diff = (newValue - oldValue) / (newValue + oldValue);
                if (Math.abs(diff) > 0.001) {
                    result += `<span class='glyphicon glyphicon-arrow-${diff > 0 ? "up" : "down"}'></span> `;
                }
                result += `Normailised evidence score of ${numberToPercent(curdata("value"), 2)} (was ${numberToPercent(oldValue, 2)})`;
            } else {
                result += `Normailised evidence score of ${numberToPercent(curdata("value"), 2)}`;
            }
            result += "</div>";

            result += "<div class=\"tooltip-fa-text\">";
            result += `Assigned to <strong>${curdata("numberOfPepts")} peptides</strong>, <br>
        with an average support ratio of ${numberToPercent(curdata("weightedValue") / curdata("numberOfPepts"))}.<br>
        Thus an <strong>evidence score of ${curdata("weightedValue").toFixed(2)}</strong>.`;
            result += "</div>";
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
        // @ts-ignore
        this.setUpECTree(/** @type {ECNumbers} */ fa.getGroup("EC"));
        this.setUpECTable(fa, oldFa);
    }

    /**
     * Generate a tooltip for an EC number
     * @param  {string}    ecNumber   The Ec number to generate a tooltip for
     * @param  {FunctionalAnnotations} [ecResultSet=null]  A `ECNumbers` summary
     * @param  {FunctionalAnnotations} [oldEcResultSet=null]  A `ECNumbers` summary snapshot
     * @return {string}    HTML for the tooltip
     */
    tooltipEC(ecNumber, ecResultSet = null, oldEcResultSet = null) {
        const fmt = x => `<div class="tooltip-ec-ancestor"><span class="tooltip-ec-term">EC ${x}</span><span class="tooltip-ec-name">${ECNumbers.nameOf(x)}</span></div>`;

        let result = `
            <h4 class="tooltip-fa-title">
                <span class="tooltip-fa-title-name">${ECNumbers.nameOf(ecNumber)}</span>
                <span class="tooltip-ec-term small"> EC ${ecNumber}</span>
            </h4>`;

        if (ECNumbers.ancestorsOf(ecNumber).length > 0) {
            result += `${ECNumbers.ancestorsOf(ecNumber).map(c => fmt(c)).join("\n")}`;
        }

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
        const $container = $("#ecTreeView");
        const tree = $container
            .empty()
            .treeview(ecResultSet.treeData(), {
                width: 916,
                height: 500,
                enableAutoExpand: true,
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
            triggerDownloadModal($container.find("svg"), null, "unipept_treeview");
        });

        return tree;
    }

    /**
     * Create the EC amount table
     *
     * @param {FunctionalAnnotations} fa Functional annotations
     * @param {FunctionalAnnotations} [oldFa=null]
     *     Snapshot of functional annotations for comparision
     */
    setUpECTable(fa, oldFa = null) {
        const starred = this.getFAFavorite();
        const sortOrder = this.displaySettings.sortFA;

        const ecResultSet = fa.getGroup("EC");
        const oldEcResultSet = oldFa === null ? null : oldFa.getGroup("EC");

        let data = ecResultSet.getSorted(sortOrder.sortFunc);
        if (this.displaySettings.onlyStarredFA) {
            data = data.filter(x => starred.includes("EC:" + x.code));
        }

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
                    shade: d => 100 * d.value,
                },
                {
                    title: "EC-Number",
                    html: d => {
                        const spans = d.code.split(".").map(e => `<span>${e}</span>`).join(".");
                        return `<a href="https://enzyme.expasy.org/EC/${d.code}" class="ec-number-formatted" target="_blank">${spans}</a>`;
                    },
                    text: d => d.code,
                    style: {"width": "8em"},
                },
                {
                    title: "Name",
                    text: d => ECNumbers.nameOf(d.code),
                },
                {
                    builder: cell => {
                        this.addFAFavoriteBtn(cell, d => "EC:" + d.code);
                        this.addFADownloadBtn(cell, d => "EC:" + d.code);
                    },
                    text: d => "",
                    style: {"width": "5em", "text-align": "right"},
                    exported: false,
                },
            ],
            more: (d, container) => this.faMoreinfo(d, "EC:" + d.code, container, 874),
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
            $searchIntro.html(`We managed to match ${matches} of your ${total} peptides. Unfortunately, <a href="#">${total - matches} peptides</a> couldn't be found.`);
            $searchIntro.find("a").on("click", e => {
                e.preventDefault();
                const missed = dataset.getMissedPeptides();
                const $content = $(`
                <div class="card-supporting-text">
                <button id="clipboard-missing" class="btn btn-default pull-right"><span class="glyphicon glyphicon-copy"></span> Copy to clipboard</button>
                Sorry, we didn't manage to find some of your peptides. You can BLAST them by clicking the links or copy them by
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
        $("#qs").text(peptides.join("\n"));
        $("#il").prop("checked", this.searchSettings.il);
        $("#dupes").prop("checked", this.searchSettings.dupes);
        $("#missed").prop("checked", this.searchSettings.missed);

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
        $("#mpa-download-results").click(() => downloadDataByForm(this.datasets[0].toCSV(), "mpa_result.csv", "text/csv"));
        // update settings
        $("#mpa-update-settings").click(() => this.updateSearchSettings({
            il: $("#il").prop("checked"),
            dupes: $("#dupes").prop("checked"),
            missed: $("#missed").prop("checked"),
        }));


        // setup FA percent selector
        const $perSelector = $("#goFilterPerc");
        $perSelector.change(() => {
            this.displaySettings.percentFA = $perSelector.val() * 1;
            this.redoFAcalculations();
        });
        this.displaySettings.percentFA = $perSelector.val() * 1;

        // setup FA sort by
        const $faTypeSelector = $("#goField");
        const setFaSort = () => {
            let selected = $faTypeSelector.find(":selected");
            const formatters = {
                "int": x => x.toString(),
                "percent": x => numberToPercent(x),
                "2pos": x => x.toFixed(2).toString(),
            };

            const field = selected.val();
            this.displaySettings.sortFA = {
                format: x => formatters[selected.data("as")](x[field]),
                field: field,
                name: selected.text(),
                sortFunc: (a, b) => b[field] - a[field],
            };
        };
        $faTypeSelector.change(() => {
            setFaSort();
            this.setUpFAVisualisations(this.datasets[0].fa, this.datasets[0].baseFa);
        });
        setFaSort();

        $("#btn-clearFAfavorites").click(() => {
            this.setFAFavorite([]);
            this.setUpFAVisualisations(this.datasets[0].fa, this.datasets[0].baseFa);
        });

        $("#btn-onlyShowFAfavorites").click(() => {
            this.displaySettings.onlyStarredFA = !this.displaySettings.onlyStarredFA;
            this.setUpFAVisualisations(this.datasets[0].fa, this.datasets[0].baseFa);
        });

        $("#snapshot-fa").click(() => {
            this.datasets[0].setBaseFA();
            showNotification("Saved for comparing!", {
                autoHide: true,
                loading: false,
            });
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
