function init_sequence_show(data, lcaId) {

    // set up the tree
    var st = setUpTree(data);

    // set up the fancy tree
    initFancyTree(data);

    // set up the fullscreen stuff
    setUpFullScreen();

    // set up save image stuff
    setUpImageSave();

    // enable the external link popovers
    addExternalLinks();

    // add the tab help
    initHelp();


    /******************* Functions ***********************/

    /**
     * Initializes the help popups
     */
    function initHelp() {
        // tab help
        $(".nav-tabs li a span").on("mouseover", function () {
            if ($(this).parent().attr("id") === "lineage-tree-tab") {
                $("#lineage-tree-help").show();
                $("#lineage-table-help").hide();
            } else {
                $("#lineage-table-help").show();
                $("#lineage-tree-help").hide();
            }
            $("#tab-help").stop(true, true).fadeIn(200);
        });
        $(".nav-tabs li a span").on("mouseout", function () {
            $("#tab-help").stop(true, true).fadeOut(200);
        });
    }

    function addExternalLinks() {
        // Add handler to the autosort-button
        $(".externalLinks-button").parent().mouseenter(function () {
            console.log('enter');
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

    /**
     * Sets up the image save stuff
     */
    function setUpImageSave() {
        $("#buttons-single").prepend("<button id='save-btn-lineage' class='btn btn-default btn-xs'><span class='glyphicon glyphicon-download'></span> Save tree as image</button>");
        $("#save-btn-lineage").click(function () {
            logToGoogle("Single Peptide", "Save Image");
            triggerDownloadModal(null, "#lineageTree", "unipept_lineage");
        });
    }

    /**
     * Sets up the full screen stuff
     */
    function setUpFullScreen() {
        if (fullScreenApi.supportsFullScreen) {
            $("#buttons-single").prepend("<button id='zoom-btn-lineage' class='btn btn-default btn-xs'><span class='glyphicon glyphicon-resize-full'></span> Enter full screen</button>");
            $("#zoom-btn-lineage").click(function () {
                logToGoogle("Single Peptide", "Full Screen");

                window.fullScreenApi.requestFullScreen($("#lineageTree").get(0));
            });
            $(document).bind(fullScreenApi.fullScreenEventName, resizeFullScreen);
        }
        function resizeFullScreen() {
            setTimeout(function () {
                var height = 500;
                if (window.fullScreenApi.isFullScreen()) {
                    height = $(window).height();
                    $("#lineageTree").height(height);
                    st.config.levelsToShow = 50;
                }
                else {
                    $("#lineageTree").height(500);
                    st.config.levelsToShow = 4;
                }
                st.canvas.resize($("#lineageTree").width(), height);
                st.refresh();
            }, 1000);
        }
    }

    /**
     * Draws the lineage tree
     */
    function setUpTree(data) {
        // Create a new SpaceTree instance
        st = new $jit.ST({
            injectInto: 'lineageTree',
            // id of viz container element
            duration: 800,
            // set duration for the animation
            transition: $jit.Trans.Quart.easeInOut,
            // set animation transition type
            levelDistance: 50,
            // set distance between node and its children
            levelsToShow: 4,
            // offsetY: 170,
            // orientation: 'top',
            offsetX: 350,

            // enable panning
            Navigation: {
                enable: true,
                panning: true
            },

            // set node and edge styles
            Node: {
                autoHeight: true,
                // autoWidth: true,
                width: 100,
                // also change the CSS .node property if you change this!
                type: 'rectangle',
                color: '#DCDFE4',
                overridable: true,
                align: 'center'
            },

            Edge: {
                type: 'bezier',
                color: '#DCDFE4',
                overridable: true
            },

            // This method is called on DOM label creation.
            // Use this method to add event handlers and styles to
            // your node.
            onCreateLabel: function (label, node) {
                label.id = node.id;
                label.innerHTML = node.name;
                label.onclick = function () {
                    st.onClick(node.id);
                    // st.setRoot(node.id, 'animate');
                };
                // set label styles => TODO: fix the labels with these settings instead of CSS
                var style = label.style;
                style.width = '60px';
                style.height = '17px';
                style.cursor = 'pointer';
                style.color = '#333';
                style.fontSize = '0.8em';
                style.textAlign = 'center';
                style.paddingTop = '3px';
            },

            // This method is called right before plotting
            // a node. It's useful for changing an individual node
            // style properties before plotting it.
            // The data properties prefixed with a dollar
            // sign will override the global node style properties.
            onBeforePlotNode: function (node) {
                // add some color to the nodes in the path between the
                // root node and the selected node.
                if (node.selected) {
                    node.data.$color = "#bbb";
                }
                else {
                    delete node.data.$color;
                    // if the node belongs to the last plotted level
                    /*if(!node.anySubnode("exist")) {
                        // count children number
                        var count = 0;
                        node.eachSubnode(function(n) { count++; });
                        // assign a node color based on
                        // how many children it has
                        node.data.$color = ['#aaa', '#baa', '#caa', '#daa', '#eaa', '#faa'][count];
                    }*/
                }
            }

            // This method is called right before plotting
            // an edge. It's useful for changing an individual edge
            // style properties before plotting it.
            // Edge data proprties prefixed with a dollar sign will
            // override the Edge global style properties.
            /*onBeforePlotLine: function (adj) {
                if (adj.nodeFrom.selected && adj.nodeTo.selected) {
                    adj.data.$color = "#eed";
                    adj.data.$lineWidth = 3;
                } else {
                    delete adj.data.$color;
                    delete adj.data.$lineWidth;
                }
            }*/
        });
        // load json data
        st.loadJSON(data);

        // compute node positions and layout
        st.compute();

        // optional: make a translation of the tree
        st.geom.translate(new $jit.Complex(-200, 0), "current");

        // emulate a click on the root node.
        try {
            if (lcaId == 1) {
                lcaId = data.id;
            }
            st.onClick(lcaId);
        }
        catch (err) {
            error(err.message, "Something went wrong while loading the lineage tree.");
        }

        // disable the text selection of tree nodes
        $("#lineageTree").disableSelection();

        return st;
    }

    /**
     * Inits the fancy tree
     */
    function initFancyTree(jsonData) {
        var margin = {top: 5, right: 5, bottom: 5, left: 60},
            width = 916 - margin.right - margin.left,
            height = 600 - margin.top - margin.bottom;

        var rightClicked,
            zoomEnd = 0,
            tooltipTimer;

        var i = 0,
            duration = 750,
            root;

        var tooltip = d3.select("body")
            .append("div")
            .attr("id", "treeview-tooltip")
            .attr("class", "tip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden");

        var tree = d3.layout.tree()
            .size([height, width]);

        var diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.y, d.x]; });

        var widthScale = d3.scale.linear().range([2,105]);

        // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
        var zoomListener = d3.behavior.zoom()
            .scaleExtent([0.1, 3])
            .on("zoom", zoom);

        var svg = d3.select("#fancyTree").append("svg")
            .attr("version", "1.1")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("viewBox", "0 0 " + (width + margin.right + margin.left) + " " + (height + margin.top + margin.bottom))
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .call(zoomListener)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .append("g");

        draw(jsonData)

        function draw(data) {
            root = data;
            root.x0 = height / 2;
            root.y0 = 0;

            // add counts
            function addCounts(d) {
                if (d.children && d.children.length > 0) {
                    d.children.forEach(addCounts);
                    d.data.count = d.children.map(function (e) {return e.data.count;}).reduce(function (a,b) {return a + b;});
                } else {
                    d.data.count = 1;
                }
            }
            addCounts(root);
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
                } else if (d.name == "Bacteria") {
                    d.color = "#1f77b4"; // blue
                } else if (d.name == "Archaea") {
                    d.color = "#ff7f0e"; // orange
                } else if (d.name == "Eukaryota") {
                    d.color = "#2ca02c"; // green
                } else if (d.name == "Viruses") {
                    d.color = "#d6616b"; // red
                }
                if (d.children) {
                    d.children.forEach( function (node) { color(node, d.color); });
                }
            }
            root.children.forEach( function (node) {color(node); });

            // collapse everything
            function collapseAll(d) {
                if (d.children && d.children.length == 0) {
                    d.children = null;
                }
                if (d.children) {
                    d._children = d.children;
                    d._children.forEach(collapseAll);
                    d.children = null;
                }
            }
            collapseAll(root);
            expand(root);

            update(root);
        };

        d3.select(self.frameElement).style("height", "800px");

        function update(source) {

          // Compute the new tree layout.
          var nodes = tree.nodes(root).reverse(),
              links = tree.links(nodes);

          // Normalize for fixed-depth.
          nodes.forEach(function(d) { d.y = d.depth * 180; });

          // Update the nodes…
          var node = svg.selectAll("g.node")
              .data(nodes, function(d) { return d.id || (d.id = ++i); });

          // Enter any new nodes at the parent's previous position.
          var nodeEnter = node.enter().append("g")
              .attr("class", "node")
              .style("cursor", "pointer")
              .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
              .on("click", click)
              .on("mouseover", tooltipIn)
              .on("mouseout", tooltipOut)
              .on("contextmenu",rightClick);

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
              .style("fill", function(d) {
                  if (d.selected) {
                      return d._children ? d.color || "#aaa" : "#fff";
                  } else {
                      return "#aaa";
                  }

              });

          nodeEnter.append("text")
              .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
              .attr("dy", ".35em")
              .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
              .text(function(d) { return d.name; })
              .style("font", "10px sans-serif")
              .style("fill-opacity", 1e-6);

          // Transition nodes to their new position.
          var nodeUpdate = node.transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

          nodeUpdate.select("circle")
              .attr("r", function(d) {
                  if (d.selected) {
                      return widthScale(d.data.count) / 2;
                  } else {
                      return 2;
                  }

              })
              .style("fill-opacity", function(d) { return d._children ? 1 : 0; })
              .style("stroke", function (d) {
                  if (d.selected) {
                      return d.color || "#aaa";
                  } else {
                      return "#aaa";
                  }
              })
              .style("fill", function(d) {
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
              .attr("transform", function (d) { return "translate(" + source.y + "," + source.x + ")"; })
              .remove();

          nodeExit.select("circle")
              .attr("r", 1e-6);

          nodeExit.select("text")
              .style("fill-opacity", 1e-6);

          // Update the links…
          var link = svg.selectAll("path.link")
              .data(links, function (d) { return d.target.id; });

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
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
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
              .attr("d", function(d) {
                var o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
              })
              .remove();

          // Stash the old positions for transition.
          nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
          });
        }

        // Expands a node and its children
        function expand(d) {
            if (d._children) {
                d.children = d._children;
                d._children = null;
            }
            if (d.children) {
                d.children.forEach(function (c) {
                    if (c._children) {
                        c.children = c._children;
                        c._children = null;
                    }
                });
            }
        }

        // Collapses a node
        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            }
        }

        // Toggle children on click.
        function click(d) {
            // check if click is triggered by panning on a node
            if (Date.now() - zoomEnd < 200) return;

            if (d.children) {
                collapse(d);
            } else {
                expand(d);
            }
            update(d);
            centerNode(d);
        }

        // Sets the width of the right clicked node to 100%
        function rightClick(d) {
            if (d === rightClicked && d !== root) {
                rightClick(root);
                return;
            }
            rightClicked = d;

            // set Selection properties
            setSelected(root, false);
            setSelected(d, true);

            // scale the lines
            widthScale.domain([0, d.data.count]);

            expand(d);

            // redraw
            d3.event.preventDefault();
            update(d);
            centerNode(d);

            function setSelected(d, value) {
                d.selected = value;
                if (d.children) {
                    d.children.forEach(function (c) {setSelected(c, value);});
                } else if (d._children) {
                    d._children.forEach(function (c) {setSelected(c, value);});
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
            x = x * scale + width / 2;
            y = y * scale + height / 2;
            svg.transition()
                .duration(duration)
                .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
            zoomListener.scale(scale);
            zoomListener.translate([x, y]);
        }

        // tooltip functions
        function tooltipIn(d, i) {
            tooltip.html("<b>" + d.name + "</b> (" + d.data.rank + ")<br/>" +
                    (!d.data.self_count ? "0" : d.data.self_count) +
                    (d.data.self_count && d.data.self_count === 1 ? " sequence" : " sequences") + " specific to this level<br/>" +
                    (!d.data.count ? "0" : d.data.count) +
                    (d.data.count && d.data.count === 1 ? " sequence" : " sequences") + " specific to this level or lower");
                if (window.fullScreenApi.isFullScreen()) {
                    tooltip.style("top", (d3.event.clientY - 5) + "px").style("left", (d3.event.clientX + 15) + "px");
                } else {
                    tooltip.style("top", (d3.event.pageY - 5) + "px").style("left", (d3.event.pageX + 15) + "px");
                }

            tooltipTimer = setTimeout(function () {
                tooltip.style("visibility", "visible");
            }, 1000);

        }
        function tooltipOut(d, i) {
            clearTimeout(tooltipTimer)
            tooltip.style("visibility", "hidden");
        }
    }

}