//= require jquery
//= require jquery-ui
//= require jquery_ujs
//= require_self
//= require_directory .
//= require vendor

// highlights the background color
// of the given element for 2 seconds
function highlight(element) {
    $(element).addClass("flash");
    setTimeout(function () { $(element).removeClass("flash"); }, 2000);
}

/*
 * Returns the brightness of an rgb-color
 * from: http:// www.w3.org/WAI/ER/WD-AERT/#color-contrast
 */
function brightness(rgb) {
    return rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;
}

/*
 * Returns the readable text color based on the brightness of a given backgroud color
 */
function getReadableColorFor(color) {
    var textColor;
    try {
        textColor = brightness(d3.rgb(color)) < 125 ? "#eee" : "#000";
    } catch (err) {
        textColor = "#000";
    }
    return textColor;
}

// function used to remove fields in the datasets form
function remove_fields(link) {
    $(link).prev("input[type=hidden]").val("1");
    $(link).closest(".fields").hide();
}

// function used to add field in the datasets form
function add_fields(link, association, content) {
    var new_id = new Date().getTime();
    var regexp = new RegExp("new_" + association, "g");
    $(link).parent().parent().before(content.replace(regexp, new_id));
}

/**
 * Triggers the image export modal.
 *
 * If an svgSelector is present, sends the SVG-code to the server to convert
 * it to a PNG. The server return a data URL containing the PNG data.
 * In an canvasSelector is present, uses html2canvas to convert it to a PNG.
 * A modal dialog is shown containing the image and buttons
 * to download the image as PNG and SVG if present.
 *
 * @param <String> svgSelector The DOM selector of the SVG
 * @param <String> canvasSelector The DOM selector of the canvas
 * @param <String> baseFileName The requested file name
 */
function triggerDownloadModal(svgSelector, canvasSelector, baseFileName) {
    var $buttons = $("#save-as-modal .buttons"),
        svg;

    $buttons.html("");
    if (svgSelector) {
        svg = $(svgSelector).wrap("<div></div>").parent().html();

        // Send the SVG code to the server for png conversion
        $.post("/convert", { image: svg }, function (data) {
            $("#save-as-modal .image").html("<img src='" + data + "' />");
            $("#save-as-modal").modal();
        });

        $buttons.append("<button id='download-svg' class='btn btn-primary'><i class='glyphicon glyphicon-download'></i> Download as SVG</button>");
    }
    if (canvasSelector) {
        html2canvas($(canvasSelector), {
            onrendered : function (canvas) {
                $("#save-as-modal .image").html("<img src='" + canvas.toDataURL() + "' />");
                $("#save-as-modal").modal();
            }
        });
    }
    $buttons.append("<button id='download-png' class='btn btn-primary'><i class='glyphicon glyphicon-download'></i> Download as PNG</button>");

    $("#download-svg").click(function () {
         downloadDataByForm(svg, baseFileName + ".svg");
    });
    $("#download-png").click(function () {
        downloadDataByLink($("#save-as-modal .image img").attr("src"), baseFileName + ".png");
    });
}

/**
 * Triggers a file download in the browser using a hidden
 * form and a server round trip.
 *
 * @param <String> data The text you want in the file
 * @param <String> filename The requested file name
 */
function downloadDataByForm(data, fileName) {
    var $downloadForm;
    $("form.download").remove();
    $("body").append("<form class='download' method='post' action='/download'></form>");
    $downloadForm = $("form.download").append("<input type='hidden' name='filename' value='" + fileName + "'/>");
    $downloadForm.append("<input type='hidden' name='data' class='data'/>");
    $downloadForm.find(".data").val(data);
    $downloadForm.submit();
}

/**
 * Triggers a file download in the browser using a hidden
 * link and a data url.
 *
 * The download attribute doesn't work in IE and Safari:
 * http://caniuse.com/#feat=download
 *
 * @param <String> dataURL The dataURL of the data
 * @param <String> filename The requested file name
 */
function downloadDataByLink(dataURL, fileName) {
    var $downloadLink;
    $("a.downloadLink").remove();
    $("body").append("<a class='downloadLink' style='display:none;' download='" + fileName + "' target='_blank'/>");
    $downloadLink = $("a.downloadLink").attr("href", dataURL);
    $downloadLink[0].click();
}

/* function for error handling.
 * first parameter is the error that gets logged to the console
 * second parameter is optional message to display to the user
 */
function error(error, userMessage) {
    if (error !== null) {
        qbaka.report(error);
        if (typeof console != "undefined") {
            console.error(error);
        }
    }
    if (userMessage) {
        var msg = $("<div class='alert alert-error' style='display: none;'><strong>Oh snap!</strong> " + userMessage + "</div>");
        $("#messages").append(msg);
        msg.show("normal");
    }
}

/* display the message variable in an info alert
 */
function info(message) {
    var msg = $("<div class='alert alert-info' style='display: none;'><strong>Heads up!</strong> " + message + "</div>");
    $("#messages").append(msg);
    msg.show("normal");
}

/*
 * Function to delay some other function until it isn't
 * called for "ms" ms
 */
var delay = (function () {
    var timer = 0;
    return function (callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
})();

/*
 * add an object called fullScreenApi until the fullscreen API gets finalized
 * from: http://johndyer.name/native-fullscreen-javascript-api-plus-jquery-plugin/
 */
(function () {
    var fullScreenApi = {
            supportsFullScreen: false,
            isFullScreen: function () { return false; },
            requestFullScreen: function () {},
            cancelFullScreen: function () {},
            fullScreenEventName: '',
            prefix: ''
        },
        browserPrefixes = 'webkit moz o ms khtml'.split(' '),
        i;

    // check for native support
    if (typeof document.cancelFullScreen != 'undefined') {
        fullScreenApi.supportsFullScreen = true;
    } else {
        // check for fullscreen support by vendor prefix
        for (i = 0, il = browserPrefixes.length; i < il; i++) {
            fullScreenApi.prefix = browserPrefixes[i];

            if (typeof document[fullScreenApi.prefix + 'CancelFullScreen'] != 'undefined') {
                fullScreenApi.supportsFullScreen = true;
                break;
            }
        }
    }

    // update methods to do something useful
    if (fullScreenApi.supportsFullScreen) {
        fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';

        fullScreenApi.isFullScreen = function () {
            switch (this.prefix) {
                case '':
                    return document.fullScreen;
                case 'webkit':
                    return document.webkitIsFullScreen;
                default:
                    return document[this.prefix + 'FullScreen'];
            }
        };
        fullScreenApi.requestFullScreen = function (el) {
            return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
        };
        fullScreenApi.cancelFullScreen = function (el) {
            return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
        };
    }

    // jQuery plugin
    if (typeof jQuery != 'undefined') {
        jQuery.fn.requestFullScreen = function () {
            return this.each(function () {
                if (fullScreenApi.supportsFullScreen) {
                    fullScreenApi.requestFullScreen(this);
                }
            });
        };
    }

    // export api
    window.fullScreenApi = fullScreenApi;
})();
