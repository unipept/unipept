import { describe, expect, it } from "vitest";
import { compressTree } from "./TreeCompression";
import type { FilteredTree } from "./TreeFilter";

const names = (t: FilteredTree): unknown => [t.name, ...t.children.map(names)];

const rankTree = () => ({
    id: 1, name: "root", rank: "no rank", children: [
        { id: 2, name: "Bacteria", rank: "superkingdom", children: [
            { id: 10, name: "clade", rank: "clade", children: [
                { id: 3, name: "Bacteroides", rank: "genus", children: [] },
            ] },
        ] },
    ],
});

describe("compressTree", () => {
    it("removes the nodes of other ranks and moves their children up", () => {
        const result = compressTree(rankTree(), []);

        expect(names(result)).toEqual(["root", ["Bacteria", ["Bacteroides"]]]);
        expect(result.children[0].nameExtra).toBe("superkingdom");
    });

    it("highlights the given taxa, but never the root", () => {
        const result = compressTree(rankTree(), [1, 3]) as FilteredTree & { highlighted: boolean };

        expect(result.highlighted).toBe(false);
        expect((result.children[0].children[0] as FilteredTree & { highlighted: boolean }).highlighted).toBe(true);
    });

    it("uses the given ranks and does not change the input tree", () => {
        const input = rankTree();

        const result = compressTree(input, [], ["no rank", "genus"]);

        expect(names(result)).toEqual(["root", ["Bacteroides"]]);
        expect(input).toEqual(rankTree());
    });
});
