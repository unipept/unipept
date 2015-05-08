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
    var margin = {top: 15, right: 200, bottom: 200, left: 20},
        width = 500,
        height = 500,
        treeWidth = 200,
        fullWidth = treeWidth + width + margin.left + margin.right,
        fullHeight = height + margin.top + margin.bottom;

    // D3 vars
    var svg,
        matrixSvg,
        buttonSvg,
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
        addingGenomes = false,
        dirty = false,
        selectedSimilarity = "simDefault",
        clustered,
        newick;

    var that = {};

    /*************** Private methods ***************/

    /**
     * Initializes the SimMatrix
     */
    function init() {
        init_phylogram();

        // calculate similarity and update on tab switch
        $('.peptidome-clustering-tab').on('shown.bs.tab', function tabSwitchAction() {
            calculateSimilarity();
            that.update();
        });

        // decluster matrix button
        $('#decluster-matrix').click(function declusterAction() {
            that.setOrder(table.getOrder());
        });

        $('#use-cluster-order').click(that.useClusterOrder);

        $("#similarity-selector a").click(function (event) {
            event.preventDefault();
            selectedSimilarity = $(this).data("sim");
            $("#similarity-selector .similarity-type").text($(this).text().toLowerCase());
            that.setClustered(false);
            dirty = true;
            that.update();
        });
        $("#similarity-selector a").tooltip({placement : "left", container : "body"});

        that.redraw(true);
    }

    /**
     * Draws a dummy newick tree
     */
    function drawDummyTree() {
        var dummyNewick = "((((A:0.2,B:0.2):0.1,C:0.3):0.4,(F:0.4,D:0.4):0.3):0.3,E:1.0)";
        that.drawTree(dummyNewick, 500);
        that.setClustered(false);
    }

    /**
     * Shows the info panel with info about the similarities
     *
     * @param <Number> d.key The ids associated with the square
     */
    function showInfoPanel(d) {
        var col = d.key,
            row = d3.select(this.parentNode).datum().key,
            pos = $(this).offset(),
            tooltipHtml = "<table class='table'>";

        if (window.fullScreenApi.isFullScreen()) {
            pos.top -= $("#sim_matrix").offset().top;
        }
        tooltipHtml += "<thead><tr><th>Name</th><th>Peptidome size</th></tr></thead><tbody>";
        tooltipHtml += "<tr><td>" + metadata[row].name + "</td><td class='num'>" + d3.format(",")(metadata[row].size) + " peptides</td></tr>";
        tooltipHtml += "<tr><td>" + metadata[col].name + "</td><td class='num'>" + d3.format(",")(metadata[col].size) + " peptides</td></tr>";
        tooltipHtml += "<tr><td colspan='2' class='fat'><strong>" + d3.format(",")(d.value.intersection) + "</strong> common peptides <span class='pull-right'><strong>" + d3.format(",")(d.value.union) + "</strong> distinct peptides</span></td></tr>";
        tooltipHtml += "<tr><td colspan='2' class='sim'><strong>" + d3.format(",.2%")(similarities[row][col][selectedSimilarity]) + "</strong> similarity</td></tr>";
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

    /**
     * Returns true if the two order arrays are the same
     */
    function sameOrder(order1, order2) {
        var i = order1.length;
        if (i !== order2.length) {
            return false;
        }
        while (i--) {
            if (order1[i] !== order2[i]) {
                return false;
            }
        }
        return true;
    }

    /*************** Public methods ***************/

    /**
     * Handles the transition from and to fullscreen mode
     *
     * @param <Boolean> isFullscreen Is the page in full screen mode?
     */
    that.setFullScreen = function setFullScreen(isFullScreen) {
        // the delay is because the event fires before we're in fullscreen
        // so the height en width functions don't give a correct result
        // without the delay
        setTimeout(function () {
            var w = fullWidth,
                h = fullHeight;
            if (isFullScreen) {
                w = $(window).width();
                h = $(window).height() - 44;
            }
            $("#sim_matrix svg").attr("width", w);
            $("#sim_matrix svg").attr("height", h);
        }, 1000);
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
        if (addingGenomes) {
            setTimeout(that.update, transitionDuration);
        } else {
            that.update();
        }
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
        if (!sameOrder(order, orderData)) {
            order = orderData;
            that.setClustered(false);
            dirty = true;
            that.update();
        }
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
            .attr("height", fullHeight)
            .style("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif");
        treeSvg = svg.append("g")
            .attr("id", "tree-svg")
            .attr("transform", "translate(20," + margin.top + ")")
            .attr("filter", "url(#blur)");
        matrixSvg = svg.append("g")
            .attr("transform", "translate(" + (treeWidth + margin.left) + "," + margin.top + ")");
        buttonSvg = svg.append("g")
            .attr("id", "button-svg")
            .attr("transform", "translate(20," + margin.top + ")")
            .style("cursor", "pointer")
            .on("click", that.clusterMatrix);

        buttonSvg.append("rect")
            .attr("width", treeWidth)
            .attr("height", height)
            .attr("fill", "white")
            .attr("stroke", "none")
            .attr("fill-opacity", 0);
        var buttonText = buttonSvg.append("text")
            .attr("text-anchor", "middle")
            .attr("y", height / 2)
            .style("font-weight", "bold")
            .style("font-size", "16pt");
        buttonText.append("tspan").text("click to").attr("x", treeWidth / 2);
        buttonText.append("tspan").text("cluster matrix").attr("dy", 30).attr("x", treeWidth / 2);

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
            .attr("width", 0)
            .attr("height", 0)
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

        drawDummyTree();
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

        setTimeout(function () { addingGenomes = false; }, transitionDuration);

        var dataArray = d3.entries(similarities);
        x.domain(order);

        // 50px is the max size of a square
        var minWidth = d3.min([width, 50 * order.length]);
        x.rangeBands([0, minWidth]);
        $('#cluster-div').css('height', minWidth + 30 + "px");
        d3.select(".background")
            .transition()
            .duration(transitionDuration)
            .attr("width", minWidth)
            .attr("height", minWidth);

        var rows = matrixSvg.selectAll(".row")
            .data(dataArray, function (d) { return d.key; });

        rows.enter()
            .append("g")
                .attr("class", "row")
            .append("text")
                .attr("x", minWidth + 6)
                .attr("y", x.rangeBand() / 2)
                .attr("dy", ".32em")
                .attr("text-anchor", "begin")
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
                .style("fill-opacity", function (d) { return d.value ? z(d.value[selectedSimilarity] * d.value[selectedSimilarity]) : 1; })
                .style("fill", function (d) { return d.value ? "steelblue" : "white"; });

            cells.exit().remove();
        });

        rows.transition()
            .duration(transitionDuration)
            .attr("transform", function (d) { return "translate(0," + x(d.key) + ")"; });

        rows.selectAll("text")
            .transition()
                .duration(transitionDuration)
                .attr("x", minWidth + 6)
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
        d3.phylogram.build('#sim_graph', Newick.parse(n), that, {width: 180, height: height, skipLabels: true, vis: treeSvg, duration: transitionDuration});
    };

    /**
     * Requests the clustering of the matrix to the pancore object
     */
    that.clusterMatrix = function clusterMatrix() {
        pancore.requestClustering(selectedSimilarity);
    };

    /**
     * Adds a genome to the matrix.
     *
     * @param <Genome> genome The genome object we want to add
     */
    that.addGenome = function addGenome(genome) {
        var id = genome.id,
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
            similarities[id][i] = false;
            similarities[i][id] = false;
        }

        that.setClustered(false);
        dirty = true;
        addingGenomes = true;
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
     * @param <Number> id The id of the genome to remove
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
                buttonSvg.style("visibility", "visible");
                $('#reorder-header').addClass('hidden');
                blur.transition().duration(transitionDuration).attr("stdDeviation", 5);
            } else {
                buttonSvg.style("visibility", "hidden");
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
        return $("#sim_matrix_wrapper").hasClass("active");
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
                tempArray.push(similarities[order[i]][order[j]][selectedSimilarity]);
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
          "<div class='modal-dialog'>" +
            "<div class='modal-content'>" +
              "<div class='modal-header'>" +
                "<button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>" +
                "<h3 class='modal-title' id='mySmallModalLabel'>Download peptidome clustering data</h3>" +
              "</div>" +
              "<div class='modal-body'>" +
                "<p>You can download the underlying data of the phylogenetic tree in <a href='http://en.wikipedia.org/wiki/Newick_format' target='_blank'>Newick format</a>" +
                " and the similarities of the matrix in CSV-format.</p>" +
                "<div class='buttons text-center'>" +
                  "<button id='download-newick' class='btn btn-primary'><span class='glyphicon glyphicon-download'></span> Download newick tree</button>" +
                  "<button id='download-csv' class='btn btn-primary'><span class='glyphicon glyphicon-download'></span> Download similarities</button>" +
                "</div>" +
              "</div>" +
            "</div>" +
          "</div>" +
        "</div>");
        $("#download-csv").click(function () {
            downloadDataByForm(that.getDataAsCsv(), "similarity_data.csv");
        });
        $("#download-newick").click(function () {
            downloadDataByForm(newick, "phylogenetic_tree_newick.txt");
        });
        $("#downloadModal").modal();
    };

    // Initialize the object
    init();

    return that;
};
