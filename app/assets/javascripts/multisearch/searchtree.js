/**
 * Constructs a Searchtree object
 *
 * @return <Searchtree> that The constructed Searchtree object
 */
var constructSearchtree = function constructSearchtree(args) {
    /*************** Private variables ***************/

    // parameters
    var that = {},
        data = args.data,
        multi = args.multi,
        equateIL = args.equateIL ? "equateIL" : "";

    var tree,
        items;

    /*************** Private methods ***************/

    /**
     * Initializes Searchtree
     */
    function init() {
        redraw();
    }

    function redraw() {
        var i;

        // clear all the things
        $("#searchtree").empty();

        // Add the nested unordered lists to the page based on the data array
        tree = d3.select("#searchtree");
        tree = tree.append("ul").append("li").attr("class", "root not").append("ul");
        //$("li.root").prepend($("#treeSearchDiv"));
        items = tree.selectAll("li").data([data])
            .enter()
            .append("li")
                .html(function (d) { return "<span>" + multi.getTitle(d) + "</span>"; })
                .attr("title", function (d) { return d.data.rank; })
                .attr("class", "collapsibleListOpen")
                .attr("data-search", function (d) { return d.name.toLowerCase(); })
            .append("ul");
        for (i = 0; i < 28; i++) {
            items = items.selectAll("li").data(function (d) { return d.children; })
                .enter()
                .append("li")
                    .html(function (d) { return "<span>" + multi.getTitle(d) + "</span>"; })
                    .attr("title", function (d) { return d.data.rank; })
                    .attr("class", function (d) {
                        if (!d.children.length) {
                            return "not leaf";
                        } else if (i < 3) {
                            return "collapsibleListOpen";
                        } else {
                            return "collapsibleListClosed";
                        }
                    })
                    .attr("data-search", function (d) { return d.name.toLowerCase(); })
                .append("ul");
        }

        // Expand or collapse a node when clicked
        $("#searchtree li").click(function () {
            if (!$(this).hasClass("not")) {
                $(this).toggleClass("collapsibleListOpen collapsibleListClosed");
            }
            return false;
        });

        // Add click action
        $("#searchtree li span").click(clickAction);

        // add search
        $("#tree_search").keyup(function () {
            var text = $(this).val().toLowerCase();
            delay(function () {
                $("#searchtree li").removeClass("match unmatch");
                if (text !== "") {
                    var $matches = $("#searchtree li[data-search*='" + text + "']").addClass("match");
                    $matches.find("li").addClass("match");
                    $matches.parents("li").addClass("match").addClass("collapsibleListOpen").removeClass("collapsibleListClosed");
                    $("#searchtree li:not(.match):not(.root)").addClass("unmatch");
                }
            }, 500);
        });
        $('#tree_search').click(function () {
            $(this).keyup();
        });
        $('#tree_search').change(function () {
            $(this).keyup();
        });

    }

    /**
     * Loads the peptides corresponding with the clicked node and moves the
     * info div to the corresponding position
     */
    function clickAction() {
        logToGoogle("Multi Peptide", "tree", "Peptides");

        var d         = d3.select(this.parentElement).datum(),
            margin    = this.offsetTop - 9,
            innertext = "<a href='http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=" + d.data.taxon_id + "' target='_blank'>" + d.name + "</a>",
            infoPane,
            ownSequences,
            peptide,
            allSequences,
            i
            stringBuffer = "";

        $("span.clicked").removeClass("clicked");
        $(this).addClass("clicked");
        innertext += " (" + d.data.rank + ")";
        infoPane = $("#tree_data").html("<h3>" + innertext + "</h3>");
        $("#tree_data").css("-webkit-transform", "translateY(" + margin + "px)");
        $("#tree_data").css("transform", "translateY(" + margin + "px)");
        ownSequences = multi.getOwnSequences(d.id).sort();
        if (ownSequences && ownSequences.length > 0) {
            stringBuffer = "<h4 class='own'>Peptides specific for this taxon</h4><ul>";
            for (i = 0; i < ownSequences.length; i++) {
                stringBuffer += "<li><a href='/sequences/" + ownSequences[i] + "/" + equateIL + "' target='_blank'>" + ownSequences[i] + "</a></li>";
            }
            stringBuffer += "</ul>";
            infoPane.append(stringBuffer);
            infoPane.find("h4.own").before("<div id='copy-own' class='zero-clipboard'><span class='btn-clipboard'>Copy</span></div>");
            addCopy($("#copy-own span").first(), function () {return ownSequences.join("\n"); });

        }
        allSequences = multi.getAllSequences(d).sort();
        if (allSequences && allSequences.length > 0 && allSequences.length !== (ownSequences ? ownSequences.length : 0)) {
            stringBuffer = "<h4 class='all'>Peptides specific to this taxon or one of its subtaxa</h4><ul>";
            for (i = 0; i < allSequences.length; i++) {
                stringBuffer += "<li><a href='/sequences/" + allSequences[i] + "/" + equateIL + "' target='_blank'>" + allSequences[i] + "</a></li>";
            }
            stringBuffer += "</ul>";
            infoPane.append(stringBuffer);
            infoPane.find("h4.all").before("<div id='copy-all' class='zero-clipboard'><span class='btn-clipboard'>Copy</span></div>");
            addCopy($("#copy-all span").first(), function () {return allSequences.join("\n"); });
        }
        return false;
    }

    /*************** Public methods ***************/

    /**
     * searches for a term
     *
     * @param <String> searchTerm The string searched for
     */
    that.search = function search(searchTerm) {
        $("#tree_search").val(searchTerm);
        highlight("#tree_search");
        $("#tree_search").change();
    };


    // initialize the object
    init();

    return that;
};
