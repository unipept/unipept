import { describe, expect, it } from "vitest";
import { convertDurationToString, displayPercentage, formatNumber } from "./Formatting";

describe("formatNumber", () => {
    it("separates thousands with a thin space", () => {
        expect(formatNumber(1234567)).toBe("1\u2009234\u2009567");
        expect(formatNumber(999)).toBe("999");
    });
});

describe("displayPercentage", () => {
    it("shows two decimals by default", () => {
        expect(displayPercentage(0.12345)).toBe("12.35%");
    });

    it("shows the given number of decimals, or all of them for Infinity", () => {
        expect(displayPercentage(0.5, 0)).toBe("50%");
        expect(displayPercentage(0.125, Infinity)).toBe("12.5%");
    });
});

describe("convertDurationToString", () => {
    it("writes hours, minutes and seconds, and leaves out zero parts", () => {
        expect(convertDurationToString(3723)).toBe("1 hour and 2 minutes and 3 seconds");
        expect(convertDurationToString(7200)).toBe("2 hours");
        expect(convertDurationToString(61)).toBe("1 minute and 1 second");
    });

    it("writes 0 seconds for a zero duration", () => {
        expect(convertDurationToString(0)).toBe("0 seconds");
    });

    it("throws for a negative duration", () => {
        expect(() => convertDurationToString(-1)).toThrow("Duration cannot be negative.");
    });
});
