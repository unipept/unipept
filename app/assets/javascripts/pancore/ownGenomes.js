/**
 * creates an ownGenomes object representing the table showing all self uploaded
 * genomes and optiones to add or remove them.
 *
 * @param <Pancore> args.pancore Pancore object
 */
var constructOwnGenomes = function constructOwnGenomes(args) {
    /*************** Private variables ***************/

    var that = {},
        pancore = args.pancore,
        worker;

    // Data vars
    var genomes,
        genomeList;

    // Page elements
    var $myGenomesDiv = $("#ownGenomes"),
        $myGenomesTable = $("#my-genomes-table tbody"),
        $myGenomesButton = $("#addOwnGenomeButton");

    /*************** Private methods ***************/

    /**
     * Initializes the table
     */
    function init() {
        genomes = localStorage.genomes ? JSON.parse(localStorage.genomes) : {};
        genomeList = localStorage.genomeList ? JSON.parse(localStorage.genomeList) : [];

        // init worker
        // Create the Javascript Worker for background data processing
        worker = new Worker("/assets/workers/owngenome_worker.js");
        worker.addEventListener('message', handleWorkerMessage, false);
        worker.addEventListener('error', error, false);

        // init gui
        redrawTable();

        // init popover
        $myGenomesButton.popover({
            html : true,
            title: function() {
              return $("#owngenomes-popover-head").html();
            },
            content: function() {
              return $("#owngenomes-popover-content").html();
            }
        });

        // add pop-over behaviour
        $myGenomesButton.on("shown.bs.popover", initPopoverBehaviour)

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
            processConvertedGenome(data.msg.ids, data.msg.name);
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
        // enable the tooltips
        $("#ownGenomeName").tooltip({placement : "right", trigger : "hover", container : "body"});
        $("#ownGenomeFile").parents(".input-group").tooltip({placement : "right", trigger : "hover", container : "body"});

        // enable file chooser
        $("#ownGenomeFile").on('change', function() {
            var $input = $(this)
                numFiles = $input.get(0).files ? $input.get(0).files.length : 1,
                label = $input.val().replace(/\\/g, '/').replace(/.*\//, ''),
                log = numFiles > 1 ? numFiles + ' files selected' : label;
            $input.parents('.input-group').find(':text').val(log);
        });

        // hook up the button
        $("#processOwnGenomeButton").click(function () {
            var name = $("#ownGenomeName").val(),
                file = $("#ownGenomeFile").prop("files")[0];
            if (!name) {
                $("#ownGenomeName").parents(".form-group").addClass("has-error");
            } else {
                $("#ownGenomeName").parents(".form-group").removeClass("has-error");
            }
            if (!file) {
                $("#ownGenomeFile").parents(".form-group").addClass("has-error");
            } else {
                $("#ownGenomeFile").parents(".form-group").removeClass("has-error");
            }
            if (name && file) {
                $(this).attr("disabled", "disabled");
                $(this).addClass("hide");
                processProgress(0);
                $("#ownGenomeProgress").removeClass("hide");

                handleAddOwnGenome(name, file);
            }
        });
    }

    /**
     * Handles the addOwnGenome event
     *
     * @param <String> name The name of the genome
     * @param <File> file A file object
     */
    function handleAddOwnGenome(name, file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            sendToWorker("processFile", {file : reader.result, name : name});
        };
        reader.readAsText(file);
    }

    /**
     * Processes the converted genome, cleans up the popover.
     *
     * @param <Array> ids A sorted array with integer id's
     * @param <String> name The name of the genome
     */
    function processConvertedGenome(ids, name) {
        // generate an id
        var id = "u" + new Date().getTime();
        addGenome(id, name, ids);

        // reset the form
        $("#processOwnGenomeButton").parents("form").trigger('reset');
        $("#processOwnGenomeButton").removeAttr("disabled");
        $("#processOwnGenomeButton").removeClass("hide");
        $("#ownGenomeProgress").addClass("hide");
    }

    /**
     * Updates the progress bar with a new value
     *
     * @param <Number> percentage Value between 0 and 1 indicating the progress
     */
    function processProgress(percentage) {
        $("#ownGenomeProgress .progress-bar").css("width", (percentage * 100) + "%");
    }

    /**
     * Add a genome to the list of myGenomes in local storage
     *
     * @param <String> id A random id
     * @param <String> name The genome name
     * @param <Array> ids A list of ints
     */
    function addGenome(id, name, ids) {
        // update local list
        genomeList.push(id);
        genomes[id] = {id : id, name : name, dateAdded : Date()};

        // update local storage
        localStorage.genomeList = JSON.stringify(genomeList);
        localStorage.genomes = JSON.stringify(genomes);
        localStorage["genome_" + id] = JSON.stringify(ids);

        // update the list
        redrawTable();
    }

    /**
     * Redraws the table with all added genomes
     */
    function redrawTable() {
        var i,
            g;

        $myGenomesTable.empty();
        for (i = 0; i < genomeList.length; i++) {
            g = genomes[genomeList[i]];
            $myGenomesTable.append("<tr><td><span class='glyphicon glyphicon-move'></span></td><td>" + g.name + "</td><td></td><td class='button'><a class='btn btn-default btn-xs' title='remove genome'><span class='glyphicon glyphicon-trash'></span></a></td></<tr>");
        }
    }

    /*************** Public methods ***************/

    /**
     * Does something
     */
    that.doSomething = function doSomething() {
    };

    // initialize the object
    init();

    return that;
};
