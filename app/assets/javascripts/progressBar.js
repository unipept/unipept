function initializeDeterminateCircles($element) {
    let size = $element.data("size");
    let middle = size / 2;
    let radius = middle - 2;

    $element.html(
        '<svg width="' + size + '" height="' + size + '">' +
        '   <circle cx="' + middle  + '" cy="' + middle + '" r="' + radius + '" transform="rotate(-90 ' + middle + ' ' + middle + ')" />' +
        '</svg>'
    );

    let strokeDashArray = Math.floor(2 * radius * 3.14) + size;

    $element.each(function() {
        let $current = $(this);
        let $circle = $element.find("circle");
        $circle.css("stroke-dasharray", strokeDashArray);
        $circle.css("stroke-dashoffset", strokeDashArray);
    });
}

function setDeterminateCirclesProgress($element, progress) {
    let size = $element.data("size");
    let middle = size / 2;
    let radius = middle - 2;

    let strokeDashArray = Math.floor(2 * radius * 3.14);

    // Get progress value and update the SVG accordingly
    let strokeDashOffset = (1 - progress) * strokeDashArray + size;
    $element.find("circle").css("stroke-dashoffset", strokeDashOffset);
}

export {initializeDeterminateCircles, setDeterminateCirclesProgress}
