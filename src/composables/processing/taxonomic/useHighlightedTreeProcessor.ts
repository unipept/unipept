import NcbiTreeNode from "@/logic/ontology/taxonomic/NcbiTreeNode";
import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import HighlightTreeProcessorWebWorker from "@/composables/workers/highlightedTreeProcessor.worker.ts?worker&inline";
import type { HighlightedTreeInput } from "@/logic/processors/taxonomic/HighlightedTree";

export default function useHighlightedTreeProcessor() {
    const { post } = useAsyncWebWorker<HighlightedTreeInput, NcbiTreeNode>(
        () => new HighlightTreeProcessorWebWorker()
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
