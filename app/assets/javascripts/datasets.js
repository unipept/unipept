function initDatasets() {
    var datasetLoader = constructDatasetLoader();

    // add progress bar when submitting form
    $("#search-multi-form").click(function () {
        $("#search_button").hide();
        $("#form-progress").removeClass("hide");
    });

    // hide more options + set up action to show is
    $("#more_options_form").hide();
    $("#more_options a").click(function () {
        $("#more_options_form").slideDown("slow");
        $("#more_options").hide("fast");
        return false;
    });

    // track the use of the export checkbox
    $("#export").change(function () {
        logToGoogle("Multi Peptide", "Export");
    });

    $("#qs").on("paste", function () {
        setTimeout(datasetLoader.checkDatasetSize, 0);
    });

    // load a dataset from the local database
    $(".load-dataset").click(function () {
        $(this).button('loading');
        // set the vars
        var id = $(this).parent().find("select").val(),
            name = $(this).parent().find("select option:selected").text();

        logToGoogle("Datasets", "Load", "Database - " + name);

        // load the datasets
        datasetLoader.loadDataset("internal", id, name, $(this));
        return false;
    });

    // load a PRIDE dataset
    $(".load-pride").click(function () {
        // set the vars
        var experiment = $("#pride_exp_id").val(),
            name = "PRIDE assay " + experiment;

        if (experiment === "") {
            info("Please enter a PRIDE assay id");
            return false;
        }

        $(this).button('loading');

        logToGoogle("Datasets", "Load", "Pride - " + name);

        // load the datasets
        datasetLoader.loadDataset("pride", experiment, name, $(this));
        return false;
    });
}

function initPreload(type, id) {
    // show full form
    $("#more_options").hide();

    var datasetLoader = constructDatasetLoader();

    if (type === "database") {
        datasetLoader.loadDataset("internal", id, "Dataset " + id);
    } else {
        datasetLoader.loadDataset("pride", id, "Pride assay " + id);
    }
}

function constructDatasetLoader() {
    var that = {};

    /************** private methods *************/

    function loadInternalDataset(id, done, fail, always) {
        $.get("/dataset_items/" + id)
            .done(done)
            .fail(fail)
            .always(always);
    }

    function loadPrideDataset(id, done, fail, always) {
        var batchSize = 1000,
            page = 0,
            peptides = [],
            datasetSize;

        $("#pride-progress").show("fast");
        $("#pride-progress .progress-bar").css("width", "0%");
        $.get("http://www.ebi.ac.uk:80/pride/ws/archive/peptide/count/assay/" + id)
            .done(function (data) {
                datasetSize = data;
                loadNextBatch();
            })
            .fail(prideFail);

            function loadNextBatch() {
                $("#pride-progress .progress-bar").css("width", (100 * page * batchSize) / datasetSize + "%");
                if (page * batchSize > datasetSize) { // we're done
                    $("#pride-progress").hide("fast");
                    done.call(this, peptides.join("\n"));
                    always.call(this);
                } else { // load next batch
                    $.get("http://www.ebi.ac.uk:80/pride/ws/archive/peptide/list/assay/" + id + "?show=" + batchSize + "&page=" + page)
                        .done(function (data) {
                            data = data.list.map(function (d) {return d.sequence; });
                            peptides = peptides.concat(data);
                            page++;
                            loadNextBatch();
                        })
                        .fail(prideFail);
                }
            }

            function prideFail() {
                $("#pride-progress").hide("fast");
                fail.call(this);
                always.call(this);
            }
    }


    /************** public methods *************/

    /**
     * Checks if the number of peptides in the current dataset isn't too high
     */
    that.checkDatasetSize = function checkDatasetSize() {
        var lines = $("#qs").val().split(/\n/).length;
        if (lines > 10000) {
            $(".multisearch-warning-amount").text(lines);
            $("#multisearch-warning").show("fast");
        } else {
            $("#multisearch-warning").hide("fast");
        }
    };

    that.loadDataset = function loadDataset(type, id, name, button) {
        // expand the search options and prepare the form
        $("#more_options a").click();
        $("#qs").val("Please wait while we load the dataset...");
        $("#qs").attr('disabled', 'disabled');

        var startTimer = new Date().getTime();

        var done = function (data) {
            // track the load times
            var loadTime = new Date().getTime() - startTimer;
            logToGoogle("Datasets", "Loaded", name, loadTime);

            // fill in the data
            $("#search_name").val(name);
            $("#qs").val(data);
            that.checkDatasetSize();

            // highlight what happend to the user
            $('html, body').animate({
                scrollTop: $("#search_elements").parent().parent().offset().top
            }, 1000);
            highlight("#qs");
            highlight("#search_name");
        };

        var fail = function (jqXHR, textStatus, errorType) {
            // track is something goes wrong
            logToGoogle("Datasets", "Failed", name, textStatus);

            // reset the form elements
            $("#qs").val("");

            // highlight what pappend to the user
            error(textStatus, "Something went wrong while loading the datasets.");
            $('html, body').animate({
                scrollTop: $("#messages").offset().top
            }, 1000);
        };

        var always = function () {
            // enable the form elements
            $("#qs").attr('disabled', false);
            if (button) {
                button.button('reset');
            }
        };

        if (type === "internal") {
            loadInternalDataset(id, done, fail, always);
        } else {
            loadPrideDataset(id, done, fail, always);
        }
    };

    return that;
}