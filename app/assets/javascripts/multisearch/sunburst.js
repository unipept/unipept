/**
 * Constructs a Sunburst object that represents the sunburst visualisation
 *
 * @return <Sunburst> that The constructed Sunburst object
 */
var constructSunburst = function constructSunburst(args) {
    /*************** Private variables ***************/

    // parameters
    var that = {},
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
    var tooltip;

    /*************** Private methods ***************/

    /**
     * Initializes Sunburst
     */
    function init() {
        redraw();
    }

    /**
     * Redraws the pancore graph
     */
    function redraw() {
        var x, // x-scale
            y, // y-scale
            currentMaxLevel, // ???
            vis, // the visualisation
            partition, // the partition layout
            arc, // the arc function
            nodes, // the result of the partition layout
            path, // the arcs
            text, // all text nodes
            textEnter; // new text nodes

        // clear everything
        $("#sunburst").empty();

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
            .value(function (d) { return d.data.self_count; })    // set the size of the pieces
            .children(function (d) { return d.kids; });

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
            .on("click", click)                                   // call function on click
            .on("mouseover", function (d) {
                if (d.depth < currentMaxLevel && d.name !== "empty") {
                    tooltipIn(d, tooltip);
                }
            })
            .on("mousemove", function () { tooltipMove(tooltip); })
            .on("mouseout", function () { tooltipOut(tooltip); });

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

    /*************** Public methods ***************/

    // initialize the object
    init();

    return that;
};
