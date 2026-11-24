import { afterEach, describe, expect, it, vi } from "vitest";
import { isChromium, isFirefox, isSafari } from "./BrowserCheck";

const userAgents = {
    safari: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    chrome: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    firefox: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.5; rv:127.0) Gecko/20100101 Firefox/127.0",
    androidWebView: "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Safari/537.36",
};

const withUserAgent = (userAgent: string) => vi.stubGlobal("navigator", { userAgent });

describe("BrowserCheck", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("recognizes Safari, but not Chrome or Android, which also name Safari", () => {
        withUserAgent(userAgents.safari);
        expect([isSafari(), isFirefox(), isChromium()]).toEqual([true, false, false]);

        withUserAgent(userAgents.chrome);
        expect([isSafari(), isFirefox(), isChromium()]).toEqual([false, false, true]);

        withUserAgent(userAgents.androidWebView);
        expect(isSafari()).toBe(false);
    });

    it("recognizes Firefox", () => {
        withUserAgent(userAgents.firefox);
        expect([isSafari(), isFirefox(), isChromium()]).toEqual([false, true, false]);
    });
});
