import {addCopy, logToGoogle, triggerDownloadModal, stringTitleize, numberToPercent} from "./utils.js";
import {showInfoModal} from "./modal.js";
import {AmountTable} from "./components/amounttable.js";
import ECNumbers from "./components/ecnumbers.js";
import GOTerms from "./components/goterms.js";
import "unipept-visualizations/dist/unipept-visualizations.es5.js";

/* eslint require-jsdoc: off */
/* TODO: more documentation */

/**
 * @typedef {Object} FACounts
 * @property {number} value count
 * @property {string} name  The name of the GO/EC number
 * @property {string} code  The code of the GO/EC number
 */

/**
 * @param {Object} data description of the data`
 * @param {Object.<string, FACounts>} data.fa.go - GO data information
 * @param {FACounts} data.fa.uniprotEntries - EC data information
 */

const panelWidth = 916;
const panelHeight = 600;

class SPA {
    constructor(data) {
        this.$tooltip = $("#tooltip");


        this.peptide = data.peptide;

        // set up the fancy tree
        this.initLineageTree(data.tree);

        // set up the fullscreen stuff
        this.setUpFullScreen();

        // set up save image stuff
        this.setUpImageSave();

        // enable the external link popovers
        this.addExternalLinks();

        // enable the open in UniProt and clipboard buttons
        this.setUpUniprotButtons(data.uniprotEntries);

        // setup functional annotations tabs
        this.setUpFA(data.fa);

        // enable tooltips for EC and GO terms
        this.initFAToolips();

        // add the tab help
        this.initHelp();
    }

    initHelp() {
        // tab help
        $(".nav-tabs li a span.help").click(function (e) {
            let title,
                content;
            e.stopPropagation();
            e.preventDefault();
            if ($(this).parent().attr("id") === "lineage-tree-tab") {
                title = "Lineage tree";
                content = "This interactive tree bundles the complete taxonomic lineages of all UniProt entries whose protein sequence contains " + this.peptide + ". You can click on nodes to expand them, scroll to zoom and drag to move the tree.";
            } else {
                title = "Lineage table";
                content = "This table shows the complete taxonomic lineages of all taxa associated with the UniProt entries whose protein sequence contains " + this.peptide + ". The first column contains the taxon name extracted from the UniProt entry, followed by columns representing taxonomic ranks ordered from superkingdom on the left to forma on the right.";
            }
            showInfoModal(title, content);
        });
    }


    addExternalLinks() {
        // Add handler to the external links buttons
        $(".externalLinks-button").parent().mouseenter(function () {
            if (!$(this).hasClass("open")) {
                $(this).find(".externalLinks-button").dropdown("toggle");
            }
        });
        $(".externalLinks-button").parent().mouseleave(function () {
            if ($(this).hasClass("open")) {
                $(this).find(".externalLinks-button").dropdown("toggle");
            }
        });
    }

    setUpUniprotButtons(entries) {
        $("#open-uniprot").click(function () {
            let url = "http://www.uniprot.org/uniprot/?query=accession%3A";
            url += entries.join("+OR+accession%3A");
            window.open(url, "_blank");
        });
        addCopy("#clipboard-uniprot", () => entries.join("\n"), "Copy UniProt IDs to clipboard");
    }

    /**
     * Sets up the image save stuff
     */
    setUpImageSave() {
        $("#buttons-single").prepend("<button id='save-btn-lineage' class='btn btn-default btn-xs btn-animate'><span class='glyphicon glyphicon-download down'></span> Save tree as image</button>");
        $("#save-btn-lineage").click(function () {
            logToGoogle("Single Peptide", "Save Image");
            triggerDownloadModal("#lineageTree svg", null, "unipept_treeview");
        });
    }

