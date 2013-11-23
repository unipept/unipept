/**
 * Creates a pancoreGraph object that includes the graph visualisation
 *
 * @param <Number> args.transitionDuration Duration of transitions in ms
 * @param <Number> args.width Width of the graph
 * @param <Number> args.height Height of the graph
 */
var constructPancoreGraph = function constructPancoreGraph(args) {
    /*************** Private variables ***************/

    var that = {},
        transitionDuration = args.transitionDuration,
        fullWidth = args.width,
        fullHeight = args.height;

    // Colors
    var genomeColor = "#d9d9d9",  // gray
        panColor = "#1f77b4",     // blue
        coreColor = "#ff7f0e",    // orange
        unicoreColor = "#2ca02c"; // green

    // Sizes
    var margin = {top: 20, right: 40, bottom: 170, left: 60},
        width = fullWidth - margin.left - margin.right,
        height = fullHeight - margin.top - margin.bottom,
        mouseOverWidth;

    // Data
    var genomes = {},
        legendData;

    // Drag and click
    var mouse = {
        dragging : {},
        isDragging : false,
        hasDragged : false,
        isClicked : false
        //dragId,
        //clickId,
    },
        // Stores tooltip position till next frame
        tooltipX = 0,
        tooltipY = 0;

    // toggles
    var toggles = {
        showGenomes : true,
        showPan : true,
        showCore : true,
        showUnicore : true
    };

    // D3 vars
    var svg,
        graphArea,
        tooltip,
        // Scales
        pancoreX,
        pancoreY,
        // Axes
        xAxis,
        yAxis,
        // Line helpers
        panLine,
        coreLine,
        unicoreLine;

    /*************** Private methods ***************/

    /**
     * Initializes...
     */
    function init() {
        legendData = [{"name": "genome size", "color": genomeColor, "toggle": "showGenome"},
            {"name": "pan peptidome", "color": panColor, "toggle": "showPan"},
            {"name": "core peptidome", "color": coreColor, "toggle": "showCore"},
            {"name": "unique peptides", "color": unicoreColor, "toggle": "showUnicore"}];

        pancoreX = d3.scale.ordinal().rangePoints([0, width], 1);
        pancoreY = d3.scale.linear().range([height, 0]);

        xAxis = d3.svg.axis()
            .scale(pancoreX)
            .tickFormat(function (d) { return genomes[d].name || ""; })
            .orient("bottom");
        yAxis = d3.svg.axis()
            .scale(pancoreY)
            .orient("left");

        panLine = d3.svg.line()
            .interpolate("linear")
            .x(function (d) { return pancoreX(d.bioproject_id); })
            .y(function (d) { return pancoreY(d.pan); });
        coreLine = d3.svg.line()
            .interpolate("linear")
            .x(function (d) { return pancoreX(d.bioproject_id); })
            .y(function (d) { return pancoreY(d.core); });
        unicoreLine = d3.svg.line()
            .interpolate("linear")
            .x(function (d) { return pancoreX(d.bioproject_id); })
            .y(function (d) { return pancoreY(d.unicore); });
    }

    /*************** Public methods ***************/


    // initialize the object
    init();

    return that;
};
