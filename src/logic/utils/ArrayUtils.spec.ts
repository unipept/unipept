import { describe, expect, it } from "vitest";
import { compareNumberOrStringArrays } from "./ArrayUtils";

describe("compareNumberOrStringArrays", () => {
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
