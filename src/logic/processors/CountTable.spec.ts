import { describe, it, expect } from 'vitest';
import CountTable from './CountTable';
import { ShareableMap } from 'shared-memory-datastructures';

describe('CountTable', () => {
    it('should correctly calculate totalCount', () => {
        const map = new ShareableMap<string, number>(10);
        map.set('a', 1);
        map.set('b', 2);
        map.set('c', 3);

        const table = new CountTable(map);
        expect(table.totalCount).toBe(6);
    });

    it('should use provided totalCount if available', () => {
        const map = new ShareableMap<string, number>(10);
        map.set('a', 1);

        const table = new CountTable(map, 100);
        expect(table.totalCount).toBe(100);
    });

    it('should handle empty map', () => {
        const map = new ShareableMap<string, number>(10);
        const table = new CountTable(map);
        expect(table.totalCount).toBe(0);
    });

    it('should get entries range correctly', () => {
        const map = new ShareableMap<string, number>(10);
        map.set('a', 10);
        map.set('b', 20);
        map.set('c', 30);
        map.set('d', 40);

        const table = new CountTable(map);

        // Fetch all items in chunks
        // range [0, 2)
        const range1 = table.getEntriesRange(0, 2);
        expect(range1.length).toBe(2);

        // range [2, 4)
        const range2 = table.getEntriesRange(2, 4);
        expect(range2.length).toBe(2);

        // range [4, 6) - Should be empty as size is 4
        const range3 = table.getEntriesRange(4, 6);
        expect(range3.length).toBe(0);

        const allEntries = [...range1, ...range2];
        const allKeys = allEntries.map(e => e[0]).sort();
        const allValues = allEntries.map(e => e[1]).sort((a, b) => a - b);

        expect(allKeys).toEqual(['a', 'b', 'c', 'd']);
        expect(allValues).toEqual([10, 20, 30, 40]);
    });
});
