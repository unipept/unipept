/**
 *
 * @param {string} title
 * @param {string|any} content
 * @param {{wide:boolean}} [options={}]
 */
function showInfoModal(title, content, options = {wide: false}) {
    if (options.wide) {
        $("#info-modal .modal-dialog").addClass("modal-lg");
    }
    const $body = $("#info-modal .modal-body");
    const $content = $("<p></p>").append(content);
    $body
        .empty()
        .append("<h2>" + title + "</h2>")
        .append($content);
    $("#info-modal").modal("show");
    return $("#info-modal");
}

export {showInfoModal};
