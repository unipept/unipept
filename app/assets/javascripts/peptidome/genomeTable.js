/**
 * creates a genomeTable object representing the table showing all genomes
 * currently in the visualisation. features: reorder by dragging, autosort,
 * remove individual genomes, remove all genome.
 *
 * @param <Map> args.genomes Map of genomes (by assembly id)
 * @param <Pancore> args.pancore Pancore object
 */
var constructGenomeTable = function constructGenomeTable(args) {
    /*************** Private variables ***************/

    var that = {},
        genomes = args.genomes,
        pancore = args.pancore,
        lca;

    /*************** Private methods ***************/

    /**
     * Initializes the table
     */
    function init() {
        initAutoSort();
        initDrag();

        $("#remove-all").click(pancore.clearAllData);
    }

    /**
     * Initializes auto sort
     */
    function initAutoSort() {
        // Add handler to the autosort-button
        $("#autosort").mouseenter(function () {
            if (!$("#autosort").hasClass("open")) {
                $("#autosort-button").dropdown("toggle");
            }
        });
        $("#autosort").mouseleave(function () {
            if ($("#autosort").hasClass("open")) {
                $("#autosort-button").dropdown("toggle");
            }
        });
        $("#autosort ul a").click(runAutosort);
        $("#autosort ul a").tooltip({placement : "right", container : "body"});
    }

    /**
     * Initializes sortable
     */
    function initDrag() {
        $("#genomes_table").disableSelection();
        $("#genomes_table tbody").sortable({
            axis: 'y',
            containment: '.left-col',
            cursor: 'url(/closedhand.cur) 7 5, move',
            stop: function () {
                pancore.updateOrder(calculateTablePositions());
                that.update();
            }
        });
    }

    /**
     * Sets the position property of the genomes based on the row positions
     * in the table and returns a list with the new order
     *
     * @return <Hash> A hash with the new order and the start en stop positions
     *          where something was changed
     */
    function calculateTablePositions() {
        var order = [],
            start = -1,
            stop = 0;

        d3.selectAll("#genomes_table tbody tr").each(function (d, i) {
            var id = d.id;
            var genome = genomes.get(id);
            if (genome.position === i && stop === 0) {
                start = i;
            } else if (genome.position !== i) {
                stop = i;
                genome.position = i;
                genome.status = "Processing";
            }
            order[i] = id;
        });
        start++;
        return {"order" : order, "start" : start, "stop" : stop};
    }

    /**
     * This function gets executed when the user clicks one of the autosort
     * links.
     */
    function runAutosort() {
        var i;
        pancore.autoSort($(this).attr("data-type"));
        genomes.forEach(function (val) { val.status = "Processing"; });
        that.update();
        $("#autosort").mouseleave();
        return false;
    }

    /**
     * Sets the property of a genome in the table
     *
     * @param <String> id The assembly id of the genome of which we want to
     *          change the status
     * @param <String> property the name of the property to set
     * @param <Object> propertyValue the value of the property to set
     * @param <Boolean> updateTable If true, update the table on the web page.
     *          Should be set to false in case of batch update
     */
    function setGenomeProperty(id, property, propertyValue, updateTable) {
        if (!genomes.has(id)) return;
        genomes.get(id)[property] = propertyValue;
        if (updateTable) {
            that.update();
        }
    }

    /*************** Public methods ***************/

    /**
     * Redraws the table
     */
    that.clear = function clear() {
        $("#genomes_table tbody").empty();
        that.update();
    };

    /**
     * Adds the given genome to the table
     *
     * @param <Genome> genome The genome we want to add
     */
    that.addGenome = function addGenome(genome) {
        genomes.set(genome.id, genome);
    };

    /**
     * Removes the genome with the given id
     *
     * @param <Number> id The id of the genome we want to remove
     * @return
     */
    that.removeGenome = function removeGenome(id) {
        // Only remove data that's already loaded
        if (genomes.get(id).status !== "Done") return;
        genomes.forEach(function (val) { val.status = "Processing"; });
        genomes.delete(id);
        that.update();
        var r = calculateTablePositions();
        return {"id" : id,
            "order" : r.order,
            "start" : r.start
        };
    };

    /**
     * Resets the table and all data associated with it
     */
    that.clearAllData = function clearAllData() {
        lca = "";
        var i;
        genomes.clear();
        that.clear();
    };

    /**
     * Sets the status of a genome in the table
     *
     * @param <Number> id The id of the genome of which we want to
     *          change the status
     * @param <String> status the new status
     * @param <Boolean> updateTable If true, update the table on the web page.
     *          Should be set to false in case of batch update
     */
    that.setGenomeStatus = function setGenomeStatus(id, status, updateTable) {
        setGenomeProperty(id, "status", status, updateTable);
    };

    /**
     * Sets the order of a genome in the table
     *
     * @param <Number> id The id of the genome of which we want to
     *          change the status
     * @param <Number> position the new position
     * @param <Boolean> updateTable If true, update the table on the web page.
     *          Should be set to false in case of batch update
     */
    that.setGenomePosition = function setGenomePosition(id, position, updateTable) {
        setGenomeProperty(id, "position", position, updateTable);
    };

    /**
     * Changes the order of the table based on the given order
     *
     * @param <Array> order the new order we want to set
     */
    that.setOrder = function setOrder(order) {
        var i;
        for (i = 0; i < order.length; i++) {
            genomes.get(order[i]).position = i;
        }
        that.update();
    };

    /**
     * Changes the lca
     *
     * @param <String> l the new lca we want to set
     */
    that.setLca = function setLca(l) {
        lca = l;
        that.update();
    };

    /**
     * Returns the order of the genomes in the table as an array of id's
     *
     * @return <Array> order An array containing the  id's
     */
    that.getOrder = function getOrder() {
        var order = [];
        d3.selectAll("#genomes_table tbody tr").each(function (d, i) {
            order[i] = d.id;
        });
        return order;
    };

    /**
     * Updates the table
     */
    that.update = function update() {
        var text,
            tr,
            newRows,
            td;

        text = "Proteomes";
        if (lca !== "") {
            text += " (LCA: " + lca + ")";
        }
        $("#genomes_table th.name").text(text);

        // Add rows
        tr = d3.select("#genomes_table tbody").selectAll("tr.added")
            .data(iteratorToArray(genomes.values()), function (d) { return d.id; });
        newRows = tr.enter().append("tr").attr("class", "added");
        tr.exit().remove();
        tr.sort(function (a, b) { return a.position - b.position; });

        // Add cells
        newRows.append("td").attr("class", "handle").html("<span class='glyphicon glyphicon-resize-vertical'></span>");
        td = tr.selectAll("td.data")
            .data(function (d) {
                return d3.entries(d).filter(function (entry) {
                    return entry.key === "name" || entry.key === "status";
                });
            });
        td.enter()
            .append("td");
        td.html(function (d) {
                if (d.key === "status") {
                    if (d.value === "Done") {
                        return "";
                    } else if (d.value === "Processing") {
                        return "<span class='glyphicon glyphicon-refresh'></span>";
                    } else if (d.value === "Loading") {
                        return "<span class='glyphicon glyphicon-cloud-download'></span>";
                    }
                } else {
                    var genome = d3.select(this.parentNode).datum();
                    if (!genome.own) {
                        return d.value + " <a href='http://www.ncbi.nlm.nih.gov/assembly/" + genome.assembly_id + "' target='_blank' title='open assembly page'><span class='glyphicon glyphicon-share-alt'></span></a>";
                    } else {
                        return d.value + " <span class='glyphicon glyphicon-home' title='local proteome'></span>";
                    }
                }
                return d.value;
            })
            .attr("class", function (d) {return "data " + d.key; })
            .attr("colspan", "1");
        newRows.append("td")
            .attr("class", "button")
            .append("a")
            .html("<span class='glyphicon glyphicon-trash'></span>")
            .attr("class", "btn btn-default btn-xs")
            .attr("title", "remove proteome")
            .on("click", pancore.removeGenome);
        newRows.each(function () { highlight(this); });
        tr.selectAll("td.button a.btn").classed("disabled", function (d) {return d.status !== "Done"; });
    };

    /**
     * Displays a message above the table
     *
     * @param <String> icon The name of the glyphicon you want to show in front
     *          of your message
     * @param <String> msg The message you want to set
     */
    that.setTableMessage = function setTableMessage(icon, msg) {
        $("#table-message").html("<span class='glyphicon glyphicon-" + icon + "'></span> " + msg);
    };

    /**
     * Enables or disables the dragging of the tables and updates the message
     * above the table.
     *
     * @param <Boolean> enabled True if we want to enable the table
     */
    that.setEnabled = function setEnabled(enabled) {
        if (enabled) {
            that.setTableMessage("info-sign", "Drag rows to reorder them or use one of the autosort options.");
            $("#genomes_table tbody.ui-sortable").sortable("option", "disabled", false);
        } else {
            that.setTableMessage("refresh", "Please wait while we load the proteomes.");
            $("#genomes_table tbody.ui-sortable").sortable("option", "disabled", true);
        }
    };

    // initialize the object
    init();

    return that;
};
