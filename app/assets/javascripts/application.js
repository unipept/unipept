//= require jquery
//= require jquery.ui.draggable
//= require jquery.ui.droppable
//= require jquery.ui.sortable
//= require jquery_ujs
//= require zeroclipboard
//= require_self
//= require_directory .
//= require_directory ./peptidome
//= require vendor

// zeroclipboard config
ZeroClipboard.config({
    hoverClass: 'btn-clipboard-hover'
});

function addCopy(selector, textFunction) {
    var copyMissed = new ZeroClipboard(selector);
    var htmlBridge = $('#global-zeroclipboard-html-bridge');
    copyMissed.on('ready', function () {
        htmlBridge
          .data('placement', 'top')
          .attr('title', 'Copy to clipboard')
          .tooltip();
    });
    // Copy to clipboard
    copyMissed.on('copy', function (client) {
      copyMissed.setText(textFunction.call());
    });
    // Notify copy success and reset tooltip title
    copyMissed.on('aftercopy', function () {
        htmlBridge
          .attr('title', 'Copied!')
          .tooltip('fixTitle')
          .tooltip('show')
          .attr('title', 'Copy to clipboard')
          .tooltip('fixTitle');
    });
    // Notify copy failure
    copyMissed.on('error', function (e) {
        selector.first()
          .data('placement', 'top')
          .attr('title', 'Flash is required')
          .tooltip('fixTitle')
          .tooltip("show");
    });
}

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
        $image = $("#save-as-modal .image"),
        svg;

    // Reset the modal and show it
    $buttons.html("<h3>Please wait while we create your image</h3>");
    $image.html("<h3>Loading preview...</h3>" +
        "<div class='progress progress-striped active'>" +
        "<div class='progress-bar'  style='width: 65%'></div></div>");
    $("#save-as-modal").modal();

    // Generate the image
    if (svgSelector) {
        // Send the SVG code to the server for png conversion
        svg = $(svgSelector).wrap("<div></div>").parent().html();
        $.post("/convert", { image: svg }, showImage);
    }
    if (canvasSelector) {
        // Use html2canvas to convert canvas to dataURL
        html2canvas($(canvasSelector), {
            onrendered : function (canvas) {
                showImage(canvas.toDataURL());
            }
        });
    }

    // Show the image and add buttons
    function showImage(dataURL) {
        $image.html("<img src='" + dataURL + "' />");
        $buttons.empty();
        if (svgSelector) {
            $buttons.append("<button id='download-svg' class='btn btn-primary'><span class='glyphicon glyphicon-download'></span> Download as SVG</button>");
            $("#download-svg").click(function () {
                downloadDataByForm(svg, baseFileName + ".svg");
            });
        }
        $buttons.append("<button id='download-png' class='btn btn-primary'><span class='glyphicon glyphicon-download'></span> Download as PNG</button>");
        $("#download-png").click(function () {
            downloadDataByLink($("#save-as-modal .image img").attr("src"), baseFileName + ".png");
        });
    }
}

/**
 * Triggers a file download in the browser using a hidden
 * form and a server round trip. Fires an optional callback
 * when the file starts downloading
 *
 * @param <String> data The text you want in the file
 * @param <String> filename The requested file name
 * @param <Function> callback Optional callback that gets
 *          fired when the file starts downloading
 */
