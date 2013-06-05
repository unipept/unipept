function init_pancore() {
    // Data and workers
    var visData = [],
        tableData = {},
        worker = new Worker("/assets/workers/pancore_worker.js");

    // D3 vars
    var svg,
        tooltip,
        mouseOverWidth,
        dragging = {},
        isDragging = false;

    // animation stuff
    var transitionDuration = 500,
        mayStartAnimation = true,
        dataQueue = [],
        toLoad;

    // Colors
    var panColor = "steelblue",
        coreColor = "#ff7f0e";

    // Size
    var margin = {top: 20, right: 20, bottom: 170, left: 60},
        fullWidth = 920,
        fullHeight = 600,
        width = fullWidth - margin.left - margin.right,
        height = fullHeight - margin.top - margin.bottom;

    // Scales
    var x = d3.scale.ordinal()
        .rangePoints([0, width], 1),
        y = d3.scale.linear()
        .range([height, 0]);

    // Axes
    var xAxis = d3.svg.axis()
        .scale(x)
        .tickFormat(function (d) { return tableData[d].name; })
        .orient("bottom"),
        yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    // Graph lines helpers
    var panLine = d3.svg.line()
        .interpolate("linear")
        .x(function (d) { return x(d.bioproject_id); })
        .y(function (d) { return y(d.pan); });
    var coreLine = d3.svg.line()
        .interpolate("linear")
        .x(function (d) { return x(d.bioproject_id); })
        .y(function (d) { return y(d.core); });

    // Add eventhandlers to the worker
    worker.addEventListener('message', function (e) {
        var data = e.data;
        switch (data.type) {
        case 'log':
            console.log(data.msg);
            break;
        case 'error':
            if (data.msg.msg != "") {
                error(data.msg.error, data.msg.msg);
            } else {
                error(data.msg.error);
            }
            break;
        case 'addData':
            addData(data.msg);
            break;
        case 'setVisData':
            setVisData(data.msg);
            break;
        default:
            console.log(data.msg);
        }
    }, false);
    worker.addEventListener('error', function (e) {
        error(e);
    }, false);

    // Add handler to the form
    $("#load_proteome").click(function () {
        setLoading(true);
        clearAllData();

        var id = $("#species_id").val(),
            url = "/pancore/genomes/" + id + ".json";
        $.getJSON(url, function (genomes) {
            clearTable();
            toLoad = genomes.length;
            for (var i = 0; i < genomes.length ; i++) {
                tableData[genomes[i].bioproject_id] = {"bioproject_id" : genomes[i].bioproject_id, "name" : genomes[i].name, "status" : "Loading...", "position" : 100 + i};
                loadData(genomes[i].bioproject_id);
            }
            updateTable();
            setTableMessage("refresh", "Please wait while we load the data for these genomes.");
        })
        .fail(function () {
            error("request error for " + url, "It seems like something went wrong while we loaded the data");
        });
        return false;
    });

    // Make table sortable
    $("#genomes_table").disableSelection();
    $("#genomes_table tbody").sortable({
        axis: 'y',
        containment: '.split-right',
        cursor: 'url(/closedhand.cur) 7 5, move',
        stop: function () {
            var r = calculateTablePositions();
            updateTable();
            sendToWorker("recalculatePanCore", {"order" : r.order, "start" : r.start, "stop" : r.stop});
        }
    });

    // set up the fullscreen stuff
    if (fullScreenApi.supportsFullScreen) {
        $("#buttons-pancore").prepend("<button id='zoom-btn' class='btn btn-mini'><i class='icon-resize-full'></i> Enter full screen</button>");
        $("#zoom-btn").click(function () {
            // track full screen
            _gaq.push(['_trackEvent', 'Pancore', 'Full Screen']);
            window.fullScreenApi.requestFullScreen($("#pancore_graph").get(0));
            
        });
        $(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', resizeFullScreen);
    }

    function resizeFullScreen() {
        setTimeout(function () {
            var w = fullWidth,
                h = fullHeight;
            if (window.fullScreenApi.isFullScreen()) {
                w = $(window).width();
                h = $(window).height();
            }
            $("#pancore_graph svg").attr("width", w);
            $("#pancore_graph svg").attr("height", h);
        }, 100);
    }

    // set up save image stuff
    $("#buttons-pancore").prepend("<button id='save-btn' class='btn btn-mini'><i class='icon-download'></i> Save as image</button>");
    $("#save-btn").click(function () {
        // track save image event
        _gaq.push(['_trackEvent', 'Pancore', 'Save Image']);

        var svg = $("#pancore_graph svg").wrap("<div></div>").parent().html();
        $.post("/convert", { image: svg }, function (data) {
            $("#save-as-modal .modal-body").html("<img src='" + data + "' />");
            $("#save-as-modal").modal();
        });
    });

    // Draw the graph
    redrawGraph();

    // Load sample data
    $("#species_id").val(470);
    $("#load_proteome").click();

    // Sends a command and message to the worker
    function sendToWorker(command, message) {
        worker.postMessage({'cmd': command, 'msg': message});
    }

    // Loads peptides, based on bioproject_id
    function loadData(bioproject_id) {
        // offload this to the worker
        sendToWorker("loadData", {"bioproject_id": bioproject_id});
    }

    // Gets called when the data is (done) loading
    function setLoading(loading) {
        if (loading) {
            $("#load_proteome").button('loading');
            setTableMessage("refresh", "Please wait while we load the genomes for this species.");
            $("#genomes_table tbody").sortable("option", "disabled", true);
        } else {
            $("#load_proteome").button('reset');
            setTableMessage("chevron-down", "Drag rows to reorder them in the chart.");
            $("#genomes_table tbody").sortable("option", "disabled", false);
        }
    }

    // Adds new dataset to the data array
    function addData(data) {
        dataQueue.push(data);
        tryUpdateGraph();
    }

    // Removes a genomes from the data array
    function removeData(genome) {
        var id = genome.bioproject_id;
        delete tableData[id];
        updateTable();
        var r = calculateTablePositions();
        sendToWorker("removeData", {"bioproject_id" : id, "order" : r.order, "start" : r.start});
    }

    // Sets new pancore data
    function setVisData(data) {
        visData = data;
        for (var i in tableData) {
            tableData[i].status = "Done";
        }
        updateGraph();
        updateTable();
    }

    // Resets the data array
    function clearAllData() {
        sendToWorker("clearAllData", "");
        visData = [];
        tableData = {};

        updateGraph();
        clearTable();
    }

    // Adds the next datapoint to the animation after the current
    // animation is done.
    function tryUpdateGraph() {
        if (toLoad === 0) {
            return;
        }
        if (mayStartAnimation) {
            mayStartAnimation = false;
            var data,
                addedSomething = false;
            while (dataQueue.length > 0) {
                addedSomething = true;
                data = dataQueue.shift();
                visData.push(data);
                tableData[data.bioproject_id].status = "Done";
                tableData[data.bioproject_id].position = visData.length - 1;
                toLoad--;
            }
            if (addedSomething) {
                if (toLoad === 0) {
                    setLoading(false);
                }
                updateGraph();
                updateTable();
            }
            setTimeout(function () { mayStartAnimation = true; }, transitionDuration);
        } else {
            setTimeout(tryUpdateGraph, transitionDuration);
        }
    }

    // Displays a message above the table
    function setTableMessage(icon, msg) {
        $("#table-message").html("<i class='icon-" + icon + "'></i> " + msg);
    }

    // Sets the position property in the tableData
    // based on the row position in the table
    // returns a list with the order of the genomes
    function calculateTablePositions() {
        var order = [],
            start = -1,
            stop = 0;

        d3.selectAll("#genomes_table tbody tr").each(function (d, i) {
            var bioproject_id = d.bioproject_id;
            if (tableData[bioproject_id].position === i && stop === 0) {
                start = i;
            } else if (tableData[bioproject_id].position !== i) {
                stop = i;
                tableData[bioproject_id].position = i;
                tableData[bioproject_id].status = "Processing...";
            }
            order[i] = bioproject_id;
        });
        start++;
        return {"order" : order, "start" : start, "stop" : stop};
    }

    // Sets the position property in the tableData
    // based on the position in the graph
    // returns a list with the order of the genomes
    function calculateTablePositionsFromGraph() {
        var order = [],
            start = -1,
            stop = 0;
        for (var i = 0; i < visData.length; i++) {
            var bioproject_id = visData[i].bioproject_id;
            if (tableData[bioproject_id].position === i && stop === 0) {
                start = i;
            } else if (tableData[bioproject_id].position !== i) {
                stop = i;
                tableData[bioproject_id].position = i;
                tableData[bioproject_id].status = "Processing...";
            }
            order[i] = bioproject_id;
        }
        start++;
        return {"order" : order, "start" : start, "stop" : stop};
    }

    // Clear the table 
    function clearTable() {
        $("#genomes_table tbody").html("");
    }
    // Updates the table
    function updateTable() {
        // Add rows
        var tr = d3.select("#genomes_table tbody").selectAll("tr")
            .data(d3.values(tableData), function (d) {return d.bioproject_id; });
        var newRows = tr.enter().append("tr");
        tr.exit().remove();
        tr.sort(function (a, b) { return a.position - b.position; });

        // Add cells
        newRows.append("td").html("<i class='icon-resize-vertical'></i>");
        var td = tr.selectAll("td.data")
            .data(function (d) {
                return d3.entries(d).filter(function (entry) {
                    return entry.key !== "position" && entry.key !== "bioproject_id" ;
                });
            });
        td.enter()
            .append("td");
        td.text(function (d) { return d.value; })
            .attr("class", function (d) {return "data " + d.key; })
            .attr("colspan", "1");
        newRows.append("td")
            .append("a")
            .html("<i class='icon-trash'></i>")
            .attr("class", "btn btn-mini")
            .on("click", removeData);
    }

    // Redraws the full D3 graph
    function redrawGraph() {
        // erase everything
        $("#pancore_graph").html("");

        // create the svg
        svg = d3.select("#pancore_graph")
          .append("svg")
            .attr("viewBox", "0 0 " + fullWidth + " " + fullHeight)
            .attr("width", fullWidth)
            .attr("height", fullHeight)
            .style("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif")
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // create the tooltip
        tooltip = d3.select("#pancore_graph")
          .append("div")
            .attr("class", "tip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden");

        // create the dropshadow filter
        var temp = svg.append("svg:defs")
            .append("svg:filter")
                .attr("id", "dropshadow");
        temp.append("svg:feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 1);
        temp = temp.append("svg:feMerge");
        temp.append("svg:feMergeNode");
        temp.append("svg:feMergeNode")
            .attr("in", "SourceGraphic");

        // add the x-axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // add the y-axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Number of peptides");

        svg.selectAll(".axis line, .axis path")
            .style("fill", "none")
            .style("stroke", "#000")
            .style("shape-rendering", "crispEdges");

        // add legend
        var legend = svg.selectAll(".legend")
            .data([{"name": "pan proteome", "color": panColor}, {"name": "core proteome", "color": coreColor}])
          .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });
        legend.append("rect")
            .attr("x", 30)
            .attr("width", 8)
            .attr("height", 8)
            .style("shape-rendering", "crispEdges")
            .style("fill", function (d) { return d.color; });
        legend.append("text")
            .attr("x", 40)
            .attr("y", 4)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(function (d) { return d.name; });

        // draw the lines
        svg.append("path")
            .datum(visData)
            .attr("class", "line pan")
            .style("stroke", panColor)
            .style("stroke-width", 2)
            .style("fill", "none")
            .attr("d", panLine);
        svg.append("path")
            .datum(visData)
            .attr("class", "line core")
            .style("stroke", coreColor)
            .style("stroke-width", 2)
            .style("fill", "none")
            .attr("d", coreLine);

        // add gray hairlines
        svg.insert("line", ".dot")
            .attr("class", "hairline pan")
            .attr("stroke", "#cccccc")
            .attr("shape-rendering", "crispEdges")
            .style("visibility", "hidden");
        svg.insert("line", ".dot")
            .attr("class", "hairline core")
            .attr("stroke", "#cccccc")
            .attr("shape-rendering", "crispEdges")
            .style("visibility", "hidden");

        // add axis marks
        svg.insert("line")
            .attr("class", "axisline pan")
            .attr("stroke", panColor)
            .attr("stroke-width", "2")
            .attr("x1", "6")
            .attr("x2", "-6")
            .attr("shape-rendering", "crispEdges")
            .style("visibility", "hidden");
        svg.insert("line")
            .attr("class", "axisline core")
            .attr("stroke", coreColor)
            .attr("stroke-width", "2")
            .attr("x1", "6")
            .attr("x2", "-6")
            .attr("shape-rendering", "crispEdges")
            .style("visibility", "hidden");
    }

    // Updates the D3 graph
    function updateGraph() {
        // Prepare for line transition
        var oldPanDatum = svg.select(".line.pan").datum(),
            oldCoreDatum = svg.select(".line.core").datum();
        if (oldPanDatum.length < visData.length && oldPanDatum.length > 0) {
            var i = 0,
                diff = visData.length - oldPanDatum.length;
            for (; i < diff; i++) {
                oldPanDatum.push(oldPanDatum[oldPanDatum.length - 1]);
                oldCoreDatum.push(oldCoreDatum[oldCoreDatum.length - 1]);
            }
            svg.select(".line.pan").attr("d", panLine);
            svg.select(".line.core").attr("d", coreLine);
        }

        // set the domains
        x.domain(visData.map(function (d) { return d.bioproject_id; }));
        y.domain([0, d3.max(visData, function (d) { return d.pan; })]);

        // update the axes
        svg.select(".x.axis").transition().duration(transitionDuration).call(xAxis);
        svg.select(".y.axis").transition().duration(transitionDuration).call(yAxis);
        svg.selectAll(".axis line, .axis path")
            .style("fill", "none")
            .style("stroke", "#000")
            .style("shape-rendering", "crispEdges");
        // rotate the x-axis labels
        svg.selectAll(".x.axis text")
            .style("text-anchor", "end")
            .transition()
            .duration(transitionDuration)
            .attr("transform", "translate(-5,0)rotate(-45)");

        // draw the dots
        var panDots = svg.selectAll(".dot.pan")
            .data(visData, function (d) {return d.bioproject_id; });
        panDots.enter().append("circle")
            .attr("class", function (d) { return "dot pan _" + d.bioproject_id; })
            .attr("r", 5)
            .attr("fill", panColor)
            .attr("cx", width);
        panDots.transition()
            .duration(transitionDuration)
            .attr("cx", function (d) { return x(d.bioproject_id); })
            .attr("cy", function (d) { return y(d.pan); });
        panDots.exit()
            .transition()
                .attr("cy", height)
            .remove();
        var coreDots = svg.selectAll(".dot.core")
            .data(visData, function (d) {return d.bioproject_id; });
        coreDots.enter().append("circle")
            .attr("class", function (d) { return "dot core _" + d.bioproject_id; })
            .attr("r", 5)
            .attr("fill", coreColor)
            .attr("cx", width)
            .attr("cy", y(0));
        coreDots.transition()
            .duration(transitionDuration)
            .attr("cx", function (d) { return x(d.bioproject_id); })
            .attr("cy", function (d) { return y(d.core); });
        coreDots.exit()
            .transition()
                .attr("cy", height)
            .remove();

        // update the lines
        var dataCopy = visData.slice(0);
        if (visData.length > 0) {
            svg.select(".line.pan").datum(dataCopy)
                .style("visibility", "visible")
                .transition()
                    .duration(transitionDuration)
                    .style("stroke", panColor)
                    .attr("d", panLine);
            svg.select(".line.core").datum(dataCopy)
                .style("visibility", "visible")
                .transition()
                    .duration(transitionDuration)
                    .style("stroke", coreColor)
                    .attr("d", coreLine);
        } else {
            svg.select(".line.pan")
                .style("visibility", "hidden");
            svg.select(".line.core")
                .style("visibility", "hidden");
        }

        // update the mouseover rects
        mouseOverWidth = (width / visData.length) / 1.5;
        var bars = svg.selectAll(".bar")
            .data(visData, function (d) {return d.bioproject_id; });
        bars.enter().append("rect")
            .attr("class", "bar")
            .attr("height", height)
            .attr("y", 0)
            .style("fill-opacity", 0)
            .on("mouseover", mouseOver)
            .on("mouseout", mouseOut)
            .on("mousemove", mouseMove)
            .call(d3.behavior.drag()
                .on("dragstart", dragStart)
                .on("drag", drag)
                .on("dragend", dragEnd));
        bars.transition()
            .duration(transitionDuration)
            .attr("x", function (d) { return x(d.bioproject_id) - mouseOverWidth / 2; })
            .attr("width", mouseOverWidth);
        bars.exit().remove();
    }

    // Mouse event functions
    function mouseOver(d) {
        if (!isDragging) {
            // add dropshadow to the dot
            svg.selectAll(".dot._" + d.bioproject_id).attr("filter", "url(#dropshadow)");

            var genome = tableData[d.bioproject_id];

            svg.select(".hairline.core")
                .style("visibility", "visible")
                .attr("x1", x(visData[Math.max(0, genome.position - 1)].bioproject_id))
                .attr("x2", x(visData[Math.min(visData.length - 1, genome.position + 1)].bioproject_id))
                .attr("y1", y(d.core))
                .attr("y2", y(d.core));
            svg.select(".hairline.pan")
                .style("visibility", "visible")
                .attr("x1", x(visData[Math.max(0, genome.position - 1)].bioproject_id))
                .attr("x2", x(visData[Math.min(visData.length - 1, genome.position + 1)].bioproject_id))
                .attr("y1", y(d.pan))
                .attr("y2", y(d.pan));
            svg.select(".axisline.pan")
                .style("visibility", "visible")
                .attr("y1", y(d.pan))
                .attr("y2", y(d.pan));
            svg.select(".axisline.core")
                .style("visibility", "visible")
                .attr("y1", y(d.core))
                .attr("y2", y(d.core));

            // show tooltip
            tooltip
                .style("visibility", "visible")
                .html("<b>" + genome.name + "</b><br/>" +
                "<span style='color: " + panColor + ";'>&#9632;</span> pan: <b>" + d3.format(",")(d.pan) + "</b><br/>" +
                "<span style='color: " + coreColor + ";'>&#9632;</span> core: <b>" + d3.format(",")(d.core) + "</b>");
        }
    }
    function mouseOut(d) {
        svg.selectAll(".dot._" + d.bioproject_id).attr("filter", "");
        svg.selectAll(".hairline").style("visibility", "hidden");
        svg.selectAll(".axisline").style("visibility", "hidden");
        tooltip.style("visibility", "hidden");
    }
    function mouseMove(d) {
        // Hide the tooltip while dragging
        if (isDragging) {
            mouseOut(d);
        } else {
            if (window.fullScreenApi.isFullScreen()) {
                tooltip.style("top", (d3.event.clientY + 15) + "px").style("left", (d3.event.clientX + 15) + "px");
            } else {
                tooltip.style("top", (d3.event.pageY + 15) + "px").style("left", (d3.event.pageX + 15) + "px");
            }
        }
    }
    function dragStart(d) {
        isDragging = true;
        dragging[d.bioproject_id] = this.__origin__ = x(d.bioproject_id);
        svg.selectAll(".bar").style("cursor", "url(/closedhand.cur) 7 5, move");
    }
    function drag(d) {
        dragging[d.bioproject_id] = Math.min(width, Math.max(0, this.__origin__ += d3.event.dx));
        var oldData = visData.slice(0);
        visData.sort(function (a, b) { return position(a) - position(b); });
        // If some position is swapped, redraw some stuff
        if (isChanged(oldData, visData)) {
            x.domain(visData.map(function (d) { return d.bioproject_id; }));
            svg.selectAll(".bar").attr("x", function (d) { return x(d.bioproject_id) - mouseOverWidth / 2; });
            svg.selectAll(".dot:not(._" + d.bioproject_id + ")").transition()
                .duration(transitionDuration)
                .attr("cx", function (d) { return x(d.bioproject_id); });
            svg.select(".x.axis").transition()
                .duration(transitionDuration)
                .call(xAxis)
                .selectAll("text").style("text-anchor", "end");
            svg.selectAll(".line").transition()
                .duration(transitionDuration)
                .style("stroke", "#cccccc");
        }
        // Update the position of the drag box and dots
        d3.select(this).attr("x", dragging[d.bioproject_id] - mouseOverWidth / 2);
        svg.selectAll(".dot._" + d.bioproject_id).attr("cx", dragging[d.bioproject_id]);
    }
    function dragEnd(d) {
        delete this.__origin__;
        delete dragging[d.bioproject_id];
        svg.selectAll(".bar").style("cursor", "url(/openhand.cur) 7 5, move");
        updateGraph();
        var r = calculateTablePositionsFromGraph();
        updateTable();
        sendToWorker("recalculatePanCore", {"order" : r.order, "start" : r.start, "stop" : r.stop});
        isDragging = false;
    }

    // Drag helper functions
    function position(d) {
        var v = dragging[d.bioproject_id];
        return v == null ? x(d.bioproject_id) : v;
    }
    function isChanged(oldData, newData) {
        if (oldData.length != newData.length) {
            return true;
        }
        for (var i = 0; i < oldData.length; i++) {
            if (oldData[i].bioproject_id != newData[i].bioproject_id) {
                return true;
            }
        }
        return false;
    }
}