/**
 * Wrapper around a d3-based phylogram (tree where branch lengths are scaled)
 * Also includes a radial dendrogram visualization (branch lengths not scaled)
 * along with some helper methods for building angled-branch trees.
 */
function init_phylogram() {
    d3.phylogram = {};

    d3.phylogram.rightAngleDiagonal = function () {
        var projection = function (d) { return [d.y, d.x]; };

        var path = function (pathData) {
            return "M" + pathData[0] + ' ' + pathData[1] + " " + pathData[2];
        };

        function diagonal(diagonalPath, i) {
            var source = diagonalPath.source,
                target = diagonalPath.target,
                midpointX = (source.x + target.x) / 2,
                midpointY = (source.y + target.y) / 2,
                pathData = [source, {x: target.x, y: source.y}, target];
            pathData = pathData.map(projection);
            return path(pathData);
        }

        diagonal.projection = function (x) {
            if (!arguments.length) return projection;
            projection = x;
            return diagonal;
        };

        diagonal.path = function (x) {
            if (!arguments.length) return path;
            path = x;
            return diagonal;
        };

        return diagonal;
    };

    d3.phylogram.radialRightAngleDiagonal = function () {
        return d3.phylogram.rightAngleDiagonal()
            .path(function (pathData) {
                var src = pathData[0],
                    mid = pathData[1],
                    dst = pathData[2],
                    radius = Math.sqrt(src[0] * src[0] + src[1] * src[1]),
                    srcAngle = d3.phylogram.coordinateToAngle(src, radius),
                    midAngle = d3.phylogram.coordinateToAngle(mid, radius),
                    clockwise = Math.abs(midAngle - srcAngle) > Math.PI ? midAngle <= srcAngle : midAngle > srcAngle,
                    rotation = 0,
                    largeArc = 0,
                    sweep = clockwise ? 0 : 1;
                return 'M' + src + ' ' +
                    "A" + [radius, radius] + ' ' + rotation + ' ' + largeArc +
                    ',' + sweep + ' ' + mid + 'L' + dst;
            })
            .projection(function (d) {
                var r = d.y, a = (d.x - 90) / 180 * Math.PI;
                return [r * Math.cos(a), r * Math.sin(a)];
            });
    };

    // Convert XY and radius to angle of a circle centered at 0,0
    d3.phylogram.coordinateToAngle = function (coord, radius) {
        var wholeAngle = 2 * Math.PI,
            quarterAngle = wholeAngle / 4,
            coordAngle;

        var coordQuad = coord[0] >= 0 ? (coord[1] >= 0 ? 1 : 2) : (coord[1] >= 0 ? 4 : 3),
            coordBaseAngle = Math.abs(Math.asin(coord[1] / radius));

        // Since this is just based on the angle of the right triangle formed
        // by the coordinate and the origin, each quad will have different
        // offsets
        switch (coordQuad) {
            case 1:
                coordAngle = quarterAngle - coordBaseAngle;
                break;
            case 2:
                coordAngle = quarterAngle + coordBaseAngle;
                break;
            case 3:
                coordAngle = 2 * quarterAngle + quarterAngle - coordBaseAngle;
                break;
            case 4:
                coordAngle = 3 * quarterAngle + coordBaseAngle;
        }
        return coordAngle;
    };

    d3.phylogram.styleTreeNodes = function (vis) {
        vis.selectAll('g.root.node')
            .append('svg:circle')
            .attr("r", 3)
            .attr('fill', 'steelblue')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', '3px');
    };

    function scaleBranchLengths(nodes, w) {
        // Visit all nodes and adjust y pos width distance metric
        var visitPreOrder = function (root, callback) {
            var i;
            callback(root);
            if (root.children) {
                for (i = root.children.length - 1; i >= 0; i--) {
                    visitPreOrder(root.children[i], callback);
                }
            }
        };

        visitPreOrder(nodes[0], function (node) {
            if (node) {
                node.rootDist = (node.parent ? node.parent.rootDist : 0) + (node.length || 0);
            } else {
                node.rootDist = (node.parent ? node.parent.rootDist : 0);
            }
        });

        var rootDists = nodes.map(function (n) { return n.rootDist; });
        var yscale = d3.scale.linear()
            .domain([d3.min(rootDists), d3.max(rootDists)])
            .nice(5)
            .range([0, w]);

        visitPreOrder(nodes[0], function (node) {
            node.y = yscale(node.rootDist);
        });
        return yscale;
    }

    function leafName(node) {
        if (node.name !== "") {
            return node.name;
        } else {
            return leafName(node.children[0]);
        }
    }

    /**
     * Recursively generates names for nodes without one
     */
    function attachNames(node) {
        var i;
        for (i = 0; node.branchset && i < node.branchset.length; i++) {
            attachNames(node.branchset[i]);
        }
        if (node.name === "") {
            node.name = Math.random();
        }
    }

    /**
     * Creates a phylogram.
     * Arguments:
     *   selector: selector of an element that will contain the SVG
     *   nodes: JS object of nodes
     *   matrix: the matrix object
     *
     * Options:
     *   width
     *     Width of the vis, will attempt to set a default based on the width
     *     of the container.
     *   height
     *     Height of the vis, will attempt to set a default based on the height
     *     of the container.
     *   vis
     *     Pre-constructed d3 vis.
     *   tree
     *     Pre-constructed d3 tree layout.
     *   children
     *     Function for retrieving an array of children given a node. Default is
     *     to assume each node has an attribute called "branchset"
     *   diagonal
     *     Function that creates the d attribute for an svg:path. Defaults to a
     *     right-angle diagonal.
     *   skipTicks
     *     Skip the tick rule.
     *   skipBranchLengthScaling
     *     Make a dendrogram instead of a phylogram.
     *   duration
     *     The duration of the animation
     */
    d3.phylogram.build = function (selector, nodes, matrix, options) {
        attachNames(nodes);
        options = options || {};
        var w = options.width || d3.select(selector).style('width') || d3.select(selector).attr('width'),
            h = options.height || d3.select(selector).style('height') || d3.select(selector).attr('height');
        w = parseInt(w, 10);
        h = parseInt(h, 10);
        var duration = options.duration || 1000;
        var tree = options.tree || d3.layout.cluster()
            .size([h, w])
            .separation(function (a, b) { return 1; })
            .children(options.children || function (node) {
                return node.branchset;
            });
        var diagonal = options.diagonal || d3.phylogram.rightAngleDiagonal();
        var vis = options.vis || d3.select(selector).append("svg:svg")
            .attr("width", w + 30)
            .attr("height", h + 30);
        vis.append("style")
            .attr("type", "text/css")
            .html(".hidden{ visibility: hidden;}");
        vis.append("svg:g")
            .attr("transform", "translate(20, 20)");
        var treeNodes = tree(nodes);

        var yscale;
        if (options.skipBranchLengthScaling) {
            yscale = d3.scale.linear()
                .domain([0, w])
                .range([0, w]);
        } else {
            yscale = scaleBranchLengths(treeNodes, w);
        }

        if (!options.skipTicks) {
            vis.selectAll('line')
                .data(yscale.ticks(5))
              .enter().append('svg:line')
                .attr('y1', 0)
                .attr('y2', h)
                .attr('x1', yscale)
                .attr('x2', yscale)
                .attr("stroke", "#ccc");

            vis.selectAll("text.rule")
                .data(yscale.ticks(5))
              .enter().append("svg:text")
                .attr("class", "rule")
                .attr("x", 2)
                .attr("y", yscale)
                .attr("dy", 2)
                .attr("text-anchor", "start")
                .attr('font-size', '8px')
                .attr('transform', 'rotate(-90)')
                .attr('fill', '#ddd')
                .text(function (d) { return Math.round(d * 100) / 100; });
        }

        var link = vis.selectAll("path.link")
            .data(tree.links(treeNodes), function (d) {return "" + d.source.name + d.target.name; })
          .enter().append("svg:path")
            .attr("class", "link")
            .attr("d", diagonal)
            .attr("fill", "none")
            .attr("stroke", "#333")
            .attr("stroke-width", "2px");

        var node = vis.selectAll("g.node")
            .data(treeNodes, function (d) {return d.bioproject_id ? d.bioproject_id : d.name; })
          .enter().append("svg:g")
            .attr("class", function (n) {
                if (n.children) {
                    if (n.depth === 0) {
                        return "root node";
                    } else {
                        return "inner node";
                    }
                } else {
                    return "leaf node";
                }
            })
            .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });

        d3.phylogram.styleTreeNodes(vis);

        if (!options.skipLabels) {
            vis.selectAll('g.inner.node')
              .append("svg:text")
                .attr("dx", -6)
                .attr("dy", -6)
                .attr("text-anchor", 'end')
                .attr('font-size', '8px')
                .attr('fill', '#ccc')
                .text(function (d) { return d.length; });

            vis.selectAll('g.leaf.node').append("svg:text")
              .attr("dx", 8)
              .attr("dy", 3)
              .attr("text-anchor", "start")
              .attr('font-family', 'Helvetica Neue, Helvetica, sans-serif')
              .attr('font-size', '10px')
              .attr('fill', '#333')
              .text(function (d) { return d.name + ' (' + d.length + ')'; });
        }

        // hook up the nodes
        vis.selectAll('g.inner.node')
            .append('svg:circle')
            .attr("r", 3)
            .attr('fill', 'black');
        vis.selectAll("g.inner.node, g.root.node")
            .style("cursor", "pointer")
            .on("mouseover", function () {
                d3.select(this).select("circle")
                    .transition()
                    .attr("r", 7);
            })
            .on("mouseout", function () {
                d3.select(this).select("circle")
                    .transition()
                    .attr("r", 3);
            })
            .on("click", swap);

        // swap 2 branches
        function swap(d) {
            if (d.branchset.length === 2) {
                var temp = d.branchset[0];
                d.branchset[0] = d.branchset[1];
                d.branchset[1] = temp;
            }
            matrix.setOrder(getGenomeOrder(nodes));
            matrix.setClustered(true);
            treeNodes = tree(nodes);
            yscale = scaleBranchLengths(treeNodes, w);
            link.data(tree.links(treeNodes), function (d) {return "" + d.source.name + d.target.name; })
                .transition()
                .duration(duration)
                .attr("d", diagonal);
            node.data(treeNodes, function (d) {return d.bioproject_id ? d.bioproject_id : d.name; })
                .transition()
                .duration(duration)
                .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });
        }

        return {tree: tree, vis: vis};
    };

    /**
     * Recursively compiles a list with bioproject_id's in the order of the tree
     */
    function getGenomeOrder(node, order) {
        var i;
        order = order || [];
        for (i = 0; node.branchset && i < node.branchset.length; i++) {
            getGenomeOrder(node.branchset[i], order);
        }
        if (node.bioproject_id) {
            order.push(node.bioproject_id);
        }
        return order;
    }

    /**
     * Creates a radial dendrogram.
     *
     * Options: same as build, but without diagonal, skipTicks, and
     *   skipBranchLengthScaling
     */
    d3.phylogram.buildRadial = function (selector, nodes, options) {
        options = options || {};
        var w = options.width || d3.select(selector).style('width') || d3.select(selector).attr('width'),
            r = w / 2,
            labelWidth = options.skipLabels ? 10 : options.labelWidth || 120;

        var vis = d3.select(selector).append("svg:svg")
            .attr("width", r * 2)
            .attr("height", r * 2)
          .append("svg:g")
            .attr("transform", "translate(" + r + "," + r + ")");

        var tree = d3.layout.tree()
          .size([360, r - labelWidth])
          .sort(function (node) { return node.children ? node.children.length : -1; })
          .children(options.children || function (node) {
              return node.branchset;
          })
          .separation(function (a, b) { return (a.parent === b.parent ? 1 : 2) / a.depth; });

        var phylogram = d3.phylogram.build(selector, nodes, {
            vis: vis,
            tree: tree,
            skipBranchLengthScaling: true,
            skipTicks: true,
            skipLabels: options.skipLabels,
            diagonal: d3.phylogram.radialRightAngleDiagonal()
        });
        vis.selectAll('g.node')
          .attr("transform", function (d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; });

        if (!options.skipLabels) {
            vis.selectAll('g.leaf.node text')
                .attr("dx", function (d) { return d.x < 180 ? 8 : -8; })
                .attr("dy", ".31em")
                .attr("text-anchor", function (d) { return d.x < 180 ? "start" : "end"; })
                .attr("transform", function (d) { return d.x < 180 ? null : "rotate(180)"; })
                .attr('font-family', 'Helvetica Neue, Helvetica, sans-serif')
                .attr('font-size', '10px')
                .attr('fill', 'black')
                .text(function (d) { return d.name; });

            vis.selectAll('g.inner.node text')
                .attr("dx", function (d) { return d.x < 180 ? -6 : 6; })
                .attr("text-anchor", function (d) { return d.x < 180 ? "end" : "start"; })
                .attr("transform", function (d) { return d.x < 180 ? null : "rotate(180)"; });
        }

        return {tree: tree, vis: vis};
    };
}
