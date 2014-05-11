/**
 * Creates a selectionTree object that represents a
 * selectable taxonomy tree using nested unordered lists
 *
 * @param <Array> args.data is an array of around 2500 objects with this format:
 *          {"bioproject_id":57587,"class_id":29547,"genus_id":194,
 *          "name":"Campylobacter jejuni","order_id":213849,"species_id":197}
 * @param <Hash> args.taxa is a list of key-value pairs mapping
 *          taxon id's to taxon names
 * @return <SelectionTree> that The constructed selectionTree object
 */
var constructSelectionTree = function constructSelectionTree(args) {
    /*************** Private variables ***************/

    var that = {},
        data = args.data,
        taxa = args.taxa,
        titles = ["Class", "Order", "Genus", "Species"];

    // Status vars used while dragging to determine if the
    // droptarget needs to be recalculated
    var moving = false,
        moving2 = false;

    /*************** Private methods ***************/

    /**
     * Initializes the data variables and calculates the children property
     * of all nodes in the data
     */
    function init() {
        // Uses a "group by" operator on the data array to create a nested array
        data = d3.nest()
            .key(function (d) { return d.class_id; })
                .sortKeys(function (a, b) { return d3.ascending(taxa[a], taxa[b]); })
            .key(function (d) { return d.order_id; })
                .sortKeys(function (a, b) { return d3.ascending(taxa[a], taxa[b]); })
            .key(function (d) { return d.genus_id; })
                .sortKeys(function (a, b) { return d3.ascending(taxa[a], taxa[b]); })
            .key(function (d) { return d.species_id; })
                .sortKeys(function (a, b) { return d3.ascending(taxa[a], taxa[b]); })
            .entries(data);
        calculateNumOfChildren(data);
        delete data.children;
    }

    /**
     * Calculates the number of leafs under every node in the given list by
     * calling the method recursively.
     *
     * The children property gets set for every node and cointains the
     * calculated number of children.
     *
     * @param <Array> list A list of nodes which all potentially have children
     *          stored in de values param.
     * @return <Hash> return The sum of the number of leafs for all nodes in
     *          given list.
     */
    function calculateNumOfChildren(list) {
        var result = 0,
            node,
            i;

        // Iterate over all nodes
        for (i = 0; i < list.length; i++) {
            node = list[i];

            // If the node has children, call recursively, else 1
            if (node.values !== undefined) {
                node.children = calculateNumOfChildren(node.values);
            } else {
                node.children = 1;
            }
            result += node.children;
        }
        list.children = result;
        return result;
    }

    /**
     * Filters the tree for a given search string if this method isn't call
     * for a second time in the next 500ms
     *
     * @param <String> searchString The string we want to search for
     * @param <jQuery> $tree jQuery object of the tree we want to filter
     */
    function search(searchString, $tree) {
        var text = searchString.toLowerCase();
        delay(function doSearch() {
            $tree.find("li").removeClass("match unmatch");
            if (text !== "") {
                $tree.find("li[data-search*='" + text + "']").addClass("match");
                $tree.find("li.match").parents("li")
                    .addClass("match")
                    .addClass("collapsibleListOpen")
                    .removeClass("collapsibleListClosed");
                $tree.find("li:not(.match):not(.root)").addClass("unmatch");
            }
        }, 500);
    }

    /**
     * Drag helper. Constructs html-code that gets added to the page and
     * 'follows' the cursor while dragging. Mimics the design of the table.
     *
     * @param <jQuery> $node jQuery object of the dom element were dragging
     */
    function help($node) {
        var returnString = "<tbody class='dragging'>";
        if ($node.hasClass("leaf")) {
            returnString += "<tr><td class='handle'><span class='glyphicon glyphicon-resize-vertical'></span></td><td class='data name' data-bioproject_id='"
                + $node.attr("data-bioproject_id") + "'>"
                + $node.text()
                + "</td><td class='data status'></td><td></td></tr>";
        } else {
            $node.find(".leaf").each(function () {
                returnString += "<tr><td class='handle'><span class='glyphicon glyphicon-resize-vertical'></span></td><td class='data name' data-bioproject_id='"
                    + $(this).attr("data-bioproject_id") + "'>"
                    + $(this).text()
                    + "</td><td class='data status'></td><td></td></tr>";
            });
        }
        returnString += "</tbody>";
        return $(returnString);
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
                .attr("data-search", function (d) { return taxa[d.key]; })
            .append("ul");
        for (i = 1; i < 4; i++) {
            items = items.selectAll("li").data(function (d) { return d.values; })
                .enter()
                .append("li")
                    .html(function (d) { return "<span>" + taxa[d.key] + " (" + d.children + ")</span>"; })
                    .attr("title", titles[i])
                    .attr("class", "collapsibleListOpen")
                    .attr("data-search", function (d) { return taxa[d.key]; })
                .append("ul");
        }
        items = items.selectAll("li").data(function (d) { return d.values; })
            .enter()
            .append("li")
                .attr("class", "not leaf")
                .attr("title", function (d) { return "bioproject id: " + d.bioproject_id; })
                .attr("data-search", function (d) { return d.name.toLowerCase() + " " + d.bioproject_id; })
                .attr("data-bioproject_id", function (d) { return d.bioproject_id; })
                .html(function (d) { return "<span>" + d.name + "</span>"; });

        // Prevent accidental text selection
        $tree.find("li.root ul").disableSelection();

        // Add the search div as root
        $tree.find("li.root").prepend($(treeSearchSelector));

        // Expand or collapse a node when clicked
        $tree.find("li").click(function toggleExpand() {
            if (!$(this).hasClass("not")) {
                $(this).toggleClass("collapsibleListOpen collapsibleListClosed");
            }
            return false;
        });

        // Filter the tree 500ms after the last key press
        $(treeSearchSelector + " input").keyup(function keyUpped() {
            search($(this).val(), $tree);
        });

        // Make the nodes draggable using JQuery UI
        $tree.find("li").draggable({
            appendTo: tableDivSelector + " table",
            addClasses: false,
            refreshPositions: true,
            // Mimic the style of the table on the right
            helper: function startHelping(event) {
                return help($(this));
            },
            // Table on the right slides into view on drag start
            start: function startDragging(event, ui) {
                var pos = Math.max(0, window.pageYOffset - $tableDiv.offset().top + 16);
                $tableDiv.css("margin-top", pos + "px");
                $(event.target).draggable('option', 'refreshPositions', true);
                moving = true;
                moving2 = true;
                setTimeout(function () {moving = false; }, 800);
            },
            // Table on the right slides back to original position 1s after
            // drag stop
            stop: function stopDragging(event, ui) {
                setTimeout(function () {$tableDiv.css("margin-top", "0px"); }, 1000);
            },
            // Because the drop target slides in, we have to recalculate the
            // position of the target while dragging. This is computationally
            // expensive, so we stop recalculating once we know the target
            // stays in place
            drag: function whileDragging(event, ui) {
                if (!moving2) {
                    $(event.target).draggable('option', 'refreshPositions', false);
                }
                if (!moving) {
                    moving2 = false;
                }
            }
        });
    };

    // initialize the object
    init();

    return that;
};
