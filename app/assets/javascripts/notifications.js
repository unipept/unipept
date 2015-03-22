function showNotification(content, autoHide) {
    var $notification = getNotificationHTML(content);
    $(".notifications").prepend($notification);

    if (autoHide) {
        setTimeout(hide, 3000);
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
