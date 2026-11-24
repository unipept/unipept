import { describe, expect, it } from "vitest";
import { aggregateTaxa } from "./taxonomicProcessor";
import { fromTransferable, peptideDataTransferable } from "../../../../tests/unit/peptideData";

describe("aggregateTaxa", () => {
    it("sums the peptide counts per LCA and maps peptides and LCAs to each other", async () => {
        const result = await aggregateTaxa({
            peptideCounts: new Map([["AAAAA", 3], ["CCCCC", 2], ["DDDDD", 4], ["EEEEE", 7]]),
            peptideDataTransferable: peptideDataTransferable({
                AAAAA: { lca: 816 },
                CCCCC: { lca: 816 },
                DDDDD: { lca: 2 },
            }),
        });

        expect(fromTransferable(result.countsPerLcaTransferable)).toEqual(new Map([[816, 5], [2, 4]]));
        expect(result.lcaToPeptides).toEqual(new Map([[816, ["AAAAA", "CCCCC"]], [2, ["DDDDD"]]]));
        expect(result.peptideToLca).toEqual(new Map([["AAAAA", 816], ["CCCCC", 816], ["DDDDD", 2]]));
    });

    it("counts only the peptides that the API found as annotated", async () => {
        const result = await aggregateTaxa({
            peptideCounts: new Map([["AAAAA", 3], ["EEEEE", 7]]),
            peptideDataTransferable: peptideDataTransferable({ AAAAA: { lca: 1 } }),
        });

        expect(result.annotatedCount).toBe(3);
    });
});
