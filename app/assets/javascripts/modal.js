function showInfoModal(title, content) {
    $("#info-modal .modal-body")
        .empty()
        .append("<h2>" + title + "</h2>")
        .append("<p>" + content + "</p>");
    $("#info-modal").modal("show");
}
