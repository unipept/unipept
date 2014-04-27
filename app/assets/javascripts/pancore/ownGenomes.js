/**
 * creates an ownGenomes object representing the table showing all self uploaded
 * genomes and optiones to add or remove them.
 *
 * @param <Pancore> args.pancore Pancore object
 */
var constructOwnGenomes = function constructOwnGenomes(args) {
    /*************** Private variables ***************/

    var that = {},
        pancore = args.pancore;

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
        $ownGenomesButton.on("shown.bs.popover", function () {
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
                console.log("click!");
            });
        })

        // set visible
        $ownGenomesDiv.removeClass("hide");
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
