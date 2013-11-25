/**
 * Creates a pancoreGraph object that includes the graph visualisation
 *
 * @param <Number> args.transitionDuration Duration of transitions in ms
 * @param <Number> args.width Width of the graph
 * @param <Number> args.height Height of the graph
 * @param <Hash> args.genomes Hash of genomes (by bioproject_id)
 * @return <PancoreGraph> that The constructed PancoreGraph object
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
    var genomes = args.genomes,
        graphData = [],
        dataQueue = [],
        legendData;

    // Drag and click
    var mouse = {
        dragging : {},
        isDragging : false,
        hasDragged : false
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
        xScale,
        yScale,
        // Axes
        xAxis,
        yAxis,
        // Line helpers
        panLine,
        coreLine,
        unicoreLine;

    // Is it safe to run a graph update?
    var mayStartAnimation = true;

    /*************** Private methods ***************/

    /**
     * Initializes the graph
     */
    function init() {
        legendData = [{"name": "genome size", "color": genomeColor, "toggle": "showGenome"},
            {"name": "pan peptidome", "color": panColor, "toggle": "showPan"},
            {"name": "core peptidome", "color": coreColor, "toggle": "showCore"},
            {"name": "unique peptides", "color": unicoreColor, "toggle": "showUnicore"}];

        xScale = d3.scale.ordinal().rangePoints([0, width], 1);
        yScale = d3.scale.linear().range([height, 0]);

        xAxis = d3.svg.axis()
            .scale(xScale)
            .tickFormat(function (d) { return genomes[d].name || ""; })
            .orient("bottom");
        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");

        panLine = d3.svg.line()
            .interpolate("linear")
            .x(function (d) { return xScale(d.bioproject_id); })
            .y(function (d) { return yScale(d.pan); });
        coreLine = d3.svg.line()
            .interpolate("linear")
            .x(function (d) { return xScale(d.bioproject_id); })
            .y(function (d) { return yScale(d.core); });
        unicoreLine = d3.svg.line()
            .interpolate("linear")
            .x(function (d) { return xScale(d.bioproject_id); })
            .y(function (d) { return yScale(d.unicore); });
    }

    /**
     * Update the graph with data from the dataQueue when
     * the previous animation is done.
     */
    function tryUpdateGraph() {
        if (dataQueue.length === 0) return;

        var data;

        // Only update when the previous animation is done
        if (mayStartAnimation) {
            while (dataQueue.length > 0) {
                data = dataQueue.shift();
                graphData.push(data);
                // TODO: let the table change its own data
                genomes[data.bioproject_id].position = graphData.length - 1;
            }
            mayStartAnimation = false;
            that.update();
            setTimeout(function () { mayStartAnimation = true; }, transitionDuration);
        } else {
            setTimeout(tryUpdateGraph, transitionDuration);
        }
    }

    /**
     * Returns the value of the highest datapoint that's visible on the graph.
     * This is used to calculate the range of the y-axis.
     * The value is multiplied by 1.3 if it would occur in the top-left-corner
     * of the graph to prevent overlap with the legend.
     */
    function getMaxVisibleDatapoint() {
        var max = 0,
            i;
        if (graphData.length === 0) {
            return 0;
        }
        if (toggles.showPan) {
            return graphData[graphData.length - 1].pan;
        }
        if (toggles.showGenome) {
            for (i = 0; i < graphData.length; i++) {
                if (graphData[i].peptides > max) {
                    max = graphData[i].peptides;
                }
            }
            return max * 1.3;
        }
        if (toggles.showCore) {
            return graphData[0].core * 1.3;
        }
        if (toggles.showUnicore) {
            return graphData[0].unicore * 1.3;
        }
        return 0;
    }

    /**
     * Constructs the content of a tooltip for a given genome. Takes into
     * account which lines are visible on the graph
     *
     * @param <Genome> d The genome of which we want a tooltip
     */
    function getTooltipContent(d) {
        var tooltipHtml = "<span style='color: " + genomeColor + ";'>&#9632;</span> genome size: <b>" + d3.format(",")(d.peptides) + "</b><br/>";
        if (toggles.showPan) {
            tooltipHtml += "<span style='color: " + panColor + ";'>&#9632;</span> pan peptides: <b>" + d3.format(",")(d.pan) + "</b><br/>";
        }
        if (toggles.showCore) {
            tooltipHtml += "<span style='color: " + coreColor + ";'>&#9632;</span> core peptides: <b>" + d3.format(",")(d.core) + "</b>";
        }
        if (d.unicore != null && toggles.showUnicore) {
            tooltipHtml += "<br/><span style='color: " + unicoreColor + ";'>&#9632;</span> unique peptides: <b>" + d3.format(",")(d.unicore) + "</b>";
        }
        return tooltipHtml;
    }

    /**
     * Constructs the content of a popover for a given genome. Takes into
     * account which lines are visible on the graph.
     *
     * @param <Genome> d The genome of which we want a popover
     */
    function getPopoverContent(d) {
        var content = getTooltipContent(d);
        content += "<br/><div class='btn-group' id='download-peptides'>" +
          "<a class='btn btn-default dropdown-toggle' id='download-peptides-toggle' data-toggle='dropdown' data-loading-text='Loading peptides'>" +
            "<i class='glyphicon glyphicon-download'></i> " +
            "download peptides " +
            "<span class='caret'></span>" +
          "</a>" +
          "<ul class='dropdown-menu'>" +
            "<li><a href='#' data-bioproject_id='" + d.bioproject_id + "' data-type='all'><span style='color: " + genomeColor + ";'>&#9632;</span> genome peptides</a></li>" +
            "<li><a href='#' data-bioproject_id='" + d.bioproject_id + "' data-type='pan'><span style='color: " + panColor + ";'>&#9632;</span> pan peptides</a></li>" +
            "<li><a href='#' data-bioproject_id='" + d.bioproject_id + "' data-type='core'><span style='color: " + coreColor + ";'>&#9632;</span> core peptides</a></li>" +
            "<li><a href='#' data-bioproject_id='" + d.bioproject_id + "' data-type='unique'><span style='color: " + unicoreColor + ";'>&#9632;</span> unique peptides</a></li>" +
          "</ul>" +
        "</div>";

        return content;
    }

    /**
     * Adds actions the currently shown popover
     */
    function addPopoverBehaviour() {
        $(".popover").prepend("<button type='button' class='close' style='margin-right: 5px'>&times;</button>");
        $(".close").click(that.removePopoversAndHighlights);
        $("#download-peptides").mouseenter(function () {
            if (!$("#download-peptides").hasClass("open")) {
                $("#download-peptides-toggle").dropdown("toggle");
            }
        });
        $("#download-peptides").mouseleave(function () {
            if ($("#download-peptides").hasClass("open")) {
                $("#download-peptides-toggle").dropdown("toggle");
            }
        });
        //TODO add to separate method
        $("#download-peptides ul a").click(function () {
            var type = $(this).attr("data-type");
            var bioproject_id = $(this).attr("data-bioproject_id");
            //TODO sendToWorker("getSequences", {"type" : type, "bioproject_id" : bioproject_id});
            $("#download-peptides").mouseleave();
            $("#download-peptides-toggle").button('loading');
            return false;
        });
    }

    /**
     * Shows a popover and highlights the clicked node, unless we clicked the
     * previously clicked node. In that case, we remove the popover and
     * highlight.
     *
     * @param <Genome> d The genome of the clicked node
     */
    function invokePopover(d) {
        var target = $(d3.event.target);
        d3.event.stopPropagation();
        if (mouse.clickId === d.bioproject_id) {
            that.removePopoversAndHighlights();
        } else {
            that.removePopoversAndHighlights();
            that.removeTooltip();
            that.addHighlight(d);
            target.popover({
                html: true,
                trigger: "manual",
                position: "right",
                container: "#popovers",
                title: genomes[d.bioproject_id].name + " (bioproject " + d.bioproject_id + ")",
                content: getPopoverContent(d)});
            target.popover("show");
            target.attr("class", "bar pop");
            addPopoverBehaviour();
            mouse.clickId = d.bioproject_id;
        }
    }

    /**
     * Shows a tooltip with information about the node and highlights the dots
     *
     * @param <Genome> d The genome we mouse over
     */
    function invokeTooltipAndHighlight(d) {
        if (mouse.isDragging) return;
        if (mouse.clickId === d.bioproject_id) return;
        var tooltipHtml = "<b>" + genomes[d.bioproject_id].name + "</b><br/>" + getTooltipContent(d);
        tooltip.html(tooltipHtml).style("visibility", "visible");
        that.addHighlight(d);
    }

    /**
     * Hides the highlight
     *
     * @param <Genome> d The genome we stop mouseing over
     */
    function abolishTooltipAndHighlight(d) {
        if (mouse.isDragging) return;
        if (mouse.clickId === d.bioproject_id) return;
        that.removeHighlight(d.bioproject_id);
    }

    /**
     * Update the position of the tooltip on the next frame
     *
     * @param <Genome> d The genome we mouse over
     */
    function moveTooltip(d) {
        if (mouse.isDragging) return;
        if (window.fullScreenApi.isFullScreen()) {
            tooltipX = d3.event.clientX + 15;
            tooltipY = d3.event.clientY + 15;
        } else {
            tooltipX = d3.event.pageX + 15;
            tooltipY = d3.event.pageY + 15;
        }
        requestAnimFrame(afMoveTooltip);
    }

    /**
     * Let the dragging begin!
     *
     * @param <Genome> d The genome we started dragging
     */
    function dragStart(d) {
        mouse.isDragging = true;
        mouse.hasDragged = false;
        mouse.dragId = d.bioproject_id;
        mouse.dragging[d.bioproject_id] = this.__origin__ = xScale(d.bioproject_id);
        d3.select("body").style("cursor", "url(/closedhand.cur) 7 5, move");
        svg.selectAll(".bar").style("cursor", "url(/closedhand.cur) 7 5, move");
        svg.select("#trash").transition()
            .duration(transitionDuration)
            .attr("transform", "translate(-84 0)")
            .style("opacity", "1");
    }

    /**
     * Gets called on each drag event. Stores the new mouse position, but
     * only does the heavy lifting once per frame
     *
     * @param <Genome> d The genome we're dragging
     */
    function drag(d) {
        mouse.hasDragged = true;
        if (mouse.clickId) {
            removePopovers();
            if (mouse.clickId !== d.bioproject_id) {
                removeHighlight(mouse.clickId);
            }
        }
        that.removeTooltip();
        mouse.dragging[d.bioproject_id] = Math.min(width, Math.max(0, this.__origin__ += d3.event.dx));
        requestAnimFrame(afMoveDrag);
    }

    /**
     * Gets called when we stop dragging
     * Recalculates the position of all genomes and updates the graph or
     * removes the genome when dropped on the trash can
     *
     * @param <Genome> d The genome we stopped dragging
     */
    function dragEnd(d) {
        delete this.__origin__;
        delete mouse.dragging[d.bioproject_id];
        d3.select("body").style("cursor", "auto");
        svg.selectAll(".bar").style("cursor", "url(/openhand.cur) 7 5, move");
        svg.select("#trash").transition()
            .delay(mouse.onTrash ? transitionDuration : 0)
            .duration(transitionDuration)
            .attr("transform", "translate(0 0)")
            .style("opacity", "0")
            .attr("fill", "#cccccc");
        svg.select("#trash circle").transition()
            .delay(mouse.onTrash ? transitionDuration : 0)
            .duration(transitionDuration)
            .attr("stroke", "#cccccc");
        if (mouse.onTrash) {
            //TODO removeData(d);
        } else {
            // If we always update the graph, the click event never registers
            // in Chrome due to DOM reordering of the bars.
            if (mouse.hasDragged) {
                that.update();
                // If we swapped genomes, update the table to the graph
                //TODO var r = calculateTablePositionsFromGraph();
                //TODO updateTable();
                //TODO sendToWorker("recalculatePanCore", {"order" : r.order, "start" : r.start, "stop" : r.stop});
            }
        }
        mouse.isDragging = false;
    }

    /**
     * Gets called when the mouse hovers over the trash can
     */
    function trashMouseOver() {
        mouse.onTrash = true;
        if (!mouse.isDragging) return;
        svg.select("#trash").transition()
            .duration(transitionDuration / 2)
            .attr("fill", "#333333");
        svg.select("#trash circle").transition()
            .duration(transitionDuration / 2)
            .attr("stroke", "#d6616b");
        svg.selectAll(".dot._" + mouse.dragId).transition()
            .duration(transitionDuration / 2)
            .attr("fill", "#d6616b");
    }

    /**
     * Gets called when the mouse leave the trash can
     */
    function trashMouseOut() {
        mouse.onTrash = false;
        if (!mouse.isDragging) return;
        svg.select("#trash").transition()
            .duration(transitionDuration)
            .attr("fill", "#cccccc");
        svg.select("#trash circle").transition()
            .duration(transitionDuration)
            .attr("stroke", "#cccccc");
        svg.selectAll(".dot.genome._" + mouse.dragId).transition()
            .duration(transitionDuration)
            .attr("fill", genomeColor);
        svg.selectAll(".dot.pan._" + mouse.dragId).transition()
            .duration(transitionDuration)
            .attr("fill", panColor);
        svg.selectAll(".dot.core._" + mouse.dragId).transition()
            .duration(transitionDuration)
            .attr("fill", coreColor);
        svg.selectAll(".dot.unicore._" + mouse.dragId).transition()
            .duration(transitionDuration)
            .attr("fill", unicoreColor);
    }

    /**
     * Gets called when we a label of the legend gets clicked
     *
     * @param <Genome> d The label we clicked
     */
    function legendClick(d) {
        toggles[d.toggle] = !toggles[d.toggle];
        that.update();
    }

    /**
     * Returns the actual position of a genome in the graph
     *
     * @param <Genome> d The genome we want to know the position of
     * @return <Number> The x-position of the genome
     */
    function position(d) {
        var v = mouse.dragging[d.bioproject_id];
        return v == null ? xScale(d.bioproject_id) : v;
    }

    /**
     * Checks if 2 arrays are the same. Returns true if something has changed
     *
     * @param <Array> oldData the first array
     * @param <Array> newData the second array
     * @return <Boolean> Returns true if the arrays aren't the same
     */
    function hasChanged(oldData, newData) {
        var i;
        if (oldData.length !== newData.length) {
            return true;
        }
        for (i = 0; i < oldData.length; i++) {
            if (oldData[i].bioproject_id !== newData[i].bioproject_id) {
                return true;
            }
        }
        return false;
    }

    /**
     * Changes the position of the tooltip with a CSS transform
     */
    function afMoveTooltip() {
        tooltip.style("-webkit-transform", "translate3d(" + tooltipX + "px, " + tooltipY + "px, 0)");
        tooltip.style("transform", "translate3d(" + tooltipX + "px, " + tooltipY + "px, 0)");
    }

    /**
     * Swiches the position of 2 genomes while dragging. Gets only called once
     * per frame because of the heavy computations.
     */
    function afMoveDrag() {
        var oldData = graphData.slice(0);
        graphData.sort(function (a, b) { return position(a) - position(b); });
        // If some position is swapped, redraw some stuff
        if (hasChanged(oldData, graphData)) {
            xScale.domain(graphData.map(function (d) { return d.bioproject_id; }));
            svg.selectAll(".bar").attr("x", function (d) { return xScale(d.bioproject_id) - mouseOverWidth / 2; });
            svg.selectAll(".dot:not(._" + mouse.dragId + ")").transition()
                .duration(transitionDuration)
                .attr("cx", function (d) { return xScale(d.bioproject_id); });
            svg.select(".x.axis").transition()
                .duration(transitionDuration)
                .call(xAxis);
            svg.selectAll(".x.axis text").style("text-anchor", "end");
            svg.selectAll(".line").transition()
                .duration(transitionDuration)
                .style("stroke", "#cccccc");
        }
        // Update the position of the drag box and dots
        svg.selectAll(".bar._" + mouse.dragId).attr("x", mouse.dragging[mouse.dragId] - mouseOverWidth / 2);
        svg.selectAll(".dot._" + mouse.dragId).attr("cx", mouse.dragging[mouse.dragId]);
    }


    /*************** Public methods ***************/

    /**
     * Add data about a single genome to the graph
     *
     * @param <Hash> genome All data needed to visualise a genome on the graph
     */
    that.addToDataQueue = function addToDataQueue(genome) {
        dataQueue.push(genome);
        tryUpdateGraph();
    };

    /**
     * Redraws the entire pancore graph
     */
    that.redraw = function redraw() {
        // erase everything
        $("#pancore_graph svg").remove();
        $("#pancore_graph div.tip").remove();

        // create the svg
        svg = d3.select("#pancore_graph")
          .append("svg")
            .attr("version", "1.1")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("viewBox", "0 0 " + fullWidth + " " + fullHeight)
            .attr("width", fullWidth)
            .attr("height", fullHeight)
            .attr("overflow", "hidden")
            .style("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif")
          .on("click", that.removePopoversAndHighlights)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // create the tooltip
        tooltip = d3.select("#pancore_graph")
          .append("div")
            .attr("class", "tip")
            .style("position", "absolute")
            .style("top", "0px")
            .style("left", "0px")
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

        // container used for dots, paths and bars
        graphArea = svg.append("g").attr("class", "graphArea");

        // add legend
        var legend = svg.selectAll(".legend")
            .data(legendData)
          .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; })
            .on("click", legendClick);
        legend.append("rect")
            .attr("x", 30)
            .attr("width", 8)
            .attr("height", 8)
            .style("shape-rendering", "crispEdges")
            .style("fill", function (d) { return d.color; });
        legend.append("text")
            .attr("x", 40)
            .attr("y", 8)
            .style("text-anchor", "start")
            .text(function (d) { return d.name; });
        $(".legend").disableSelection();

        // draw the lines
        graphArea.append("path")
            .datum(graphData)
            .attr("class", "line pan")
            .style("stroke", panColor)
            .attr("d", panLine);
        graphArea.append("path")
            .datum(graphData)
            .attr("class", "line core")
            .style("stroke", coreColor)
            .attr("d", coreLine);
        graphArea.append("path")
            .datum(graphData)
            .attr("class", "line unicore")
            .style("stroke", unicoreColor)
            .attr("d", unicoreLine);
        graphArea.selectAll("path.line")
            .style("stroke-width", 2)
            .style("fill", "none");

        // add axis marks
        svg.insert("line")
            .attr("class", "axisline genome")
            .attr("stroke", genomeColor);
        svg.insert("line")
            .attr("class", "axisline pan")
            .attr("stroke", panColor);
        svg.insert("line")
            .attr("class", "axisline core")
            .attr("stroke", coreColor);
        svg.insert("line")
            .attr("class", "axisline unicore")
            .attr("stroke", unicoreColor);
        svg.selectAll("line.axisline")
            .attr("stroke-width", "2")
            .attr("x1", "6")
            .attr("x2", "-6")
            .attr("shape-rendering", "crispEdges")
            .style("visibility", "hidden");

        // trash bin
        var trash = svg.insert("g")
            .attr("id", "trash")
            .attr("fill", "#cccccc")
            .style("opacity", "0")
            .on("mouseover", trashMouseOver)
            .on("mouseout", trashMouseOut)
        .insert("g")
            .attr("transform", "translate(" + (fullWidth + 30) + " " + (height - 46) / 2 + ")");
        trash.append("circle")
            .attr("r", 30)
            .attr("stroke", "#cccccc")
            .attr("stroke-width", 3)
            .attr("fill", "white")
            .attr("cx", -40)
            .attr("cy", 23);
        trash.append("rect")
            .attr("height", height)
            .attr("width", 32)
            .attr("y", -182)
            .attr("x", -40)
            .style("fill-opacity", 0);
        trash = trash.insert("g")
            .attr("transform", "translate(-430 -597)")
            .style("pointer-events", "none");
        trash.insert("path").attr("d", "M408.302,604.218h-7.95c0.002-0.055,0.009-0.109,0.009-0.166v-1.6c0-2.91-2.384-5.293-5.294-5.293h-8.824    c-2.912,0-5.294,2.383-5.294,5.293v1.6c0,0.057,0.007,0.111,0.009,0.166h-7.95c-1.456,0-2.646,1.191-2.646,2.646v2.646    c0,1.457,1.19,2.648,2.646,2.648h0.883v-1.766h33.529v1.766h0.883c1.455,0,2.646-1.191,2.646-2.648v-2.646    C410.948,605.409,409.757,604.218,408.302,604.218z M385.333,601.571h10.588v2.646h-10.588V601.571z");
        trash.insert("path").attr("d", "M375.654,613.042v26.469c0,1.457,1.19,2.648,2.647,2.648h24.705c1.456,0,2.647-1.191,2.647-2.648v-26.469    H375.654z M384.478,636.423c0,0.486-0.397,0.883-0.882,0.883h-1.765c-0.486,0-0.883-0.396-0.883-0.883v-17.646    c0-0.484,0.396-0.883,0.883-0.883h1.765c0.484,0,0.882,0.398,0.882,0.883V636.423z M392.419,636.423    c0,0.486-0.398,0.883-0.882,0.883h-1.766c-0.485,0-0.882-0.396-0.882-0.883v-17.646c0-0.484,0.396-0.883,0.882-0.883h1.766    c0.483,0,0.882,0.398,0.882,0.883V636.423z M400.36,636.423c0,0.486-0.398,0.883-0.883,0.883h-1.765    c-0.485,0-0.882-0.396-0.882-0.883v-17.646c0-0.484,0.396-0.883,0.882-0.883h1.765c0.484,0,0.883,0.398,0.883,0.883V636.423z");
    };

    /**
     * Updates the pancore graph
     */
    that.update = function update() {
        // Prepare for line transition
        var oldPanDatum = svg.select(".line.pan").datum(),
            oldCoreDatum = svg.select(".line.core").datum();
        if (oldPanDatum.length < graphData.length && oldPanDatum.length > 0) {
            var i,
                diff = graphData.length - oldPanDatum.length;
            for (i = 0; i < diff; i++) {
                oldPanDatum.push(oldPanDatum[oldPanDatum.length - 1]);
                oldCoreDatum.push(oldCoreDatum[oldCoreDatum.length - 1]);
            }
            svg.select(".line.pan").attr("d", panLine);
            svg.select(".line.core").attr("d", coreLine);
        }

        // set the domains
        xScale.domain(graphData.map(function (d) { return d.bioproject_id; }));
        yScale.domain([0, getMaxVisibleDatapoint()]);

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
        svg.selectAll(".tick").attr("class", function (d) { return "tick major _" + d; });

        // draw the dots
        var genomeDots = graphArea.selectAll(".dot.genome")
            .data(graphData, function (d) { return d.bioproject_id; });
        genomeDots.enter().append("circle")
            .attr("class", function (d) { return "dot genome _" + d.bioproject_id; })
            .attr("r", 5)
            .attr("fill", genomeColor)
            .attr("cx", width);
        genomeDots.transition()
            .duration(transitionDuration)
            .attr("cx", function (d) { return xScale(d.bioproject_id); })
            .attr("cy", function (d) { return yScale(d.peptides); })
            .attr("opacity", toggles.showGenome ? 1 : 0);
        genomeDots.exit()
            .transition()
                .attr("cy", height / 2)
                .attr("cx", width)
            .remove();
        var panDots = graphArea.selectAll(".dot.pan")
            .data(graphData, function (d) { return d.bioproject_id; });
        panDots.enter().append("circle")
            .attr("class", function (d) { return "dot pan _" + d.bioproject_id; })
            .attr("r", 5)
            .attr("fill", panColor)
            .attr("cx", width);
        panDots.transition()
            .duration(transitionDuration)
            .attr("cx", function (d) { return xScale(d.bioproject_id); })
            .attr("cy", function (d) { return yScale(d.pan); })
            .attr("opacity", toggles.showPan ? 1 : 0);
        panDots.exit()
            .transition()
                .attr("cy", height / 2)
                .attr("cx", width)
            .remove();
        var coreDots = graphArea.selectAll(".dot.core")
            .data(graphData, function (d) {return d.bioproject_id; });
        coreDots.enter().append("circle")
            .attr("class", function (d) { return "dot core _" + d.bioproject_id; })
            .attr("r", 5)
            .attr("fill", coreColor)
            .attr("cx", width)
            .attr("cy", yScale(0));
        coreDots.transition()
            .duration(transitionDuration)
            .attr("cx", function (d) { return xScale(d.bioproject_id); })
            .attr("cy", function (d) { return yScale(d.core); })
            .attr("opacity", toggles.showCore ? 1 : 0);
        coreDots.exit()
            .transition()
                .attr("cy", height / 2)
                .attr("cx", width)
            .remove();
        var unicoreDots = graphArea.selectAll(".dot.unicore")
            .data(graphData.filter(function (entry) {
                return entry.unicore !== undefined;
            }), function (d) {return d.bioproject_id; });
        unicoreDots.enter().append("circle")
            .attr("class", function (d) { return "dot unicore _" + d.bioproject_id; })
            .attr("r", 5)
            .attr("fill", unicoreColor)
            .attr("cx", width)
            .attr("cy", yScale(0));
        unicoreDots.transition()
            .duration(transitionDuration)
            .attr("cx", function (d) { return xScale(d.bioproject_id); })
            .attr("cy", function (d) { return yScale(d.unicore); })
            .attr("opacity", toggles.showUnicore ? 1 : 0);
        unicoreDots.exit()
            .transition()
                .attr("cy", height / 2)
                .attr("cx", width)
            .remove();

        // update the lines
        var dataCopy = graphData.slice(0);
        if (graphData.length > 0) {
            graphArea.select(".line.pan").datum(dataCopy)
                .style("visibility", "visible")
                .transition()
                    .duration(transitionDuration)
                    .style("stroke", panColor)
                    .attr("opacity", toggles.showPan ? 1 : 0)
                    .attr("d", panLine);
            graphArea.select(".line.core").datum(dataCopy)
                .style("visibility", "visible")
                .transition()
                    .duration(transitionDuration)
                    .style("stroke", coreColor)
                    .attr("opacity", toggles.showCore ? 1 : 0)
                    .attr("d", coreLine);
        } else {
            // hide the lines when there's no data
            // drawing them with no data results in JS errors
            graphArea.select(".line.pan").style("visibility", "hidden");
            graphArea.select(".line.core").style("visibility", "hidden");
        }
        if (graphData.length > 0 && graphData[0].unicore !== undefined) {
            graphArea.select(".line.unicore").datum(dataCopy)
                .style("visibility", "visible")
                .transition()
                    .duration(transitionDuration)
                    .style("stroke", unicoreColor)
                    .attr("opacity", toggles.showUnicore ? 1 : 0)
                    .attr("d", unicoreLine);
        } else {
            graphArea.select(".line.unicore").style("visibility", "hidden");
        }

        // update the mouseover rects
        mouseOverWidth = (width / graphData.length) / 1.5;
        var bars = graphArea.selectAll(".bar")
            .data(graphData, function (d) {return d.bioproject_id; });

        bars.enter().append("polygon")
            .attr("class", "bar")
            .style("fill-opacity", 0)
            .on("mouseover", invokeTooltipAndHighlight)
            .on("mouseout", abolishTooltipAndHighlight)
            .on("mousemove", moveTooltip)
            .on("click", invokePopover)
            .call(d3.behavior.drag()
                .on("dragstart", dragStart)
                .on("drag", drag)
                .on("dragend", dragEnd));
        bars.transition()
            .duration(transitionDuration)
            .attr("points", function (d) {
                var ret = "";
                ret += (xScale(d.bioproject_id) - mouseOverWidth / 2) + ", " + (height + 15) + " ";
                ret += (xScale(d.bioproject_id) - mouseOverWidth / 2) + ", 0 ";
                ret += (xScale(d.bioproject_id) + mouseOverWidth / 2) + ", 0 ";
                ret += (xScale(d.bioproject_id) + mouseOverWidth / 2) + ", " + (height + 15) + " ";
                ret += (xScale(d.bioproject_id) + mouseOverWidth / 2 - (margin.bottom - 15)) + ", " + (height + margin.bottom) + " ";
                ret += (xScale(d.bioproject_id) - mouseOverWidth / 2 - (margin.bottom - 15)) + ", " + (height + margin.bottom) + " ";
                return ret;
            });
        bars.exit().remove();

        // Put the handlebars on top
        $(".bar").parent().append($(".bar"));
    };

    /**
     * Removes all popovers and highlights from the graph
     */
    that.removePopoversAndHighlights = function removePopoversAndHighlights() {
        that.removePopovers();
        that.removeHighlights();
    };

    /**
     * Removes all popovers
     */
    that.removePopovers = function removePopovers() {
        $(".bar.pop").popover("destroy");
        $(".bar.pop").attr("class", "bar");
        delete mouse.clickId;
    };

    /**
     * Removes all highlights
     */
    that.removeHighlights = function removeHighlights() {
        svg.selectAll(".dot").attr("filter", "").attr("r", 5);
        svg.selectAll(".tick text").style("font-weight", "normal");
        svg.selectAll(".axisline").style("visibility", "hidden");
        tooltip.style("visibility", "hidden");
    };

    /**
     * Remove the tooltip
     */
    that.removeTooltip = function removeTooltip() {
        tooltip.style("visibility", "hidden");
    };

    /**
     * Remove the highlight with the given bioproject_id
     *
     * @param <Number> bioproject_id The bioproject_id of the highlight we want
     *           to remove
     */
    that.removeHighlight = function removeHighlight(bioproject_id) {
        svg.selectAll(".dot._" + bioproject_id).attr("filter", "").attr("r", 5);
        svg.selectAll(".tick._" + bioproject_id + " text").style("font-weight", "normal");
        svg.selectAll(".axisline").style("visibility", "hidden");
        tooltip.style("visibility", "hidden");
    };

    /**
     * Add a highlight to the element corresponding with d
     *
     * @param <Genome> d The genome we want to add the data to
     */
    that.addHighlight = function addHighlight(d) {
        // add dropshadow to the dot and axis text
        svg.selectAll(".dot._" + d.bioproject_id).attr("filter", "url(#dropshadow)").attr("r", 6);
        svg.selectAll(".tick._" + d.bioproject_id + " text").style("font-weight", "bold");

        if (toggles.showGenome) {
            svg.select(".axisline.genome")
                .attr("y1", yScale(d.peptides))
                .attr("y2", yScale(d.peptides))
                .style("visibility", "visible");
        }
        if (toggles.showPan) {
            svg.select(".axisline.pan")
                .attr("y1", yScale(d.pan))
                .attr("y2", yScale(d.pan))
                .style("visibility", "visible");
        }
        if (toggles.showCore) {
            svg.select(".axisline.core")
                .attr("y1", yScale(d.core))
                .attr("y2", yScale(d.core))
                .style("visibility", "visible");
        }
        if (d.unicore != null && toggles.showUnicore) {
            svg.select(".axisline.unicore")
                .attr("y1", yScale(d.unicore))
                .attr("y2", yScale(d.unicore))
                .style("visibility", "visible");
        }
    };

    // initialize the object
    init();

    return that;
};
