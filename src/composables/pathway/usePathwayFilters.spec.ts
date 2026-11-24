import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { usePathwayFilters, type FilterablePathwayItem } from "./usePathwayFilters";

const pathways: FilterablePathwayItem[] = [
    { id: "map00010", name: "Glycolysis", category: "Metabolism", subCategory: "Carbohydrate metabolism" },
    { id: "map00190", name: "Oxidative phosphorylation", category: "Metabolism", subCategory: "Energy metabolism" },
    { id: "map00230", name: "Purine metabolism", category: "Metabolism", subCategory: "Nucleotide metabolism" },
    { id: "map99999", name: "Other pathway", category: "Other", subCategory: "" },
];

const ecToPathways: Record<string, string[]> = {
    "1.1.1.1": ["map00010"],
    "1.2.1.12": ["map00010", "map00190"],
    "2.7.7.6": ["map00230"],
};

const compoundToPathways: Record<string, string[]> = {
    C00031: ["map00010"],
    C00002: ["map00190", "map00230"],
};

const createFilters = () => usePathwayFilters({
    items: () => pathways,
    pathwaysForEc: ec => new Set(ecToPathways[ec] ?? []),
    pathwaysForCompound: c => new Set(compoundToPathways[c] ?? []),
    allEcs: () => Object.keys(ecToPathways),
});

const ids = (items: FilterablePathwayItem[]) => items.map(item => item.id);

describe("usePathwayFilters", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("shows all items when no filter is applied", () => {
        const filters = createFilters();

        expect(ids(filters.filteredItems.value)).toEqual(ids(pathways));
        expect(filters.activeFilterCount.value).toBe(0);
    });

    it("lists the EC numbers sorted", () => {
        expect(createFilters().availableEcIds.value).toEqual(["1.1.1.1", "1.2.1.12", "2.7.7.6"]);
    });

    it("applies the draft filters only after applyFilters", () => {
        const filters = createFilters();
        filters.openFilterDialog();
        filters.draftEcs.value = ["1.1.1.1"];

        expect(filters.previewFilteredCount.value).toBe(1);
        expect(filters.filteredItems.value).toHaveLength(4);

        filters.applyFilters();

        expect(ids(filters.filteredItems.value)).toEqual(["map00010"]);
        expect(filters.activeFilterCount.value).toBe(1);
        expect(filters.filterDialog.value).toBe(false);
    });

    it("matches all EC numbers under a partial EC number like 1.-.-.-", () => {
        const filters = createFilters();
        filters.draftEcs.value = ["1.-.-.-"];
        filters.applyFilters();

        expect(ids(filters.filteredItems.value)).toEqual(["map00010", "map00190"]);
    });

    it("combines EC, compound and category filters", () => {
        const filters = createFilters();
        filters.draftCompounds.value = ["C00002"];
        filters.draftCategories.value = ["Nucleotide metabolism"];
        filters.applyFilters();

        expect(ids(filters.filteredItems.value)).toEqual(["map00230"]);
        expect(filters.activeFilterCount.value).toBe(2);
    });

    it("uses the category when an item has no subcategory", () => {
        const filters = createFilters();
        filters.draftCategories.value = ["Other"];
        filters.applyFilters();

        expect(ids(filters.filteredItems.value)).toEqual(["map99999"]);
    });

    it("openFilterDialog starts from the applied filters, and clearFilters only clears the draft", () => {
        const filters = createFilters();
        filters.draftEcs.value = ["2.7.7.6"];
        filters.applyFilters();

        filters.openFilterDialog();
        expect(filters.draftEcs.value).toEqual(["2.7.7.6"]);
        expect(filters.filterDialog.value).toBe(true);

        filters.clearFilters();
        expect(filters.draftEcs.value).toEqual([]);
        expect(filters.appliedEcs.value).toEqual(["2.7.7.6"]);
    });

    it("searches the id, name and categories, ignoring case, after 300 ms", async () => {
        const filters = createFilters();

        filters.search.value = "ENERGY";
        await nextTick();
        expect(filters.filteredItems.value).toHaveLength(4);

        vi.advanceTimersByTime(300);
        await nextTick();
        expect(ids(filters.filteredItems.value)).toEqual(["map00190"]);

        filters.search.value = "map0023";
        await nextTick();
        vi.advanceTimersByTime(300);
        await nextTick();
        expect(ids(filters.filteredItems.value)).toEqual(["map00230"]);
    });
});
