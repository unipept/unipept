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
        titles = ["Class", "Order", "Genus", "Species"],
        ELEMENTS_SHOWN = 10;

    /*************** Private methods ***************/

    /**
     * Initialize the genome Selector
     */
    function init() {
        data.sort(function (a, b) { return d3.ascending(a.name, b.name) });

        initTypeAhead();

        drawList(data);
    }

    /**
     * Initializes the typeahead and token stuff
     */
    function initTypeAhead() {
        var searchTokens = [];
        for (var taxonId in taxa) {
            searchTokens.push({value: taxa[taxonId], label: "taxon:" + taxonId});
        }
        var engine = new Bloodhound({
          local: searchTokens,
          datumTokenizer: function(d) {
            return Bloodhound.tokenizers.whitespace(d.value);
          },
          queryTokenizer: Bloodhound.tokenizers.whitespace
        });
        engine.initialize();

        $("#genomeSelectorSearch").tokenfield({
            delimiter: " ",
            beautify: false,
            createTokensOnBlur: true,
            typeahead: [null, { source: engine.ttAdapter() }]
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

        selectedResults.forEach(function (result) {
            resultString += "<tr>";
            resultString += "<td><input type='checkbox'/></td>";
            resultString += "<td>" + result.name + "<br>";
            resultString += "<span class='lineage'>" + getLineage(result) + "</span></td>";
            resultString += "<td><button class='btn btn-default btn-xs'><span class='glyphicon glyphicon-plus'></span></button></td>";
            resultString += "</tr>";
        });

        $resultTable.find("tbody").html(resultString);

        if (selectedResults.length < results.length) {
            $resultTable.find("tfoot").html("<tr><th colspan='3' class='warning'><span class='glyphicon glyphicon-warning-sign'></span> Showing " + ELEMENTS_SHOWN + " of " + results.length + "</th></tr>")
        } else {
            $resultTable.find("tfoot").empty();
        }
    }

    function getLineage(organism) {
        var result = [];
        if (organism.class_id !== null) {
            result.push(taxa[organism.class_id]);
        }
        if (organism.order_id !== null) {
            result.push(taxa[organism.order_id]);
        }
        if (organism.genus_id !== null) {
            result.push(taxa[organism.genus_id]);
        }
        if (organism.species_id !== null) {
            result.push(taxa[organism.species_id]);
        }
        return result.join(" / ");
    }

    /*************** Public methods ***************/

    /**
     * Adds the collapsible selection tree to the page at the given selector
     * and adds the dragging behaviour.
     *
     * @param <String> selectors.tree Selector of div where we want
     *          to add the tree
     * @param <String> selectors.tableDiv Selector of the div containing
     *          the genomes table
     * @param <String> selectors.treeSearch Selector of the div containing
     *          the tree search field
     */
    that.drawTree = function drawTree(selectors) {
        var treeSelector = selectors.tree,
            tableDivSelector = selectors.tableDiv,
            treeSearchSelector = selectors.treeSearch,
            $tree = $(treeSelector),
            $tableDiv = $(tableDivSelector),
            tree,
            items,
            i;

        // Add the root
        tree = d3.select(treeSelector)
            .append("ul")
            .append("li")
                .attr("class", "root not")
            .append("ul");

        // Add the lower nodes
        items = tree.selectAll("li").data(data)
            .enter()
            .append("li")
                .html(function (d) { return "<span>" + taxa[d.key] + " (" + d.children + ")</span>"; })
                .attr("title", "Class")
                .attr("class", "collapsibleListOpen")
                .attr("data-search", function (d) { return taxa[d.key] ? taxa[d.key].toLowerCase() : "undefined"; })
            .append("ul");
    };

    // initialize the object
    init();

    return that;
};