function downloadDataByForm(data, fileName, callback) {
    var nonce = Math.random(),
        downloadTimer,
        $downloadForm;
    $("form.download").remove();
    $("body").append("<form class='download' method='post' action='/download'></form>");
    $downloadForm = $("form.download").append("<input type='hidden' name='filename' value='" + fileName + "'/>");
    $downloadForm.append("<input type='hidden' name='data' class='data'/>");
    $downloadForm.append("<input type='hidden' name='nonce' value='" + nonce + "'/>");
    $downloadForm.find(".data").val(data);
    $downloadForm.submit();
    if (callback) {
        downloadTimer = setInterval(function checkCookie() {
            if (document.cookie.indexOf(nonce) != -1) {
                callback();
                clearInterval(downloadTimer);
            }
        }, 100);
    }
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
function error(errorMessage, userMessage) {
    if (errorMessage !== null) {
        logErrorToGoogle(errorMessage);
        if (typeof console != "undefined") {
            console.error(errorMessage);
        }
    }
    if (userMessage) {
        var msg = $("<div class='alert alert-danger' style='display: none;'><strong>Oh snap!</strong> " + userMessage + "</div>");
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
 * Logs a message as exception to Google Analytics
 */
function logErrorToGoogle(errorMessage) {
    logToGoogle("Global", "Exception", errorMessage);
}

/*
 * Logs data to Google Analytics
 */
function logToGoogle(page, action, name, value) {
    if (typeof(_gaq) !== "undefined") {
        if (name === undefined) {
            _gaq.push(['_trackEvent', page, action]);
        } else if (value === undefined) {
            _gaq.push(['_trackEvent', page, action, name]);
        } else {
            _gaq.push(['_trackEvent', page, action, name, value]);
        }
    }
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

/**
 * Hash function for strings from
 * http://stackoverflow.com/a/15710692/865696
 */
function stringHash(s){
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
}

/**
 * Array map polyfill from
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map#Polyfill
 * Only needed for IE8
 */
(function () {
    if (!Array.prototype.map) {
      Array.prototype.map = function(callback, thisArg) {
        var T, A, k;
        if (this == null) {
          throw new TypeError(' this is null or not defined');
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if (typeof callback !== 'function') {
          throw new TypeError(callback + ' is not a function');
        }
        if (arguments.length > 1) {
          T = thisArg;
        }
        A = new Array(len);
        k = 0;
        while (k < len) {
          var kValue, mappedValue;
          if (k in O) {
            kValue = O[k];
            mappedValue = callback.call(T, kValue, k, O);
            A[k] = mappedValue;
          }
          k++;
        }
        return A;
      };
    }
})();

/**
 * Array reduce polyfill from
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#Polyfill
 * Only needed for IE8
 */
(function () {
    if ( 'function' !== typeof Array.prototype.reduce ) {
        Array.prototype.reduce = function( callback /*, initialValue*/ ) {
            'use strict';
            if ( null === this || 'undefined' === typeof this ) {
                throw new TypeError('Array.prototype.reduce called on null or undefined' );
            }
            if ( 'function' !== typeof callback ) {
                throw new TypeError( callback + ' is not a function' );
            }
            var t = Object( this ), len = t.length >>> 0, k = 0, value;
            if ( arguments.length >= 2 ) {
                value = arguments[1];
            } else {
                while ( k < len && ! k in t ) k++;
                if ( k >= len ) {
                    throw new TypeError('Reduce of empty array with no initial value');
                }
                value = t[ k++ ];
            }
            for ( ; k < len ; k++ ) {
                if ( k in t ) {
                    value = callback( value, t[k], k, t );
                }
            }
            return value;
        };
    }
})();

/*
 * add an object called fullScreenApi until the fullscreen API gets finalized
 * from: http://johndyer.name/native-fullscreen-javascript-api-plus-jquery-plugin/
 *
 * heavily adapted to support IE11 and the new specs
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
    if (typeof document.exitFullScreen != 'undefined') {
        fullScreenApi.supportsFullScreen = true;
    } else {
        // check for fullscreen support by vendor prefix
        for (i = 0, il = browserPrefixes.length; i < il; i++) {
            fullScreenApi.prefix = browserPrefixes[i];

            if (typeof document[fullScreenApi.prefix + 'CancelFullScreen'] != 'undefined') {
                fullScreenApi.supportsFullScreen = true;
                break;
            }
            if (typeof document[fullScreenApi.prefix + 'ExitFullscreen'] != 'undefined') {
                fullScreenApi.supportsFullScreen = true;
                break;
            }
        }
    }

    // update methods to do something useful
    if (fullScreenApi.supportsFullScreen) {
        fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
        if (fullScreenApi.prefix === "ms") {
            fullScreenApi.fullScreenEventName = "MSFullscreenChange";
        }

        fullScreenApi.isFullScreen = function () {
            switch (this.prefix) {
                case '':
                    return document.fullscreenElement !== null;
                case 'moz':
                    return document.mozFullScreenElement !== null;
                default:
                    return document[this.prefix + 'FullscreenElement'] !== null;
            }
        };
        fullScreenApi.requestFullScreen = function (el) {
            switch (this.prefix) {
                case '':
                    return el.requestFullscreen();
                case 'webkit':
                    return el.webkitRequestFullscreen();
                case 'ms':
                    return el.msRequestFullscreen();
                case 'moz':
                    return el.mozRequestFullScreen();
                case 'default':
                    return el[this.prefix + "RequestFullscreen"]();
            }
        };
        fullScreenApi.cancelFullScreen = function (el) {
            switch (this.prefix) {
                case '':
                    return document.exitFullscreen();
                case 'moz':
                    return document.mozCancelFullScreen();
                case 'default':
                    return document[this.prefix + "ExitFullscreen"]();
            }
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

/**
 * requestAnimationFrame shim
 * source: http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
                window.setTimeout(callback, 1000 / 60);
            };
})();

/**
 * Catches all errors, displays them in console and
 * logs them to Google Analytics
 */
window.onerror = function(message, file, line) {
    var e = file + '(' + line + '): ' + message;
    if (typeof console != "undefined") {
        console.error(e);
    }
    logErrorToGoogle(e);
};
