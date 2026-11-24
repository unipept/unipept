import { describe, expect, it } from "vitest";
import { filterTree, type FilteredTree } from "./TreeFilter";

const node = (id: number, name: string, children: FilteredTree[] = []): FilteredTree =>
    ({ id, name, nameExtra: "", children, extra: null });

const tree = () => node(1, "root", [
    node(2, "Bacteria", [
        node(3, "Bacteroides", [node(4, "Bacteroides fragilis")]),
        node(5, "Escherichia"),
    ]),
    node(6, "Archaea"),
]);

const names = (t: FilteredTree): unknown => [t.name, ...t.children.map(names)];

describe("filterTree", () => {
    it("keeps the matching nodes and their ancestors", () => {
        expect(names(filterTree(tree(), "fragilis"))).toEqual(["root", ["Bacteria", ["Bacteroides", ["Bacteroides fragilis"]]]]);
    });

    it("keeps the children of a matching node only when they match too", () => {
        expect(names(filterTree(tree(), "bacter"))).toEqual(["root", ["Bacteria", ["Bacteroides", ["Bacteroides fragilis"]]]]);
    });

    it("marks the matched part of the name, ignoring case, and gives ancestors an empty match", () => {
        const bacteria = filterTree(tree(), "ESCH").children[0];

        expect(bacteria.match).toEqual({ start: 0, end: 0 });
        expect(bacteria.children[0].match).toEqual({ start: 0, end: 4 });
    });

    it("does not change the given tree, and returns it unchanged for an empty search", () => {
        const original = tree();

        filterTree(original, "archaea");
        expect(original).toEqual(tree());

        expect(filterTree(original, "")).toBe(original);
    });
});
