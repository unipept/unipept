/**
 * Constructs a Multisearch object that handles all JavaScript of the
 * metaproteomics analysis results page
 *
 * @return <Multisearch> that The constructed Multisearch object
 */
var constructMultisearch = function constructMultisearch(args) {
    /*************** Private variables ***************/

    var that = {},
        data = args.diversityData,
        sbecdata = args.functionalData,
        equateIL = args.equateIL,
        missed = args.missed,
        sequences = args.sequences,
        godata = args.go_tree,
        select,
        sunburst,
        treemap,
        treeview,
        searchtree,
        mapping = new Map();

    /*************** Private methods ***************/

    /**
     * Initializes Multisearch
     */
    function init() {
        // set up visualisations
        initVisualisations();

        initVisualisationsSunburst(sbecdata, '#ecSunburst');

        initVisualisationsSunburst(data, '#sunburst')

        initVisualisationsTreeview(data, "#d3TreeView");

        initVisualisationsTreeview(sbecdata, "#ecTreeView");

        initVisualisationsTreeview(godata['biological_process'], "#goTreeView1")
        initVisualisationsTreeview(godata['molecular_function'], "#goTreeView2")
        initVisualisationsTreeview(godata['cellular_component'], "#goTreeView3")

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
        addCopy($("#copy-missed span").first(), function () {return $(".mismatches").text(); });

    }

    function initVisualisationsSunburst(data, selector) {
        // sunburst
        try {
            sunburst = $(selector).sunburst({multi : that, data : JSON.parse(JSON.stringify(data))});
        } catch (err) {
            error(err.message, "Loading the Sunburst visualization failed. Please use Google Chrome, Firefox or Internet Explorer 9 or higher.");
        }
        mapping.set(selector.substring(1,selector.length), sunburst);
    }

    function initVisualisationsTreeview(data, selector) {
        // treeview
        try {
            treeview = $(selector).treeview({data : JSON.parse(JSON.stringify(data)), width: 916, height: 600,});
        } catch (err) {
            error(err.message, "Loading the Treeview visualization failed. Please use Google Chrome, Firefox or Internet Explorer 9 or higher.");
        }
        mapping.set(selector.substring(1,selector.length), treeview);
    }

    function initVisualisations() {

        // treemap
        try {
            treemap = constructTreemap({multi : that, data : JSON.parse(JSON.stringify(data))});
        } catch (err) {
            error(err.message, "Loading the Treemap visualization failed. Please use Google Chrome, Firefox or Internet Explorer 9 or higher.");
        }

        // searchtree
        try {
            searchtree = constructSearchtree({multi : that, data : data, equateIL : equateIL});
        } catch (err) {
            error(err.message, "Loading the Hierarchical outline failed. Please use Google Chrome, Firefox or Internet Explorer 9 or higher.");
        }
        mapping.set("d3TreeMap", treemap);
    }

    /**
     * Adds the list of missed peptides
     */
    function addMissed() {
        var misses = "";
        for (var i = 0; i < missed.length; i++) {
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

            var nonce = Math.random();
            var toast = showNotification("Preparing file...", {
                autoHide: false,
                loading: true
            });
            $("#nonce").val(nonce);
            $("#downloadDataset").button('loading');
            var downloadTimer = setInterval(function () {
                if (document.cookie.indexOf(nonce) !== -1) {
                    $("#downloadDataset").button('reset');
                    clearInterval(downloadTimer);
                    toast.hide();
                }
            }, 1000);
            return true;
        });
    }


    /**
     * Sets the visualisation in full screen mode
     *
     * @param <boolean> isFullScreen indicates if we're in full screen mode
     */
    function setSunburstFullScreen(isFullScreen) {
        // the delay is because the event fires before we're in fullscreen
        // so the height en width functions don't give a correct result
        // without the delay
        setTimeout(function () {
            var size = 740;
            if (isFullScreen) {
                size = Math.min($(window).height() - 44, $(window).width() - 250);
            }
            $(".sunburst > svg").attr("height", size);
            $(".sunburst > svg").attr("width", size);
        }, 1000);
    };


    /**
     * Sets the visualisation in full screen mode
     *
     * @param <boolean> isFullScreen indicates if we're in full screen mode
     */
    function setTreeviewFullScreen(isFullScreen) {
        // the delay is because the event fires before we're in fullscreen
        // so the height en width functions don't give a correct result
        // without the delay
        setTimeout(function () {
            var width = 916,
            height = 600;
            if (isFullScreen) {
                width = $(window).width();
                height = $(window).height();
            }
            $(".treeView svg").attr("width", width);
            $(".treeView svg").attr("height", height);
        }, 1000);
    };

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
        var isFullScreen = window.fullScreenApi.isFullScreen();
        if (!isFullScreen) {
            var activeTab = getActiveTab();
        } else {
            var activeTab = getActiveCloseTab();
        }

        // sync tabs
        $("ul.visualisations li.active").removeClass("active");
        $("ul.visualisations li").each(function (i, el) {
            if ($(el).find("a").attr("href") === "#" + activeTab) {
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
        setSunburstFullScreen(isFullScreen);
        treemap.setFullScreen(isFullScreen);
        setTreeviewFullScreen(isFullScreen);
    }

    function saveImage () {
        var activeTab = getActiveSubTab();
        $(".debug_dump").hide();
        logToGoogle("Multi Peptide", "Save Image", activeTab);
        if (activeTab === "sunburst") {
            d3.selectAll(".toHide").attr("class", "arc hidden");
            triggerDownloadModal("#"+activeTab+" > svg", null, "unipept_sunburst");
            d3.selectAll(".hidden").attr("class", "arc toHide");
        } else if (activeTab === "ecSunburst") {
            d3.selectAll(".toHide").attr("class", "arc hidden");
            triggerDownloadModal("#"+activeTab+" > svg", null, "unipept_ecSunburst");
            d3.selectAll(".hidden").attr("class", "arc toHide");
        } else if (activeTab === "d3TreeMap") {
            triggerDownloadModal(null, "#"+activeTab, "unipept_treemap");
        } else if (activeTab === "d3TreeView") {
            triggerDownloadModal("#"+activeTab+" svg", null, "unipept_treeview");
        } else if (activeTab === "goTreeView") {
            triggerDownloadModal("#"+activeTab+" svg", null, "unipept_goTreeView");
        }
    }

    function setUpActionBar() {
        $(".fullScreenActions a").tooltip({placement: "bottom", delay: { "show": 300, "hide": 300 }});
        $(".fullScreenActions .reset").click(function () {
            mapping.get(getActiveSubTab()).reset();
        });
        $(".fullScreenActions .download").click(saveImage);
        $(".fullScreenActions .exit").click(function () {
            window.fullScreenApi.cancelFullScreen();
        });
    }

    function getActiveSubTab() {
        var activePanes = $(".tab-pane .card-supporting-text li.active").find("a");
        if (getActiveTab() === "biodiversityAnalysis") {
            var activePane = activePanes.attr("href");
            return activePane.split("Wrapper")[0].substring(1,activePane.length);
        } else if (getActiveTab() === "functionalAnalysis") {
            var activePane = activePanes[1].getAttribute("href");
            return activePane.split("Wrapper")[0].substring(1,activePane.length);
        } else {"There is no third tab!"}
    }

    function getActiveCloseTab() {
        var activePane = $(".card-title.card-title-colored li.active").find("a").attr('href');
        return activePane.split("Wrapper")[0].substring(1,activePane.length);
    }

    function getActiveTab() {
        var activePane = $("li.active").find("a").attr('href');
        return activePane.split("Wrapper")[0].substring(1,activePane.length);
    }

    /*************** Public methods ***************/

    /**
     * Filters the tree after a given number of ms
     *
     * @param <String> searchTerm The string searched for
     * @param <int> timeout The number of ms to wait for
     */
    that.search = function search(searchTerm, timeout) {
        var localTimeout = timeout || 500; // the number of ms before actually searching
        var localTerm = searchTerm;
        if (localTerm === "Organism") {
            localTerm = "";
        }
        setTimeout(function () { searchtree.search(localTerm); }, localTimeout);
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
        var s = that.getOwnSequences(d.id);
        for (var i = 0; i < d.children.length; i++) {
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
        var title = d.name;
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
    that.tooltipInChart = function tooltipInPieChart(d, tt, pie) {
        tt.style("visibility", "visible")
            .html(that.getTooltipContentChart(d));
    };
    that.tooltipMove = function tooltipMove(tt) {
        var pos = that.getTooltipPosition();
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
    that.getTooltipContentChart = function getTooltipContent(d) {
        return "<b>" + d.data.function + "</b> (" + d.data.name + ")<br/>" +
        (d.data.count) + " total hits<br/>"
    };
    that.getPiechartUrl = function getPiechartUrl(d) {
        var url = "http://chart.apis.google.com/chart?chs=300x225&cht=p&chd=t:";
        url += d.children.map(function (i) { return i.data.count; }).join(",");
        url += "&chdl=";
        url += d.children.map(function (i) { return i.name + " (" + i.data.count + ")"; }).join("|");
        url += "&chds=0,";
        url +=  d3.max(d.children.map(function (i) { return i.data.count; }));
        return url;
    };
    that.getTooltipPosition = function getTooltipPosition() {
        var pos = {};
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
    // to correct screen size for tooltip coordinates
    setSunburstFullScreen(false);

    return that;
};
