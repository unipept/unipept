/**
 * TODO: document
 *    @param <Array> genomes 
 */
var constructSimMatrix = function constructSimMatrix(genomes, data, order) {
    /*************** Private variables ***************/
    /* UI variables */
    var margin = {top: 200, right: 0, bottom: 10, left: 200},
        width = 500,
        height = 500;

    /* variable to contain our d3 selector */
    var svg;

    /* Scales */
    var x = d3.scale.ordinal().rangeBands([0, width]),
        z = d3.scale.linear().domain([0, 1]).clamp(true);

    /* Constructor fields */
    var genomes = genomes,
        data = data,
        order = order;

    var that = {};

    /*************** Private methods ***************/

    /* generate a row */
    function rowF(row) {
        var cell = d3.select(this).selectAll(".cell")
            //.data(row.filter(function(d) { return d.z; }))
            .data(row)
            .enter().append("rect")
            .attr("class", "cell")
            .attr("x", function(d, i) { return x(i); })
            .attr("width", x.rangeBand())
            .attr("height", x.rangeBand())
            .style("fill-opacity", function(d) { return z(d * d); })
            .style("fill", "steelblue");
    }

    /**
     *
     * initializes the Matrix
     *
     */
    function init() {
        svg = d3.select("#sim_matrix").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // The default sort order.
        x.domain(d3.range(genomes.length));

        svg.append("rect")
            .attr("class", "background")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#eeeeee");

        var row = svg.selectAll(".row")
            .data(data)
          .enter().append("g")
            .attr("class", "row")
            .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
            .each(rowF);

        row.append("line")
            .attr("x2", width)
            .attr("stroke", "#ffffff");

        row.append("text")
            .attr("x", -6)
            .attr("y", x.rangeBand() / 2)
            .attr("dy", ".32em")
            .attr("text-anchor", "end")
            .text(function(d, i) { return genomes[i]; });

        var column = svg.selectAll(".column")
            .data(data)
          .enter().append("g")
            .attr("class", "column")
            .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

        column.append("line")
            .attr("x1", -width)
            .attr("stroke", "#ffffff");

        column.append("text")
            .attr("x", 6)
            .attr("y", x.rangeBand() / 2)
            .attr("dy", ".32em")
            .attr("text-anchor", "start")
            .text(function(d, i) { return genomes[i]; });
    }

    /*************** Public methods ***************/

    /* reOrder the matrix based on the new order */
    that.reOrder = function(newOrder) {
        x.domain(newOrder);
        var t = svg.transition().duration(2500);

        t.selectAll(".row")
            .delay(function(d, i) { return x(i) * 4; })
            .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
            .selectAll(".cell")
            .delay(function(d, i) { return x(i) * 4; })
            .attr("x", function(d, i) { return x(i); });

        t.selectAll(".column")
            .delay(function(d, i) { return x(i) * 4; })
            .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
    }


    // initialize the object
    init();

    return that;
};
