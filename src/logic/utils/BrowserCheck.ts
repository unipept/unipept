// Detects the browser from the user agent

export function isSafari(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();

    // Safari includes "Safari" in its user agent string, but Chrome and other browsers also include it
    // So we need to check for "Safari" and exclude "Chrome", "Chromium", etc.
    return userAgent.includes('safari') &&
        !userAgent.includes('chrome') &&
        !userAgent.includes('chromium') &&
        !userAgent.includes('android');
}

export function isFirefox(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('firefox');
}

export function isChromium(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    return (userAgent.includes('chrome') || userAgent.includes('chromium'));
}
