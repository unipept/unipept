import {ShareableMap} from "shared-memory-datastructures";

export default class CountTable<O>  {
    public readonly totalCount: number;

    constructor(
        public readonly counts: ShareableMap<O, number>,
        totalCount?: number
    ) {
        this.totalCount = totalCount ??
            [...counts.values()].reduce((a, b) => a + b, 0);
    }

    getOrDefault(key: O, defaultValue = 0): number {
        return this.counts.get(key) ?? defaultValue;
    }

    getEntriesRange(start: number, end: number): [O, number][] {
        const entriesIterator = this.counts.entries();

        // Skip the first `start` entries
        for (let i = 0; i < start; i++) {
            entriesIterator.next();
        }

        // Take the next `end` entries
        const entries: [O, number][] = [];
        for (let i = start; i < Math.min(end, this.totalCount); i++) {
            entries.push(entriesIterator.next().value!);
        }

        return entries;
    }
}
