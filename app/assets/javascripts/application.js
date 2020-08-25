//= require rails-ujs

//= require vendor

//= require_self

/**
 * Capitalizes the first letter of a string
 */
String.prototype.capitalizeFirstLetter = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

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
