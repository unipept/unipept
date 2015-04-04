function showNotification(content, properties) {
    var autoHide = properties.autoHide === undefined ? true : properties.autoHide;
    var loading = properties.loading === undefined ? true : properties.loading;

    var $notification = getNotificationHTML(content);
    $(".notifications").prepend($notification);

    if (autoHide) {
        setTimeout(hide, 3000);
    }
    if (loading) {
        $notification.append("<div class='spinner'></div>");
    }

    requestAnimationFrame(function () {
        $notification.removeClass("notification-show");
    });

    return {hide: hide};

    function hide() {
        $notification.addClass("notification-hide");
        setTimeout(function () {$notification.remove(); }, 1000);
    }

    function getNotificationHTML(content) {
        return $("<br><div class='notification notification-show'>" + content + "</div>");
    }
}
