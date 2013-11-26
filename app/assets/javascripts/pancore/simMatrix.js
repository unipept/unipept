var constructSimMatrix = function constructSimMatrix(worker) {
    /*************** Private variables ***************/
    /* UI variables */
    var margin = {top: 200, right: 0, bottom: 10, left: 200},
        matrix_padding = 0.03,
        width = 500,
        height = 500;

    /* variable to contain our d3 selector */
    var svg;

    /* Scales */
    var x = d3.scale.ordinal().rangeBands([0, width], matrix_padding),
        z = d3.scale.linear().domain([0, 1]).clamp(true);

    /* Constructor fields */
    var names = [],
        order = [],
        matrix = [],
        worker = worker;

    var that = {};

    /*************** Private methods ***************/

    /* generate a row */
    function rowF(row) {
        var cell = d3.select(this).selectAll(".cell")
            //.data(row.filter(function(d) { return d.z; }))
            .data(row)
            .attr("x", function(d, i) { return x(i); })
            .attr("width", x.rangeBand())
            .attr("height", x.rangeBand())
            .style("fill-opacity", function(d) { return z(d * d); })
            .style("fill", function(d) { return (d != -1) ? "steelblue" : "red" })
          .enter().append("rect")
            .attr("class", "cell")
            .attr("x", function(d, i) { return x(i); })
            .attr("width", x.rangeBand())
            .attr("height", x.rangeBand())
            .style("fill-opacity", function(d) { return z(d * d); })
            .style("fill", function(d) { return (d != -1) ? "steelblue" : "red" });
    }

    /* TODO: can this be abstracted? */
    function sendToWorker(type, message) {
        worker.postMessage({'cmd': type, 'msg': message});
    }

    function setupWorker() {
        /* setup worker */
        worker.addEventListener('message', function (e) {
            var data = e.data;
            switch (data.type) {
            case 'RowUpdated':
                rowUpdated(data.msg.row, data.msg.data);
                break;
            case 'RowRemoved':
                rowRemoved(data.msg.row);
                break;
            case 'NewOrder':
                that.reOrder(data.msg);
                break;
            case 'log':
                console.log(data.msg);
                break;
            }
        });
    }


    function rowAdded(row) {
        matrix.push(row);
    }

    /* receive a new row from the worker */
    function rowUpdated(row_index, row) {
        // TODO: animations!
        matrix[row_index] = row;
        that.reDraw();
    }
    /* a row was removed, better fix the UI */
    function rowRemoved(row_index) {
        // TODO: animations!
        matrix.splice(row_index, 1);
    }

    /**
     *
     * initializes the Matrix
     *
     */
    function init() {
        setupWorker();
        $("#sim_matrix_buttons").prepend("<button id='calculate-matrix-btn' class='btn btn-default'><i class='glyphicon glyphicon-refresh'></i> Calculate Similarity Matrix</button>");
        $("#calculate-matrix-btn").click(function () {
            that.calculateSimilarity();
        });
        $("#sim_matrix_buttons").prepend("<button id='cluster-matrix-btn' class='btn btn-default'><i class='glyphicon glyphicon-refresh'></i> Cluster Similarity Matrix</button>");
        $("#cluster-matrix-btn").click(function () {
            that.clusterMatrix();
        });
    }

    /*************** Public methods ***************/

    /* reOrder the matrix based on the new order */
    that.reOrder = function (newOrder) {
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

    that.reDraw = function () {
        /* TODO: instead of appending, this needs more selectAll I think */
        if (! svg) {
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
        }
        // The default sort order.
        x.domain(d3.range(order.length));

        var row = svg.selectAll(".row")
            .data(matrix)

        row.attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
            .each(rowF);

        row.selectAll("text").attr('y', x.rangeBand() / 2);

        row_enter = row.enter().append("g")
            .attr("class", "row")
            .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
            .each(rowF);

        row_enter.append("line")
            .attr("x2", width)
            .attr("stroke", "#ffffff");

        row_enter.append("text")
            .attr("x", -6)
            .attr("y", x.rangeBand() / 2)
            .attr("dy", ".32em")
            .attr("text-anchor", "end")
            .text(function(d, i) { return names[order[i]].name; });

        var column = svg.selectAll(".column")
            .data(matrix)
            .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; })
            .attr("y", x.rangeBand() / 2);

        column_enter = column.enter().append("g")
            .attr("class", "column")
            .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

        column_enter.append("line")
            .attr("x1", -width)
            .attr("stroke", "#ffffff");

        column_enter.append("text")
            .attr("x", 6)
            .attr("y", x.rangeBand() / 2)
            .attr("dy", ".32em")
            .attr("text-anchor", "start")
            .text(function(d, i) { return names[order[i]].name; });

    }

    /* calculate similarity */
    that.calculateSimilarity = function () {
        /* TODO: keep track of what is already calculated */
        sendToWorker('calculateSimilarity');
    }

    that.clusterMatrix = function () {
        sendToWorker('clusterMatrix');
    }

    /* TODO: removing / adding is not complete yet */

    /* add data to the matrix */
    that.addGenome = function(id, name) {
        names[id] = {'name': name};
        order.push(id);
        that.reDraw();
    }

    /* remove data from the matrix */
    that.removeGenome = function(id) {
        delete names[id];
        var index = order.indexOf(id);
        order.splice(index, 1);
    }

    // initialize the object
    init();

    return that;
};
