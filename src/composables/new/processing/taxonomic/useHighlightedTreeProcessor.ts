import {NcbiTreeNode} from "unipept-web-components";
import useAsyncWebWorker from "@/composables/new/useAsyncWebWorker";

export interface HighlightedTreeProcessorData {
    tree: any;
    peptides: string[];
    taxaToPeptides: Map<number, string[]>;
}

export default function useHighlightedTreeProcessor() {
    const { post } = useAsyncWebWorker('./src/composables/new/processing/workers/highlightedTreeProcessor.worker.ts');

    const process = async (tree: NcbiTreeNode, peptides: string[], taxaToPeptides: Map<number, string[]>) => {
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
