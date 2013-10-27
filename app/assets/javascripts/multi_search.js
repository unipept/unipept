function init_multi(data, data2, equate_il) {

    $("#downloadDataset").click(function () {
        // Track the download button
        _gaq.push(['_trackEvent', 'Multi Peptide', 'Export']);

        $("#downloadDataset").button('loading');
        return true;
    });

    // sunburst
    try {
        initSunburst(data2);
    } catch (err) {
        error(err, "Loading the Sunburst visualization failed. Please use Google Chrome, Firefox or Internet Explorer 9 or higher.");
    }

    // treemap
    try {
        initTreeMap(data);
        $("#treeMapWrapper").removeClass("active");
    } catch (err) {
        error(err, "Loading the Treemap visualization failed. Please use Google Chrome, Firefox or Internet Explorer 9 or higher.");
    }

    // jstree
    try {
        initJsTree(data, equate_il);
    } catch (err) {
        error(err, "Loading the Hierarchical outline failed. Please use Google Chrome, Firefox or Internet Explorer 9 or higher.");
    }

    // set up the fullscreen stuff
    if (fullScreenApi.supportsFullScreen) {
        $("#buttons").prepend("<button id='zoom-btn' class='btn btn-mini'><i class='icon-resize-full'></i> Enter full screen</button>");
        $("#zoom-btn").click(function () {
            if ($(".tab-content .active").attr('id') === "sunburstWrapper") {
                // GA event tracking
                _gaq.push(['_trackEvent', 'Multi Peptide', 'Full Screen', 'Sunburst']);
                window.fullScreenApi.requestFullScreen($("#sunburst").get(0));
            } else {
                // GA event tracking
                _gaq.push(['_trackEvent', 'Multi Peptide', 'Full Screen', 'Treemap']);
                window.fullScreenApi.requestFullScreen($("#treeMap").get(0));
            }
        });
        $(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', resizeFullScreen);
    }

    function resizeFullScreen() {
        if ($(".tab-content .active").attr('id') === "sunburstWrapper") {
            setTimeout(function () {
                var size = 740;
                if (window.fullScreenApi.isFullScreen()) {
                    size = Math.min($(window).height(), $(window).width());
                }
                $("#sunburst svg").attr("width", size);
                $("#sunburst svg").attr("height", size);
            }, 1000);
        } else {
            window.tm.canvas.resize($("#treeMap").width(), $("#treeMap").height());
        }
    }

    // set up save image stuff
    $("#buttons").prepend("<button id='save-btn' class='btn btn-mini'><i class='icon-download'></i> Save as image</button>");
    $("#save-btn").click(function () {
        $(".debug_dump").hide();
        if ($(".tab-content .active").attr('id') === "sunburstWrapper") {
            // Track save image
            _gaq.push(['_trackEvent', 'Multi Peptide', 'Save Image', 'Sunburst']);

            var svg = $("#sunburst svg").wrap("<div></div>").parent().html();
            $.post("/convert", { image: svg }, function (data) {
                $("#save-as-modal .modal-body").html("<img src='" + data + "' />");
                $("#save-as-modal").modal();
            });
        } else {
            // Track save image
            _gaq.push(['_trackEvent', 'Multi Peptide', 'Save Image', 'Treemap']);

            html2canvas($("#treeMap"), {
                onrendered : function (canvas) {
                    $("#save-as-modal .modal-body").html("<img src='" + canvas.toDataURL() + "' />");
                    $("#save-as-modal").modal();
                }
            });
        }
    });
}

function initTreeMap(jsonData) {
    // init TreeMap
    var tm = new $jit.TM.Squarified({
        // where to inject the visualization
        injectInto: 'treeMap',
        // parent box title heights
        titleHeight: 15,
        // enable animations
        animate: true,
        // box offsets
        offset: 0,
        // constrained: true,
        // levelsToShow: 1,
        // Attach left and right click events
        Events: {
            enable: true,
            onClick: function (node) {
                if (node) {
                    // GA event tracking
                    _gaq.push(['_trackEvent', 'Multi Peptide', 'Zoom', 'Treemap', 'In']);
                    tm.enter(node);
                    jsTreeSearch(node.name, 500);
                }
            },
            onRightClick: function () {
                // GA event tracking
                _gaq.push(['_trackEvent', 'Multi Peptide', 'Zoom', 'Treemap', 'Out']);
                // TODO: replace this if bug in JIT gets fixed
                tm.out();
            }
        },
        duration: 500,
        // Enable tips
        Tips: {
            enable: true,
            // add positioning offsets
            offsetX: 20,
            offsetY: 20,
            // implement the onShow method to add content
            // to the tooltip when a node is hovered
            onShow: function (tip, node, isLeaf, domElement) {
                tip.innerHTML = "<div class='tip-title'><b>" + node.name + "</b> (" + node.data.rank + ")</div><div class='tip-text'>" +
                    (!node.data.self_count ? "0" : node.data.self_count) +
                    (node.data.self_count && node.data.self_count === 1 ? " sequence" : " sequences") + " specific to this level<br/>" +
                    (!node.data.count ? "0" : node.data.count) +
                    (node.data.count && node.data.count === 1 ? " sequence" : " sequences") + " specific to this level or lower<br/>" +
                    (typeof node.data.piecharturl == "undefined" ? "" : "<img src='" + node.data.piecharturl + "'/>") + "</div>";
            }
        },

        // Add the name of the node in the correponding label
        // This method is called once, on label creation.
        onCreateLabel: function (domElement, node) {
            domElement.innerHTML = node.name + " (" + (!node.data.self_count ? "0" : node.data.self_count) + "/" + (!node.data.count ? "0" : node.data.count) + ")";
            var style = domElement.style;
            style.display = '';
            style.border = '2px solid transparent';
            style.color = getReadableColorFor(node.data.$color);

            domElement.onmouseover = function () {
                style.border = '2px solid #9FD4FF';
            };
            domElement.onmouseout = function () {
                style.border = '2px solid transparent';
            };
        }
    });
    tm.loadJSON(jsonData);
    tm.refresh();

    // move the tooltip div to allow full screen tooltips
    $("#_tooltip").appendTo("#treeMap");

    window.tm = tm;
}

function initJsTree(data, equate_il) {
    // set themes dir
    $.jstree._themes = "/jstree/themes/";

    equate_il = equate_il ? "equateIL" : "";

    // add onSelect action
    $("#jstree").bind("select_node.jstree",
        function (node, tree) {
            // GA event tracking
            _gaq.push(['_trackEvent', 'Multi Peptide', 'JsTree', 'Peptides']);

            var peptides  = $(tree.rslt.obj).data(),
                margin    = tree.rslt.obj.context.offsetTop - $("#jstree").offset().top - 9,
                innertext = "<a href='http:// www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=" + peptides.id + "' target='_blank'>" + $.trim($(tree.rslt.obj).find("a").text().split("(")[0]) + "</a>",
                infoPane,
                ownSequences,
                list,
                peptide,
                allSequences;
            innertext += " (" + $(tree.rslt.obj).attr("title") + ")";
            infoPane = $("#jstree_data").html("<h3>" + innertext + "</h3>");
            $("#jstree_data").css("-webkit-transform", "translateY(" + margin + "px)");
            $("#jstree_data").css("transform", "translateY(" + margin + "px)");
            ownSequences = peptides.own_sequences;
            if (ownSequences && ownSequences.length > 0) {
                list = infoPane.append("<h4>Peptides specific for this taxon</h4><ul></ul>").find("ul").last();
                for (peptide in ownSequences) {
                    list.append("<li><a href='/sequences/" + ownSequences[peptide] + "/" + equate_il + "' target='_blank'>" + ownSequences[peptide] + "</a></li>");
                }
            }
            allSequences = peptides.all_sequences;
            if (allSequences && allSequences.length > 0 && allSequences.length !== (ownSequences ? ownSequences.length : 0)) {
                list = infoPane.append("<h4>Peptides specific to this taxon or one of its subtaxa</h4><ul></ul>").find("ul").last();
                for (peptide in allSequences) {
                    list.append("<li><a href='/sequences/" + allSequences[peptide] + "/" + equate_il + "' target='_blank'>" + allSequences[peptide] + "</a></li>");
                }
            }
        });

    // fix leafs
    $("#jstree").bind("loaded.jstree", function (event, data) {
        $("#jstree li").not(":has(li)").addClass("jstree-leaf");
    });

    // add search
    $("#jstree_search").keyup(function () {
        $("#jstree").jstree("search", ($(this).val()));
        $(".jstree-search").parent().find("li").show();
        $("#jstree ul").each(function () {
            $(this).children("li:visible").eq(-1).addClass("jstree-last");
        });
    });
    $('#jstree_search').click(function () {
        $(this).keyup();
    });
    $('#jstree_search').change(function () {
        $(this).keyup();
    });

    // create the tree
    $("#jstree").jstree({
        core: {
            "animation": 300
        },
        plugins: ["themes", "json_data", "ui", "search"],
        json_data: {
            "data": data
        },
        themes: {
            "icons": false
        },
        ui: {
            "select_limit": 1
        },
        search: {
            "show_only_matches": true
        }
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
        colorCounter = -1;

    var div = d3.select("#sunburst");

    var vis = div.append("svg")
        .attr("viewBox", "0 0 740 740")
        .attr("width", w + p * 2)
        .attr("height", h + p * 2)
        .attr("overflow", "hidden")
        .style("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif")
        .append("g")
        .attr("transform", "translate(" + (r + p) + "," + (r + p) + ")"); // set origin to radius center

    var tooltip = d3.select("#sunburst")
        .append("div")
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
        .on("mouseover", tooltipIn)
        .on("mousemove", tooltipMove)
        .on("mouseout", tooltipOut);

    // put labels on the nodes
    var text = vis.selectAll("text").data(nodes);

    var textEnter = text.enter().append("text")
        .style("fill", function (d) { return getReadableColorFor(colour(d)); })
        .style("font-family", "font-family: Helvetica, 'Super Sans', sans-serif")
        .style("pointer-events", "none") // don't invoke mouse events
        .attr("dy", ".2em");

    textEnter.append("tspan")
        .attr("x", 0)
        .text(function (d) { return d.depth ? d.name.split(" ")[0] : ""; });

    textEnter.append("tspan")
        .attr("x", 0)
        .attr("dy", "1em")
        .text(function (d) { return d.depth ? d.name.split(" ")[1] || "" : ""; });

    textEnter.append("tspan")
        .attr("x", 0)
        .attr("dy", "1em")
        .text(function (d) { return d.depth ? d.name.split(" ")[2] || "" : ""; });

    textEnter.style("font-size", function (d) {
        return Math.min(((r / levels) / this.getComputedTextLength() * 10) + 1, 12) + "px";
    });

    // set up start levels
    setTimeout(function () {click(data); }, 1000);

    function click(d) {
        // GA event tracking
        _gaq.push(['_trackEvent', 'Multi Peptide', 'Zoom', 'Sunburst']);

        // set jstree, but only after the animation
        jsTreeSearch(d.name, duration);

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
        if (d.children) {
            var colours = d.children.map(colour),
                a = d3.hsl(colours[0]),
                b = d3.hsl(colours[1]);
            // if we only have one child, return a slightly darker variant of the child color
            if (!colours[1]) {
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

    // tooltip functions
    function tooltipIn(d, i) {
        if (d.depth < currentMaxLevel) {
            tooltip.style("visibility", "visible")
                .html("<b>" + d.name + "</b> (" + d.attr.title + ")<br/>" +
                    (!d.data.self_count ? "0" : d.data.self_count) +
                    (d.data.self_count && d.data.self_count === 1 ? " sequence" : " sequences") + " specific to this level<br/>" +
                    (!d.data.count ? "0" : d.data.count) +
                    (d.data.count && d.data.count === 1 ? " sequence" : " sequences") + " specific to this level or lower");
            // vis.selectAll("#path-" + i).transition().duration(200).style("fill-opacity","0.9");
        }
    }
    function tooltipMove() {
        if (window.fullScreenApi.isFullScreen()) {
            tooltip.style("top", (d3.event.clientY - 5) + "px").style("left", (d3.event.clientX + 15) + "px");
        } else {
            tooltip.style("top", (d3.event.pageY - 5) + "px").style("left", (d3.event.pageX + 15) + "px");
        }
    }
    function tooltipOut(d, i) {
        tooltip.style("visibility", "hidden");
        // vis.selectAll("#path-" + i).transition().duration(200).style("fill-opacity","1");
    }

    function addEmptyChildren(kids, count) {
        var i;
        for (i = 0; i < kids.length; i++) {
            if (typeof kids[i].kids !== "undefined") {
                kids[i].kids = addEmptyChildren(kids[i].kids, kids[i].data.self_count);
            }
        }
        if (count !== 0) {
            kids.push({id: -1, name: "empty", data: {count: count, self_count: count}});
        }
        return kids;
    }
}

// Enters the given string in the search box
// Highlights the field
// filters the jstree after the given number of ms
function jsTreeSearch(searchTerm, duration) {
    if (searchTerm === "organism") {
        searchTerm = "";
    }
    var timeout = duration || 0;
    $("#jstree_search").val(searchTerm);
    highlight("#jstree_search");
    setTimeout(function () { $("#jstree_search").change(); }, timeout);
}