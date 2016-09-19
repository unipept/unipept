function init_sequence_show(data) {

    // set up the fancy tree
    initLineageTree(data.tree);

    // fullscreen and save image buttons
    var buttons = ['lineage-tree']

    // set up the fullscreen stuff
    setUpFullScreen(buttons);

    // set up save image stuff
    setUpImageSave(buttons);

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
                });
            }, 1000);
        }
    }

    /**
     * Inits the lineage tree
     */
    function initLineageTree(jsonData) {
        var margin = {
                top: 5,
                right: 5,
                bottom: 5,
                left: 60
            },
            width = 916 - margin.right - margin.left,
            height = 600 - margin.top - margin.bottom;

        var zoomEnd = 0,
            i = 0,
            duration = 750,
            root;

        var tree = d3.layout.tree()
            .nodeSize([2, 105])
            .separation(function (a, b) {
                var width = (nodeSize(a) + nodeSize(b)),
                    distance = width / 2 + 4;
                return (a.parent === b.parent) ? distance : distance + 4;
            });

        var diagonal = d3.svg.diagonal()
            .projection(function (d) {
                return [d.y, d.x];
            });

        var widthScale = d3.scale.linear().range([2, 105]);

        // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
        var zoomListener = d3.behavior.zoom()
            .scaleExtent([0.1, 3])
            .on("zoom", zoom);

        var svg = d3.select("#lineageTree").append("svg")
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

            var LCA;

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
            var nodes = tree.nodes(root).reverse(),
                links = tree.links(nodes);

            // Normalize for fixed-depth.
            nodes.forEach(function (d) {
                d.y = d.depth * 180;
            });

            // Update the nodes
            var node = svg.selectAll("g.node")
                .data(nodes, function (d) {
                    return d.id || (d.id = ++i);
                });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
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
            var nodeUpdate = node.transition()
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
            var nodeExit = node.exit().transition()
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
            var link = svg.selectAll("path.link")
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
                    var o = {
                        x: (source.x0 || 0),
                        y: (source.y0 || 0)
                    };
                    return diagonal({
                        source: o,
                        target: o
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
                    var o = {
                        x: source.x,
                        y: source.y
                    };
                    return diagonal({
                        source: o,
                        target: o
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
            var local_i = i;
            if (typeof local_i === "undefined") {
                local_i = 1;
            }
            if (local_i > 0) {
                if (d._children) {
                    d.children = d._children;
                    d._children = null;
                }
                if (d.children) {
                    d.children.forEach(function (c) {
                        expand(c, local_i - 1);
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
            var scale = zoomListener.scale(),
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
