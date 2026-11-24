import { describe, expect, it } from "vitest";
import { highlightTree, type HighlightedTreeNode, type TreeNodeData } from "./HighlightedTree";

const node = (id: number, children: TreeNodeData[] = []): TreeNodeData =>
    ({ id, name: `taxon ${id}`, count: 1, selfCount: 1, children, extra: { rank: "no rank" } });

const tree = () => node(1, [node(2, [node(816)]), node(2157)]);
const taxaToPeptides = new Map([[816, ["AAAAA"]], [2157, ["CCCCC"]]]);

const find = (root: HighlightedTreeNode, id: number): HighlightedTreeNode | undefined =>
    root.id === id ? root : root.children.map(child => find(child, id)).find(Boolean);

describe("highlightTree", () => {
    it("marks a node as included when one of its peptides is selected", async () => {
        const result = await highlightTree({ tree: tree(), peptides: ["AAAAA"], taxaToPeptides });

        expect(find(result, 816)?.extra.included).toBe(true);
        expect(find(result, 2157)?.extra.included).toBe(false);
    });

    it("marks the ancestors of an included node as included", async () => {
        const result = await highlightTree({ tree: tree(), peptides: ["AAAAA"], taxaToPeptides });

        expect(find(result, 2)?.extra.included).toBe(true);
        expect(result.extra.included).toBe(true);
    });

    it("keeps the other data of each node and does not change the given tree", async () => {
        const input = tree();

        const result = await highlightTree({ tree: input, peptides: ["AAAAA"], taxaToPeptides });

        expect(find(result, 816)).toMatchObject({ name: "taxon 816", count: 1, selfCount: 1, extra: { rank: "no rank" } });
        expect(input).toEqual(tree());
    });
});
