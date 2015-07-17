function showInfoModal(title, content, options) {
    var options = options || {};
    if (options.wide) {
        $("#info-modal .modal-dialog").addClass("modal-lg");
    }
    $("#info-modal .modal-body")
        .empty()
        .append("<h2>" + title + "</h2>")
        .append("<p>" + content + "</p>");
    $("#info-modal").modal("show");
}
