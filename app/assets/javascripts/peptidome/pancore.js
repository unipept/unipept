/**
 * Constructs a Pancore object that handles all JavaScript on the Unique
 * Peptide Finder page.
 *
 * @param <Array> args.data The data array containing all genomes
 * @param <Hash> args.taxa is a list of key-value pairs mapping
 *          taxon id's to taxon names used for the selection tree.
 * @param <String> args.version The uniprot version
 * @return <Pancore> that The constructed Pancore object
 */
var constructPancore = function constructPancore(args) {
    /*************** Private variables ***************/

    var that = {},
        data = args.data,
        genomeData = new Map(),
        genomes = new Map(),
        promisesLoading = new Map(),
        promisesDownload = new Map(),
        isLoading = false,
        askRestore = false,
        rank = 0,
        lca = "",
        genomeSelector,
        graph,
        matrix,
        table,
        myGenomes,
        worker;

    // notifications
    var $loadingNotification,
        $pancoreNotification,
        $autosortNotification,
        $similarityNotification;

    /*************** Private methods ***************/

    /**
     * Initializes pancore
     */
    function init() {
        // init genomeData map
        args.data.forEach(function (genome) {
            genomeData.set(genome.id, genome);
        });

        // Construct the genome selector
        genomeSelector = constructGenomeSelector({
            data : data,
            taxa : args.taxa,
            genomes: genomes,
            pancore : that
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
            myGenomes = constructMyGenomes({
                version : args.version,
                pancore : that
            });
        } else {
            $("#my-genome-error").removeClass("hide");
        }

        // Initialize the rest of the page
        initHelp();
        initFullScreen();
        initSaveImage();

        // IE10 message
        if (navigator.appVersion.indexOf("MSIE 10") !== -1) {
            info("You're using Internet Explorer 10. Everything should work as expected, but for an optimal experience, please use a recent version of Mozilla Firefox or Google Chrome.");
        }

        window.onbeforeunload = that.saveStatus;

        // Ready for take off
        if (localStorage.pancoreStatus) {
            if (localStorage.pancoreLoadedBefore === "no") {
                localStorage.pancoreLoadedBefore = "yes";
                that.loadStatus();
            } else {
                genomeSelector.demo();
                askToRestore();
            }
        } else {
            genomeSelector.demo();
        }
    }

    /**
     * Initializes the help popups
     */
    function initHelp() {
        // tab help
        $("#tabs li a span").on("mouseover", function () {
            if ($(this).parent().attr("id") === "unique-peptide-finder-tab") {
                $("#unique-peptide-finder-help").show();
                $("#peptidome-clustering-help").hide();
            } else {
                $("#peptidome-clustering-help").show();
                $("#unique-peptide-finder-help").hide();
            }
            $("#tab-help").stop(true, true).fadeIn(200);
        });
        $("#tabs li a span").on("mouseout", function () {
            $("#tab-help").stop(true, true).fadeOut(200);
        });
    }



    /**
     * Initializes the full screen stuff
     */
    function initFullScreen() {
        if (fullScreenApi.supportsFullScreen) {
            $("#buttons-pancore").prepend("<button id='zoom-btn' class='btn btn-default btn-xs btn-animate'><span class='glyphicon glyphicon-resize-full grow'></span> Enter full screen</button>");
            $("#zoom-btn").click(function () {
                logToGoogle("Pancore", "Full Screen", getActiveTab());
                window.fullScreenApi.requestFullScreen($(".full-screen-container").get(0));
            });
            $(document).bind(fullScreenApi.fullScreenEventName, resizeFullScreen);
        }
    }

    /**
     * Gets called to handle the change from and to full screen mode.
     */
    function resizeFullScreen() {
        var activeTab = getActiveTab(),
            isFullScreen = window.fullScreenApi.isFullScreen();

        // sync tabs
        $("ul.visualisations li.active").removeClass("active");
        $("ul.visualisations li").each(function (i, el) {
            if ($(el).find("a").attr("href") === "#" + activeTab + "_wrapper") {
                $(el).addClass("active");
            }
        });

        // class
        $(".full-screen-container").toggleClass("full-screen", isFullScreen);
        $(".full-screen-container").toggleClass("not-full-screen", !isFullScreen);

        // tooltip
        if (isFullScreen) {
            $(".tip").appendTo(".full-screen-container");
        } else {
            $(".tip").appendTo("body");
        }

        // update visualisations
        graph.setFullScreen(isFullScreen);
        matrix.setFullScreen(isFullScreen);
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
                d3.selectAll(".inner.node circle").attr("class", "hidden");
            }
            logToGoogle("Pancore", "Save Image", tracking);
            triggerDownloadModal(selector, null, filename);
            if ($(".tab-content .active").attr('id') === "sim_matrix_wrapper") {
                d3.selectAll(".inner.node circle").attr("class", "");
            }
        });

        $("#buttons-pancore").prepend("<button id='save-data' class='btn btn-default btn-xs'><span class='glyphicon glyphicon-download'></span> Download data</button>");
        $("#save-data").click(function clickSaveData() {
            var activeObject,
                tracking;
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
            processDownloadedSequences(data.msg);
            break;
        case 'processClusteredMatrix':
            processClusteredMatrix(data.msg.order, data.msg.newick);
            break;
        case 'autoSorted':
            processAutoSorted(data.msg);
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
     * @param <String> id The id of the assembly we want to load
     * @param <String> name The name of the genome we want to load
     * @param <Boolean> own Whether it's an own genome
     */
    function loadData(id, name, own) {
        if (own) {
            myGenomes.getIds(id).then(
                function (ids) {
                    sendToWorker("loadUserData", {"id" : id, "name" : name, "ids" : ids});
                }
            );
        } else {
            sendToWorker("loadData", {"id" : id, "name" : name});
        }
        return new Promise(function (resolve, reject) {
            promisesLoading.set(id, function (genome, requestRank) {
                if (rank === requestRank) {
                    resolve(genome);
                } else {
                    reject("old data");
                }
            });
        });
    }

    /**
     * Gets called when the worker is done loading a new genome
     * Fullfills the corresponding loadGenome Promise
     *
     * @param <Genome> genome The data that's loaded
     * @param <Number> requestRank The rank of the original request
     */
    function processLoadedGenome(genome, requestRank) {
        if (promisesLoading.has(genome.id)) {
            promisesLoading.get(genome.id).call(this, genome, requestRank);
            promisesLoading.delete(genome.id);
        }
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

        if ($pancoreNotification) {
            $pancoreNotification.hide();
            $pancoreNotification = undefined;
        }
    }

    /**
     * Fullfills the corresponding downloadSequences Promise
     *
     * @param <String> data.type The type of sequences
     * @param <String> data.id The assembly id of the request
     * @param <String> data.sequences The returned sequences
     */
    function processDownloadedSequences(data) {
        if (promisesDownload.has(data.id + data.type)) {
            promisesDownload.get(data.id + data.type).call(this, data);
            promisesDownload.delete(data.id + data.type);
        }
    }

    /**
     * Handles the arrival of new similarity data.
     *
     * @param <Boolean> simData.fullMatrix Is this the full matrix?
     * @param <SimObject> simData.data A single row or full matrix of similarity
     *      data!
     * @param <Boolean> simData.final Is this the final batch?
     */
    function processSimilarityData(simData) {
        matrix.addSimilarityData(simData.fullMatrix, simData.data);
        if (simData.final && $similarityNotification) {
            $similarityNotification.hide();
            $similarityNotification = undefined;
        }
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
     * Handles the arrival of newly autosorted data
     *
     * @param <Array> order A list with the new order of the genomes
     */
    function processAutoSorted(order) {
        that.updateOrder(order);
        if ($autosortNotification) {
            $autosortNotification.hide();
            $autosortNotification = undefined;
        }
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
            table.setEnabled(false);
            $loadingNotification = showNotification("Loading proteomes...", {
                loading: true,
                autoHide: false
            });
        } else {
            table.setEnabled(true);
            $loadingNotification.hide();
        }
    }

    function askToRestore() {
        $("#restore-analysis").removeClass("hide");
        $("#restore-analysis a").click(function (e) {
            e.preventDefault();
            that.loadStatus();
            $("#restore-analysis").addClass("hide");
        });
        setTimeout(function () {
            askRestore = true;
        }, 1000);

    }

    function hideRestore() {
        if (askRestore) {
            $("#restore-analysis").addClass("hide");
            askRestore = false;
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

    function getActiveTab() {
        var activePane = $(".full-screen-container div.active").attr('id');
        return activePane.split("_wrapper")[0];
    }

    /*************** Public methods ***************/

    /**
     * Adds genomes to the visualisation
     *
     * @param <Array> g Array of id's of the genomes we want to add
     */
    that.addGenomes = function addGenomes(g, loadUnique) {
        hideRestore();
        var loadUnique = loadUnique === undefined ? true : loadUnique;
        return Promise.all(g.map(function addGenome(genome, i){
            // only add new genomes
            if (genomes.has(genome.id)) return;
            setLoading(true);
            var gen = that.getGenome(genome.id);
            table.addGenome({
                "id" : genome.id,
                "name" : genome.name,
                "own" : gen.own,
                "assembly_id" : gen.genbank_assembly_accession,
                "status" : "Loading",
                "position" : 100 + i,
                "abbreviation" : that.abbreviate(genome.name, gen.own)
            });
            return loadData(genome.id, genome.name, gen.own)
                .then(function (genome) {
                    table.setGenomeStatus(genome.id, "Done", false);

                    genome.abbreviation = that.abbreviate(genome.name, gen.own);

                    graph.addToDataQueue(genome);
                    matrix.addGenome(genome);
                })
                .catch(function (e) {
                    groupErrors(e, "It seems like something went wrong while we loaded the data. Are you still conected to the internet? You might want to reload this page.");
                });
        })).then( function () {
            return new Promise(function (resolve, reject) {
                setTimeout(resolve, 1000);
            });
        }).then( function () {
            if (promisesLoading.size === 0) {
                setLoading(false);
            }
            if (loadUnique) {
                sendToWorker("getUniqueSequences", {order : table.getOrder(), force : false });
            }
        });
    };

    /**
     * Removes a genomes from the visualization:
     * - Removes it from the table
     * - Instructs the worker to recalculate the graph
     *
     * @param <Genome> genome The genome we want to remove
     */
    that.removeGenome = function removeGenome(genome) {
        if (!$pancoreNotification) {
            $pancoreNotification = showNotification("Calculating peptidomes...", {
                loading: true,
                autoHide: false
            });
        }
        var removeData = table.removeGenome(genome.id);
        matrix.removeGenome(genome.id);

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
        promisesLoading.clear();
        promisesDownload.clear();
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
        if (!$pancoreNotification) {
            $pancoreNotification = showNotification("Calculating peptidomes...", {
                loading: true,
                autoHide: false
            });
        }
        sendToWorker("recalculatePanCore", orderData);
        table.setOrder(orderData.order);
        matrix.setOrder(orderData.order);
    };

    /**
     * Requests a set of sequences to the worker
     *
     * @param <Number> id The id of the genome we want data from
     * @param <String> type The type of sequences we want
     */
    that.requestSequences = function requestSequences(id, type) {
        var $notification = showNotification("Preparing sequences...", {
                loading: true,
                autoHide: false
            });
        sendToWorker("getSequences", {
            "id" : id,
            "type" : type
        });
        return new Promise(function (resolve, reject) {
            promisesDownload.set(id + type, function (data) {
                $notification.hide();
                resolve(data);
            });
        });
    };

    /**
     * Requests a similarity calculation to the worker
     */
    that.requestSimilarityCalculation = function requestSimilarityCalculation() {
        if (!$similarityNotification) {
            $similarityNotification = showNotification("Calculating similarities...", {
                loading: true,
                autoHide: false
            });
        }
        sendToWorker("calculateSimilarity");
    };

    /**
     * Requests the clustering of the data
     */
    that.requestClustering = function requestClustering() {
        sendToWorker("clusterMatrix");
    };

    /**
     * Send the autoSort command to the worker
     *
     * @param <String> type The type of sort we want to run
     */
    that.autoSort = function autoSort(type) {
        if (!$autosortNotification) {
            $autosortNotification = showNotification("Sorting proteomes...", {
                loading: true,
                autoHide: false
            });
        }
        sendToWorker("autoSort", {type : type});
    };

    /**
     * Saves the currently loaded genomes in local storage
     */
    that.saveStatus = function saveStatus() {
        var assemblies = table.getOrder().map(function (as) {
            return that.getGenome(as).genbank_assembly_accession;
        });
        var status = JSON.stringify({
            assemblies: assemblies
        });
        if (status !== localStorage.pancoreStatus) {
            localStorage.pancoreStatus = status
            localStorage.pancoreLoadedBefore = "no";
        }
    };

    /**
     * Loads a status. First loads all genomes, then sets the order
     */
    that.loadStatus = function loadStatus(status) {
        var status = status || JSON.parse(localStorage.pancoreStatus),
            assemblySet = new Set(),
            statusGenomes = new Map(),
            assemblies,
            assembliesOrder,
            assembly,
            startPromise = myGenomes ? myGenomes.getGenomes() : Promise.resolve();

        // create the assemblies set manually because of stupid Safari
        status.assemblies.forEach(function (element) {
            assemblySet.add(element.split(".")[0]);
        });

        // only start loading after the my genomes list is complete
        startPromise.then(function () {
            // reset the visualisation
            that.clearAllData();

            // convert assemblies to addable genome objects
            data.forEach(function (value) {
                if (assemblySet.has(value.genbank_assembly_accession.split(".")[0])) {
                    statusGenomes.set(value.genbank_assembly_accession.split(".")[0], {
                        id : value.id,
                        name : value.name
                    });
                }
            });
            if (myGenomes) {
                status.assemblies.forEach(function (element) {
                    if (element.charAt(0) === "u") {
                        var assembly = myGenomes.getGenome(element);
                        if (assembly) {
                            statusGenomes.set(assembly.id, {
                                id : assembly.id,
                                name : assembly.name
                            });
                        }
                    }
                });
            }

            // put them in the right order
            assemblies = status.assemblies.map(function (element) {
                return statusGenomes.get(element.split(".")[0]);
            }).filter(function (element) {
                return element;
            });
            assembliesOrder = assemblies.map(function (element) {
                return element.id;
            });

            // load the genomes and set the order
            that.addGenomes(assemblies, false).then(function () {
                that.updateOrder({
                    order : assembliesOrder,
                    start : 0,
                    stop : assembliesOrder.length - 1
                });
                if (assemblySet.size !== assemblies.length) {
                    error(null, "We couldn't load one or more proteomes from your previous session.");
                }
            });
        });
    };

    /**
     * Abbreviates an organism name
     *
     * @param <String> name The name of the organism
     * @param <Boolean> own Whether it's an own genome
     */
    that.abbreviate = function abbreviate(name, own) {
        var split = name.split(" "),
            i;

        if (own) {
            return name;
        }

        // Don't abbreviate single words
        if (split.size === 1) {
            return name;
        }

        // If the second part is "sp.", return the full name
        if (split[1] === "sp.") {
            return name;
        }

        if (split[0] === "Candidatus") {
            split[0] = "Ca.";
        } else {
            // Take first letter of first word
            split[0] = split[0].substr(0, 1) + ".";
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
    };

    /**
     * Retrieves the genome object for a given id
     */
    that.getGenome = function getGenome(id) {
        var g;
        if (("" + id).charAt(0) === "u") {
            g = myGenomes.getGenome(id);
            g.genbank_assembly_accession = id;
            g.own = true;
        } else {
            g = genomeData.get(id);
            g.own = false;
        }
        return g;
    }

    // initialize the object
    init();

    return that;
};
