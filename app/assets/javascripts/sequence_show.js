function init_sequence_show(data, lcaId) {

    // set up the tree
    var st = setUpTree(data);

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

}