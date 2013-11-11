/**
 * Creates the selectable taxonomy tree using nested unordered lists
 *
 * data is an array of around 2500 objects with this format:
 * {"bioproject_id":57587,"class_id":29547,"genus_id":194,"name":"Campylobacter jejuni","order_id":213849,"species_id":197}
 *
 * taxa is a list (object) of key-value pairs mapping taxon id's to taxon names
 */
function init_selection_tree(data, taxa) {
    // Status vars used while dragging to determine if the droptarget needs to be recalculated
    var moving = false,
        moving2 = false;

    // Uses a "group by" operator on the data array to create a nested array
    data = d3.nest()
        .key(function (d) { return d.class_id; }).sortKeys(function (a, b) { return d3.ascending(taxa[a], taxa[b]); })
        .key(function (d) { return d.order_id; }).sortKeys(function (a, b) { return d3.ascending(taxa[a], taxa[b]); })
        .key(function (d) { return d.genus_id; }).sortKeys(function (a, b) { return d3.ascending(taxa[a], taxa[b]); })
        .key(function (d) { return d.species_id; }).sortKeys(function (a, b) { return d3.ascending(taxa[a], taxa[b]); })
        .entries(data);
    calculateNumOfChildren(data);
    delete(data.children);

    // Add the nested unordered lists to the page based on the data array
    var tree = d3.select("#treeView");
    tree = tree.append("ul").append("li").attr("class", "root not").append("ul");
    $("li.root").prepend($("#treeSearchDiv"));
    var items = tree.selectAll("li").data(data)
        .enter()
        .append("li")
            .html(function (d) { return "<span>" + taxa[d.key] + " (" + d.children + ")</span>"; })
            .attr("title", "Class")
            .attr("class", "collapsibleListOpen")
            .attr("data-search", function (d) { return taxa[d.key]; })
        .append("ul");
    items = items.selectAll("li").data(function (d) { return d.values; })
        .enter()
        .append("li")
            .html(function (d) { return "<span>" + taxa[d.key] + " (" + d.children + ")</span>"; })
            .attr("title", "Order")
            .attr("class", "collapsibleListClosed")
            .attr("data-search", function (d) { return taxa[d.key]; })
        .append("ul");
    items = items.selectAll("li").data(function (d) { return d.values; })
        .enter()
        .append("li")
            .html(function (d) { return "<span>" + taxa[d.key] + " (" + d.children + ")</span>"; })
            .attr("title", "Genus")
            .attr("class", "collapsibleListOpen")
            .attr("data-search", function (d) { return taxa[d.key]; })
        .append("ul");
    items = items.selectAll("li").data(function (d) { return d.values; })
        .enter()
        .append("li")
            .html(function (d) { return "<span>" + taxa[d.key] + " (" + d.children + ")</span>"; })
            .attr("title", "Species")
            .attr("class", "collapsibleListOpen")
            .attr("data-search", function (d) { return taxa[d.key]; })
        .append("ul");
    items = items.selectAll("li").data(function (d) { return d.values; })
        .enter()
        .append("li")
            .attr("class", "not leaf")
            .attr("title", function (d) { return "bioproject id: " + d.bioproject_id; })
            .attr("data-search", function (d) { return d.name.toLowerCase() + " " + d.bioproject_id; })
            .attr("data-bioproject_id", function (d) { return d.bioproject_id; })
            .html(function (d) { return "<span>" + d.name + "</span>"; });

    // Prevent accidental text selection
    $("#treeView li.root ul").disableSelection();

    // Expand or collapse a node when clicked
    $("#treeView li").click(function () {
        if (!$(this).hasClass("not")) {
            $(this).toggleClass("collapsibleListOpen collapsibleListClosed");
        }
        return false;
    });

    // Filter the tree 500ms after the last key press
    $("#treeSearch").keyup(function () {
        var text = $(this).val().toLowerCase();
        delay(function () {
            $("#treeView li").removeClass("match unmatch");
            if (text !== "") {
                $("#treeView li[data-search*='" + text + "']").addClass("match");
                $("#treeView li.match").parents("li").addClass("match").addClass("collapsibleListOpen").removeClass("collapsibleListClosed");
                $("#treeView li:not(.match):not(.root)").addClass("unmatch");
            }
        }, 500);
    });

    // Make the nodes draggable using JQuery UI
    $("#treeView li").draggable({
        appendTo: "#genomes_table tbody",
        addClasses: false,
        refreshPositions: true,
        // Mimic the style of the table on the right
        helper: function (event) {
            var returnString = "<tbody class='dragging'>";
            if ($(this).hasClass("leaf")) {
                returnString += "<tr><td class='handle'><i class='glyphicon glyphicon-resize-vertical'></i></td><td class='data name' data-bioproject_id='" + $(this).attr("data-bioproject_id") + "'>" + $(this).text() + "</td><td class='data status'></td><td></td></tr>";
            } else {
                $(this).find(".leaf").each(function () {
                    returnString += "<tr><td class='handle'><i class='glyphicon glyphicon-resize-vertical'></i></td><td class='data name' data-bioproject_id='" + $(this).attr("data-bioproject_id") + "'>" + $(this).text() + "</td><td class='data status'></td><td></td></tr>";
                });
            }
            returnString += "</tbody>";
            return $(returnString);
        },
        // table on the right slides into view on drag start
        start: function (event, ui) {
            var pos = Math.max(0, window.pageYOffset - $("#table-message").offset().top);
            $("#genomes_table_div").css("margin-top", pos + "px");
            $(event.target).draggable('option', 'refreshPositions', true);
            moving = true;
            moving2 = true;
            setTimeout(function () {moving = false; }, 800);
        },
        // table on the right slides back to original position 1s after drag stop
        stop: function (event, ui) {
            setTimeout(function () {$("#genomes_table_div").css("margin-top", "0px"); }, 1000);
        },
        // Because the drop target slides in, we have to recalculate the position
        // of the target while dragging. This is computationally expensive, so we
        // stop recalculating once we know the target stays in place
        drag: function (event, ui) {
            if (!moving2) {
                $(event.target).draggable('option', 'refreshPositions', false);
            }
            if (!moving) {
                moving2 = false;
            }
        }
    });

    // calculates the number of leafs under every node in the given list
    function calculateNumOfChildren(list) {
        var r = 0,
            i,
            d;
        for (i = 0; i < list.length; i++) {
            d = list[i];
            if (d.values !== undefined) {
                d.children = calculateNumOfChildren(d.values);
            } else {
                d.children = 1;
            }
            r += d.children;
        }
        list.children = r;
        return r;
    }
}

