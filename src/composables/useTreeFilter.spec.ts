import { describe, expect, it } from "vitest";
import useTreeFilter from "./useTreeFilter";
import type { FilteredTree } from "@/logic/utils/TreeFilter";

const node = (id: number, name: string, children: FilteredTree[] = []): FilteredTree =>
    ({ id, name, nameExtra: "", children, extra: null });

const names = (t: FilteredTree): unknown => [t.name, ...t.children.map(names)];

describe("useTreeFilter", () => {
    it("filters the tree, and an empty search restores it", () => {
        const original = node(1, "root", [node(2, "Bacteria"), node(6, "Archaea")]);
        const { filteredTree, filter } = useTreeFilter(original);

        filter("archaea");
        expect(names(filteredTree.value)).toEqual(["root", ["Archaea"]]);

        filter("");
        expect(filteredTree.value).toEqual(original);
    });

    it("update replaces the tree that is filtered", () => {
        const { filteredTree, filter, update } = useTreeFilter(node(1, "root"));

        update(node(1, "root", [node(7, "Viruses")]));
        filter("virus");

        expect(names(filteredTree.value)).toEqual(["root", ["Viruses"]]);
    });
});
