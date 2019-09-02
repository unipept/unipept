import ClipboardJS from "clipboard";

/**
 * Make clicking on the selector copy to the user clipboard
 * @param {any} selector Anything that goes in $(...)
 * @param {*} textFunction Function to create te plan text to copy
 * @param {*} [tooltip= "Copy to clipboard"] Tooltip
 * @param {HTMLElement} [container=null] Optional container of the copy button,
 *   needed if used in a modal or other dynamicly created element.
 */
export function addCopy(selector, textFunction, tooltip = "Copy to clipboard", container = null) {
    const $el = $(selector).data("placement", "top")
        .attr("title", tooltip)
        .tooltip();
    const clipSettings = {
        text: textFunction,
    };
    if (container !== null) {
        clipSettings["container"] = container;
    }
    const clip = new ClipboardJS(selector, clipSettings);
    clip.on("success", e => {
        $el.attr("title", "Copied!")
            .tooltip("fixTitle")
            .tooltip("show")
            .attr("title", tooltip)
            .tooltip("fixTitle");
    });
    clip.on("error", e => {
        $el.attr("title", "Sorry, something went wrong")
            .tooltip("fixTitle")
            .tooltip("show")
            .attr("title", tooltip)
            .tooltip("fixTitle");
    });
}

/**
 * Returns the brightness of an rgb-color
 * from: http:// www.w3.org/WAI/ER/WD-AERT/#color-contrast
 *
 * Te bereadable, the diffrence should be 125 form the background
 *
 * @param {{r:number,g:number,b:number}} rgb color values
 * @return {number} brightness
 */
export function brightness(rgb) {
    return rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;
}

/**
 * Triggers a file download in the browser using a hidden
 * form and a server round trip. Returns a Promise that resolves when
 * the file starts downloading
 *
 * @param {string} data The text you want in the file
 * @param {string} fileName The requested file name
 * @param  {String}  [fileType] file type like "text/csv"
 * @return {Promise.<string>}
 */
export function downloadDataByForm(data, fileName, fileType = null) {
    return new Promise(function (resolve, reject) {
        let nonce = Math.random();
        $("form.download").remove();
        $("body").append("<form class='download' method='post' action='/download'></form>");
        let $downloadForm = $("form.download").append("<input type='hidden' name='filename' value='" + fileName + "'/>");
        $downloadForm.append("<input type='hidden' name='data' class='data'/>");
        if (fileType !== null) {
            $downloadForm.append(`<input type='hidden' name='filetype' value='${fileType}'/>`);
        }
        $downloadForm.append("<input type='hidden' name='nonce' value='" + nonce + "'/>");
        // The x-www-form-urlencoded spec replaces newlines with \n\r
        $downloadForm.find(".data").val(data.replace(/\n\r/g, "\n"));
        let downloadTimer = setInterval(() => {
            if (document.cookie.indexOf(nonce.toString()) !== -1) {
                clearInterval(downloadTimer);
                resolve(fileName);
            }
        }, 100);
        $downloadForm.submit();
    });
}

/**
 * Triggers a file download in the browser using a hidden
 * link and a data url.
 *
 * The download attribute doesn't work in IE and Safari:
 * http://caniuse.com/#feat=download
 *
 * @param {string} dataURL The dataURL of the data
 * @param {string} fileName The requested file name
 */
export function downloadDataByLink(dataURL, fileName) {
    $("a.downloadLink").remove();
    $("body").append("<a class='downloadLink' style='display:none;' download='" + fileName + "' target='_blank'/>");
    let $downloadLink = $("a.downloadLink").attr("href", dataURL);
    $downloadLink[0].click();
}


/**
 * a promise based get function
 * from http://www.html5rocks.com/en/tutorials/es6/promises/
 * @param {string} url
 * @return {Promise<any>}
 */
export function get(url) {
    // Return a new promise.
    return new Promise(function (resolve, reject) {
        // Do the usual XHR stuff
        let req = new XMLHttpRequest();
        req.open("GET", url);

        req.onload = function () {
            // This is called even on 404 etc
            // so check the status
            if (req.status === 200) {
                // Resolve the promise with the response text
                resolve(req.response);
            } else {
                // Otherwise reject with the status text
                // which will hopefully be a meaningful error
                reject(Error(req.statusText));
            }
        };

        // Handle network errors
        req.onerror = function () {
            reject(Error("Network Error"));
        };

        // Make the request
        req.send();
    });
}

/**
 * Gets data and JSON parses it
 * @todo replace with fetch
 * @param {string} url
 * @return {any}
 */
export function getJSON(url) {
    return get(url).then(JSON.parse);
}

/**
 * Returns the readable text color based on the brightness of a given backgroud color
 * @param {any} color
 * @return {string} color to use
 */
export function getReadableColorFor(color) {
    let textColor;
    try {
        textColor = brightness(d3.rgb(color)) < 125 ? "#eee" : "#000";
    } catch (err) {
        textColor = "#000";
    }
    return textColor;
}

/**
 * highlights the background color of the given element for 2 seconds
 * @param {*} element
 */
export function highlight(element) {
    $(element).addClass("flash");
    setTimeout(function () {
        $(element).removeClass("flash");
    }, 2000);
}

/**
 * Takes an iterator and puts all values in an array
 *
 * @todo replace calls with Array.from of [...array]
 * @param {any} iterator
 * @return {any[]}
 */
