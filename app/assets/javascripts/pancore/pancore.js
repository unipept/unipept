/**
 * Constructs a Pancore object that handles all JavaScript on the Unique
 * Peptide Finder page.
 *
 * @param <Array> args.data The data array used to construct the selection tree
 *          has around 2500 objects with this format:
 *          {"bioproject_id":57587,"class_id":29547,"genus_id":194,
 *          "name":"Campylobacter jejuni","order_id":213849,"species_id":197}
 * @param <Hash> args.taxa is a list of key-value pairs mapping
 *          taxon id's to taxon names used for the selection tree.
 * @return <Pancore> that The constructed Pancore object
 */
var constructPancore = function constructPancore(args) {
    /*************** Private variables ***************/

    var that = {},
        genomes = {},
        tree,
        graph,
        table,
        worker;

    /*************** Private methods ***************/

    /**
     * Initializes pancore
     */
    function init() {
        // Construct the selection tree
        tree = constructSelectionTree({data : args.data, taxa : args.taxa});
        tree.drawTree({
            tree : "#treeView",
            tableDiv : "#genomes-table-div",
            treeSearch : "#treeSearchDiv"
        });

        // Constructs the graph
        graph = constructPancoreGraph({
            transitionDuration : 500,
            width : 930,
            height : 600,
            genomes : genomes
        });
        graph.redraw();

        // Constructs the table
        table = constructGenomeTable({
            genomes : genomes
        });

        // Create the Javascript Worker for background data processing
        worker = new Worker("/assets/workers/pancore_worker.js");
        worker.addEventListener('message', handleWorkerMessage, false);
        worker.addEventListener('error', error, false);

        // Initialize the rest of the page
        initSpeciesForm();
        initFullScreen();
        initSaveImage();

        // IE10 message
        if (navigator.appVersion.indexOf("MSIE 10") != -1) {
            info("You're using Internet Explorer 10. Everything should work as expected, but for an optimal experience, please use a recent version of Mozilla Firefox or Google Chrome.");
        }

        // Ready for take off
        $("#species_id").val(470);
        $("#add_species_peptidome").click();
    }

    /**
     * Initializes the add species button
     */
    function initSpeciesForm() {
        // Add handler to the "add species"-form
        $("#add_species_peptidome").click(function () {
            var url;
            // TODO rewrite
            setLoading(true);
            // Get all bioproject id's for the selected species id
            url = "/pancore/genomes/species/" + $("#species_id").val() + ".json";
            $.getJSON(url, function (genomes) {
                //TODO
                table.clear();
                toLoad = 0;
                addGenomes(genomes);
            })
            .fail(function () {
                error("request error for " + url, "It seems like something went wrong while we loaded the data");
            });
            return false;
        });
    }

    /**
     * Initializes the full screen stuff
     */
    function initFullScreen() {
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
    }

    /**
     * Initializes the save image stuff
     */
    function initSaveImage() {
        $("#buttons-pancore").prepend("<button id='save-img' class='btn btn-default btn-xs'><i class='glyphicon glyphicon-download'></i> Save image</button>");
        $("#save-img").click(function clickSaveImage() {
            if ($(".tab-content .active").attr('id') === "pancore_graph_wrapper") {
                _gaq.push(['_trackEvent', 'Pancore', 'Save Image', 'graph']);
                triggerDownloadModal("#pancore_graph svg", null, "unique_peptides_graph");
            } else {
                _gaq.push(['_trackEvent', 'Pancore', 'Save Image', 'sim matrix']);
                triggerDownloadModal("#sim_matrix svg", null, "unique_peptides_matrix");
            }
        });
        $("#buttons-pancore").prepend("<button id='save-data' class='btn btn-default btn-xs'><i class='glyphicon glyphicon-download'></i> Save data</button>");
        $("#save-data").click(function clickSaveData() {
            _gaq.push(['_trackEvent', 'Pancore', 'Save Data']);
            exportData();
        });
    }

    /**
     * Handles message events for the worker
     *
     * @param <Event> e The event we want to handle
     */
    function handleWorkerMessage(e) {
        var data = e.data;
        switch (data.type) {
        case 'log':
            console.log(data.msg);
            break;
        case 'error':
            error(data.msg.error, data.msg.msg);
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
    }

    /**
     * Gets called to handle the change from and to full screen mode.
     * Mostly scales the SVG
     */
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

    /*************** Public methods ***************/


    // initialize the object
    init();

    return that;
};


/**
 * Initializes the main graph, the similarity matrix and drop-target-table
 */
function init_graphs() {
    var toLoad,
        rank = 0,
        graphData = [],
        lca = "";

    // Sends a command and message to the worker
    function sendToWorker(command, message) {
        worker.postMessage({'cmd': command, 'msg': message});
    }

    // Initial method for adding genomes
    // genomes should be an array of bioproject id's
    // the table is updated to represent the loading status
    // the command is given to the worker to download the peptide id's
    function addGenomes(g) {
        var i;
        toLoad += g.length;
        for (i = 0; i < g.length; i++) {
            // only add new genomes
            if (genomes[g[i].bioproject_id] === undefined) {
                genomes[g[i].bioproject_id] = {
                    "bioproject_id" : g[i].bioproject_id,
                    "name" : g[i].name,
                    "status" : "Loading...",
                    "position" : 100 + i};
                loadData(g[i].bioproject_id, g[i].name);
            } else {
                toLoad -= 1;
            }
        }
        table.update();
        table.setTableMessage("refresh", "Please wait while we load the data for these genomes.");
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
            table.setTableMessage("refresh", "Please wait while we load the genomes for this species.");
            $("#genomes_table tbody.ui-sortable").sortable("option", "disabled", true);
        } else {
            $("#add_species_peptidome").button('reset');
            table.setTableMessage("info-sign", "You can drag rows to reorder them or use one of the autosort options.");
            $("#genomes_table tbody.ui-sortable").sortable("option", "disabled", false);

            // REMOVE THIS LINE
            sendToWorker("getUniqueSequences");
        }
    }

    // Gets called when the worker is done loading a new genome
    // the calculated data gets added the update queue if the request_rank matches
    function addData(genome, request_rank) {
        // If the rank doesn't match, this is old data
        if (rank !== request_rank) return;
        toLoad--;
        genomes[genome.bioproject_id].status = "Done";
        table.update();
        graph.addToDataQueue(genome);
        tryUpdateMatrix();
        if (toLoad === 0) {
            setLoading(false);
        }
    }

    // Removes a genomes from the visualization:
    // - Removes it from the table
    // - Instructs the worker to recalculate the graph
    function removeData(genome) {
        var g = genomes[genome.bioproject_id];
        if (g.status !== "Done") return;
        var id = genome.bioproject_id;
        delete genomes[id];
        table.update();
        var r = calculateTablePositions();
        sendToWorker("removeData", {"bioproject_id" : id, "order" : r.order, "start" : r.start});
    }

    // Replaces all the visualized data and updates graph and table
    function setPancoreData(data, l, request_rank) {
        var i,
            bioproject_id;
        if (rank !== request_rank) return;
        graphData = data;
        lca = l;
        for (i = 0; i < graphData.length; i++) {
            bioproject_id = graphData[i].bioproject_id;
            if (typeof genomes[bioproject_id] !== "undefined") {
                genomes[bioproject_id].status = "Done";
                genomes[bioproject_id].position = i;
            }
        }
        //updatePancore();
        table.update();
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
        //TODO reset dataQueue of pancoreGraph dataQueue = [];
        graphData = [];
        genomes = {};
        lca = "";
        removePopoversAndHighlights();
        updatePancore();
        table.clear();
    }

    // TODO move to table object
    // Sets the position property in the genomes
    // based on the row position in the table
    // returns a list with the order of the genomes
    function calculateTablePositions() {
        var order = [],
            start = -1,
            stop = 0;

        d3.selectAll("#genomes_table tbody tr").each(function (d, i) {
            var bioproject_id = d.bioproject_id;
            if (genomes[bioproject_id].position === i && stop === 0) {
                start = i;
            } else if (genomes[bioproject_id].position !== i) {
                stop = i;
                genomes[bioproject_id].position = i;
                genomes[bioproject_id].status = "Processing...";
            }
            order[i] = bioproject_id;
        });
        start++;
        return {"order" : order, "start" : start, "stop" : stop};
    }

    // Sets the position property in the genomes
    // based on the position in the graph
    // returns a list with the order of the genomes
    function calculateTablePositionsFromGraph() {
        var order = [],
            start = -1,
            stop = 0,
            i;
        for (i = 0; i < graphData.length; i++) {
            var bioproject_id = graphData[i].bioproject_id;
            if (genomes[bioproject_id].position === i && stop === 0) {
                start = i;
            } else if (genomes[bioproject_id].position !== i) {
                stop = i;
                genomes[bioproject_id].position = i;
                genomes[bioproject_id].status = "Processing...";
            }
            order[i] = bioproject_id;
        }
        start++;
        return {"order" : order, "start" : start, "stop" : stop};
    }

    /**
     * Invokes a file download containing all data currently shown
     * in the graph (i.e. each datapoint) in csv format.
     */
    function exportData() {
        var exportString = "name,bioproject_id,genome_peptides,core_peptides,pan_peptides,unique_peptides\n",
            i,
            tempArray;
        for (i = 0; i < graphData.length; i++) {
            tempArray = [];
            tempArray.push(genomes[graphData[i].bioproject_id].name);
            tempArray.push(graphData[i].bioproject_id);
            tempArray.push(graphData[i].peptides);
            tempArray.push(graphData[i].core);
            tempArray.push(graphData[i].pan);
            tempArray.push(graphData[i].unicore);
            exportString += tempArray.join(",") + "\n";
        }
        downloadDataByForm(exportString, "unique_peptides.csv");
    }

    function returnPopoverSequences(sequences, type) {
        downloadDataByForm(sequences, type + '-sequences.txt', function enableButton() {
            $("#download-peptides-toggle").button('reset');
        });
    }

    // TODO move to phylotree object
    function drawTree(newick, order) {
        var parsed = Newick.parse(newick);
        console.log(parsed);
        $("#sim_graph").html("");
        d3.phylogram.build('#sim_graph', parsed, {width: 100, height: 500}, order);
    }

    // TODO move to matrix object
    function reorderMatrix(newOrder) {
        var width = 500;

        var svg = d3.select("#sim_matrix");

        var x = d3.scale.ordinal().rangeBands([0, width]);
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
    function redrawMatrix(g, data, order){
        var margin = {top: 200, right: 0, bottom: 10, left: 200},
            width = 500,
            height = 500;

        var x = d3.scale.ordinal().rangeBands([0, width]),
            z = d3.scale.linear().domain([0, 1]).clamp(true);

        var svg = d3.select("#sim_matrix").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // The default sort order.
        x.domain(d3.range(g.length));

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
            .each(row);

        row.append("line")
            .attr("x2", width)
            .attr("stroke", "#ffffff");

        row.append("text")
            .attr("x", -6)
            .attr("y", x.rangeBand() / 2)
            .attr("dy", ".32em")
            .attr("text-anchor", "end")
            .text(function(d, i) { return g[i]; });

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
            .text(function(d, i) { return g[i]; });

        function row(row) {
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
              //.on("mouseover", mouseover)
              //.on("mouseout", mouseout);
        }
    }
    function tryUpdateMatrix() {
        sendToWorker('newDataAdded');
    }
    // TODO move to matrix object
    // setup similarity matrix buttons etc
    $("#sim_matrix_buttons").prepend("<button id='calculate-matrix-btn' class='btn btn-default'><i class='glyphicon glyphicon-refresh'></i> Calculate Similarity Matrix</button>");
    $("#calculate-matrix-btn").click(function () {
        sendToWorker('calculateSimilarity', '');
    });
    $("#sim_matrix_buttons").prepend("<button id='cluster-matrix-btn' class='btn btn-default'><i class='glyphicon glyphicon-refresh'></i> Cluster Similarity Matrix</button>");
    $("#cluster-matrix-btn").click(function () {
        sendToWorker('clusterMatrix', '');
    });

    // TODO move to matrix object
    // Only cluster when the initial data has loaded
    function clusterIfReady() {
        if( toLoad === 0 ) {
            sendToWorker('clusterMatrix', '');
        } else {
            setTimeout(clusterIfReady, 200);
        }
    }
    // On click of tab, cluster matrix
    $("a[href='#sim_matrix_wrapper']").click(clusterIfReady);
    function showMatrix(g, data, order) {
        $('#sim_matrix').empty();
        redrawMatrix(g, data, order);
    }
}
