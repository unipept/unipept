import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import FunctionalProcessorWebWorker from "../workers/functionalProcessor.worker.ts?worker";

export interface FunctionalProcessorData {
    peptideCounts: Map<string, number>;
    indexBuffer: ArrayBuffer;
    dataBuffer: ArrayBuffer;
    percentage: number;
    termPrefix: string;
    proteinCountProperty: "all" | "ec" | "go" | "ipr";
}

export interface FunctionalProcessorOutput {
    sortedCounts: Map<string, number> ;
    itemToPeptides: Map<string, string[]>;
    annotatedCount: number;
}

export default function useFunctionalProcessor() {
    const {post} = useAsyncWebWorker<FunctionalProcessorData, FunctionalProcessorOutput>(
        () => new FunctionalProcessorWebWorker()
    );

    return {
        process: post
    }
}
