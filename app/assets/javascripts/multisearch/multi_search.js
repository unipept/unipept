function init_multi(data, sequences, missed, equate_il) {

    constructMultisearch({
        data : data,
        equateIL : equate_il,
        missed : missed,
        sequences : sequences});

    $("#downloadDataset").click(function () {
        // Track the download button
        logToGoogle("Multi Peptide", "Export");

        var nonce = Math.random();
        $("#nonce").val(nonce);
        $("#downloadDataset").button('loading');
        var downloadTimer = setInterval(function () {
            if (document.cookie.indexOf(nonce) !== -1) {
                $("#downloadDataset").button('reset');
                clearInterval(downloadTimer);
            }
        }, 1000);
        return true;
    });

    // set up the fullscreen stuff
    if (fullScreenApi.supportsFullScreen) {
        $("#buttons").prepend("<button id='zoom-btn' class='btn btn-default btn-xs'><span class='glyphicon glyphicon-resize-full'></span> Enter full screen</button>");
        $("#zoom-btn").click(function () {
            if ($(".tab-content .active").attr('id') === "sunburstWrapper") {
                logToGoogle("Multi Peptide", "Full Screen", "Sunburst");
                window.fullScreenApi.requestFullScreen($("#sunburst").get(0));
            } else if ($(".tab-content .active").attr('id') === "d3TreeMapWrapper") {
                logToGoogle("Multi Peptide", "Full Screen", "Treemap");
                window.fullScreenApi.requestFullScreen($("#d3TreeMap").get(0));
            } else {
                logToGoogle("Multi Peptide", "Full Screen", "Treeview");
                window.fullScreenApi.requestFullScreen($("#d3TreeView").get(0));
            }
        });
        $(document).bind(fullScreenApi.fullScreenEventName, resizeFullScreen);
    }

    function resizeFullScreen() {
        if ($(".tab-content .active").attr('id') === "sunburstWrapper") {
            setTimeout(function () {
                var size = 740,
                    destination = "body";
                if (window.fullScreenApi.isFullScreen()) {
                    size = Math.min($(window).height(), $(window).width());
                    destination = "#sunburst";
                }
                $("#sunburst svg").attr("width", size);
                $("#sunburst svg").attr("height", size);
                $("#sunburst-tooltip").appendTo(destination);
            }, 1000);
        } else if ($(".tab-content .active").attr('id') === "d3TreeMapWrapper") {
            var destination = "body";
            if (window.fullScreenApi.isFullScreen()) {
                destination = "#d3TreeMap";
            }
            $("#treemap-tooltip").appendTo(destination);
        } else {
            setTimeout(function () {
                var width = 916,
                    height = 600,
                    destination = "body";
                if (window.fullScreenApi.isFullScreen()) {
                    width = $(window).width();
                    height = $(window).height();
                    destination = "#d3TreeView";
                }
                $("#d3TreeView svg").attr("width", width);
                $("#d3TreeView svg").attr("height", height);
                $("#treeview-tooltip").appendTo(destination);
            }, 1000);
        }
    }

    // set up save image stuff
    $("#buttons").prepend("<button id='save-btn' class='btn btn-default btn-xs'><span class='glyphicon glyphicon-download'></span> Save as image</button>");
    $("#save-btn").click(function () {
        $(".debug_dump").hide();
        if ($(".tab-content .active").attr('id') === "sunburstWrapper") {
            d3.selectAll(".toHide").attr("class", "hidden");
            logToGoogle("Multi Peptide", "Save Image", "Sunburst");
            triggerDownloadModal("#sunburst svg", null, "unipept_sunburst");
            d3.selectAll(".hidden").attr("class", "toHide");
        } else if ($(".tab-content .active").attr('id') === "d3TreeMapWrapper") {
            logToGoogle("Multi Peptide", "Save Image", "Treemap");
            triggerDownloadModal(null, "#d3TreeMap", "unipept_treemap");
        } else {
            logToGoogle("Multi Peptide", "Save Image", "Treeview");
            triggerDownloadModal("#d3TreeView svg", null, "unipept_treeview");
        }
    });



    // tooltip functions
    function tooltipIn(d, tt, pie) {
        tt.style("visibility", "visible")
            .html(getTooltipContent(d));
        if (pie && d.children && d.children.length > 1) {
            tt.html(tt.html() + "<br><img src='" + getPiechartUrl(d) + "'/>");
        }
    }
    function tooltipMove(tt) {
        var pos = getTooltipPosition();
        tt.style("top", pos.top).style("left", pos.left);
    }
    function tooltipOut(tt) {
        tt.style("visibility", "hidden");
    }
    function getTooltipContent(d) {
        return "<b>" + d.name + "</b> (" + d.data.rank + ")<br/>" +
            (!d.data.self_count ? "0" : d.data.self_count) +
            (d.data.self_count && d.data.self_count === 1 ? " sequence" : " sequences") + " specific to this level<br/>" +
            (!d.data.count ? "0" : d.data.count) +
            (d.data.count && d.data.count === 1 ? " sequence" : " sequences") + " specific to this level or lower";
    }
    function getPiechartUrl(d) {
        var url = "http://chart.apis.google.com/chart?chs=300x225&cht=p&chd=t:";
        url += d.children.map(function (i) { return i.data.count; }).join(",");
        url += "&chdl=";
        url += d.children.map(function (i) { return i.name + " (" + i.data.count + ")"; }).join("|");
        url += "&chds=0,";
        url +=  d3.max(d.children.map(function (i) { return i.data.count; }));
        return url;
    }
    function getTooltipPosition() {
        var pos = {};
        if (window.fullScreenApi.isFullScreen()) {
            pos.top = (d3.event.clientY - 5) + "px";
            pos.left = (d3.event.clientX + 15) + "px";
        } else {
            pos.top = (d3.event.pageY - 5) + "px";
            pos.left = (d3.event.pageX + 15) + "px";
        }
        return pos;
    }


}