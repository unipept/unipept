function init_sequence_show(data) {

    // set up the fancy tree
    initD3TreeView(data.tree, "#lineageTree");

    // set up fancy d3TreeView
    initD3TreeView(data.ec_tree, "#ecTree")

    // sub navigation click events
    initSubNav();

    // set up the fullscreen stuff
    setUpFullScreen();

    // set up save image stuff
    setUpImageSave();

    // enable the external link popovers
    addExternalLinks();

    // enable the open in UniProt and clipboard buttons
    setUpUniprotButtons(data.uniprotEntries);

    // add the tab help
    initHelp();


    /******************* Functions ***********************/

    /**
     * Initializes the help popups
     */
    function initHelp() {
        // tab help
        $(".nav-tabs li a span.help").click(function (e) {
            var title,
                content;
            e.stopPropagation();
            e.preventDefault();
            if ($(this).parent().attr("id") === "lineage-tree-tab") {
                title = "Lineage tree";
                content = "This interactive tree bundles the complete taxonomic lineages of all UniProt entries whose protein sequence contains " + data.peptide + ". You can click on nodes to expand them, scroll to zoom and drag to move the tree.";
            } else {
                title = "Lineage table";
                content = "This table shows the complete taxonomic lineages of all taxa associated with the UniProt entries whose protein sequence contains " + data.peptide + ". The first column contains the taxon name extracted from the UniProt entry, followed by columns representing taxonomic ranks ordered from superkingdom on the left to forma on the right.";
            }
            showInfoModal(title, content);
        });
    }

    function initD3TreeView(data, selector) {
        $(selector).treeview({
          data: data,
          width: 916,
          height: 600,
        });
    }

    function initSubNav() {
        $("li a").click(function() {
            if ($(this).attr("data-toggle") === "tab") {
                toggleTab();
            } 
        })
        $("th a span").click(function() {
            if ($(this).attr("class") === "classdesc" || "glyphicon") {
                toggleColumn($(this).attr("id"));
            }
        })
    }

    function toggleColumn(col) {
        els = $("#ec-table tr td:nth-child(" + col + ") div");
        if (els.css('display') == "none") {
            els.show();
            $("#ec-table tr th:nth-child(" + col + ") a span.classdesc").show();
            $("#ec-table tr th:nth-child(" + col + ") a span.glyphicon").hide();
        } else {
            els.hide();
            $("#ec-table tr th:nth-child(" + col + ") a span.classdesc").hide();
            $("#ec-table tr th:nth-child(" + col + ") a span.glyphicon").show();
        }
    }

    function toggleTab() {
        $("#proteins-tab").click(function(){
          $("#lineage-analysis").hide();
          $("#functional-analysis").hide();
        });

        $("#functional-analysis-tab").click(function(){
          $("#lineage-analysis").hide();
          $("#functional-analysis").show();
        });

        $("#lineage-analysis-tab").click(function(){
            $("#functional-analysis").hide();
            $("#lineage-analysis").show();
        })
    }

    function addExternalLinks() {
        // Add handler to the external links buttons
        $(".externalLinks-button").parent().mouseenter(function () {
            if (!$(this).hasClass("open")) {
                $(this).find(".externalLinks-button").dropdown("toggle");
            }
        });
        $(".externalLinks-button").parent().mouseleave(function () {
            if ($(this).hasClass("open")) {
                $(this).find(".externalLinks-button").dropdown("toggle");
            }
        });
    }

    function setUpUniprotButtons(entries) {
        $("#open-uniprot").click(function () {
            var url = "http://www.uniprot.org/uniprot/?query=accession%3A";
            url += entries.join("+OR+accession%3A");
            window.open(url, '_blank');
        });
        addCopy($("#clipboard-uniprot").first(), function () {
            return entries.join("\n");
        }, "Copy UniProt IDs to clipboard");
    }

    /**
     * Sets up the image save stuff
     */
    function setUpImageSave() {
        $("#buttons-single").prepend("<button id='save-btn-lineage' class='btn btn-default btn-xs btn-animate'><span class='glyphicon glyphicon-download down'></span> Save tree as image</button>");
        $("#buttons-second").prepend("<button id='save-btn-ec' class='btn btn-default btn-xs btn-animate'><span class='glyphicon glyphicon-download down'></span> Save tree as image</button>");
        $("#save-btn-lineage").click(function () {
            logToGoogle("Single Peptide", "Save Image");
            triggerDownloadModal("#lineageTree svg", null, "unipept_treeview");
        });
    }

    /**
     * Sets up the full screen stuff
     */
    function setUpFullScreen() {
        if (fullScreenApi.supportsFullScreen) {
            $("#buttons-single").prepend("<button id='zoom-btn-lineage' class='btn btn-default btn-xs btn-animate'><span class='glyphicon glyphicon-resize-full grow'></span> Enter full screen</button>");
            $("#buttons-ec-tree").prepend("<button id='zoom-btn-ec' class='btn btn-default btn-xs btn-animate'><span class='glyphicon glyphicon-resize-full grow'></span> Enter full screen</button>");
            $("#zoom-btn-lineage").click(function () {
                logToGoogle("Single Peptide", "Full Screen");
                window.fullScreenApi.requestFullScreen($("#lineageTree").get(0));
            });
            $("#zoom-btn-ec").click(function () {
                logToGoogle("Single Peptide", "Full Screen");
                window.fullScreenApi.requestFullScreen($("#ecTree").get(0));
            });
            $(document).bind(fullScreenApi.fullScreenEventName, resizeFullScreen);
        }

        function resizeFullScreen() {
            setTimeout(function () {
                var width = 916,
                    height = 600;
                if (window.fullScreenApi.isFullScreen()) {
                    width = $(window).width();
                    height = $(window).height();
                }
                $("#lineageTree svg").attr("width", width);
                $("#lineageTree svg").attr("height", height);
                $("#ecTree svg").attr("width", width);
                $("#ecTree svg").attr("height", height);
            }, 1000);
        }
    }
}
