//= require jquery
//= require jquery_ujs
//= require twitter/bootstrap
//= require_self
//= require_tree .
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
    $(link).parent().before(content.replace(regexp, new_id));
}

/* function for error handling.
 * first parameter is the error that gets logged to the console
 * second parameter is optional message to display to the user
 */
function error(error, userMessage) {
    qbaka.report(error);
    if (typeof console != "undefined") {
        console.error(error);
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
 * add an object called fullScreenApi until the fullscreen API gets finalized
 * from: http://johndyer.name/native-fullscreen-javascript-api-plus-jquery-plugin/
 */
 (function() {
     var
         fullScreenApi = {
             supportsFullScreen: false,
             isFullScreen: function() { return false; },
             requestFullScreen: function() {},
             cancelFullScreen: function() {},
             fullScreenEventName: '',
             prefix: ''
         },
         browserPrefixes = 'webkit moz o ms khtml'.split(' ');

     // check for native support
     if (typeof document.cancelFullScreen != 'undefined') {
         fullScreenApi.supportsFullScreen = true;
     } else {
         // check for fullscreen support by vendor prefix
         for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
             fullScreenApi.prefix = browserPrefixes[i];

             if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
                 fullScreenApi.supportsFullScreen = true;

                 break;
             }
         }
     }

     // update methods to do something useful
     if (fullScreenApi.supportsFullScreen) {
         fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';

         fullScreenApi.isFullScreen = function() {
             switch (this.prefix) {
                 case '':
                     return document.fullScreen;
                 case 'webkit':
                     return document.webkitIsFullScreen;
                 default:
                     return document[this.prefix + 'FullScreen'];
             }
         };
         fullScreenApi.requestFullScreen = function(el) {
             return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
         };
         fullScreenApi.cancelFullScreen = function(el) {
             return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
         };
     }

     // jQuery plugin
     if (typeof jQuery != 'undefined') {
         jQuery.fn.requestFullScreen = function() {

             return this.each(function() {
                 if (fullScreenApi.supportsFullScreen) {
                     fullScreenApi.requestFullScreen(this);
                 }
             });
         };
     }

     // export api
     window.fullScreenApi = fullScreenApi;
 })();
