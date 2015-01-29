/**
 * Constructs a Sunburst object that represents the sunburst visualisation
 *
 * @return <Sunburst> that The constructed Sunburst object
 */
var constructSunburst = function constructSunburst(args) {
    /*************** Private variables ***************/

    // parameters
    var that = {},
        multi = args.multi,
        data = args.data;

    // layout
    var w = 730,   // width
        h = w,     // height
        r = w / 2, // radius
        p = 5,     // padding
        duration = 1000, // animation duration
        levels = 4; // levels to show;

    // settings
    var colors = ["#f9f0ab", "#e8e596", "#f0e2a3", "#ede487", "#efd580", "#f1cb82", "#f1c298", "#e8b598", "#d5dda1", "#c9d2b5", "#aec1ad", "#a7b8a8", "#b49a3d", "#b28647", "#a97d32", "#b68334", "#d6a680", "#dfad70", "#a2765d", "#9f6652", "#b9763f", "#bf6e5d", "#af643c", "#9b4c3f", "#72659d", "#8a6e9e", "#8f5c85", "#934b8b", "#9d4e87", "#92538c", "#8b6397", "#716084", "#2e6093", "#3a5988", "#4a5072", "#393e64", "#aaa1cc", "#e0b5c9", "#e098b0", "#ee82a2", "#ef91ac", "#eda994", "#eeb798", "#ecc099", "#f6d5aa", "#f0d48a", "#efd95f", "#eee469", "#dbdc7f", "#dfd961", "#ebe378", "#f5e351"],
        fixedColors = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5", "#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252", "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194", "#ce6dbd", "#de9ed6", "#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#e6550d", "#fd8d3c", "#fdae6b", "#fdd0a2", "#31a354", "#74c476", "#a1d99b", "#c7e9c0", "#756bb1", "#9e9ac8", "#bcbddc", "#dadaeb", "#636363", "#969696", "#bdbdbd", "#d9d9d9"],
        colorCounter = -1,
        useFixedColors = false;

    // components
    var tooltip,
        breadcrumbs,
        path, // the arcs
        x, // the x-scale
        y, // the y-scale
        arc, // the arc function
        text, // all text nodes
        currentMaxLevel;

    /*************** Private methods ***************/

    /**
     * Initializes Sunburst
     */
    function init() {
        // init controls
        initControls();

        // prepare data
        data.children = addEmptyChildren(data.children, data.data.self_count);

        // draw everything
        redraw();

        // fake click on the center node
        setTimeout(that.reset, 1000);
    }

    /**
     * Initialise the controls
     */
    function initControls() {
        // the reset button
        $("#sunburst-reset").click(that.reset);

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
            that.redrawColors();
        });
    }

    /**
     * Adds data for the peptides on the self level
     * Is called recursively
     *
     * @param <Array> children A list of children
     * @param <int> count The number of peptides that should be the sum of the
     *          children count
     * @return <Array> The modified list of children
     */
    function addEmptyChildren(children, count) {
        var i;
        for (i = 0; i < children.length; i++) {
            if (typeof children[i].children !== "undefined") {
                children[i].children = addEmptyChildren(children[i].children, children[i].data.self_count);
            }
        }
        if (children.length > 0 && count !== 0 && count !== undefined) {
            children.push({id: -1, name: "empty", data: {count: count, self_count: count}});
        }
        return children;
    }

    /**
     * Redraws the pancore graph
     */
    function redraw() {
        var vis, // the visualisation
            partition, // the partition layout
            nodes, // the result of the partition layout
            textEnter; // new text nodes

        // clear everything
        $("#sunburst svg").remove();
        $("#sunburst-tooltip").remove();
        $("#sunburstPanel").empty();

        breadcrumbs = d3.select("#sunburstPanel").append("ul");

        x = d3.scale.linear().range([0, 2 * Math.PI]), // use full circle
        y = d3.scale.linear().domain([0, 1]).range([0, r]),
        currentMaxLevel = 4;

        vis = d3.select("#sunburst")
            .append("svg")
            .attr("version", "1.1")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("viewBox", "0 0 740 740")
            .attr("width", w + p * 2)
            .attr("height", h + p * 2)
            .attr("overflow", "hidden")
            .style("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif");
        vis.append("style")
            .attr("type", "text/css")
            .html(".hidden{ visibility: hidden;}");
        vis = vis.append("g")
            .attr("transform", "translate(" + (r + p) + "," + (r + p) + ")"); // set origin to radius center

        tooltip = d3.select("body")
            .append("div")
            .attr("id", "sunburst-tooltip")
            .attr("class", "tip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden");

        partition = d3.layout.partition()               // creates a new partition layout
            .sort(null)                                     // don't sort,  use tree traversal order
            .value(function (d) { return d.data.self_count; });    // set the size of the pieces

        // calculate arcs out of partition coordinates
        arc = d3.svg.arc()
            .startAngle(function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); }) // start between 0 and 2Pi
            .endAngle(function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); }) // stop between 0 and 2Pi
            .innerRadius(function (d) { return Math.max(0, d.y ? y(d.y) : d.y); }) // prevent y-calculation on 0
            .outerRadius(function (d) { return Math.max(0, y(d.y + d.dy)) + 1; });

        // run the partition layout
        nodes = partition.nodes(data);

        path = vis.selectAll("path").data(nodes);
        path.enter().append("path")                               // for every node, draw an arc
            .attr("id", function (d, i) { return "path-" + i; })  // id based on index
            .attr("d", arc)                                       // path data
            .attr("fill-rule", "evenodd")                         // fill rule
            .style("fill", colour)                                // call function for colour
            .on("click", function (d) {
                if (d.depth < currentMaxLevel) {
                    click(d);
                }
            })                                   // call function on click
            .on("mouseover", function (d) {
                if (d.depth < currentMaxLevel && d.name !== "empty") {
                    multi.tooltipIn(d, tooltip);
                }
            })
            .on("mousemove", function () { multi.tooltipMove(tooltip); })
            .on("mouseout", function () { multi.tooltipOut(tooltip); });

        // put labels on the nodes
        text = vis.selectAll("text").data(nodes);

        textEnter = text.enter().append("text")
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
    }

    /**
     *  Interpolate the scales!
     * Defines new scales based on the clicked item
     *
     * @param <Object> d The clicked item
     * @return <Scale> new scales
     */
    function arcTween(d) {
        var my = Math.min(maxY(d), d.y + levels * d.dy),
            xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
            yd = d3.interpolate(y.domain(), [d.y, my]),
            yr = d3.interpolate(y.range(), [d.y ? 20 : 0, r]);
        return function (d) {
            return function (t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
        };
    }

    /**
     * calculate the max-y of the clicked item
     *
     * @param <Object> d The clicked item
     * @return <Number> The maximal y-value
     */
    function maxY(d) {
        return d.children ? Math.max.apply(Math, d.children.map(maxY)) : d.y + d.dy;
    }

    function setBreadcrumbs(d) {
        // breadcrumbs
        var crumbs = [];
        var temp = d;
        while (temp) {
            crumbs.push(temp);
            temp = temp.parent;
        }
        crumbs.reverse().shift();
        var breadArc = d3.svg.arc()
            .innerRadius(0)
            .outerRadius(15)
            .startAngle(0)
            .endAngle(function (d) { return 2 * Math.PI * d.data.count / d.parent.data.count; });
        var bc = breadcrumbs.selectAll(".crumb")
            .data(crumbs);
        bc.enter()
            .append("li")
            .on("click", function (d) { click(d.parent); })
            .attr("class", "crumb")
            .style("opacity", "0")
            .attr("title", function (d) { return "[" + d.data.rank + "] " + d.name; })
            .html(function (d) { return "<p class='name'>" +
                d.name +
                "</p><p class='percentage'>" +
                Math.round(100 * d.data.count / d.parent.data.count) +
                "% of " +
                d.parent.name +
                "</p>"; })
            .insert("svg", ":first-child").attr("width", 30).attr("height", 30)
            .append("path").attr("d", breadArc).attr("transform", "translate(15, 15)").attr("fill", colour);
        bc.transition()
            .duration(duration)
            .style("opacity", "1");
        bc.exit().transition()
            .duration(duration)
            .style("opacity", "0")
            .remove();
    }

    /**
     * Defines what happens after a node is clicked
     *
     * @param <Object> d The data object of the clicked arc
     */
    function click(d) {
        if (d.name === "empty") {
            return;
        }
        logToGoogle("Multi Peptide", "Zoom", "Sunburst");

        setBreadcrumbs(d);

        // set tree, but only after the animation
        multi.search(d.name, duration);

        // perform animation
        currentMaxLevel = d.depth + levels;
        path.transition()
            .duration(duration)
            .attrTween("d", arcTween(d))
            .attr("class", function (d) {
                if (d.depth >= currentMaxLevel) {
                    return "toHide";
                }
                return "";
            })
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

    /**
     * Calculates if p is a parent of c
     * Returns true is label must be drawn
     */
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

    /**
     * Calculates the color of an arc based on the color of his children
     *
     * @param <Object> d The node for which we want the color
     * @return <Color> The calculated color
     */
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
                // if we have 2 children or more, take the average of the first two children
                return d3.hsl((a.h + b.h) / 2, (a.s + b.s) / 2, (a.l + b.l) / 2);
            }
            // if we don't have children, pick a new color
            if (!d.color) {
                d.color = getColor();
            }
            return d.color;
        }
    }

    /**
     * color generation function
     * iterates over fixed list of colors
     *
     * @return <Color> The generated color
     */
    function getColor() {
        colorCounter = (colorCounter + 1) % 52;
        return colors[colorCounter];
    }

    /*************** Public methods ***************/

    /**
     * Resets the sunburst to its initial position
     */
    that.reset = function reset() {
        click(data);
    };

    /**
     * redraws the colors of the sunburst
     */
    that.redrawColors = function redrawColors() {
        d3.selectAll(".crumb path").transition()
            .style("fill", colour);
        path.transition()
            .style("fill", colour);
        text.transition()
            .style("fill", function (d) { return getReadableColorFor(colour(d)); });
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
            var size = 740,
                destination = "body";
            if (isFullScreen) {
                size = Math.min($(window).height() - 44, $(window).width() - 165);
                destination = "#sunburst";
            }
            $("#sunburst > svg").attr("width", size);
            $("#sunburst > svg").attr("height", size);
            $("#sunburst-tooltip").appendTo(destination);
        }, 1000);
    };

    // initialize the object
    init();

    return that;
};
