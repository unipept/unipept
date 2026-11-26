/**
 * Index of the heading that "On this page" marks: the last heading whose top is at or above `offset` pixels from
 * the top of the window, or the last heading once the page is scrolled to the bottom. -1 if no heading is above
 * the offset yet.
 *
 * @param tops Top of each heading relative to the window, in document order.
 */
export function activeHeading(tops: number[], offset: number, atBottom: boolean): number {
    if (atBottom && tops.length > 0) {
        return tops.length - 1;
    }
    let active = -1;
    tops.forEach((top, index) => {
        if (top <= offset) {
            active = index;
        }
    });
    return active;
}
