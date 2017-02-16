function init_sequence_show(data) {

    // variables
    var that = {},
        entries = data.entries,
        ec_functions = data.ec_functions,
        go_functions = data.go_functions,
        taxonEntries = data.taxonEntries,
        ecEntries = data.ecEntries,
        goEntries = data.goEntries;

    // add entries to protein table
    setUpProteinTable();

    // set up the fancy tree
    initD3TreeView(data.tree, '#lineageTree');
    initD3TreeView(data.ec_tree, '#ecTree');
    initD3TreeView(data.go_tree['biological_process'], '#goTreeMF');
    initD3TreeView(data.go_tree['biological_process'], '#goTreeBP');
    initD3TreeView(data.go_tree['biological_process'], '#goTreeCC');

    // fullscreen and save image buttons
    var buttons = ['lineage-tree', 'ec-tree', 'go-mf', 'go-bp', 'go-cc'];

    // set up the fullscreen stuff
    setUpFullScreen(buttons);

    // set up save image stuff
    setUpImageSave(buttons);

    // set up column toggle
    initColumnToggle();

    // iset up popover behaviour
    setUpPopoverBehaviour();

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
            } else if ($(this).parent().attr("id") === "lineage-table-tab") {
                title = "Lineage table";
                content = "This table shows the complete taxonomic lineages of all taxa associated with the UniProt entries whose protein sequence contains " + data.peptide + ". The first column contains the taxon name extracted from the UniProt entry, followed by columns representing taxonomic ranks ordered from superkingdom on the left to forma on the right.";
            } else if ($(this).parent().attr("id") === "go-mf-tab") {
                title = "GO molecular function tree";
                content = "This interactive tree bundles the complete hierarchy of GO terms associated with all UniProt entries whose protein sequence contains " + data.peptide + ". You can click on nodes to expand them, scroll to zoom and drag to move the tree";
            } else if ($(this).parent().attr("id") === "go-bp-tab") {
                title = "GO biological process tree";
                content = "This interactive tree bundles the complete hierarchy of GO terms associated with all UniProt entries whose protein sequence contains " + data.peptide + ". You can click on nodes to expand them, scroll to zoom and drag to move the tree";
            } else if ($(this).parent().attr("id") === "go-cc-tab") {
                title = "GO cellular component tree";
                content = "This interactive tree bundles the complete hierarchy of GO terms associated with all UniProt entries whose protein sequence contains " + data.peptide + ". You can click on nodes to expand them, scroll to zoom and drag to move the tree";
            } else if ($(this).parent().attr("id") === "ec-tree-tab") {
                title = "EC number tree";
                content = "This interactive tree bundles the complete hierarchy of EC numbers associated with all UniProt entries whose protein sequence contains " + data.peptide + ". You can click on nodes to expand them, scroll to zoom and drag to move the tree";
            } else if ($(this).parent().attr("id") === "ec-table-tab") {
                title = "EC table";
                content = "This table shows the complete hierarchy of EC numbers associated with the UniProt entries whose protein sequence contains " + data.peptide + ". The first column contains the EC number extracted from the UniProt entry, followed by columns representing the different levels of each EC number ordered from class on the left to enzyme on the right.";
            } showInfoModal(title, content);
        });
    }

    /**
     * Set up button behaviour for protein table
     */
    function setUpProteinTable() {
        var expand = 100,
            addEntries = expand;

        initTable(expand);
        $("#entry-filter li").click(function() {
            expand = ($(this)[0].innerText.trim() !== 'All') ? parseInt($(this)[0].innerText.trim()) : entries.length;
            addEntries = expand;
            // change button text to new number
            document.getElementById("show-entries").innerText = $(this)[0].innerText.trim() + ' entries '
            $("#show-entries").append($('<span class="caret"></span>'))
            // remove previouse entries
            document.getElementById('entry-table').innerHTML = "";
            // set active tab
            $("#entry-filter li").removeClass("active");
            $(this).addClass("active");
            // create table
            initTable(expand);
        });
        $("#add-entries").click(function() {
            var start = expand;
            expand += (expand !== 'All') ? addEntries : 0;
            initTable(expand, start);
            // remove selection after click
            $(".btn-add-entries").blur();
        });
    }

    /**
     * Hide and show add entries button
     */
    function behaviourAddEntries(showEntries) {
        if (showEntries >= entries.length) {
            $(".btn-add-entries").hide()
        } else {
            $(".btn-add-entries").show()
        }
    }

    /**
     * Create the protein table
     */
    function initTable(showEntries, start) {
        var $table = $('#entry-table');
        start = typeof start !== 'undefined' ? start : 0;
        for (i = start; i < showEntries; i++) {
            if (i < entries.length && entries[i].name !== null) {
                var $row = $('<tr></tr>')
                $("<td>" +
                    '<div class="btn-group">' +
                        '<a class="btn btn-default btn-xs dropdown-toggle externalLinks-button" data-toggle="dropdown">' + String(entries[i].uniprot_accession_number) + ' <span class="caret"></span></a>' +
                        '<ul class="dropdown-menu">' +
                            '<li role="presentation" class="dropdown-header">Open on external site</li>' +
                            '<li><a href="http://www.uniprot.org/uniprot/' + String(entries[i].uniprot_accession_number) + '" target="_blank">Uniprot</a></li>' +
                            '<li><a href="http://www.ebi.ac.uk/pride/searchSummary.do?queryTypeSelected=identification%20accession%20number&identificationAccessionNumber="' + String(entries[i].uniprot_accession_number) + '" target="_blank">PRIDE</a></li>' +
                            '<li><a href="https://db.systemsbiology.net/sbeams/cgi/PeptideAtlas/Search?apply_action=GO&exact_match=exact_match%22&search_key=' + String(entries[i].uniprot_accession_number) + '" target="_blank">PeptideAtlas</a></li>' +
                        '</ul>' +
                    '</div>' +
                '</td>').appendTo($row);
                $('<td class="col-name"><div class="entry-info">' + entries[i].name + '</div></td>').appendTo($row);
                $('<td class="col-organism"><div class="entry-info"><a href="http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=' + String(taxonEntries[i].id) + '" title="' + String(taxonEntries[i].id) + '" target="_blank">' + taxonEntries[i].name + '</a></div></td>').appendTo($row);
                $('<td class="col-ec"><div class="entry-info">' + ecEntries[i].map(element => {return '<a href="http://enzyme.expasy.org/EC/' + element.ec_number_code + '" title="' + String(ec_functions[element.ec_number_code]) + '" target="_blank">' + element.ec_number_code + '</a>'}).join(", ") + '</div></td>').appendTo($row);
                $('<td class="col-go"><div class="entry-info">' + goEntries[i].map(element => {return '<a href="http://amigo.geneontology.org/amigo/term/' + element.go_term_code + '" target="_blank">' + element.go_term_code + '</a>'}).join(", ") + '</div></td>').appendTo($row);
                $table.append($row[0]);
            }
        }
        behaviourAddEntries(showEntries);
    }

    function initD3TreeView(data, selector) {
        $(selector).treeview(data, {
            width: 916,
            height: 600,
            enableDoubleClick: true,
            getTooltip: function(d) {
              var numberFormat = d3.format(",d");
              return "<b>" + d.name + "</b> (" + d.data.rank + ")<br/>" + numberFormat(!d.data.self_count ? "0" : d.data.self_count) + (d.data.self_count && d.data.self_count === 1 ? " peptide" : " peptides") +
                " specific to this level<br/>" + numberFormat(!d.data.count ? "0" : d.data.count) + (d.data.count && d.data.count === 1 ? " peptide" : " peptides") + " specific to this level or lower";
            },
            getLabel: function(d) { 
                return d.name.length > 33 && (d._children || d.children) ? d.name.substring(0,30).trim()+"...": d.name
            },
            getPopoverContent: function(d) {
                return getPopoverContent(d);
            }
        });
    }

    function initColumnToggle() {
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

    /**
     * Constructs the content of a popover for a given dataset.
     *
     * @param <Genome> d The node of which we want a popover
     */
    function getPopoverContent(d) {
        var numberFormat = d3.format(",d");
        var content = numberFormat(!d.data.self_count ? "0" : d.data.self_count) + (d.data.self_count && d.data.self_count === 1 ? " peptide" : " peptides") +
            " specific to this level<br/>" + numberFormat(!d.data.count ? "0" : d.data.count) + (d.data.count && d.data.count === 1 ? " peptide" : " peptides") + " specific to this level or lower";

        content += "<div class='popover-buttons' ><br/>" +
                        "<div class='btn-group' id='download-organisms'>" +
                            "<a class='btn btn-default dropdown-toggle' id='download-organisms-toggle' data-toggle='dropdown' data-loading-text='Loading organisms'>" +
                                "<span class='glyphicon glyphicon-download'></span> " +
                                    "download organisms " +
                                "<span class='caret'></span>" +
                            "</a>" +
                            "<ul class='dropdown-menu'>" +
                                "<li><a href='#' data-id='" + d.id + "' id='node' data-type='node'><span style='color: blue;'>&#9632;</span> Node</a></li>" +
                                "<li><a href='#' data-id='" + d.id + "' id='branch' data-type='branch'><span style='color: red;'>&#9632;</span> Branch</a></li>" +
                            "</ul>" +
                        "</div>" +
                    "</div>";
        return content;
    }

    /**
     * Adds actions the currently shown popover
     */
    function setUpPopoverBehaviour() {
        $("#popovers").click(function(e){e.stopPropagation()});
        $(document).dblclick(function(event) {
            $("body").click(that.removePopovers);
            $(".close").click(that.removePopovers);
            $("#download-node-info").mouseenter(function () {
                if (!$("#download-node-info").hasClass("open")) {
                    $("#download-node-info-toggle").dropdown("toggle");
                }
            });
            $("#download-organisms").mouseleave(function () {
                if ($("#download-node-info").hasClass("open")) {
                    $("#download-node-info-toggle").dropdown("toggle");
                }
            });
            //$("#download-node-info ul a").click(downloadNodeHandler);
        });
    }

    function getActiveSubTab() {
        var focusedElement = $("#single-peptide-tabs li.active a").attr('href');
        return $(focusedElement + " .tab-content .tab-pane.active .tpa-tree").attr('id');
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
    function setUpImageSave(buttons) {
        buttons.forEach(function(button) {
            $("#buttons-" + button).prepend("<button id='save-btn-" + button + "' class='btn btn-default btn-xs btn-animate btn-save'><span class='glyphicon glyphicon-download down'></span> Save tree as image</button>");
            $("#save-btn-" + button).click(function () {
                logToGoogle("Single Peptide", "Save Image");
                triggerDownloadModal("#" + button + " svg", null, "unipept_"+button);
            });
        });
    }

    /**
     * Sets up the full screen stuff
     */
    function setUpFullScreen(buttons) {
        if (fullScreenApi.supportsFullScreen) {
            buttons.forEach(function(button) {
                $("#buttons-" + button).prepend("<button id='zoom-btn-" + button + "' class='btn btn-default btn-xs btn-animate btn-resize'><span class='glyphicon glyphicon-resize-full grow'></span> Enter full screen</button>");
                $("#zoom-btn-" + button).click(function () {
                    logToGoogle("Single Peptide", "Full Screen");
                    window.fullScreenApi.requestFullScreen($("#" + button + " div.tpa-tree").get(0));
                });
            });
            $(document).bind(fullScreenApi.fullScreenEventName, resizeFullScreen);
        }

        function resizeFullScreen() {
            setTimeout(function () {
                var width = 916,
                    height = 600;
                if (window.fullScreenApi.isFullScreen()) {
                    width = $(window).width()+32;
                    height = $(window).height()+16;
                }
                buttons.forEach(function(button) {
                    $("#" + button + " div.tpa-tree svg").attr("width", width);
                    $("#" + button + " div.tpa-tree svg").attr("height", height);

                    // moving tooltip & popover
                    treeId = getActiveSubTab();
                    tooltipDiv = $("#" + treeId + "-tooltip");
                    popoverDiv = $("#popovers");
                    window.fullScreenApi.isFullScreen() ? tooltipDiv.appendTo("#" + treeId) : tooltipDiv.appendTo("body");
                    window.fullScreenApi.isFullScreen() ? popoverDiv.appendTo("#" + treeId) : popoverDiv.appendTo("body");
                });
            }, 1000);
        }
    }

    /*************** Public methods ***************/

    /**
     * Removes all popovers
     */
    that.removePopovers = function removePopovers() {
        $(".bar.pop").popover("destroy");
        $(".bar.pop").attr("class", "bar");
    };
}
