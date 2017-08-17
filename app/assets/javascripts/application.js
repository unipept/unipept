//= require rails-ujs

// yarn deps
//= require typeahead.js/dist/typeahead.bundle.js

//= require zeroclipboard
//= require vendor

//= require_self

// zeroclipboard config
ZeroClipboard.config({
    hoverClass: 'btn-clipboard-hover'
});

function addCopy(selector, textFunction, tooltip) {
    var copyMissed = new ZeroClipboard(selector);
    var htmlBridge = $('#global-zeroclipboard-html-bridge');
    copyMissed.on('ready', function () {
        htmlBridge
          .data('placement', 'top')
          .attr('title', tooltip || 'Copy to clipboard')
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

/**
 * Capitalizes the first letter of a string
 */
String.prototype.capitalizeFirstLetter = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

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
 * Catches all errors, displays them in console and
 * logs them to Google Analytics
 */
window.onerror = function (message, file, line) {
    var e = file + '(' + line + '): ' + message;
    if (typeof console !== "undefined") {
        console.error(e);
    }
    logErrorToGoogle(e);
};
