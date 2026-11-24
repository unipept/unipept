// A node of a taxonomy tree as plain data. The worker gets a copy of an NcbiTreeNode, which has its data but not its
// methods.
export interface TreeNodeData {
    id: number;
    name: string;
    count: number;
    selfCount: number;
    children: TreeNodeData[];
    extra: Record<string, unknown>;
}

// A node of the highlighted tree. extra.included tells if the node or one of its descendants has a selected peptide.
export interface HighlightedTreeNode extends TreeNodeData {
    children: HighlightedTreeNode[];
    extra: { included: boolean, [key: string]: unknown };
}

export interface HighlightedTreeInput {
    tree: TreeNodeData;
    peptides: string[];
    taxaToPeptides: Map<number, string[]>;
}

// Returns a copy of the tree in which every node has extra.included. The given tree does not change.
export const highlightTree = async ({
    tree,
    peptides,
    taxaToPeptides
}: HighlightedTreeInput): Promise<HighlightedTreeNode> => {
    return highlightNode(tree, peptides, taxaToPeptides);
};

const highlightNode = (
    node: TreeNodeData,
    peptides: string[],
    taxaToPeptides: Map<number, string[]>
): HighlightedTreeNode => {
    const children = node.children.map(child => highlightNode(child, peptides, taxaToPeptides));
    const included = children.some(child => child.extra.included) ||
        (taxaToPeptides.get(node.id)?.some(peptide => peptides.includes(peptide)) ?? false);

    return { ...node, children, extra: { ...node.extra, included } };
};
