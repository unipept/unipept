import { describe, expect, it } from "vitest";
import { useNumberFormatter } from "./useNumberFormatter";
import usePercentage from "./usePercentage";
import useStringUtils from "./useStringUtils";
import useTimeFormatter from "./useTimeFormatter";
import useArrayCompare from "./useArrayCompare";

describe("useNumberFormatter", () => {
    const { formatNumber } = useNumberFormatter();

    it("separates thousands with a thin space", () => {
        expect(formatNumber(1234567)).toBe("1\u2009234\u2009567");
        expect(formatNumber(999)).toBe("999");
    });
});

describe("usePercentage", () => {
    const { displayPercentage } = usePercentage();

    it("shows two decimals by default", () => {
        expect(displayPercentage(0.12345)).toBe("12.35%");
    });

    it("shows the given number of decimals, or all of them for Infinity", () => {
        expect(displayPercentage(0.5, 0)).toBe("50%");
        expect(displayPercentage(0.125, Infinity)).toBe("12.5%");
    });
});

describe("useStringUtils", () => {
    const { numberToPercent } = useStringUtils();

    it("shows no decimals by default", () => {
        expect(numberToPercent(0.1)).toBe("10%");
        expect(numberToPercent(0.1234, 1)).toBe("12.3%");
    });
});

describe("useTimeFormatter", () => {
    const { convertDurationToString } = useTimeFormatter();

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

describe("useArrayCompare", () => {
    const { compareNumberOrStringArrays } = useArrayCompare();

    it("ignores the order of the values", () => {
        expect(compareNumberOrStringArrays([3, 1, 2], [1, 2, 3])).toBe(true);
        expect(compareNumberOrStringArrays(["b", "a"], ["a", "b"])).toBe(true);
    });

    it("returns false for different values or lengths", () => {
        expect(compareNumberOrStringArrays([1, 2], [1, 3])).toBe(false);
        expect(compareNumberOrStringArrays([1, 2], [1, 2, 2])).toBe(false);
    });

    it("does not change the given arrays", () => {
        const a = [3, 1, 2];
        compareNumberOrStringArrays(a, [1, 2, 3]);
        expect(a).toEqual([3, 1, 2]);
    });
});
