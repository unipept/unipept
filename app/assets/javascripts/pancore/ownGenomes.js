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
            },
            container: "body"
        });

        // enable remove all button
        $("#remove-my-genomes").click(removeAllGenomes);

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
        $(".popover-content #ownGenomeName").tooltip({placement : "right", trigger : "hover", container : "body"});
        $(".popover-content #ownGenomeFile").parents(".input-group").tooltip({placement : "right", trigger : "hover", container : "body"});

        // enable file chooser
        $(".popover-content #ownGenomeFile").on('change', function() {
            var $input = $(this)
                numFiles = $input.get(0).files ? $input.get(0).files.length : 1,
                label = $input.val().replace(/\\/g, '/').replace(/.*\//, ''),
                log = numFiles > 1 ? numFiles + ' files selected' : label;
            $input.parents('.input-group').find(':text').val(log);
        });

        // hook up the button
        $(".popover-content #processOwnGenomeButton").click(function () {
            var name = $(".popover-content #ownGenomeName").val(),
                file = $(".popover-content #ownGenomeFile").prop("files")[0];
            if (!name) {
                $(".popover-content #ownGenomeName").parents(".form-group").addClass("has-error");
            } else {
                $(".popover-content #ownGenomeName").parents(".form-group").removeClass("has-error");
            }
            if (!file) {
                $(".popover-content #ownGenomeFile").parents(".form-group").addClass("has-error");
            } else {
                $(".popover-content #ownGenomeFile").parents(".form-group").removeClass("has-error");
            }
            if (name && file) {
                $(this).attr("disabled", "disabled");
                $(this).addClass("hide");
                processProgress(0);
                $(".popover-content #ownGenomeProgress").removeClass("hide");

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
        $(".popover-content #processOwnGenomeButton").parents("form").trigger('reset');
        $(".popover-content #processOwnGenomeButton").removeAttr("disabled");
        $(".popover-content #processOwnGenomeButton").removeClass("hide");
        $(".popover-content #ownGenomeProgress").addClass("hide");
    }

    /**
     * Updates the progress bar with a new value
     *
     * @param <Number> percentage Value between 0 and 1 indicating the progress
     */
    function processProgress(percentage) {
        $(".popover-content #ownGenomeProgress .progress-bar").css("width", (percentage * 100) + "%");
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
     * Removes a genome from the my genome list
     *
     * @param <String> id The id to remove
     */
    function removeGenome(id) {
        // update local list
        genomeList.splice(genomeList.indexOf(id), 1);
        delete genomes[id];

        // update local storage
        localStorage.genomeList = JSON.stringify(genomeList);
        localStorage.genomes = JSON.stringify(genomes);
        delete localStorage["genome_" + id];

        // update the list
        redrawTable();
    }

    /**
     * removes all the genomes from the my genome list
     */
    function removeAllGenomes() {
        var i;
        for (i = 0; i < genomeList.length; i++) {
            delete localStorage["genome_" + genomeList[i]];
        }

        // update local list
        genomeList = [];
        genomes = {};

        // update local storage
        localStorage.genomeList = JSON.stringify(genomeList);
        localStorage.genomes = JSON.stringify(genomes);

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
        if (genomeList.length == 0) {
            $myGenomesTable.append("<tr class='info'><td colspan='4' class='info'><span class='glyphicon glyphicon-chevron-up'></span> Click the plus-button to add your own genomes.</td></tr>");
        } else {
            for (i = 0; i < genomeList.length; i++) {
                g = genomes[genomeList[i]];
                $myGenomesTable.append("<tr data-genomeid='" + g.id + "'><td><span class='glyphicon glyphicon-move'></span></td><td class='name'>" + g.name + "</td><td></td><td class='button'><a class='btn btn-default btn-xs remove-my-genome' title='remove genome'><span class='glyphicon glyphicon-trash'></span></a></td></<tr>");
            }
            $(".remove-my-genome").click(function () {
                removeGenome($(this).parents("tr").data("genomeid"));
            });

            initDrag();
        }
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
        console.log($node);
        var returnString = "<tbody class='dragging'>"
            + "<tr><td class='handle'><span class='glyphicon glyphicon-resize-vertical'></span></td><td class='data name' data-bioproject_id='"
            + $node.data("genomeid") + "'>"
            + $node.find(".name").text()
            + "</td><td class='data status'></td><td></td></tr>"
            + "</tbody>";
        return $(returnString);
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
