import {showNotification} from "../notifications.js";

import {constructSearchtree} from "./searchtree.js";
import {constructSunburst} from "./sunburst.js";
import {constructTreemap} from "./treemap.js";
import {constructTreeview} from "./treeview.js";

/**
 * Constructs a Multisearch object that handles all JavaScript of the
 * metaproteomics analysis results page
 *
 * @return <Multisearch> that The constructed Multisearch object
 */
function initMultisearch(args) {
    /** ************* Private variables ***************/

    let that = {},
        data = args.data,
        equateIL = args.equateIL,
        missed = args.missed,
        sequences = args.sequences,
        sunburst,
        treemap,
        treeview,
        searchtree,
        mapping = new Map();

    /** ************* Private methods ***************/

    /**
     * Initializes Multisearch
     */
    function init() {
        // set up visualisations
        initVisualisations();

        // set up save images
        setUpSaveImage();

        // set up save dataset
        setUpSaveDataset();

        // set up full screen
        setUpFullScreen();

        // set up the full screen action bar
        setUpActionBar();

        // set up missed
        addMissed();
        // copy to clipboard for missed peptides
        addCopy($("#copy-missed span").first(), function () {
            return $(".mismatches").text();
        });
    }

    function initVisualisations() {
        // sunburst
        try {
            sunburst = constructSunburst({multi: that, data: JSON.parse(JSON.stringify(data))});
        } catch (err) {
            error(err.message, "Loading the Sunburst visualization failed. Please use Google Chrome, Firefox or Internet Explorer 9 or higher.");
        }

        // treemap
        try {
            treemap = constructTreemap({multi: that, data: JSON.parse(JSON.stringify(data))});
        } catch (err) {
            error(err.message, "Loading the Treemap visualization failed. Please use Google Chrome, Firefox or Internet Explorer 9 or higher.");
        }

        // treeview
        try {
            treeview = constructTreeview({multi: that, data: JSON.parse(JSON.stringify(data))});
        } catch (err) {
            error(err.message, "Loading the Treeview visualization failed. Please use Google Chrome, Firefox or Internet Explorer 9 or higher.");
        }

        // searchtree
        try {
            searchtree = constructSearchtree({multi: that, data: data, equateIL: equateIL});
        } catch (err) {
            error(err.message, "Loading the Hierarchical outline failed. Please use Google Chrome, Firefox or Internet Explorer 9 or higher.");
        }

        mapping.set("sunburst", sunburst);
        mapping.set("d3TreeMap", treemap);
        mapping.set("d3TreeView", treeview);
    }

    /**
     * Adds the list of missed peptides
     */
    function addMissed() {
        let misses = "";
        for (let i = 0; i < missed.length; i++) {
            misses += "<li><a href='http://blast.ncbi.nlm.nih.gov/Blast.cgi?PAGE_TYPE=BlastSearch&amp;SET_SAVED_SEARCH=on&amp;USER_FORMAT_DEFAULTS=on&amp;PAGE=Proteins&amp;PROGRAM=blastp&amp;QUERY=" + missed[i] + "&amp;GAPCOSTS=11%201&amp;EQ_MENU=Enter%20organism%20name%20or%20id--completions%20will%20be%20suggested&amp;DATABASE=nr&amp;BLAST_PROGRAMS=blastp&amp;MAX_NUM_SEQ=100&amp;SHORT_QUERY_ADJUST=on&amp;EXPECT=10&amp;WORD_SIZE=3&amp;MATRIX_NAME=BLOSUM62&amp;COMPOSITION_BASED_STATISTICS=2&amp;SHOW_OVERVIEW=on&amp;SHOW_LINKOUT=on&amp;ALIGNMENT_VIEW=Pairwise&amp;MASK_CHAR=2&amp;MASK_COLOR=1&amp;GET_SEQUENCE=on&amp;NEW_VIEW=on&amp;NUM_OVERVIEW=100&amp;DESCRIPTIONS=100&amp;ALIGNMENTS=100&amp;FORMAT_OBJECT=Alignment&amp;FORMAT_TYPE=HTML&amp;OLD_BLAST=false' target='_blank'>" + missed[i] + "</a> <span class='glyphicon glyphicon-share-alt'></span></li>";
        }
        $(".mismatches").html(misses);
    }

    function setUpSaveImage() {
        $("#buttons").prepend("<button id='save-btn' class='btn btn-default btn-xs btn-animate'><span class='glyphicon glyphicon-download down'></span> Save as image</button>");
        $("#save-btn").click(saveImage);
    }

    function setUpSaveDataset() {
        $("#downloadDataset").click(function () {
            // Track the download button
            logToGoogle("Multi Peptide", "Export");

            let nonce = Math.random();
            let toast = showNotification("Preparing file...", {
                autoHide: false,
                loading: true,
            });
            $("#nonce").val(nonce);
            $("#downloadDataset").button("loading");
            var downloadTimer = setInterval(function () {
                if (document.cookie.indexOf(nonce) !== -1) {
                    $("#downloadDataset").button("reset");
                    clearInterval(downloadTimer);
                    toast.hide();
                }
            }, 1000);
            return true;
        });
    }

    function setUpFullScreen() {
        if (fullScreenApi.supportsFullScreen) {
            $("#buttons").prepend("<button id='zoom-btn' class='btn btn-default btn-xs btn-animate'><span class='glyphicon glyphicon-resize-full grow'></span> Enter full screen</button>");
            $("#zoom-btn").click(function () {
                logToGoogle("Multi Peptide", "Full Screen", getActiveTab());
                window.fullScreenApi.requestFullScreen($(".full-screen-container").get(0));
            });
            $(document).bind(fullScreenApi.fullScreenEventName, resizeFullScreen);
        }
    }

    function resizeFullScreen() {
        let activeTab = getActiveTab(),
            isFullScreen = window.fullScreenApi.isFullScreen();

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
            $("#tooltip").appendTo(".full-screen-container");
        } else {
            $("#tooltip").appendTo("body");
        }

        // update visualisations
        sunburst.setFullScreen(isFullScreen);
        treemap.setFullScreen(isFullScreen);
        treeview.setFullScreen(isFullScreen);
    }

    function saveImage() {
        let activeTab = getActiveTab();
        $(".debug_dump").hide();
        logToGoogle("Multi Peptide", "Save Image", activeTab);
        if (activeTab === "sunburst") {
            d3.selectAll(".toHide").attr("class", "arc hidden");
            triggerDownloadModal("#sunburst > svg", null, "unipept_sunburst");
            d3.selectAll(".hidden").attr("class", "arc toHide");
        } else if (activeTab === "d3TreeMap") {
            triggerDownloadModal(null, "#d3TreeMap", "unipept_treemap");
        } else {
            triggerDownloadModal("#d3TreeView svg", null, "unipept_treeview");
        }
    }

    function setUpActionBar() {
        $(".fullScreenActions a").tooltip({placement: "bottom", delay: {"show": 300, "hide": 300}});
        $(".fullScreenActions .reset").click(function () {
            mapping.get(getActiveTab()).reset();
        });
        $(".fullScreenActions .download").click(saveImage);
        $(".fullScreenActions .exit").click(function () {
            window.fullScreenApi.cancelFullScreen();
        });
    }

    function getActiveTab() {
        let activePane = $(".full-screen-container div.active").attr("id");
        return activePane.split("Wrapper")[0];
    }

    /** ************* Public methods ***************/

    /**
     * Filters the tree after a given number of ms
     *
     * @param <String> searchTerm The string searched for
     * @param <int> timeout The number of ms to wait for
     */
    that.search = function search(searchTerm, timeout) {
        let localTimeout = timeout || 500; // the number of ms before actually searching
        let localTerm = searchTerm;
        if (localTerm === "Organism") {
            localTerm = "";
        }
        setTimeout(function () {
            searchtree.search(localTerm);
        }, localTimeout);
    };

    /**
     * returns an array containing all sequences specific to this sequence id
     *
     * @param <int> id The taxonId of the organism we want the sequences from
     * @return <Array> An array of sequences (strings)
     */
    that.getOwnSequences = function getOwnSequences(id) {
        return sequences[id] || [];
    };

    /**
     * Returns an array containing all sequences matching the given node or any
     * of its children.
     *
     * @param <node> d The node
     * @return <Array> An array of sequences (strings)
     */
    that.getAllSequences = function getAllSequences(d) {
        let s = that.getOwnSequences(d.id);
        for (let i = 0; i < d.children.length; i++) {
            s = s.concat(that.getAllSequences(d.children[i]));
        }
        return s;
    };

    /**
     * Constructs a title string for a given node
     *
     * @param <node> d The node
     * @return <Array> A title string
     */
    that.getTitle = function getTitle(d) {
        let title = d.name;
        title += " (" + d.data.self_count + "/" + d.data.count + ")";
        return title;
    };

    // tooltip functions
    that.tooltipIn = function tooltipIn(d, tt, pie) {
        tt.style("visibility", "visible")
            .html(that.getTooltipContent(d));
        if (pie && d.children && d.children.length > 1) {
            tt.html(tt.html() + "<br><img src='" + that.getPiechartUrl(d) + "'/>");
        }
    };
    that.tooltipMove = function tooltipMove(tt) {
        let pos = that.getTooltipPosition();
        tt.style("top", pos.top).style("left", pos.left);
    };
    that.tooltipOut = function tooltipOut(tt) {
        tt.style("visibility", "hidden");
    };
    that.getTooltipContent = function getTooltipContent(d) {
        return "<b>" + d.name + "</b> (" + d.data.rank + ")<br/>" +
            (!d.data.self_count ? "0" : d.data.self_count) +
            (d.data.self_count && d.data.self_count === 1 ? " sequence" : " sequences") + " specific to this level<br/>" +
            (!d.data.count ? "0" : d.data.count) +
            (d.data.count && d.data.count === 1 ? " sequence" : " sequences") + " specific to this level or lower";
    };
    that.getPiechartUrl = function getPiechartUrl(d) {
        let url = "http://chart.apis.google.com/chart?chs=300x225&cht=p&chd=t:";
        url += d.children.map(function (i) {
            return i.data.count;
        }).join(",");
        url += "&chdl=";
        url += d.children.map(function (i) {
            return i.name + " (" + i.data.count + ")";
        }).join("|");
        url += "&chds=0,";
        url += d3.max(d.children.map(function (i) {
            return i.data.count;
        }));
        return url;
    };
    that.getTooltipPosition = function getTooltipPosition() {
        let pos = {};
        if (window.fullScreenApi.isFullScreen()) {
            pos.top = (d3.event.clientY - 5) + "px";
            pos.left = (d3.event.clientX + 15) + "px";
        } else {
            pos.top = (d3.event.pageY - 5) + "px";
            pos.left = (d3.event.pageX + 15) + "px";
        }
        return pos;
    };

    // initialize the object
    init();

    return that;
}

export {initMultisearch};
