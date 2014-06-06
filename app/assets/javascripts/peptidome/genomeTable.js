/**
 * creates a genomeTable object representing the table showing all genomes
 * currently in the visualisation. features: reorder by dragging, autosort,
 * remove individual genomes, remove all genome.
 *
 * @param <Hash> args.genomes Hash of genomes (by bioproject_id)
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
        initDropAndSort();

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
     * Initializes dragable and sortable
     */
    function initDropAndSort() {
        $("#genomes_table").disableSelection();
        $("#genomes_table, #pancore_graph, #sim_matrix").droppable({
            activeClass: "acceptDrop",
            hoverClass: "willDrop",
            tolerance: "pointer",
            accept: "li,tr.own",
            drop: function (event, ui) {
                var g = [];
                ui.helper.find(".data.name").each(function () {
                    g.push({name : $(this).text(), bioproject_id : $(this).data("bioproject_id")});
                });
                if (g.length < 70 || confirm("You're trying to add a lot of genomes (" + g.length + "). Are you sure you want to continue?")) {
                    pancore.addGenomes(g);
                }
            }
        });
        $("#genomes_table tbody").sortable({
            axis: 'y',
            containment: '.split-right',
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
            var bioproject_id = d.bioproject_id;
            if (genomes[bioproject_id].position === i && stop === 0) {
                start = i;
            } else if (genomes[bioproject_id].position !== i) {
                stop = i;
                genomes[bioproject_id].position = i;
                genomes[bioproject_id].status = "Processing";
            }
            order[i] = bioproject_id;
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
        for (i in genomes) {
            genomes[i].status = "Processing";
        }
        that.update();
        $("#autosort").mouseleave();
        return false;
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
        genomes[genome.bioproject_id] = genome;
    };

    /**
     * Removes the genome with the given bioproject_id
     *
     * @param <Number> bioprojectId The id of the genome we want to remove
     * @return
     */
    that.removeGenome = function removeGenome(bioprojectId) {
        // Only remove data that's already loaded
        if (genomes[bioprojectId].status !== "Done") return;

        delete genomes[bioprojectId];
        that.update();
        var r = calculateTablePositions();
        return {"bioproject_id" : bioprojectId,
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
        for (i in genomes) {
            delete genomes[i];
        }
        that.clear();
    };

    /**
     * Sets the status of a genome in the table
     *
     * @param <Number> bioprojectId The id of the genome of which we want to
     *          change the status
     * @param <String> status the new status
     * @param <Boolean> updateTable If true, update the table on the web page.
     *          Should be set to false in case of batch update
     */
    that.setGenomeStatus = function setGenomeStatus(bioprojectId, status, updateTable) {
        genomes[bioprojectId].status = status;
        if (updateTable) {
            that.update();
        }
    };

    /**
     * Sets the order of a genome in the table
     *
     * @param <Number> bioprojectId The id of the genome of which we want to
     *          change the status
     * @param <Number> position the new position
     * @param <Boolean> updateTable If true, update the table on the web page.
     *          Should be set to false in case of batch update
     */
    that.setGenomePosition = function setGenomePosition(bioprojectId, position, updateTable) {
        genomes[bioprojectId].position = position;
        if (updateTable) {
            that.update();
        }
    };

    /**
     * Changes the order of the table based on the given order
     *
     * @param <Array> order the new order we want to set
     */
    that.setOrder = function setOrder(order) {
        var i;
        for (i = 0; i < order.length; i++) {
            genomes[order[i]].position = i;
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
     * Returns the order of the genomes in the table as an array of
     * bioproject id's
     *
     * @return <Array> order An array containing the bioproject id's
     */
    that.getOrder = function getOrder() {
      var order = [];
      d3.selectAll("#genomes_table tbody tr").each(function (d, i) {
          order[i] = d.bioproject_id;
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

        text = "Genomes";
        if (lca !== "") {
            text += " (LCA: " + lca + ")";
        }
        $("#genomes_table th.name").text(text);

        // Add rows
        tr = d3.select("#genomes_table tbody").selectAll("tr.added")
            .data(d3.values(genomes), function (d) { return d.bioproject_id; });
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
                    var id = d3.select(this.parentNode).datum().bioproject_id;
                    if (("" + id).charAt(0) !== "u") {
                        return d.value + " <a href='http://www.ncbi.nlm.nih.gov/bioproject/?term=" + d3.select(this.parentNode).datum().bioproject_id + "' target='_blank' title='open bioproject page'><span class='glyphicon glyphicon-share-alt'></span></a>";
                    } else {
                        return d.value + " <span class='glyphicon glyphicon-home' title='local genome'></span>";
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
            .attr("title", "remove genome")
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
            that.setTableMessage("refresh", "Please wait while we load the genomes for this species.");
            $("#genomes_table tbody.ui-sortable").sortable("option", "disabled", true);
        }
    };

    // initialize the object
    init();

    return that;
};
