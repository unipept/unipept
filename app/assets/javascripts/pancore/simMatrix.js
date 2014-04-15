/**
 * Creates a SimMatrix object that includes the similarity matrix and
 * phylogenetic tree.
 *
 * @param <Pancore> args.pancore The Pancore object
 * @param <GenomeTable> args.table The GenomeTable object
 */
var constructSimMatrix = function constructSimMatrix(args) {
    /*************** Private variables ***************/

    // Parameters
    var pancore = args.pancore,
        table = args.table;

    // UI variables
    var margin = {top: 20, right: 0, bottom: 200, left: 200},
        width = 500,
        height = 500;

    // D3 vars
    var svg,
        transitionDuration = 1000,
        x = d3.scale.ordinal().rangeBands([0, width]),
        z = d3.scale.linear().domain([0, 1]).clamp(true),
        tooltip;

    // Constructor fields
    var metadata = {},
        order = [],
        similarities = {},
        dirty = false,
        clustered,
        newick;

    var $matrixTab = $('a[href="#sim_matrix_wrapper"]'),
        $graphSelector = $('#sim_graph'),
        $clusterBtn = $("#cluster-matrix-btn");

    var that = {};

    /*************** Private methods ***************/

    /**
     * Initializes the SimMatrix
     */
    function init() {
        // calculate similarity and redraw on tab switch
        $matrixTab.on('shown.bs.tab', function tabSwitchAction() {
            calculateSimilarity();
            that.redraw();
        });

        // cluster matrix button
        $clusterBtn.click(that.clusterMatrix);

        // decluster matrix button
        $('#decluster-matrix').click(function declusterAction() {
            that.setOrder(table.getOrder());
        });

        $('#use-cluster-order').click(that.useClusterOrder);

        $('#sim_matrix').mouseout(function mouseOutAction() {
            $('#matrix-popover-table').html('');
        });

        // Dummy newick value chosen randomly
        var dummyNewick = "((((A:0.2,B:0.2):0.1,C:0.3):0.4,(F:0.4,D:0.4):0.3):0.3,E:1.0)";
        that.drawTree(dummyNewick, 500);
    }

    /**
     * Shows the info panel with info about the similarities
     *
     * @param <Number> d.key The bioprojectid associated with the square
     */
    function showInfoPanel(d) {
        var col = d.key,
            row = d3.select(this.parentNode).datum().key,
            pos = $(this).position(),
            tooltipHtml = "<table class='table'>";
        tooltipHtml += "<thead><tr><th>Name</th><th>Genome size</th></tr></thead><tbody>";
        tooltipHtml += "<tr><td>" + metadata[row].name + "</td><td>" + d3.format(",")(metadata[row].size) + " peptides</td></tr>";
        tooltipHtml += "<tr><td>" + metadata[col].name + "</td><td>" + d3.format(",")(metadata[col].size) + " peptides</td></tr>";
        tooltipHtml += "<tr><td colspan='2'><strong>Similarity</strong>: " + d3.format(",.2%")(similarities[row][col]) + "</td></tr>"
        tooltipHtml += "</tbody></table>";
        tooltip.html(tooltipHtml)
            .style("top", (pos.top + x.rangeBand() + 15) + "px")
            .style("left", (pos.left + 15) + "px")
            .style("visibility", "visible");
    }

    /**
     * Hides the info panel
     */
    function hideInfoPanel() {
        tooltip.style("visibility", "hidden");
    }

    /**
     * Requests a similarity calculation to the webserver if dirty
     */
    function calculateSimilarity() {
        if (dirty) {
            pancore.requestSimilarityCalculation();
        }
    }

    /*************** Public methods ***************/

    /**
     * Process new similarity data
     *
     * @param <Boolean> fullMatrix Is this a full matrix, or just a single row?
     * @param <SimObject> data New similarity data
     */
    that.addSimilarityData = function addSimilarityData(fullMatrix, data) {
        var id,
            id2,
            row;

        if (fullMatrix) {
            similarities = data;
        } else {
            id = data.id;
            row = data.row;
            for (id2 in similarities) {
                similarities[id2][id] = row[id2];
            }
            similarities[id] = row;
        }

        dirty = true;
        that.update();
    };

    /**
     * Use the clusterd order as the order for the table and the graph
     */
    that.useClusterOrder = function useClusterOrder() {
        pancore.updateOrder({
            'order' : order,
            'start' : 0,
            'stop' : order.length - 1
        });
        $('#reorder-header').addClass('hidden');
    };

    /**
     * Changes the order of the table based on the given order
     *
     * @param <Array> orderData The new order we want to set
     */
    that.setOrder = function setOrder(orderData) {
        order = orderData;
        that.setClustered(false);
        dirty = true;
        that.update();
    };

    /**
     * Redraws the entire matrix
     */
    that.redraw = function redraw() {
        // Check if we are currently active pane
        if (!that.isActiveTab()) {
            return;
        }

        dirty = true;

        $("#sim_matrix").html('');
        svg = d3.select("#sim_matrix").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("rect")
            .attr("class", "background")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#eeeeee");

        // create the tooltip
        tooltip = d3.select("#sim_matrix")
          .append("div")
            .attr("class", "tip")
            .style("position", "absolute")
            .style("top", "0px")
            .style("left", "0px")
            .style("z-index", "10")
            .style("visibility", "hidden");

        that.update();
    };

    /**
     * Updates the SimMatrix
     */
    that.update = function update() {
        // Check if we are currently active pane and dirty
        if (!that.isActiveTab()) {
            return;
        }
        if (!dirty) {
            return;
        }

        var dataArray = d3.entries(similarities);
        x.domain(order);

        // 50px is the max size of a square
        var minWidth = d3.min([width, 50 * order.length]);
        x.rangeBands([0, minWidth]);
        $('#cluster-div').css('height', minWidth + 30 + "px");
        d3.select(".background")
            .attr("width", minWidth)
            .attr("height", minWidth);

        var rows = svg.selectAll(".row")
            .data(dataArray, function (d) { return d.key; });

        rows.enter()
            .append("g")
                .attr("class", "row")
            .append("text")
                .attr("x", -6)
                .attr("y", x.rangeBand() / 2)
                .attr("dy", ".32em")
                .attr("text-anchor", "end")
                .text(function (d) { return metadata[d.key].name; });

        rows.each(function (d) {
            var cells = d3.select(this).selectAll(".cell")
                .data(d3.entries(d.value), function (d) { return d.key; });
            cells.enter().append("rect")
                .attr("class", "cell")
                .attr("x", 0)
                .attr("width", 0)
                .attr("height", 0)
                .style("fill-opacity", 0)
                .style("fill", "white")
                .on("mouseover", showInfoPanel)
                .on("mouseout", hideInfoPanel);

            cells.transition()
                .duration(transitionDuration)
                .attr("x", function (d) { return x(d.key); })
                .attr("width", x.rangeBand())
                .attr("height", x.rangeBand())
                .style("fill-opacity", function (d) { return z(d.value * d.value); })
                .style("fill", function (d) { return (d.value !== -1) ? "steelblue" : "white"; });

            cells.exit().remove();
        });

        rows.transition()
            .duration(transitionDuration)
            .attr("transform", function (d) { return "translate(0," + x(d.key) + ")"; });

        rows.selectAll("text")
            .transition()
                .duration(transitionDuration)
                .attr('y', x.rangeBand() / 2);

        rows.exit().remove();

        var columns = svg.selectAll(".column")
            .data(dataArray, function (d) { return d.key; });

        columns.enter().append("g")
                .attr("class", "column")
            .append("text")
                .attr("x", minWidth + 6)
                .attr("y", -x.rangeBand() / 2)
                .attr("dy", ".32em")
                .attr("text-anchor", "start")
                .text(function (d) { return metadata[d.key].name; });

        columns.transition()
            .duration(transitionDuration)
            .attr("transform", function (d) { return "translate(" + x(d.key) + ")rotate(90)"; });

        columns.selectAll("text")
            .transition()
                .duration(transitionDuration)
                .attr("x", minWidth + 6)
                .attr('y', -x.rangeBand() / 2);

        columns.exit().remove();

        dirty = false;
    };

    /**
     * Resets the state of the matrix
     */
    that.clearAllData = function clearAllData() {
        dirty = true;
        that.setClustered(false);
        similarities = {};
        order = [];
        metadata = {};
        newick = "";
        that.redraw();
    };

    /**
     * Draws a phylogenetic tree based on a newick string
     *
     * @param <String> n The tree in newick format
     * @param <Number> height Optional height of the tree
     */
    that.drawTree = function drawTree(n, height) {
        newick = n;
        $("#sim_graph").html("");
        if (height === undefined) {
            height = d3.min([500, 50 * order.length]);
        }
        d3.phylogram.build('#sim_graph', Newick.parse(n), {width: 180, height: height, skipLabels: true});
    };

    /**
     * Requests the clustering of the matrix to the pancore object
     */
    that.clusterMatrix = function clusterMatrix() {
        pancore.requestClustering();
    };

    /**
     * Adds a genome to the matrix.
     *
     * @param <Number> id The id of the genome
     * @param <String> name The name of the genome
     * @param <Number> size The number of peptides in the genome
     * @param <Number> pan The number of peptides in the pan
     */
    that.addGenome = function addGenome(id, name, size) {
        var i;

        // add the data to the lists
        metadata[id] = {'name': name, 'size': size};
        order.push(id);

        similarities[id] = {};
        for (i in similarities) {
            similarities[id][i] = -1;
            similarities[i][id] = -1;
        }

        that.setClustered(false);
        dirty = true;
        if (that.isActiveTab()) {
            delay(function () {
                calculateSimilarity();
                that.update();
            }, 1000);
        }
    };

    /**
     * Remove data from the matrix
     *
     * @param <Number> id The bioprojectId of the genome to remove
     */
    that.removeGenome = function removeGenome(id) {
        var id2;

        delete metadata[id];
        delete similarities[id];
        for (id2 in similarities) {
            delete similarities[id2][id];
        }
        order.splice(order.indexOf(id), 1);

        that.setClustered(false);
        dirty = true;
        that.update();
    };

    /**
     * Call this method to indicate that the current view is or isn't clustered.
     * This will enable or disable the clustering buttons.
     *
     * @param <Boolean> c is the matrix currently clustered?
     */
    that.setClustered = function setClustered(c) {
        // Check if value differs, if we don't do this we call fadeTo too many times
        if (c !== clustered) {
            if (!c) {
                $graphSelector.fadeTo('normal', 0.2);
                $clusterBtn.show();
                $('#reorder-header').addClass('hidden');
            } else {
                $graphSelector.fadeTo('fast', 1);
                $clusterBtn.hide();
                $('#reorder-header').removeClass('hidden');
            }
            clustered = c;
        }
    };

    /**
     * Returns true if the matrix tab is currently visible to the user
     */
    that.isActiveTab = function isActiveTab() {
        return $matrixTab.parent().hasClass("active");
    };

    /**
     * TODO
     */
    that.getDataAsCsv = function getDataAsCsv() {
        var csvString = ",",
            tempArray = [],
            i;

        for (i = 0; i < order.length; i++) {
            tempArray.push('"' + metadata[order[i]].name + '"');
        }
        csvString += tempArray.join(',') + "\n";

        for (i = 0; i < order.length; i++) {
            tempArray = [];
            tempArray.push('"' + metadata[order[i]].name + '"');
            tempArray.push.apply(tempArray, matrix[i]);
            csvString += tempArray.join(',') + "\n";
        }

        return csvString;
    };

    // Initialize the object
    init();

    return that;
};
