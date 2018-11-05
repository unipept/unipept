import {showNotification} from "./../notifications.js";
import {DatasetManager} from "./../mpa/datasetManager.js";
import {get, getJSON, highlight, logToGoogle, showError, showInfo} from "./../utils.js";
import {LOCAL_STORAGE_TYPE, SESSION_STORAGE_TYPE} from "./../mpa/storageTypeConstants";

/* eslint-disable require-jsdoc */

class LoadDatasetsCardManager {
    /**
     * @param {DatasetManager} localStorageManager A DatasetManager whose storage type is set to local_storage.
     * @param {DatasetManager} sessionStorageManager A DatasetManager whose storage type is set to session_storage.
     */
    constructor(localStorageManager, sessionStorageManager) {
        this._localStorageManager = localStorageManager;
        this._sessionStorageManager = sessionStorageManager;

        this.renderLocalStorageItems();
        this.initializeDatasetLoader();
    }

    /**
     * @param listener A function with two parameters that's called whenever the rendering of datasets starts. This
     *        listener should be used to clear previously rendered datasets in the GUI.
     *        Parameters: * localStorageManager
     *                    * sessionStorageManager
     *
     */
    setClearRenderedDatasetsListener(listener) {
        this._clearRenderedDatasetsListener = listener;
    }

    _clearRenderedDatasets() {
        if (this._clearRenderedDatasetsListener) {
            this._clearRenderedDatasetsListener(this._localStorageManager, this._sessionStorageManager);
        }
    }

    /**
     * @param listener A function with one parameters that's called when a dataset should be rendered. The parameter is
     *        the dataset that should be rendered.
     */
    setRenderSelectedDataset(listener) {
        this._renderSelectedDatasetListener = listener;
    }

    _renderSelectedDataset(dataset) {
        if (this._renderSelectedDatasetListener) {
            this._renderSelectedDatasetListener(dataset, () => {
                this._localStorageManager.selectDataset(dataset.getId(), false);
                this._sessionStorageManager.selectDataset(dataset.getId(), false);
                this.renderSelectedDatasets();
            });
        }
    }

    renderSelectedDatasets() {
        this.enableProgressIndicators();
        this._clearRenderedDatasets();

        Promise.all([this._localStorageManager.getSelectedDatasets(), this._sessionStorageManager.getSelectedDatasets()])
            .then(values => {
                let selectedDatasets = values[0].concat(values[1]);
                for (let selectedDataset of selectedDatasets) {
                    this._renderSelectedDataset(selectedDataset, () => {
                        this._localStorageManager.selectDataset(selectedDataset.getId(), false);
                        this._sessionStorageManager.selectDataset(selectedDataset.getId(), false);
                        this.renderSelectedDatasets();
                    });
                }
            })
            .catch(err => showError(err, "Something went wrong while selecting some datasets. Check whether local storage is enabled and supported by your browser."))
            .then(() => this.enableProgressIndicators(false));

        this.enableProgressIndicators(false);
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
            this.renderSelectedDatasets();
            this.showSelectedDatasetsPlaceholder();
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
        this.enableSearchNameError(false, idPrefix);
        this.enableProgressIndicators();

        let $searchName = $("#" + idPrefix + "search_name");
        let $saveDataSetCheckbox = $("#" + idPrefix + "save_dataset");

        let searchName = $searchName.val();
        let save = $saveDataSetCheckbox.prop("checked");

        if (save && searchName === "") {
            this.enableSearchNameError(true, idPrefix);
        } else {
            let peptides = $("#qs").val().replace(/\r/g,"").split("\n");
            let storageManager = save ? this._localStorageManager : this._sessionStorageManager;

            storageManager.storeDataset(peptides, searchName)
                .then((dataset) => {
                    storageManager.selectDataset(dataset.getId());
                    this.renderSelectedDatasets();
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
        let $primaryAction = $("<span class='list-item-primary-action'>").append($("<span class='glyphicon glyphicon-arrow-left select-dataset-button'>"));
        let $primaryContent = $("<span class='list-item-primary-content'>").text(dataset.getName());
        $primaryContent.append($("<span class='list-item-date'>").text(dataset.getDate()));
        let $primaryBody = $("<span class='list-item--two-lines list-item-body'>").text(dataset.getAmountOfPeptides() + " peptides");
        $primaryContent.append($primaryBody);
        $listItem.append($primaryAction);
        $listItem.append($primaryContent);
        $primaryAction.click(() => {
            this._localStorageManager.selectDataset(dataset.getId());
            this.renderSelectedDatasets();
        });
        return $listItem;
    }

    enableProgressIndicators(enable = true) {
        let $searchButton = $("#search_button");
        let $formProgress = $("#form-progress");

        $(".load-datasets-input-item")
            .prop('disabled', enable);

        if (enable) {
            $searchButton.hide();
            $formProgress.removeClass("hide");
        } else {
            $searchButton.show();
            $formProgress.addClass("hide");
        }
    }

    enableSearchNameError(state = true, idPrefix = "") {
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

    showSelectedDatasetsPlaceholder() {
        $("#selected-datasets-list").append($("<span>Please select one or more datasets from the right hand panel to continue the analysis...</span>"));
    }

    constructDatasetLoader() {
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
}

export {LoadDatasetsCardManager};
