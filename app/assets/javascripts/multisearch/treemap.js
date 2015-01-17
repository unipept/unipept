/**
 * Constructs a Treemap object that represents the treemap visualisation
 *
 * @return <Streemap> that The constructed Treemap object
 */
var constructTreemap = function constructTreemap(args) {
    /*************** Private variables ***************/

    // parameters
    var that = {},
        data = args.data;

    var ranks = ["no rank", "superkingdom", "kingdom", "subkingdom", "superphylum", "phylum", "subphylum", "superclass", "class", "subclass", "infraclass", "superorder", "order", "suborder", "infraorder", "parvorder", "superfamily", "family", "subfamily", "tribe", "subtribe", "genus", "subgenus", "species group", "species subgroup", "species", "subspecies", "varietas", "forma"];

    var root = data,
        current,
        tooltip,
        treemap,
        colorScale,
        breadcrumbs,
        div;

    var margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = 916 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    /*************** Private methods ***************/

    /**
     * Initializes Treemap
     */
    function init() {
        // init controls
        initControls();

        // setup the visualisation
        redraw();

        // fake first click
        that.reset();
    }

    /**
     * Initialise the controls
     */
    function initControls() {
        // the reset button
        $("#treemap-reset").click(that.reset);
    }

    /**
     * Redraw everything
     */
    function redraw() {
        // clear old stuff
        $("#d3TreeMap").empty();
        $("#treemap-tooltip").remove();

        tooltip = d3.select("body")
            .append("div")
            .attr("id", "treemap-tooltip")
            .attr("class", "tip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden");

        treemap = d3.layout.treemap()
            .size([width, height])
            .padding([10, 0, 0, 0])
            .value(function (d) { return d.data.self_count; });

        colorScale = d3.scale.ordinal()
            .domain(ranks)
            .range(d3.range(ranks.length).map(d3.scale.linear()
                .domain([0, ranks.length - 1])
                .range(["#104B7D", "#fdffcc"])
                .interpolate(d3.interpolateLab)));

        breadcrumbs = d3.select("#d3TreeMap").append("div")
            .attr("class", "breadcrumbs")
            .style("position", "relative")
            .style("width", (width + margin.left + margin.right - 1) + "px")
            .style("height", "20px")
            .style("background-color", "#ffb300");

        div = d3.select("#d3TreeMap").append("div")
            .style("position", "relative")
            .style("width", (width + margin.left + margin.right) + "px")
            .style("height", (height + margin.top + margin.bottom) + "px")
            .style("left", margin.left + "px")
            .style("top", margin.top + "px");
    }

    /**
     * calculates the position of a square
     */
    function position() {
        this.style("left", function (d) { return d.x + "px"; })
            .style("top", function (d) { return d.y + "px"; })
            .style("width", function (d) { return Math.max(0, d.dx - 1) + "px"; })
            .style("height", function (d) { return Math.max(0, d.dy - 1) + "px"; });
    }

    /**
     * Constructs a title
     * @param <Object> d The object to construct a title for
     * @return <String> The title
     */
    function getTitle(d) {
        var title = d.name;
        title += " (" + d.data.self_count + "/" + d.data.count + ")";
        return title;
    }

    /*************** Public methods ***************/

    /**
     * Updates the treemap and sets data as new root
     */
    that.update = function update(data) {
        current = data;

        // search for the new root
        // todo
        //treeSearch(data.name, 500);

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
            // TODO
            /*.on("mouseover", function (d) { tooltipIn(d, tooltip, true); })
            .on("mousemove", function () { tooltipMove(tooltip); })
            .on("mouseout", function (d) { tooltipOut(tooltip); })*/;

        nodes.order()
            .transition()
            .call(position);

        nodes.exit().remove();
    };

    /**
     * Resets the treemap to its initial position
     */
    that.reset = function reset() {
        that.update(root);
    };

    // initialize the object
    init();

    return that;
};
