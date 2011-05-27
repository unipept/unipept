var labelType,
useGradients,
nativeTextSupport,
animate;

 (function() {
    var ua = navigator.userAgent,
    iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
    typeOfCanvas = typeof HTMLCanvasElement,
    nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
    textSupport = nativeCanvasSupport
    && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
    //I'm setting this based on the fact that ExCanvas provides text support for IE
    //and that as of today iPhone/iPad current text support is lame
    labelType = (!nativeCanvasSupport || (textSupport && !iStuff)) ? 'Native': 'HTML';
    nativeTextSupport = labelType == 'Native';
    useGradients = nativeCanvasSupport;
    animate = !(iStuff || !nativeCanvasSupport);
})();

function init(data) {
    //treemap
    initTreeMap(data);

    //jstree
    initJsTree(data);
}

function initTreeMap(data) {
    //init TreeMap
    var tm = new $jit.TM.Squarified({
        //where to inject the visualization
        injectInto: 'treeMap',
        //parent box title heights
        titleHeight: 15,
        //enable animations
        animate: animate,
        //box offsets
        offset: 0,
        //constrained: true,
        //levelsToShow: 1,
        //Attach left and right click events
        Events: {
            enable: true,
            onClick: function(node) {
                if (node) {
                    tm.enter(node);
                    $("#jstree_search").val(node.name);
                    $("#jstree_search").change();
                }
            },
            onRightClick: function() {
                tm.out();
            }
        },
        duration: 1000,
        //Enable tips
        Tips: {
            enable: true,
            //add positioning offsets
            offsetX: 20,
            offsetY: 20,
            //implement the onShow method to
            //add content to the tooltip when a node
            //is hovered
            onShow: function(tip, node, isLeaf, domElement) {
                var title = "";
                if (node.data.count != 0)
                title = node.name + " (" + node.data.count + ")";
                else
                title = node.name;
                var html = "<div class=\"tip-title\">" + title
                + "</div><div class=\"tip-text\"></div>";
                var data = node.data;
                tip.innerHTML = html;
            }
        },

        //Add the name of the node in the correponding label
        //This method is called once, on label creation.
        onCreateLabel: function(domElement, node) {
            if (node.data.count != 0)
            domElement.innerHTML = node.name + " (" + node.data.count + ")";
            else
            domElement.innerHTML = node.name;
            var style = domElement.style;
            style.display = '';
            style.border = '2px solid transparent';
            domElement.onmouseover = function() {
                style.border = '2px solid #9FD4FF';
            };
            domElement.onmouseout = function() {
                style.border = '2px solid transparent';
            };
        }
    });
    tm.loadJSON(data);
    tm.refresh();
    //end
}

function initJsTree(data) {
    //set themes dir
    $.jstree._themes = "/javascripts/jstree/themes/";

    //add onSelect action
    $("#jstree").bind("select_node.jstree",
    function(node, tree) {
        var peptides = $(tree.rslt.obj).data();
        var margin = tree.rslt.obj.context.offsetTop - $("#jstree").offset().top;
        var innertext = $(tree.rslt.obj).find("a").text().split("(")[0];
        innertext += " (" + $(tree.rslt.obj).attr("title") + ")";
        var infoPane = $("#jstree_data").html("<h3>" + innertext + "</h3>");
        $("#jstree_data").animate({
            marginTop: margin
        },
        1000);
        var ownSequences = peptides.own_sequences
        if (ownSequences && ownSequences.length > 0) {
            var list = infoPane.append("<h4>Sequences speficic to this level</h4><ul></ul>").find("ul").last();
            for (var peptide in ownSequences) {
                list.append("<li><a href='/sequences/" + ownSequences[peptide] + "' target='_blank'>" + ownSequences[peptide] + "</a></li>")
            }
        }
        var allSequences = peptides.all_sequences
        if (allSequences && allSequences.length > 0) {
            var list = infoPane.append("<h4>Sequences speficic to this level or lower</h4><ul></ul>").find("ul").last();
            for (var peptide in allSequences) {
                list.append("<li><a href='/sequences/" + allSequences[peptide] + "' target='_blank'>" + allSequences[peptide] + "</a></li>")
            }
        }
    });

    //fix leafs
    $("#jstree").bind("loaded.jstree",
    function(event, data) {
        $("#jstree li").not(":has(li)").addClass("jstree-leaf");
    });

    //add search
    $("#jstree_search").keyup(function() {
        $("#jstree").jstree("search", ($(this).val()));
        $(".jstree-search").parent().find("li").show();
        $("#jstree ul").each(function() {
            $(this).children("li:visible").eq( - 1).addClass("jstree-last");
        });
    });
    $('#jstree_search').click(function() {
        $(this).keyup();
    });
    $('#jstree_search').change(function() {
        $(this).keyup();
    });

    //create the tree
    $("#jstree").jstree({
        core: {
            "animation": 300
        },
        plugins: ["themes", "json_data", "ui", "search"],
        json_data: {
            "data": data
        },
        themes: {
            "icons": false
        },
        ui: {
            "select_limit": 1
        },
        search: {
            "show_only_matches": true
        }
    });
}