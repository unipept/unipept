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
        taxa = args.taxa;

    // Status vars used while dragging to determine if the
    // droptarget needs to be recalculated
    var moving = false,
        moving2 = false;

    // Uses a "group by" operator on the data array to create a nested array
    data = d3.nest()
        .key(function (d) { return d.class_id; }).sortKeys(function (a, b) { return d3.ascending(taxa[a], taxa[b]); })
        .key(function (d) { return d.order_id; }).sortKeys(function (a, b) { return d3.ascending(taxa[a], taxa[b]); })
        .key(function (d) { return d.genus_id; }).sortKeys(function (a, b) { return d3.ascending(taxa[a], taxa[b]); })
        .key(function (d) { return d.species_id; }).sortKeys(function (a, b) { return d3.ascending(taxa[a], taxa[b]); })
        .entries(data);
    calculateNumOfChildren(data);
    delete data.children;

    /*************** Private methods ***************/

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

    /*************** Public methods ***************/

    /**
     * Adds the collapsible selection tree to the page at the given selector
     * and adds the dragging behaviour.
     *
     * @param <String> selector Selector of an (empty) div where to add the tree
     */
    that.drawTree = function drawTree(selector) {
        var $tree = $(selector),
            tree,
            items;

        // Add the root
        tree = d3.select(selector)
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
        items = items.selectAll("li").data(function (d) { return d.values; })
            .enter()
            .append("li")
                .html(function (d) { return "<span>" + taxa[d.key] + " (" + d.children + ")</span>"; })
                .attr("title", "Order")
                .attr("class", "collapsibleListClosed")
                .attr("data-search", function (d) { return taxa[d.key]; })
            .append("ul");
        items = items.selectAll("li").data(function (d) { return d.values; })
            .enter()
            .append("li")
                .html(function (d) { return "<span>" + taxa[d.key] + " (" + d.children + ")</span>"; })
                .attr("title", "Genus")
                .attr("class", "collapsibleListOpen")
                .attr("data-search", function (d) { return taxa[d.key]; })
            .append("ul");
        items = items.selectAll("li").data(function (d) { return d.values; })
            .enter()
            .append("li")
                .html(function (d) { return "<span>" + taxa[d.key] + " (" + d.children + ")</span>"; })
                .attr("title", "Species")
                .attr("class", "collapsibleListOpen")
                .attr("data-search", function (d) { return taxa[d.key]; })
            .append("ul");
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
        $tree.find("li.root").prepend($("#treeSearchDiv"));

        // Expand or collapse a node when clicked
        $tree.find("li").click(function toggleExpand() {
            if (!$(this).hasClass("not")) {
                $(this).toggleClass("collapsibleListOpen collapsibleListClosed");
            }
            return false;
        });

        // Filter the tree 500ms after the last key press
        $("#treeSearch").keyup(function keyUpped() {
            var text = $(this).val().toLowerCase();
            delay(function search() {
                $("#treeView li").removeClass("match unmatch");
                if (text !== "") {
                    $tree.find("li[data-search*='" + text + "']").addClass("match");
                    $tree.find("li.match").parents("li")
                        .addClass("match")
                        .addClass("collapsibleListOpen")
                        .removeClass("collapsibleListClosed");
                    $tree.find("li:not(.match):not(.root)").addClass("unmatch");
                }
            }, 500);
        });

        // Make the nodes draggable using JQuery UI
        $tree.find("li").draggable({
            appendTo: "#genomes_table tbody",
            addClasses: false,
            refreshPositions: true,
            // Mimic the style of the table on the right
            helper: function help(event) {
                var returnString = "<tbody class='dragging'>";
                if ($(this).hasClass("leaf")) {
                    returnString += "<tr><td class='handle'><i class='glyphicon glyphicon-resize-vertical'></i></td><td class='data name' data-bioproject_id='"
                        + $(this).attr("data-bioproject_id") + "'>"
                        + $(this).text()
                        + "</td><td class='data status'></td><td></td></tr>";
                } else {
                    $(this).find(".leaf").each(function () {
                        returnString += "<tr><td class='handle'><i class='glyphicon glyphicon-resize-vertical'></i></td><td class='data name' data-bioproject_id='"
                            + $(this).attr("data-bioproject_id") + "'>"
                            + $(this).text()
                            + "</td><td class='data status'></td><td></td></tr>";
                    });
                }
                returnString += "</tbody>";
                return $(returnString);
            },
            // Table on the right slides into view on drag start
            start: function startDragging(event, ui) {
                var pos = Math.max(0, window.pageYOffset - $("#table-message").offset().top);
                $("#genomes_table_div").css("margin-top", pos + "px");
                $(event.target).draggable('option', 'refreshPositions', true);
                moving = true;
                moving2 = true;
                setTimeout(function () {moving = false; }, 800);
            },
            // Table on the right slides back to original position 1s after
            // drag stop
            stop: function stopDragging(event, ui) {
                setTimeout(function () {$("#genomes_table_div").css("margin-top", "0px"); }, 1000);
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

    return that;
};
