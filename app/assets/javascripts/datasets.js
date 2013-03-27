function initDatasets() {
    $("#more_options_form").hide();
    $("#more_options a").click(function () {
        $("#more_options_form").slideDown("slow");
        $("#more_options").hide("fast");
        return false;
    });
    $("#export").change(function () {
        // GA event tracking
        _gaq.push(['_trackEvent', 'Multi Peptide', 'Export']);
    });

    // load a dataset from the local database
    $(".load-dataset").click(function () {
        $(this).button('loading');
        // set the vars
        var url = $(this).parent().find("select").val(),
            name = $(this).parent().find("select option:selected").text();

        // GA event tracking
        _gaq.push(['_trackEvent', 'Datasets', 'Load', 'Database - ' + name]);

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

        if (experiment == "") {
            info("Please enter a PRIDE id");
            return false;
        }

        $(this).button('loading');

        // GA event tracking
        _gaq.push(['_trackEvent', 'Datasets', 'Load', 'Pride - ' + experiment]);

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

        $.get(url)
          .done(
            function (data) {
                button.button('reset');

                var loadTime = new Date().getTime() - startTimer;
                _gaq.push(['_trackEvent', 'Datasets', 'Loaded', name, loadTime]);

                $("#search_name").val(name);
                  $("#qs").val(data);
                $("#qs").attr('disabled', false);
                $('html, body').animate({
                    scrollTop: $("#search_elements").parent().parent().offset().top
                 }, 1000);
                $("#qs").animateHighlight(null, 2000);
                $("#search_name").animateHighlight(null, 2000);
            }
          )
          .fail(
            function (jqXHR, textStatus, errorType) {
                button.button('reset');

                _gaq.push(['_trackEvent', 'Datasets', 'Failed', name, textStatus]);

                  $("#qs").val("");
                $("#qs").attr('disabled', false);
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
    //$("#more_options_form").show();
    $("#more_options").hide();

    var url, name;

    if (type == "database") {
        url = "/dataset_items/" + id;
        name = "Dataset " + id;
    }
    else {
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
                var loadTime = new Date().getTime() - startTimer;
                _gaq.push(['_trackEvent', 'Datasets', 'Loaded', name, loadTime]);

                $("#search_name").val(name);
                  $("#qs").val(data);
                $("#qs").attr('disabled', false);
                $("#qs").animateHighlight(null, 2000);
                $("#search_name").animateHighlight(null, 2000);
              }
          )
          .fail(
            function(jqXHR, textStatus, errorType) {
                _gaq.push(['_trackEvent', 'Datasets', 'Failed', name, textStatus]);

                  $("#qs").val("");
                $("#qs").attr('disabled', false);
                  error(textStatus, "Something went wrong while loading the datasets.");
            }
          );
    }
}