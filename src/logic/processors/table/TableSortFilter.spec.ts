import { describe, expect, it } from "vitest";
import { parseQuery, sortFilterTable, type QuickFilters, type TableSortFilterWorkerInput } from "./TableSortFilter";
import { countsTransferable, peptideDataTransferable } from "../../../../tests/unit/peptideData";

// AAAK: genus, EC only. CCCK: species, GO and InterPro. DDDK: superkingdom, no annotations, cRAP. EEEK: not found.
const counts = { AAAK: 5, CCCK: 2, DDDK: 9, EEEK: 1 };
const data = {
    AAAK: { proteinCounts: { all: 1, EC: 1, GO: 0, IPR: 0 } },
    CCCK: { proteinCounts: { all: 4, EC: 0, GO: 3, IPR: 1 } },
    DDDK: { cutoffUsed: true },
};
const lca = { AAAK: 816, CCCK: 1680, DDDK: 2 };
const ncbiSubset = {
    816: { name: "Bacteroides", rank: "genus" },
    1680: { name: "Bifidobacterium adolescentis", rank: "species" },
    2: { name: "Bacteria", rank: "superkingdom" },
};

const noQuickFilters: QuickFilters = { speciesLevel: false, hasGo: false, hasEc: false, hasIpr: false, notFound: false };

const run = (options: Partial<TableSortFilterWorkerInput> = {}) => sortFilterTable({
    peptideCountsTransferable: countsTransferable(counts),
    peptideToDataTransferable: peptideDataTransferable(data),
    peptideToLcaTransferable: countsTransferable(lca),
    ncbiSubset,
    crapFilteredPeptides: ["DDDK"],
    search: "",
    quickFilters: noQuickFilters,
    sortKey: "",
    sortOrder: "",
    page: 1,
    itemsPerPage: -1,
    ...options,
});

// Without a sort key the row order is the internal order of the maps, so those results are compared sorted
const peptides = (options: Partial<TableSortFilterWorkerInput> = {}) => {
    const result = run(options).rows.map(row => row.peptide);
    return options.sortKey ? result : result.sort();
};

describe("parseQuery", () => {
    it("returns an empty query for an empty search", () => {
        expect(parseQuery("   ")).toEqual({
            freeText: "", rankFilter: "", lcaFilter: "", hasGo: false, hasEc: false, hasIpr: false, hasAny: false,
        });
    });

    it("reads key:value filters and keeps the other words as free text", () => {
        expect(parseQuery("AAAK rank:Species has:GO")).toMatchObject({ freeText: "aaak", rankFilter: "species", hasGo: true });
    });

    it("reads a value of several words until the next key:value filter", () => {
        expect(parseQuery("lca:Sus scrofa rank:genus")).toMatchObject({ lcaFilter: "sus scrofa", rankFilter: "genus" });
    });

    it("reads every has: value", () => {
        expect(parseQuery("has:ec has:ipr has:annotations")).toMatchObject({ hasEc: true, hasIpr: true, hasAny: true });
        expect(parseQuery("has:annotation").hasAny).toBe(true);
    });

    it("drops filters with an unknown key", () => {
        expect(parseQuery("foo:bar")).toMatchObject({ freeText: "", rankFilter: "", lcaFilter: "" });
    });
});

describe("sortFilterTable", () => {
    it("returns every peptide with its taxon, annotations and flags", () => {
        const { rows, totalCount } = run();

        expect(totalCount).toBe(4);
        expect(rows.find(row => row.peptide === "AAAK")).toMatchObject({
            occurrence: 5, lca: "Bacteroides", rank: "genus", found: true, cutoffUsed: false, crapFiltered: false,
        });
        expect(rows.find(row => row.peptide === "DDDK")).toMatchObject({ cutoffUsed: true, crapFiltered: true });
        expect(rows.find(row => row.peptide === "EEEK")).toMatchObject({ lca: "N/A", rank: "N/A", found: false, faCounts: undefined });
    });

    it("matches free text against the peptide, the taxon name and the rank", () => {
        expect(peptides({ search: "cccK" })).toEqual(["CCCK"]);
        expect(peptides({ search: "bacteroides" })).toEqual(["AAAK"]);
        expect(peptides({ search: "superkingdom" })).toEqual(["DDDK"]);
    });

    it("filters on taxon name, rank and annotations", () => {
        expect(peptides({ search: "lca:bifidobacterium" })).toEqual(["CCCK"]);
        expect(peptides({ search: "rank:genus" })).toEqual(["AAAK"]);
        expect(peptides({ search: "has:go" })).toEqual(["CCCK"]);
        expect(peptides({ search: "has:ec" })).toEqual(["AAAK"]);
        expect(peptides({ search: "has:annotations" })).toEqual(["AAAK", "CCCK"]);
    });

    it("applies the quick filters", () => {
        expect(peptides({ quickFilters: { ...noQuickFilters, speciesLevel: true } })).toEqual(["CCCK"]);
        expect(peptides({ quickFilters: { ...noQuickFilters, notFound: true } })).toEqual(["EEEK"]);
    });

    it("sorts on a column in both directions, and on the total annotation count for faCounts", () => {
        expect(peptides({ sortKey: "occurrence", sortOrder: "desc" })).toEqual(["DDDK", "AAAK", "CCCK", "EEEK"]);
        expect(peptides({ sortKey: "occurrence", sortOrder: "asc" })).toEqual(["EEEK", "CCCK", "AAAK", "DDDK"]);
        // DDDK and EEEK both have 0 annotations, so only the first two places are fixed
        expect(peptides({ sortKey: "faCounts", sortOrder: "desc" }).slice(0, 2)).toEqual(["CCCK", "AAAK"]);
    });

    it("sorts text without regard to case", () => {
        expect(peptides({ sortKey: "lca", sortOrder: "asc" })).toEqual(["DDDK", "AAAK", "CCCK", "EEEK"]);
    });

    it("returns one page of the rows and the total count", () => {
        const { rows, totalCount } = run({ sortKey: "occurrence", sortOrder: "desc", page: 2, itemsPerPage: 3 });

        expect(rows.map(row => row.peptide)).toEqual(["EEEK"]);
        expect(totalCount).toBe(4);
    });
});
