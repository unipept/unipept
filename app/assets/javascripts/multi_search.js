function init_multi(data, sequences, missed, equate_il) {

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

    // sunburst
    try {
        initSunburst(JSON.parse(JSON.stringify(data).replace(/children/g, "kids")));
    } catch (err) {
        error(err.message, "Loading the Sunburst visualization failed. Please use Google Chrome, Firefox or Internet Explorer 9 or higher.");
    }

    // treemap
    try {
        initD3TreeMap(JSON.parse(JSON.stringify(data)));
        $("#treeMapWrapper").removeClass("active");
    } catch (err) {
        error(err.message, "Loading the Treemap visualization failed. Please use Google Chrome, Firefox or Internet Explorer 9 or higher.");
    }

    // treeview
    try {
        initTreeView(JSON.parse(JSON.stringify(data)));
    } catch (err) {
        error(err.message, "Loading the Treeview visualization failed. Please use Google Chrome, Firefox or Internet Explorer 9 or higher.");
    }

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
            logToGoogle("Multi Peptide", "Save Image", "Sunburst");
            triggerDownloadModal("#sunburst svg", null, "unipept_sunburst");
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

    function initD3TreeMap(data) {
        var ranks = ["no rank", "superkingdom", "kingdom", "subkingdom", "superphylum", "phylum", "subphylum", "superclass", "class", "subclass", "infraclass", "superorder", "order", "suborder", "infraorder", "parvorder", "superfamily", "family", "subfamily", "tribe", "subtribe", "genus", "subgenus", "species group", "species subgroup", "species", "subspecies", "varietas", "forma"];

        var root = data,
            current;

        var margin = {top: 0, right: 0, bottom: 0, left: 0},
            width = 916 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;

        var tooltip = d3.select("body")
            .append("div")
            .attr("id", "treemap-tooltip")
            .attr("class", "tip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden");

        var treemap = d3.layout.treemap()
            .size([width, height])
            .padding([10, 0, 0, 0])
            .value(function (d) { return d.data.self_count; });

        var colorScale = d3.scale.ordinal()
            .domain(ranks)
            .range(d3.range(ranks.length).map(d3.scale.linear()
                .domain([0, ranks.length - 1])
                .range(["#104B7D", "#fdffcc"])
                .interpolate(d3.interpolateLab)));

        var breadcrumbs = d3.select("#d3TreeMap").append("div")
            .attr("class", "breadcrumbs")
            .style("position", "relative")
            .style("width", (width + margin.left + margin.right - 1) + "px")
            .style("height", "20px")
            .style("background-color", "#ffb300");

        var div = d3.select("#d3TreeMap").append("div")
            .style("position", "relative")
            .style("width", (width + margin.left + margin.right) + "px")
            .style("height", (height + margin.top + margin.bottom) + "px")
            .style("left", margin.left + "px")
            .style("top", margin.top + "px");

        update(root);

        // hook up the reset button
        $("#treemap-reset").click(function resetTreemap() {
            update(root);
        });

        function update(data) {
            current = data;

            // search for the new root
            treeSearch(data.name, 500);

            // breadcrumbs
            var crumbs = [];
            var temp = data;
            while (temp) {
                crumbs.push(temp);
                temp = temp.parent;
            }
            crumbs.reverse();
            breadcrumbs.html("");
            breadcrumbs.selectAll(".crumb")
                .data(crumbs)
                .enter()
                .append("span")
                .attr("class", "crumb")
                .attr("title", function (d) { return d.data.rank; })
                .html(function (d) { return "<span class='link'>" + d.name + "</span>"; })
                .on("click", function (d) {
                    logToGoogle("Multi Peptide", "Zoom", "Treemap", "Breadcrumb");
                    update(d);
                });

            var nodes = div.selectAll(".node")
                .data(treemap.nodes(data), function (d) {return d.id; });

            nodes.enter()
                .append("div")
                .attr("class", "node")
                .style("background", function (d) { return colorScale(d.data.rank); })
                .style("color", function (d) { return getReadableColorFor(colorScale(d.data.rank)); })
                .style("left", "0px")
                .style("top", "0px")
                .style("width", "0px")
                .style("height", "0px")
                .text(getTitle)
                .on("click", function (d) {
                    logToGoogle("Multi Peptide", "Zoom", "Treemap");
                    update(d);
                })
                .on("contextmenu", function (d) {
                    d3.event.preventDefault();
                    if (current.parent) {
                        update(current.parent);
                    }
                })
                .on("mouseover", function (d) { tooltipIn(d, tooltip, true); })
                .on("mousemove", function () { tooltipMove(tooltip); })
                .on("mouseout", function (d) { tooltipOut(tooltip); });

            nodes.order()
                .transition()
                .call(position);

            nodes.exit().remove();
        }

        function position() {
            this.style("left", function (d) { return d.x + "px"; })
                .style("top", function (d) { return d.y + "px"; })
                .style("width", function (d) { return Math.max(0, d.dx - 1) + "px"; })
                .style("height", function (d) { return Math.max(0, d.dy - 1) + "px"; });
        }
    }

    /**
     * Zoomable treeview, inspiration from
     * - http://bl.ocks.org/mbostock/4339083
     * - https://gist.github.com/robschmuecker/7880033
     * - http://www.brightpointinc.com/interactive/budget/index.html?source=d3js
     */
    function initTreeView(jsonData) {
        var margin = {top: 5, right: 5, bottom: 5, left: 60},
            width = 916 - margin.right - margin.left,
            height = 600 - margin.top - margin.bottom;

        var rightClicked,
            zoomEnd = 0,
            tooltipTimer;

        var i = 0,
            duration = 750,
            root;

        var tooltip = d3.select("body")
            .append("div")
            .attr("id", "treeview-tooltip")
            .attr("class", "tip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden");

        var tree = d3.layout.tree()
            .nodeSize([2, 105])
            .separation(function (a, b) {
                var width = (nodeSize(a) + nodeSize(b)),
                distance = width / 2 + 4;
                return (a.parent === b.parent) ? distance : distance + 4;
            });

        var diagonal = d3.svg.diagonal()
            .projection(function (d) { return [d.y, d.x]; });

        var widthScale = d3.scale.linear().range([2, 105]);

        // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
        var zoomListener = d3.behavior.zoom()
            .scaleExtent([0.1, 3])
            .on("zoom", zoom);

        var svg = d3.select("#d3TreeView").append("svg")
            .attr("version", "1.1")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("viewBox", "0 0 " + (width + margin.right + margin.left) + " " + (height + margin.top + margin.bottom))
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .call(zoomListener)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .append("g");

        // hook up the reset button
        $("#treeview-reset").click(function resetTreeview() {
            zoomListener.scale(1);
            rightClick(root);
        });

        draw(jsonData);

        function draw(data) {
            widthScale.domain([0, data.data.count]);

            root = data;
            root.x0 = height / 2;
            root.y0 = 0;

            // set everything visible
            function setVisible(d) {
                d.selected = true;
                if (d.children) {
                    d.children.forEach(setVisible);
                }
            }
            setVisible(root);

            // set colors
            function color(d, c) {
                if (c) {
                    d.color = c;
                } else if (d.name === "Bacteria") {
                    d.color = "#1f77b4"; // blue
                } else if (d.name === "Archaea") {
                    d.color = "#ff7f0e"; // orange
                } else if (d.name === "Eukaryota") {
                    d.color = "#2ca02c"; // green
                } else if (d.name === "Viruses") {
                    d.color = "#d6616b"; // red
                }
                if (d.children) {
                    d.children.forEach(function (node) { color(node, d.color); });
                }
            }
            root.children.forEach(function (node) { color(node); });

            // collapse everything
            function collapseAll(d) {
                if (d.children && d.children.length === 0) {
                    d.children = null;
                }
                if (d.children) {
                    d._children = d.children;
                    d._children.forEach(collapseAll);
                    d.children = null;
                }
            }
            collapseAll(root);
            expand(root);

            update(root);
            centerNode(root);
        }

        d3.select(self.frameElement).style("height", "800px");

        function update(source) {

            // Compute the new tree layout.
            var nodes = tree.nodes(root).reverse(),
                links = tree.links(nodes);

            // Normalize for fixed-depth.
            nodes.forEach(function (d) { d.y = d.depth * 180; });

            // Update the nodes
            var node = svg.selectAll("g.node")
                .data(nodes, function (d) { return d.id || (d.id = ++i); });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .style("cursor", "pointer")
                .attr("transform", function (d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                .on("click", click)
                .on("mouseover", tooltipIn)
                .on("mouseout", tooltipOut)
                .on("contextmenu", rightClick);

            nodeEnter.append("circle")
                .attr("r", 1e-6)
                .style("stroke-width", "1.5px")
                .style("stroke", function (d) {
                    if (d.selected) {
                        return d.color || "#aaa";
                    } else {
                        return "#aaa";
                    }
                })
                .style("fill", function (d) {
                    if (d.selected) {
                        return d._children ? d.color || "#aaa" : "#fff";
                    } else {
                        return "#aaa";
                    }

                });

            nodeEnter.append("text")
                .attr("x", function (d) { return d.children || d._children ? -10 : 10; })
                .attr("dy", ".35em")
                .attr("text-anchor", function (d) { return d.children || d._children ? "end" : "start"; })
                .text(function (d) { return d.name; })
                .style("font", "10px sans-serif")
                .style("fill-opacity", 1e-6);

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });

            nodeUpdate.select("circle")
                .attr("r", nodeSize)
                .style("fill-opacity", function (d) { return d._children ? 1 : 0; })
                .style("stroke", function (d) {
                    if (d.selected) {
                        return d.color || "#aaa";
                    } else {
                        return "#aaa";
                    }
                })
                .style("fill", function (d) {
                    if (d.selected) {
                        return d._children ? d.color || "#aaa" : "#fff";
                    } else {
                        return "#aaa";
                    }

                });

            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function (d) { return "translate(" + source.y + "," + source.x + ")"; })
                .remove();

            nodeExit.select("circle")
                .attr("r", 1e-6);

            nodeExit.select("text")
                .style("fill-opacity", 1e-6);

            // Update the links
            var link = svg.selectAll("path.link")
                .data(links, function (d) { return d.target.id; });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .style("fill", "none")
                .style("stroke-opacity", "0.5")
                .style("stroke-linecap", "round")
                .style("stroke", function (d) {
                    if (d.source.selected) {
                        return d.target.color;
                    } else {
                        return "#aaa";
                    }
                })
                .style("stroke-width", 1e-6)
                .attr("d", function (d) {
                    var o = {x: source.x0, y: source.y0};
                    return diagonal({source: o, target: o});
                });

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", diagonal)
                .style("stroke", function (d) {
                    if (d.source.selected) {
                        return d.target.color;
                    } else {
                        return "#aaa";
                    }
                })
                .style("stroke-width", function (d) {
                    if (d.source.selected) {
                        return widthScale(d.target.data.count) + "px";
                    } else {
                        return "4px";
                    }
                });

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .style("stroke-width", 1e-6)
                .attr("d", function (d) {
                    var o = {x: source.x, y: source.y};
                    return diagonal({source: o, target: o});
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        // Expands a node and its children
        function expand(d) {
            if (d._children) {
                d.children = d._children;
                d._children = null;
            }
            if (d.children) {
                d.children.forEach(function (c) {
                    if (c._children) {
                        c.children = c._children;
                        c._children = null;
                    }
                });
            }
        }

        // Collapses a node
        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            }
        }

        function nodeSize(d) {
            if (d.selected) {
                return widthScale(d.data.count) / 2;
            } else {
                return 2;
            }
        }

        // Toggle children on click.
        function click(d) {
            // check if click is triggered by panning on a node
            if (Date.now() - zoomEnd < 200) return;

            if (d.children) {
                collapse(d);
            } else {
                expand(d);
            }
            update(d);
            centerNode(d);
        }

        // Sets the width of the right clicked node to 100%
        function rightClick(d) {
            if (d === rightClicked && d !== root) {
                rightClick(root);
                return;
            }
            rightClicked = d;

            // set Selection properties
            setSelected(root, false);
            setSelected(d, true);

            // scale the lines
            widthScale.domain([0, d.data.count]);

            expand(d);

            // redraw
            if (d3.event !== null) {
                d3.event.preventDefault();
            }
            update(d);
            centerNode(d);

            function setSelected(d, value) {
                d.selected = value;
                if (d.children) {
                    d.children.forEach(function (c) {setSelected(c, value); });
                } else if (d._children) {
                    d._children.forEach(function (c) {setSelected(c, value); });
                }
            }
        }

        // Zoom function
        function zoom() {
            zoomEnd = Date.now();
            svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }

        // Center a node
        function centerNode(source) {
            var scale = zoomListener.scale(),
                x = -source.y0,
                y = -source.x0;
            x = x * scale + width / 4;
            y = y * scale + height / 2;
            svg.transition()
                .duration(duration)
                .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
            zoomListener.scale(scale);
            zoomListener.translate([x, y]);
        }

        // tooltip functions
        function tooltipIn(d) {
            var pos = getTooltipPosition();
            tooltip.html(getTooltipContent(d));
            tooltip.style("top", pos.top).style("left", pos.left);

            tooltipTimer = setTimeout(function () {
                tooltip.style("visibility", "visible");
            }, 1000);
        }
        function tooltipOut(d) {
            clearTimeout(tooltipTimer);
            tooltip.style("visibility", "hidden");
        }
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

    function initSunburst(data) {
        // add empty slices
        data.kids = addEmptyChildren(data.kids, data.data.self_count);

        var w = 730,   // width
            h = w,     // height
            r = w / 2, // radius
            p = 5,     // padding
            duration = 1000, // animation duration
            levels = 4, // levels to show

            // don't change these
            x = d3.scale.linear().range([0, 2 * Math.PI]), // use full circle
            y = d3.scale.linear().domain([0, 1]).range([0, r]),
            currentMaxLevel = 4,
            colors = ["#f9f0ab", "#e8e596", "#f0e2a3", "#ede487", "#efd580", "#f1cb82", "#f1c298", "#e8b598", "#d5dda1", "#c9d2b5", "#aec1ad", "#a7b8a8", "#b49a3d", "#b28647", "#a97d32", "#b68334", "#d6a680", "#dfad70", "#a2765d", "#9f6652", "#b9763f", "#bf6e5d", "#af643c", "#9b4c3f", "#72659d", "#8a6e9e", "#8f5c85", "#934b8b", "#9d4e87", "#92538c", "#8b6397", "#716084", "#2e6093", "#3a5988", "#4a5072", "#393e64", "#aaa1cc", "#e0b5c9", "#e098b0", "#ee82a2", "#ef91ac", "#eda994", "#eeb798", "#ecc099", "#f6d5aa", "#f0d48a", "#efd95f", "#eee469", "#dbdc7f", "#dfd961", "#ebe378", "#f5e351"],
            fixedColors = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5", "#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252", "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194", "#ce6dbd", "#de9ed6", "#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#e6550d", "#fd8d3c", "#fdae6b", "#fdd0a2", "#31a354", "#74c476", "#a1d99b", "#c7e9c0", "#756bb1", "#9e9ac8", "#bcbddc", "#dadaeb", "#636363", "#969696", "#bdbdbd", "#d9d9d9"],
            colorCounter = -1,
            useFixedColors = false;

        var div = d3.select("#sunburst");

        var vis = div.append("svg")
            .attr("version", "1.1")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("viewBox", "0 0 740 740")
            .attr("width", w + p * 2)
            .attr("height", h + p * 2)
            .attr("overflow", "hidden")
            .style("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif")
            .append("g")
            .attr("transform", "translate(" + (r + p) + "," + (r + p) + ")"); // set origin to radius center

        var tooltip = d3.select("body")
            .append("div")
            .attr("id", "sunburst-tooltip")
            .attr("class", "tip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden");

        var partition = d3.layout.partition()               // creates a new partition layout
            .sort(null)                                     // don't sort,  use tree traversal order
            .value(function (d) { return d.data.self_count; })    // set the size of the pieces
            .children(function (d) { return d.kids; });

        // calculate arcs out of partition coordinates
        var arc = d3.svg.arc()
            .startAngle(function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); }) // start between 0 and 2Pi
            .endAngle(function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); }) // stop between 0 and 2Pi
            .innerRadius(function (d) { return Math.max(0, d.y ? y(d.y) : d.y); }) // prevent y-calculation on 0
            .outerRadius(function (d) { return Math.max(0, y(d.y + d.dy)) + 1; });

        // run the partition layout
        var nodes = partition.nodes(data);

        var path = vis.selectAll("path").data(nodes);
        path.enter().append("path")                               // for every node, draw an arc
            .attr("id", function (d, i) { return "path-" + i; })  // id based on index
            .attr("d", arc)                                       // path data
            .attr("fill-rule", "evenodd")                         // fill rule
            .style("fill", colour)                                // call function for colour
            .on("click", click)                                   // call function on click
            .on("mouseover", function (d) {
                if (d.depth < currentMaxLevel && d.name !== "empty") {
                    tooltipIn(d, tooltip);
                }
            })
            .on("mousemove", function () { tooltipMove(tooltip); })
            .on("mouseout", function () { tooltipOut(tooltip); });

        // put labels on the nodes
        var text = vis.selectAll("text").data(nodes);

        var textEnter = text.enter().append("text")
            .style("fill", function (d) { return getReadableColorFor(colour(d)); })
            .style("fill-opacity", 0)
            .style("font-family", "font-family: Helvetica, 'Super Sans', sans-serif")
            .style("pointer-events", "none") // don't invoke mouse events
            .attr("dy", ".2em");

        textEnter.append("tspan")
            .attr("x", 0)
            .text(function (d) { return d.depth && d.name !== "empty" ? d.name.split(" ")[0] : ""; });

        textEnter.append("tspan")
            .attr("x", 0)
            .attr("dy", "1em")
            .text(function (d) { return d.depth && d.name !== "empty" ? d.name.split(" ")[1] || "" : ""; });

        textEnter.append("tspan")
            .attr("x", 0)
            .attr("dy", "1em")
            .text(function (d) { return d.depth && d.name !== "empty" ? d.name.split(" ")[2] || "" : ""; });

        textEnter.style("font-size", function (d) {
            return Math.min(((r / levels) / this.getComputedTextLength() * 10) + 1, 12) + "px";
        });

        // set up start levels
        setTimeout(function () {click(data); }, 1000);

        // hook up the swap colors checkbox
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
        $("#colorswap li").tooltip({placement : "right", container : "body"});
        $("#colorswap-checkbox").change(function () {
            useFixedColors = $(this).is(':checked');
            redrawColors();
        });

        // hook up the reset button
        $("#sunburst-reset").click(function resetSunburst() {
            click(data);
        });

        /**
         * redraws the colors of the sunburst
         */
        function redrawColors() {
            path.transition()
                .style("fill", colour);
            text.transition()
                .style("fill", function (d) { return getReadableColorFor(colour(d)); });
        }

        function click(d) {
            if (d.name === "empty") {
                return;
            }
            logToGoogle("Multi Peptide", "Zoom", "Sunburst");

            // set tree, but only after the animation
            treeSearch(d.name, duration);

            // perform animation
            currentMaxLevel = d.depth + levels;
            path.transition()
                .duration(duration)
                .attrTween("d", arcTween(d))
                .attr("fill-opacity", function (d) {
                    if (d.depth >= currentMaxLevel) {
                        return 0.2;
                    }
                    return 1;
                });

            // Somewhat of a hack as we rely on arcTween updating the scales.
            text
                .style("visibility", function (e) {
                    return isParentOf(d, e) ? null : d3.select(this).style("visibility");
                })
                .transition().duration(duration)
                .attrTween("text-anchor", function (d) {
                    return function () {
                        return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
                    };
                })
                .attrTween("transform", function (d) {
                    var multiline = (d.name || "").split(" ").length > 1;
                    return function () {
                        var angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
                            rotate = angle + (multiline ? -0.5 : 0);
                        return "rotate(" + rotate + ")translate(" + (y(d.y) + p) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
                    };
                })
                .style("fill-opacity", function (e) { return isParentOf(d, e) ? 1 : 1e-6; })
                .each("end", function (e) {
                    d3.select(this).style("visibility", isParentOf(d, e) ? null : "hidden");
                });
        }

        // Returns true is label must be drawn
        function isParentOf(p, c) {
            if (c.depth >= currentMaxLevel) {
                return false;
            }
            if (p === c) {
                return true;
            }
            if (p.children) {
                return p.children.some(function (d) {
                    return isParentOf(d, c);
                });
            }
            return false;
        }

        // Calculates the color of an arc based on the color of his children
        function colour(d) {
            if (d.name === "empty") {
                return "white";
            }
            if (useFixedColors) {
                switch (d.name) {
                case "Bacteria":
                    return fixedColors[0];
                case "Eukaryota":
                    return fixedColors[1];
                default:
                    return fixedColors[Math.abs(stringHash(d.name + " " + d.data.rank)) % fixedColors.length];
                }
            } else {
                if (d.children) {
                    var colours = d.children.map(colour),
                        a = d3.hsl(colours[0]),
                        b = d3.hsl(colours[1]),
                        singleChild = d.children.length === 1 || d.children[1].name === "empty";
                    // if we only have one child, return a slightly darker variant of the child color
                    if (singleChild) {
                        return d3.hsl(a.h, a.s, a.l * 0.98);
                    }
                    // if we have 2 kids or more, take the average of the first two kids
                    return d3.hsl((a.h + b.h) / 2, (a.s + b.s) / 2, (a.l + b.l) / 2);
                }
                // if we don't have kids, pick a new color
                if (!d.color) {
                    d.color = getColor();
                }
                return d.color;
            }
        }

        // Interpolate the scales!
        // Defines new scales based on the clicked item
        function arcTween(d) {
            var my = Math.min(maxY(d), d.y + levels * d.dy),
                xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
                yd = d3.interpolate(y.domain(), [d.y, my]),
                yr = d3.interpolate(y.range(), [d.y ? 20 : 0, r]);
            return function (d) {
                return function (t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
            };
        }

        // calculate the max-y of the clicked item
        function maxY(d) {
            return d.children ? Math.max.apply(Math, d.children.map(maxY)) : d.y + d.dy;
        }

        // color generation function
        // iterates over fixed list of colors
        function getColor() {
            colorCounter = (colorCounter + 1) % 52;
            return colors[colorCounter];
        }

        function addEmptyChildren(kids, count) {
            var i;
            for (i = 0; i < kids.length; i++) {
                if (typeof kids[i].kids !== "undefined") {
                    kids[i].kids = addEmptyChildren(kids[i].kids, kids[i].data.self_count);
                }
            }
            if (kids.length > 0 && count !== 0 && count !== undefined) {
                kids.push({id: -1, name: "empty", data: {count: count, self_count: count}});
            }
            return kids;
        }
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