/**
 * Shows a notification in the bottom left corner
 *
 * @param <String> content The string to show
 * @param <Boolean> properties.autoHide Whether to automatically hide the
 *       notification. Default is true.
 * @param <Boolean> properties.loading Whether a loading indicator should be
 *       shown. Default is false.
 * @return <Notification> $notification
 */
function showNotification(content, properties = {}) {
    const defaults = {
        autoHide: true,
        loading: false,
    };

    let props = Object.assign({}, defaults, properties);
    let $notification = getNotificationHTML(content);

    $(".notifications").prepend($notification);

    if (props.autoHide) {
        setTimeout(hide, 3000);
    }
    if (props.loading) {
        $notification.append("<div class='spinner'></div>");
    }

    requestAnimationFrame(function () {
        $notification.removeClass("notification-show");
    });

    return {
        hide: hide,
    };

    function hide(delayed) {
        $notification.addClass("notification-hide");
        setTimeout(function () {
            $notification.remove();
        }, 1000);
    }

    function getNotificationHTML(content) {
        return $("<br><div class='notification notification-show'>" + content + "</div>");
    }
}

export {showNotification};
