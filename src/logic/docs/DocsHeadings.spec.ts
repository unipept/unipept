import { describe, expect, it } from "vitest";
import { activeHeading } from "./DocsHeadings";

describe("activeHeading", () => {
    it("is the last heading at or above the offset", () => {
        expect(activeHeading([-400, -20, 90, 600], 100, false)).toBe(2);
        expect(activeHeading([-400, 100, 600], 100, false)).toBe(1);
    });

    it("is none before the first heading reaches the offset", () => {
        expect(activeHeading([300, 900], 100, false)).toBe(-1);
        expect(activeHeading([], 100, false)).toBe(-1);
    });

    it("is the last heading at the bottom of the page", () => {
        expect(activeHeading([-400, 300, 500], 100, true)).toBe(2);
        expect(activeHeading([], 100, true)).toBe(-1);
    });
});
