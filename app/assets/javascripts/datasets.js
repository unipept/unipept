function initDatasets() {
    var datasetLoader = constructDatasetLoader(),
        numFiles = 1,
        fileContent = [];

    // enable tooltips
    $(".js-has-hover-tooltip").tooltip({
        container: "body",
        placement: "right"
    });
    $(".js-has-focus-tooltip").tooltip({
        trigger: "focus",
        container: "body",
        placement: "right"
    });

    // enable file chooser
    $("#myPeptideFile").on('change', function () {
        numFiles = $(this).get(0).files ? $(this).get(0).files.length : 1;
        var $input = $(this),
            label = $input.val().replace(/\\/g, '/').replace(/.*\//, ''),
            multi = numFiles > 1,
            log = multi ? numFiles + ' files selected' : label;
        $input.parents('.input-group').find(':text').val(log);

        // change controller
        if (numFiles > 1) {
            $("form").attr("action", '/search/comparison')
            //$("#search-multi-form").attr('type', 'button')
        };
    });

    // resetting input fasta files
    $("#removeFiles").click(function () {
        // reset field by removing the files
        $(".input-group").find(':text').val("");
        document.getElementById("myPeptideFile").value = "";
        $("form").attr("action", '/search/sequences')

        // reset controller
        //$("#search-multi-form").attr('type', 'submit')

    });

    function intersection(a, b) {
        var r = [],
            i = 0,
            j = 0;
        while (i < a.length && j < b.length) {
            if (a[i] < b[j]) {
                i++;
            } else if (a[i] > b[j]) {
                j++;
            } else {
                r.push(a[i]);
                i++;
                j++;
            }
        }
        return r;
    };

    function difference(a, b) {
        var d = [],
            i = 0,
            j = 0;
        while (i < a.length || j < b.length) {
            if (a[i] < b[j] || j === b.length) {
                d.push(a[i]);
                i++;
            } else if (a[i] > b[j] || i === a.length) {
                d.push(b[j]);
                j++;
            } else {
                i++;
                j++;
            }
        }
        return d;
    };

    function intersectionDifference(a, b) {
        var r = [],
            d1 = [],
            d2 = [],
            i = 0,
            j = 0;
        while (i < a.length || j < b.length) {
            if (a[i] < b[j] || j === b.length) {
                d1.push(a[i]);
                i++;
            } else if (a[i] > b[j] || i === a.length) {
                d2.push(b[j]);
                j++;
            } else {
                r.push(a[i]);
                i++;
                j++;
            }
        }
        return [r, d1, d2];
    };

    /**
     * Reads a given file and returns its content as a Promise
     */
    function readFile(file) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function (e) {
                resolve(reader.result);
            };
            reader.readAsText(file);
        });
    }

    /**
     * Process a list of files
     */
    function handleFiles(dataFiles) {
        var i = 1,
            totalFiles = dataFiles.length;
        return dataFiles.reduce(function (promise, data) {
            return promise.then(function () {
               return readFile(data.file);
            }).then(function (content) {
                fileContent.push(content.split('\n').sort())
                return fileContent;
            });
        }, Promise.resolve());
    }

    // process peptide files
    $("#processPeptideFiles").on('click', function () {
        if (numFiles > 1) {
            var files = document.getElementById('myPeptideFile').files,
                dataFiles = [],
                processedFiles = [];
            for (var i=0, f; f=files[i]; i++) {
                dataFiles.push({name: files[i].name, file: files[i]});
            }
            handleFiles(dataFiles).then(function() {
                // nested lists: intersection, difference file 1, difference file 2
                processedFiles = intersectionDifference(fileContent[0], fileContent[1])
                var jsonObj = '{ "intersect": "' + processedFiles[0] +
                        '", "' + dataFiles[0].name.split('.').slice(0, -1).join('.') + '": "' + processedFiles[1] +
                        '", "' + dataFiles[1].name.split('.').slice(0, -1).join('.') + '": "' + processedFiles[2] +
                        '" }';
                document.getElementById('qc').value = jsonObj;

                /** Future update when more then 2 files can be selected
                 * intersect = intersection(fileContent[0], fileContent[1])
                 * for (var y=0; y<fileContent.length; y++) {
                 *    diff.push(difference(fileContent[y], intersect))
                }*/
            });
        }
    });

    // add progress bar when submitting form
    $("#search-multi-form").click(function () {
        $("#search_button").hide();
        $("#form-progress").removeClass("hide");
        showNotification("Sending peptides...", {
            autoHide: false,
            loading: true
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
    $(".load-pride").click(loadPride);
    $("#pride_exp_id").keypress(function (event) {
        if (event.which == '13') {
            loadPride();
        }
    });

    function loadPride() {
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
    }
}

function initPreload(type, id) {
    var datasetLoader = constructDatasetLoader();
    $("#pride-progress").appendTo(".card-supporting-text");

    if (type === "database") {
        datasetLoader.loadDataset("internal", id, "Dataset " + id);
    } else {
        datasetLoader.loadDataset("pride", id, "Pride assay " + id);
    }
}

function constructDatasetLoader() {
    var that = {};

    /************** private methods *************/

    /**
     * Returns a list of peptides from an internal dataset as a promise
     *
     * @param <Integer> id The id of the dataset(item) we want to load
     */
    function loadInternalDataset(id) {
        return get("/dataset_items/" + id);
    }

    /**
     * Returns a list of peptide from a pride experiment as a promise
     *
     * @param <Integer> id The id of the assay we want to load
     */
    function loadPrideDataset(id) {
        var batchSize = 1000,
            peptides = [],
            e;

        $("#pride-progress").show("fast");
        $("#pride-progress .progress-bar").css("width", "10%");

        return get("http://www.ebi.ac.uk:80/pride/ws/archive/peptide/count/assay/" + id).then(function(datasetSize) {
            var urls = [],
                page;
            for (page = 0; page * batchSize < datasetSize; page++) {
                urls.push("http://www.ebi.ac.uk:80/pride/ws/archive/peptide/list/assay/" + id + "?show=" + batchSize + "&page=" + page);
            }
            page = 0;
            return urls.map(getJSON)
                .reduce(function (sequence, batchPromise) {
                    return sequence.then(function () {
                        return batchPromise;
                    }).then(function (response) {
                        page++;
                        $("#pride-progress .progress-bar").css("width", 10 + (90 * page * batchSize) / datasetSize + "%");
                        peptides = peptides.concat(response.list.map(function (d) {return d.sequence; }));
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


    /************** public methods *************/

    /**
     * Checks if the number of peptides in the current dataset isn't too high
     * and displays a warning if it is.
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

    /**
     * Public method to load a dataset
     *
     * @param <String> type The type of the dataset to load: internal or pride
     * @param <Integer> id The id of the dataset to load
     * @param <String> name The name of the dataset
     * @param <DOM element> button The button that was clicked to load the
     *          dataset. Can be nil.
     */
    that.loadDataset = function loadDataset(type, id, name, button) {
        // expand the search options and prepare the form
        $("#qs").val("Please wait while we load the dataset...");
        $("#qs").attr('disabled', 'disabled');
        $("#search-multi-form").button("loading");
        var startTimer = new Date().getTime();
        var toast = showNotification("Loading dataset...", {
            autoHide: false,
            loading: true
        });

        var done = function (data) {
            // track the load times
            var loadTime = new Date().getTime() - startTimer;
            logToGoogle("Datasets", "Loaded", name, loadTime);

            // fill in the data
            $("#search_name").val(name);
            $("#qs").val(data);
            that.checkDatasetSize();

            // highlight what happend to the user
            highlight("#qs");
            highlight("#search_name");
        };

        var fail = function (error) {
            // track is something goes wrong
            logToGoogle("Datasets", "Failed", name, error);

            // reset the form elements
            $("#qs").val("");

            // highlight what pappend to the user
            error(error, "Something went wrong while loading the datasets.");
            $('html, body').animate({
                scrollTop: $("#messages").offset().top
            }, 1000);
        };

        var always = function () {
            // enable the form elements
            $("#qs").attr('disabled', false);
            $("#search-multi-form").button("reset");
            if (button) {
                button.button('reset');
            }
            toast.hide();
        };

        var request = type === "internal" ? loadInternalDataset(id) : loadPrideDataset(id);
        request.then(done)
              .catch(fail)
              .then(always);
    };

    return that;
}
