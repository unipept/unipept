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
    var margin = {top: 20, right: 0, bottom: 200, left: 220},
        width = 500,
        height = 500,
        treeWidth = 180,
        fullWidth = treeWidth + width + margin.left + margin.right,
        fullHeight = height + margin.top + margin.bottom;

    // D3 vars
    var svg,
        matrixSvg,
        treeSvg,
        blur,
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
        $clusterBtn = $("#cluster-matrix-btn");

    var that = {};

    /*************** Private methods ***************/

    /**
     * Initializes the SimMatrix
     */
    function init() {
        init_phylogram();

        // calculate similarity and update on tab switch
        $matrixTab.on('shown.bs.tab', function tabSwitchAction() {
            calculateSimilarity();
            that.update();
        });

        // cluster matrix button
        $clusterBtn.click(that.clusterMatrix);

        // decluster matrix button
        $('#decluster-matrix').click(function declusterAction() {
            that.setOrder(table.getOrder());
        });

        $('#use-cluster-order').click(that.useClusterOrder);

        that.redraw(true);

        // Dummy newick value chosen randomly
        var dummyNewick = "((((A:0.2,B:0.2):0.1,C:0.3):0.4,(F:0.4,D:0.4):0.3):0.3,E:1.0)";
        that.drawTree(dummyNewick, 500);
        that.setClustered(false);
    }

    /**
     * Shows the info panel with info about the similarities
     *
     * @param <Number> d.key The bioprojectid associated with the square
     */
    function showInfoPanel(d) {
        var col = d.key,
            row = d3.select(this.parentNode).datum().key,
            pos = $(this).offset(),
            tooltipHtml = "<table class='table'>";

        if(window.fullScreenApi.isFullScreen()) {
            pos.top -= $("#sim_matrix").offset().top;
        }
        tooltipHtml += "<thead><tr><th>Name</th><th>Genome size</th></tr></thead><tbody>";
        tooltipHtml += "<tr><td>" + metadata[row].name + "</td><td>" + d3.format(",")(metadata[row].size) + " peptides</td></tr>";
        tooltipHtml += "<tr><td>" + metadata[col].name + "</td><td>" + d3.format(",")(metadata[col].size) + " peptides</td></tr>";
        tooltipHtml += "<tr><td colspan='2'><strong>Similarity</strong>: " + d3.format(",.2%")(similarities[row][col]) + "</td></tr>"
        tooltipHtml += "</tbody></table>";
        tooltip.html(tooltipHtml)
            .style("top", (pos.top + x.rangeBand() + 5) + "px")
            .style("left", (pos.left + x.rangeBand() + 5) + "px")
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
     * Handles the transition from and to fullscreen mode
     *
     * @param <Boolean> isFullscreen Is the page in full screen mode?
     */
    that.handleFullScreen = function handleFullScreen(isFullscreen) {
        var w = fullWidth,
            h = fullHeight,
            destination = "body";
        if (isFullscreen) {
            w = $(window).width();
            h = $(window).height();
            destination = "#sim_matrix";
        }
        $("#sim_matrix svg").attr("width", w);
        $("#sim_matrix svg").attr("height", h);
        $("#matrix-tip").appendTo(destination);
    };

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
            for (id in data) {
                row = data[id];
                for (id2 in similarities) {
                    similarities[id2][id] = row[id2];
                }
                similarities[id] = row;
            }
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
     * Changes the order of the genomes
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
     *
     * @param <Boolean> force Force the redraw, even if it's not the active tab
     */
    that.redraw = function redraw(force) {
        // Check if we are currently active pane
        if (!force && !that.isActiveTab()) {
            return;
        }

        dirty = true;

        // Remove all the stuff
        $("#sim_matrix").empty();
        $("#matrix-tip").remove();

        svg = d3.select("#sim_matrix").append("svg")
            .attr("version", "1.1")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("viewBox", "0 0 " + fullWidth + " " + fullHeight)
            .attr("width", fullWidth)
            .attr("height", fullHeight);
        treeSvg = svg.append("g")
            .attr("id", "tree-svg")
            .attr("transform", "translate(20," + margin.top + ")")
            .attr("filter", "url(#blur)");
        matrixSvg = svg.append("g")
            .attr("transform", "translate(" + (treeWidth + margin.left) + "," + margin.top + ")");

        // Add the blur effect definition
        blur = svg.append("defs")
            .append("filter")
                .attr("id", "blur")
                .attr("x", 0)
                .attr("y", 0)
            .append("feGaussianBlur")
                .attr("in", "SourceGraphic")
                .attr("stdDeviation", 5);

        matrixSvg.append("rect")
            .attr("class", "background")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#eeeeee");

        // create the tooltip
        tooltip = d3.select("body")
          .append("div")
            .attr("class", "tip")
            .attr("id", "matrix-tip")
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

        var rows = matrixSvg.selectAll(".row")
            .data(dataArray, function (d) { return d.key; });

        rows.enter()
            .append("g")
                .attr("class", "row")
            .append("text")
                .attr("x", -6)
                .attr("y", x.rangeBand() / 2)
                .attr("dy", ".32em")
                .attr("text-anchor", "end")
                .text(function (d) { return metadata[d.key].abbreviation; });

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
                .attr("stroke", "white")
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

        var columns = matrixSvg.selectAll(".column")
            .data(dataArray, function (d) { return d.key; });

        columns.enter().append("g")
                .attr("class", "column")
            .append("text")
                .attr("x", minWidth + 6)
                .attr("y", -x.rangeBand() / 2)
                .attr("dy", ".32em")
                .attr("text-anchor", "start")
                .text(function (d) { return metadata[d.key].abbreviation; });

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
        $("#tree-svg").empty();
        if (height === undefined) {
            height = d3.min([500, 50 * order.length]);
        }
        d3.phylogram.build('#sim_graph', Newick.parse(n), {width: 180, height: height, skipLabels: true, vis: treeSvg});
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
     * @param <Genome> genome The genome object we want to add
     */
    that.addGenome = function addGenome(genome) {
        var id = genome.bioproject_id,
            name = genome.name,
            size = genome.peptides,
            abbreviation = genome.abbreviation,
            i;

        // add the data to the lists
        metadata[id] = {
            'name' : name,
            'size' : size,
            'abbreviation' : abbreviation
        };
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
        if (c !== clustered) {
            if (!c) {
                $clusterBtn.show();
                $('#reorder-header').addClass('hidden');
                blur.transition().duration(transitionDuration).attr("stdDeviation", 5);
            } else {
                $clusterBtn.hide();
                $('#reorder-header').removeClass('hidden');
                blur.transition().duration(transitionDuration).attr("stdDeviation", 0);
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
     * Converts this object to a CSV string
     */
    that.getDataAsCsv = function getDataAsCsv() {
        var csvString = ",",
            tempArray = [],
            i,
            j;

        for (i = 0; i < order.length; i++) {
            tempArray.push('"' + metadata[order[i]].name + '"');
        }
        csvString += tempArray.join(',') + "\n";

        for (i = 0; i < order.length; i++) {
            tempArray = [];
            tempArray.push('"' + metadata[order[i]].name + '"');
            for (j = 0; j < order.length; j++) {
                tempArray.push(similarities[order[i]][order[j]]);
            }
            csvString += tempArray.join(',') + "\n";
        }

        return csvString;
    };

    /**
     * Invokes a modal dialog giving the option to download the tree in newick
     * format, or the similarity data in csv format.
     */
    that.handleSaveData = function handleSaveData() {
        $("#downloadModal").remove();
        $("body").append("<div id='downloadModal' class='modal fade' tabindex='-1' role='dialog'>" +
          "<div class='modal-dialog modal-sm'>" +
            "<div class='modal-content'>" +
              "<div class='modal-header'>" +
                "<button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>" +
                "<h3 class='modal-title' id='mySmallModalLabel'>Download peptidome clustering data</h3>" +
              "</div>" +
              "<div class='modal-body'>" +
                "<p>You can download the underlying data of the phylogenetic tree in <a href='http://en.wikipedia.org/wiki/Newick_format' target='_blank'>Newick format</a>" +
                " and the similarities of the matrix in CSV-format.</p>" +
                "<div class='buttons text-center'>" +
                  "<button id='download-newick' class='btn btn-primary'><i class='glyphicon glyphicon-download'></i> Download newick</button>" +
                  "<button id='download-csv' class='btn btn-primary'><i class='glyphicon glyphicon-download'></i> Download similarities</button>" +
                "</div>" +
              "</div>" +
            "</div>" +
          "</div>" +
        "</div>");
        $("#download-csv").click(function (){
            downloadDataByForm(that.getDataAsCsv(), "similarity_data.csv");
        });
        $("#download-newick").click(function (){
            downloadDataByForm(newick, "phylogenetic_tree_newick.txt");
        });
        $modal = $("#downloadModal").modal();
    };

    // Initialize the object
    init();

    return that;
};
