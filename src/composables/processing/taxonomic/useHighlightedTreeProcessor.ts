import NcbiTreeNode from "@/logic/ontology/taxonomic/NcbiTreeNode";
import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import HighlightedTreeWorker from "@/composables/workers/highlightedTree.worker.ts?worker&inline";
import type { HighlightedTreeInput } from "@/logic/processors/taxonomic/HighlightedTree";

export default function useHighlightedTreeProcessor() {
    const { post } = useAsyncWebWorker<HighlightedTreeInput, NcbiTreeNode>(
        () => new HighlightedTreeWorker()
    );

    const process = async (tree: NcbiTreeNode, peptides: string[], taxaToPeptides: Map<number, string[]>): Promise<NcbiTreeNode> => {
        return post({
            tree,
            peptides,
            taxaToPeptides
        });
    };

    return {
        process
    };
}
