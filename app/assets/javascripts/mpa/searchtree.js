import {addCopy, highlight, logToGoogle} from "../utils.js";
/* eslint require-jsdoc: off */

/**
 * @typedef Searchtree
 * @type {object}
 * @property {function(string):any} search
 */

/**
 * Constructs a Searchtree object
 *
 * @param  {Tree} t The JSON representation of the tree
 * @param  {boolean} il Whether IL were equated
 * @return {Searchtree} The constructed Searchtree object
 */
function constructSearchtree(t, il, rerootCallback = x => {}) {
    /** ************* Private variables ***************/

    // parameters
    let that = {},
        dataTree = t,
        data = t.root,
        equateIL = il ? "equateIL" : "";

    let tree,
        items;

    const infoPane = $("#tree_data");
    const initialStyleInforpane = infoPane.attr("style") || "";
    const initialHTMLInforpane = infoPane.html();


    /** ************* Private methods ***************/

    /**
     * Initializes Searchtree
     */
    function init() {
        redraw();
    }

    function resetinfoPandAndClick() {
        $("span.clicked").removeClass("clicked");
        infoPane.html(initialHTMLInforpane);
        infoPane.attr("style", initialStyleInforpane);
    }

    function redraw() {
        let i;
        // clear all the things
        $("#searchtree").empty();
        resetinfoPandAndClick();

        // Add the nested unordered lists to the page based on the data array
        tree = d3.select("#searchtree");
        tree = tree.append("ul").append("li").attr("class", "root not").append("ul");
        // $("li.root").prepend($("#treeSearchDiv"));
        items = tree.selectAll("li").data([data])
            .enter()
            .append("li")
            .html(d => `<span>${d.name} (${d.data.self_count}/${d.data.count})</span>`)
            .attr("title", d => d.rank)
            .attr("class", "collapsibleListOpen")
            .attr("data-search", d => d.name.toLowerCase())
            .append("ul");
        for (i = 0; i < 28; i++) {
            items = items.selectAll("li").data(d => d.children)
                .enter()
                .append("li")
                .html(d => `<span>${d.name} (${d.data.self_count}/${d.data.count})</span>`)
                .attr("title", d => d.rank)
                .attr("class", function (d) {
                    if (!d.children.length) {
                        return "not leaf";
                    } else if (i < 3) {
                        return "collapsibleListOpen";
                    } else {
                        return "collapsibleListClosed";
                    }
                })
                .attr("data-search", d => d.name.toLowerCase())
                .append("ul");
        }

        // Expand or collapse a node when clicked
        $("#searchtree li").click(function () {
            if (!$(this).hasClass("not")) {
                resetinfoPandAndClick();
                $(this).toggleClass("collapsibleListOpen collapsibleListClosed");
            }
            return false;
        });

        // Add click action
        $("#searchtree li span").click(clickAction);
        $("#searchtree li span").dblclick(function () {
            rerootCallback(Object.assign({}, d3.select(this.parentElement).datum()));
        });


        // add search
        $("#tree_search").keyup(function () {
            let text = $(this).val().toLowerCase();
            delay(function () {
                resetinfoPandAndClick();
                $("#searchtree li").removeClass("match unmatch");
                if (text !== "") {
                    let $matches = $("#searchtree li[data-search*='" + text + "']").addClass("match");
                    $matches.find("li").addClass("match");
                    $matches.parents("li").addClass("match").addClass("collapsibleListOpen").removeClass("collapsibleListClosed");
                    $("#searchtree li:not(.match):not(.root)").addClass("unmatch");
                }
            }, 500);
        });
        $("#tree_search").click(function () {
            $(this).keyup();
        });
        $("#tree_search").change(function () {
            $(this).keyup();
        });
    }

    /**
    * Loads the peptides corresponding with the clicked node and moves the
    * info div to the corresponding position
    *
     * @return {false} prevent default
     */
    function clickAction() {
        logToGoogle("Multi Peptide", "tree", "Peptides");

        let d = d3.select(this.parentElement).datum(),
            margin = this.offsetTop - 9,
            ownSequences,
            allSequences,
            i,
            stringBuffer = "";

        $("span.clicked").removeClass("clicked");
        $(this).addClass("clicked");
        infoPane
            .html(`
                <h3>
                  <a href='http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=${d.id}' target='_blank'>
                    ${d.name}
                  </a> (${d.rank})
                </h3>`);
        $("#tree_data").css({
            "transform": "translateY(" + margin + "px)",
            "margin-bottom": margin + "px",
        });
        ownSequences = dataTree.getOwnSequences(d).sort();
        if (ownSequences && ownSequences.length > 0) {
            stringBuffer = "<h4 class='own'>Peptides specific for this taxon</h4><ul>";
            for (i = 0; i < ownSequences.length; i++) {
                stringBuffer += `<li><a href='/sequences/${ownSequences[i]}/${equateIL}' title='Tryptic Peptide Analysis of ${ownSequences[i]}' target='_blank'>${ownSequences[i]}</a></li>`;
            }
            stringBuffer += "</ul>";
            infoPane.append(stringBuffer);
            infoPane.find("h4.own").before("<div id='copy-own' class='clipboard-btn-wrapper'><span class='btn-clipboard'>Copy</span></div>");
            addCopy("#copy-own span", () => ownSequences.join("\n"));
        }
        allSequences = dataTree.getAllSequences(d).sort();
        if (allSequences && allSequences.length > 0 && allSequences.length !== (ownSequences ? ownSequences.length : 0)) {
            stringBuffer = "<h4 class='all'>Peptides specific to this taxon or its subtaxa</h4><ul>";
            for (i = 0; i < allSequences.length; i++) {
                stringBuffer += `<li><a href='/sequences/${allSequences[i]}/${equateIL}' title='Tryptic Peptide Analysis of ${allSequences[i]}' target='_blank'>${allSequences[i]}</a></li>`;
            }
            stringBuffer += "</ul>";
            infoPane.append(stringBuffer);
            infoPane.find("h4.all").before("<div id='copy-all' class='clipboard-btn-wrapper'><span class='btn-clipboard'>Copy</span></div>");
            addCopy("#copy-all span", () => allSequences.join("\n"));
        }
        return false;
    }

    /** ************* Public methods ***************/

    /**
     * searches for a term
     *
     * @param  {string} searchTerm The string to search for
     */
    that.search = function search(searchTerm) {
        $("#tree_search").val(searchTerm);
        highlight("#tree_search");
        $("#tree_search").change();
    };


    // initialize the object
    init();

    return that;
}

export {constructSearchtree};
