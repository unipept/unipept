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
        isLoading = false,
        toLoad = 0,
        rank = 0,
        lca = "",
        tree,
        graph,
        matrix,
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

        // Constructs the table
        table = constructGenomeTable({
            genomes : genomes,
            pancore : that
        });

        // Constructs the graph
        graph = constructPancoreGraph({
            pancore : that,
            table : table,
            transitionDuration : 500,
            width : 930,
            height : 600,
            genomes : genomes
        });
        graph.redraw();


        // Create the Javascript Worker for background data processing
        worker = new Worker("/assets/workers/pancore_worker.js");
        worker.addEventListener('message', handleWorkerMessage, false);
        worker.addEventListener('error', error, false);

        // Constructs the matrix
        matrix = constructSimMatrix(worker);

        // Initialize the rest of the page
        initSpeciesForm();
        initFullScreen();
        initSaveImage();

        // IE10 message
        if (navigator.appVersion.indexOf("MSIE 10") !== -1) {
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
            // Get all bioproject id's for the selected species id
            url = "/pancore/genomes/species/" + $("#species_id").val() + ".json";
            $.getJSON(url, function (genomes) {
                that.addGenomes(genomes);
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
            that.exportCsvData();
        });
    }

    /**
     * Gets called to handle the change from and to full screen mode.
     * Mostly just scales the SVG
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
        case 'processLoadedGenome':
            processLoadedGenome(data.msg.data, data.msg.rank);
            break;
        case 'processPancoreData':
            processPancoreData(data.msg.data, data.msg.lca, data.msg.rank);
            break;
        case 'processDownloadedSequences':
            processDownloadedSequences(data.msg.sequences, data.msg.type);
            break;
        case 'sim_graph':
            drawTree(data.msg.data, data.msg.order);
            break;
        default:
        //    console.log(data.msg);
        }
    }

    /**
     * Sends a command and message to the worker
     */
    function sendToWorker(command, message) {
        worker.postMessage({'cmd': command, 'msg': message});
    }

    /**
     * Asks the worker to load a genome
     *
     * @param <Number> bioproject_id The id of the genome we want to load
     * @param <String> name The name of the genome we want to load
     */
    function loadData(bioproject_id, name) {
        matrix.addGenome(bioproject_id, name);
        sendToWorker("loadData", {"bioproject_id" : bioproject_id, "name" : name});
    }

    /**
     * Gets called when the worker is done loading a new genome the calculated
     * data gets added the update queue if the request_rank matches
     *
     * @param <Genome> genome The data that's loaded
     * @param <Number> requestRank The rank of the original request
     */
    function processLoadedGenome(genome, requestRank) {
        // If the rank doesn't match, this is old data
        if (rank !== requestRank) return;
        toLoad--;
        table.setGenomeStatus(genome.bioproject_id, "Done", false);

        graph.addToDataQueue(genome);
        //TODO tryUpdateMatrix();

        setLoading(toLoad !== 0);
    }

    /**
     * Replaces all the data in the pancore graph
     *
     * @param <Array> data Array of pancoreGraph data
     * @param <String> l The lowest common ancestor of the loaded genomes
     * @param <Number> requestRank The rank at the time of the request
     */
    function processPancoreData(data, l, requestRank) {
        if (rank !== requestRank) return;

        graph.setData(data);
        lca = l;
    }

    /**
     * Takes the downloaded sequences from the worker and pushes them to the
     * user via a file download.
     *
     * @param <String> sequences The list of sequences
     * @param <String> type The type of the sequences
     */
    function processDownloadedSequences(sequences, type) {
        downloadDataByForm(sequences, type + '-sequences.txt', function enableButton() {
            $("#download-peptides-toggle").button('reset');
        });
    }

    /**
     * Gets called when the data is (done) loading
     * Enables/disables some buttons and actions (e.g. reordering)
     *
     * @param <Boolean> loading The new(?) loading status
     */
    function setLoading(loading) {
        // don't do anything if the state hasn't changed
        if (isLoading === loading) return;
        isLoading = loading;
        if (loading) {
            $("#add_species_peptidome").button('loading');
            table.setEnabled(false);
        } else {
            $("#add_species_peptidome").button('reset');
            table.setEnabled(true);

            // REMOVE THIS LINE
            //TODO sendToWorker("getUniqueSequences");
        }
    }

    /*************** Public methods ***************/

    /**
     * Gives the order to add genomes to the visualisation.
     *
     * @param <Array> g Array of bioproject_id's of the genomes we want to add
     */
    that.addGenomes = function addGenomes(g) {
        var i;
        for (i = 0; i < g.length; i++) {
            // only add new genomes
            if (genomes[g[i].bioproject_id] === undefined) {
                toLoad++;
                table.addGenome({
                    "bioproject_id" : g[i].bioproject_id,
                    "name" : g[i].name,
                    "status" : "Loading...",
                    "position" : 100 + i
                });
                loadData(g[i].bioproject_id, g[i].name);
            }
        }
        setLoading(toLoad !== 0);
    };

    /**
     * Removes a genomes from the visualization:
     * - Removes it from the table
     * - Instructs the worker to recalculate the graph
     *
     * @param <Genome> genome The genome we want to remove
     */
    that.removeGenome = function removeGenome(genome) {
        var removeData = table.removeGenome(genome.bioproject_id);
        sendToWorker("removeData", removeData);
    };

    /**
     * Resets everything:
     * - instructs the worker to flush all data
     * - clear all data vars
     * - update graph and table
     */
    that.clearAllData = function clearAllData() {
        rank++;
        sendToWorker("clearAllData", "");
        lca = "";
        setLoading(false);
        table.clearAllData();
        graph.clearAllData();
    };

    /**
     * Requests the worker to recalculate all data based on a new order
     *
     * @param <Array> orderData.order The new order
     * @param <Number> orderData.start The position from where there's a change
     * @param <Number> orderData.stop The position till where there's a change
     */
    that.updateOrder = function updateOrder(orderData) {
        sendToWorker("recalculatePanCore", orderData);
        table.setOrder(orderData.order);
    };

    /**
     * Invokes a file download containing all data currently shown
     * in the graph (i.e. each datapoint) in csv format.
     */
    that.exportCsvData = function exportCsvData() {
        downloadDataByForm(graph.getDataAsCsv(), "unique_peptides.csv");
    };

    /**
     * Requests a set of sequences to the worker
     *
     * @param <Number> bioprojectId The id of the genome we want data from
     * @param <String> type The type of sequences we want
     */
    that.requestSequences = function requestSequences(bioprojectId, type) {
        sendToWorker("getSequences", {
            "bioproject_id" : bioprojectId,
            "type" : type
        });
    };

    /**
     * Send the autoSort command to the worker
     *
     * @param <String> type The type of sort we want to run
     */
    that.autoSort = function autoSort(type){
        sendToWorker("autoSort", {type : type});
    }

    // initialize the object
    init();

    return that;
};


function removeMe() {

    // TODO move to phylotree object
    function drawTree(newick, order) {
        var parsed = Newick.parse(newick);
        console.log(parsed);
        $("#sim_graph").html("");
        d3.phylogram.build('#sim_graph', parsed, {width: 100, height: 500}, order);
    }

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
