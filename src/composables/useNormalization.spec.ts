import { describe, expect, it } from "vitest";
import useNormalization from "./useNormalization";

const { normalizeAll, normalizeRows, normalizeColumns } = useNormalization();

const data = [
    [0, 5, 10],
    [2, 2, 2],
    [4, 6, 8],
];

describe("useNormalization", () => {
    it("normalizeAll scales every value with the minimum and maximum of the whole matrix", () => {
        expect(normalizeAll(data)).toEqual([
            [0, 0.5, 1],
            [0.2, 0.2, 0.2],
            [0.4, 0.6, 0.8],
        ]);
    });

    it("normalizeRows scales each row on its own, and a constant row becomes 0", () => {
        expect(normalizeRows(data)).toEqual([
            [0, 0.5, 1],
            [0, 0, 0],
            [0, 0.5, 1],
        ]);
    });

    it("normalizeColumns scales each column on its own", () => {
        expect(normalizeColumns(data)).toEqual([
            [0, 0.75, 1],
            [0.5, 0, 0],
            [1, 1, 0.75],
        ]);
    });

    it("returns 0 for every value when all values are equal", () => {
        expect(normalizeAll([[3, 3], [3, 3]])).toEqual([[0, 0], [0, 0]]);
        expect(normalizeColumns([[3, 1], [3, 1]])).toEqual([[0, 0], [0, 0]]);
    });

    it("returns empty input unchanged", () => {
        expect(normalizeAll([])).toEqual([]);
        expect(normalizeRows([[]])).toEqual([[]]);
        expect(normalizeColumns([])).toEqual([]);
    });

    it("does not change the given matrix", () => {
        const input = [[1, 2], [3, 4]];
        normalizeAll(input);
        normalizeRows(input);
        normalizeColumns(input);
        expect(input).toEqual([[1, 2], [3, 4]]);
    });
});
