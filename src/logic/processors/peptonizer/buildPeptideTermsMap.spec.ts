import {describe, it, expect} from "vitest";
import {ShareableMap} from "shared-memory-datastructures";
import CountTable from "@/logic/processors/CountTable";
import buildPeptideTermsMap from "./buildPeptideTermsMap";
import PeptideData from "@/logic/ontology/peptides/PeptideData";

const buildCountTable = (...peptides: string[]): CountTable<string> => {
    const map = new ShareableMap<string, number>();
    for (const peptide of peptides) {
        map.set(peptide, 1);
    }
    return new CountTable(map);
};

describe("buildPeptideTermsMap", () => {
    it("only includes peptides for which the extractor returns at least one term", () => {
        const countTable = buildCountTable("PEPTIDEA", "PEPTIDEB");
        const peptideToData = new ShareableMap<string, PeptideData>();

        const result = buildPeptideTermsMap(countTable, peptideToData, () => ["EC:1.1.1.1"]);

        // Neither peptide has data in peptideToData, so the extractor is never reached and nothing is included.
        expect(result.size).toBe(0);
    });

    it("skips peptides that are not present in the count table", () => {
        const countTable = buildCountTable("PEPTIDEA");
        const peptideToData = new ShareableMap<string, PeptideData>();

        const result = buildPeptideTermsMap(countTable, peptideToData, () => []);

        expect(result.size).toBe(0);
    });

    it("omits peptides for which the extractor returns an empty list", () => {
        const countTable = buildCountTable("PEPTIDEA");
        const peptideToData = new ShareableMap<string, PeptideData>();
        // Force a truthy (but empty) lookup by stubbing `get`.
        peptideToData.get = () => ({} as PeptideData);

        const result = buildPeptideTermsMap(countTable, peptideToData, () => []);

        expect(result.size).toBe(0);
    });

    it("includes peptides with a non-empty extracted term list", () => {
        const countTable = buildCountTable("PEPTIDEA");
        const peptideToData = new ShareableMap<string, PeptideData>();
        peptideToData.get = () => ({} as PeptideData);

        const result = buildPeptideTermsMap(countTable, peptideToData, () => ["GO:0008150", "GO:0009987"]);

        expect(result.get("PEPTIDEA")).toEqual(["GO:0008150", "GO:0009987"]);
    });
});
