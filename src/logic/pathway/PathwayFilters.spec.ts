import { describe, expect, it } from "vitest";
import { filterPathways, searchPathways, type FilterablePathwayItem, type PathwayLookups } from "./PathwayFilters";

const pathways: FilterablePathwayItem[] = [
    { id: "map00010", name: "Glycolysis", category: "Metabolism", subCategory: "Carbohydrate metabolism" },
    { id: "map00190", name: "Oxidative phosphorylation", category: "Metabolism", subCategory: "Energy metabolism" },
    { id: "map00230", name: "Purine metabolism", category: "Metabolism", subCategory: "Nucleotide metabolism" },
];

const ecToPathways: Record<string, string[]> = {
    "1.1.1.1": ["map00010"],
    "1.2.1.12": ["map00010", "map00190"],
    "2.7.7.6": ["map00230"],
};

const lookups: PathwayLookups = {
    pathwaysForEc: ec => new Set(ecToPathways[ec] ?? []),
    pathwaysForCompound: c => new Set(c === "C00002" ? ["map00190", "map00230"] : []),
    allEcs: () => Object.keys(ecToPathways),
};

const ids = (items: FilterablePathwayItem[]) => items.map(item => item.id);

describe("filterPathways", () => {
    it("keeps all pathways without filters", () => {
        expect(ids(filterPathways(pathways, [], [], [], lookups))).toEqual(["map00010", "map00190", "map00230"]);
    });

    it("matches a partial EC number against all EC numbers below it", () => {
        expect(ids(filterPathways(pathways, ["1.2.-.-"], [], [], lookups))).toEqual(["map00010", "map00190"]);
    });

    it("keeps only the pathways that match every filter", () => {
        expect(ids(filterPathways(pathways, [], ["C00002"], ["Nucleotide metabolism"], lookups))).toEqual(["map00230"]);
    });
});

describe("searchPathways", () => {
    it("searches the id, name and categories, ignoring case", () => {
        expect(ids(searchPathways(pathways, "GLYCO"))).toEqual(["map00010"]);
        expect(ids(searchPathways(pathways, "map0019"))).toEqual(["map00190"]);
        expect(ids(searchPathways(pathways, "nucleotide"))).toEqual(["map00230"]);
    });

    it("keeps all pathways for an empty query", () => {
        expect(searchPathways(pathways, "")).toBe(pathways);
    });
});