    /**
     * Sets up the full screen stuff
     */
    setUpFullScreen() {
        if (fullScreenApi.supportsFullScreen) {
            $("#buttons-single").prepend("<button id='zoom-btn-lineage' class='btn btn-default btn-xs btn-animate'><span class='glyphicon glyphicon-resize-full grow'></span> Enter full screen</button>");
            $("#zoom-btn-lineage").click(function () {
                logToGoogle("Single Peptide", "Full Screen");
                window.fullScreenApi.requestFullScreen($("#lineageTree").get(0));
            });
            $(document).bind(fullScreenApi.fullScreenEventName, resizeFullScreen);
        }

        function resizeFullScreen() {
            setTimeout(function () {
                let width = panelWidth,
                    height = panelHeight;
                if (window.fullScreenApi.isFullScreen()) {
                    width = $(window).width();
                    height = $(window).height();
                }
                $("#lineageTree svg").attr("width", width);
                $("#lineageTree svg").attr("height", height);
            }, 1000);
        }
    }

    /**
     * Transform the FA data form the server to the format ECNumber and GOTerm expect.
     * Then render the visualisations
     * @param {FAServerData} fa Inforamtin about functional analysis as provided by the server
     */
    setUpFA(fa) {
        const ecData = new ECNumbers({
            numAnnotatedProteins: fa.counts.EC,
            data: Object.entries(fa.data).filter(([a, b]) => a.startsWith("EC")).map(([a, b]) => ({code: a.substr(3), value: b})) || []},
        false);
        ecData.ensureData().then(() => this.setUpEC(ecData));

        const usedGoTerms = new Set();
        Object.keys(fa.data)
            .filter(x => x.startsWith("GO:"))
            .forEach(x => usedGoTerms.add(x));

        GOTerms.addMissingNames([...usedGoTerms.values()]).then(() => {
            const goCountsPerNamespace = {};
            for (let namespace of GOTerms.NAMESPACES) {
                goCountsPerNamespace[namespace] = Object.entries(fa.data)
                    .filter(([term, count]) => term.startsWith("GO") && GOTerms.namespaceOf(term) == namespace)
                    .map(([term, count]) => ({code: term, value: count})) || [];
            }

            const goData = new GOTerms({numAnnotatedProteins: fa.counts.GO, data: goCountsPerNamespace}, false);
            this.setUpGO(goData);
        });
    }

    /**
     * Generate tooltip content for an EC number
     * @param  {string}    ecNumber   The Ec number to generate a tooltip for
     * @param  {ECNumbers} [ecResultSet=null]  A `ECNumbers` summary
     * @return {string}    HTML for the tooltip
     */
    tooltipEC(ecNumber, ecResultSet = null) {
        const fmt = x => `<div class="tooltip-ec-ancestor"><span class="tooltip-ec-term">EC ${x}</span><span class="tooltip-ec-name">${ECNumbers.nameOf(x)}</span></div>`;

        let result = `
            <h4 class="tooltip-fa-title">
                <span class="tooltip-fa-title-name">${ECNumbers.nameOf(ecNumber)}</span>
                <span class="tooltip-ec-term small"> EC ${ecNumber}</span>
            </h4>`;

        if (ECNumbers.ancestorsOf(ecNumber).length > 0) {
            result += `${ECNumbers.ancestorsOf(ecNumber).map(c => fmt(c)).join("\n")}`;
        }

        if (ecResultSet != null) {
            const count = ecResultSet.getValueOf(ecNumber);
            result += `<div class="tooltip-fa-text">Assigned to ${count} of ${ecResultSet.getTotalSetSize()} annotated matched proteins (${numberToPercent(ecResultSet.getFractionOf(ecNumber), 1)})</div>`;
        }
        return result;
    }

