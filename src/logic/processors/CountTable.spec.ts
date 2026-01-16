import {describe, expect, it} from "vitest";
import CountTable from "./CountTable";
import {ShareableMap} from "shared-memory-datastructures";

describe("CountTable", () => {
    it("should correctly initialize and calculate total count", () => {
        const map = new ShareableMap<string, number>(10, 10);
        map.set("A", 5);
        map.set("B", 3);
        map.set("C", 2);

        const countTable = new CountTable(map);
        expect(countTable.totalCount).toBe(10);
    });

    it("should return correct count for existing key", () => {
        const map = new ShareableMap<string, number>(10, 10);
        map.set("A", 5);
        const countTable = new CountTable(map);
        expect(countTable.getOrDefault("A")).toBe(5);
    });

    it("should return default value for non-existing key", () => {
        const map = new ShareableMap<string, number>(10, 10);
        map.set("A", 5);
        const countTable = new CountTable(map);
        expect(countTable.getOrDefault("B", 0)).toBe(0);
        expect(countTable.getOrDefault("B", 10)).toBe(10);
    });

    it("should return entries in range", () => {
        const map = new ShareableMap<string, number>(10, 10);
        map.set("A", 1);
        map.set("B", 2);
        map.set("C", 3);
        map.set("D", 4);
        map.set("E", 5);

        const countTable = new CountTable(map);

        // We cannot rely on iteration order of ShareableMap, so we just check that we got 2 unique valid entries.
        const range1 = countTable.getEntriesRange(0, 2);
        expect(range1.length).toBe(2);

        // Ensure the entries are from the map
        const range1Keys = range1.map(e => e[0]);
        expect(["A", "B", "C", "D", "E"]).toEqual(expect.arrayContaining(range1Keys));

        // Ensure we can get more entries
        const range2 = countTable.getEntriesRange(2, 4);
        expect(range2.length).toBe(2);

        const range2Keys = range2.map(e => e[0]);
        expect(["A", "B", "C", "D", "E"]).toEqual(expect.arrayContaining(range2Keys));

        // Ensure range1 and range2 don't overlap if we assume consistent iteration order (which we do for pagination)
        // If the iteration order IS consistent (even if not insertion order), then range1 and range2 should be disjoint sets of keys.
        // Let's verify that assumption.
        const allKeys = [...range1Keys, ...range2Keys];
        const uniqueKeys = new Set(allKeys);
        expect(uniqueKeys.size).toBe(4);
    });

    it("should handle request for more entries than available", () => {
        const map = new ShareableMap<string, number>(10, 10);
        map.set("A", 100);
        const countTable = new CountTable(map);

        const range = countTable.getEntriesRange(0, 5);

        expect(range.length).toBe(1);
        expect(range[0][0]).toBe("A");
        expect(range[0][1]).toBe(100);
    });
});
