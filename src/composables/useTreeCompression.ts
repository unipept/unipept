import { FilteredTree } from '@/composables/useTreeFilter';

const DEFAULT_RANKS = [
    'no rank', 'superkingdom', 'kingdom', 'phylum', 'class',
    'order', 'family', 'genus', 'species', 'strain'
];

export default function useTreeCompression(ranksToInclude: string[] = DEFAULT_RANKS) {
    const _compressRankTree = (tree: any, taxa: number[]): FilteredTree[] => {
        tree.highlighted = taxa.includes(tree.id) && tree.id !== 1;

        const updatedChildren: FilteredTree[] = [];
        for (const child of tree.children ?? []) {
            updatedChildren.push(..._compressRankTree(child, taxa));
        }

        if (ranksToInclude.includes(tree.rank)) {
            tree.children = updatedChildren;
            tree.nameExtra = tree.rank;
            tree.extra = null;
            return [tree as FilteredTree];
        } else {
            return updatedChildren;
        }
    };

    const compress = (tree: any, taxa: number[]): FilteredTree => {
        return _compressRankTree(JSON.parse(JSON.stringify(tree)), taxa)[0];
    };

    return { compress };
}
