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


    // initialize the object
    init();

    return that;
};
