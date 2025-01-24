import useAsyncWebWorker from "@/composables/new/useAsyncWebWorker";
import FunctionalProcessorWebWorker from "../workers/functionalProcessor.worker.ts?worker";
import FunctionalCode from "@/logic/new/ontology/functional/FunctionalCode";

export interface FunctionalProcessorData {
    peptideCounts: Map<string, number>;
    indexBuffer: ArrayBuffer;
    dataBuffer: ArrayBuffer;
    percentage: number;
    termPrefix: string;
    proteinCountProperty: "all" | "ec" | "go" | "ipr";
}

export interface FunctionalProcessorOutput {
    sortedCounts: Map<FunctionalCode, number> ;
    itemToPeptides: Map<FunctionalCode, string[]>;
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
