import {describe, it, expect} from "vitest";
import CountTable from "./CountTable";
import {ShareableMap} from "shared-memory-datastructures";

describe("CountTable", () => {
    it("should calculate totalCount correctly from map constructor", () => {
        const map = new ShareableMap<string, number>();
        map.set("A", 10);
        map.set("B", 20);

        const countTable = new CountTable(map);
        expect(countTable.totalCount).toBe(30);
    });

    it("should use provided totalCount if given", () => {
        const map = new ShareableMap<string, number>();
        map.set("A", 10);
        const countTable = new CountTable(map, 100);
        expect(countTable.totalCount).toBe(100);
    });

    it("should return default value for missing keys in getOrDefault", () => {
        const map = new ShareableMap<string, number>();
        map.set("A", 5);
        const countTable = new CountTable(map);

        expect(countTable.getOrDefault("A")).toBe(5);
        expect(countTable.getOrDefault("B")).toBe(0);
        expect(countTable.getOrDefault("C", 10)).toBe(10);
    });

    it("should return correct range of entries", () => {
        const map = new ShareableMap<string, number>();
        map.set("A", 1);
        map.set("B", 2);
        map.set("C", 3);
        map.set("D", 4);
        map.set("E", 5);

        const countTable = new CountTable(map);

        // Get all entries to determine order
        const allEntries = [...map.entries()];

        const start = 1;
        const end = 3;
        const entries = countTable.getEntriesRange(start, end);

        // Code loop: i from start to end (exclusive).
        // It slices from index 1 to 3 (exclusive).
        const expected = allEntries.slice(start, end);

        expect(entries).toHaveLength(expected.length);
        expect(entries).toEqual(expected);
    });

    it("should handle getEntriesRange safely when requested range exceeds map size", () => {
        const map = new ShareableMap<string, number>();
        map.set("A", 100);

        const countTable = new CountTable(map);

        // Request entries from 0 to 50 (larger than map size 1)
        const entries = countTable.getEntriesRange(0, 50);

        expect(entries).toHaveLength(1);
        expect(entries[0]).toEqual(["A", 100]);
    });
});
