function init_multi(data, data2, equate_il) {

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

    // sunburst
    try {
        initSunburst(data2);
    } catch (err) {
        error(err.message, "Loading the Sunburst visualization failed. Please use Google Chrome, Firefox or Internet Explorer 9 or higher.");
    }

    // treemap
    try {
        initTreeMap(data);
        $("#treeMapWrapper").removeClass("active");
    } catch (err) {
        error(err.message, "Loading the Treemap visualization failed. Please use Google Chrome, Firefox or Internet Explorer 9 or higher.");
    }

    // treeview
    try {
        initTreeView(data);
        $("#jitTreeViewWrapper").removeClass("active");
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
            } else {
                logToGoogle("Multi Peptide", "Full Screen", "Treemap");
                window.fullScreenApi.requestFullScreen($("#treeMap").get(0));
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
        } else {
            var destination = "body";
            if (window.fullScreenApi.isFullScreen()) {
                destination = "#treeMap";
            }
            $("#_tooltip").appendTo(destination);
            window.tm.canvas.resize($("#treeMap").width(), $("#treeMap").height());

        }
    }

    // set up save image stuff
    $("#buttons").prepend("<button id='save-btn' class='btn btn-default btn-xs'><span class='glyphicon glyphicon-download'></span> Save as image</button>");
    $("#save-btn").click(function () {
        $(".debug_dump").hide();
        if ($(".tab-content .active").attr('id') === "sunburstWrapper") {
            // Track save image
            logToGoogle("Multi Peptide", "Save Image", "Sunburst");

            triggerDownloadModal("#sunburst svg", null, "unipept_sunburst");
        } else {
            // Track save image
            logToGoogle("Multi Peptide", "Save Image", "Treemap");

            triggerDownloadModal(null, "#treeMap", "unipept_treemap");
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
                    logToGoogle("Multi Peptide", "Zoom", "Treemap", "In");
                    tm.enter(node);
                    treeSearch(node.name, 500);
                }
            },
            onRightClick: function () {
                    logToGoogle("Multi Peptide", "Zoom", "Treemap", "Out");
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

    window.tm = tm;

    function createLabel(domElement, node) {

    }
}

function initTreeView(jsonData) {
    var labelType,
        useGradients,
        nativeTextSupport,
        animate;

    (function () {
        var ua = navigator.userAgent,
            iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
            typeOfCanvas = typeof HTMLCanvasElement,
            nativeCanvasSupport = (typeOfCanvas === 'object' || typeOfCanvas === 'function'),
            textSupport = nativeCanvasSupport && (typeof document.createElement('canvas').getContext('2d').fillText === 'function');
        // I'm setting this based on the fact that ExCanvas provides text support for IE
        // and that as of today iPhone/iPad current text support is lame
        labelType = (!nativeCanvasSupport || (textSupport && !iStuff)) ? 'Native' : 'HTML';
        nativeTextSupport = labelType === 'Native';
        useGradients = nativeCanvasSupport;
        animate = !(iStuff || !nativeCanvasSupport);
    }());

    var st = new $jit.ST({
        injectInto: 'jitTreeView',
        // id of viz container element
        duration: 800,
        // set duration for the animation
        transition: $jit.Trans.Quart.easeInOut,
        // set animation transition type
        levelDistance: 50,
        // set distance between node and its children
        levelsToShow: 4,
        // offsetY: 170,
        // orientation: 'top',
        offsetX: 350,

        // enable panning
        Navigation: {
            enable: true,
            panning: true
        },

        // set node and edge styles
        Node: {
            autoHeight: true,
            // autoWidth: true,
            width: 100,
            // also change the CSS .node property if you change this!
            type: 'rectangle',
            color: '#DCDFE4',
            overridable: true,
            align: 'center'
        },

        Label: {
            type: 'Native'
        },

        Edge: {
            type: 'bezier',
            color: '#DCDFE4',
            overridable: true
        },

        // This method is called on DOM label creation.
        // Use this method to add event handlers and styles to
        // your node.
        /*onCreateLabel: function (label, node) {
            console.log(node);
            label.id = node.id;
            label.innerHTML = node.name;
            label.onclick = function () {
                st.onClick(node.id);
                // st.setRoot(node.id, 'animate');
            };
            // set label styles => TODO: fix the labels with these settings instead of CSS
            var style = label.style;
            style.width = '60px';
            style.height = '17px';
            style.cursor = 'pointer';
            style.color = '#333';
            style.fontSize = '0.8em';
            style.textAlign = 'center';
            style.paddingTop = '3px';
        },*/

        // This method is called right before plotting
        // a node. It's useful for changing an individual node
        // style properties before plotting it.
        // The data properties prefixed with a dollar
        // sign will override the global node style properties.
        onBeforePlotNode: function (node) {
            // add some color to the nodes in the path between the
            // root node and the selected node.
            if (node.selected) {
                node.data.$color = "#bbb";
            }
            else {
                delete node.data.$color;
                // if the node belongs to the last plotted level
                /*if(!node.anySubnode("exist")) {
                    // count children number
                    var count = 0;
                    node.eachSubnode(function(n) { count++; });
                    // assign a node color based on
                    // how many children it has
                    node.data.$color = ['#aaa', '#baa', '#caa', '#daa', '#eaa', '#faa'][count];
                }*/
            }
        }

        // This method is called right before plotting
        // an edge. It's useful for changing an individual edge
        // style properties before plotting it.
        // Edge data proprties prefixed with a dollar sign will
        // override the Edge global style properties.
        /*onBeforePlotLine: function (adj) {
            if (adj.nodeFrom.selected && adj.nodeTo.selected) {
                adj.data.$color = "#eed";
                adj.data.$lineWidth = 3;
            } else {
                delete adj.data.$color;
                delete adj.data.$lineWidth;
            }
        }*/
    });
    // load json data
    st.loadJSON(jsonData);

    // compute node positions and layout
    st.compute();

    // optional: make a translation of the tree
    st.geom.translate(new $jit.Complex(-200, 0), "current");

    st.onClick(st.root);
}

function initTree(data, equate_il) {
    var equate_il = equate_il ? "equateIL" : "",
        tree,
        item,
        i;

    // Add the nested unordered lists to the page based on the data array
    tree = d3.select("#treeView");
    tree = tree.append("ul").append("li").attr("class", "root not").append("ul");
    //$("li.root").prepend($("#treeSearchDiv"));
    items = tree.selectAll("li").data([data])
        .enter()
        .append("li")
            .html(function (d) { return "<span>" + d.data.title + "</span>"; })
            .attr("title", function (d) { return d.data.rank; })
            .attr("class", "collapsibleListOpen")
            .attr("data-search", function (d) { return d.name.toLowerCase(); })
        .append("ul");
    for (i = 0; i < 28; i++) {
        items = items.selectAll("li").data(function (d) { return d.children; })
            .enter()
            .append("li")
                .html(function (d) { return "<span>" + d.data.title + "</span>"; })
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
        ownSequences = d.data.own_sequences;
        if (ownSequences && ownSequences.length > 0) {
            list = infoPane.append("<h4>Peptides specific for this taxon</h4><ul></ul>").find("ul").last();
            for (peptide in ownSequences) {
                list.append("<li><a href='/sequences/" + ownSequences[peptide] + "/" + equate_il + "' target='_blank'>" + ownSequences[peptide] + "</a></li>");
            }
        }
        allSequences = d.data.all_sequences;
        if (allSequences && allSequences.length > 0 && allSequences.length !== (ownSequences ? ownSequences.length : 0)) {
            list = infoPane.append("<h4>Peptides specific to this taxon or one of its subtaxa</h4><ul></ul>").find("ul").last();
            for (peptide in allSequences) {
                list.append("<li><a href='/sequences/" + allSequences[peptide] + "/" + equate_il + "' target='_blank'>" + allSequences[peptide] + "</a></li>");
            }
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
        .on("mouseover", tooltipIn)
        .on("mousemove", tooltipMove)
        .on("mouseout", tooltipOut);

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
    $("#colorswap-checkbox").change(function (){
        useFixedColors = $(this).is(':checked');
        redrawColors();
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
        if ( d.name === "empty") {
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

    // tooltip functions
    function tooltipIn(d, i) {
        if (d.depth < currentMaxLevel && d.name !== "empty") {
            tooltip.style("visibility", "visible")
                .html("<b>" + d.name + "</b> (" + d.data.rank + ")<br/>" +
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
        if (kids.length > 0 && count !== 0 && count !== undefined) {
            kids.push({id: -1, name: "empty", data: {count: count, self_count: count}});
        }
        return kids;
    }
}

// Enters the given string in the search box
// Highlights the field
// filters the tree after the given number of ms
function treeSearch(searchTerm, duration) {
    if (searchTerm === "organism") {
        searchTerm = "";
    }
    var timeout = duration || 0;
    $("#tree_search").val(searchTerm);
    highlight("#tree_search");
    setTimeout(function () { $("#tree_search").change(); }, timeout);
}