export function iteratorToArray(iterator) {
    let vals = [],
        v;
    v = iterator.next();
    while (!v.done) {
        vals.push(v.value);
        v = iterator.next();
    }
    return vals;
}

/**
 * Logs a message as exception to Google Analytics
 * @param {string} errorMessage
 */
export function logErrorToGoogle(errorMessage) {
    logToGoogle("Global", "Exception", errorMessage);
}

/**
 * Logs data to Google Analytics
 * @param {string} page
 * @param {string} action
 * @param {string} [name]
 * @param {any} [value]
 */
export function logToGoogle(page, action, name, value) {
    if (typeof (_gaq) !== "undefined") {
        if (name === undefined) {
            _gaq.push(["_trackEvent", page, action]);
        } else if (value === undefined) {
            _gaq.push(["_trackEvent", page, action, name]);
        } else {
            _gaq.push(["_trackEvent", page, action, name, value]);
        }
    }
}

/**
 * function for error handling
 * @param {*} errorMessage  error that gets logged to the console
 * @param {*} [userMessage] message to display to the user
 */
export function showError(errorMessage, userMessage) {
    if (errorMessage !== null) {
        logErrorToGoogle(errorMessage);
        if (typeof console !== "undefined") {
            console.error(errorMessage); // eslint-disable-line no-console
        }
    }
    if (userMessage) {
        let msg = $("<div class='alert alert-danger alert-dismissible' style='display: none;'><button type='button' class='close' data-dismiss='alert'><span>&times;</span></button><strong>Oh snap!</strong> " + userMessage + "</div>");
        $("#messages").append(msg);
        msg.show("normal");
    }
}

/**
 *  display the message variable in an info alert
 * @param {string} message
 */
export function showInfo(message) {
    let msg = $("<div class='alert alert-info alert-dismissible' style='display: none;'><button type='button' class='close' data-dismiss='alert'><span>&times;</span></button><strong>Heads up!</strong> " + message + "</div>");
    $("#messages").append(msg);
    msg.show("normal");
}

/**
 * Change string to title cases
 * https://stackoverflow.com/a/196991
 * @param {string} s to titleise
 * @return {string}
 */
export function stringTitleize(s) {
    return s.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

/**
 * Converts a javascript array of array to RFC 4180 complient CSV
 *
 * Each record is located on a separate line, delimited by a line break (CRLF)
 *
 * Fields containing line breaks (CRLF), double quotes, and commas should be
 * enclosed in double-quotes; If double-quotes are used to enclose fields, then
 * a double-quote appearing inside a field must be escaped by preceding it with
 * another double quote.
 *
 * Prepending `data:text/csv,` makes a valid data url
 * @param  {(string[])[]} grid [description]
 * @return {string}      The csv string
 */
export function toCSVString(grid) {
    return grid.map(line =>
        line.map(cell => {
            let content = cell.toString();
            if (content.includes(",") || content.includes("\"") ||
                content.includes("\n") || content.includes("\r")) {
                return `"${content.replace(/"/g, "\"\"")}"`;
            } else {
                return content;
            }
        }).join(",")).join("\n\r") + "\n\r";
}


/**
 * Convert a number to a percentage,
 * 0.1 => "10%".
 * @param  {Number} number     [description]
 * @param  {Number} [digits=0] [description]
 * @return {string}            [description]
 */
export function numberToPercent(number, digits = 0) {
    return (100 * number).toFixed(digits) + "%";
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
 * @param {string} svgSelector The DOM selector of the SVG or jQuery object
 * @param {string} canvasSelector The DOM selector of the canvas
 * @param {string} baseFileName The requested file name
 */
export function triggerDownloadModal(svgSelector, canvasSelector, baseFileName) {
    let $buttons = $("#save-as-modal .buttons"),
        $image = $("#save-as-modal .image"),
        $element,
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
        $element = $(svgSelector);
        svg = $element.wrap("<div></div>").parent().html();
        $element.unwrap();
        $.post("/convert", { image: svg }, showImage);
    }
    if (canvasSelector) {
        // Use html2canvas to convert canvas to dataURL
        html2canvas($(canvasSelector), {
            onrendered: function (canvas) {
                showImage(canvas.toDataURL());
            },
        });
    }

    if (window.fullScreenApi.isFullScreen()) {
        window.fullScreenApi.cancelFullScreen();
    }

    /**
     *  Show the image and add buttons
     * @param {string} dataURL
     */
    function showImage(dataURL) {
        $image.html("<img src='" + dataURL + "' />");
        $buttons.empty();
        if (svgSelector) {
            $buttons.append("<button id='download-svg' class='btn btn-primary btn-animate'><span class='glyphicon glyphicon-download down'></span> Download as SVG</button>");
            $("#download-svg").click(function () {
                downloadDataByForm(svg, baseFileName + ".svg", "image/svg+xml");
            });
        }
        $buttons.append("<button id='download-png' class='btn btn-primary btn-animate'><span class='glyphicon glyphicon-download down'></span> Download as PNG</button>");
        $("#download-png").click(function () {
            downloadDataByLink($("#save-as-modal .image img").attr("src"), baseFileName + ".png");
        });
    }
}

/**
 * Posts data to a url as JSON and returns a promise containing the parsed
 * (JSON) response
 *
 * @param  {string} url The url to which we want to send the request
 * @param  {string} data The data to post in JSON format
 * @return {Promise} A Promise containing the parsed response data
 */
export function postJSON(url, data) {
    return fetch(url, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: data,
    }).then(res => res.json());
}
