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
    var genomes;

    // Page elements
    var $ownGenomesDiv = $("#ownGenomes"),
        $ownGenomesList = $("#ownGenomesList"),
        $ownGenomesButton = $("#addOwnGenomeButton");

    /*************** Private methods ***************/

    /**
     * Initializes the table
     */
    function init() {
        genomes = localStorage.genomeList ? JSON.parse(localStorage.genomeList) : [];

        // init worker
        // Create the Javascript Worker for background data processing
        worker = new Worker("/assets/workers/owngenome_worker.js");
        worker.addEventListener('message', handleWorkerMessage, false);
        worker.addEventListener('error', error, false);

        // init gui
        redrawList();

        // init popover
        $ownGenomesButton.popover({
            html : true,
            title: function() {
              return $("#owngenomes-popover-head").html();
            },
            content: function() {
              return $("#owngenomes-popover-content").html();
            }
        });

        // add pop-over behaviour
        $ownGenomesButton.on("shown.bs.popover", initPopoverBehaviour)

        // set visible
        $ownGenomesDiv.removeClass("hide");
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
            processConvertedGenome(data.msg.ids);
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
     * Processes the converted genome. Adds it to the list and local storage.
     * Cleans up the popover.
     *
     * @params <Array> ids A sorted array with integer id's
     */
    function processConvertedGenome(ids) {
        $("#processOwnGenomeButton").parents("form").trigger('reset');
        $("#processOwnGenomeButton").removeAttr("disabled");
    }

    /**
     * Redraws a list with all added genomes
     */
    function redrawList() {
        var i;

        $ownGenomesList.empty();
        for (i = 0; i < genomes.length; i++) {
            $ownGenomesList.append("<li>" + genomes[i] + "</li>");
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
