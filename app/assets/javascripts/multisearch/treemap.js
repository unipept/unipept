/**
 * Constructs a Treemap object that represents the treemap visualisation
 *
 * @return <Streemap> that The constructed Treemap object
 */
function constructTreemap(args) {
    /** ************* Private variables ***************/

    // parameters
    let that = {},
        multi = args.multi,
        data = args.data;

    let ranks = ["no rank", "superkingdom", "kingdom", "subkingdom", "superphylum", "phylum", "subphylum", "superclass", "class", "subclass", "infraclass", "superorder", "order", "suborder", "infraorder", "parvorder", "superfamily", "family", "subfamily", "tribe", "subtribe", "genus", "subgenus", "species group", "species subgroup", "species", "subspecies", "varietas", "forma"];

    let root = data,
        current,
        tooltip = d3.select("#tooltip"),
        treemap,
        colorScale,
        breadcrumbs,
        div;

    let margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = 916 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    /** ************* Private methods ***************/

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

        treemap = d3.layout.treemap()
            .size([width + 1, height + 1])
            .padding([10, 0, 0, 0])
            .value(function (d) {
                return d.data.self_count;
            });

        colorScale = d3.scale.ordinal()
            .domain(ranks)
            .range(d3.range(ranks.length).map(d3.scale.linear()
                .domain([0, ranks.length - 1])
                .range(["#104B7D", "#fdffcc"])
                .interpolate(d3.interpolateLab)));

        breadcrumbs = d3.select("#d3TreeMap").append("div")
            .attr("class", "breadcrumbs")
            .style("position", "relative")
            .style("width", (width + margin.left + margin.right) + "px")
            .style("height", "20px")
            .style("background-color", "#FF8F00");

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
        this.style("left", function (d) {
            return d.x + "px";
        })
            .style("top", function (d) {
                return d.y + "px";
            })
            .style("width", function (d) {
                return Math.max(0, d.dx - 1) + "px";
            })
            .style("height", function (d) {
                return Math.max(0, d.dy - 1) + "px";
            });
    }

    /**
     * Resizes the treemap for a given width and height
     */
    function resize(width, height) {
        treemap = d3.layout.treemap()
            .size([width + 1, height + 1])
            .padding([10, 0, 0, 0])
            .value(function (d) {
                return d.data.self_count;
            });
        that.update(current);
    }

    /** ************* Public methods ***************/

    /**
     * Updates the treemap and sets data as new root
     */
    that.update = function update(data) {
        current = data;

        // search for the new root
        multi.search(data.name);

        // breadcrumbs
        let crumbs = [];
        let temp = data;
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
            .attr("title", function (d) {
                return d.data.rank;
            })
            .html(function (d) {
                return "<span class='link'>" + d.name + "</span>";
            })
            .on("click", function (d) {
                logToGoogle("Multi Peptide", "Zoom", "Treemap", "Breadcrumb");
                update(d);
            });

        let nodes = div.selectAll(".node")
            .data(treemap.nodes(data), function (d) {
                return d.id;
            });

        nodes.enter()
            .append("div")
            .attr("class", "node")
            .style("background", function (d) {
                return colorScale(d.data.rank);
            })
            .style("color", function (d) {
                return getReadableColorFor(colorScale(d.data.rank));
            })
            .style("left", "0px")
            .style("top", "0px")
            .style("width", "0px")
            .style("height", "0px")
            .text(multi.getTitle)
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
            .on("mouseover", function (d) {
                multi.tooltipIn(d, tooltip, true);
            })
            .on("mousemove", function () {
                multi.tooltipMove(tooltip);
            })
            .on("mouseout", function (d) {
                multi.tooltipOut(tooltip);
            });

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
            let w = width,
                h = height;
            if (isFullScreen) {
                w = $(window).width();
                h = $(window).height() - 44;
            }
            resize(w, h);
        }, 1000);
    };

    // initialize the object
    init();

    return that;
}

export {constructTreemap};
