/**
 * creates a genomeTable object representing the table showing all genomes
 * currently in the visualisation. features: reorder by dragging, autosort,
 * remove individual genomes, remove all genome.
 *
 * @param <Hash> args.genomes Hash of genomes (by bioproject_id)
 */
var constructGenomeTable = function constructGenomeTable(args) {
    /*************** Private variables ***************/

    var that = {},
        genomes = args.genomes,
        lca;

    /*************** Private methods ***************/

    /**
     * Initializes the table
     */
    function init() {

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
        $("#autosort ul a").click(function () {
            // TODO move to function
            var i;
            sendToWorker("autoSort", {type : $(this).attr("data-type")});
            for (i in genomes) {
                genomes[i].status = "Processing...";
            }
            table.update();
            $("#autosort").mouseleave();
            return false;
        });
        $("#autosort ul a").tooltip({placement : "right", container : "body"});

        // Make table sortable and droppable (JQuery UI)
        $("#genomes_table").disableSelection();
        $("#genomes_table, #pancore_graph").droppable({
            activeClass: "acceptDrop",
            hoverClass: "willDrop",
            tolerance: "pointer",
            accept: "li",
            drop: function (event, ui) {
                var g = [];
                ui.helper.find(".data.name").each(function () {
                    g.push({name : $(this).text(), bioproject_id : parseInt($(this).attr("data-bioproject_id"), 10)});
                });
                if (g.length < 70 || confirm("You're trying to add a lot of genomes (" + g.length + "). Are you sure you want to continue?")) {
                    addGenomes(g);
                }
            }
        });
        $("#genomes_table tbody").sortable({
            axis: 'y',
            containment: '.split-right',
            cursor: 'url(/closedhand.cur) 7 5, move',
            stop: function () {
                var r = calculateTablePositions();
                table.update();
                sendToWorker("recalculatePanCore", {"order" : r.order, "start" : r.start, "stop" : r.stop});
            }
        });

        // Add handler to the "remove all"-button
        //TODO $("#remove-all").click(clearAllData);

    }

    /*************** Public methods ***************/

    /**
     * Redraws the table
     */
    that.clear = function clear() {
        $("#genomes_table tbody").html("");
        that.update();
    };

    /**
     * Updates the table
     */
    that.update = function update() {
        var text,
        tr,
        newRows,
        td;
        // TODO remove in pancore should take care of this
        //removePopovers();

        text = "Genome";
        if (lca !== "") {
            text += " (LCA: " + lca + ")";
        }
        $("th.name").text(text);

        // Add rows
        tr = d3.select("#genomes_table tbody").selectAll("tr.added")
            .data(d3.values(genomes), function (d) { return d.bioproject_id; });
        newRows = tr.enter().append("tr").attr("class", "added");
        tr.exit().remove();
        tr.sort(function (a, b) { return a.position - b.position; });

        // Add cells
        newRows.append("td").attr("class", "handle").html("<i class='glyphicon glyphicon-resize-vertical'></i>");
        td = tr.selectAll("td.data")
            .data(function (d) {
                return d3.entries(d).filter(function (entry) {
                    return entry.key !== "position" && entry.key !== "bioproject_id";
                });
            });
        td.enter()
            .append("td");
        td.text(function (d) { return d.value; })
            .attr("class", function (d) {return "data " + d.key; })
            .attr("colspan", "1");
        newRows.append("td")
            .attr("class", "button")
            .append("a")
            .html("<i class='glyphicon glyphicon-trash'></i>")
            .attr("class", "btn btn-default btn-xs")
            .attr("title", "remove genome");
            //TODO .on("click", removeData);
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
        $("#table-message").html("<i class='glyphicon glyphicon-" + icon + "'></i> " + msg);
    };

    // initialize the object
    init();

    return that;
};
