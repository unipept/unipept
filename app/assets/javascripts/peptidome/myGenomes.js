/**
 * creates a myGenomes object representing the table showing all self uploaded
 * genomes and optiones to add or remove them.
 *
 * @param <Pancore> args.pancore Pancore object
 * @param <String> args.version The uniprot version
 */
var constructMyGenomes = function constructMyGenomes(args) {
    /*************** Private variables ***************/

    var that = {},
        pancore = args.pancore,
        version = args.version,
        worker;

    // Data vars
    var dataQueue = [],
        dataQueueSize = 0,
        files = {},
        genomes,
        genomeList;

    // Data storage
    var indexedDBStore = {},
        localStorageStore = {},
        dataStore;

    // Page elements
    var $myGenomesDiv = $("#myGenomes"),
        $myGenomesTable = $("#my-genomes-table tbody"),
        $myGenomesButton = $("#addMyGenomeButton"),
        $popover;

    /*************** Private methods ***************/

    /**
     * Initializes the table
     */
    function init() {
        genomes = {};
        genomeList = [];

        if (window.indexedDB) {
            dataStore = indexedDBStore;
        } else {
            dataStore = localStorageStore;
        }

        dataStore.init();

        // init worker
        // Create the Javascript Worker for background data processing
        worker = new Worker("/assets/workers/mygenome_worker.js");
        worker.addEventListener('message', handleWorkerMessage, false);
        worker.addEventListener('error', error, false);

        // init popover
        $myGenomesButton.popover({
            html : true,
            trigger : "manual",
            title: function () {
                return $("#mygenomes-popover-head").html();
            },
            content: function () {
                return $("#mygenomes-popover-content").html();
            },
            container: "body"
        });

        // enable add my genome button
        $myGenomesButton.click(function () {
            if (!$popover) {
                $myGenomesButton.popover("show");
            } else {
                $popover.toggleClass("hide");
            }
        });

        // enable remove all button
        $("#remove-my-genomes").click(removeAllGenomes);

        // add pop-over behaviour
        $myGenomesButton.on("shown.bs.popover", initPopoverBehaviour);

        // help
        $("#my-genomes-help").tooltip({placement : "right", container : "body"});

        // set visible
        $myGenomesDiv.removeClass("hide");
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
        case 'processConvertedGenome':
            processConvertedGenome(data.msg.ids, data.msg.name, data.msg.id);
            break;
        case 'processProgress':
            processProgress(data.msg.progress);
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
     * Add the behaviour to the add genomes popover
     */
    function initPopoverBehaviour() {
        // hide the popover
        $popover = $(".popover-content #myGenomeName").parents(".popover");

        // enable the tooltips
        $(".popover-content #myGenomeName").tooltip({placement : "right", trigger : "hover", container : "body"});
        $(".popover-content #myGenomeFile").parents(".input-group").tooltip({placement : "right", trigger : "hover", container : "body"});

        // enable file chooser
        $(".popover-content #myGenomeFile").on('change', function () {
            var $input = $(this),
                numFiles = $input.get(0).files ? $input.get(0).files.length : 1,
                label = $input.val().replace(/\\/g, '/').replace(/.*\//, ''),
                multi = numFiles > 1,
                log = multi ? numFiles + ' files selected' : label;
            $input.parents('.input-group').find(':text').val(log);
            if (multi) {
                $(".popover-content #myGenomeName").prop("disabled", true).val("").attr("placeholder", "filenames will be used as name").data("multi", "multi");
            } else {
                $(".popover-content #myGenomeName").prop("disabled", false).attr("placeholder", "name").data("multi", "");
            }
        });

        // hook up the button
        $(".popover-content #processMyGenomeButton").click(function () {
            var multi = $(".popover-content #myGenomeName").data("multi") === "multi",
                name = $(".popover-content #myGenomeName").val(),
                files = $(".popover-content #myGenomeFile").prop("files"),
                file = files[0],
                id = "u" + new Date().getTime(),
                i;

            // Form validation
            if (!(multi || name)) {
                $(".popover-content #myGenomeName").parents(".form-group").addClass("has-error");
            } else {
                $(".popover-content #myGenomeName").parents(".form-group").removeClass("has-error");
            }
            if (!file) {
                $(".popover-content #myGenomeFile").parents(".form-group").addClass("has-error");
            } else {
                $(".popover-content #myGenomeFile").parents(".form-group").removeClass("has-error");
            }

            // Handle form
            if (multi || (name && file)) {
                $(this).attr("disabled", "disabled");
                $(".popover-content #myGenomeFile").prop("disabled", true);
                $(this).addClass("hide");
                $(".popover-content #myGenomeProgress").removeClass("hide");

                if (multi) {
                    for (i = 0; i < files.length; i++) {
                        file = files[i];
                        dataQueue.push({name: file.name, file: file, id: id + i});
                    }
                } else {
                    dataQueue.push({name: name, file: file, id: id});
                }
                dataQueueSize = files.length;
                handleAddMyGenome();
            }
        });
    }

    /**
     * Processes a file from the dataQueue
     */
    function handleAddMyGenome() {
        if (dataQueue.length > 0) {
            var reader = new FileReader(),
                file = dataQueue[0];
            reader.onload = function (e) {
                sendToWorker("processFile", {file : reader.result, name : file.name, id : file.id});
                files[file.id] = reader.result;
            };
            reader.readAsText(file.file);

            processProgress(0);
            $(".popover-content #myGenomeProgress .progress-bar span").text("File " + (dataQueueSize - dataQueue.length + 1) + " of " + dataQueueSize);
        }
    }

    /**
     * Reset the add my genome form
     */
    function resetForm() {
        dataQueueSize = 0;

        // reset the form
        $(".popover-content #processMyGenomeButton").parents("form").trigger('reset');
        $(".popover-content #myGenomeName").prop("disabled", false).attr("placeholder", "name").data("multi", "");
        $(".popover-content #processMyGenomeButton").removeAttr("disabled");
        $(".popover-content #myGenomeFile").prop("disabled", false);
        $(".popover-content #processMyGenomeButton").removeClass("hide");
        $(".popover-content #myGenomeProgress").addClass("hide");

        // hide the popover
        if ($popover && !$popover.hasClass("hide")) {
            $myGenomesButton.click();
        }
    }

    /**
     * Processes the converted genome
     *
     * @param <Array> ids A sorted array with integer id's
     * @param <String> name The name of the genome
     * @param <String> id The id of the genome
     */
    function processConvertedGenome(ids, name, id) {
        addGenome(id, name, version, ids);
        dataQueue.shift();

        if (dataQueue.length == 0) {
            resetForm();
        } else {
            handleAddMyGenome();
        }
    }

    /**
     * Updates the progress bar with a new value
     *
     * @param <Number> percentage Value between 0 and 1 indicating the progress
     */
    function processProgress(percentage) {
        $(".popover-content #myGenomeProgress .progress-bar").css("width", (percentage * 100) + "%");
    }

    /**
     * Add a genome to the list of myGenomes in local storage
     *
     * @param <String> id A random id
     * @param <String> name The genome name
     * @param <String version The uniprot version
     * @param <Array> ids A list of ints
     */
    function addGenome(id, name, version, ids) {
        if (genomeList.indexOf(id) === -1) {
            // add
            genomeList.push(id);
            genomes[id] = {id : id, name : name, version : version};

            dataStore.addGenome({id : id, name : name, version : version, peptides : ids, file : files[id]});
            delete files[id];
        } else {
            // update
            genomes[id].version = version;
            dataStore.addGenome({id : id, name : name, version : version, peptides : ids});
        }

        // update the list
        redrawTable();
    }

    /**
     * Removes a genome from the my genome list
     *
     * @param <String> id The id to remove
     */
    function removeGenome(id) {
        // update local list
        genomeList.splice(genomeList.indexOf(id), 1);
        delete genomes[id];

        dataStore.removeGenome(id);

        // update the list
        redrawTable();
    }

    /**
     * Changes the genome name
     *
     * @param <String> id The id of the genome
     * @param <String> name The new name of the genome
     */
    function editGenomeName(id, name) {
        genomes[id].name = name;
        dataStore.updateGenome(genomes[id]);
    }

    /**
     * removes all the genomes from the my genome list
     */
    function removeAllGenomes() {
        var i,
            id;

        for (i = genomeList.length - 1; i >= 0; i--) {
            id = genomeList[i];
            genomeList.splice(i, 1);
            delete genomes[id];
            dataStore.removeGenome(id);
        }

        // update the list
        redrawTable();
    }

    /**
     * Redraws the table with all added genomes
     */
    function redrawTable() {
        var i,
            g,
            row;

        $myGenomesTable.empty();
        if (genomeList.length === 0) {
            $myGenomesTable.append("<tr class='info'><td colspan='4' class='info'><span class='glyphicon glyphicon-chevron-up'></span> Click the plus-button to add your own genomes.</td></tr>");
        } else {
            for (i = 0; i < genomeList.length; i++) {
                g = genomes[genomeList[i]];
                row = g.version === version ? "<tr class='own' data-genomeid='" + g.id + "'>" : "<tr class='own old' data-genomeid='" + g.id + "'>";
                row += "<td><span class='glyphicon glyphicon-move'></span></td>" +
                    "<td class='name'>" + g.name + "</td>";
                if (g.version === version) {
                    row += "<td><a class='btn btn-default btn-xs edit-genome-name' title='edit genome name'><span class='glyphicon glyphicon-pencil'></span></a></td>";
                } else {
                    row += "<td><span class='glyphicon glyphicon-refresh'></span></td>";
                }
                row += "<td class='button'><a class='btn btn-default btn-xs remove-my-genome' title='remove genome'><span class='glyphicon glyphicon-trash'></span></a></td>" +
                    "</<tr>";
                $myGenomesTable.append(row);
            }
            $(".remove-my-genome").click(function () {
                removeGenome($(this).parents("tr").data("genomeid"));
            });
            $(".edit-genome-name").click(function () {
                var $row = $(this).parents("tr");
                if ($row.hasClass("edit")) {
                    var name = $row.find(".name input").val();
                    $row.find(".name").html(name);
                    $(this).find(".glyphicon").removeClass("glyphicon-ok").addClass("glyphicon-pencil");
                    $row.removeClass("edit");
                    editGenomeName($row.data("genomeid"), name);
                } else {
                    var name = $row.find(".name").text();
                    $row.find(".name").html("<input type='text' class='form-control input-xs'></input>");
                    $(this).find(".glyphicon").removeClass("glyphicon-pencil").addClass("glyphicon-ok");
                    $row.find(".name input").focus().val(name);
                    $row.addClass("edit");
                }
            });

            initDrag();
        }

        $("#my-genomes-tab .badge").text(genomeList.length);
    }

    /**
     * Initializes the draggin from the my genomes table
     */
    function initDrag() {
        var $tableDiv = $("#genomes-table-div"),
            moving,
            moving2;
        // Make the nodes draggable using JQuery UI
        $myGenomesTable.find("tr").draggable({
            appendTo: "#genomes-table-div table",
            addClasses: false,
            cancel: ".edit, .old",
            refreshPositions: true,
            // Mimic the style of the table on the right
            helper: function startHelping(event) {
                return dragHelp($(this));
            },
            // Table on the right slides into view on drag start
            start: function startDragging(event, ui) {
                var pos = Math.max(0, window.pageYOffset - $tableDiv.offset().top + 16);
                $tableDiv.css("margin-top", pos + "px");
                $(event.target).draggable('option', 'refreshPositions', true);
                moving = true;
                moving2 = true;
                setTimeout(function () {moving = false; }, 800);
            },
            // Table on the right slides back to original position 1s after
            // drag stop
            stop: function stopDragging(event, ui) {
                setTimeout(function () {$tableDiv.css("margin-top", "0px"); }, 1000);
            },
            // Because the drop target slides in, we have to recalculate the
            // position of the target while dragging. This is computationally
            // expensive, so we stop recalculating once we know the target
            // stays in place
            drag: function whileDragging(event, ui) {
                if (!moving2) {
                    $(event.target).draggable('option', 'refreshPositions', false);
                }
                if (!moving) {
                    moving2 = false;
                }
            }
        });
    }

    /**
     * Drag helper. Constructs html-code that gets added to the page and
     * 'follows' the cursor while dragging. Mimics the design of the table.
     *
     * @param <jQuery> $node jQuery object of the dom element were dragging
     */
    function dragHelp($node) {
        var returnString = "<tbody class='dragging'>" +
            "<tr><td class='handle'><span class='glyphicon glyphicon-resize-vertical'></span></td><td class='data name' data-bioproject_id='" +
            $node.data("genomeid") + "'>" +
            $node.find(".name").text() +
            "</td><td class='data status'></td><td></td></tr>" +
            "</tbody>";
        return $(returnString);
    }

    /*************** indexedDBStore methods ************/

    /**
     * Initializes the database
     */
    indexedDBStore.init = function init() {
        var version = 4;
        var request = indexedDB.open("myGenomes", version);

        request.onupgradeneeded = function (e) {
            var db = e.target.result;

            e.target.transaction.onerror = indexedDBStore.onerror;

            if(db.objectStoreNames.contains("metadata")) {
                db.deleteObjectStore("metadata");
            }
            if(db.objectStoreNames.contains("peptideLists")) {
                db.deleteObjectStore("peptideLists");
            }
            if(db.objectStoreNames.contains("files")) {
                db.deleteObjectStore("files");
            }

            db.createObjectStore("metadata", {keyPath: "id"});
            db.createObjectStore("peptideLists", {keyPath: "id"});
            db.createObjectStore("files", {keyPath: "id"});
        };

        request.onsuccess = function(e) {
            indexedDBStore.db = e.target.result;
            indexedDBStore.loadMyGenomes();
        };

        request.onerror = indexedDBStore.onerror;
    };

    /**
     * Retrieves the list of genomes from the store and updates the UI
     */
    indexedDBStore.loadMyGenomes = function loadMyGenomes() {
        var db = indexedDBStore.db;
        var trans = db.transaction(["metadata", "files"], "readwrite");
        var store = trans.objectStore("metadata");
        var files = trans.objectStore("files");
        var fileRequest;

        // Get everything in the store;
        var keyRange = IDBKeyRange.lowerBound(0);
        var cursorRequest = store.openCursor(keyRange);

        cursorRequest.onsuccess = function(e) {
            var result = e.target.result;
            // are we done yet?
            if(!!result == false) {
                redrawTable();
                return;
            }

            genomeList.push(result.value.id);
            genomes[result.value.id] = result.value;

            // process if done
            if (result.value.version !== version) {
                fileRequest = files.get(result.value.id);
                fileRequest.onsuccess = function(e) {
                    sendToWorker("processFile", {file : e.target.result.file, name : result.value.name, id : result.value.id});
                }
                fileRequest.onerror = indexedDBStore.onerror;
            }

            result.continue();
        };

        cursorRequest.onerror = indexedDBStore.onerror;
    };

    /**
     * Adds a genome to the data store
     *
     * @param <Genome> genome The genome to be added
     */
    indexedDBStore.addGenome = function addGenome(genome) {
        var genomePeptides = {id : genome.id, peptides : genome.peptides};
        var genomeFile = genome.file ? {id : genome.id, file : genome.file} : null;
        var genomeMetadata = genome;
        delete genomeMetadata.peptides;
        delete genomeMetadata.file;

        var db = indexedDBStore.db;
        var trans = db.transaction(["metadata", "peptideLists", "files"], "readwrite");
        var metadata = trans.objectStore("metadata");
        var peptideLists = trans.objectStore("peptideLists");
        var files = trans.objectStore("files");

        var metadataRequest = metadata.put(genomeMetadata);
        metadataRequest.onerror = indexedDBStore.onerror;

        var peptideListRequest = peptideLists.put(genomePeptides);
        peptideListRequest.onerror = indexedDBStore.onerror;

        if (genomeFile) {
            var fileRequest = files.put(genomeFile);
            fileRequest.onerror = indexedDBStore.onerror;
        }
    };

    /**
     * Removes a genome from the indexedDBStore
     *
     * @param <String> id The id of the genome to remove
     */
    indexedDBStore.removeGenome = function removeGenome(id) {
        var db = indexedDBStore.db;
        var trans = db.transaction(["metadata", "peptideLists", "files"], "readwrite");
        var metadata = trans.objectStore("metadata");
        var peptideLists = trans.objectStore("peptideLists");
        var files = trans.objectStore("files");

        var metadataRequest = metadata.delete(id);
        metadataRequest.onerror = indexedDBStore.onerror;

        var peptideListRequest = peptideLists.delete(id);
        peptideListRequest.onerror = indexedDBStore.onerror;

        var filesRequest = files.delete(id);
        filesRequest.onerror = indexedDBStore.onerror;
    };

    /**
     * Updates a genome in the data store
     *
     * @param <Genome> genome The genome to update
     */
    indexedDBStore.updateGenome = function updateGenome(genome) {
        var db = indexedDBStore.db;
        var trans = db.transaction(["metadata"], "readwrite");
        var metadata = trans.objectStore("metadata");

        var metadataRequest = metadata.put(genome);
        metadataRequest.onerror = indexedDBStore.onerror;
    };

    /**
     * Fetches a list of peptides for a given genome and executes the callback
     * when it's done
     *
     * @param <String> id The id of the genome
     * @param <Function> callback The callback that gets executed when the ids
     *          are done loading
     */
    indexedDBStore.getPeptideList = function getPeptideList(id, callback) {
        var db = indexedDBStore.db;
        var trans = db.transaction(["metadata", "peptideLists"], "readwrite");
        var peptideLists = trans.objectStore("peptideLists");

        var peptideListRequest = peptideLists.get(id);
        peptideListRequest.onsuccess = function(e) {
            callback.call(this, e.target.result.peptides);
        }
        peptideListRequest.onerror = indexedDBStore.onerror;
    }

    /**
     * Handles an indexedDB error
     */
    indexedDBStore.onerror = function onerror(e) {
        console.log(e);
    }

    /*************** localstorage methods ************/

    /**
     * Initializes the database
     */
    localStorageStore.init = function init() {
        localStorageStore.loadMyGenomes();
    };

    /**
     * Retrieves the list of genomes from the store and updates the UI
     */
    localStorageStore.loadMyGenomes = function loadMyGenomes() {
        var i,
            id;

        genomes = localStorage.genomes ? JSON.parse(localStorage.genomes) : {};
        genomeList = localStorage.genomeList ? JSON.parse(localStorage.genomeList) : [];

        // remove old genomes
        for (i = genomeList.length - 1; i >= 0; i--) {
            id = genomeList[i];
            if (genomes[id].version !== version) {
                genomeList.splice(i, 1);
                delete genomes[id];
                localStorageStore.removeGenome(id);
            }
        }

        redrawTable();
    };

    /**
     * Adds a genome to the data store
     *
     * @param <Genome> genome The genome to be added
     */
    localStorageStore.addGenome = function addGenome(genome) {
        localStorage.genomeList = JSON.stringify(genomeList);
        localStorage.genomes = JSON.stringify(genomes);
        localStorage["genome_" + genome.id] = JSON.stringify(genome.peptides);
    };

    /**
     * Removes a genome from the data store
     *
     * @param <String> id The id of the genome to remove
     */
    localStorageStore.removeGenome = function removeGenome(id) {
        localStorage.genomeList = JSON.stringify(genomeList);
        localStorage.genomes = JSON.stringify(genomes);
        delete localStorage["genome_" + id];
    };

    /**
     * Updates a genome in the data store
     *
     * @param <Genome> genome The genome to update
     */
    localStorageStore.updateGenome = function updateGenome(genome) {
        localStorage.genomeList = JSON.stringify(genomeList);
        localStorage.genomes = JSON.stringify(genomes);
    };

    /**
     * Fetches a list of peptides for a given genome and executes the callback
     * when it's done
     *
     * @param <String> id The id of the genome
     * @param <Function> callback The callback that gets executed when the ids
     *          are done loading
     */
    localStorageStore.getPeptideList = function getPeptideList(id, callback) {
        var ids = JSON.parse(localStorage["genome_" + id]);
        callback.call(this, ids);
    }

    /*************** Public methods ***************/

    /**
     * Retrieves the list of peptide ids from the local storage for a given id
     *
     * @param <String> id The id of the genome
     * @param <Function> callback This function gets called when loaded
     */
    that.getIds = function getIds(id, callback) {
        dataStore.getPeptideList(id, callback);
    };

    // initialize the object
    init();

    return that;
};
