import {showNotification} from "./../notifications.js";
import {DatasetManager} from "./../mpa/datasetManager.js";
import {get, getJSON, highlight, logToGoogle, showError, showInfo} from "./../utils.js";
import {LOCAL_STORAGE_TYPE, SESSION_STORAGE_TYPE} from "./../mpa/storageTypeConstants";

/* eslint-disable require-jsdoc */

class LoadDatasetsCardManager {
    /**
     * @param {DatasetManager} localStorageManager A DatasetManager whose storage type is set to local_storage.
     * @param {DatasetManager} sessionStorageManager A DatasetManager whose storage type is set to session_storage.
     * @param clearDatasetsListener A function that's called when the selection of datasets is cleared.
     * @param removeDatasetListener A function that's given a dataset (PeptideContainer) as parameter which indicates
     *        that the given dataset was removed from the selection.
     * @param addDatasetListener A function that's given a dataset (PeptideContainer) as parameter which indicates that
     *        the given dataset was added to the selection.
     */
    constructor(
        localStorageManager,
        sessionStorageManager,
        clearDatasetsListener,
        removeDatasetListener,
        addDatasetListener
    ) {
        this._localStorageManager = localStorageManager;
        this._sessionStorageManager = sessionStorageManager;

        this._clearDatasetsListener = clearDatasetsListener;
        this._removeDatasetListener = removeDatasetListener;
        this._addDatasetListener = addDatasetListener;

        this.renderLocalStorageItems();
        this.initializeDatasetLoader();
        this.renderAllSelectedDatasets();

        // Automatically check required content when user changes input fields
        this.initializeAutomaticRequiredContentChecks();
        this.initializeAutomaticRequiredContentChecks("pride-");
    }

    clearSelectedDatasets() {
        if (this._clearDatasetsListener) {
            this._clearDatasetsListener();
        }
    }

    removeSelectedDataset(dataset) {
        if (this._removeDatasetListener) {
            this._removeDatasetListener(dataset);
        }
    }

    addSelectedDataset(dataset) {
        if (this._addDatasetListener) {
            this._addDatasetListener(dataset, () => {
                this._localStorageManager.selectDataset(dataset.getId(), false);
                this._sessionStorageManager.selectDataset(dataset.getId(), false);
                this.removeSelectedDataset(dataset);
            });
        }
    }

    renderAllSelectedDatasets() {
        this.clearSelectedDatasets();

        Promise.all([this._localStorageManager.getSelectedDatasets(), this._sessionStorageManager.getSelectedDatasets()])
            .then((values) => {
                let selectedDatasets = values[0].concat(values[1]);
                for (let dataset of selectedDatasets) {
                    this.addSelectedDataset(dataset);
                }
            })
    }

    initializeAutomaticRequiredContentChecks(idPrefix = "") {
        let $qs = $("#" + idPrefix + "qs");
        let $name = $("#" + idPrefix + "search_name");

        $qs.change(() => this.checkRequiredContent(idPrefix));
        $name.change(() => this.checkRequiredContent(idPrefix));
    }

