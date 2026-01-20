import { describe, it, expect } from "vitest";
import LcaProcessor from "./LcaProcessor";
import { NcbiTaxon, NcbiRank } from "@/logic/ontology/taxonomic/Ncbi";

describe("LcaProcessor", () => {
    const lcaProcessor = new LcaProcessor();

    it("should return 1 (root) when the input list of taxa is empty", () => {
        expect(lcaProcessor.computeLca([])).toBe(1);
    });

    it("should return the taxon ID itself when a single taxon is provided", () => {
        const taxon = new NcbiTaxon(123, "Test Organism", NcbiRank.Species, [1, 2, 10, 123]);
        expect(lcaProcessor.computeLca([taxon])).toBe(123);
    });

    it("should correctly compute the LCA for taxa with a common ancestor", () => {
        const taxon1 = new NcbiTaxon(100, "Organism A", NcbiRank.Species, [1, 2, 10, 100]);
        const taxon2 = new NcbiTaxon(101, "Organism B", NcbiRank.Species, [1, 2, 10, 101]);
        const taxon3 = new NcbiTaxon(102, "Organism C", NcbiRank.Species, [1, 2, 10, 102]);

        // Common lineage is [1, 2, 10]. Last common is 10.
        expect(lcaProcessor.computeLca([taxon1, taxon2, taxon3])).toBe(10);
    });

    it("should return 1 (root) if there is no common ancestor other than root", () => {
        // Lineages start with root (1) usually.
        const taxon1 = new NcbiTaxon(100, "Organism A", NcbiRank.Species, [1, 2, 100]);
        const taxon2 = new NcbiTaxon(200, "Organism B", NcbiRank.Species, [1, 3, 200]);

        // Common lineage is [1].
        expect(lcaProcessor.computeLca([taxon1, taxon2])).toBe(1);
    });
});
