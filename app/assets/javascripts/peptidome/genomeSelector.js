/**
 * Creates a GenomeSelector object that represents a filterable list of genomes
 *
 * @param <Array> args.data is an array of around 17k objects with this format:
 *          {"id":57587,"class_id":29547,"genus_id":194,
 *          "name":"Campylobacter jejuni","order_id":213849,"species_id":197}
 * @param <Hash> args.taxa is a list of key-value pairs mapping
 *          taxon id's to taxon names
 * @return <GenomeSelector> that The constructed selectionTree object
 */
var constructGenomeSelector = function constructGenomeSelector(args) {
    /*************** Private variables ***************/

    var that = {},
        data = args.data,
        taxa = args.taxa,
        pancore = args.pancore,
        ELEMENTS_SHOWN = 10;

    /*************** Private methods ***************/

    /**
     * Initialize the genome Selector
     */
    function init() {
        data.sort(function (a, b) { return d3.ascending(a.name, b.name) });

        initTypeAhead();
        initCheckAll();
        initAddAll();

        drawList(data);
    }

    /**
     * Initializes the typeahead and token stuff
     */
    function initTypeAhead() {
        var searchTokens = [];
        for (var taxonId in taxa) {
            searchTokens.push({label: taxa[taxonId], value: "taxon:" + taxonId});
        }
        var engine = new Bloodhound({
          local: searchTokens,
          datumTokenizer: Bloodhound.tokenizers.obj.whitespace("label"),
          queryTokenizer: Bloodhound.tokenizers.whitespace
        });
        engine.initialize();

        $("#genomeSelectorSearch").tokenfield({
            delimiter: " ",
            beautify: false,
            createTokensOnBlur: true,
            typeahead: [null, {
                displayKey: 'label',
                source: engine.ttAdapter(),
                hint: false
            }]
        })
        .on('tokenfield:createtoken', function (e) {
            if (e.attrs.label.indexOf(":") !== -1) {
                var swap = e.attrs.value;
                e.attrs.value = e.attrs.label;
                e.attrs.label = swap;
            }
        })
        .on('tokenfield:createdtoken', function (e) {
            if (e.attrs.value.indexOf("taxon") === 0) {
                $(e.relatedTarget).addClass('token-taxon');
            }
            keyUpped();
        })
        .on('tokenfield:removedtoken', function (e) {
            keyUpped();
        });

        $("#genomeSelectorSearch-tokenfield").keyup(keyUpped);

        function keyUpped() {
            var list = $("#genomeSelectorSearch").tokenfield('getTokensList');
            list += " " + $("#genomeSelectorSearch-tokenfield").val();
            search(list);
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
    function search(searchString) {
        delay(function doSearch() {
            var tokens = searchString.toLowerCase().split(" ");
            var metaTokens = tokens.filter(function (token) {
                return token.indexOf(":") !== -1;
            });
            var textTokens = tokens.filter(function (token) {
                return token.indexOf(":") === -1;
            });
            var results = data;
            metaTokens.forEach(function filter (token) {
                var id = +(token.split(":")[1]);
                results = results.filter(function (element) {
                    return element.class_id === id
                        || element.order_id === id
                        || element.genus_id === id
                        || element.species_id === id;
                });
            });
            textTokens.forEach(function filter (token) {
                results = results.filter(function (element) {
                    return element.name.toLowerCase().indexOf(token) !== -1;
                });
            });
            drawList(results);
        }, 500);
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
            resultString += "<tr data-id='" + result.id + "' data-name='" + result.name + "'>";
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
        });

        // hook up lineage links
        $resultTable.find(".lineage-link").click(function () {
            var id = $(this).data("id");
            $("#genomeSelectorSearch").tokenfield('createToken', {
                value: "taxon:" + id,
                label: taxa[id]
            });
            return false;
        });
    }

    function getGenome($row) {
        return {name : $row.data("name"), id : $row.data("id")};
    }

    function getLineage(organism) {
        var result = [];
        if (organism.class_id !== null) {
            result.push(createLink(organism.class_id));
        }
        if (organism.order_id !== null) {
            result.push(createLink(organism.order_id));
        }
        if (organism.genus_id !== null) {
            result.push(createLink(organism.genus_id));
        }
        if (organism.species_id !== null) {
            result.push(createLink(organism.species_id));
        }
        return result.join(" / ");

        function createLink(taxonId) {
            return "<a href='#' class='lineage-link' data-id='" + taxonId + "'>" + taxa[taxonId] + "</a>";
        }
    }

    /*************** Public methods ***************/


    // initialize the object
    init();

    return that;
};