    initializeDatasetLoader() {
        let datasetLoader = this.constructDatasetLoader();

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

        $("#search-multi-form").click(() => {
            this.enableProgressIndicators();

            let $dataForm = $("#send_data_form");

            this.searchSelectedDatasets()
                .then(() => $dataForm.submit())
                .catch(err => {
                    showError(err, "An unknown error occurred. Please try again.");
                    this.enableProgressIndicators(false);
                });
        });

        $("#add_dataset_button").click(() => {
            this.addDataset("");
        });

        $("#add_pride_dataset_button").click(() => {
            this.addDataset("pride-");
        });

        $("#reset_button").click(() => {
            $("#qs").val("");
            $("#search_name").val("");
            this._localStorageManager.clearSelection();
            this._sessionStorageManager.clearSelection();
            this.clearSelectedDatasets();
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
            if (event.which === "13") {
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

    initPreload(type, id) {
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
     * @return {void}
     */
    addDataset(idPrefix) {
        this.enableProgressIndicators();

        let $searchName = $("#" + idPrefix + "search_name");
        let $saveDataSetCheckbox = $("#" + idPrefix + "save_dataset");

        let searchName = $searchName.val();
        let save = $saveDataSetCheckbox.prop("checked");

        if (!this.checkRequiredContent(idPrefix)) {
            this.enableProgressIndicators(false);
            return;
        }

        if (save && searchName === "") {
            this.enableProgressIndicators(false);
        } else {
            let peptides = $("#" + idPrefix + "qs").val().replace(/\r/g,"").split("\n");
            let storageManager = save ? this._localStorageManager : this._sessionStorageManager;

            storageManager.storeDataset(peptides, searchName)
                .then((dataset) => {
                    storageManager.selectDataset(dataset.getId());
                    this.addSelectedDataset(dataset);
                    this.renderLocalStorageItems();
                })
                .catch(err => showError(err, "Something went wrong while storing your dataset. Check whether local storage is enabled and supported by your browser."))
                .then(() => this.enableProgressIndicators(false));
        }
    }

    /**
     * Build a representation of the currently selected datasets in JSON, send it to the MPA analysis page and proceed.
     *
     * @returns {Promise<void>}
     */
    async searchSelectedDatasets() {
        let $dataInput = $("#data_input");

        if (this._localStorageManager.getAmountOfSelectedDatasets() === 0 && this._sessionStorageManager.getAmountOfSelectedDatasets() === 0) {
            showInfo("You must select at least one dataset to start the analysis.");
        }

        let il = $("#il").prop("checked");
        let dupes = $("#dupes").prop("checked");
        let missed = $("#missed").prop("checked");

        $dataInput.val(JSON.stringify({
            settings: {
                il: il,
                dupes: dupes,
                missed: missed
            },
            local_storage: this._localStorageManager,
            session_storage: this._sessionStorageManager
        }));

    }

    renderLocalStorageItems() {
        let $body = $("#local-storage-datasets");
        $body.html("");
        this.enableProgressIndicators();

        this._localStorageManager.listDatasets()
            .then(allDatasets => {
                for (let i = 0; i < allDatasets.length; i++) {
                    $body.append(this.renderLocalStorageItem(allDatasets[i]));
                }
            })
            .catch(err => showError(err, "Something went wrong while loading your datasets. Check whether local storage is enabled and supported by your browser."))
            .then(() => this.enableProgressIndicators(false));
    }

    renderLocalStorageItem(dataset) {
        // Use jQuery to build elements to prevent XSS attacks
        let $listItem = $("<div class='list-item--two-lines'>");
        let $primaryAction = $("<span class='list-item-primary-action'>").append($("<span class='glyphicon glyphicon-plus select-dataset-button'>"));
        let $primaryContent = $("<span class='list-item-primary-content'>").text(dataset.getName());
        $primaryContent.append($("<span class='list-item-date'>").text(dataset.getDate()));
        let $primaryBody = $("<span class='list-item--two-lines list-item-body'>").text(dataset.getAmountOfPeptides() + " peptides");
        $primaryContent.append($primaryBody);
        $listItem.append($primaryAction);
        $listItem.append($primaryContent);
        $primaryAction.click(() => {
            this._localStorageManager.selectDataset(dataset.getId());
            this.addSelectedDataset(dataset);
        });
        return $listItem;
    }

    enableProgressIndicators(enable = true) {
        let $searchButton = $("#search_button");
        let $formProgress = $("#form-progress");

        $(".load-datasets-input-item")
            .prop('disabled', enable);

        if (enable) {
            $searchButton.addClass("hide");
            $formProgress.removeClass("hide");
        } else {
            $searchButton.removeClass("hide");
            $formProgress.addClass("hide");
        }
    }

    /**
     * Checks whether all required content is filled in and returns this checks result.
     *
     * @param {string} idPrefix Optional
     * @return {boolean} True when all required content is set by the user.
     */
    checkRequiredContent(idPrefix = "") {
        // First reset the previous checks
        this.enableError(false, "name", idPrefix);
        this.enableError(false, "qs", idPrefix);

        let $searchName = $("#" + idPrefix + "search_name");
        let $qs = $("#" + idPrefix + "qs");

        let result = true;

        if ($qs.val().trim() === "") {
            this.enableError(true, "qs", idPrefix);
            result = false;
        }

        if ($searchName.val().trim() === "") {
            this.enableError(true, "name", idPrefix);
            result = false;
        }

        return result;
    }

    enableError(state = true, fieldName, idPrefix = "") {
        let $inputGroup = $("#" + idPrefix + fieldName + "-input-group");
        let $helpBlock = $("#" + idPrefix + "help-block-" + fieldName);

        if (state) {
            $inputGroup.addClass("has-error");
            $helpBlock.removeClass("hidden");
        } else {
            $inputGroup.removeClass("has-error");
            $helpBlock.addClass("hidden");
        }
    }

    constructDatasetLoader() {
        let that = {};
        let outerScope = this;

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
            outerScope.enableProgressIndicators();
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
                outerScope.enableProgressIndicators(false);
            };

            let request = type === "internal" ? loadInternalDataset(id) : loadPrideDataset(id);
            request.then(done)
                .catch(fail)
                .then(always);
        };

        return that;
    }
}

export {LoadDatasetsCardManager};
