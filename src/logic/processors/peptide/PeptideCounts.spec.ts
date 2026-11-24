import { describe, expect, it } from "vitest";
import { countPeptides } from "./PeptideCounts";
import { fromTransferable } from "../../../../tests/unit/peptideData";

describe("countPeptides", () => {
    it("counts each peptide and leaves out peptides shorter than 5 amino acids", async () => {
        const result = await countPeptides({ peptides: ["AALTER", "AALTER", "MDGTEYIIVK", "SHORT", "ABCD"], filter: false });

        expect(fromTransferable(result.peptideCountsTransferable)).toEqual(new Map([["AALTER", 2], ["MDGTEYIIVK", 1], ["SHORT", 1]]));
        expect(result.totalPeptideCount).toBe(4);
    });

    it("counts each peptide once when duplicates are filtered", async () => {
        const result = await countPeptides({ peptides: ["AALTER", "AALTER", "MDGTEYIIVK"], filter: true });

        expect(fromTransferable(result.peptideCountsTransferable)).toEqual(new Map([["AALTER", 1], ["MDGTEYIIVK", 1]]));
        expect(result.totalPeptideCount).toBe(2);
    });
});
