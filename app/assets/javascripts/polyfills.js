/**
 * Array map polyfill from
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map#Polyfill
 * Only needed for IE8
 */
(function () {
    if (!Array.prototype.map) {
        Array.prototype.map = function (callback, thisArg) {
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
    if ('function' !== typeof Array.prototype.reduce) {
        Array.prototype.reduce = function (callback /*, initialValue*/) {
            'use strict';
            if (null === this || 'undefined' === typeof this) {
                throw new TypeError('Array.prototype.reduce called on null or undefined');
            }
            if ('function' !== typeof callback) {
                throw new TypeError(callback + ' is not a function');
            }
            var t = Object(this), len = t.length >>> 0, k = 0, value;
            if (arguments.length >= 2) {
                value = arguments[1];
            } else {
                while (k < len && !(k in t)) {
                    k++;
                }
                if (k >= len) {
                    throw new TypeError('Reduce of empty array with no initial value');
                }
                value = t[k++];
            }
            for (; k < len ; k++) {
                if (k in t) {
                    value = callback(value, t[k], k, t);
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
        i,
        il;

    // check for native support
    if (typeof document.exitFullScreen !== 'undefined') {
        fullScreenApi.supportsFullScreen = true;
    } else {
        // check for fullscreen support by vendor prefix
        for (i = 0, il = browserPrefixes.length; i < il; i++) {
            fullScreenApi.prefix = browserPrefixes[i];

            if (typeof document[fullScreenApi.prefix + 'CancelFullScreen'] !== 'undefined') {
                fullScreenApi.supportsFullScreen = true;
                break;
            }
            if (typeof document[fullScreenApi.prefix + 'ExitFullscreen'] !== 'undefined') {
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
            case 'webkit':
                return document.webkitExitFullscreen();
            case 'ms':
                return document.msExitFullscreen();
            case 'moz':
                return document.mozCancelFullScreen();
            case 'default':
                return document[this.prefix + "ExitFullscreen"]();
            }
        };
    }

    // jQuery plugin
    if (typeof jQuery !== 'undefined') {
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
window.requestAnimFrame = (function () {
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();
