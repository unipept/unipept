export default class CountTable<O> extends Map<O, number> {
    public readonly totalCount: number;

    constructor(counts: Map<O, number>, totalCount?: number) {
        super(counts);
        this.totalCount = totalCount ??
            [...counts.values()].reduce((a, b) => a + b, 0);
    }

    getOrDefault(key: O, defaultValue = 0): number {
        return this.get(key) ?? defaultValue;
    }

    getEntriesRange(start: number, end: number): [O, number][] {
        return [...this.entries()].slice(start, end);
    }
}
