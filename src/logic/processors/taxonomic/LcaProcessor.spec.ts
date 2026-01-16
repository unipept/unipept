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

    it("should handle lineages of different lengths", () => {
        const taxon1 = new NcbiTaxon(100, "Organism A", NcbiRank.Species, [1, 2, 10, 100]);
        const taxon2 = new NcbiTaxon(10, "Organism B", NcbiRank.Genus, [1, 2, 10]);

        // Common lineage is [1, 2, 10].
        expect(lcaProcessor.computeLca([taxon1, taxon2])).toBe(10);
    });

    it("should handle lineages where one is a prefix of another (ancestor relationship)", () => {
         const taxon1 = new NcbiTaxon(10, "Parent", NcbiRank.Genus, [1, 2, 10]);
         const taxon2 = new NcbiTaxon(100, "Child", NcbiRank.Species, [1, 2, 10, 100]);

         expect(lcaProcessor.computeLca([taxon1, taxon2])).toBe(10);
    });

    it("should handle null values in lineage if they exist", () => {
        // The implementation checks for null or 0.
        // Assuming lineage can contain nulls based on implementation check: `value !== 0 && value !== null`
        // However, NcbiId is number. But maybe runtime data has nulls.
        // I will force cast or just use numbers.
        const taxon1 = new NcbiTaxon(100, "A", NcbiRank.Species, [1, 2, 0, 100]);
        const taxon2 = new NcbiTaxon(101, "B", NcbiRank.Species, [1, 2, 0, 101]);

        // Col 2 is 0. Col 1 is 2.
        expect(lcaProcessor.computeLca([taxon1, taxon2])).toBe(2);
    });
});
