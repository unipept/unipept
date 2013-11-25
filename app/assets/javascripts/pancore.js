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
    delete data.children;

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
 * Initializes the main graph, the similarity matrix and drop-target-table
 */
function init_graphs() {
    // *** GLOBAL VARS ***

    // Animation and style stuff
    var transitionDuration = 500,
        fullWidth = 930,
        fullHeight = 600;

    // Data vars
    var pancoreData = [],
        tableData = {},
        lca = "";

    // Load vars
    var dataQueue = [],
        toLoad,
        mayStartAnimation = true,
        rank = 0;

    // the Javascript Worker for background data processing
    var worker = new Worker("/assets/workers/pancore_worker.js");

    /* will be refactored soon, is for testing now */
    var matrix = new constructSimMatrix();

    // *** PANCORE VARS ***
    var genomeColor = "#d9d9d9",  // gray
        panColor = "#1f77b4",     // blue
        coreColor = "#ff7f0e",    // orange
        unicoreColor = "#2ca02c", // green
        legendData = [{"name": "genome size", "color": genomeColor, "toggle": "showGenome"},
            {"name": "pan peptidome", "color": panColor, "toggle": "showPan"},
            {"name": "core peptidome", "color": coreColor, "toggle": "showCore"},
            {"name": "unique peptides", "color": unicoreColor, "toggle": "showUnicore"}];

    // Sizes
    var pancoreMargin = {top: 20, right: 40, bottom: 170, left: 60},
        pancoreWidth = fullWidth - pancoreMargin.left - pancoreMargin.right,
        pancoreHeight = fullHeight - pancoreMargin.top - pancoreMargin.bottom,
        pancoreMouseOverWidth;

    // D3 vars
    var pancoreSvg,
        pancoreGraphArea,
        pancoreTooltip;

    // Drag and click vars
    var pancoreMouse = {};
    pancoreMouse.dragging = {};
    pancoreMouse.isDragging = false;
    pancoreMouse.hasDragged = false;
    pancoreMouse.onTrash = false;
    pancoreMouse.dragId;
    pancoreMouse.isClicked = false;
    pancoreMouse.clickId;

    // toggles
    var pancoreToggles = {};
    pancoreToggles.showGenome = true;
    pancoreToggles.showPan = true;
    pancoreToggles.showCore = true;
    pancoreToggles.showUnicore = true;

    // Scales
    var pancoreX = d3.scale.ordinal().rangePoints([0, pancoreWidth], 1),
        pancoreY = d3.scale.linear().range([pancoreHeight, 0]);

    // Axes
    var xAxis = d3.svg.axis()
        .scale(pancoreX)
        .tickFormat(function (d) { return tableData[d].name; })
        .orient("bottom"),
        yAxis = d3.svg.axis()
        .scale(pancoreY)
        .orient("left");

    // Graph lines helpers
    var panLine = d3.svg.line()
        .interpolate("linear")
        .x(function (d) { return pancoreX(d.bioproject_id); })
        .y(function (d) { return pancoreY(d.pan); });
    var coreLine = d3.svg.line()
        .interpolate("linear")
        .x(function (d) { return pancoreX(d.bioproject_id); })
        .y(function (d) { return pancoreY(d.core); });
    var unicoreLine = d3.svg.line()
        .interpolate("linear")
        .x(function (d) { return pancoreX(d.bioproject_id); })
        .y(function (d) { return pancoreY(d.unicore); });

    // Stores tooltip position till next frame
    var tooltipX = 0,
        tooltipY = 0;

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
        case 'setPancoreData':
            setPancoreData(data.msg.data, data.msg.lca, data.msg.rank);
            break;
        case 'sequencesDownloaded':
            returnPopoverSequences(data.msg.sequences, data.msg.type);
            break;
        case 'sim_matrix':
            showMatrix(data.msg.genomes, data.msg.sim_matrix, data.msg.order);
            break;
        case 'newOrder':
            reorderMatrix(data.msg);
            break;
        case 'sim_graph':
            drawTree(data.msg.data, data.msg.order);
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
            if ($(".tab-content .active").attr('id') === "pancore_graph_wrapper") {
                // GA event tracking
                _gaq.push(['_trackEvent', 'Pancore', 'Full Screen', 'graph']);
                window.fullScreenApi.requestFullScreen($("#pancore_graph_wrapper").get(0));
            } else {
                // GA event tracking
                _gaq.push(['_trackEvent', 'Pancore', 'Full Screen', 'simmatrix']);
                window.fullScreenApi.requestFullScreen($("#sim_matrix_wrapper").get(0));
            }
        });
        $(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', resizeFullScreen);
    }

    // Scale the SVG on fullscreen enter and exit
    function resizeFullScreen() {
        if ($(".tab-content .active").attr('id') === "pancore_graph_wrapper") {
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
        } else {
            // TODO: add handling code for sim matrix
        }
    }

    // Set up save image stuff
    $("#buttons-pancore").prepend("<button id='save-img' class='btn btn-default btn-xs'><i class='glyphicon glyphicon-download'></i> Save image</button>");
    $("#save-img").click(function clickSaveImage() {
        if ($(".tab-content .active").attr('id') === "pancore_graph_wrapper") {
            // track save image event
            _gaq.push(['_trackEvent', 'Pancore', 'Save Image', 'graph']);
            triggerDownloadModal("#pancore_graph svg", null, "unique_peptides_graph");
        } else {
            // track save image event
            _gaq.push(['_trackEvent', 'Pancore', 'Save Image', 'sim matrix']);
            triggerDownloadModal("#sim_matrix svg", null, "unique_peptides_matrix");
        }
    });
    $("#buttons-pancore").prepend("<button id='save-data' class='btn btn-default btn-xs'><i class='glyphicon glyphicon-download'></i> Save data</button>");
    $("#save-data").click(function clickSaveData() {
        // track save data event
        _gaq.push(['_trackEvent', 'Pancore', 'Save Data']);
        exportData();
    });

    // Draw the graph
    redrawPancore();

    // Load sample data
    $("#species_id").val(470);
    $("#add_species_peptidome").click();

    // IE10 message
    if (navigator.appVersion.indexOf("MSIE 10") != -1) {
        info("You're using Internet Explorer 10. Everything should work as expected, but for an optimal experience, please use a recent version of Mozilla Firefox or Google Chrome.");
    }

    // Sends a command and message to the worker
    function sendToWorker(command, message) {
        worker.postMessage({'cmd': command, 'msg': message});
    }

    // setup similarity matrix buttons etc
    $("#sim_matrix_buttons").prepend("<button id='calculate-matrix-btn' class='btn btn-default'><i class='glyphicon glyphicon-refresh'></i> Calculate Similarity Matrix</button>");
    $("#calculate-matrix-btn").click(function () {
        matrix.calculateSimilarity();
        //sendToWorker('calculateSimilarity', '');
    });

    $("#sim_matrix_buttons").prepend("<button id='cluster-matrix-btn' class='btn btn-default'><i class='glyphicon glyphicon-refresh'></i> Cluster Similarity Matrix</button>");
    $("#cluster-matrix-btn").click(function () {
        matrix.clusterMatrix();
        //sendToWorker('clusterMatrix', '');
    });

    // Only cluster when the initial data has loaded
    function clusterIfReady() {
        if( toLoad === 0 ) {
            sendToWorker('clusterMatrix', '');
        } else {
            setTimeout(clusterIfReady, 200);
        }
    }

    // On click of tab, cluster matrix
    //$("a[href='#sim_matrix_wrapper']").click(clusterIfReady);


    function showMatrix(genomes, data, order) {
        //$('#sim_matrix').empty();
        //matrix.reDraw();
    }

    // Initial method for adding genomes
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
        tryUpdateMatrix();
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
    function setPancoreData(data, l, request_rank) {
        var i,
            bioproject_id;
        if (rank !== request_rank) return;
        pancoreData = data;
        lca = l;
        for (i = 0; i < pancoreData.length; i++) {
            bioproject_id = pancoreData[i].bioproject_id;
            if (typeof tableData[bioproject_id] !== "undefined") {
                tableData[bioproject_id].status = "Done";
                tableData[bioproject_id].position = i;
            }
        }
        updatePancore();
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
        pancoreData = [];
        tableData = {};
        lca = "";
        removePopoversAndHighlights();
        updatePancore();
        clearTable();
    }

    function tryUpdateMatrix() {
        sendToWorker('newDataAdded');
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
                pancoreData.push(data);
                tableData[data.bioproject_id].status = "Done";
                tableData[data.bioproject_id].position = pancoreData.length - 1;
                matrix.addPeptide(data.bioproject_id, data.peptide_list, data.name);
                toLoad--;
            }
            if (addedSomething) {
                if (toLoad === 0) {
                    setLoading(false);
                }
                updatePancore();
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
        for (i = 0; i < pancoreData.length; i++) {
            var bioproject_id = pancoreData[i].bioproject_id;
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
    function redrawPancore() {
        // erase everything
        $("#pancore_graph svg").remove();
        $("#pancore_graph div.tip").remove();

        // create the svg
        pancoreSvg = d3.select("#pancore_graph")
          .append("svg")
            .attr("version", "1.1")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("viewBox", "0 0 " + fullWidth + " " + fullHeight)
            .attr("width", fullWidth)
            .attr("height", fullHeight)
            .attr("overflow", "hidden")
            .style("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif")
          .on("click", removePopoversAndHighlights)
          .append("g")
            .attr("transform", "translate(" + pancoreMargin.left + "," + pancoreMargin.top + ")");

        // create the tooltip
        pancoreTooltip = d3.select("#pancore_graph")
          .append("div")
            .attr("class", "tip")
            .style("position", "absolute")
            .style("top", "0px")
            .style("left", "0px")
            .style("z-index", "10")
            .style("visibility", "hidden");

        // create the dropshadow filter
        var temp = pancoreSvg.append("svg:defs")
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
        pancoreSvg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + pancoreHeight + ")")
            .call(xAxis);

        // add the y-axis
        pancoreSvg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Number of peptides");

        pancoreSvg.selectAll(".axis line, .axis path")
            .style("fill", "none")
            .style("stroke", "#000")
            .style("shape-rendering", "crispEdges");

        // container used for dots, paths and bars
        pancoreGraphArea = pancoreSvg.append("g").attr("class", "pancoreGraphArea");

        // add legend
        var legend = pancoreSvg.selectAll(".legend")
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
        pancoreGraphArea.append("path")
            .datum(pancoreData)
            .attr("class", "line pan")
            .style("stroke", panColor)
            .attr("d", panLine);
        pancoreGraphArea.append("path")
            .datum(pancoreData)
            .attr("class", "line core")
            .style("stroke", coreColor)
            .attr("d", coreLine);
        pancoreGraphArea.append("path")
            .datum(pancoreData)
            .attr("class", "line unicore")
            .style("stroke", unicoreColor)
            .attr("d", unicoreLine);
        pancoreGraphArea.selectAll("path.line")
            .style("stroke-width", 2)
            .style("fill", "none");

        // add axis marks
        pancoreSvg.insert("line")
            .attr("class", "axisline genome")
            .attr("stroke", genomeColor);
        pancoreSvg.insert("line")
            .attr("class", "axisline pan")
            .attr("stroke", panColor);
        pancoreSvg.insert("line")
            .attr("class", "axisline core")
            .attr("stroke", coreColor);
        pancoreSvg.insert("line")
            .attr("class", "axisline unicore")
            .attr("stroke", unicoreColor);
        pancoreSvg.selectAll("line.axisline")
            .attr("stroke-width", "2")
            .attr("x1", "6")
            .attr("x2", "-6")
            .attr("shape-rendering", "crispEdges")
            .style("visibility", "hidden");

        // trash bin
        var trash = pancoreSvg.insert("g")
            .attr("id", "trash")
            .attr("fill", "#cccccc")
            .style("opacity", "0")
            .on("mouseover", trashMouseOver)
            .on("mouseout", trashMouseOut)
        .insert("g")
            .attr("transform", "translate(" + (fullWidth + 30) + " " + (pancoreHeight - 46) / 2 + ")");
        trash.append("circle")
            .attr("r", 30)
            .attr("stroke", "#cccccc")
            .attr("stroke-width", 3)
            .attr("fill", "white")
            .attr("cx", -40)
            .attr("cy", 23);
        trash.append("rect")
            .attr("height", pancoreHeight)
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
    function updatePancore() {
        // Prepare for line transition
        var oldPanDatum = pancoreSvg.select(".line.pan").datum(),
            oldCoreDatum = pancoreSvg.select(".line.core").datum();
        if (oldPanDatum.length < pancoreData.length && oldPanDatum.length > 0) {
            var i,
                diff = pancoreData.length - oldPanDatum.length;
            for (i = 0; i < diff; i++) {
                oldPanDatum.push(oldPanDatum[oldPanDatum.length - 1]);
                oldCoreDatum.push(oldCoreDatum[oldCoreDatum.length - 1]);
            }
            pancoreSvg.select(".line.pan").attr("d", panLine);
            pancoreSvg.select(".line.core").attr("d", coreLine);
        }

        // set the domains
        pancoreX.domain(pancoreData.map(function (d) { return d.bioproject_id; }));
        pancoreY.domain([0, getMaxVisibleDatapoint()]);

        // update the axes
        pancoreSvg.select(".x.axis").transition().duration(transitionDuration).call(xAxis);
        pancoreSvg.select(".y.axis").transition().duration(transitionDuration).call(yAxis);
        pancoreSvg.selectAll(".axis line, .axis path")
            .style("fill", "none")
            .style("stroke", "#000")
            .style("shape-rendering", "crispEdges");
        // rotate the x-axis labels
        pancoreSvg.selectAll(".x.axis text")
            .style("text-anchor", "end")
            .transition()
                .duration(transitionDuration)
                .attr("transform", "translate(-5,0)rotate(-45)");
        pancoreSvg.selectAll(".tick").attr("class", function (d) { return "tick major _" + d; });

        // draw the dots
        var genomeDots = pancoreGraphArea.selectAll(".dot.genome")
            .data(pancoreData, function (d) { return d.bioproject_id; });
        genomeDots.enter().append("circle")
            .attr("class", function (d) { return "dot genome _" + d.bioproject_id; })
            .attr("r", 5)
            .attr("fill", genomeColor)
            .attr("cx", pancoreWidth);
        genomeDots.transition()
            .duration(transitionDuration)
            .attr("cx", function (d) { return pancoreX(d.bioproject_id); })
            .attr("cy", function (d) { return pancoreY(d.peptides); })
            .attr("opacity", pancoreToggles.showGenome ? 1 : 0);
        genomeDots.exit()
            .transition()
                .attr("cy", pancoreHeight / 2)
                .attr("cx", pancoreWidth)
            .remove();
        var panDots = pancoreGraphArea.selectAll(".dot.pan")
            .data(pancoreData, function (d) { return d.bioproject_id; });
        panDots.enter().append("circle")
            .attr("class", function (d) { return "dot pan _" + d.bioproject_id; })
            .attr("r", 5)
            .attr("fill", panColor)
            .attr("cx", pancoreWidth);
        panDots.transition()
            .duration(transitionDuration)
            .attr("cx", function (d) { return pancoreX(d.bioproject_id); })
            .attr("cy", function (d) { return pancoreY(d.pan); })
            .attr("opacity", pancoreToggles.showPan ? 1 : 0);
        panDots.exit()
            .transition()
                .attr("cy", pancoreHeight / 2)
                .attr("cx", pancoreWidth)
            .remove();
        var coreDots = pancoreGraphArea.selectAll(".dot.core")
            .data(pancoreData, function (d) {return d.bioproject_id; });
        coreDots.enter().append("circle")
            .attr("class", function (d) { return "dot core _" + d.bioproject_id; })
            .attr("r", 5)
            .attr("fill", coreColor)
            .attr("cx", pancoreWidth)
            .attr("cy", pancoreY(0));
        coreDots.transition()
            .duration(transitionDuration)
            .attr("cx", function (d) { return pancoreX(d.bioproject_id); })
            .attr("cy", function (d) { return pancoreY(d.core); })
            .attr("opacity", pancoreToggles.showCore ? 1 : 0);
        coreDots.exit()
            .transition()
                .attr("cy", pancoreHeight / 2)
                .attr("cx", pancoreWidth)
            .remove();
        var unicoreDots = pancoreGraphArea.selectAll(".dot.unicore")
            .data(pancoreData.filter(function (entry) {
                return entry.unicore != null;
            }), function (d) {return d.bioproject_id; });
        unicoreDots.enter().append("circle")
            .attr("class", function (d) { return "dot unicore _" + d.bioproject_id; })
            .attr("r", 5)
            .attr("fill", unicoreColor)
            .attr("cx", pancoreWidth)
            .attr("cy", pancoreY(0));
        unicoreDots.transition()
            .duration(transitionDuration)
            .attr("cx", function (d) { return pancoreX(d.bioproject_id); })
            .attr("cy", function (d) { return pancoreY(d.unicore); })
            .attr("opacity", pancoreToggles.showUnicore ? 1 : 0);
        unicoreDots.exit()
            .transition()
                .attr("cy", pancoreHeight / 2)
                .attr("cx", pancoreWidth)
            .remove();

        // update the lines
        var dataCopy = pancoreData.slice(0);
        if (pancoreData.length > 0) {
            pancoreGraphArea.select(".line.pan").datum(dataCopy)
                .style("visibility", "visible")
                .transition()
                    .duration(transitionDuration)
                    .style("stroke", panColor)
                    .attr("opacity", pancoreToggles.showPan ? 1 : 0)
                    .attr("d", panLine);
            pancoreGraphArea.select(".line.core").datum(dataCopy)
                .style("visibility", "visible")
                .transition()
                    .duration(transitionDuration)
                    .style("stroke", coreColor)
                    .attr("opacity", pancoreToggles.showCore ? 1 : 0)
                    .attr("d", coreLine);
        } else {
            // hide the lines when there's no data
            // drawing them with no data results in JS errors
            pancoreGraphArea.select(".line.pan").style("visibility", "hidden");
            pancoreGraphArea.select(".line.core").style("visibility", "hidden");
        }
        if (pancoreData.length > 0 && pancoreData[0].unicore != null) {
            pancoreGraphArea.select(".line.unicore").datum(dataCopy)
                .style("visibility", "visible")
                .transition()
                    .duration(transitionDuration)
                    .style("stroke", unicoreColor)
                    .attr("opacity", pancoreToggles.showUnicore ? 1 : 0)
                    .attr("d", unicoreLine);
        } else {
            pancoreGraphArea.select(".line.unicore").style("visibility", "hidden");
        }

        // update the mouseover rects
        pancoreMouseOverWidth = (pancoreWidth / pancoreData.length) / 1.5;
        var bars = pancoreGraphArea.selectAll(".bar")
            .data(pancoreData, function (d) {return d.bioproject_id; });

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
                ret += (pancoreX(d.bioproject_id) - pancoreMouseOverWidth / 2) + ", " + (pancoreHeight + 15) + " ";
                ret += (pancoreX(d.bioproject_id) - pancoreMouseOverWidth / 2) + ", 0 ";
                ret += (pancoreX(d.bioproject_id) + pancoreMouseOverWidth / 2) + ", 0 ";
                ret += (pancoreX(d.bioproject_id) + pancoreMouseOverWidth / 2) + ", " + (pancoreHeight + 15) + " ";
                ret += (pancoreX(d.bioproject_id) + pancoreMouseOverWidth / 2 - (pancoreMargin.bottom - 15)) + ", " + (pancoreHeight + pancoreMargin.bottom) + " ";
                ret += (pancoreX(d.bioproject_id) - pancoreMouseOverWidth / 2 - (pancoreMargin.bottom -15)) + ", " + (pancoreHeight + pancoreMargin.bottom) + " ";
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
        if (pancoreMouse.isClicked && pancoreMouse.clickId === d.bioproject_id) {
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
            pancoreMouse.isClicked = true;
            pancoreMouse.clickId = d.bioproject_id;
        }
    }
    // Shows the tooltip
    function mouseOver(d) {
        if (pancoreMouse.isDragging) return;
        if (pancoreMouse.isClicked && pancoreMouse.clickId === d.bioproject_id) return;
        addHighlight(d);
        var tooltipHtml = "<b>" + tableData[d.bioproject_id].name + "</b><br/>" + getTooltipContent(d);
        pancoreTooltip.html(tooltipHtml).style("visibility", "visible");
    }
    // Hides the tooltip
    function mouseOut(d) {
        if (pancoreMouse.isDragging) return;
        if (pancoreMouse.isClicked && pancoreMouse.clickId === d.bioproject_id) return;
        removeHighlight(d.bioproject_id);
    }
    // Updates the position of the tooltip
    function mouseMove(d) {
        if (pancoreMouse.isDragging) return;
        if (window.fullScreenApi.isFullScreen()) {
            tooltipX = d3.event.clientX + 15;
            tooltipY = d3.event.clientY + 15;
        } else {
            tooltipX = d3.event.pageX + 15;
            tooltipY = d3.event.pageY + 15;
        }
        requestAnimFrame(moveTooltip);
    }
    // Let the dragging begin!
    function dragStart(d) {
        pancoreMouse.isDragging = true;
        pancoreMouse.hasDragged = false;
        pancoreMouse.dragId = d.bioproject_id;
        pancoreMouse.dragging[d.bioproject_id] = this.__origin__ = pancoreX(d.bioproject_id);
        d3.select("body").style("cursor", "url(/closedhand.cur) 7 5, move");
        pancoreSvg.selectAll(".bar").style("cursor", "url(/closedhand.cur) 7 5, move");
        pancoreSvg.select("#trash").transition()
            .duration(transitionDuration)
            .attr("transform", "translate(-84 0)")
            .style("opacity", "1");
    }
    // Switches the position the nodes when it needs to
    function drag(d) {
        pancoreMouse.hasDragged = true;
        if (pancoreMouse.isClicked) {
            removePopovers();
            if (pancoreMouse.clickId !== d.bioproject_id) {
                removeHighlight(pancoreMouse.clickId);
            }
        }
        removeTooltip();
        pancoreMouse.dragging[d.bioproject_id] = Math.min(pancoreWidth, Math.max(0, this.__origin__ += d3.event.dx));
        requestAnimFrame(moveDrag);
    }
    // Recalculates the position of all genomes and update the graph or
    // removes the genome when dropped on the trash can
    function dragEnd(d) {
        delete this.__origin__;
        delete pancoreMouse.dragging[d.bioproject_id];
        d3.select("body").style("cursor", "auto");
        pancoreSvg.selectAll(".bar").style("cursor", "url(/openhand.cur) 7 5, move");
        pancoreSvg.select("#trash").transition()
            .delay(pancoreMouse.onTrash ? transitionDuration : 0)
            .duration(transitionDuration)
            .attr("transform", "translate(0 0)")
            .style("opacity", "0")
            .attr("fill", "#cccccc");
        pancoreSvg.select("#trash circle").transition()
            .delay(pancoreMouse.onTrash ? transitionDuration : 0)
            .duration(transitionDuration)
            .attr("stroke", "#cccccc");
        if (pancoreMouse.onTrash) {
            removeData(d);
        } else {
            // If we always update the graph, the click event never registers
            // in Chrome due to DOM reordering of the bars.
            if (pancoreMouse.hasDragged) {
                updatePancore();
                var r = calculateTablePositionsFromGraph();
                updateTable();
                sendToWorker("recalculatePanCore", {"order" : r.order, "start" : r.start, "stop" : r.stop});
            }
        }
        pancoreMouse.isDragging = false;
    }
    function legendClick(d) {
        pancoreToggles[d.toggle] = !pancoreToggles[d.toggle];
        updatePancore();
    }

    /**
     * Invokes a file download containing all data currently shown
     * in the graph (i.e. each datapoint) in csv format.
     */
    function exportData() {
        var exportString = "name,bioproject_id,genome_peptides,core_peptides,pan_peptides,unique_peptides\n",
            i,
            tempArray;
        for (i = 0; i < pancoreData.length; i++) {
            tempArray = [];
            tempArray.push(tableData[pancoreData[i].bioproject_id].name);
            tempArray.push(pancoreData[i].bioproject_id);
            tempArray.push(pancoreData[i].peptides);
            tempArray.push(pancoreData[i].core);
            tempArray.push(pancoreData[i].pan);
            tempArray.push(pancoreData[i].unicore);
            exportString += tempArray.join(",") + "\n";
        }
        downloadDataByForm(exportString, "unique_peptides.csv");
    }

    // MOUSE EVENT HELPER FUNCTIONS

    function removePopoversAndHighlights() {
        removePopovers();
        removeAllHighlights();
    }
    function removePopovers() {
        $(".bar.pop").popover("destroy");
        $(".bar.pop").attr("class", "bar");
        pancoreMouse.isClicked = false;
    }
    function addHighlight(d) {
        // add dropshadow to the dot and axis text
        pancoreSvg.selectAll(".dot._" + d.bioproject_id).attr("filter", "url(#dropshadow)").attr("r", 6);
        pancoreSvg.selectAll(".tick._" + d.bioproject_id + " text").style("font-weight", "bold");

        if (pancoreToggles.showGenome) {
            pancoreSvg.select(".axisline.genome")
                .attr("y1", pancoreY(d.peptides))
                .attr("y2", pancoreY(d.peptides))
                .style("visibility", "visible");
        }
        if (pancoreToggles.showPan) {
            pancoreSvg.select(".axisline.pan")
                .attr("y1", pancoreY(d.pan))
                .attr("y2", pancoreY(d.pan))
                .style("visibility", "visible");
        }
        if (pancoreToggles.showCore) {
            pancoreSvg.select(".axisline.core")
                .attr("y1", pancoreY(d.core))
                .attr("y2", pancoreY(d.core))
                .style("visibility", "visible");
        }
        if (d.unicore != null && pancoreToggles.showUnicore) {
            pancoreSvg.select(".axisline.unicore")
                .attr("y1", pancoreY(d.unicore))
                .attr("y2", pancoreY(d.unicore))
                .style("visibility", "visible");
        }
    }
    function removeHighlight(bioproject_id) {
        pancoreSvg.selectAll(".dot._" + bioproject_id).attr("filter", "").attr("r", 5);
        pancoreSvg.selectAll(".tick._" + bioproject_id + " text").style("font-weight", "normal");
        pancoreSvg.selectAll(".axisline").style("visibility", "hidden");
        pancoreTooltip.style("visibility", "hidden");
    }
    function removeAllHighlights() {
        pancoreSvg.selectAll(".dot").attr("filter", "").attr("r", 5);
        pancoreSvg.selectAll(".tick text").style("font-weight", "normal");
        pancoreSvg.selectAll(".axisline").style("visibility", "hidden");
        pancoreTooltip.style("visibility", "hidden");
    }
    function removeTooltip() {
        pancoreTooltip.style("visibility", "hidden");
    }
    function getTooltipContent(d) {
        var tooltipHtml = "<span style='color: " + genomeColor + ";'>&#9632;</span> genome size: <b>" + d3.format(",")(d.peptides) + "</b><br/>";
        if (pancoreToggles.showPan)
            tooltipHtml += "<span style='color: " + panColor + ";'>&#9632;</span> pan peptides: <b>" + d3.format(",")(d.pan) + "</b><br/>";
        if (pancoreToggles.showCore)
            tooltipHtml += "<span style='color: " + coreColor + ";'>&#9632;</span> core peptides: <b>" + d3.format(",")(d.core) + "</b>";
        if (d.unicore != null && pancoreToggles.showUnicore) {
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
        downloadDataByForm(sequences, type + '-sequences.txt', function enableButton() {
            $("#download-peptides-toggle").button('reset');
        });
    }
    function position(d) {
        var v = pancoreMouse.dragging[d.bioproject_id];
        return v == null ? pancoreX(d.bioproject_id) : v;
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
        pancoreMouse.onTrash = true;
        if (!pancoreMouse.isDragging) return;
        pancoreSvg.select("#trash").transition()
            .duration(transitionDuration / 2)
            .attr("fill", "#333333");
        pancoreSvg.select("#trash circle").transition()
            .duration(transitionDuration / 2)
            .attr("stroke", "#d6616b");
        pancoreSvg.selectAll(".dot._" + pancoreMouse.dragId).transition()
            .duration(transitionDuration / 2)
            .attr("fill", "#d6616b");
    }
    function trashMouseOut() {
        pancoreMouse.onTrash = false;
        if (!pancoreMouse.isDragging) return;
        pancoreSvg.select("#trash").transition()
            .duration(transitionDuration)
            .attr("fill", "#cccccc");
        pancoreSvg.select("#trash circle").transition()
            .duration(transitionDuration)
            .attr("stroke", "#cccccc");
        pancoreSvg.selectAll(".dot.genome._" + pancoreMouse.dragId).transition()
            .duration(transitionDuration)
            .attr("fill", genomeColor);
        pancoreSvg.selectAll(".dot.pan._" + pancoreMouse.dragId).transition()
            .duration(transitionDuration)
            .attr("fill", panColor);
        pancoreSvg.selectAll(".dot.core._" + pancoreMouse.dragId).transition()
            .duration(transitionDuration)
            .attr("fill", coreColor);
        pancoreSvg.selectAll(".dot.unicore._" + pancoreMouse.dragId).transition()
            .duration(transitionDuration)
            .attr("fill", unicoreColor);
    }

    // Request Animation Frame functions
    function moveTooltip() {
        pancoreTooltip.style("-webkit-transform", "translate3d(" + tooltipX + "px, " + tooltipY + "px, 0)");
        pancoreTooltip.style("transform", "translate3d(" + tooltipX + "px, " + tooltipY + "px, 0)");
    }

    function moveDrag() {
        var oldData = pancoreData.slice(0);
        pancoreData.sort(function (a, b) { return position(a) - position(b); });
        // If some position is swapped, redraw some stuff
        if (isChanged(oldData, pancoreData)) {
            pancoreX.domain(pancoreData.map(function (d) { return d.bioproject_id; }));
            pancoreSvg.selectAll(".bar").attr("x", function (d) { return pancoreX(d.bioproject_id) - pancoreMouseOverWidth / 2; });
            pancoreSvg.selectAll(".dot:not(._" + pancoreMouse.dragId + ")").transition()
                .duration(transitionDuration)
                .attr("cx", function (d) { return pancoreX(d.bioproject_id); });
            pancoreSvg.select(".x.axis").transition()
                .duration(transitionDuration)
                .call(xAxis);
            pancoreSvg.selectAll(".x.axis text").style("text-anchor", "end");
            pancoreSvg.selectAll(".line").transition()
                .duration(transitionDuration)
                .style("stroke", "#cccccc");
        }
        // Update the position of the drag box and dots
        pancoreSvg.selectAll(".bar._" + pancoreMouse.dragId).attr("x", pancoreMouse.dragging[pancoreMouse.dragId] - pancoreMouseOverWidth / 2);
        pancoreSvg.selectAll(".dot._" + pancoreMouse.dragId).attr("cx", pancoreMouse.dragging[pancoreMouse.dragId]);
    }

    // GENERAL HELPER FUNCTIONS

    function getMaxVisibleDatapoint() {
        var max = 0,
            i;
        if (pancoreData.length === 0) {
            return 0;
        }
        if (pancoreToggles.showPan) {
            return pancoreData[pancoreData.length - 1].pan;
        }
        if (pancoreToggles.showGenome) {
            for (i = 0; i < pancoreData.length; i++) {
                if (pancoreData[i].peptides > max) {
                    max = pancoreData[i].peptides;
                }
            }
            return max * 1.3;
        }
        if (pancoreToggles.showCore) {
            return pancoreData[0].core * 1.3;
        }
        if (pancoreToggles.showUnicore) {
            return pancoreData[0].unicore * 1.3;
        }
        return 0;
    }

    function drawTree(newick, order) {
        var parsed = Newick.parse(newick);
        console.log(parsed);
        $("#sim_graph").html("");
        d3.phylogram.build('#sim_graph', parsed, {width: 100, height: 500}, order);
    }

    function reorderMatrix(newOrder) {
        matrix.reOrder(newOrder);
    }

}