    /**
     * Render the EC table and tree and settup tooltip content
     * @param {ECNumbers} ecResultset The resultset of the EC numbers
     */
    setUpEC(ecResultset) {
        if (ecResultset.getTotalSetSize() > 0) {
            this.setUpECTree(ecResultset);
            this.setUpEcTable(ecResultset);
        } else {
            $("#ec-table").html("<span>No EC code annotations found.</span>");
            $("#ec-treeview").remove();
        }
        $(".ecNumberLink")
            .mouseenter(e => {
                const ecNum = e.target.textContent;
                this.$tooltip.html(this.tooltipEC(ecNum, ecResultset));
                return false;
            });
    }

    /**
     * Let ECNumbers create an EC tree and alter the tooltip
     *
     * @param {ECNumbers} ecResultSet  A `ECNumbers` summary
     * @return {TreeView} The created treeview
     */
    setUpECTree(ecResultSet) {
        const tree = ecResultSet.createTree("#ec-treeview", {
            width: panelWidth,
            height: panelHeight,
            getTooltip: d => {
                const fullcode = (d.name + ".-.-.-.-").split(".").splice(0, 4).join(".");
                let tip = this.tooltipEC(fullcode);
                tip += `<div class="tooltip-fa-text">
                        ${d.data.count}  occurrences, `;

                if (d.data.self_count == 0) {
                    tip += "no specific annotations";
                } else {
                    tip += `Assigned to ${d.data.self_count} of ${ecResultSet.getTotalSetSize()} annotated matched proteins (${numberToPercent(d.data.self_count / ecResultSet.getTotalSetSize(), 1)})`;
                }

                tip += "</div>";
                return tip;
            },
        });

        // save tree button
        $("#save-btn-ec").click(() => {
            logToGoogle("Single Peptide", "Save EC Image");
            triggerDownloadModal("#ec-treeview svg", null, "unipept_treeview");
        });

        return tree;
    }

