export interface HighlightedTreeProcessorData {
    tree: any;
    peptides: string[];
    taxaToPeptides: Map<number, string[]>;
}

export const highlightTree = async ({
    tree,
    peptides,
    taxaToPeptides
}: HighlightedTreeProcessorData): Promise<any> => {
    return processRecursively(tree, (node: any, children: any) => {
        node.extra.included = children.some((x: any) => x.extra.included) ||
            (
                taxaToPeptides.has(node.id) &&
                taxaToPeptides.get(node.id)!.some(pept => peptides.includes(pept))
            );

        return node;
    });
};

const processRecursively = (
    node: any,
    f: (node: any, children: any) => any
): any => {
    return f(
        node,
        node.children?.map((child: any) => processRecursively(child, f)) ?? []
    );
}
