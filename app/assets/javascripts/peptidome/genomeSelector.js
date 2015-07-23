/**
 * Creates a GenomeSelector object that represents a filterable list of genomes
 *
 * @param <Array> args.data is an array of around 17k objects with this format:
 *          {"id":57587,"class_id":29547,"genus_id":194,
 *          "name":"Campylobacter jejuni","order_id":213849,"species_id":197}
 * @param <Hash> args.taxa is a list of key-value pairs mapping
 *          taxon id's to an object containing name and rank
 * @param <Map> args.genomes a map of genomes present in the analysis
 * @param <Pancore> args.pancore the pancore object
 * @return <GenomeSelector> that The constructed selectionTree object
 */
var constructGenomeSelector = function constructGenomeSelector(args) {
    /*************** Private variables ***************/

    var that = {},
        data = args.data,
        taxa = args.taxa,
        pancore = args.pancore,
        genomes = args.genomes,
        $popover,
        addAll = false,
        currentResults,
        currentPage,
        elementsShown = 50,
        SEARCH_VALUES = {
            complete : {attr: "assembly_level", value: "Complete Genome", name: "Complete genome"},
            scaffold : {attr: "assembly_level", value: "Scaffold", name: "Scaffold"},
            contig : {attr: "assembly_level", value: "Contig", name: "Contig"},
            chromosome : {attr: "assembly_level", value: "Chromosome", name: "Chromosome"},
            gaps : {attr: "assembly_level", value: "Chromosome with gaps", name: "Chromosome with gaps"},
            gapless : {attr: "assembly_level", value: "Gapless Chromosome", name: "Gapless chromosome"},
            full : {attr: "genome_representation", value: "full", name: "Full genome"},
            partial : {attr: "genome_representation", value: "partial", name: "Partial genome"},
            type : {attr: "type_strain", value: true, name: "Is a type strain"},
            notype : {attr: "type_strain", value: false, name: "Is not a type strain"}
        },
        classes = [],
        orders = [],
        genera = [],
        species = [];
    var lists = {
            "class" : classes,
            "order" : orders,
            "genus" : genera,
            "species" : species
        };

    /*************** Private methods ***************/

    /**
     * Initialize the genome Selector
     */
    function init() {
        initData();
        initTypeAhead();
        initSettings();
        initCheckAll();
        initAddAll();
        initPagination();

        search("");
    }

    /**
     * Prepares the data
     */
    function initData() {
        var item;
        data.sort(function (a, b) { return d3.ascending(a.name, b.name); });
        for (item in taxa) {
            lists[taxa[item].rank].push(item);
        }
        for (item in lists) {
            lists[item].sort(function (a, b) {
                return d3.ascending(taxa[a].name, taxa[b].name);
            });
        }
    }

    /**
     * Initializes the typeahead and token stuff
     */
    function initTypeAhead() {
        var taxaTokens = [],
            filterTokens = [],
            taxonId,
            filter,
            taxaEngine,
            filterEngine;
        for (taxonId in taxa) {
            taxaTokens.push({
                label: taxa[taxonId].name,
                value: "taxon:" + taxonId,
                rank: taxa[taxonId].rank
            });
        }
        taxaEngine = new Bloodhound({
            local: taxaTokens,
            limit: 10,
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace("label"),
            queryTokenizer: Bloodhound.tokenizers.whitespace
        });
        taxaEngine.initialize();

        for (filter in SEARCH_VALUES) {
            filterTokens.push({
                label: "is:" + filter,
                value: "is:" + filter,
                search: "is:" + filter + " " + filter + " " + SEARCH_VALUES[filter].value,
                obj: SEARCH_VALUES[filter]
            });
        }
        filterTokens.push({
            label: "not:added",
            value: "not:added",
            search: "not:added added",
            obj: {name: "not yet in analysis"}
        });
        filterEngine = new Bloodhound({
            local: filterTokens,
            limit: 10,
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace("search"),
            queryTokenizer: Bloodhound.tokenizers.whitespace
        });
        filterEngine.initialize();

        $("#genomeSelectorSearch").tokenfield({
            delimiter: " ",
            beautify: false,
            minWidth: 280,
            createTokensOnBlur: true,
            typeahead: [{
                hint: false,
                highlight: true
            }, {
                displayKey: 'label',
                source: filterEngine.ttAdapter(),
                templates: {
                    header: "<h4 class='dataset-header'>Filters</h4>",
                    suggestion: function (q) {
                        return "<p>" + q.label + " - <i class='small'>" + q.obj.name + "</i></p>";
                    }
                }
            }, {
                displayKey: 'label',
                source: taxaEngine.ttAdapter(),
                templates: {
                    header: "<h4 class='dataset-header'>Lineage</h4>",
                    suggestion: function (q) {
                        return "<p>" + q.label + " - <i class='small'>" + q.rank + "</i></p>";
                    }
                }
            }]
        })
            .on('tokenfield:createtoken', function (e) {
                var parts = e.attrs.value.split(":"),
                    taxonId,
                    tokens;
                // not a special token, yet
                if (parts.length === 1) {
                    // the name is a taxon name
                    taxonId = getTaxonId($("#genomeSelectorSearch-tokenfield").val());
                    if (taxonId !== -1) {
                        e.attrs.value = "taxon:" + taxonId;
                        e.attrs.label = taxa[taxonId].name;
                        parts[0] = "taxon";
                        parts[1] = taxonId;
                        $("#genomeSelectorSearch-tokenfield").val("");
                    } else {
                        $("#genomeSelectorSearch-tokenfield")
                            .val($("#genomeSelectorSearch-tokenfield").val() + " ");
                        return false;
                    }
                }
                if (parts.length === 2) {
                    // remove tokens of same kind
                    tokens = $("#genomeSelectorSearch").tokenfield('getTokens');
                    tokens = tokens.filter(function (token) {
                        var tokenSplit = token.value.split(":");
                        if (parts[0] !== tokenSplit[0]) {
                            return true;
                        }
                        if (parts[0] === "taxon") {
                            return tokenSplit[0] !== "taxon";
                        }
                        if (SEARCH_VALUES[parts[1]]) {
                            return SEARCH_VALUES[tokenSplit[1]] &&
                                SEARCH_VALUES[tokenSplit[1]].attr !== SEARCH_VALUES[parts[1]].attr;
                        }
                    });
                    $("#genomeSelectorSearch").tokenfield('setTokens', tokens);
                    if (parts[1] === "any") return false;
                }
            })
            .on('tokenfield:createdtoken', function (e) {
                var parts = e.attrs.value.split(":");
                if (parts[0] === "taxon") {
                    $(e.relatedTarget).addClass('token-taxon');
                } else if (parts[0] === "is") {
                    if (SEARCH_VALUES[parts[1]]) {
                        $(e.relatedTarget).addClass('token-filter');
                    } else {
                        $(e.relatedTarget).addClass('invalid');
                    }
                } else if (parts[0] === "not") {
                    if (parts[1] !== "added") {
                        $(e.relatedTarget).addClass('invalid');
                    }
                }
                keyUpped(true);
            })
            .on('tokenfield:edittoken', function (e) {
                e.attrs.value = e.attrs.label;
            })
            .on('tokenfield:removedtoken', function () {
                keyUpped(true);
            });

        $("#genomeSelectorSearch-tokenfield").keyup(function () {
            keyUpped(false);
        });

        // chrome makes the input fields a few pixels too winde on initial render
        if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
            $("#genomeSelector .tokenfield").css("width", "333px");
        }

        function keyUpped(direct) {
            updateFilters();
            var list = $("#genomeSelectorSearch").tokenfield('getTokensList');
            list += " " + $("#genomeSelectorSearch-tokenfield").val();
            search(list, direct);
        }
    }

    /**
     * Initializes the search settings popover
     */
    function initSettings() {
        $(".search-settings").popover({
            html : true,
            trigger : "manual",
            title: "Filter settings",
            content: createContent,
            container: "body"
        });

        // enable settings button
        $(".search-settings").click(function () {
            if (!$popover) {
                $(".search-settings").popover("show");
            } else {
                repositionPopover();
                $popover.toggleClass("hide");
            }
            updateFilters();
        });

        // add pop-over behaviour
        $(".search-settings").on("shown.bs.popover", initPopoverBehaviour);

        // creates the html content for the popover
        function createContent() {
            var ranks = ["class", "order", "genus", "species"],
                content = "<form class='form-horizontal'>",
                option;
            // assembly level
            content += "<div class='form-group'>";
            content += "<label for='assemblyLevel' class='control-label col-sm-4'>Assembly level</label>";
            content += "<div class='col-sm-8'><select class='form-control' id='assemblyLevel' name='assemblyLevel'>";
            content += "<option value='is:any'>Any</option>";
            for (option in SEARCH_VALUES) {
                if (SEARCH_VALUES[option].attr === "assembly_level") {
                    content += "<option value='is:" + option + "'>" + SEARCH_VALUES[option].value + "</option>";
                }
            }
            content += "</select></div>";
            content += "</div>";

            // genome representation
            content += "<div class='form-group'>";
            content += "<label for='genomeRepresentation' class='control-label col-sm-4' style='margin-top: -10px'>Genome representation</label>";
            content += "<div class='col-sm-8'><select class='form-control' id='genomeRepresentation' name='genomeRepresentation'>";
            content += "<option value='is:any'>Any</option>";
            for (option in SEARCH_VALUES) {
                if (SEARCH_VALUES[option].attr === "genome_representation") {
                    content += "<option value='is:" + option + "'>" + SEARCH_VALUES[option].name + "</option>";
                }
            }
            content += "</select></div>";
            content += "</div>";

            // type strain
            content += "<div class='form-group'>";
            content += "<div class='col-sm-offset-4 col-sm-8'><div class='checkbox'>";
            content += "<label><input type='checkbox' id='typeStrain'> Only show <strong>type strains</strong></label>";
            content += "</div></div></div>";

            // analyzed
            content += "<div class='form-group'>";
            content += "<div class='col-sm-offset-4 col-sm-8'><div class='checkbox'>";
            content += "<label><input type='checkbox' id='inAnalysis'> Don't show already in analysis</label>";
            content += "</div></div></div>";


            content += "<div class='form-group'><b class='control-label col-sm-4'>Taxonomy</b></div>";

            ranks.forEach(function (rank) {
                var id = rank + "Id";
                content += "<div class='form-group'>";
                content += "<label for='" + id + "' class='control-label col-sm-4'>" + rank.capitalizeFirstLetter() + "</label>";
                content += "<div class='col-sm-8'><select class='form-control taxon-select' id='" + id + "' name='" + id + "'>";
                content += "<option value='taxon:any'>Any</option>";
                lists[rank].forEach(function (taxon) {
                    content += "<option value='taxon:" + taxon + "'>" + taxa[taxon].name + "</option>";
                });
                content += "</select></div>";
                content += "</div>";
            });

            content += "</form>";
            return content;
        }

        function repositionPopover() {
            if (!$popover) return;

            var fullScreen = $(".full-screen-container").hasClass("full-screen");
            if (fullScreen) {
                $popover.appendTo(".full-screen-container");
            } else {
                $popover.appendTo("body");
            }
            var buttonOffset = $(".search-settings").offset(),
                containerOffset = fullScreen ? $(".full-screen-container").offset() : $("body").offset();
            $popover.css("z-index", 10);
            $popover.css("left", buttonOffset.left - containerOffset.left + 45);
            $popover.css("top", Math.max(0, buttonOffset.top - containerOffset.top - 215));
            $popover.find(".arrow").css("top", fullScreen ? "42%" : "50%");
        }

        function initPopoverBehaviour() {
            $popover = $(".popover-content #assemblyLevel").parents(".popover");
            $popover.css("max-width", "none");

            repositionPopover();

            // add pop-over hide behaviour
            $(document).click(function (e) {
                if ($popover &&
                        !$popover.hasClass("hide") &&
                        !$popover.get(0).contains(e.target) &&
                        !$(".search-settings").get(0).contains(e.target)) {
                    $popover.addClass('hide');
                }
            });

            // add event listeners
            $popover.find("select").change(function () {
                var val = $(this).val();
                if (val.indexOf("taxon:") === 0 && val !== "taxon:any") {
                    $("#genomeSelectorSearch").tokenfield('createToken', {
                        value: val,
                        label: taxa[val.split(":")[1]].name
                    });
                } else {
                    $("#genomeSelectorSearch").tokenfield('createToken', val);
                }

            });
            addCheckboxListener("#typeStrain", "is:type");
            addCheckboxListener("#inAnalysis", "not:added");

            function addCheckboxListener(id, filter) {
                $(id).change(function () {
                    if ($(this).prop('checked')) {
                        $("#genomeSelectorSearch").tokenfield('createToken', filter);
                    } else {
                        var tokens = $("#genomeSelectorSearch").tokenfield('getTokens');
                        tokens = tokens.filter(function (token) {
                            return token.value !== filter;
                        });
                        $("#genomeSelectorSearch").tokenfield('setTokens', tokens);
                    }
                });
            }

            updateFilters();
        }
    }

    /**
     * Initializes the check all button on the top of the table
     */
    function initCheckAll() {
        $("#genomeSelector .check-all").change(function () {
            $("#genomeSelector .check").prop('checked', this.checked);
        });
    }

    /**
     * Initializes the add all button on the top of the table
     */
    function initAddAll() {
        $("#genomeSelector .btn-add-all").click(function () {
            // get checked boxes
            var $boxes = $(".check:checked");
            var genomes;
            if ($boxes.length === 0) {
                $boxes = $(".check");
            }

            // get genomes
            genomes = $boxes.closest("tr").map(function (i, e) {
                return getGenome($(e));
            }).get();

            // add everything
            pancore.addGenomes(genomes);
        });
    }

    /**
     * Initializes the pagination links
     */
    function initPagination() {
        $(".prev-page").click(function () {
            drawList(currentResults, currentPage - 1);
        });
        $(".next-page").click(function () {
            drawList(currentResults, currentPage + 1);
        });
    }

    /**
     * Updates the form in the popover to correspond with the tokens currently
     * present in the search box
     */
    function updateFilters() {
        if (!$popover) return;
        if ($popover.hasClass("hide")) return;

        $popover.find("#assemblyLevel").val("is:any");
        $popover.find("#genomeRepresentation").val("is:any");
        $popover.find(".taxon-select").val("taxon:any");
        $("#typeStrain").prop('checked', false);
        $("#inAnalysis").prop('checked', false);

        var tokens = $("#genomeSelectorSearch").tokenfield('getTokens');
        tokens.forEach(function (token) {
            var parts = token.value.split(":");
            if (parts.length === 2) {
                if (token.value === "is:type") {
                    $("#typeStrain").prop('checked', true);
                } else if (token.value === "not:added") {
                    $("#inAnalysis").prop('checked', true);
                } else if (parts[0] === "is") {
                    if (SEARCH_VALUES[parts[1]].attr === "assembly_level") {
                        $popover.find("#assemblyLevel").val(token.value);
                    } else if (SEARCH_VALUES[parts[1]].attr === "genome_representation") {
                        $popover.find("#genomeRepresentation").val(token.value);
                    }
                } else if (parts[0] === "taxon") {
                    $popover.find("#" + taxa[parts[1]].rank + "Id").val(token.value);
                }
            }
        });
    }

    /**
     * Filters all genomes for the given search query
     *
     * @param <String> searchString The string to search for
     * @param <Boolean> direct Whether to search now, or wait 500 ms.
     */
    function search(searchString, direct) {
        var wait = direct ? 0 : 500;
        delay(function doSearch() {
            var tokens = searchString.toLowerCase().split(" "),
                metaTokens = [],
                textTokens = [],
                results = data;
            tokens.forEach(function (token) {
                if (token.indexOf(":") !== -1) {
                    metaTokens.push(token);
                } else {
                    textTokens.push(token);
                }
            });
            metaTokens.forEach(function filter(token) {
                var meta = token.split(":");
                if (meta[0] === "taxon") {
                    var id = +(meta[1]);
                    results = results.filter(function (element) {
                        return element[taxa[id].rank + "_id"] === id;
                    });
                } else if (meta[0] === "not") {
                    results = results.filter(function (element) {
                        return !genomes.has(element.id);
                    });
                } else {
                    if (meta[0] === "is" && SEARCH_VALUES[meta[1]]) {
                        results = results.filter(function (element) {
                            return element[SEARCH_VALUES[meta[1]].attr] === SEARCH_VALUES[meta[1]].value;
                        });
                    }
                }
            });
            textTokens.forEach(function filter(token) {
                results = results.filter(function (element) {
                    return element.name.toLowerCase().indexOf(token) !== -1;
                });
            });
            drawList(results);
        }, wait);
    }

    /**
     * Draws a table based on the results array
     */
    function drawList(results, page) {
        var $resultTable = $("#genomeSelector-results"),
            resultString = "";

        currentResults = results;
        page = page || 0;
        currentPage = page;

        var firstElement = page * elementsShown,
            lastElement = Math.min((page + 1) * elementsShown, results.length);

        var selectedResults = results.slice(firstElement, lastElement);
        if (selectedResults.length === 0) {
            $resultTable.find(".result-count").text("Showing 0 results");
        } else {
            $resultTable.find(".result-count")
                .text("Showing " + (firstElement + 1) + "-" + lastElement + " of " + results.length);
        }

        // uncheck checkbox
        $("#genomeSelector .check-all").prop("checked", false);

        // enable/disable pagination
        $(".prev-page").prop("disabled", page === 0);
        $(".next-page").prop("disabled", lastElement === results.length);

        // build table
        selectedResults.forEach(function (result) {
            resultString += "<tr class='genome' data-id='" + result.id + "'>";
            resultString += "<td><input type='checkbox' class='check'></input></td>";
            resultString += "<td>" + result.name + "<br>";
            resultString += "<span class='lineage'>" + getLineage(result) + "</span></td>";
            resultString += "<td><button class='btn btn-default btn-xs btn-add' title='add proteome to analysis'><span class='glyphicon glyphicon-plus'></span></button></td>";
            resultString += "</tr>";
        });
        $resultTable.find("tbody").html(resultString);

        // hook up plus buttons
        $resultTable.find(".btn-add").click(function () {
            var genome = getGenome($(this).closest("tr"));
            pancore.addGenomes([genome]);
            return false;
        });

        // hook up lineage links
        $resultTable.find(".lineage-link").click(function () {
            var id = $(this).data("id");
            $("#genomeSelectorSearch").tokenfield('createToken', {
                value: "taxon:" + id,
                label: taxa[id].name,
                rank: taxa[id].rank
            });
            return false;
        });

        // disable fix checkboxes
        $resultTable.find(".check").click(function (e) {
            e.stopPropagation();
        });

        // make rows clickable
        $resultTable.find(".check").closest("tr").click(function () {
            var $checkbox = $(this).find(".check");
            $checkbox.prop('checked', !$checkbox.prop('checked'));
            return false;
        });

        // add after search?
        if (addAll) {
            addAll = false;
            $("#genomeSelector .btn-add-all").click();
        }
    }

    /**
     * Converts a table row to a usable genome object
     *
     * @param <jQuery> $row jQuery object of the row to convert
     */
    function getGenome($row) {
        var id = $row.data("id");
        return {name : pancore.getGenome(id).name, id : id};
    }

    /**
     * Returns the lineage of the given organism as a string containing links
     * to each of the ranks.
     *
     * @param <Organism> organism The organism to create the lineage for
     */
    function getLineage(organism) {
        var ranks = ["class_id", "order_id", "genus_id", "species_id"],
            result = [];
        ranks.forEach(function (rank) {
            if (organism[rank] !== null && organism[rank] > 0) {
                result.push(createLink(organism[rank]));
            }
        });
        return result.join(" / ");

        function createLink(taxonId) {
            var name = taxa[taxonId].name;
            return "<a href='#' class='lineage-link' title=\"Show all " + name + "\" data-id='" + taxonId + "'>" + name + "</a>";
        }
    }

    /**
     * Searches through the list of species if it contains the given name and
     * returns the taxonId if it does. Returns -1 in the other case.
     *
     * @param <String> name The name to search for
     */
    function getTaxonId(name) {
        var id;
        for (id in taxa) {
            if (taxa[id].name.toLowerCase() === name.toLowerCase().trim() &&
                    taxa[id].rank !== "genus") {
                return id;
            }
        }
        return -1;
    }

    /*************** Public methods ***************/

    /**
     * Handles the transition from and to fullscreen mode
     *
     * @param <Boolean> isFullScreen Is the page in full screen mode?
     */
    that.setFullScreen = function setFullScreen(isFullScreen) {
        // the delay is because the event fires before we're in fullscreen
        // so the height en width functions don't give a correct result
        // without the delay
        setTimeout(function () {
            if (isFullScreen) {
                $(".proteome-library").appendTo(".full-screen-container");
                elementsShown = Math.floor(($(window).height() - 260 - 44) / 45);
            } else {
                $(".proteome-library").prependTo(".proteome-adder");
                elementsShown = 50;
            }
            drawList(currentResults);
        }, 1000);
    };

    /**
     * Searches for all complete Acinetobacter baumannii proteomes and adds them
     */
    that.demo = function demo() {
        addAll = true;
        $("#genomeSelectorSearch").tokenfield('setTokens', [
            {"value":"is:complete","label":"is:complete"},
            {"label":"Acinetobacter baumannii","value":"taxon:470"}
        ]);
    };


    // initialize the object
    init();

    return that;
};
