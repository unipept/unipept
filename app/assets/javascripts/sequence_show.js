import {addCopy, logToGoogle, triggerDownloadModal, stringTitleize, numberToPercent} from "./utils.js";
import {showInfoModal} from "./modal.js";
import {AmountTable} from "./components/amounttable.js";
import ECNumbers from "./components/ecnumbers.js";
import GOTerms from "./components/goterms.js";
import "unipept-visualizations/src/treeview/treeview.js";

/* eslint require-jsdoc: off */
/* TODO: make  class */

/**
 * @typedef {Object} FACounts
 * @property {number} value count
 * @property {string} name  The name of the GO/EC number
 * @property {string} code  The code of the GO/EC number
 */

/**
 * @param {Object} data description of the data`
 * @param {Object.<string, FACounts>} data.fa.go - GO data information
 * @param {FACounts} data.fa.uniprotEntries - EC data information
 */
function initSequenceShow(data) {
    const $tooltip = $("#tooltip");
    const panelWidth = 916;
    const panelHeight = 600;
    // set up the fancy tree
    initLineageTree(data.tree);

    // set up the fullscreen stuff
    setUpFullScreen();

    // set up save image stuff
    setUpImageSave();

    // enable the external link popovers
    addExternalLinks();

    // enable the open in UniProt and clipboard buttons
    setUpUniprotButtons(data.uniprotEntries);

    // setup functional annotations tabs
    setUpFA(data.fa);

    // enable tooltips for EC and GO terms
    initFAToolips();

    // add the tab help
    initHelp();


    /** ***************** Functions ***********************/

    /**
     * Initializes the help popups
     */
    function initHelp() {
        // tab help
        $(".nav-tabs li a span.help").click(function (e) {
            let title,
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
            let url = "http://www.uniprot.org/uniprot/?query=accession%3A";
            url += entries.join("+OR+accession%3A");
            window.open(url, "_blank");
        });
        addCopy("#clipboard-uniprot", () => entries.join("\n"), "Copy UniProt IDs to clipboard");
    }

    /**
     * Sets up the image save stuff
     */
    function setUpImageSave() {
        $("#buttons-single").prepend("<button id='save-btn-lineage' class='btn btn-default btn-xs btn-animate'><span class='glyphicon glyphicon-download down'></span> Save tree as image</button>");
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
            $("#zoom-btn-lineage").click(function () {
                logToGoogle("Single Peptide", "Full Screen");
                window.fullScreenApi.requestFullScreen($("#lineageTree").get(0));
            });
            $(document).bind(fullScreenApi.fullScreenEventName, resizeFullScreen);
        }

        function resizeFullScreen() {
            setTimeout(function () {
                let width = panelWidth,
                    height = panelHeight;
                if (window.fullScreenApi.isFullScreen()) {
                    width = $(window).width();
                    height = $(window).height();
                }
                $("#lineageTree svg").attr("width", width);
                $("#lineageTree svg").attr("height", height);
            }, 1000);
        }
    }

    function setUpFA(fa) {
        setUpGO(fa.go);
        setUpEC(fa.ec);
    }

    function setUpEC({numAnnotatedPeptides, data}) {
        const ecResultset = new ECNumbers({numAnnotatedPeptides, data});
        if (numAnnotatedPeptides > 0) {
            setUpECTree(ecResultset);
            setUpEcTable(ecResultset);

            $(".ecNumberLink")
                .mouseenter(function (e) {
                    const ecNum = this.textContent;
                    $tooltip.html(tooltipEC(ecNum, ecResultset));
                    return false;
                });
        } else {
            $("#ec-table").html("<span>No EC code annotations found.</span>");
            $("#ec-treeview").remove();
        }
    }

    /**
     * Generate a tooltip for an EC number
     * @param  {string}    ecNumber   The Ec number to generate a tooltip for
     * @param  {ECNumbers} [ecResultSet=null]  A `ECNumbers` summary
     * @return {string}    HTML for the tooltip
     */
    function tooltipEC(ecNumber, ecResultSet = null) {
        const fmt= x=>`<div class="tooltip-ec-ancestor"><span class="tooltip-ec-term">EC ${x}</span><span class="tooltip-ec-name">${ECNumbers.nameOf(x)}</span></div>`;

        let result = `
            <h4 class="tooltip-fa-title">
                <span class="tooltip-fa-title-name">${ECNumbers.nameOf(ecNumber)}</span>
                <span class="tooltip-ec-term small"> EC ${ecNumber}</span>
            </h4>`;

        if (ECNumbers.ancestorsOf(ecNumber).length > 0) {
            result += `${ECNumbers.ancestorsOf(ecNumber).map(c => fmt(c)).join("\n")}`;
        }

        if (ecResultSet != null) {
            const count = ecResultSet.getValueOf(ecNumber);
            result += `<div class="tooltip-fa-text">Specificly assigned to ${numberToPercent(ecResultSet.getFractionOf(ecNumber), 1)} (${count}) of
            annotated matches</div>`;
        }
        return result;
    }

    /**
     * Create the EC treeview
     *
     * @param {ECNumbers} ecResultSet  A `ECNumbers` summary
     * @return {TreeView} The created treeview
     */
    function setUpECTree(ecResultSet) {
        const tree = ecResultSet.createTree("#ec-treeview", {
            width: panelWidth,
            height: panelHeight,
            getTooltip: d => {
                const fullcode = (d.name + ".-.-.-.-").split(".").splice(0, 4).join(".");
                let tip = tooltipEC(fullcode);
                tip += `<div class="tooltip-fa-text">
                        ${d.data.count}  occurrences, `;

                if (d.data.self_count == 0) {
                    tip += "no specific annotations";
                } else {
                    tip += `specificly assigned to ${numberToPercent(d.data.self_count/ecResultSet.getTotalSetSize(), 1)} (${d.data.self_count})
                            annotated matches`;
                }

                tip += "</div>";
                return tip;
            },
        });

        // save tree button
        $("#save-btn-ec").click(() => {
            logToGoogle("Single Peptide", "Save EC Image");
            triggerDownloadModal("#ec-treeview svg", null, "unipept_treeview");
        });

        return tree;
    }

    /**
     * Create the EC amount table
     *
     * @param {ECNumbers} ecResultSet  A `ECNumbers` summary
     */
    function setUpEcTable(ecResultSet) {
        const target = d3.select("#ec-table");
        target.html("");
        new AmountTable({
            title: "EC numbers - " + data.peptide,
            el: target,
            header: ["Count", "EC-Number", "Name"],
            data: ecResultSet.sortedTerms(),
            limit: 5,
            contents: [
                { // Count
                    text: d => d.value.toString(),
                    style: {"width": "5em"},
                    shade: d=>100*d.value/ecResultSet.getTotalSetSize(),
                },
                { // EC-number
                    html: d => {
                        const spans = d.code.split(".").map(e => `<span>${e}</span>`).join(".");
                        return `<a href="https://enzyme.expasy.org/EC/${d.code}" class="ec-number-formatted" target="_blank">${spans}</a>`;
                    },
                    text: d => d.code,
                    style: {"width": "8em"},
                },
                { // name
                    text: d => d.name,
                },
            ],
            tooltip: d => tooltipEC(d.code, ecResultSet),
            tooltipID: "#tooltip",
        }
        ).draw();
    }

    /**
     * Generate a tooltip for an GO term
     * @param  {string}    goTerm   The Ec term to generate a tooltip for
     * @param  {GOTerms} [goResultSet=null]  A `GOTerms` summary
     * @return {string}    HTML for the tooltip
     */
    function tooltipGO(goTerm, goResultSet = null) {
        let result = `
            <h4 class="tooltip-fa-title">
                <span class="tooltip-fa-title-name">${GOTerms.nameOf(goTerm)}</span>
                <span class="tooltip-go-title-term small"> ${goTerm}</span>
            </h4>
            <span class="tooltip-go-domain">${stringTitleize(GOTerms.namespaceOf(goTerm))}</span>`;

        if (goResultSet != null) {
            const count = goResultSet.getValueOf(goTerm);
            result += `<div class="tooltip-fa-text">Specificly assigned to ${numberToPercent(goResultSet.getFractionOf(goTerm), 1)} (${count}) of
            annotated matches</div>`;
        }
        return result;
    }

    function setUpGO({numAnnotatedPeptides, data}) {
        const goResultset = new GOTerms({numAnnotatedPeptides, data});

        $("#go-panel").empty();
        const goPanel = d3.select("#go-panel");
        for (const variant of GOTerms.NAMESPACES) {
            const variantName = stringTitleize(variant);
            goPanel.append("h3").text(variantName);

            if (variant in data) {
                const article = goPanel.append("div").attr("class", "row");
                setUpGoTable(goResultset, variant, article);
                setUpQuickGo(goResultset, variant, variantName, article);
            } else {
                goPanel.append("span").text("No GO term annotations in this namespace.");
            }
        }

        // Add content to the tooltips of links
        $(".goTermLink")
            .mouseenter(function (e) {
                const goTerm = this.textContent;
                $tooltip.html(tooltipGO(goTerm, goResultset));
                return false;
            });
    }

    function setUpGoTable(goResultset, variant, target) {
        const numAnnotatedPeptides = goResultset.getTotalSetSize();

        const tablepart = target.append("div").attr("class", "col-xs-8");
        new AmountTable({
            title: `GO terms - ${variant} - ${data.peptide}`,
            el: tablepart,
            header: ["Count", "GO term", "Name"],
            data: goResultset.sortedTerms(variant),
            limit: 5,
            contents: [
                { // Count
                    text: d => d.value,
                    style: {"width": "5em"},
                    shade: d=>100*d.value/numAnnotatedPeptides,
                },
                { // Go term
                    html: d => `<a href="https://www.ebi.ac.uk/QuickGO/term/${d.code}" target="_blank">${d.code}</a>`,
                    text: d => d.code,
                    style: {"width": "7em"},
                },
                { // name
                    text: d => d.name,
                },
            ],
            tooltip: d => tooltipGO(d.code, goResultset),
            tooltipID: "#tooltip",
        }
        ).draw();
    }

    function setUpQuickGo(goResultset, variant, variantName, target) {
        const top5 = goResultset.sortedTerms(variant).slice(0, 5).map(x => x.code);
        const quickGoChartURL = GOTerms.quickGOChartURL(top5);
        const top5WithNames = top5.map(x => `${GOTerms.nameOf(x)} (${numberToPercent(goResultset.getFractionOf(x))})`);
        const top5sentence = top5WithNames.slice(0, -1).join(", ")
                             + (top5.length > 1 ? " and ": "")
                             + top5WithNames[top5WithNames.length-1];
        target
            .append("div").attr("class", "col-xs-4")
            .append("img")
            .attr("src", quickGoChartURL)
            .attr("class", "quickGoThumb")
            .attr("title", `QuickGO chart of ${top5sentence}`)
            .on("click", () => {
                showInfoModal("QuickGo "+variantName, `
                    This chart shows the realationship between the ${top5.length} most occuring GO terms: ${top5sentence}.<br/>
                    <a href="${quickGoChartURL}" target="_blank" title="Click to enlarge in new tab"><img style="max-width:100%" src="${quickGoChartURL}" alt="QuickGO chart of ${top5sentence}"/></a>
                    <br>
                    Provided by <a href="https://www.ebi.ac.uk/QuickGO/annotations?goId=${top5.join(",")}" target="_blank">QuickGo</a>.`,
                {wide: true});
            });
    }

    /**
     * Enable show and hide of tooltips,
     * The values are set in `setUpGO` and `setUpEC`
     */
    function initFAToolips() {
        /* eslint brace-style: "off" */
        const tooltipShowCSS = {"display": "block", "visibility": "visible"};
        const tooltipHideCSS = {"display": "none", "visibility": "hidden"};

        $(".ecNumberLink,.goTermLink")
            .mouseenter(() => {$tooltip.css(tooltipShowCSS);})
            .mouseleave(() => {$tooltip.css(tooltipHideCSS);})
            .mousemove(function (e) {
                $tooltip.css("top", e.pageY+10);
                $tooltip.css("left", e.pageX+10);
            });
    }

    function initLineageTree(jsonData) {
        let margin = {
                top: 5,
                right: 5,
                bottom: 5,
                left: 60,
            },
            width = panelWidth - margin.right - margin.left,
            height = panelHeight - margin.top - margin.bottom;

        let zoomEnd = 0,
            i = 0,
            duration = 750,
            root;

        let tree = d3.layout.tree()
            .nodeSize([2, 105])
            .separation(function (a, b) {
                let width = (nodeSize(a) + nodeSize(b)),
                    distance = width / 2 + 4;
                return (a.parent === b.parent) ? distance : distance + 4;
            });

        let diagonal = d3.svg.diagonal()
            .projection(function (d) {
                return [d.y, d.x];
            });

        let widthScale = d3.scale.linear().range([2, 105]);

        // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
        let zoomListener = d3.behavior.zoom()
            .scaleExtent([0.1, 3])
            .on("zoom", zoom);

        let svg = d3.select("#lineageTree").append("svg")
            .attr("version", "1.1")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("viewBox", "0 0 " + (width + margin.right + margin.left) + " " + (height + margin.top + margin.bottom))
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .call(zoomListener)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .append("g");

        draw(jsonData);

        function draw(data) {
            root = data;

            widthScale.domain([0, root.data.count]);

            // set everything visible
            function setVisible(d) {
                d.selected = true;
                if (d.children) {
                    d.children.forEach(setVisible);
                }
            }
            setVisible(root);

            // set colors
            function color(d, c) {
                if (c) {
                    d.color = c;
                } else if (d.name === "Bacteria") {
                    d.color = "#1565C0"; // blue
                } else if (d.name === "Archaea") {
                    d.color = "#FF8F00"; // orange
                } else if (d.name === "Eukaryota") {
                    d.color = "#2E7D32"; // green
                } else if (d.name === "Viruses") {
                    d.color = "#C62828"; // red
                } else {
                    d.color = "#1565C0"; // blue
                }
                if (d.children) {
                    d.children.forEach(function (node) {
                        color(node, d.color);
                    });
                }
            }
            root.children.forEach(function (node) {
                color(node);
            });

            let LCA;

            function findLCA(d) {
                if (d.children && d.children.length === 1) {
                    findLCA(d.children[0]);
                } else {
                    LCA = d;
                }
            }
            findLCA(root);

            // collapse everything
            function collapseAll(d) {
                if (d.children && d.children.length === 0) {
                    d.children = null;
                }
                if (d.children) {
                    d._children = d.children;
                    d._children.forEach(collapseAll);
                    d.children = null;
                }
            }
            collapseAll(LCA);

            update(root);
            highlight(LCA);
        }

        d3.select(self.frameElement).style("height", "800px");

        function update(source) {
            // Compute the new tree layout.
            let nodes = tree.nodes(root).reverse(),
                links = tree.links(nodes);

            // Normalize for fixed-depth.
            nodes.forEach(function (d) {
                d.y = d.depth * 180;
            });

            // Update the nodes
            let node = svg.selectAll("g.node")
                .data(nodes, function (d) {
                    return d.id || (d.id = ++i);
                });

            // Enter any new nodes at the parent's previous position.
            let nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .style("cursor", "pointer")
                .attr("transform", function (d) {
                    return "translate(" + (source.y0 || 0) + "," + (source.x0 || 0) + ")";
                })
                .on("click", click);

            nodeEnter.append("title").html(function (d) {
                return "hits: " + d.data.count;
            });

            nodeEnter.append("circle")
                .attr("r", 1e-6)
                .style("stroke-width", "1.5px")
                .style("stroke", function (d) {
                    if (d.selected) {
                        return d.color || "#aaa";
                    } else {
                        return "#aaa";
                    }
                })
                .style("fill", function (d) {
                    if (d.selected) {
                        return d._children ? d.color || "#aaa" : "#fff";
                    } else {
                        return "#aaa";
                    }
                });

            nodeEnter.append("text")
                .attr("x", function (d) {
                    return d.children || d._children ? -10 : 10;
                })
                .attr("dy", ".35em")
                .attr("text-anchor", function (d) {
                    return d.children || d._children ? "end" : "start";
                })
                .text(function (d) {
                    return d.name;
                })
                .style("font", "10px sans-serif")
                .style("fill-opacity", 1e-6);

            // Transition nodes to their new position.
            let nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

            nodeUpdate.select("circle")
                .attr("r", nodeSize)
                .style("fill-opacity", function (d) {
                    return d._children ? 1 : 0;
                })
                .style("stroke", function (d) {
                    if (d.selected) {
                        return d.color || "#aaa";
                    } else {
                        return "#aaa";
                    }
                })
                .style("fill", function (d) {
                    if (d.selected) {
                        return d._children ? d.color || "#aaa" : "#fff";
                    } else {
                        return "#aaa";
                    }
                });

            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            let nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + source.y + "," + source.x + ")";
                })
                .remove();

            nodeExit.select("circle")
                .attr("r", 1e-6);

            nodeExit.select("text")
                .style("fill-opacity", 1e-6);

            // Update the links
            let link = svg.selectAll("path.link")
                .data(links, function (d) {
                    return d.target.id;
                });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .style("fill", "none")
                .style("stroke-opacity", "0.5")
                .style("stroke-linecap", "round")
                .style("stroke", function (d) {
                    if (d.source.selected) {
                        return d.target.color;
                    } else {
                        return "#aaa";
                    }
                })
                .style("stroke-width", 1e-6)
                .attr("d", function (d) {
                    let o = {
                        x: (source.x0 || 0),
                        y: (source.y0 || 0),
                    };
                    return diagonal({
                        source: o,
                        target: o,
                    });
                });

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", diagonal)
                .style("stroke", function (d) {
                    if (d.source.selected) {
                        return d.target.color;
                    } else {
                        return "#aaa";
                    }
                })
                .style("stroke-width", function (d) {
                    if (d.source.selected) {
                        return widthScale(d.target.data.count) + "px";
                    } else {
                        return "4px";
                    }
                });

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .style("stroke-width", 1e-6)
                .attr("d", function (d) {
                    let o = {
                        x: source.x,
                        y: source.y,
                    };
                    return diagonal({
                        source: o,
                        target: o,
                    });
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        // expands all children of a node
        function expandAll(d) {
            expand(d, 30);
        }

        // Expands a node for i levels
        function expand(d, i) {
            let localI = i;
            if (typeof localI === "undefined") {
                localI = 1;
            }
            if (localI > 0) {
                if (d._children) {
                    d.children = d._children;
                    d._children = null;
                }
                if (d.children) {
                    d.children.forEach(function (c) {
                        expand(c, localI - 1);
                    });
                }
            }
        }

        // Collapses a node
        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            }
        }

        function nodeSize(d) {
            if (d.selected) {
                return widthScale(d.data.count) / 2;
            } else {
                return 2;
            }
        }

        // Toggle children on click.
        function click(d) {
            // check if click is triggered by panning on a node
            if (Date.now() - zoomEnd < 200) return;

            if (d3.event.shiftKey) {
                expandAll(d);
            } else if (d.children) {
                collapse(d);
            } else {
                expand(d);
            }

            update(d);
            centerNode(d);
        }

        // Sets the width of this node to 100%
        function highlight(d) {
            // set Selection properties
            setSelected(root, false);
            setSelected(d, true);

            // scale the lines
            widthScale.domain([0, d.data.count]);

            expand(d, 4);

            // redraw
            update(d);
            centerNode(d);

            function setSelected(d, value) {
                d.selected = value;
                if (d.children) {
                    d.children.forEach(function (c) {
                        setSelected(c, value);
                    });
                } else if (d._children) {
                    d._children.forEach(function (c) {
                        setSelected(c, value);
                    });
                }
            }
        }

        // Zoom function
        function zoom() {
            zoomEnd = Date.now();
            svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }

        // Center a node
        function centerNode(source) {
            let scale = zoomListener.scale(),
                x = -source.y0,
                y = -source.x0;
            x = x * scale + width / 8;
            y = y * scale + height / 2;
            svg.transition()
                .duration(duration)
                .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
            zoomListener.scale(scale);
            zoomListener.translate([x, y]);
        }
    }
}

export {initSequenceShow};
