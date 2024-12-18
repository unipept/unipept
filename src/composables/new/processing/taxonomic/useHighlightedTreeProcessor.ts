import {NcbiTreeNode} from "unipept-web-components";
import useAsyncWebWorker from "@/composables/new/useAsyncWebWorker";
import HighlightTreeProcessorWebWorker from "../workers/highlightedTreeProcessor.worker.ts?worker&inline";

export interface HighlightedTreeProcessorData {
    tree: any;
    peptides: string[];
    taxaToPeptides: Map<number, string[]>;
}

export default function useHighlightedTreeProcessor() {
    const { post } = useAsyncWebWorker(new HighlightTreeProcessorWebWorker());

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
