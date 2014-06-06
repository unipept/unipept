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
        myGenomes,
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
        matrix = constructSimMatrix({
            pancore : that,
            table : table
        });

        // Constructs the myGenomes feature
        if (window.File && window.FileReader && window.FileList) {
            myGenomes = constructMyGenomes({pancore : that});
        } else {
            $("#my-genome-error").removeClass("hide");
        }

        // Initialize the rest of the page
        initHelp();
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
     * Initializes the help popups
     */
    function initHelp() {
        $("#add-by-species-help").tooltip({placement : "right", container : "body"});
        $("#add-by-genome-help").tooltip({placement : "right", container : "body"});
    }

    /**
     * Initializes the add species button
     */
    function initSpeciesForm() {
        // Add handler to the "add species"-form
        $("#add_species_peptidome").click(function () {
            var url;
            // Get all bioproject id's for the selected species id
            url = "/peptidome/genomes/species/" + $("#species_id").val() + ".json";
            $.getJSON(url, function (genomes) {
                that.addGenomes(genomes);
            })
            .fail(function () {
                groupErrors("request error for " + url, "It seems like something went wrong while we loaded the data. Are you still conected to the internet? You might want to reload this page.");
            });
            return false;
        });
    }

    /**
     * Initializes the full screen stuff
     */
    function initFullScreen() {
        if (fullScreenApi.supportsFullScreen) {
            $("#buttons-pancore").prepend("<button id='zoom-btn' class='btn btn-default btn-xs'><span class='glyphicon glyphicon-resize-full'></span> Enter full screen</button>");
            $("#zoom-btn").click(function () {
                if ($(".tab-content .active").attr('id') === "pancore_graph_wrapper") {
                    logToGoogle("Pancore", "Full Screen", "graph");
                    window.fullScreenApi.requestFullScreen($("#pancore_graph_wrapper").get(0));
                } else {
                    logToGoogle("Pancore", "Full Screen", "simmatrix");
                    window.fullScreenApi.requestFullScreen($("#sim_matrix_wrapper").get(0));
                }
            });
            $(document).bind(fullScreenApi.fullScreenEventName, resizeFullScreen);
        }
    }

    /**
     * Initializes the save image stuff
     */
    function initSaveImage() {
        // The save image stuff
        $("#buttons-pancore").prepend("<button id='save-img' class='btn btn-default btn-xs'><span class='glyphicon glyphicon-download'></span> Save image</button>");
        $("#save-img").click(function clickSaveImage() {
            var selector,
                tracking,
                filename;
            if ($(".tab-content .active").attr('id') === "pancore_graph_wrapper") {
                selector = "#pancore_graph svg";
                tracking = "graph";
                filename = "unique_peptides_graph";
            } else {
                selector = "#sim_matrix svg";
                tracking = "sim matrix";
                filename = "similarity_matrix";
            }
            logToGoogle("Pancore", "Save Image", tracking);
            triggerDownloadModal(selector, null, filename);
        });

        $("#buttons-pancore").prepend("<button id='save-data' class='btn btn-default btn-xs'><span class='glyphicon glyphicon-download'></span> Download data</button>");
        $("#save-data").click(function clickSaveData() {
            var activeObject,
                tracking,
                filename;
            if ($(".tab-content .active").attr('id') === "pancore_graph_wrapper") {
                activeObject = graph;
                tracking = "graph";
            } else {
                activeObject = matrix;
                tracking = "sim matrix";
            }
            logToGoogle("Pancore", "save Data", tracking);
            activeObject.handleSaveData();
        });
    }

    /**
     * Gets called to handle the change from and to full screen mode.
     * Mostly just scales the SVG
     */
    function resizeFullScreen() {
        setTimeout(function handleFullScreen() {
            var fullscreen = window.fullScreenApi.isFullScreen();
            if ($(".tab-content .active").attr('id') === "pancore_graph_wrapper") {
                graph.handleFullScreen(fullscreen);
            } else {
                matrix.handleFullScreen(fullscreen);
            }
        });
    }

    /**
     * Handles message events from the worker
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
            groupErrors(data.msg.error, data.msg.msg);
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
        case 'processClusteredMatrix':
            processClusteredMatrix(data.msg.order, data.msg.newick);
            break;
        case 'autoSorted':
            that.updateOrder(data.msg);
            break;
        case 'processSimilarityData':
            processSimilarityData(data.msg);
            break;
        default:
            console.log(data.msg);
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
     * @param <String> bioproject_id The id of the genome we want to load
     * @param <String> name The name of the genome we want to load
     */
    function loadData(bioproject_id, name) {
        if ((bioproject_id + "").charAt(0) === "u") {
            var ids = myGenomes.getIds(bioproject_id, true);
            sendToWorker("loadUserData", {"id" : bioproject_id, "name" : name, "ids" : ids});
        } else {
            sendToWorker("loadData", {"bioproject_id" : bioproject_id, "name" : name});
        }
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

        genome.abbreviation = that.abbreviate(genome.name, genome.bioproject_id);

        graph.addToDataQueue(genome);
        matrix.addGenome(genome);

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
        table.setLca(l);
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
     * Handles the arrival of new similarity data.
     *
     * @param <Boolean> simData.fullMatrix Is this the full matrix?
     * @param <SimObject> simData.data A single row or full matrix of similarity
     *      data!
     */
    function processSimilarityData(simData) {
        matrix.addSimilarityData(simData.fullMatrix, simData.data);
    }

    /**
     * Handles the arrival of new clustered data.
     *
     * @param <Array> order A list with the new order of the genomes
     * @param <String> newick The clustered tree in newick tree format
     */
    function processClusteredMatrix(order, newick) {
        matrix.setOrder(order);
        matrix.drawTree(newick);
        matrix.setClustered(true);
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

            setTimeout(function () { sendToWorker("getUniqueSequences", {order : table.getOrder(), force : false });}, 1000);
        }
    }

    /**
     * Prevents multiple errors from showing up at once
     *
     * @param <String> errorMsg The real error message
     * @param <String> userMsg A message to display to the user
     */
    function groupErrors(errorMsg, userMsg) {
        delay(function () {
            error(errorMsg, userMsg);
        }, 1000);
    }

    /*************** Public methods ***************/

    /**
     * Gives the order to add genomes to the visualisation.
     *
     * @param <Array> g Array of bioproject_id's of the genomes we want to add
     */
    that.addGenomes = function addGenomes(g) {
        var i,
            abbrev;
        for (i = 0; i < g.length; i++) {
            // only add new genomes
            if (genomes[g[i].bioproject_id] === undefined) {
                toLoad++;
                abbrev = that.abbreviate(g[i].name, g[i].bioproject_id);
                table.addGenome({
                    "bioproject_id" : g[i].bioproject_id,
                    "name" : g[i].name,
                    "status" : "Loading",
                    "position" : 100 + i,
                    "abbreviation" : abbrev
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
        matrix.removeGenome(genome.bioproject_id);

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
        matrix.clearAllData();
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
        matrix.setOrder(orderData.order);
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
     * Requests a similarity calculation to the webserver
     */
    that.requestSimilarityCalculation = function requestSimilarityCalculation() {
        sendToWorker("calculateSimilarity");
    }

    /**
     * Requests the clustering of the data
     */
    that.requestClustering = function requestClustering() {
        sendToWorker("clusterMatrix");
    }

    /**
     * Send the autoSort command to the worker
     *
     * @param <String> type The type of sort we want to run
     */
    that.autoSort = function autoSort(type){
        sendToWorker("autoSort", {type : type});
    }

    /**
     * Abbreviates an organism name
     *
     * @param <String> name The name of the organism
     * @param <String> id The id of the genome
     */
    that.abbreviate = function abbreviate(name, id) {
        var split = name.split(" "),
            i;

        // Don't abbreviate single words
        if (split.size == 1) {
            return name;
        }

        // If the second part is "sp.", return the full name
        if (split[1] === "sp.") {
            return name;
        }

        // Don't abbreviate if my genome and length < 30
        if (("" + id).charAt(0) === "u" && name.length < 30) {
            return name;
        }

        if (split[0] === "Candidatus") {
            split[0] = "Ca.";
        } else {
            // Take first letter of first word
            split[0] = split[0].substr(0,1) + ".";
        }

        // Abbreviate common words
        for (i = 1; i < split.length; i++) {
            switch (split[i]) {
            case 'pathovar':
                split[i] = "pv.";
                break;
            case 'serovar':
                split[i] = "sv.";
                break;
            case 'species':
                split[i] = "sp.";
                break;
            case 'genomovar':
                split[i] = "gv.";
                break;
            case 'subspecies':
                split[i] = "subsp.";
                break;
            case 'strain':
                split[i] = "str.";
                break;
            }
        }

        return split.join(" ");
    }

    // initialize the object
    init();

    return that;
};
