import type { FilteredTree } from '@/logic/utils/TreeFilter';

const DEFAULT_RANKS = [
    'no rank', 'superkingdom', 'kingdom', 'phylum', 'class',
    'order', 'family', 'genus', 'species', 'strain'
];

// Returns a copy of the tree with only the nodes of the given ranks. The children of a removed node move up to its
// nearest kept ancestor. The given taxa are highlighted, except the root.
export function compressTree(tree: any, taxa: number[], ranksToInclude: string[] = DEFAULT_RANKS): FilteredTree {
    return compressRecursive(JSON.parse(JSON.stringify(tree)), taxa, ranksToInclude)[0];
}

const compressRecursive = (tree: any, taxa: number[], ranksToInclude: string[]): FilteredTree[] => {
    tree.highlighted = taxa.includes(tree.id) && tree.id !== 1;

    const updatedChildren: FilteredTree[] = [];
    for (const child of tree.children ?? []) {
        updatedChildren.push(...compressRecursive(child, taxa, ranksToInclude));
    }

    if (ranksToInclude.includes(tree.rank)) {
        tree.children = updatedChildren;
        tree.nameExtra = tree.rank;
        tree.extra = null;
        return [tree as FilteredTree];
    } else {
        return updatedChildren;
    }
}
