import {describe, expect, it} from "vitest";
import LcaProcessor from "./LcaProcessor";
import {NcbiTaxon} from "../../ontology/taxonomic/Ncbi";

describe("LcaProcessor", () => {
    const processor = new LcaProcessor();

    it("should return 1 when given an empty list of taxa", () => {
        expect(processor.computeLca([])).toBe(1);
    });

    it("should return the taxon id itself if only one taxon is provided", () => {
        const taxon = new NcbiTaxon(10, "Taxon 10", "species", [1, 2, 5, 10]);
        expect(processor.computeLca([taxon])).toBe(10);
    });

    it("should return the correct LCA for taxa with a common ancestor", () => {
        const taxon1 = new NcbiTaxon(10, "Taxon 10", "species", [1, 2, 5, 10]);
        const taxon2 = new NcbiTaxon(11, "Taxon 11", "species", [1, 2, 5, 11]);
        // LCA should be 5
        expect(processor.computeLca([taxon1, taxon2])).toBe(5);
    });

    it("should return the correct LCA for taxa where one is an ancestor of another", () => {
        const taxon1 = new NcbiTaxon(5, "Taxon 5", "genus", [1, 2, 5]);
        const taxon2 = new NcbiTaxon(10, "Taxon 10", "species", [1, 2, 5, 10]);
        // LCA should be 5
        expect(processor.computeLca([taxon1, taxon2])).toBe(5);
    });

    it("should return 1 (root) if taxa share no common ancestor other than root", () => {
        const taxon1 = new NcbiTaxon(10, "Taxon 10", "species", [1, 2, 5, 10]);
        const taxon2 = new NcbiTaxon(20, "Taxon 20", "species", [1, 3, 6, 20]);
        // LCA should be 1
        expect(processor.computeLca([taxon1, taxon2])).toBe(1);
    });

    it("should return the correct LCA even if lineage lengths differ drastically", () => {
        const taxon1 = new NcbiTaxon(10, "Taxon 10", "species", [1, 2, 5, 10]);
        const taxon2 = new NcbiTaxon(100, "Taxon 100", "species", [1, 2, 5, 11, 12, 13, 100]);
        // LCA should be 5
        expect(processor.computeLca([taxon1, taxon2])).toBe(5);
    });

    it("should correctly handle lineages that start with 1", () => {
        // Lineages usually start with 1 (root)
        const taxon1 = new NcbiTaxon(2, "Taxon 2", "kingdom", [1, 2]);
        const taxon2 = new NcbiTaxon(3, "Taxon 3", "kingdom", [1, 3]);
        expect(processor.computeLca([taxon1, taxon2])).toBe(1);
    });
});
