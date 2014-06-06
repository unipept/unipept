function initDatasets() {
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

    // load a dataset from the local database
    $(".load-dataset").click(function () {
        $(this).button('loading');
        // set the vars
        var url = $(this).parent().find("select").val(),
            name = $(this).parent().find("select option:selected").text();

        logToGoogle("Datasets", "Load", "Database - " + name);

        // load the datasets
        loadDataset(url, name, $(this));
        return false;
    });

    // load a PRIDE dataset
    $(".load-pride").click(function () {
        // set the vars
        var experiment = $("#pride_exp_id").val(),
            url = "/pride/" + experiment,
            name = "PRIDE experiment " + experiment;

        if (experiment === "") {
            info("Please enter a PRIDE id");
            return false;
        }

        $(this).button('loading');

        logToGoogle("Datasets", "Load", "Pride - " + name);

        // load the datasets
        loadDataset(url, name, $(this));
        return false;
    });

    function loadDataset(url, name, button) {
        // expand the search options and prepare the form
        $("#more_options a").click();
        $("#qs").val("Please wait while we load the dataset...");
        $("#qs").attr('disabled', 'disabled');

        var startTimer = new Date().getTime();

        // request the actual data
        $.get(url)
            .done( // all goes well
                function (data) {
                    // track the load times
                    var loadTime = new Date().getTime() - startTimer;
                    logToGoogle("Datasets", "Loaded", name, loadTime);

                    // enable the form elements
                    $("#qs").attr('disabled', false);
                    button.button('reset');

                    // fill in the data
                    $("#search_name").val(name);
                    $("#qs").val(data);

                    // highlight what happend to the user
                    $('html, body').animate({
                        scrollTop: $("#search_elements").parent().parent().offset().top
                    }, 1000);
                    highlight("#qs");
                    highlight("#search_name");
                }
            )
            .fail( // something went wrong
                function (jqXHR, textStatus, errorType) {
                    // track is something goes wrong
                    logToGoogle("Datasets", "Failed", name, textStatus);

                    // reset the form elements
                    $("#qs").val("");
                    $("#qs").attr('disabled', false);
                    button.button('reset');

                    // highlight what pappend to the user
                    error(textStatus, "Something went wrong while loading the datasets.");
                    $('html, body').animate({
                        scrollTop: $("#messages").offset().top
                    }, 1000);
                }
            );
    }
}

function initPreload(type, id) {
    // show full form
    $("#more_options").hide();

    var url, name;

    if (type === "database") {
        url = "/dataset_items/" + id;
        name = "Dataset " + id;
    } else {
        url = "/pride/" + id;
        name = "Pride experiment " + id;
    }

    preloadDataset(url, name);

    function preloadDataset(url, name) {
        // prepare the form
        $("#qs").val("Please wait while we load the dataset...");
        $("#qs").attr('disabled', 'disabled');

        var startTimer = new Date().getTime();

        $.get(url)
            .done(
                function (data) {
                    // track the load times
                    var loadTime = new Date().getTime() - startTimer;
                    logToGoogle("Datasets", "Loaded", name, loadTime);

                    // enable the form elements
                    $("#qs").attr('disabled', false);

                    // fill in the data
                    $("#search_name").val(name);
                    $("#qs").val(data);

                    // highlight what happend to the user
                    highlight("#qs");
                    highlight("#search_name");
                }
            )
            .fail( // something went wrong
                function (jqXHR, textStatus, errorType) {
                    // track is something is wrong
                    logToGoogle("Datasets", "Failed", name, textStatus);

                    // reset the form elements
                    $("#qs").val("");
                    $("#qs").attr('disabled', false);

                    error(textStatus, "Something went wrong while loading the datasets.");
                }
            );
    }
}