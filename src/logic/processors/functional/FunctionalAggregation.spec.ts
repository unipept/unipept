import { describe, expect, it } from "vitest";
import { aggregateFunctions } from "./FunctionalAggregation";
import { countsTransferable, fromTransferable, peptideDataTransferable } from "../../../../tests/unit/peptideData";

// AAAAA: 4 proteins with EC numbers, 3 of them 1.1.1.1 and 1 of them 2.7.11.1. CCCCC: 2 proteins, both 1.1.1.1.
// DDDDD: no EC numbers. EEEEE: not found.
const input = (percentage: number) => ({
    countsMapTransferable: countsTransferable({ AAAAA: 5, CCCCC: 2, DDDDD: 1, EEEEE: 9 }),
    peptideDataTransferable: peptideDataTransferable({
        AAAAA: { proteinCounts: { all: 4, EC: 4, GO: 0, IPR: 0 }, annotations: { "EC:1.1.1.1": 3, "EC:2.7.11.1": 1 } },
        CCCCC: { proteinCounts: { all: 2, EC: 2, GO: 0, IPR: 0 }, annotations: { "EC:1.1.1.1": 2 } },
        DDDDD: { proteinCounts: { all: 1, EC: 0, GO: 1, IPR: 0 }, annotations: { "GO:0005737": 1 } },
    }),
    percentage,
    termPrefix: "ec" as const,
    proteinCountProperty: "ec" as const,
});

describe("aggregateFunctions", () => {
    it("sums the peptide counts of every term", async () => {
        const result = await aggregateFunctions(input(0));

        expect(fromTransferable(result.sortedCountsTransferable)).toEqual(new Map([["EC:1.1.1.1", 7], ["EC:2.7.11.1", 5]]));
        expect(result.annotatedCount).toBe(7);
    });

    it("counts a term only when more than the given percentage of the proteins has it", async () => {
        const result = await aggregateFunctions(input(50));

        expect(fromTransferable(result.sortedCountsTransferable)).toEqual(new Map([["EC:1.1.1.1", 7]]));
    });

    it("does not count a term whose share is exactly the given percentage", async () => {
        // 1.1.1.1 is on 3 of the 4 proteins of AAAAA (75%) and on all proteins of CCCCC
        const result = await aggregateFunctions(input(75));

        expect(fromTransferable(result.sortedCountsTransferable)).toEqual(new Map([["EC:1.1.1.1", 2]]));
    });

    it("maps terms to peptides and peptides to terms, also for terms below the percentage", async () => {
        const result = await aggregateFunctions(input(50));

        expect(result.itemToPeptides).toEqual(new Map([["EC:1.1.1.1", ["AAAAA", "CCCCC"]], ["EC:2.7.11.1", ["AAAAA"]]]));
        expect(result.peptidesFunctions).toEqual(new Map([["AAAAA", ["EC:1.1.1.1", "EC:2.7.11.1"]], ["CCCCC", ["EC:1.1.1.1"]]]));
    });

    it("uses the given annotation type", async () => {
        const result = await aggregateFunctions({ ...input(0), termPrefix: "go", proteinCountProperty: "go" });

        expect(fromTransferable(result.sortedCountsTransferable)).toEqual(new Map([["GO:0005737", 1]]));
        expect(result.annotatedCount).toBe(1);
    });
});
