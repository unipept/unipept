import {showNotification} from "./notifications.js";
import {DatasetManager} from "./mpa/datasetManager.js";
import {get, getJSON, highlight, logToGoogle, showError, showInfo} from "./utils.js";
import {MPAAnalysisContainer} from "./mpa/mpaAnaylsisContainer";
import {LOCAL_STORAGE_TYPE, SESSION_STORAGE_TYPE} from "./mpa/storageTypeConstants";

/* eslint-disable require-jsdoc */

function enableProgressIndicators(enable = true) {
    let $searchButton = $("#search_button");
    let $formProgress = $("#form-progress");

    $(".input-item")
        .prop('disabled', enable);

    if (enable) {
        $searchButton.hide();
        $formProgress.removeClass("hide");
    } else {
        $searchButton.show();
        $formProgress.addClass("hide");
    }
}

function initDatasets() {
    let datasetLoader = constructDatasetLoader();
    let localStorageManager = new DatasetManager();
    let sessionStorageManager = new DatasetManager(SESSION_STORAGE_TYPE);

    renderLocalStorageItems(localStorageManager, sessionStorageManager);
    renderSelectedDatasets(localStorageManager, sessionStorageManager);

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

    $("#search-multi-form").click(function() {
        enableProgressIndicators();

        let $dataForm = $("#send_data_form");

        searchSelectedDatasets(localStorageManager, sessionStorageManager)
            .then(() => $dataForm.submit())
            .catch(err => {
                showError(err, "An unknown error occurred. Please try again.");
                enableProgressIndicators(false);
            });
    });

    $("#add_dataset_button").click(function() {
        addDataset("", localStorageManager, sessionStorageManager);
    });

    $("#add_pride_dataset_button").click(function() {
        addDataset("pride-", localStorageManager, sessionStorageManager);
    });

    $("#reset_button").click(function() {
        $("#qs").val("");
        $("#search_name").val("");
        localStorageManager.clearSelection();
        sessionStorageManager.clearSelection();
        renderSelectedDatasets(localStorageManager, sessionStorageManager);
        showSelectedDatasetsPlaceholder();
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

/**
 * Retrieve all information about a dataset from the appropriate form. The form that should be used as a source for the
 * dataset information should be indicated by id-prefix.
 *
 * @param {string} idPrefix Unique identifier by which all id's of the corresponding form are preceded.
 * @param {DatasetManager} localStorageManager DatasetManager that's currently used to select datasets that are situated
 *        in the browser's local storage.
 * @param {DatasetManager} sessionStorageManager DatasetManager that's currently used to select datasets that are
 *        situated in the browser's session storage.
 * @return {void}
 */
function addDataset(idPrefix, localStorageManager, sessionStorageManager) {
    enableSearchNameError(false, idPrefix);
    enableProgressIndicators();

    let $searchName = $("#" + idPrefix + "search_name");
    let $saveDataSetCheckbox = $("#" + idPrefix + "save_dataset");

    let searchName = $searchName.val();
    let save = $saveDataSetCheckbox.prop("checked");

    if (save && searchName === "") {
        enableSearchNameError(true, idPrefix);
    } else {
        let peptides = $("#qs").val().replace(/\r/g,"").split("\n");
        console.log(save);
        console.log($saveDataSetCheckbox);
        let storageManager = save ? localStorageManager : sessionStorageManager;

        storageManager.storeDataset(peptides, searchName)
            .catch(err => showError(err, "Something went wrong while storing your dataset. Check whether local storage is enabled and supported by your browser."))
            .then(() => {
                storageManager.selectDataset(searchName);
                renderLocalStorageItems(localStorageManager, sessionStorageManager);
                renderSelectedDatasets(localStorageManager, sessionStorageManager);
                enableProgressIndicators(false);
            });
    }
}

function showSelectedDatasetsPlaceholder() {
    $("#selected-datasets-list").append($("<span>Please select one or more datasets from the right hand panel to continue the analysis...</span>"));
}

function enableSearchNameError(state = true, idPrefix = "") {
    let $searchInputGroup = $("#" + idPrefix + "search-input-group");
    let $helpBlockName = $("#" + idPrefix + "help-block-name");

    if (state) {
        $searchInputGroup.addClass("has-error");
        $helpBlockName.removeClass("hidden");
    } else {
        $searchInputGroup.removeClass("has-error");
        $helpBlockName.addClass("hidden");
    }
}

/**
 * Build a representation of the currently selected datasets in JSON, send it to the MPA analysis page and proceed.
 *
 * @returns {Promise<void>}
 */
async function searchSelectedDatasets(localStorageManager, sessionStorageManager) {
    let $dataInput = $("#data_input");

    let output = [];

    if (localStorageManager.getAmountOfSelectedDatasets() === 0 && sessionStorageManager.getAmountOfSelectedDatasets() === 0) {
        showInfo("You must select at least one dataset to start the analysis.");
    } else {
        let selectedDatasets = await localStorageManager.getSelectedDatasets();
        for (let selectedDataset of selectedDatasets) {
            output.push(new MPAAnalysisContainer(LOCAL_STORAGE_TYPE, selectedDataset.getName()));
        }

        selectedDatasets = await sessionStorageManager.getSelectedDatasets();
        for (let quickSearchItem of selectedDatasets) {
            output.push(new MPAAnalysisContainer(SESSION_STORAGE_TYPE, quickSearchItem.getName()));
        }
    }

    let il = $("#il").prop("checked");
    let dupes = $("#dupes").prop("checked");
    let missed = $("#missed").prop("checked");

    console.log(JSON.stringify({
        settings: {
            il: il,
            dupes: dupes,
            missed: missed
        },
        data: output
    }));

    $dataInput.val(JSON.stringify({
        settings: {
            il: il,
            dupes: dupes,
            missed: missed
        },
        data: output
    }));
}

function renderLocalStorageItems(localStorageManager, sessionStorageManager) {
    let $body = $("#local-storage-datasets");
    $body.html("");
    enableProgressIndicators();

    localStorageManager.listDatasets()
        .then(allDatasets => {
            for (let i = 0; i < allDatasets.length; i++) {
                $body.append(renderLocalStorageItem(allDatasets[i], localStorageManager, sessionStorageManager));
            }
        })
        .catch(err => showError(err, "Something went wrong while loading your datasets. Check whether local storage is enabled and supported by your browser."))
        .then(() => enableProgressIndicators(false));
}

function renderLocalStorageItem(dataset, localStorageManager, sessionStorageManager) {
    // Use jQuery to build elements to prevent XSS attacks
    let $listItem = $("<div class='list-item--two-lines'>");
    let $primaryAction = $("<span class='list-item-primary-action'>").append($("<span class='glyphicon glyphicon-arrow-left select-dataset-button'>"));
    let $primaryContent = $("<span class='list-item-primary-content'>").text(dataset.getName());
    $primaryContent.append($("<span class='list-item-date'>").text(dataset.getDate()));
    let $primaryBody = $("<span class='list-item--two-lines list-item-body'>").text(dataset.getAmountOfPeptides() + " peptides");
    $primaryContent.append($primaryBody);
    $listItem.append($primaryAction);
    $listItem.append($primaryContent);
    $primaryAction.click(function() {
        localStorageManager.selectDataset(dataset.getName());
        renderSelectedDatasets(localStorageManager, sessionStorageManager);
    });
    return $listItem;
}

function renderSelectedDatasets(localStorageManager, sessionStorageManager) {
    enableProgressIndicators();
    let $body = $("#selected-datasets-list");
    $body.html("");

    if (localStorageManager.getAmountOfSelectedDatasets() === 0 && sessionStorageManager.getAmountOfSelectedDatasets() === 0){
        showSelectedDatasetsPlaceholder();
    }

    Promise.all([localStorageManager.getSelectedDatasets(), sessionStorageManager.getSelectedDatasets()])
        .then(values => {
            let selectedDatasets = values[0].concat(values[1]);
            for (let selectedDataset of selectedDatasets) {
                $body.append(renderSelectedDataset(selectedDataset, localStorageManager, sessionStorageManager));
            }
        })
        .catch(err => showError(err, "Something went wrong while selecting some datasets. Check whether local storage is enabled and supported by your browser."))
        .then(() => enableProgressIndicators(false));
}

function renderSelectedDataset(dataset, localStorageManager, sessionStorageManager) {
    // Use jQuery to build elements and prevent XSS attacks
    let $listItem = $("<div class='list-item--two-lines'>");
    let $primaryContent = $("<span class='list-item-primary-content'>").append("<span>").text(dataset.getName());
    $primaryContent.append($("<span class='list-item-date'>").text(dataset.getDate()));
    $primaryContent.append($("<span class='list-item-body'>").text(dataset.getAmountOfPeptides() + " peptides"));
    $listItem.append($primaryContent);
    let $secondaryAction = $("<span class='list-item-secondary-action'>").append("<span class='glyphicon glyphicon-remove'>");
    $listItem.append($secondaryAction);

    $secondaryAction.click(function() {
        localStorageManager.selectDataset(dataset.getName(), false);
        renderSelectedDatasets(localStorageManager, sessionStorageManager);
    });

    return $listItem;
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
        let idPrefix = "";
        if (type === "pride") {
            idPrefix = "pride-";
        }

        // expand the search options and prepare the form
        $("#" + idPrefix + "qs").val("Please wait while we load the dataset...");
        enableProgressIndicators();
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
            $("#" + idPrefix + "search_name").val(name);
            $("#" + idPrefix + "qs").val(data);
            that.checkDatasetSize();

            // highlight what happend to the user
            highlight("#" + idPrefix + "qs");
            highlight("#" + idPrefix + "search_name");
        };

        let fail = function (error) {
            // track if something goes wrong
            logToGoogle("Datasets", "Failed", name, error);

            // reset the form elements
            $("#" + idPrefix + "qs").val("");

            // highlight what pappend to the user
            showError(error, "Something went wrong while loading the datasets.");
            $("html, body").animate({
                scrollTop: $("#messages").offset().top,
            }, 1000);
        };

        let always = function () {
            // enable the form elements
            $("#search-multi-form").button("reset");
            if (button) {
                button.button("reset");
            }
            toast.hide();
            enableProgressIndicators(false);
        };

        let request = type === "internal" ? loadInternalDataset(id) : loadPrideDataset(id);
        request.then(done)
            .catch(fail)
            .then(always);
    };

    return that;
}

export {initDatasets, initPreload};
