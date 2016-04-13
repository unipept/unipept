/**
 * Zoomable treeview, inspiration from
 * - http://bl.ocks.org/mbostock/4339083
 * - https://gist.github.com/robschmuecker/7880033
 * - http://www.brightpointinc.com/interactive/budget/index.html?source=d3js
 */
(function () {
    var TreeView = function TreeView(element, options) {
        var that = {};

        var margin,
            width,
            height;

        var rightClicked,
            tooltipTimer;

        var nodeId = 0,
            duration = 750,
            root;

        var tree,
            tooltip,
            numberFormat,
            diagonal,
            widthScale,
            arcScale,
            innerArc,
            zoomListener,
            svg;

        function init() {
            // init controls
            initControls();

            margin = {
                top: 5,
                right: 5,
                bottom: 5,
                left: 5
            };
            width = options.width - margin.right - margin.left;
            height = options.height - margin.top - margin.bottom;

            numberFormat = d3.format(",d");

            tooltip = d3.select("body")
                .append("div")
                .attr("id", element.id + "-tooltip")
                .attr("class", "tip")
                .style("position", "absolute")
                .style("z-index", "10")
                .style("visibility", "hidden");

            tree = d3.layout.tree()
                .nodeSize([2, 10])
                .separation(function (a, b) {
                    var width = (nodeSize(a) + nodeSize(b)),
                        distance = width / 2 + 4;
                    return (a.parent === b.parent) ? distance : distance + 4;
                });

            diagonal = d3.svg.diagonal()
                .projection(function (d) {
                    return [d.y, d.x];
                });

            widthScale = d3.scale.linear().range([2, 105]);
            arcScale = d3.scale.linear().range([0, 2 * Math.PI]);

            innerArc = d3.svg.arc()
                .outerRadius(nodeSize)
                .startAngle(0)
                .endAngle(arcSize);

            // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
            zoomListener = d3.behavior.zoom()
                .scaleExtent([0.1, 3])
                .on("zoom", zoom);

            svg = d3.select(element).append("svg")
                .attr("version", "1.1")
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .attr("viewBox", "0 0 " + (width + margin.right + margin.left) + " " + (height + margin.top + margin.bottom))
                .attr("width", width + margin.right + margin.left)
                .attr("height", height + margin.top + margin.bottom)
                .call(zoomListener)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .append("g");

            draw(options.data);
        }

        /**
         * Initialise the controls
         */
        function initControls() {
            // hook up the reset button
            $("#treeview-reset").click(that.reset);
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
            function color(d, i, c) {
                if (c) {
                    d.color = c;
                } else {
                    d.color = d3.functor(options.colors).call(this, d, i);
                }
                if (d.children) {
                    d.children.forEach(function (node) {
                        color(node, i, d.color);
                    });
                }
            }
            root.children.forEach(function (node, i) {
                color(node, i);
            });

            var LCA;

            function findLCA(d) {
                if (d.children && d.children.length === 1) {
                    findLCA(d.children[0]);
                } else {
                    LCA = d;
                }
            }
            findLCA(root);

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

            collapseAll(LCA);
            update(root);
            rightClick(LCA);

        }
        d3.select(self.frameElement).style("height", "800px");

        function update(source) {

            // Compute the new tree layout.
            var nodes = tree.nodes(root).reverse(),
                links = tree.links(nodes);

            // Normalize for fixed-depth.
            nodes.forEach(function (d) {
                d.y = d.depth * 180;
            });

            // Update the nodes…
            var node = svg.selectAll("g.node")
                .data(nodes, function (d) {
                    return d.id || (d.id = ++nodeId);
                });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .style("cursor", "pointer")
                .attr("transform", function (d) {
                    return "translate(" + (source.y || 0) + "," + (source.x0 || 0) + ")";
                })
                .on("click", click)
                .on("mouseover", tooltipIn)
                .on("mouseout", tooltipOut)
                .on("contextmenu", rightClick);

            nodeEnter.append("circle")
                .attr("r", 1e-6)
                .style("stroke-width", "1.5px")
                .style("stroke", options.nodeStrokeColor)
                .style("fill", options.nodeFillColor);

            nodeEnter.append("path")
                .attr("d", innerArc)
                .style("fill", options.nodeStrokeColor)
                .style("fill-opacity", 0);

            nodeEnter.append("text")
                .attr("x", function (d) {
                    return isLeaf(d) ? -10 : 10;
                })
                .attr("dy", ".35em")
                .attr("text-anchor", function (d) {
                    return isLeaf(d) ? "end" : "start";
                })
                .text(function (d) {
                    return d.name.length > 27 && d._children || d.children ? d.name.substring(0,30)+"..." : d.name;
                })
                .style("font", "10px sans-serif")
                .style("fill-opacity", 1e-6);

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

            nodeUpdate.select("circle")
                .attr("r", nodeSize)
                .style("fill-opacity", function (d) {
                    return d._children ? 1 : 0;
                })
                .style("stroke", options.nodeStrokeColor)
                .style("fill", options.nodeFillColor);

            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            nodeUpdate.select("path")
                .duration(duration)
                .attr("d", innerArc)
                .style("fill-opacity", 0.8);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + source.y + "," + source.x + ")";
                })
                .remove();

            nodeExit.select("circle")
                .attr("r", 1e-6);

            nodeExit.select("path")
                .style("fill-opacity", 1e-6);

            nodeExit.select("text")
                .style("fill-opacity", 1e-6);

            // Update the links…
            var link = svg.selectAll("path.link")
                .data(links, function (d) {
                    return d.target.id;
                });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .style("fill", "none")
                .style("stroke-opacity", "0.5")
                .style("stroke-linecap", "round")
                .style("stroke", options.linkStrokeColor)
                .style("stroke-width", 1e-6)
                .attr("d", function (d) {
                    var o = {
                        x: (source.x0 || 0),
                        y: (source.y0 || 0)
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                });

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", diagonal)
                .style("stroke", options.linkStrokeColor)
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
                    var o = {
                        x: source.x,
                        y: source.y
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        function nodeSize(d) {
            if (d.selected) {
                return widthScale(d.data.count) / 2;
            } else {
                return 2;
            }
        }

        function arcSize(d) {
            return arcScale(d.data.self_count / d.data.count) || 0;
        }

        // Returns true if a node is a leaf
        function isLeaf(d) {
            return d.children || d._children;
        }

        function expandAll(d) {
            expand(d, 30);
        }

        // Expands a node and its children
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
                    d.children.forEach(function (c) {
                        expand(c, local_i - 1);
                    });
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

        // Toggle children on click.
        function click(d) {
            // check if click is triggered by panning on a node
            if (d3.event.defaultPrevented) {
                return;
            }

            if (d3.event.shiftKey) {
                expandAll(d);
            } else if (d.children) {
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
                    d.children.forEach(function (c) {
                        setSelected(c, value);
                    });
                } else if (d._children) {
                    d._children.forEach(function (c) {
                        setSelected(c, value);
                    });
                }
            }
        }

        // Zoom function
        function zoom() {
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
        function tooltipIn(d, i) {
            tooltip.html("<b>" + d.name + "</b> (" + d.data.rank + ")<br/>" +
                numberFormat(!d.data.self_count ? "0" : d.data.self_count) +
                (d.data.self_count && d.data.self_count === 1 ? " sequence" : " sequences") + " specific to this level<br/>" +
                numberFormat(!d.data.count ? "0" : d.data.count) +
                (d.data.count && d.data.count === 1 ? " sequence" : " sequences") + " specific to this level or lower");
            tooltip.style("top", (d3.event.pageY - 5) + "px").style("left", (d3.event.pageX + 15) + "px");

            tooltipTimer = setTimeout(function () {
                tooltip.style("visibility", "visible");
            }, 1000);

        }

        function tooltipOut(d, i) {
            clearTimeout(tooltipTimer);
            tooltip.style("visibility", "hidden");
        }

        /*************** Public methods ***************/
        that.reset = function reset() {
            zoomListener.scale(1);
            rightClick(root);
        };

        // initialize the object
        init();

        // return the object
        return that;
    };

    /********** User modifiable  methods **********/
    // set fill color
    TreeView.NODE_FILL_COLOR = function nodefillColor(d) {
        if (d.selected) {
            return d._children ? d.color || "#aaa" : "#fff";
        } else {
            return "#aaa";
        }
    };
    // set node stroke color
    TreeView.NODE_STROKE_COLOR = function nodeStrokeColor(d) {
        if (d.selected) {
            return d.color || "#aaa";
        } else {
            return "#aaa";
        }
    };

    // set link stroke color
    TreeView.LINK_STROKE_COLOR = function linkStrokeColor(d) {
        if (d.source.selected) {
            return d.target.color;
        } else {
            return "#aaa";
        }
    };

    // get a nice colour palet, see https://github.com/mbostock/d3/wiki/Ordinal-Scales#categorical-colors
    TreeView.DEFAULT_SCALE = d3.scale.category10();

    TreeView.DEFAULTS = {
        height: 100,
        width: 200,

        colors: function (d) {
            return TreeView.DEFAULT_SCALE(d.name);
        },
        nodeFillColor: TreeView.NODE_FILL_COLOR,
        nodeStrokeColor: TreeView.NODE_STROKE_COLOR,
        linkStrokeColor: TreeView.LINK_STROKE_COLOR,
    };

    function Plugin(option) {
        var dt = Object
        var plug = this.each(function () {
            var $this = $(this);
            var data = $this.data('vis.treeview');
            var options = $.extend({}, TreeView.DEFAULTS, $this.data(), typeof option === 'object' && option);

            if (!data) {
                data = new TreeView(this, options)
                dt = data;
                $this.data('vis.treeview', (data));
            }
            if (typeof option === 'string') {
                data[option]();
            }
        });
        return dt;
    }

    $.fn.treeview = Plugin;
    $.fn.treeview.Constructor = TreeView;
})();
