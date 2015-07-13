/**
 * Constructs a Treeview object that represents the treeview visualisation
 * inspiration from
 * - http://bl.ocks.org/mbostock/4339083
 * - https://gist.github.com/robschmuecker/7880033
 * - http://www.brightpointinc.com/interactive/budget/index.html?source=d3js
 *
 * @return <Treeview> that The constructed Treeview object
 */
var constructTreeview = function constructTreeview(args) {
    /*************** Private variables ***************/

    // parameters
    var that = {},
        multi = args.multi,
        data = args.data;

    // settings
    var margin = {top: 5, right: 5, bottom: 5, left: 60},
        width = 916 - margin.right - margin.left,
        height = 600 - margin.top - margin.bottom;

    var rightClicked,
        zoomEnd = 0,
        tooltipTimer;

    var i = 0,
        duration = 750,
        root,
        tooltip = d3.select("#tooltip"),
        tree,
        diagonal,
        widthScale,
        zoomListener,
        svg;

    /*************** Private methods ***************/

    /**
     * Initializes Treeview
     */
    function init() {
        // init controls
        initControls();

        // draw everything
        redraw();
        draw(data);
        d3.select(self.frameElement).style("height", "800px");
    }

    /**
     * Initialise the controls
     */
    function initControls() {
        // hook up the reset button
        $("#treeview-reset").click(that.reset);
    }

    /**
     * Redraws the treeview graph
     */
    function redraw() {
        // reset
        $("#d3TreeView").empty();

        tree = d3.layout.tree()
            .nodeSize([2, 105])
            .separation(function (a, b) {
                var width = (nodeSize(a) + nodeSize(b)),
                distance = width / 2 + 4;
                return (a.parent === b.parent) ? distance : distance + 4;
            });

        diagonal = d3.svg.diagonal()
            .projection(function (d) { return [d.y, d.x]; });

        widthScale = d3.scale.linear().range([2, 105]);

        // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
        zoomListener = d3.behavior.zoom()
            .scaleExtent([0.1, 3])
            .on("zoom", zoom);

        svg = d3.select("#d3TreeView").append("svg")
            .attr("version", "1.1")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("viewBox", "0 0 " + (width + margin.right + margin.left) + " " + (height + margin.top + margin.bottom))
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .call(zoomListener)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .append("g");
    }

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

        that.update(root);
        centerNode(root);
    }

    // expands all children of a node
    function expandAll(d) {
        expand(d, 30);
    }

    // Expands a node for i levels
    function expand(d, i) {
        var local_i = i;
        if (typeof local_i === "undefined") {
            local_i = 2;
        }
        if (local_i > 0) {
            if (d._children) {
                d.children = d._children;
                d._children = null;
            }
            if (d.children) {
                d.children.forEach(function (c) {expand(c, local_i - 1); });
            }
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

        if (d3.event.shiftKey) {
            expandAll(d);
        } else if (d.children) {
            collapse(d);
        } else {
            expand(d);
        }

        that.update(d);
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
        that.update(d);
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
        var pos = multi.getTooltipPosition();
        tooltip.html(multi.getTooltipContent(d));
        tooltip.style("top", pos.top).style("left", pos.left);

        tooltipTimer = setTimeout(function () {
            tooltip.style("visibility", "visible");
        }, 1000);
    }
    function tooltipOut(d) {
        clearTimeout(tooltipTimer);
        tooltip.style("visibility", "hidden");
    }

    /*************** Public methods ***************/

    /**
     * updates the visualisation
     */
    that.update = function update(source) {

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
    };

    /**
     * Resets the treeview to its initial position
     */
    that.reset = function reset() {
        zoomListener.scale(1);
        rightClick(root);
    };

    /**
     * Sets the visualisation in full screen mode
     *
     * @param <boolean> isFullScreen indicates if we're in full screen mode
     */
    that.setFullScreen = function setFullScreen(isFullScreen) {
        // the delay is because the event fires before we're in fullscreen
        // so the height en width functions don't give a correct result
        // without the delay
        setTimeout(function () {
            var width = 916,
            height = 600;
            if (isFullScreen) {
                width = $(window).width();
                height = $(window).height() - 44;
            }
            $("#d3TreeView svg").attr("width", width);
            $("#d3TreeView svg").attr("height", height);
        }, 1000);
    };

    // initialize the object
    init();

    return that;
};
