import {showNotification} from "./notifications.js";
import {get, getJSON, highlight, logToGoogle, showError, showInfo} from "./utils.js";

/* eslint-disable require-jsdoc */

function initDatasets() {
    let datasetLoader = constructDatasetLoader();

    // enable tooltips
    $(".js-has-hover-tooltip").tooltip({
        container: "body",
        placement: "right",
    });
    $(".js-has-focus-tooltip").tooltip({
        trigger: "focus",
        container: "body",
        placement: "right",
    });


    // add progress bar when submitting form
    $("#search-multi-form").click(function (e) {
        $("#search_button").hide();
        $("#form-progress").removeClass("hide");

        let sessionStorageSucceeded = false;
        try {
            let storage = window.sessionStorage;
            storage.setItem("mpaData", $("#qs").val());
            if (storage.getItem("mpaData") === $("#qs").val()) {
                sessionStorageSucceeded = true;
                $("#qs").removeAttr("name").attr("form", "nonexistentform"); // don't send qs over wire
                $(this).closest("form").append("<input type='hidden' name='qs' value='sessionstorage'/>");
            }
        } catch (e) {
            sessionStorageSucceeded = false;
        }

        showNotification(sessionStorageSucceeded ? "Starting analysis…" : "Sending peptides…", {
            autoHide: false,
            loading: true,
        });
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
        $(this).button("loading");
        // set the vars
        let id = $(this).parent().find("select").val(),
            name = $(this).parent().find("select option:selected").text();

        logToGoogle("Datasets", "Load", "Database - " + name);

        // load the datasets
        datasetLoader.loadDataset("internal", id, name, $(this));
        return false;
    });

    // load a PRIDE dataset
    $(".load-pride").click(loadPride);
    $("#pride_exp_id").keypress(function (event) {
        if (event.which == "13") {
            loadPride();
        }
    });

    function loadPride() {
        // set the vars
        let experiment = $("#pride_exp_id").val(),
            name = "PRIDE assay " + experiment;

        if (experiment === "") {
            showInfo("Please enter a PRIDE assay id");
            return false;
        }

        $(this).button("loading");

        logToGoogle("Datasets", "Load", "Pride - " + name);

        // load the datasets
        datasetLoader.loadDataset("pride", experiment, name, $(this));
        return false;
    }
}

function initPreload(type, id) {
    let datasetLoader = constructDatasetLoader();
    $("#pride-progress").appendTo(".card-supporting-text");

    if (type === "database") {
        datasetLoader.loadDataset("internal", id, "Dataset " + id);
    } else {
        datasetLoader.loadDataset("pride", id, "Pride assay " + id);
    }
}

function constructDatasetLoader() {
    let that = {};

    /** ************ private methods *************/

    /**
     * Returns a list of peptides from an internal dataset as a promise
     *
     * @param {Integer} id The id of the dataset(item) we want to load
     */
    function loadInternalDataset(id) {
        return get("/dataset_items/" + id);
    }

    /**
     * Returns a list of peptide from a pride experiment as a promise
     *
     * @param {Integer} id The id of the assay we want to load
     */
    function loadPrideDataset(id) {
        let batchSize = 1000,
            peptides = [],
            e;

        $("#pride-progress").show("fast");
        $("#pride-progress .progress-bar").css("width", "10%");

        return get("https://www.ebi.ac.uk/pride/ws/archive/peptide/count/assay/" + id).then(function (datasetSize) {
            let urls = [],
                page;
            for (page = 0; page * batchSize < datasetSize; page++) {
                urls.push("https://www.ebi.ac.uk/pride/ws/archive/peptide/list/assay/" + id + "?show=" + batchSize + "&page=" + page);
            }
            page = 0;
            return urls.map(getJSON)
                .reduce(function (sequence, batchPromise) {
                    return sequence.then(function () {
                        return batchPromise;
                    }).then(function (response) {
                        page++;
                        $("#pride-progress .progress-bar").css("width", 10 + (90 * page * batchSize) / datasetSize + "%");
                        peptides = peptides.concat(response.list.map(function (d) {
                            return d.sequence;
                        }));
                    });
                }, Promise.resolve());
        }).catch(function (err) {
            e = err;
        })
            .then(function () {
                $("#pride-progress").hide("fast");
                if (e) throw e;
                return peptides.join("\n");
            });
    }


    /** ************ public methods *************/

    /**
     * Checks if the number of peptides in the current dataset isn't too high
     * and displays a warning if it is.
     */
    that.checkDatasetSize = function checkDatasetSize() {
        let lines = $("#qs").val().split(/\n/).length;
        if (lines > 100000) {
            $(".multisearch-warning-amount").text(lines);
            $("#multisearch-warning").show("fast");
        } else {
            $("#multisearch-warning").hide("fast");
        }
    };

    /**
     * Public method to load a dataset
     *
     * @param {String} type The type of the dataset to load: internal or pride
     * @param {Integer} id The id of the dataset to load
     * @param {String} name The name of the dataset
     * @param {HTMLButtonElement} button The button that was clicked to load the
     *          dataset. Can be nil.
     */
    that.loadDataset = function loadDataset(type, id, name, button) {
        // expand the search options and prepare the form
        $("#qs").val("Please wait while we load the dataset...");
        $("#qs").attr("disabled", "disabled");
        $("#search-multi-form").button("loading");
        let startTimer = new Date().getTime();
        let toast = showNotification("Loading dataset...", {
            autoHide: false,
            loading: true,
        });

        let done = function (data) {
            // track the load times
            let loadTime = new Date().getTime() - startTimer;
            logToGoogle("Datasets", "Loaded", name, loadTime);

            // fill in the data
            $("#search_name").val(name);
            $("#qs").val(data);
            that.checkDatasetSize();

            // highlight what happend to the user
            highlight("#qs");
            highlight("#search_name");
        };

        let fail = function (error) {
            // track if something goes wrong
            logToGoogle("Datasets", "Failed", name, error);

            // reset the form elements
            $("#qs").val("");

            // highlight what pappend to the user
            showError(error, "Something went wrong while loading the datasets.");
            $("html, body").animate({
                scrollTop: $("#messages").offset().top,
            }, 1000);
        };

        let always = function () {
            // enable the form elements
            $("#qs").attr("disabled", false);
            $("#search-multi-form").button("reset");
            if (button) {
                button.button("reset");
            }
            toast.hide();
        };

        let request = type === "internal" ? loadInternalDataset(id) : loadPrideDataset(id);
        request.then(done)
            .catch(fail)
            .then(always);
    };

    return that;
}

export {initDatasets, initPreload};
