function init_sequence_show(data) {

    // set up the fancy tree
    initD3TreeView(data.tree, "#lineageTree");

    // set up fancy d3TreeView
    initD3TreeView(data.ec_tree, "#ecTree")

    // set up GO graph
    initDagreD3Graph(data.terms, data.edges, data.found, "goGraph", "go-graph-tab")

    // set up column toggle
    initColumnToggle();

    // fullscreen and save image buttons
    var buttons = ['lineage-tree', 'ec-tree', 'go-graph']

    // set up the fullscreen stuff
    setUpFullScreen(buttons);

    // set up save image stuff
    setUpImageSave(buttons);

    // enable the external link popovers
    addExternalLinks();

    // enable the open in UniProt and clipboard buttons
    setUpUniprotButtons(data.uniprotEntries);

    // add the tab help
    initHelp();

    /******************* Functions ***********************/

    /**
     * Initializes the help popups
     */
    function initHelp() {
        // tab help
        $(".nav-tabs li a span.help").click(function (e) {
            var title,
                content;
            e.stopPropagation();
            e.preventDefault();
            if ($(this).parent().attr("id") === "lineage-tree-tab") {
                title = "Lineage tree";
                content = "This interactive tree bundles the complete taxonomic lineages of all UniProt entries whose protein sequence contains " + data.peptide + ". You can click on nodes to expand them, scroll to zoom and drag to move the tree.";
            } else if ($(this).parent().attr("id") === "lineage-table-tab") {
                title = "Lineage table";
                content = "This table shows the complete taxonomic lineages of all taxa associated with the UniProt entries whose protein sequence contains " + data.peptide + ". The first column contains the taxon name extracted from the UniProt entry, followed by columns representing taxonomic ranks ordered from superkingdom on the left to forma on the right.";
            } else if ($(this).parent().attr("id") === "ec-tree-tab") {
                title = "EC number tree";
                content = "This interactive tree bundles the complete hierarchy of EC numbers associated with all UniProt entries whose protein sequence contains " + data.peptide + ". You can click on nodes to expand them, scroll to zoom and drag to move the tree";
            }
            showInfoModal(title, content);
        });
    }

    function initD3TreeView(data, selector) {
        $(selector).treeview({
          data: data,
          width: 916,
          height: 600,
        });
    }

    function initDagreD3Graph(terms, edges, found, div, tab) {
        // Create a new directed graph
        var g = new dagreD3.graphlib.Graph().setGraph({rankdir: "RL"});

        // Automatically label each of the nodes
        for (term of terms) {
            color = $.inArray(term.id, found) != -1 ? "#5698C6" : "#fff";
            g.setNode(term.id, { label: "<div style='width:60px; color:#000; white-space:normal;'>" + term.name + "</div>", name: term.id, style: "fill: " + color + "; stroke: #1F77B4; stroke-width: 2px;", labelType: "html", shape: "weightCircle" });
        }

        // Set up the edges
        for (edge of edges) {
            g.setEdge(edge.from, edge.to, { style: "fill: none; stroke: #1F77B4; stroke-opacity: 0.5; stroke-linecap: round; stroke-width:" + (edge.weight*10) + "px", arrowhead: "undirected", lineInterpolate: "basis" });
        }

        var svg = d3.select("#" + div + " svg");
        var inner = svg.select("g");

        // Set up zoom support
        var zoom = d3.behavior.zoom().on("zoom", function() {
            inner.attr("transform", "translate(" + d3.event.translate + ")" +
                       "scale(" + d3.event.scale + ")");
        });
        svg.call(zoom);

        // Create the renderer
        var render = new dagreD3.render();

        render.shapes().weightCircle = function(parent, bbox, node) {
            var r = 40;
            shapeSvg = parent.insert("circle", ":first-child")
                .attr("x", -bbox.width / 2)
                .attr("y", -bbox.height / 2)
                .attr("r", r)

                node.intersect = function(point) {
                    return dagreD3.intersect.circle(node, r, point);
                };

            return shapeSvg;
        };

        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            if ($(e.target).attr("id") == "go-graph-tab" && $("#" + div + " svg g g").length == 0) {
                // Run the renderer. This is what draws the final graph.
                render(inner, g);

                inner.selectAll("g.node")
                     .attr("title", function(v) { return g.node(v).name });
                inner.selectAll("defs").remove()

                // Center the graph
                var initialScale = 0.5;
                zoom
                    .translate([(svg.attr("width") - g.graph().width * initialScale) / 2, 20])
                    .scale(initialScale)
                    .event(svg);
            }
        });
    }

    function initColumnToggle() {
        $("th a span").click(function() {
            if ($(this).attr("class") === "classdesc" || "glyphicon") {
                toggleColumn($(this).attr("id"));
            }
        })
    }

    function toggleColumn(col) {
        els = $("#ec-table tr td:nth-child(" + col + ") div");
        if (els.css('display') == "none") {
            els.show();
            $("#ec-table tr th:nth-child(" + col + ") a span.classdesc").show();
            $("#ec-table tr th:nth-child(" + col + ") a span.glyphicon").hide();
        } else {
            els.hide();
            $("#ec-table tr th:nth-child(" + col + ") a span.classdesc").hide();
            $("#ec-table tr th:nth-child(" + col + ") a span.glyphicon").show();
        }
    }

    function addExternalLinks() {
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

    function setUpUniprotButtons(entries) {
        $("#open-uniprot").click(function () {
            var url = "http://www.uniprot.org/uniprot/?query=accession%3A";
            url += entries.join("+OR+accession%3A");
            window.open(url, '_blank');
        });
        addCopy($("#clipboard-uniprot").first(), function () {
            return entries.join("\n");
        }, "Copy UniProt IDs to clipboard");
    }

    /**
     * Sets up the image save stuff
     */
    function setUpImageSave(buttons) {
        buttons.forEach(function(button) {
            $("#buttons-" + button).prepend("<button id='save-btn-" + button + "' class='btn btn-default btn-xs btn-animate'><span class='glyphicon glyphicon-download down'></span> Save tree as image</button>");
            $("#save-btn-" + button).click(function () {
                logToGoogle("Single Peptide", "Save Image");
                triggerDownloadModal("#" + button + " svg", null, "unipept_"+button);
            });
        });
    }

    /**
     * Sets up the full screen stuff
     */
    function setUpFullScreen(buttons) {
        if (fullScreenApi.supportsFullScreen) {
            buttons.forEach(function(button) {
                $("#buttons-" + button).prepend("<button id='zoom-btn-" + button + "' class='btn btn-default btn-xs btn-animate'><span class='glyphicon glyphicon-resize-full grow'></span> Enter full screen</button>");
                $("#zoom-btn-" + button).click(function () {
                    logToGoogle("Single Peptide", "Full Screen");
                    window.fullScreenApi.requestFullScreen($("#" + button + " div.tpa-tree").get(0));
                });
            });
            $(document).bind(fullScreenApi.fullScreenEventName, resizeFullScreen);
        }

        function resizeFullScreen() {
            setTimeout(function () {
                var width = 916,
                    height = 600;
                if (window.fullScreenApi.isFullScreen()) {
                    width = $(window).width();
                    height = $(window).height();
                }
                buttons.forEach(function(button) {
                    $("#" + button + " div.tpa-tree svg").attr("width", width);
                    $("#" + button + " div.tpa-tree svg").attr("height", height);
                });
            }, 1000);
        }
    }
}
