/**
 * Creates a SimMatrix object that includes the similarity matrix and
 * phylogenetic tree.
 *
 * @param <Pancore> args.pancore The Pancore object
 * @param <Worker> args.worker The Worker object processing the data
 * @param <GenomeTable> args.table The GenomeTable object
 */
var constructSimMatrix = function constructSimMatrix(args) {
    /*************** Private variables ***************/

    // Parameters
    var pancore = args.pancore,
        worker = args.worker,
        table = args.table;

    // UI variables
    var margin = {top: 20, right: 0, bottom: 200, left: 200},
        width = 500,
        height = 500;

    // D3 vars
    var svg,
        transitionDuration = 1000,
        x = d3.scale.ordinal().rangeBands([0, width]),
        z = d3.scale.linear().domain([0, 1]).clamp(true);

    // Constructor fields
    var names = [],
        order = [],
        oldDomain = [],
        treeOrder = [],
        matrix = [],
        matrixObject = {},
        clustered = undefined,
        dirty = false,
        newick;

    var $matrixTab = $('a[href="#sim_matrix_wrapper"]'),
        $graphSelector = $('#sim_graph'),
        $clusterBtn;

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
        $clusterBtn = $("#cluster-matrix-btn");
        $clusterBtn.click(function clusterButtonAction() {
            that.clusterMatrix();
        });

        // decluster matrix button
        $('#decluster-matrix').click(function declusterAction() {
            x.domain(oldDomain);
            dirty = true;
            setClustered(false);
            that.update();
        });

        $('#use-cluster-order').click(that.reorderTable);

        $('#sim_matrix').mouseout(function mouseOutAction() {
            $('#matrix-popover-table').html('');
        });

        x.domain([0, 1]);

        // Dummy newick value chosen randomly
        var dummyNewick = "((((A:0.2,B:0.2):0.1,C:0.3):0.4,(F:0.4,D:0.4):0.3):0.3,E:1.0)";
        that.drawTree(dummyNewick, 500);
    }

    /**
     * Add popover to all cells
     *
     * @param <?> row TODO
     * @param <?> j TODO
     */
    function popOverF(row, j) {
        d3.select(this).selectAll(".cell")
            .each(function (d, i) {
                var first = names[order[i]];
                var second = names[order[j]];
                var content = d >= 0 ? d3.format(".2%")(d) : "Not calculated";
                var table = "";
                if (d >= 0) {
                    table += "<table class='table'><thead><tr><th></th><th>" + first.name + "</th><th>" + second.name + "</th></tr></thead>";
                    table += "<tr><td>Core Peptides</td><td>" + first.core + "</td><td>" + second.core + "</td></tr>";
                    table += "<tr><td>Pan Peptides</td><td>" + first.pan + "</td><td>" + second.pan + "</td></tr>";
                    table += "<tr><td>Peptidome Similarity</td><td colspan='2' align='center'>" + content + "</td></tr></table>";
                }
                $(this).hover(function () {
                    $('#matrix-popover-table').html(table);
                });
            });
    }

    /**
     * Call this method to indicate that the current view is or isn't clustered.
     * This will enable or disable the clustering buttons.
     *
     * @param <Boolean> c is the matrix currently clustered?
     */
    function setClustered(c) {
        // Check if value differs, if we don't do this we call fadeTo too many times
        // TODO: remove this min width thing
        var minWidth = setMinWidth();
        if (c !== clustered) {
            if (!c) {
                $graphSelector.fadeTo('normal', 0.2);
                $clusterBtn.show();
                $('#reorder-header').addClass('hidden');
            } else {
                $graphSelector.fadeTo('fast', 1);
                $clusterBtn.hide();
                $('#reorder-header').removeClass('hidden');
                $('#cluster-div').css('height', minWidth + 30 + "px");
                $('#matrix-popover-table').css('top', minWidth + 20 + 'px');
            }
            clustered = c;
        }

    }


    /**
     * Requests a similarity calculation to the webserver if dirty
     */
    function calculateSimilarity() {
        if (dirty) {
            pancore.requestSimilarityCalculation();
        }
    }

    // TODO: make this obsolete
    function sendToWorker(type, message) {
        worker.postMessage({'cmd': type, 'msg': message});
    }

    /**
     * Calculate the effective width needed for matrix
     * TODO: this shouldn't be here
     */
    function setMinWidth() {
        var minWidth = d3.min([width, 50 * order.length]);
        x.rangeBands([0, minWidth]);
        return minWidth;
    }

    /*************** Public methods ***************/

    /**
     * Receive new similarity data from the worker
     *
     * @param <Boolean> fullMatrix Is this a full matrix, or just a single row?
     * @param <SimObject> data New similarity data from the worker
     */
    that.addSimilarityData = function addSimilarityData(fullMatrix, data) {
        var id,
            id2,
            row;

        if (fullMatrix) {
            matrixObject = data;
        } else {
            id = data.id;
            row = data.row;
            for (id2 in matrixObject) {
                matrixObject[id2][id] = row[id2];
            }
            matrixObject[id] = row;
        }

        dirty = true;
        that.update();
    };

    /**
     * TODO
     *
     * TODO make private
     */
    that.reorderTable = function reorderTable() {
        var clusterOrder = [],
            domain = x.domain(),
            i;
        for (i = 0; i < order.length; i++) {
            clusterOrder.push(order[domain[i]]);
        }
        sendToWorker("recalculatePanCore", {'order': clusterOrder, start: 0, end: clusterOrder.length - 1});
        table.setOrder(clusterOrder);
        $('#reorder-header').addClass('hidden');
    };

    /**
     * Reorder the matrix based on the new order
     *
     * @param <?> newOrder TODO
     */
    that.reorder = function reorder(newOrder) {
        treeOrder = newOrder;
        oldDomain = x.domain().slice(0);
        x.domain(newOrder);

        setMinWidth();

        setClustered(true);

        var t = svg.transition().duration(transitionDuration);

        t.selectAll(".row")
            .delay(function (d, i) { return x(i) * 2; })
            .attr("transform", function (d, i) { return "translate(0," + x(i) + ")"; })
            .selectAll(".cell")
            .delay(function (d, i) { return x(i) * 2; })
            .attr("x", function (d, i) { return x(i); });

        t.selectAll(".column")
            .delay(function (d, i) { return x(i) * 2; })
            .attr("transform", function (d, i) { return "translate(" + x(i) + ")rotate(90)"; });
        dirty = true;
    };

    /**
     * TODO
     *
     * @param <?> orderData TODO
     */
    that.updateOrder = function updateOrder(orderData) {
        var newDomain = [],
            i;
        for (i = 0; i < order.length; i++) {
            newDomain.push(order.indexOf(orderData[i]));
        }
        x.domain(newDomain);

        setClustered(false);
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

        var dataArray = d3.entries(matrixObject);
        x.domain(order);

        // allow for smaller scale matrices
        // TODO: remove me
        var minWidth = setMinWidth();
        d3.select(".background")
            .attr("width", minWidth)
            .attr("height", minWidth);

        var rows = svg.selectAll(".row")
            .data(dataArray, function (d) { return d.key;});

        rows.enter()
            .append("g")
                .attr("class", "row")
            .append("text")
                .attr("x", -6)
                .attr("y", x.rangeBand() / 2)
                .attr("dy", ".32em")
                .attr("text-anchor", "end")
                .text(function (d) { return names[d.key].name; });

        rows.each(function (d) {
            var cells = d3.select(this).selectAll(".cell")
                .data(d3.entries(d.value), function (d) { return d.key;});
            cells.enter().append("rect")
                .attr("class", "cell")
                .attr("x", 0)
                .attr("width", 0)
                .attr("height", 0)
                .style("fill-opacity", 0)
                .style("fill", "white");

            cells.transition()
                .duration(transitionDuration)
                .attr("x", function (d) { return x(d.key); })
                .attr("width", x.rangeBand())
                .attr("height", x.rangeBand())
                .style("fill-opacity", function (d) { return z(d.value * d.value); })
                .style("fill", function (d) { return (d.value != -1) ? "steelblue" : "white"; });

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
            .data(dataArray, function (d) { return d.key;});

        columns.enter().append("g")
                .attr("class", "column")
            .append("text")
                .attr("x", minWidth + 6)
                .attr("y", -x.rangeBand() / 2)
                .attr("dy", ".32em")
                .attr("text-anchor", "start")
                .text(function (d) { return names[d.key].name; });

        columns.transition()
            .duration(transitionDuration)
            .attr("transform", function (d) { return "translate(" + x(d.key) + ")rotate(90)"; });

        columns.selectAll("text")
            .transition()
                .duration(transitionDuration)
                .attr("x", minWidth + 6)
                .attr('y', -x.rangeBand() / 2);

        columns.exit().remove();

        rows.each(popOverF);

        dirty = false;
    }

    /**
     * TODO
     */
    that.clearAllData = function clearAllData() {
        dirty = true;
        setClustered(false);
        matrix = [];
        matrixObject = {};
        order = [];
        names = [];
        treeOrder = [];
        newick = "";
        x.domain([]);
        that.redraw();
    };

    /**
     * TODO
     *
     * @param <?> n TODO
     * @param <?> height TODO
     */
    that.drawTree = function drawTree(n, height) {
        newick = n;
        var parsed = Newick.parse(n);
        $("#sim_graph").html("");
        var min_height;
        if (height === undefined) {
            min_height = d3.min([500, 50 * matrix.length]);
        } else {
            min_height = height;
        }

        d3.phylogram.build('#sim_graph', parsed, {width: 180, height: min_height, skipLabels: true}, treeOrder);
    };

    /**
     * TODO
     */
    that.clusterMatrix = function clusterMatrix() {
        sendToWorker('clusterMatrix');
    };

    /**
     * Adds a genome to the matrix.
     *
     * TODO: I don't think pan and core are usefull. They are only used in the
     * table. Size should be useful
     *
     * @param <Number> id The id of the genome
     * @param <String> name The name of the genome
     * @param <Number> core The number of peptides in the core
     * @param <Number> pan The number of peptides in the pan
     */
    that.addGenome = function addGenome(id, name, core, pan) {
        var i;

        // add the data to the lists
        names[id] = {'name': name, 'core': core, 'pan': pan};
        order.push(id);

        matrixObject[id] = {};
        for (i in matrixObject) {
            matrixObject[id][i] = -1;
            matrixObject[i][id] = -1;
        }

        setClustered(false);
        dirty = true;
        if (that.isActiveTab()) {
            calculateSimilarity();
            that.update();
        }
    };

    /**
     * Remove data from the matrix
     *
     * @param <?> id TODO
     */
    that.removeGenome = function removeGenome(id) {
        delete names[id];
        var index = order.indexOf(id),
            i;
        order.splice(index, 1);

        matrix.splice(index, 1);
        for (i = 0; i < matrix.length; i++) {
            // add -1 to the end
            matrix[i].splice(index, 1);
        }

        setClustered(false);
        dirty = true;
        that.update();
    };

    /**
     * TODO
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
            tempArray.push('"' + names[order[i]].name + '"');
        }
        csvString += tempArray.join(',') + "\n";

        for (i = 0; i < order.length; i++) {
            tempArray = [];
            tempArray.push('"' + names[order[i]].name + '"');
            tempArray.push.apply(tempArray, matrix[i]);
            csvString += tempArray.join(',') + "\n";
        }

        return csvString;
    };

    // Initialize the object
    init();

    return that;
};