/**
 * Initializes the main graph and drop-target-table
 */
function init_pancore() {
    // GLOBALS AND DEFAULTS

    // Animation and style stuff
    var transitionDuration = 500,
        genomeColor = "#d9d9d9",  // gray
        panColor = "#1f77b4",     // blue
        coreColor = "#ff7f0e",    // orange
        unicoreColor = "#2ca02c"; // green

    // Sizes
    var margin = {top: 20, right: 40, bottom: 170, left: 60},
        fullWidth = 930,
        fullHeight = 600,
        width = fullWidth - margin.left - margin.right,
        height = fullHeight - margin.top - margin.bottom;

    // Data vars
    var visData = [],
        tableData = {},
        legendData = [{"name": "genome size", "color": genomeColor, "toggle": "showGenome"},
            {"name": "pan peptidome", "color": panColor, "toggle": "showPan"},
            {"name": "core peptidome", "color": coreColor, "toggle": "showCore"},
            {"name": "unique peptides", "color": unicoreColor, "toggle": "showUnicore"}],
        lca = "";

    // the Javascript Worker for background data processing
    var worker = new Worker("/assets/workers/pancore_worker.js");

    // D3 vars
    var svg,
        graphData,
        tooltip,
        mouseOverWidth;

    // Drag and click vars
    var dragging = {},
        isDragging = false,
        hasDragged = false,
        onTrash = false,
        dragId,
        isClicked = false,
        clickId;

    // Toggles
    var toggles = {};
    toggles.showGenome = true;
    toggles.showPan = true;
    toggles.showCore = true;
    toggles.showUnicore = true;

    // Load vars
    var dataQueue = [],
        toLoad,
        mayStartAnimation = true,
        rank = 0;

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
    var unicoreLine = d3.svg.line()
        .interpolate("linear")
        .x(function (d) { return x(d.bioproject_id); })
        .y(function (d) { return y(d.unicore); });

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
            addData(data.msg.data, data.msg.rank);
            break;
        case 'setVisData':
            setVisData(data.msg.data, data.msg.lca, data.msg.rank);
            break;
        case 'sequencesDownloaded':
            returnPopoverSequences(data.msg.sequences, data.msg.type);
            break;
        default:
            console.log(data.msg);
        }
    }, false);
    worker.addEventListener('error', function (e) {
        error(e);
    }, false);

    // Add handler to the "add species"-form
    $("#add_species_peptidome").click(function () {
        setLoading(true);
        // Get all bioproject id's for the selected species id
        var url = "/pancore/genomes/species/" + $("#species_id").val() + ".json";
        $.getJSON(url, function (genomes) {
            clearTable();
            toLoad = 0;
            addGenomes(genomes);
        })
        .fail(function () {
            error("request error for " + url, "It seems like something went wrong while we loaded the data");
        });
        return false;
    });

    // Add handler to the "remove all"-button
    $("#remove-all").click(clearAllData);

    // Add handler to the autosort-button
    $("#autosort").mouseenter(function () {
        if (!$("#autosort").hasClass("open")) {
            $("#autosort-button").dropdown("toggle");
        }
    });
    $("#autosort").mouseleave(function () {
        if ($("#autosort").hasClass("open")) {
            $("#autosort-button").dropdown("toggle");
        }
    });
    $("#autosort ul a").click(function () {
        var i;
        sendToWorker("autoSort", {type : $(this).attr("data-type")});
        for (i in tableData) {
            tableData[i].status = "Processing...";
        }
        updateTable();
        $("#autosort").mouseleave();
        return false;
    });
    $("#autosort ul a").tooltip({placement : "right", container : "body"});

    // Make table sortable and droppable (JQuery UI)
    $("#genomes_table").disableSelection();
    $("#genomes_table, #pancore_graph").droppable({
        activeClass: "acceptDrop",
        hoverClass: "willDrop",
        tolerance: "pointer",
        accept: "li",
        drop: function (event, ui) {
            var g = [];
            ui.helper.find(".data.name").each(function () {
                g.push({name : $(this).text(), bioproject_id : parseInt($(this).attr("data-bioproject_id"), 10)});
            });
            if (g.length < 70 || confirm("You're trying to add a lot of genomes (" + g.length + "). Are you sure you want to continue?")) {
                addGenomes(g);
            }
        }
    });
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

    // Set up the fullscreen stuff
    if (fullScreenApi.supportsFullScreen) {
        $("#buttons-pancore").prepend("<button id='zoom-btn' class='btn btn-default btn-xs'><i class='glyphicon glyphicon-resize-full'></i> Enter full screen</button>");
        $("#zoom-btn").click(function () {
            // track full screen
            _gaq.push(['_trackEvent', 'Pancore', 'Full Screen']);
            window.fullScreenApi.requestFullScreen($("#pancore_graph").get(0));
        });
        $(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', resizeFullScreen);
    }

    // Scale the SVG on fullscreen enter and exit
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

    // Set up save image stuff
    $("#buttons-pancore").prepend("<button id='save-btn' class='btn btn-default btn-xs'><i class='glyphicon glyphicon-download'></i> Save as image</button>");
    $("#save-btn").click(function () {
        // track save image event
        _gaq.push(['_trackEvent', 'Pancore', 'Save Image']);

        var svg = $("#pancore_graph svg").wrap("<div></div>").parent().html();
        // Send the SVG code to the server for png conversion
        $.post("/convert", { image: svg }, function (data) {
            $("#save-as-modal .modal-body").html("<img src='" + data + "' />");
            $("#save-as-modal").modal();
        });
    });

    // Draw the graph
    redrawGraph();

    // Load sample data
    $("#species_id").val(470);
    $("#add_species_peptidome").click();

    // IE10 message
    if ($.browser.msie && $.browser.version === 10) {
        info("You're using Internet Explorer 10. Everything should work as expected, but for an optimal experience, please use a recent version of Mozilla Firefox or Google Chrome.");
    }

    // Sends a command and message to the worker
    function sendToWorker(command, message) {
        worker.postMessage({'cmd': command, 'msg': message});
    }

    // Initial method for adding genomes to the graph
    // genomes should be an array of bioproject id's
    // the table is updated to represent the loading status
    // the command is given to the worker to download the peptide id's
    function addGenomes(genomes) {
        var i;
        toLoad += genomes.length;
        for (i = 0; i < genomes.length; i++) {
            // only add new genomes
            if (tableData[genomes[i].bioproject_id] === undefined) {
                tableData[genomes[i].bioproject_id] = {"bioproject_id" : genomes[i].bioproject_id, "name" : genomes[i].name, "status" : "Loading...", "position" : 100 + i};
                loadData(genomes[i].bioproject_id, genomes[i].name);
            } else {
                toLoad -= 1;
            }
        }
        updateTable();
        setTableMessage("refresh", "Please wait while we load the data for these genomes.");
        if (toLoad === 0) {
            setLoading(false);
        }
    }

    // Loads peptides, based on bioproject_id
    function loadData(bioproject_id, name) {
        // offload this to the worker
        sendToWorker("loadData", {"bioproject_id" : bioproject_id, "name" : name});
    }

    // Gets called when the data is (done) loading
    // enables/disables some buttons and actions (e.g. reordering)
    function setLoading(loading) {
        if (loading) {
            $("#add_species_peptidome").button('loading');
            setTableMessage("refresh", "Please wait while we load the genomes for this species.");
            $("#genomes_table tbody.ui-sortable").sortable("option", "disabled", true);
        } else {
            $("#add_species_peptidome").button('reset');
            setTableMessage("info-sign", "You can drag rows to reorder them or use one of the autosort options.");
            $("#genomes_table tbody.ui-sortable").sortable("option", "disabled", false);

            // REMOVE THIS LINE
            sendToWorker("getUniqueSequences");
        }
    }

    // Gets called when the worker is done loading a new genome
    // the calculated data gets added the update queue if the request_rank matches
    function addData(data, request_rank) {
        // If the rank doesn't match, this is old data
        if (rank !== request_rank) return;
        dataQueue.push(data);
        tryUpdateGraph();
    }

    // Removes a genomes from the visualization:
    // - Removes it from the table
    // - Instructs the worker to recalculate the graph
    function removeData(genome) {
        var g = tableData[genome.bioproject_id];
        if (g.status !== "Done") return;
        var id = genome.bioproject_id;
        delete tableData[id];
        updateTable();
        var r = calculateTablePositions();
        sendToWorker("removeData", {"bioproject_id" : id, "order" : r.order, "start" : r.start});
    }

    // Replaces all the visualized data and updates graph and table
    function setVisData(data, l, request_rank) {
        var i,
            bioproject_id;
        if (rank !== request_rank) return;
        visData = data;
        lca = l;
        for (i = 0; i < visData.length; i++) {
            bioproject_id = visData[i].bioproject_id;
            if (typeof tableData[bioproject_id] !== "undefined") {
                tableData[bioproject_id].status = "Done";
                tableData[bioproject_id].position = i;
            }
        }
        updateGraph();
        updateTable();
    }

    // Resets everything:
    // - instructs the worker to flush all data
    // - clear all data vars
    // - update graph and table
    function clearAllData() {
        rank++;
        sendToWorker("clearAllData", "");
        toLoad = 0;
        setLoading(false);
        dataQueue = [];
        visData = [];
        tableData = {};
        lca = "";
        removePopoversAndHighlights();
        updateGraph();
        clearTable();
    }

    // Update the graph with data from the update queue when the previous animation is done.
    function tryUpdateGraph() {
        if (toLoad === 0) {
            return;
        }
        // Only update when the previous animation is done
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
        $("#table-message").html("<i class='glyphicon glyphicon-" + icon + "'></i> " + msg);
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
            stop = 0,
            i;
        for (i = 0; i < visData.length; i++) {
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
        updateTable();
    }
    // Updates the table
    function updateTable() {
        removePopovers();

        var text = "Genome";
        if (lca !== "") {
            text += " (LCA: " + lca + ")";
        }
        $("th.name").text(text);

        // Add rows
        var tr = d3.select("#genomes_table tbody").selectAll("tr.added")
            .data(d3.values(tableData), function (d) { return d.bioproject_id; });
        var newRows = tr.enter().append("tr").attr("class", "added");
        tr.exit().remove();
        tr.sort(function (a, b) { return a.position - b.position; });

        // Add cells
        newRows.append("td").attr("class", "handle").html("<i class='glyphicon glyphicon-resize-vertical'></i>");
        var td = tr.selectAll("td.data")
            .data(function (d) {
                return d3.entries(d).filter(function (entry) {
                    return entry.key !== "position" && entry.key !== "bioproject_id";
                });
            });
        td.enter()
            .append("td");
        td.text(function (d) { return d.value; })
            .attr("class", function (d) {return "data " + d.key; })
            .attr("colspan", "1");
        newRows.append("td")
            .attr("class", "button")
            .append("a")
            .html("<i class='glyphicon glyphicon-trash'></i>")
            .attr("class", "btn btn-default btn-xs")
            .attr("title", "remove genome")
            .on("click", removeData);
        newRows.each(function () { highlight(this); });
        tr.selectAll("td.button a.btn").classed("disabled", function (d) {return d.status !== "Done"; });
    }

    // Redraws the full D3 graph
    function redrawGraph() {
        // erase everything
        $("#pancore_graph svg").remove();
        $("#pancore_graph div.tip").remove();

        // create the svg
        svg = d3.select("#pancore_graph")
          .append("svg")
            .attr("viewBox", "0 0 " + fullWidth + " " + fullHeight)
            .attr("width", fullWidth)
            .attr("height", fullHeight)
            .attr("overflow", "hidden")
            .style("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif")
          .on("click", removePopoversAndHighlights)
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
        graphData = svg.append("g").attr("class", "graphData");

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
        graphData.append("path")
            .datum(visData)
            .attr("class", "line pan")
            .style("stroke", panColor)
            .attr("d", panLine);
        graphData.append("path")
            .datum(visData)
            .attr("class", "line core")
            .style("stroke", coreColor)
            .attr("d", coreLine);
        graphData.append("path")
            .datum(visData)
            .attr("class", "line unicore")
            .style("stroke", unicoreColor)
            .attr("d", unicoreLine);
        graphData.selectAll("path.line")
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
    }

    // Updates the D3 graph
    function updateGraph() {
        // Prepare for line transition
        var oldPanDatum = svg.select(".line.pan").datum(),
            oldCoreDatum = svg.select(".line.core").datum();
        if (oldPanDatum.length < visData.length && oldPanDatum.length > 0) {
            var i,
                diff = visData.length - oldPanDatum.length;
            for (i = 0; i < diff; i++) {
                oldPanDatum.push(oldPanDatum[oldPanDatum.length - 1]);
                oldCoreDatum.push(oldCoreDatum[oldCoreDatum.length - 1]);
            }
            svg.select(".line.pan").attr("d", panLine);
            svg.select(".line.core").attr("d", coreLine);
        }

        // set the domains
        x.domain(visData.map(function (d) { return d.bioproject_id; }));
        y.domain([0, getMaxVisibleDatapoint()]);

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
        var genomeDots = graphData.selectAll(".dot.genome")
            .data(visData, function (d) { return d.bioproject_id; });
        genomeDots.enter().append("circle")
            .attr("class", function (d) { return "dot genome _" + d.bioproject_id; })
            .attr("r", 5)
            .attr("fill", genomeColor)
            .attr("cx", width);
        genomeDots.transition()
            .duration(transitionDuration)
            .attr("cx", function (d) { return x(d.bioproject_id); })
            .attr("cy", function (d) { return y(d.peptides); })
            .attr("opacity", toggles.showGenome ? 1 : 0);
        genomeDots.exit()
            .transition()
                .attr("cy", height / 2)
                .attr("cx", width)
            .remove();
        var panDots = graphData.selectAll(".dot.pan")
            .data(visData, function (d) { return d.bioproject_id; });
        panDots.enter().append("circle")
            .attr("class", function (d) { return "dot pan _" + d.bioproject_id; })
            .attr("r", 5)
            .attr("fill", panColor)
            .attr("cx", width);
        panDots.transition()
            .duration(transitionDuration)
            .attr("cx", function (d) { return x(d.bioproject_id); })
            .attr("cy", function (d) { return y(d.pan); })
            .attr("opacity", toggles.showPan ? 1 : 0);
        panDots.exit()
            .transition()
                .attr("cy", height / 2)
                .attr("cx", width)
            .remove();
        var coreDots = graphData.selectAll(".dot.core")
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
            .attr("cy", function (d) { return y(d.core); })
            .attr("opacity", toggles.showCore ? 1 : 0);
        coreDots.exit()
            .transition()
                .attr("cy", height / 2)
                .attr("cx", width)
            .remove();
        var unicoreDots = graphData.selectAll(".dot.unicore")
            .data(visData.filter(function (entry) {
                return entry.unicore != null;
            }), function (d) {return d.bioproject_id; });
        unicoreDots.enter().append("circle")
            .attr("class", function (d) { return "dot unicore _" + d.bioproject_id; })
            .attr("r", 5)
            .attr("fill", unicoreColor)
            .attr("cx", width)
            .attr("cy", y(0));
        unicoreDots.transition()
            .duration(transitionDuration)
            .attr("cx", function (d) { return x(d.bioproject_id); })
            .attr("cy", function (d) { return y(d.unicore); })
            .attr("opacity", toggles.showUnicore ? 1 : 0);
        unicoreDots.exit()
            .transition()
                .attr("cy", height / 2)
                .attr("cx", width)
            .remove();

        // update the lines
        var dataCopy = visData.slice(0);
        if (visData.length > 0) {
            graphData.select(".line.pan").datum(dataCopy)
                .style("visibility", "visible")
                .transition()
                    .duration(transitionDuration)
                    .style("stroke", panColor)
                    .attr("opacity", toggles.showPan ? 1 : 0)
                    .attr("d", panLine);
            graphData.select(".line.core").datum(dataCopy)
                .style("visibility", "visible")
                .transition()
                    .duration(transitionDuration)
                    .style("stroke", coreColor)
                    .attr("opacity", toggles.showCore ? 1 : 0)
                    .attr("d", coreLine);
        } else {
            // hide the lines when there's no data
            // drawing them with no data results in JS errors
            graphData.select(".line.pan").style("visibility", "hidden");
            graphData.select(".line.core").style("visibility", "hidden");
        }
        if (visData.length > 0 && visData[0].unicore != null) {
            graphData.select(".line.unicore").datum(dataCopy)
                .style("visibility", "visible")
                .transition()
                    .duration(transitionDuration)
                    .style("stroke", unicoreColor)
                    .attr("opacity", toggles.showUnicore ? 1 : 0)
                    .attr("d", unicoreLine);
        } else {
            graphData.select(".line.unicore").style("visibility", "hidden");
        }

        // update the mouseover rects
        mouseOverWidth = (width / visData.length) / 1.5;
        var bars = graphData.selectAll(".bar")
            .data(visData, function (d) {return d.bioproject_id; });

        bars.enter().append("polygon")
            .attr("class", "bar")
            .style("fill-opacity", 0)
            .on("mouseover", mouseOver)
            .on("mouseout", mouseOut)
            .on("mousemove", mouseMove)
            .on("click", mouseClick)
            .call(d3.behavior.drag()
                .on("dragstart", dragStart)
                .on("drag", drag)
                .on("dragend", dragEnd));
        bars.transition()
            .duration(transitionDuration)
            .attr("points", function (d) {
                var ret = "";
                ret += (x(d.bioproject_id) - mouseOverWidth / 2) + ", " + (height + 15) + " ";
                ret += (x(d.bioproject_id) - mouseOverWidth / 2) + ", 0 ";
                ret += (x(d.bioproject_id) + mouseOverWidth / 2) + ", 0 ";
                ret += (x(d.bioproject_id) + mouseOverWidth / 2) + ", " + (height + 15) + " ";
                ret += (x(d.bioproject_id) + mouseOverWidth / 2 - (margin.bottom - 15)) + ", " + (height + margin.bottom) + " ";
                ret += (x(d.bioproject_id) - mouseOverWidth / 2 - (margin.bottom -15)) + ", " + (height + margin.bottom) + " ";
                return ret;
            });
        bars.exit().remove();

        // Put the handlebars on top
        $(".bar").parent().append($(".bar"));
    }

    // MOUSE EVENT FUNCTIONS

    // Shows the popover and highlights the clicked node
    function mouseClick(d) {
        d3.event.stopPropagation();
        var target = $(d3.event.target);
        if (isClicked && clickId === d.bioproject_id) {
            removePopoversAndHighlights();
        } else {
            removePopoversAndHighlights();
            removeTooltip();
            addHighlight(d);
            target.popover({
                html: true,
                trigger: "manual",
                position: "right",
                container: "#popovers",
                title: tableData[d.bioproject_id].name + " (bioproject " + d.bioproject_id + ")",
                content: getPopoverContent(d)});
            target.popover("show");
            target.attr("class", "bar pop");
            addPopoverBehaviour();
            // highlight new node
            isClicked = true;
            clickId = d.bioproject_id;
        }
    }
    // Shows the tooltip
    function mouseOver(d) {
        if (isDragging) return;
        if (isClicked && clickId === d.bioproject_id) return;
        addHighlight(d);
        var tooltipHtml = "<b>" + tableData[d.bioproject_id].name + "</b><br/>" + getTooltipContent(d);
        tooltip.html(tooltipHtml).style("visibility", "visible");
    }
    // Hides the tooltip
    function mouseOut(d) {
        if (isDragging) return;
        if (isClicked && clickId === d.bioproject_id) return;
        removeHighlight(d.bioproject_id);
    }
    // Updates the position of the tooltip
    function mouseMove(d) {
        if (isDragging) return;
        if (window.fullScreenApi.isFullScreen()) {
            tooltip.style("-webkit-transform", "translate3d(" + (d3.event.clientX + 15) + "px, " + (d3.event.clientY + 15) + "px, 0)");
            tooltip.style("webkit-transform", "translate3d(" + (d3.event.clientX + 15) + "px, " + (d3.event.clientY + 15) + "px, 0)");
        } else {
            tooltip.style("-webkit-transform", "translate3d(" + (d3.event.pageX + 15) + "px, " + (d3.event.pageY + 15) + "px, 0)");
            tooltip.style("webkit-transform", "translate3d(" + (d3.event.pageX + 15) + "px, " + (d3.event.pageY + 15) + "px, 0)");
        }
    }
    // Let the dragging begin!
    function dragStart(d) {
        isDragging = true;
        hasDragged = false;
        dragId = d.bioproject_id;
        dragging[d.bioproject_id] = this.__origin__ = x(d.bioproject_id);
        d3.select("body").style("cursor", "url(/closedhand.cur) 7 5, move");
        svg.selectAll(".bar").style("cursor", "url(/closedhand.cur) 7 5, move");
        svg.select("#trash").transition().duration(transitionDuration).attr("transform", "translate(-84 0)");
    }
    // Switches the position the nodes when it needs to
    function drag(d) {
        hasDragged = true;
        if (isClicked) {
            removePopovers();
            if (clickId !== d.bioproject_id) {
                removeHighlight(clickId);
            }
        }
        removeTooltip();
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
                .call(xAxis);
            svg.selectAll(".x.axis text").style("text-anchor", "end");
            svg.selectAll(".line").transition()
                .duration(transitionDuration)
                .style("stroke", "#cccccc");
        }
        // Update the position of the drag box and dots
        d3.select(this).attr("x", dragging[d.bioproject_id] - mouseOverWidth / 2);
        svg.selectAll(".dot._" + d.bioproject_id).attr("cx", dragging[d.bioproject_id]);
    }
    // Recalculates the position of all genomes and update the graph or
    // removes the genome when dropped on the trash can
    function dragEnd(d) {
        delete this.__origin__;
        delete dragging[d.bioproject_id];
        d3.select("body").style("cursor", "auto");
        svg.selectAll(".bar").style("cursor", "url(/openhand.cur) 7 5, move");
        svg.select("#trash").transition()
            .delay(onTrash ? transitionDuration : 0)
            .duration(transitionDuration)
            .attr("transform", "translate(0 0)")
            .attr("fill", "#cccccc");
        svg.select("#trash circle").transition()
            .delay(onTrash ? transitionDuration : 0)
            .duration(transitionDuration)
            .attr("stroke", "#cccccc");
        if (onTrash) {
            removeData(d);
        } else {
            // If we always update the graph, the click event never registers
            // in Chrome due to DOM reordering of the bars.
            if (hasDragged) {
                updateGraph();
                var r = calculateTablePositionsFromGraph();
                updateTable();
                sendToWorker("recalculatePanCore", {"order" : r.order, "start" : r.start, "stop" : r.stop});
            }
        }
        isDragging = false;
    }
    function legendClick(d) {
        toggles[d.toggle] = !toggles[d.toggle];
        updateGraph();
    }

    // MOUSE EVENT HELPER FUNCTIONS

    function removePopoversAndHighlights() {
        removePopovers();
        removeAllHighlights();
    }
    function removePopovers() {
        $(".bar.pop").popover("destroy");
        $(".bar.pop").attr("class", "bar");
        isClicked = false;
    }
    function addHighlight(d) {
        // add dropshadow to the dot and axis text
        svg.selectAll(".dot._" + d.bioproject_id).attr("filter", "url(#dropshadow)").attr("r", 6);
        svg.selectAll(".tick._" + d.bioproject_id + " text").style("font-weight", "bold");

        if (toggles.showGenome) {
            svg.select(".axisline.genome")
                .attr("y1", y(d.peptides))
                .attr("y2", y(d.peptides))
                .style("visibility", "visible");
        }
        if (toggles.showPan) {
            svg.select(".axisline.pan")
                .attr("y1", y(d.pan))
                .attr("y2", y(d.pan))
                .style("visibility", "visible");
        }
        if (toggles.showCore) {
            svg.select(".axisline.core")
                .attr("y1", y(d.core))
                .attr("y2", y(d.core))
                .style("visibility", "visible");
        }
        if (d.unicore != null && toggles.showUnicore) {
            svg.select(".axisline.unicore")
                .attr("y1", y(d.unicore))
                .attr("y2", y(d.unicore))
                .style("visibility", "visible");
        }
    }
    function removeHighlight(bioproject_id) {
        svg.selectAll(".dot._" + bioproject_id).attr("filter", "").attr("r", 5);
        svg.selectAll(".tick._" + bioproject_id + " text").style("font-weight", "normal");
        svg.selectAll(".axisline").style("visibility", "hidden");
        tooltip.style("visibility", "hidden");
    }
    function removeAllHighlights() {
        svg.selectAll(".dot").attr("filter", "").attr("r", 5);
        svg.selectAll(".tick text").style("font-weight", "normal");
        svg.selectAll(".axisline").style("visibility", "hidden");
        tooltip.style("visibility", "hidden");
    }
    function removeTooltip() {
        tooltip.style("visibility", "hidden");
    }
    function getTooltipContent(d) {
        var tooltipHtml = "<span style='color: " + genomeColor + ";'>&#9632;</span> genome size: <b>" + d3.format(",")(d.peptides) + "</b><br/>";
        if (toggles.showPan)
            tooltipHtml += "<span style='color: " + panColor + ";'>&#9632;</span> pan peptides: <b>" + d3.format(",")(d.pan) + "</b><br/>";
        if (toggles.showCore)
            tooltipHtml += "<span style='color: " + coreColor + ";'>&#9632;</span> core peptides: <b>" + d3.format(",")(d.core) + "</b>";
        if (d.unicore != null && toggles.showUnicore) {
            tooltipHtml += "<br/><span style='color: " + unicoreColor + ";'>&#9632;</span> unique peptides: <b>" + d3.format(",")(d.unicore) + "</b>";
        }
        return tooltipHtml;
    }
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
    function addPopoverBehaviour() {
        $(".popover").prepend("<button type='button' class='close' style='margin-right: 5px'>&times;</button>");
        $(".close").click(removePopoversAndHighlights);
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
        $("#download-peptides ul a").click(function () {
            var type = $(this).attr("data-type");
            var bioproject_id = $(this).attr("data-bioproject_id");
            sendToWorker("getSequences", {"type" : type, "bioproject_id" : bioproject_id});
            $("#download-peptides").mouseleave();
            $("#download-peptides-toggle").button('loading');
            return false;
        });
    }
    function returnPopoverSequences(sequences, type) {
        $("#pancore_graph form.download").remove();
        $("#pancore_graph").append("<form class='download' method='post' action='download'></form>");
        $("#pancore_graph form.download").append("<input type='hidden' name='filename' value='" + type + "-sequences.txt'/>");
        $("#pancore_graph form.download").append("<input type='hidden' name='data' value='" + sequences + "'/>");
        $("#pancore_graph form.download").submit();
        $("#download-peptides-toggle").button('reset');
    }
    function position(d) {
        var v = dragging[d.bioproject_id];
        return v == null ? x(d.bioproject_id) : v;
    }
    function isChanged(oldData, newData) {
        var i;
        if (oldData.length != newData.length) {
            return true;
        }
        for (i = 0; i < oldData.length; i++) {
            if (oldData[i].bioproject_id != newData[i].bioproject_id) {
                return true;
            }
        }
        return false;
    }
    function trashMouseOver() {
        onTrash = true;
        if (!isDragging) return;
        svg.select("#trash").transition()
            .duration(transitionDuration / 2)
            .attr("fill", "#333333");
        svg.select("#trash circle").transition()
            .duration(transitionDuration / 2)
            .attr("stroke", "#d6616b");
        svg.selectAll(".dot._" + dragId).transition()
            .duration(transitionDuration / 2)
            .attr("fill", "#d6616b");
    }
    function trashMouseOut() {
        onTrash = false;
        if (!isDragging) return;
        svg.select("#trash").transition()
            .duration(transitionDuration)
            .attr("fill", "#cccccc");
        svg.select("#trash circle").transition()
            .duration(transitionDuration)
            .attr("stroke", "#cccccc");
        svg.selectAll(".dot.genome._" + dragId).transition()
            .duration(transitionDuration)
            .attr("fill", genomeColor);
        svg.selectAll(".dot.pan._" + dragId).transition()
            .duration(transitionDuration)
            .attr("fill", panColor);
        svg.selectAll(".dot.core._" + dragId).transition()
            .duration(transitionDuration)
            .attr("fill", coreColor);
        svg.selectAll(".dot.unicore._" + dragId).transition()
            .duration(transitionDuration)
            .attr("fill", unicoreColor);
    }

    // GENERAL HELPER FUNCTIONS

    function getMaxVisibleDatapoint() {
        var max = 0,
            i;
        if (visData.length === 0) {
            return 0;
        }
        if (toggles.showPan) {
            return visData[visData.length - 1].pan;
        }
        if (toggles.showGenome) {
            for (i = 0; i < visData.length; i++) {
                if (visData[i].peptides > max) {
                    max = visData[i].peptides;
                }
            }
            return max * 1.3;
        }
        if (toggles.showCore) {
            return visData[0].core * 1.3;
        }
        if (toggles.showUnicore) {
            return visData[0].unicore * 1.3;
        }
        return 0;
    }
}