import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import useCustomFilterStore, { FilterType, UNIPROT_ID, useCustomFilterStoreImport } from "./CustomFilterStore";

describe("CustomFilterStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("starts with only the UniProtKB filter", () => {
        const store = useCustomFilterStore();

        expect(store.filters).toEqual([UNIPROT_ID]);
        expect(store.filterNames).toEqual(["UniProtKB"]);
        expect(store.getFilterById(UNIPROT_ID)).toEqual({ filter: FilterType.UniProtKB, name: "UniProtKB" });
    });

    it("adds, finds, updates and removes a filter", () => {
        const store = useCustomFilterStore();

        const id = store.addFilter({ filter: FilterType.Taxon, name: "Bacteria", data: [2] });
        expect(store.hasFilterById(id)).toBe(true);
        expect(store.hasFilterByName("Bacteria")).toBe(true);
        expect(store.getFilterNameById(id)).toBe("Bacteria");

        store.updateFilterById(id, { filter: FilterType.Taxon, name: "Archaea", data: [2157] });
        expect(store.getFilterById(id)?.data).toEqual([2157]);
        expect(store.hasFilterByName("Bacteria")).toBe(false);

        store.removeFilterById(id);
        expect(store.hasFilterById(id)).toBe(false);
        expect(store.getFilterNameById(id)).toBeUndefined();
    });

    it("gives every new filter its own id", () => {
        const store = useCustomFilterStore();

        const first = store.addFilter({ filter: FilterType.Proteome, name: "P", data: ["UP000005640"] });
        const second = store.addFilter({ filter: FilterType.Proteome, name: "P", data: ["UP000005640"] });

        expect(first).not.toBe(second);
        expect(store.filters).toHaveLength(3);
    });

    it("clear keeps only the UniProtKB filter", () => {
        const store = useCustomFilterStore();
        store.addFilter({ filter: FilterType.Protein, name: "Proteins", data: ["P12345"] });

        store.clear();

        expect(store.filters).toEqual([UNIPROT_ID]);
    });

    it("exports the filters and imports them again", () => {
        const store = useCustomFilterStore();
        const id = store.addFilter({ filter: FilterType.Taxon, name: "Bacteria", data: [2] });
        const exported = store.exportStore();

        setActivePinia(createPinia());
        useCustomFilterStoreImport(exported);
        const imported = useCustomFilterStore();

        expect(imported.filters).toEqual([UNIPROT_ID, id]);
        expect(imported.getFilterById(id)).toEqual({ filter: FilterType.Taxon, name: "Bacteria", data: [2] });
    });
});
