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
    const $title = $("#info-modal .modal-title");
    const $body = $("#info-modal .modal-body");
    const $content = $("<p></p>").append(content);
    $title.empty().append(title);
    $body
        .empty()
        .append($content);
    $("#info-modal").modal("show");
    return $("#info-modal");
}

export {showInfoModal};
