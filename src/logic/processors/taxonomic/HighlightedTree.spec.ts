import { describe, expect, it } from "vitest";
import { highlightTree } from "./HighlightedTree";

interface TestNode { id: number, extra: { included?: boolean }, children?: TestNode[] }

const node = (id: number, children?: TestNode[]): TestNode => ({ id, extra: {}, children });

const tree = () => node(1, [node(2, [node(816)]), node(2157)]);
const taxaToPeptides = new Map([[816, ["AAAAA"]], [2157, ["CCCCC"]]]);

const find = (root: TestNode, id: number): TestNode | undefined =>
    root.id === id ? root : root.children?.map(child => find(child, id)).find(Boolean);

describe("highlightTree", () => {
    it("marks a node as included when one of its peptides is selected", async () => {
        const root = tree();

        await highlightTree({ tree: root, peptides: ["AAAAA"], taxaToPeptides });

        expect(find(root, 816)?.extra.included).toBe(true);
        expect(find(root, 2157)?.extra.included).toBe(false);
    });

    it("marks the ancestors of an included node as included", async () => {
        const root = tree();

        await highlightTree({ tree: root, peptides: ["AAAAA"], taxaToPeptides });

        expect(find(root, 2)?.extra.included).toBe(true);
        expect(root.extra.included).toBe(true);
    });
});