    /**
     * Create the EC amount table
     *
     * @param {ECNumbers} ecResultSet  A `ECNumbers` summary
     */
    setUpEcTable(ecResultSet) {
        const target = d3.select("#ec-table");
        target.html("");
        new AmountTable({
            title: "EC numbers - " + this.peptide,
            el: target,
            data: ecResultSet.sortedTerms(),
            limit: 5,
            contents: [
                {
                    title: "Count",
                    text: d => d.value.toString(),
                    style: {"width": "5em"},
                    shade: d => 100 * ecResultSet.getFractionOf(d.code),
                },
                {
                    title: "EC-number",
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
            ],
            tooltip: d => this.tooltipEC(d.code, ecResultSet),
            tooltipID: "#tooltip",
        }).draw();
    }

    /**
     * Generate a tooltip for an GO term
     * @param  {string}    goTerm   The Ec term to generate a tooltip for
     * @param  {GOTerms} [goResultSet=null]  A `GOTerms` summary
     * @return {string}    HTML for the tooltip
     */
    tooltipGO(goTerm, goResultSet = null) {
        let result = `
            <h4 class="tooltip-fa-title">
                <span class="tooltip-fa-title-name">${GOTerms.nameOf(goTerm)}</span>
                <span class="tooltip-go-title-term small"> ${goTerm}</span>
            </h4>
            <span class="tooltip-go-domain">${stringTitleize(GOTerms.namespaceOf(goTerm))}</span>`;

        if (goResultSet != null) {
            const count = goResultSet.getValueOf(goTerm);
            result += `<div class="tooltip-fa-text">Assigned to ${count} of ${goResultSet.getTotalSetSize()} annotated matched proteins (${numberToPercent(goResultSet.getFractionOf(goTerm), 1)})</div>`;
        }
        return result;
    }

    setUpGO(goResultset) {
        $("#go-panel").empty();
        const goPanel = d3.select("#go-panel");
        for (const variant of GOTerms.NAMESPACES) {
            const variantName = stringTitleize(variant);
            goPanel.append("h3").text(variantName);

            if (goResultset.sortedTerms(variant).length > 0) {
                const article = goPanel.append("div").attr("class", "row");
                this.setUpGoTable(goResultset, variant, article);
                this.setUpQuickGo(goResultset, variant, variantName, article);
            } else {
                goPanel.append("span").text("No GO term annotations in this namespace.");
            }
        }

        // Add content to the tooltips of links
        $(".goTermLink")
            .mouseenter(e => {
                const goTerm = e.target.textContent;
                this.$tooltip.html(this.tooltipGO(goTerm, goResultset));
                return false;
            });
    }

    setUpGoTable(goResultset, variant, target) {
        const tablepart = target.append("div").attr("class", "col-xs-8");
        new AmountTable({
            title: `GO terms - ${variant} - ${this.peptide}`,
            el: tablepart,
            data: goResultset.sortedTerms(variant),
            limit: 5,
            contents: [
                {
                    title: "Count",
                    text: d => d.value,
                    style: {"width": "5em"},
                    shade: d => 100 * goResultset.getFractionOf(d.code),
                },
                {
                    title: "GO Term",
                    html: d => `<a href="https://www.ebi.ac.uk/QuickGO/term/${d.code}" target="_blank">${d.code}</a>`,
                    text: d => d.code,
                    style: {"width": "7em"},
                },
                {
                    title: "Name",
                    text: d => GOTerms.nameOf(d.code),
                },
            ],
            tooltip: d => this.tooltipGO(d.code, goResultset),
            tooltipID: "#tooltip",
        }).draw();
    }

    setUpQuickGo(goResultset, variant, variantName, target) {
        const top5 = goResultset.sortedTerms(variant).slice(0, 5).map(x => x.code);
        const quickGoChartURL = GOTerms.quickGOChartURL(top5);
        const top5WithNames = top5.map(x => `${GOTerms.nameOf(x)} (${numberToPercent(goResultset.getFractionOf(x))})`);
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
                showInfoModal("QuickGo " + variantName, `
                    This chart shows the realationship between the ${top5.length} most occuring GO terms: ${top5sentence}.<br/>
                    <a href="${quickGoChartURL}" target="_blank" title="Click to enlarge in new tab"><img style="max-width:100%" src="${quickGoChartURL}" alt="QuickGO chart of ${top5sentence}"/></a>
                    <br>
                    Provided by <a href="https://www.ebi.ac.uk/QuickGO/annotations?goId=${top5.join(",")}" target="_blank">QuickGo</a>.`,
                {wide: true});
            });
    }

    /**
     * Enable show and hide of tooltips,
     * The values are set in `this.setUpGO` and `setUpEC`
     */
    initFAToolips() {
        /* eslint brace-style: "off" */
        const tooltipShowCSS = {"display": "block", "visibility": "visible"};
        const tooltipHideCSS = {"display": "none", "visibility": "hidden"};

        $(".ecNumberLink,.goTermLink")
            .mouseenter(() => {this.$tooltip.css(tooltipShowCSS);})
            .mouseleave(() => {this.$tooltip.css(tooltipHideCSS);})
            .mousemove(e => {
                this.$tooltip.css("top", e.pageY + 10);
                this.$tooltip.css("left", e.pageX + 10);
            });
    }

    initLineageTree(jsonData) {
        let colors = {
            "Bacteria": "#1565C0", // blue
            "Archaea": "#FF8F00", // orange
            "Eukaryota": "#2E7D32", // green
            "Viruses": "#C62828", // red
        };

        const tree = $("#lineageTree").empty().treeview(jsonData, {
            width: panelWidth,
            height: panelHeight,
            colors: d => d.name in colors ? colors[d.name] : "#1565C0",
        });

        // Deselect the whole tree
        const root = tree.getRoot();
        root.setSelected(false);

        // Select and expand the LCA
        let curNode = root;
        while (curNode.children.length === 1) {
            curNode = curNode.children[0];
            curNode.expand();
        }
        curNode.setSelected(true);
        tree.update(root);
        tree.centerNode(curNode);
        tree.update(root);
    }
}

export {SPA};
