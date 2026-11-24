import { describe, expect, it } from "vitest";
import useTreeFilter, { FilteredTree } from "./useTreeFilter";
import useTreeCompression from "./useTreeCompression";

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

describe("useTreeFilter", () => {
    it("keeps the matching nodes and their ancestors", () => {
        const { filteredTree, filter } = useTreeFilter(tree());

        filter("fragilis");

        expect(names(filteredTree.value)).toEqual(["root", ["Bacteria", ["Bacteroides", ["Bacteroides fragilis"]]]]);
    });

    it("keeps the children of a matching node only when they match too", () => {
        const { filteredTree, filter } = useTreeFilter(tree());

        filter("bacter");

        expect(names(filteredTree.value)).toEqual(["root", ["Bacteria", ["Bacteroides", ["Bacteroides fragilis"]]]]);
    });

    it("marks the matched part of the name, ignoring case, and gives ancestors an empty match", () => {
        const { filteredTree, filter } = useTreeFilter(tree());

        filter("ESCH");

        const bacteria = filteredTree.value.children[0];
        expect(bacteria.match).toEqual({ start: 0, end: 0 });
        expect(bacteria.children[0].match).toEqual({ start: 0, end: 4 });
    });

    it("does not change the original tree, and an empty search restores it", () => {
        const original = tree();
        const { filteredTree, filter } = useTreeFilter(original);

        filter("archaea");
        expect(original.children).toHaveLength(2);

        filter("");
        expect(filteredTree.value).toEqual(tree());
    });

    it("update replaces the tree that is filtered", () => {
        const { filteredTree, filter, update } = useTreeFilter(tree());

        update(node(1, "root", [node(7, "Viruses")]));
        filter("virus");

        expect(names(filteredTree.value)).toEqual(["root", ["Viruses"]]);
    });
});

describe("useTreeCompression", () => {
    const rankTree = () => ({
        id: 1, name: "root", rank: "no rank", children: [
            { id: 2, name: "Bacteria", rank: "superkingdom", children: [
                { id: 10, name: "clade", rank: "clade", children: [
                    { id: 3, name: "Bacteroides", rank: "genus", children: [] },
                ] },
            ] },
        ],
    });

    it("removes the nodes of other ranks and moves their children up", () => {
        const result = useTreeCompression().compress(rankTree(), []);

        expect(names(result)).toEqual(["root", ["Bacteria", ["Bacteroides"]]]);
        expect(result.children[0].nameExtra).toBe("superkingdom");
    });

    it("highlights the given taxa, but never the root", () => {
        const result = useTreeCompression().compress(rankTree(), [1, 3]) as FilteredTree & { highlighted: boolean };

        expect(result.highlighted).toBe(false);
        expect((result.children[0].children[0] as FilteredTree & { highlighted: boolean }).highlighted).toBe(true);
    });

    it("uses the given ranks and does not change the input tree", () => {
        const input = rankTree();

        const result = useTreeCompression(["no rank", "genus"]).compress(input, []);

        expect(names(result)).toEqual(["root", ["Bacteroides"]]);
        expect(input).toEqual(rankTree());
    });
});
