function init_multi(data, sequences, missed, equate_il) {

    constructMultisearch({data : data});

    $("#downloadDataset").click(function () {
        // Track the download button
        logToGoogle("Multi Peptide", "Export");

        var nonce = Math.random();
        $("#nonce").val(nonce);
        $("#downloadDataset").button('loading');
        var downloadTimer = setInterval(function () {
            if (document.cookie.indexOf(nonce) !== -1) {
                $("#downloadDataset").button('reset');
                clearInterval(downloadTimer);
            }
        }, 1000);
        return true;
    });

    // copy to clipboard for missed peptides
    addCopy($("#copy-missed span").first(), function () {return $(".mismatches").text(); });

    // tree
    try {
        initTree(data, equate_il);
    } catch (err) {
        error(err.message, "Loading the Hierarchical outline failed. Please use Google Chrome, Firefox or Internet Explorer 9 or higher.");
    }

    // set up the fullscreen stuff
    if (fullScreenApi.supportsFullScreen) {
        $("#buttons").prepend("<button id='zoom-btn' class='btn btn-default btn-xs'><span class='glyphicon glyphicon-resize-full'></span> Enter full screen</button>");
        $("#zoom-btn").click(function () {
            if ($(".tab-content .active").attr('id') === "sunburstWrapper") {
                logToGoogle("Multi Peptide", "Full Screen", "Sunburst");
                window.fullScreenApi.requestFullScreen($("#sunburst").get(0));
            } else if ($(".tab-content .active").attr('id') === "d3TreeMapWrapper") {
                logToGoogle("Multi Peptide", "Full Screen", "Treemap");
                window.fullScreenApi.requestFullScreen($("#d3TreeMap").get(0));
            } else {
                logToGoogle("Multi Peptide", "Full Screen", "Treeview");
                window.fullScreenApi.requestFullScreen($("#d3TreeView").get(0));
            }
        });
        $(document).bind(fullScreenApi.fullScreenEventName, resizeFullScreen);
    }

    function resizeFullScreen() {
        if ($(".tab-content .active").attr('id') === "sunburstWrapper") {
            setTimeout(function () {
                var size = 740,
                    destination = "body";
                if (window.fullScreenApi.isFullScreen()) {
                    size = Math.min($(window).height(), $(window).width());
                    destination = "#sunburst";
                }
                $("#sunburst svg").attr("width", size);
                $("#sunburst svg").attr("height", size);
                $("#sunburst-tooltip").appendTo(destination);
            }, 1000);
        } else if ($(".tab-content .active").attr('id') === "d3TreeMapWrapper") {
            var destination = "body";
            if (window.fullScreenApi.isFullScreen()) {
                destination = "#d3TreeMap";
            }
            $("#treemap-tooltip").appendTo(destination);
        } else {
            setTimeout(function () {
                var width = 916,
                    height = 600,
                    destination = "body";
                if (window.fullScreenApi.isFullScreen()) {
                    width = $(window).width();
                    height = $(window).height();
                    destination = "#d3TreeView";
                }
                $("#d3TreeView svg").attr("width", width);
                $("#d3TreeView svg").attr("height", height);
                $("#treeview-tooltip").appendTo(destination);
            }, 1000);
        }
    }

    // set up save image stuff
    $("#buttons").prepend("<button id='save-btn' class='btn btn-default btn-xs'><span class='glyphicon glyphicon-download'></span> Save as image</button>");
    $("#save-btn").click(function () {
        $(".debug_dump").hide();
        if ($(".tab-content .active").attr('id') === "sunburstWrapper") {
            d3.selectAll(".toHide").attr("class", "hidden");
            logToGoogle("Multi Peptide", "Save Image", "Sunburst");
            triggerDownloadModal("#sunburst svg", null, "unipept_sunburst");
            d3.selectAll(".hidden").attr("class", "toHide");
        } else if ($(".tab-content .active").attr('id') === "d3TreeMapWrapper") {
            logToGoogle("Multi Peptide", "Save Image", "Treemap");
            triggerDownloadModal(null, "#d3TreeMap", "unipept_treemap");
        } else {
            logToGoogle("Multi Peptide", "Save Image", "Treeview");
            triggerDownloadModal("#d3TreeView svg", null, "unipept_treeview");
        }
    });

    // set up missed
    addMissed();

    function addMissed() {
        var misses = "";
        for (var i = 0; i < missed.length; i++) {
            misses += "<li><a href='http://blast.ncbi.nlm.nih.gov/Blast.cgi?PAGE_TYPE=BlastSearch&amp;SET_SAVED_SEARCH=on&amp;USER_FORMAT_DEFAULTS=on&amp;PAGE=Proteins&amp;PROGRAM=blastp&amp;QUERY=" + missed[i] + "&amp;GAPCOSTS=11%201&amp;EQ_MENU=Enter%20organism%20name%20or%20id--completions%20will%20be%20suggested&amp;DATABASE=nr&amp;BLAST_PROGRAMS=blastp&amp;MAX_NUM_SEQ=100&amp;SHORT_QUERY_ADJUST=on&amp;EXPECT=10&amp;WORD_SIZE=3&amp;MATRIX_NAME=BLOSUM62&amp;COMPOSITION_BASED_STATISTICS=2&amp;SHOW_OVERVIEW=on&amp;SHOW_LINKOUT=on&amp;ALIGNMENT_VIEW=Pairwise&amp;MASK_CHAR=2&amp;MASK_COLOR=1&amp;GET_SEQUENCE=on&amp;NEW_VIEW=on&amp;NUM_OVERVIEW=100&amp;DESCRIPTIONS=100&amp;ALIGNMENTS=100&amp;FORMAT_OBJECT=Alignment&amp;FORMAT_TYPE=HTML&amp;OLD_BLAST=false' target='_blank'>" + missed[i] + "</a> <span class='glyphicon glyphicon-share-alt'></span></li>";
        }
        $(".mismatches").html(misses);
    }


    function initTree(data, equate_il) {
        var tree,
            items,
            i;
        equate_il = equate_il ? "equateIL" : "";

        // Add the nested unordered lists to the page based on the data array
        tree = d3.select("#treeView");
        tree = tree.append("ul").append("li").attr("class", "root not").append("ul");
        //$("li.root").prepend($("#treeSearchDiv"));
        items = tree.selectAll("li").data([data])
            .enter()
            .append("li")
                .html(function (d) { return "<span>" + getTitle(d) + "</span>"; })
                .attr("title", function (d) { return d.data.rank; })
                .attr("class", "collapsibleListOpen")
                .attr("data-search", function (d) { return d.name.toLowerCase(); })
            .append("ul");
        for (i = 0; i < 28; i++) {
            items = items.selectAll("li").data(function (d) { return d.children; })
                .enter()
                .append("li")
                    .html(function (d) { return "<span>" + getTitle(d) + "</span>"; })
                    .attr("title", function (d) { return d.data.rank; })
                    .attr("class", function (d) {
                        if (!d.children.length) {
                            return "not leaf";
                        } else if (i < 3) {
                            return "collapsibleListOpen";
                        } else {
                            return "collapsibleListClosed";
                        }
                    })
                    .attr("data-search", function (d) { return d.name.toLowerCase(); })
                .append("ul");
        }

        // Prevent accidental text selection
        $("#treeView li.root ul").disableSelection();

        // Expand or collapse a node when clicked
        $("#treeView li").click(function () {
            if (!$(this).hasClass("not")) {
                $(this).toggleClass("collapsibleListOpen collapsibleListClosed");
            }
            return false;
        });
        $("#treeView li span").click(function () {
            logToGoogle("Multi Peptide", "tree", "Peptides");

            var d         = d3.select(this.parentElement).datum(),
                margin    = this.offsetTop - 9,
                innertext = "<a href='http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=" + d.data.taxon_id + "' target='_blank'>" + d.name + "</a>",
                infoPane,
                ownSequences,
                list,
                peptide,
                allSequences;

            $("span.clicked").removeClass("clicked");
            $(this).addClass("clicked");
            innertext += " (" + d.data.rank + ")";
            infoPane = $("#tree_data").html("<h3>" + innertext + "</h3>");
            $("#tree_data").css("-webkit-transform", "translateY(" + margin + "px)");
            $("#tree_data").css("transform", "translateY(" + margin + "px)");
            ownSequences = getOwnSequences(d.id).sort();
            if (ownSequences && ownSequences.length > 0) {
                list = infoPane.append("<h4 class='own'>Peptides specific for this taxon</h4><ul></ul>").find("ul").last();
                for (peptide in ownSequences) {
                    list.append("<li><a href='/sequences/" + ownSequences[peptide] + "/" + equate_il + "' target='_blank'>" + ownSequences[peptide] + "</a></li>");
                }
                infoPane.find("h4.own").before("<div id='copy-own' class='zero-clipboard'><span class='btn-clipboard'>Copy</span></div>");
                addCopy($("#copy-own span").first(), function () {return ownSequences.join("\n"); });

            }
            allSequences = getAllSequences(d).sort();
            if (allSequences && allSequences.length > 0 && allSequences.length !== (ownSequences ? ownSequences.length : 0)) {
                list = infoPane.append("<h4 class='all'>Peptides specific to this taxon or one of its subtaxa</h4><ul></ul>").find("ul").last();
                for (peptide in allSequences) {
                    list.append("<li><a href='/sequences/" + allSequences[peptide] + "/" + equate_il + "' target='_blank'>" + allSequences[peptide] + "</a></li>");
                }
                infoPane.find("h4.all").before("<div id='copy-all' class='zero-clipboard'><span class='btn-clipboard'>Copy</span></div>");
                addCopy($("#copy-all span").first(), function () {return allSequences.join("\n"); });
            }
            return false;
        });

        // add search
        $("#tree_search").keyup(function () {
            var text = $(this).val().toLowerCase();
            delay(function () {
                $("#treeView li").removeClass("match unmatch");
                if (text !== "") {
                    var $matches = $("#treeView li[data-search*='" + text + "']").addClass("match");
                    $matches.find("li").addClass("match");
                    $matches.parents("li").addClass("match").addClass("collapsibleListOpen").removeClass("collapsibleListClosed");
                    $("#treeView li:not(.match):not(.root)").addClass("unmatch");
                }
            }, 500);
        });
        $('#tree_search').click(function () {
            $(this).keyup();
        });
        $('#tree_search').change(function () {
            $(this).keyup();
        });
    }

    // tooltip functions
    function tooltipIn(d, tt, pie) {
        tt.style("visibility", "visible")
            .html(getTooltipContent(d));
        if (pie && d.children && d.children.length > 1) {
            tt.html(tt.html() + "<br><img src='" + getPiechartUrl(d) + "'/>");
        }
    }
    function tooltipMove(tt) {
        var pos = getTooltipPosition();
        tt.style("top", pos.top).style("left", pos.left);
    }
    function tooltipOut(tt) {
        tt.style("visibility", "hidden");
    }
    function getTooltipContent(d) {
        return "<b>" + d.name + "</b> (" + d.data.rank + ")<br/>" +
            (!d.data.self_count ? "0" : d.data.self_count) +
            (d.data.self_count && d.data.self_count === 1 ? " sequence" : " sequences") + " specific to this level<br/>" +
            (!d.data.count ? "0" : d.data.count) +
            (d.data.count && d.data.count === 1 ? " sequence" : " sequences") + " specific to this level or lower";
    }
    function getPiechartUrl(d) {
        var url = "http://chart.apis.google.com/chart?chs=300x225&cht=p&chd=t:";
        url += d.children.map(function (i) { return i.data.count; }).join(",");
        url += "&chdl=";
        url += d.children.map(function (i) { return i.name + " (" + i.data.count + ")"; }).join("|");
        url += "&chds=0,";
        url +=  d3.max(d.children.map(function (i) { return i.data.count; }));
        return url;
    }
    function getTooltipPosition() {
        var pos = {};
        if (window.fullScreenApi.isFullScreen()) {
            pos.top = (d3.event.clientY - 5) + "px";
            pos.left = (d3.event.clientX + 15) + "px";
        } else {
            pos.top = (d3.event.pageY - 5) + "px";
            pos.left = (d3.event.pageX + 15) + "px";
        }
        return pos;
    }

    // Enters the given string in the search box
    // Highlights the field
    // filters the tree after the given number of ms
    function treeSearch(searchTerm, duration) {
        if (searchTerm === "Organism") {
            searchTerm = "";
        }
        var timeout = duration || 0;
        $("#tree_search").val(searchTerm);
        highlight("#tree_search");
        setTimeout(function () { $("#tree_search").change(); }, timeout);
    }

    // returns an array containing all sequences specific to this sequence id
    function getOwnSequences(id) {
        return sequences[id] || [];
    }

    // returns an array containing all sequences specific to this node or
    // something below
    function getAllSequences(d) {
        var s = getOwnSequences(d.id);
        for (var i = 0; i < d.children.length; i++) {
            s = s.concat(getAllSequences(d.children[i]));
        }
        return s;
    }

    // constructs a title
    function getTitle(d) {
        var title = d.name;
        title += " (" + d.data.self_count + "/" + d.data.count + ")";
        return title;
    }
}