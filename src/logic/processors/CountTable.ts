import {ShareableMap} from "shared-memory-datastructures";

export default class CountTable<O>  {
    public readonly totalCount: number;

    constructor(
        public readonly counts: ShareableMap<O, number>,
        totalCount?: number
    ) {
        if (totalCount !== undefined) {
            this.totalCount = totalCount;
        } else {
            let sum = 0;
            for (const value of counts.values()) {
                sum += value;
            }
            this.totalCount = sum;
        }
    }

    getOrDefault(key: O, defaultValue = 0): number {
        return this.counts.get(key) ?? defaultValue;
    }

    getEntriesRange(start: number, end: number): [O, number][] {
        const entriesIterator = this.counts.entries();

        // Skip the first `start` entries
        for (let i = 0; i < start; i++) {
            if (entriesIterator.next().done) return [];
        }

        // Take the next `end` entries
        const entries: [O, number][] = [];
        for (let i = start; i < end; i++) {
            const { value, done } = entriesIterator.next();
            if (done) break;
            entries.push(value);
        }

        return entries;
    }
}
