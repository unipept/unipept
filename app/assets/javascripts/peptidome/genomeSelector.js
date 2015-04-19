/**
 * Creates a GenomeSelector object that represents a filterable list of genomes
 *
 * @param <Array> args.data is an array of around 17k objects with this format:
 *          {"id":57587,"class_id":29547,"genus_id":194,
 *          "name":"Campylobacter jejuni","order_id":213849,"species_id":197}
 * @param <Hash> args.taxa is a list of key-value pairs mapping
 *          taxon id's to an object containing name and rank
 * @return <GenomeSelector> that The constructed selectionTree object
 */
var constructGenomeSelector = function constructGenomeSelector(args) {
    /*************** Private variables ***************/

    var that = {},
        data = args.data,
        taxa = args.taxa,
        pancore = args.pancore,
        ELEMENTS_SHOWN = 10,
        SEARCH_VALUES = {
            complete : {attr: "assembly_level", value: "Complete Genome", name: "Complete genome"},
            scaffold : {attr: "assembly_level", value: "Scaffold", name: "Scaffold"},
            contig : {attr: "assembly_level", value: "Contig", name: "Contig"},
            chromosome : {attr: "assembly_level", value: "Chromosome", name: "Chromosome"},
            gaps : {attr: "assembly_level", value: "Chromosome with gaps", name: "Chromosome with gaps"},
            gapless : {attr: "assembly_level", value: "Gapless Chromosome", name: "Gapless chromosome"}
        },
        classes = [],
        orders = [],
        genera = [],
        species = [];

    /*************** Private methods ***************/

    /**
     * Initialize the genome Selector
     */
    function init() {
        data.sort(function (a, b) { return d3.ascending(a.name, b.name) });
        for (var taxon in taxa) {
            if (taxa[taxon].rank === "class") classes.push(taxon);
            else if (taxa[taxon].rank === "order") orders.push(taxon);
            else if (taxa[taxon].rank === "genus") genera.push(taxon);
            else if (taxa[taxon].rank === "species") species.push(taxon);
        }
        classes.sort(function (a, b) { return d3.ascending(taxa[a].name, taxa[b].name) });
        orders.sort(function (a, b) { return d3.ascending(taxa[a].name, taxa[b].name) });
        genera.sort(function (a, b) { return d3.ascending(taxa[a].name, taxa[b].name) });
        species.sort(function (a, b) { return d3.ascending(taxa[a].name, taxa[b].name) });

        initTypeAhead();
        initSettings();
        initCheckAll();
        initAddAll();

        // we have to wait till everything is painted because there's a bug
        // that miscalculates the width otherwise
        requestAnimationFrame(function () {
            $("#genomeSelectorSearch").tokenfield('createToken', 'is:complete');
        });

    }

    /**
     * Initializes the typeahead and token stuff
     */
    function initTypeAhead() {
        var taxaTokens = [];
        for (var taxonId in taxa) {
            taxaTokens.push({
                label: taxa[taxonId].name,
                value: "taxon:" + taxonId,
                rank: taxa[taxonId].rank
            });
        }
        var taxaEngine = new Bloodhound({
          local: taxaTokens,
          limit: 10,
          datumTokenizer: Bloodhound.tokenizers.obj.whitespace("label"),
          queryTokenizer: Bloodhound.tokenizers.whitespace
        });
        taxaEngine.initialize();

        var filterTokens = [];
        for (var filter in SEARCH_VALUES) {
            filterTokens.push({
                label: "is:" + filter,
                value: "is:" + filter,
                search: "is:" + filter + " " + filter + " " + SEARCH_VALUES[filter].value,
                obj: SEARCH_VALUES[filter]
            });
        }
        var filterEngine = new Bloodhound({
          local: filterTokens,
          limit: 10,
          datumTokenizer: Bloodhound.tokenizers.obj.whitespace("search"),
          queryTokenizer: Bloodhound.tokenizers.whitespace
        });
        filterEngine.initialize();

        $("#genomeSelectorSearch").tokenfield({
            delimiter: " ",
            beautify: false,
            minWidth: 130,
            createTokensOnBlur: true,
            typeahead: [{
                hint: false,
                highlight: true
            }, {
                displayKey: 'label',
                source: filterEngine.ttAdapter(),
                templates: {
                    header: "<h4 class='header'>Filters</h4>",
                    suggestion: function (q) {
                        return "<p>" + q.label + " – <i class='small'>" + q.obj.name + "</i></p>";
                    }
                }
            }, {
                displayKey: 'label',
                source: taxaEngine.ttAdapter(),
                templates: {
                    header: "<h4 class='header'>Lineage</h4>",
                    suggestion: function (q) {
                        return "<p>" + q.label + " – <i class='small'>" + q.rank + "</i></p>";
                    }
                }
            }]
        })
        .on('tokenfield:createtoken', function (e) {
            var parts = e.attrs.value.split(":");
            if (parts.length === 2) {
                // remove tokens of same kind
                var tokens = $("#genomeSelectorSearch").tokenfield('getTokens');
                tokens = tokens.filter(function (token) {
                    return token.value.indexOf(parts[0] + ":") !== 0;
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
            }
            keyUpped(true);
        })
        .on('tokenfield:removedtoken', function (e) {
            keyUpped(true);
        });

        $("#genomeSelectorSearch-tokenfield").keyup(function () {
            keyUpped(false);
        });

        function keyUpped(direct) {
            var list = $("#genomeSelectorSearch").tokenfield('getTokensList');
            list += " " + $("#genomeSelectorSearch-tokenfield").val();
            search(list, direct);
        }
    }

    /**
     * Initializes the search settings popover
     */
    function initSettings() {
        var $popover;

        // set up the form
        var content =
        $("#genomeSelector-popover-content");

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
                $popover.toggleClass("hide");
            }
        });

        // add pop-over behaviour
        $(".search-settings").on("shown.bs.popover", initPopoverBehaviour);

        function createContent() {
            var content = "<form>";
            // assembly level
            content += "<div class='form-group'>";
            content += "<label for='assemblyLevel' class='control-label'>Assembly level</label>";
            content += "<select class='form-control' id='assemblyLevel' name='assemblyLevel'>";
            content += "<option value='is:any'>Any</option>";
            for (var option in SEARCH_VALUES) {
                content += "<option value='is:" + option + "'>" + SEARCH_VALUES[option].value + "</option>";
            }
            content += "</select>"
            content += "</div>";

            // classes
            content += "<div class='form-group'>";
            content += "<label for='classId' class='control-label'>Class</label>";
            content += "<select class='form-control' id='classId' name='classId'>";
            content += "<option value='taxon:any'>Any</option>";
            classes.forEach(function (taxon) {
                content += "<option value='taxon:" + taxon + "'>" + taxa[taxon].name + "</option>";
            });
            content += "</select>"
            content += "</div>";

            // orders
            content += "<div class='form-group'>";
            content += "<label for='orderId' class='control-label'>Order</label>";
            content += "<select class='form-control' id='orderId' name='orderId'>";
            content += "<option value='taxon:any'>Any</option>";
            orders.forEach(function (taxon) {
                content += "<option value='taxon:" + taxon + "'>" + taxa[taxon].name + "</option>";
            });
            content += "</select>"
            content += "</div>";

            // genera
            content += "<div class='form-group'>";
            content += "<label for='genusId' class='control-label'>Genus</label>";
            content += "<select class='form-control' id='genusId' name='genusId'>";
            content += "<option value='taxon:any'>Any</option>";
            genera.forEach(function (taxon) {
                content += "<option value='taxon:" + taxon + "'>" + taxa[taxon].name + "</option>";
            });
            content += "</select>"
            content += "</div>";

            // species
            content += "<div class='form-group'>";
            content += "<label for='speciesId' class='control-label'>Species</label>";
            content += "<select class='form-control' id='speciesId' name='speciesId'>";
            content += "<option value='taxon:any'>Any</option>";
            species.forEach(function (taxon) {
                content += "<option value='taxon:" + taxon + "'>" + taxa[taxon].name + "</option>";
            });
            content += "</select>"
            content += "</div>";

            content += "</form>";
            return content;
        }

        function initPopoverBehaviour() {
            $popover = $(".popover-content #assemblyLevel").parents(".popover");

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

            })
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
     * Filters all genomes for the given search query
     */
    function search(searchString, direct) {
        var wait = direct ? 0 : 500;
        delay(function doSearch() {
            var tokens = searchString.toLowerCase().split(" "),
                metaTokens = [],
                textTokens = [];
            tokens.forEach(function (token) {
                if (token.indexOf(":") !== -1) {
                    metaTokens.push(token);
                } else {
                    textTokens.push(token);
                }
            });
            var results = data;
            metaTokens.forEach(function filter (token) {
                var meta = token.split(":");
                if (meta[0] === "taxon") {
                    var id = +(meta[1]);
                    results = results.filter(function (element) {
                        return element[taxa[id].rank + "_id"] === id;
                    });
                } else {
                    if (meta[0] === "is" && SEARCH_VALUES[meta[1]]) {
                        results = results.filter(function (element) {
                            return element[SEARCH_VALUES[meta[1]].attr] === SEARCH_VALUES[meta[1]].value;
                        });
                    }
                }
            });
            textTokens.forEach(function filter (token) {
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
    function drawList(results) {
        var $resultTable = $("#genomeSelector-results"),
            resultString = "";

        $resultTable.find(".result-count").text(results.length);
        selectedResults = results.slice(0, ELEMENTS_SHOWN);

        // build table
        selectedResults.forEach(function (result) {
            resultString += "<tr class='genome' data-id='" + result.id + "' data-name='" + result.name + "'>";
            resultString += "<td><input type='checkbox' class='check'></input></td>";
            resultString += "<td>" + result.name + "<br>";
            resultString += "<span class='lineage'>" + getLineage(result) + "</span></td>";
            resultString += "<td><button class='btn btn-default btn-xs btn-add'><span class='glyphicon glyphicon-plus'></span></button></td>";
            resultString += "</tr>";
        });
        $resultTable.find("tbody").html(resultString);

        // set table footer
        if (selectedResults.length < results.length) {
            $resultTable.find("tfoot").html("<tr class='warning'><th colspan='3'>Showing 0-" + ELEMENTS_SHOWN + " of " + results.length + "</th></tr>")
        } else {
            $resultTable.find("tfoot").empty();
        }

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

        // enable drag and drop
        var $tableDiv = $("#genomes-table-div");
        // Make the nodes draggable using JQuery UI
        $resultTable.find("tbody tr").draggable({
            appendTo: "#genomes-table-div table",
            addClasses: false,
            // Mimic the style of the table on the right
            helper: function startHelping(event) {
                return dragHelp($(this));
            }
        });

        /**
         * Drag helper. Constructs html-code that gets added to the page and
         * 'follows' the cursor while dragging. Mimics the design of the table.
         *
         * @param <jQuery> $node jQuery object of the dom element were dragging
         */
        function dragHelp($node) {
            var returnString = "<tbody class='dragging'>" +
                "<tr><td class='handle'><span class='glyphicon glyphicon-resize-vertical'></span></td><td class='data name' data-id='" +
                $node.data("id") + "'>" +
                $node.data("name") +
                "</td><td class='data status'></td><td></td></tr>" +
                "</tbody>";
            return $(returnString);
        }
    }

    function getGenome($row) {
        return {name : $row.data("name"), id : $row.data("id")};
    }

    function getLineage(organism) {
        var result = [];
        if (organism.class_id !== null && organism.class_id > 0) {
            result.push(createLink(organism.class_id));
        }
        if (organism.order_id !== null && organism.order_id > 0) {
            result.push(createLink(organism.order_id));
        }
        if (organism.genus_id !== null && organism.genus_id > 0) {
            result.push(createLink(organism.genus_id));
        }
        if (organism.species_id !== null && organism.species_id > 0) {
            result.push(createLink(organism.species_id));
        }
        return result.join(" / ");

        function createLink(taxonId) {
            return "<a href='#' class='lineage-link' data-id='" + taxonId + "'>" + taxa[taxonId].name + "</a>";
        }
    }

    /*************** Public methods ***************/


    // initialize the object
    init();

    return that;
};
