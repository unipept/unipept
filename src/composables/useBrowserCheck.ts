export default function useBrowserCheck() {
    /**
     * Detects if the current browser is Safari
     * @returns boolean - true if the browser is Safari, false otherwise
     */
    const isSafari = (): boolean => {
        const userAgent = navigator.userAgent.toLowerCase();

        // Safari includes "Safari" in its user agent string, but Chrome and other browsers also include it
        // So we need to check for "Safari" and exclude "Chrome", "Chromium", etc.
        return userAgent.includes('safari') &&
            !userAgent.includes('chrome') &&
            !userAgent.includes('chromium') &&
            !userAgent.includes('android');
    }

    const isFirefox = (): boolean => {
        const userAgent = navigator.userAgent.toLowerCase();
        return userAgent.includes('firefox');
    }

    const isChromium = (): boolean => {
        const userAgent = navigator.userAgent.toLowerCase();
        return (userAgent.includes('chrome') || userAgent.includes('chromium'));
    }

    return {
        isSafari,
        isFirefox,
        isChromium
    }
}
