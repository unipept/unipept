import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import FunctionalProcessorWebWorker from "../workers/functionalProcessor.worker.ts?worker";
import {TransferableState} from "shared-memory-datastructures";

export interface FunctionalProcessorData {
    countsMapTransferable: TransferableState;
    peptideDataTransferable: TransferableState;
    percentage: number;
    termPrefix: string;
    proteinCountProperty: "all" | "ec" | "go" | "ipr";
    extractFunctionsMap?: boolean;
}

export interface FunctionalProcessorOutput {
    sortedCountsTransferable: TransferableState;
    itemToPeptides: Map<string, string[]>;
    annotatedCount: number;
    peptidesFunctions?: Map<string, string[]>;
}

export default function useFunctionalProcessor() {
    const {post} = useAsyncWebWorker<FunctionalProcessorData, FunctionalProcessorOutput>(
        () => new FunctionalProcessorWebWorker()
    );

    return {
        process: post
    }
}
